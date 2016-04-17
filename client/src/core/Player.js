import PIXI from 'pixi.js';
import lerp from 'lerp';
import {tileSize} from './Constants';
import Throttle from 'lodash/throttle';
var Keycode = require('keycode.js');

export default class Player {
  constructor (data, room) {
    this.graphics = new PIXI.Graphics();
    this.room = room;
    this.data = data;
    this.isControllable = false;
    this.displayPosition = {x: this.data.position.x, y: this.data.position.y};
    if (this.room) {
      this.isControllable = true;
      this.onKeyUpCallback = Throttle(this.onKeyUp.bind(this), 100);
      document.addEventListener('keydown', this.onKeyUpCallback);
    }

    this.onEnterFrame = function () {
      window.requestAnimationFrame(this.onEnterFrame);
      this.displayPosition.x = lerp(this.displayPosition.x, this.data.position.x*tileSize, .5);
      this.displayPosition.y = lerp(this.displayPosition.y, this.data.position.y*tileSize, .5);

      this.graphics.clear();
      if (!this.data.dead) {
        this.graphics.beginFill(this.data.type === 'PREY' ? 0x009999 : 0xCC3300);
        this.graphics.lineStyle(1, this.data.type === 'PREY' ? 0x000099 : 0xFF330);
        this.graphics.drawRect(this.displayPosition.x, this.displayPosition.y, tileSize, tileSize);
      }
    };
    this.onEnterFrame = this.onEnterFrame.bind(this);
    this.onEnterFrame();
  }

  onKeyUp (e) {
    let direction = {type:'direction', x: 0, y: 0};
    if (e.which == Keycode.UP) {
      direction.y = -1;
    } else if (e.which == Keycode.DOWN) {
      direction.y = 1;
    } else if (e.which == Keycode.LEFT) {
      direction.x = -1;
    } else if (e.which == Keycode.RIGHT) {
      direction.x = 1;
    }
    if (direction.x || direction.y) {
      this.room.send(direction);
    }
  }

  update (data) {
    if (data) {
      this.data = data;
    }
  }

  onDispose () {
    document.removeEventListener('keyup', this.onKeyUpCallback);
  }
}

