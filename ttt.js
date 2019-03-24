var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 2000;
var turnChecker = 0, connecting = false, reloading = false;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  connect();
  function connect(){
    if (turnChecker == 0){
    if (!connecting){
      connecting = true;
      socket.emit('reset');
      socket.emit('setup', 'X');
    } else {
      setTimeout(function(){
        connect();
      },3000);
    }
  }
  else if (turnChecker == 1){
    if (!connecting){
      connecting = true;
      socket.emit('reset');
      socket.emit('setup', 'O');
    } else {
      setTimeout(function(){
        connect();
      },3000);
    }
  }
  else {
    console.log('There is more than 2 players in the lobby');
  }
  }
  
  socket.on('setuprecieved', function(t){
    connecting = false;
    turnChecker += 1;
    console.log('Set Player ' + t);
    if (t == 'O'){
      io.sockets.emit('startGame')
    }
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
  
  socket.on('tie', function(){
    io.sockets.emit('bigmessage', 'Tie!');
    console.log("Tie!");
    setTimeout(function(){
      io.sockets.emit('reset');
      console.log('Game was reset');
    }, 3000);
  });
  
  socket.on('disconnect', function(){
    if (!reloading){
    console.log('player disconnected');
    io.sockets.emit('bigmessage', 'Error: Reloading');
    reloading = true;
    setTimeout(reconnect, 1);
    }
  });
  
  function reconnect(){
    turnChecker = 0;
    connecting = false;
    io.sockets.emit('reconnect');
  }
  
  socket.on('loaded', function(){
    reloading = false;
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});



