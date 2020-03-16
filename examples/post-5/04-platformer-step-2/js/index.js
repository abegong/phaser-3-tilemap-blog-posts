/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Twemoji, https://github.com/twitter/twemoji, CC-BY 4.0
 *  - Tilesets by Kenney, https://www.kenney.nl/assets/platformer-art-pixel-redux and
 *    https://www.kenney.nl/assets/abstract-platformer, public domain
 *  - Character by 0x72 under CC-0, https://0x72.itch.io/16x16-industrial-tileset
 */

import MainScene from "./main-scene.js";
// import * as SpinePlugin from './SpinePlugin.min.js';
import * as SpinePlugin from './NewSpinePlugin.js';

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 700,
  backgroundColor: "#000c1f",
  parent: "game-container",
  scene: MainScene,
  pixelArt: true,
  physics: { default: "matter" },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
      },
      {
        plugin: window.SpinePlugin,
        key: 'SpinePlugin',
        // sceneKey: 'spine'
        mapping: "spine",
      }
    ]
  }
};

const game = new Phaser.Game(config);
window.game = game;