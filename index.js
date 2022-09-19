const express = require("express");
const res = require("express/lib/response");
const app = express();


app.get("/", function(req, res){
 res.send("seja bem vindo ao meu app");


});

app.get("/sobre", function(req, res){
 res.send("minha pagina sobre");
    
    
});
app.get('/ola/:nome/:cargo/:cor', function(req, res){
 res.send("<h1>ola"+req.params.nome+"</h1>"+ "<h2>sua profisão"+req.params.cargo+"</h2>" +"<h3>sua cor"+req.params.cor+"</h3>");

        
  });
  
  app.get("sobre", function(req, res){
    res.send("minha pagina sobre");
    
    
    });
app.listen(8083, function(){
    console.log ("Servidor roando na url http://localhost:8081");
});
