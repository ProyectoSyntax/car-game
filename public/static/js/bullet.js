function Bullet(sprite_id) {
    
    this.fireRate = 100;
    this.nextFire = 0;
    
    this.group = game.add.group();
    this.group.enableBody = true;
    this.group.physicsBodyType = Phaser.Physics.ARCADE;

    this.group.createMultiple(15, sprite_id);
    this.group.setAll('anchor.x', 0.5);
    this.group.setAll('anchor.y', 0.5);
    this.group.setAll('scale.x', 0.15);
    this.group.setAll('scale.y', 0.15);
    this.group.setAll('checkWorldBounds', true);
    this.group.setAll('outOfBoundsKill', true);
    
}

Bullet.prototype.update = function() {
    game.physics.arcade.overlap(this.group, player.player, bulletOverlap, null, player.update);
}

function bulletOverlap(){
    player.life -= 1;
    // player.player.kill();
}