var http = require('http');
var path = require('path');
var ecstatic = require('ecstatic');
var io = require('socket.io');

var port = process.env.PORT || 8080;

/* ************************************************
** GAME VARIABLES
************************************************ */
var socket;	// Socket controller
var players;	// Array of connected players
var bullets;

/* ************************************************
** GAME INITIALISATION
************************************************ */

// Create and start the http server
var server = http.createServer(ecstatic({ root: path.resolve(__dirname, '../public') }) )
.listen(port, function (err) {
  if (err) {
    throw err;
  }

  init();
})

function init () {
  // Create an empty array to store players
  players = [];
  bullets = [];

  // Attach Socket.IO to server
  socket = io.listen(server);

  // Start listening for events
  setEventHandlers();
}

/* ************************************************
** GAME EVENT HANDLERS
************************************************ */
var setEventHandlers = function () {
  // Socket.IO
  socket.sockets.on('connection', onSocketConnection);
}


// New socket connection
function onSocketConnection(client) {
    console.log('New player has connected: ' + client.id);

    // Listen for client disconnected
    client.on('disconnect', onClientDisconnect);

    // Listen for new player message
    client.on('new player', onNewPlayer);

    // Listen for move player message
    client.on('move player', onMovePlayer);

    // Listen for player shots
    client.on('shot', onPlayerShoot);
}


// Socket client has disconnected
function onClientDisconnect() {
    console.log('Player has disconnected: ' + this.id);

    var removePlayer = playerById(this.id);

    // Player not found
    if (!removePlayer) {
        console.log('Player not found: ' + this.id);
        return;
    }

    // Remove player from players array
    players.splice(players.indexOf(removePlayer), 1);

    // Broadcast removed player to connected socket clients
    this.broadcast.emit('remove player', {id: this.id});
}

// New player has joined
function onNewPlayer(data) {
    // Create a new player
    var newPlayer = {x: data.x, y: data.y};
    newPlayer.id = this.id;

    // Broadcast new player to connected socket clients
    this.broadcast.emit('new player', {
        id: newPlayer.id,
        x: newPlayer.x,
        y: newPlayer.y
    });

    // Send existing players to the new player
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        ;
        this.emit('new player', {
            id: existingPlayer.id,
            x: existingPlayer.x,
            y: existingPlayer.y
        });
    }

    // Add new player to the players array
    players.push(newPlayer);
}

// Player has moved
function onMovePlayer(data) {
    // Find player in array
    var movePlayer = playerById(this.id);

    // Player not found
    if (!movePlayer) {
        console.log('Player not found: ' + this.id);
        return
    }

    // Update player position
    movePlayer.x = data.x;
    movePlayer.y = data.y;
    movePlayer.angle = data.angle;

    // Broadcast updated position to connected socket clients
    this.broadcast.emit('move player', {
        id: movePlayer.id,
        x: movePlayer.x,
        y: movePlayer.y,
        angle: movePlayer.angle
    })
}

// Player shot
function onPlayerShoot(data) {
    console.log("Bullet");
    bullets.push(data);
    // Broadcast updated position to connected socket clients
    this.broadcast.emit('shot', bullets);
}


// Find player by ID
function playerById(id) {
    for (var i = 0; i < players.length; i++)
        if (players[i].id === id)
            return players[i];
    return false;
}