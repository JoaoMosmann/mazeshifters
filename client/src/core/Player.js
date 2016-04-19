import PIXI from 'pixi.js';
import lerp from 'lerp';
import {tileSize} from './Constants';
import Maze from './Maze';
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
    this.prevPosition = null;

    this.graphics = new PIXI.Container();
    this.graphics.x = this.data.position.x*tileSize;
    this.graphics.y = this.data.position.y*tileSize;

    if (this.room) {
      let throttleMs = this.data.type === 'HUNTER' ? 100 : 150;
      this.isControllable = true;
      this.onKeyUpCallback = Throttle(this.onKeyUp.bind(this), throttleMs);
      document.addEventListener('keydown', this.onKeyUpCallback);
      document.addEventListener('keypress', e => e.preventDefault());
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

    e.preventDefault();

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
    } else
    if (e.which === Keycode.KEY_2) {
      if (this.data.type === 'PREY') {
        command.type = 'spell';
        command.value = 'turn_invisible';
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
          this.play3dSound('stone', this.data.position);
        } else if (this.data.type === 'PREY' && this.data.form === 2) {
          if (this.isControllable) {
            let container = new PIXI.Container();
            let drawing = new PIXI.Graphics();
            drawing.beginFill(0x000000);
            drawing.lineStyle(3, 0xFFFFFF);
            drawing.drawRect(0, 0, tileSize, tileSize);
            container.addChild(drawing);
            this.graphics.addChild(container);
            tweener.add(container).to({ alpha: .3 }, 200, Tweener.ease.quintOut)
          }
          this.play3dSound('invisible', this.data.position);
        } else if (this.data.type === 'HUNTER' && this.data.form === 1) {
          let container = new PIXI.Container();
          let drawing = new PIXI.Graphics();
          drawing.beginFill(0xCC3300);
          drawing.lineStyle(3, 0xFF330);
          drawing.drawRect(0, 0, tileSize, tileSize);
          container.addChild(drawing);
          this.graphics.addChild(container);
          tweener.add(container).to({ y: -16 }, 200, Tweener.ease.quintOut)
          this.play3dSound('fly', this.data.position);
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

      if (this.prevPosition) {
        if (this.data.position.x !== this.prevPosition.x || this.data.position.y !== this.prevPosition.y) {
          let walkSound = this.data.type === 'PREY' ? 'walk1' : 'walk2';
          if (this.data.form !== 2) {
            this.play3dSound(walkSound, this.data.position);
          }
        }
      }
      this.prevPosition = Object.assign({}, this.data.position);
    }
  }

  play3dSound (name, emitterPosition) {
    let receptorPosition = Player.CURRENT.data.position
      , xDistance = (receptorPosition.x - emitterPosition.x) / -10
      , yDistance = (receptorPosition.y - emitterPosition.y) / 10;
    App.sound.play(name, x => App.sound.pos3d(xDistance, yDistance, 0, x));
  }

  onDispose () {
    document.removeEventListener('keyup', this.onKeyUpCallback);
  }
}

