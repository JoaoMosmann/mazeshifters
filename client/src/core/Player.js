import PIXI from 'pixi.js';
import lerp from 'lerp';
import {tileSize} from './Constants';
import Throttle from 'lodash/throttle';
var Keycode = require('keycode.js');

export default class Player {
  constructor (data, room) {
    this.room = room;
    this.data = data;
    this.update(data);
    this.isRendered = false;
    this.isControllable = false;
    this.currentForm = 0;

    this.graphics = new PIXI.Container();
    this.graphics.x = this.data.position.x*tileSize;
    this.graphics.y = this.data.position.y*tileSize;

    if (this.room) {
      let throttleMs = this.data.type === 'HUNTER' ? 100 : 150;
      this.isControllable = true;
      this.onKeyUpCallback = Throttle(this.onKeyUp.bind(this), throttleMs);
      document.addEventListener('keydown', this.onKeyUpCallback);
    }

    this.onEnterFrame = function () {
      window.requestAnimationFrame(this.onEnterFrame);
      this.graphics.x = lerp(this.graphics.x, this.data.position.x*tileSize, .5);
      this.graphics.y = lerp(this.graphics.y, this.data.position.y*tileSize, .5);
    };
    this.onEnterFrame = this.onEnterFrame.bind(this);
    this.onEnterFrame();
  }

  onKeyUp (e) {
    let command = {};

    if (e.which == Keycode.UP) {
      command.type = 'direction';
      command.y = -1;
    } else if (e.which == Keycode.DOWN) {
      command.type = 'direction';
      command.y = 1;
    } else if (e.which == Keycode.LEFT) {
      command.type = 'direction';
      command.x = -1;
    } else if (e.which == Keycode.RIGHT) {
      command.type = 'direction';
      command.x = 1;
    }

    if (e.which === Keycode.KEY_1) {
      if (this.data.type === 'PREY') {
        command.type = 'spell';
        command.value = 'turn_wall';
      } else
      if (this.data.type === 'HUNTER') {
        command.type = 'spell';
        command.value = 'turn_eagle';
      }
    }

    if (command.type === 'direction' && (command.x || command.y)) {
      command.x = command.x || 0;
      command.y = command.y || 0;
      this.room.send(command);
    } else
    if (command.type === 'spell') {
      this.room.send(command);
    }
  }

  update (data) {
    if (data) {
      this.data = data;
      if ((!this.isRendered || this.data.form !== this.currentForm) && this.graphics) {
        this.isRendered = true;
        this.graphics.removeChildren();

        if (this.data.type === 'PREY' && this.data.form === 1) {
          let wall = PIXI.Sprite.fromImage('images/wall_block.png');
          wall.x = 0;
          wall.y = -16;
          this.graphics.addChild(wall);
        } else if (this.data.type === 'HUNTER' && this.data.form === 1) {
          let container = new PIXI.Container();
          let drawing = new PIXI.Graphics();
          drawing.beginFill(0xCC3300);
          drawing.lineStyle(3, 0xFF330);
          drawing.drawRect(0, 0, tileSize, tileSize);
          container.addChild(drawing);
          this.graphics.addChild(container);
          tweener.add(container).to({ y: -16 }, 200, Tweener.ease.quintOut)
        } else {
          let container = new PIXI.Container();
          let drawing = new PIXI.Graphics();
          if (!this.data.dead) {
            drawing.beginFill(this.data.type === 'PREY' ? 0x009999 : 0xCC3300);
            drawing.lineStyle(1, this.data.type === 'PREY' ? 0x000099 : 0xFF330);
            drawing.drawRect(0, 0, tileSize, tileSize);
          }
          container.addChild(drawing);
          this.graphics.addChild(container);
          if (this.data.type === 'HUNTER' && this.currentForm === 1) {
            tweener.add(container).from({ y: -16 }, 200, Tweener.ease.quintOut)
          }
        }

        this.currentForm = this.data.form;
      }

    }
  }

  onDispose () {
    document.removeEventListener('keyup', this.onKeyUpCallback);
  }
}

