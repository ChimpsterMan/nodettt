var app = require('express')();
var http = require('http').Server(app);
var io = require('socket')(http);
var port = process.env.PORT || 2000;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});



