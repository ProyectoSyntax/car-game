var socket;

var player;
var remotePlayers = [];

var GameState = {
  preload: preload,
  create: create,
  update: update,
};
var game = new Phaser.Game(800, 600, Phaser.AUTO, "Car-Game", GameState);


function preload() {
  // Cars
  this.load.image('audi', '../../assets/cars/Audi.png');
  this.load.image('viper', '../../assets/cars/Black_viper.png');
  this.load.image('muscle', '../../assets/cars/Car.png');
  this.load.image('police', '../../assets/cars/Police.png');
  this.load.image('taxi', '../../assets/cars/taxi.png');
  
  this.load.image('bullet', '../../assets/Bullet.png');
}


function create() {
    player = new Player(400, 300, "muscle");
    game.physics.startSystem(Phaser.Physics.ARCADE);
    socket = io.connect("https://car-game-samuelm333.c9users.io/", {'forceNew': true, 'connect timeout': 1});
    setEventHandlers();
}

function update() {
    player.update();
    remotePlayers.forEach(function(remote){
      //collision entre el player y el remoto
      game.physics.arcade.collide(player.player, remote.player);
    });
}


function setEventHandlers() {
    // Socket connection successful
    socket.on('connect', onSocketConnected);

    // Socket disconnection
    socket.on('disconnect', onSocketDisconnect);

    // New player message received
    socket.on('new player', onNewPlayer);

    // Player move message received
    socket.on('move player', onMovePlayer);

    // Player removed message received
    socket.on('remove player', onRemovePlayer);

    // Player shot
    socket.on('shot', onPlayerShoot);
}

// Socket connected
function onSocketConnected() {
    // Reset enemies on reconnect
    remotePlayers = [];

    // Send local player data to the game server
    socket.emit('new player', {x: player.player.position.x, y: player.player.position.y, angle: player.player.angle});
}

// Socket disconnected
function onSocketDisconnect() {
    console.log('Disconnected from socket server');
}

// New player
function onNewPlayer(data) {
    console.log('New player connected:', data.id);

    // Avoid possible duplicate players
    var duplicate = playerById(data.id);
    if (duplicate) {
        console.log('Duplicate player!');
        return;
    }

    // Add new player to the remote players array
    remotePlayers.push(new RemotePlayer(data.id, data.x,data.y, "audi"));
}

// Move player
function onMovePlayer(data) {
    var movePlayer = playerById(data.id);
    // Player not found
    if (!movePlayer) {
        console.log('Player not found: ', data.id);
        return;
    }

    // Update player position
    movePlayer.player.position.x = data.x;
    movePlayer.player.position.y = data.y;
    movePlayer.player.angle = data.angle;
}

// Remove player
function onRemovePlayer(data) {
    var removePlayer = playerById(data.id);
    // Player not found
    if (!removePlayer) {
        console.log('Player not found: ', data.id);
        return;
    }
    removePlayer.player.kill();
    remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
}

// Player shot
function onPlayerShoot(data) {
    bullets = data;
}

// Find player by ID
function playerById(id) {
    for (var i = 0; i < remotePlayers.length; i++)
        if (remotePlayers[i].id === id)
            return remotePlayers[i];
    return false
}