import Player from "./player.js";
import createRotatingPlatform from "./create-rotating-platform.js";

//From https://html-online.com/articles/get-url-parameters-javascript/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

export default class MainScene extends Phaser.Scene {
  preload() {

    // const query = new URLSearchParams(this.props.location.search);
    // const level_param = query.get('level')

    const url_params = getUrlVars();
    const level_param = url_params["level"];

    this.load.tilemapTiledJSON("map", "../assets/tilemaps/"+level_param+".json");
    this.load.image(
      "kenney-tileset-64px-extruded",
      "../assets/tilesets/kenney-tileset-64px-extruded.png"
    );

    this.load.image("wooden-plank", "../assets/images/wooden-plank.png");
    this.load.image("block", "../assets/images/block.png");

    this.load.spritesheet(
      "player",
      "../assets/spritesheets/0x72-industrial-player-32px-extruded.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2
      }
    );

    this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json");

    this.load.setPath('../assets/heroes/')
    this.load.spine('skeleton', 'skeleton.json', ['skeleton.atlas'], true)
    // this.spine.isWebGL = false;
    console.log(this.data.scene.spine)
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);
    map.createDynamicLayer("Background", tileset, 0, 0);
    map.createDynamicLayer("Foreground", tileset, 0, 0).setDepth(10);

    // Set colliding tiles before converting the layer to Matter bodies
    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
    // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
    // rectangle body (similar to AP).
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // The spawn point is set using a point object inside of Tiled (within the "Spawn" object layer)
    const { x, y } = map.findObject("Spawn", obj => obj.name === "Spawn Point");
    this.player = new Player(this, x, y);

    // Smoothly follow the player
    this.cameras.main.startFollow(this.player.sprite, false, 0.5, 0.5);

    this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
      objectA: this.player.sprite,
      callback: this.onPlayerCollide,
      context: this
    });

    // Load up some crates from the "Crates" object layer created in Tiled
    map.getObjectLayer("Crates").objects.forEach(crateObject => {
      const { x, y, width, height } = crateObject;

      // Tiled origin for coordinate system is (0, 1), but we want (0.5, 0.5)
      this.matter.add
        .image(x + width / 2, y - height / 2, "block")
        .setBody({ shape: "rectangle", density: 0.001 });
    });

    // Create platforms at the point locations in the "Platform Locations" layer created in Tiled
    map.getObjectLayer("Platform Locations").objects.forEach(point => {
      createRotatingPlatform(this, point.x, point.y);
    });

    // Create a sensor at rectangle object created in Tiled (under the "Sensors" layer)
    const rect = map.findObject("Sensors", obj => obj.name === "Celebration");
    const celebrateSensor = this.matter.add.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height,
      {
        isSensor: true, // It shouldn't physically interact with other bodies
        isStatic: true // It shouldn't move
      }
    );
    this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
      objectA: this.player.sprite,
      objectB: celebrateSensor,
      callback: this.onPlayerWin,
      context: this
    });

    const help = this.add.text(16, 16, "Arrows/WASD to move the player.", {
      fontSize: "18px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#ffffff",
      fill: "#000000"
    });
    help.setScrollFactor(0).setDepth(1000);


    var heroes = [];
    const hero_animations = [
      'pistolNearIdle',
      'crouchIdle',
      'jump2',
      'pistolFarIdle',
      'jump',
      'pushIdle',
      'climbDown',
      'walk2',
      'machineGunShoot',
      'skid',
      'meleeSwing1-fullBody',
      'climbIdle',
      'wallIdle',
      'gunIdle',
      'punch1',
      'floorIdle',
      'swimIdle',
      'machineGunIdle',
      'walk',
      'machineGunReload',
      'edgeClimb',
      'blockHit',
      'meleeIdle',
      'jump3',
      'swim',
      'hit1',
      'pistolNearShoot',
      'run',
      'wallJump',
      'edgeIdle',
      'gunShoot',
      'meleeSwing3-fullBody',
      'climbUp',
      'push',
      'run2',
      'gunReload1',
      'meleeSwing2-fullBody',
      'gunReload2',
      'floorGetUp',
      'falling',
      'celebration',
      'reset',
      'pull',
      'land',
      'hitBig',
      'pistolFarShoot',
      'default',
      'roll',
      'pullIdle',
      'punch2',
      'punch3',
      'crouchWalk',
      'idle',
      'meleeSwing1',
      'idleTired',
      'meleeSwing3',
      'meleeSwing2',
      'block',
    ];
    const hero_skins = [
      'Assassin',
      'BeardyBuck',
      'BuckMatthews',
      'ChuckMatthews',
      'Commander-Darkstrike',
      'Commander-Firestrike',
      'Commander-Icestrike',
      'Commander-Stonestrike',
      'DuckMatthews',
      'Dummy',
      'Dummy_leg_guide',
      'Fletch',
      'GabrielCaine',
      'MetalMan',
      'MetalMan-Blue',
      'MetalMan-Green',
      'MetalMan-Red',
      'PamelaFrost',
      'PamelaFrost-02',
      'PamelaFrost-03',
      'PamelaFrost-04',
      'PamelaFrost-05',
      'StumpyPete',
      'Template',
      'TruckMatthews',
      'TurboTed',
      'TurboTed-Blue',
      'TurboTed-Green',
      'YoungBuck'
    ];
    // for(var i=0; i<5; i++){
    //   var skin = hero_skins[Math.floor(Math.random()*hero_skins.length)];
    //   var animation = hero_animations[Math.floor(Math.random()*hero_animations.length)];

    //   var hero = this.add.spine(
    //     x+Math.round(Math.random()*2000),
    //     y+Math.round(Math.random()*500-200),
    //     'skeleton', animation, true
    //   ).setScale(0.15);
    //   hero.setSkin(null)
    //   hero.setSkinByName(skin);
    // }
  }

  onPlayerCollide({ gameObjectB }) {
    if (!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) return;

    const tile = gameObjectB;

    // Check the tile property set in Tiled (you could also just check the index if you aren't using
    // Tiled in your game)
    if (tile.properties.isLethal) {
      // Unsubscribe from collision events so that this logic is run only once
      this.unsubscribePlayerCollide();

      this.player.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => this.scene.restart());
    }
  }

  onPlayerWin() {
    // Celebrate only once
    this.unsubscribeCelebrate();

    // Drop some heart-eye emojis, of course
    for (let i = 0; i < 35; i++) {
      const x = this.player.sprite.x + Phaser.Math.RND.integerInRange(-50, 50);
      const y = this.player.sprite.y - 150 + Phaser.Math.RND.integerInRange(-10, 10);
      this.matter.add
        .image(x, y, "emoji", "1f60d", {
          restitution: 1,
          friction: 0,
          density: 0.0001,
          shape: "circle"
        })
        .setScale(0.5);
    }
  }
}

