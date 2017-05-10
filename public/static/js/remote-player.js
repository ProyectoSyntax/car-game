function RemotePlayer(id, x,y,sprite_id) {
    this.id = id;
    this.player = game.add.sprite(x, y, sprite_id);
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.18);
    game.physics.enable(this.player, Phaser.Physics.ARCADE);

}