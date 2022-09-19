const express = require("express");
const res = require("express/lib/response");
const app = express();


app.get("/", function(req, res){
 res.sendFile(__dirname + "/html/index.html");


});
e
app.get("/sobre", function(req, res){
    res.sendFile(__dirname + "/html/sobre.html");

    
    
});
app.get('/ola/:nome/:cargo/:cor', function(req, res){
 res.send("<h1>ola"+req.params.nome+"</h1>"+ "<h2>sua profisão"+req.params.cargo+"</h2>" +"<h3>sua cor"+req.params.cor+"</h3>");

        
  });
  
  app.get("sobre", function(req, res){
    res.send("minha pagina sobre");
    
    
    });
app.listen(8081, function(){
    console.log ("Servidor roando na url http://localhost:8081");
});
