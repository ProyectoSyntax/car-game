function Player(x, y, sprite_id) {
    this.player = game.add.sprite(x, y, sprite_id);
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.18);
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    this.player.body.checkCollision.up = true;
    this.player.body.checkCollision.down = true;
    this.player.body.immovable = false;
    this.speed = 150;
    this.nitroAvailable = 100;
    this.bullets = new Bullet('bullet');
    this.life = 100;
}

Player.prototype.update = function() {
    var mouse = new Phaser.Point(game.input.mousePointer.x, game.input.mousePointer.y);
    this.player.angle = this.player.position.angle(mouse, true) + 90;
    game.physics.arcade.moveToPointer(this.player, this.speed);

    this.bullets.update();

    if (this.life < 100)
        this.life += 0.3;

    if (Phaser.Rectangle.contains(this.player.body, game.input.x, game.input.y)) {
        this.player.body.velocity.setTo(0, 0);
    }

    if (game.input.keyboard.addKey(Phaser.Keyboard.SHIFT).isDown && this.nitroAvailable > 0) {
        this.speed = 300;
        this.nitroAvailable -= 5;
    } else if (this.nitroAvailable < 100) {
        this.speed = 150;
        this.nitroAvailable += 5;
    }

    if (game.input.activePointer.isDown) {
        this.fire();
    }
    socket.emit("move player", {x: this.player.position.x, y: this.player.position.y, angle: this.player.angle});
}

Player.prototype.fire = function() {

    if (game.time.now > this.bullets.nextFire && this.bullets.group.countDead() > 0) {

        var bullet = this.bullets.group.getFirstDead();

        this.bullets.nextFire = game.time.now + this.bullets.fireRate;

        bullet.reset(this.player.x, this.player.y);

        game.physics.arcade.moveToPointer(bullet, 500);


    }
}
