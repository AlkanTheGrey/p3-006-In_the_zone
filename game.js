const COLORS = {
  dark_olive_green: 0x606c38,
  kombu_green: 0x283618,
  cornsilk: 0xfefae0,
  earth_yellow: 0xdda15e,
  liver_dogs: 0xbc6c25,
};

const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 720,
  height: 360,

  backgroundColor: COLORS.liver_dogs,
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  },

  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: {
    create: create,
    update: update,
  },
};

const GAME = new Phaser.Game(GAME_CONFIG);

/**The create function for the default scene */
function create() {
  // rectangle to show the touch area of the zone
  let zone_padding = 40;
  this.obj_zoneBounds = this.add.rectangle(
    zone_padding,
    zone_padding,
    this.game.config.width - zone_padding * 2,
    this.game.config.height - zone_padding * 2,
    COLORS.earth_yellow
  );
  this.obj_zoneBounds.setOrigin(0, 0);

  // gameobject to influence when the zone is interacted with
  let player_size = 30;
  this.obj_player = this.add.ellipse(
    this.game.config.width / 2,
    this.game.config.height / 2,
    player_size,
    player_size,
    COLORS.dark_olive_green
  );
  this.physics.world.enableBody(this.obj_player, 0);
  let player_bounds = new Phaser.Geom.Rectangle(
    zone_padding,
    zone_padding,
    this.game.config.width - zone_padding * 2,
    this.game.config.height - zone_padding * 2
  );
  this.obj_player.body.setBoundsRectangle(player_bounds);
  this.obj_player.body.setCollideWorldBounds(true);
  this.obj_player.setData(
    "target",
    setTargetLocation(this.obj_player.x, this.obj_player.y)
  );

  // move To code
  this.obj_player.moveToTarget = function(){
    if( playerInTouchZone( this.x, this.y, this.getData("target").x, this.getData("target").y ) ){
      this.body.setVelocity( 0 );
      return;
    }

    let speed = 65;
    let position_difference = new Phaser.Math.Vector2(
      this.getData("target").x - this.x,
      this.getData("target").y - this.y
    )
    let normalized_direction = position_difference.normalize();
    this.body.setVelocity(
      normalized_direction.x * speed,
      normalized_direction.y * speed
    )
    return;
  }

  // create the zone
  this.zn_touchArea = this.add.zone(
    this.game.config.width / 2,
    this.game.config.height / 2,
    this.game.config.width - zone_padding * 2,
    this.game.config.height - zone_padding * 2
  );
  let zone_hitArea = new Phaser.Geom.Rectangle(
    zone_padding,
    zone_padding,
    this.game.config.width - zone_padding * 2,
    this.game.config.height - zone_padding * 2
  );
  this.zn_touchArea.setInteractive();

  // perform these act
  let nextPlayerPosition = function (pointer) {
    this.zn_touchArea.on("pointermove", function (pointer) {
      this.obj_player.setData(
        "target",
        setTargetLocation(pointer.x, pointer.y)
      );
    }, this);

    this.obj_player.setData(
      "target",
      setTargetLocation(pointer.x, pointer.y)
    );

    // console.log( `pointer x:${pointer.x}, y:${pointer.y}` );
    // console.log( `player x:${this.obj_player.x}, y:${this.obj_player.y}` );
  };
  this.zn_touchArea.on("pointerdown", nextPlayerPosition, this);

  let stopPlayerFollow = function(){
    this.zn_touchArea.removeListener( "pointermove" );
    this.obj_player.setData(
      "target",
      setTargetLocation(this.obj_player.x, this.obj_player.y)
    );
    return;
  }
  this.zn_touchArea.on("pointerup", stopPlayerFollow, this);
  this.zn_touchArea.on("pointerout", stopPlayerFollow, this);
}

/**Update function for the default scene */
function update() {
  // check if player is at the desired point
  let target = {
    x: this.obj_player.getData("target").x,
    y: this.obj_player.getData("target").y,
  };

  if ( !playerInTouchZone( this.obj_player.x, this.obj_player.y, target.x, target.y ) ) {
    console.log("move player");
    // code to move the player
    this.obj_player.moveToTarget();
  } else {
    this.obj_player.body.setVelocity( 0 );
  }
}

function setTargetLocation(x, y) {
  return {
    x: Math.floor(x),
    y: Math.floor(y),
  };
}

function playerInTouchZone(x1, y1, x2, y2, range = 5) {
  if (Math.abs(x1 - x2) > range || Math.abs(y1 - y2) > range) {
    return false;
  }
  return true;
}
