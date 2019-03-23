var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 2000;
var turnChecker = 0, xConnection = 0, oConnection = 0, connecting = false, activeClients = 0, socketList = [];

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var included = false;
  for (var i = 0; i < socketList.length; i++){
    if (socket.id == socketList[i].id){
      included = true;
    }
  }
  if (!included){
    socketList.push(socket);
  }
  
  connect(socket);
  function connect(sock){
    console.log('something passed connection');
    if (turnChecker == 0){
    if (!connecting){
      connecting = true;
      sock.emit('reset');
      sock.emit('setup', 'X');
    } else {
      setTimeout(function(){
        connect();
      },1000);
    }
  }
  else if (turnChecker == 1){
    if (!connecting){
      connecting = true;
      sock.emit('reset');
      sock.emit('setup', 'O');
    } else {
      setTimeout(function(){
        connect();
      },1000);
    }
  }
  else {
    activeClients += 1;
    console.log('There is more than 2 players in the lobby');
  }
  }
  
  socket.on('setuprecieved', function(t){
    connecting = false;
    activeClients += 1;
    turnChecker += 1;
    console.log('Set Player ' + t);
  });
  
  socket.on('sendmove', function(player, pos) {
    io.sockets.emit('move', player, pos);
    console.log(player + " moved at: " + pos);
  });
  
  socket.on('win', function(player){
    io.sockets.emit('bigmessage', player + " Won!");
    console.log(player + " Won!");
    setTimeout(function(){
      io.sockets.emit('reset');
      console.log('Game was reset');
    }, 3000);
  });
  
  socket.on('disconnect', function(){
    socket.emit('checkconnection');
    setTimeout(connections, 20);
  });
  
  socket.on('connected', function(p){
    if (p == 'X'){
      xConnection = 1;
    }
    if (p == 'O'){
      oConnection = 1;
    }
  });
  
  function connections(){
    if (oConnection == 0 || xConnection == 0){
      io.sockets.emit('reset');
      turnChecker = 0; 
      xConnection = 0;
      oConnection = 0;
      connecting = false;
      console.log('A player disconnected');
      for (var i = 0; i < activeClients; i++){
        if (socketList[i] != undefined){
          connect(socketList[i]);
        } else {
          socketList.splice(i, 1)
        }
      }
      activeClients = 0;
    }
  }
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});



