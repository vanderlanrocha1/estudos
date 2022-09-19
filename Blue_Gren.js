### Retorna qual site esta up e o que esta down


$bluePath = "C:\inetpub\wwwroot\site-blue"
$greenPath = "C:\inetpub\wwwroot\site-green"

$upPath = @($bluePath, $greenPath) | Where {
    (Get-Content "$($_)\up.html") -contains "up"
}

$downPath = if ($upPath -eq $bluePath) {
    $greenPath
} else {
    $bluePath
}

Write-Host "$($upPath) is up"
Write-Host "$($downPath) is down"


### Descobre qual o nome do Farm


function Get-ServerFarm {
    param ([string]$webFarmName)

    $assembly = [System.Reflection.Assembly]::LoadFrom("$env:systemroot\system32\inetsrv\Microsoft.Web.Administration.dll")
    $mgr = new-object Microsoft.Web.Administration.ServerManager "$env:systemroot\system32\inetsrv\config\applicationhost.config"
    $conf = $mgr.GetApplicationHostConfiguration()
    $section = $conf.GetSection("webFarms")
    $webFarms = $section.GetCollection()
    $webFarm = $webFarms | Where {
        $_.GetAttributeValue("name") -eq $serverFarmName
    }

    $webFarm
}
Write-host $serverFarmName


### ### Retorna qual site esta up e o que esta down e o diretorio do site down

$serverFarmName = "meu-site"
$webFarm = Get-ServerFarm $serverFarmName
$servers = $webFarm.GetCollection()

$servers | % {
    $arr = $_.GetChildElement("applicationRequestRouting")
    $counters = $arr.GetChildElement("counters")
    $isHealthy = $counters.GetAttributeValue("isHealthy")
    if ($isHealthy) {
        $healthyNode = $_
    } else {
        $unhealthyNode = $_
    }
}

$healthyAddress = $healthyNode.GetAttributeValue("address")
$unhealthyAddress = $unhealthyNode.GetAttributeValue("address")

Write-Host "$($healthyAddress) is up"
Write-Host "$($unhealthyAddress) is down"


    if($unhealthyAddress -eq "site-green" ) { 
        $down = $greenPath
        }
       else {
       $down =  $bluePath
       }
write-host $down




## Retorna o latencia do sites blue e green
$blueSite = "http://site-blue:8888"
$greenSite = "http://site-green:9999"
$minTime = 400

@($blueSite, $greenSite) | % {
    Write-Host "Warming up $($_)"
    Do {
        $time = Measure-Command {
            $res = Invoke-WebRequest $_
        }
        $ms = $time.TotalMilliSeconds
        If ($ms -ge $minTime) {
            Write-Host "$($res.StatusCode) from $($_) in $($ms)ms" -foreground "yellow"
        }
    } While ($ms -ge $minTime)
    Write-Host "$($res.StatusCode) from $($_) in $($ms)ms" -foreground "cyan"
}



## Troca o site para down ou up
$siteBlue = "http://site-blue:8888"
$siteGreen = "http://site-green:9999"
$pathBlue = "C:\inetpub\wwwroot\site-blue"
$pathGreen = "C:\inetpub\wwwroot\site-green"
$pathBlueContent = (Get-Content $pathBlue\up.html)
$serverFarmName = "meu-site"
$webFarm = Get-ServerFarm $serverFarmName
$webFarmArr = $webFarm.GetChildElement("applicationRequestRouting")
$webFarmHeathCheck = $webFarmArr.GetChildElement("healthCheck")
$healthCheckTimeoutS = $webFarmHeathCheck.GetAttributeValue("interval").TotalSeconds

$siteToWarm = $siteBlue
$pathToBringDown = $pathGreen
$pathToBringUp = $pathBlue

if ($pathBlueContent -contains 'up')
{
    $siteToWarm = $siteGreen
    $pathToBringUp = $pathGreen
    $pathToBringDown = $pathBlue
}

Write-Host "Warming up $($siteToWarm)"
Do {
    $time = Measure-Command {
        $res = Invoke-WebRequest $siteToWarm
    }
    $ms = $time.TotalMilliSeconds
    If ($ms -ge 400) {
        Write-Host "$($res.StatusCode) from   $($siteToWarm) in $($ms)ms" -foreground "yellow"
    }
} While ($ms -ge 400)
Write-Host "$($res.StatusCode) from $($siteToWarm) in $($ms)ms" -foreground "cyan"

if ($res.StatusCode -eq 200) {
    Write-Host "Bringing $($pathToBringUp) up" -foreground "cyan"
    (Get-Content $pathToBringUp\up.html).replace('down', 'up') | Set-Content $pathToBringUp\up.html

    Write-Host "Waiting for health check to pass in $($healthCheckTimeoutS) seconds..."
    Start-Sleep -s $healthCheckTimeoutS

    Write-Host "Bringing $($pathToBringDown) down"
    (Get-Content $pathToBringDown\up.html).replace('up', 'down') | Set-Content $pathToBringDown\up.html
} else {
    Write-Host "Cannot warm up $($siteToWarm)" -foreground "red"

}







$serverFarmName = "meu-site"
$serverAddress = "site-blue"

$webFarm = Get-ServerFarm $serverFarmName
$servers = $webFarm.GetCollection()

$server = $servers | Where {
    $_.GetAttributeValue("address") -eq $serverAddress
}

$arr = $server.GetChildElement("applicationRequestRouting")
$method = $arr.Methods["SetState"]
$methodInstance = $method.CreateInstance()

# 0 = Available
# 1 = Drain
# 2 = Unavailable
# 3 = Unavailable Gracefully
$methodInstance.Input.Attributes[0].Value = 0
$methodInstance.Execute()