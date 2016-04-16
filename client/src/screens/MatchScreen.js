import PIXI from 'pixi.js'

import Application from '../Application'
import ColyseusInstance from '../ColyseusInstance';

export default class MatchScreen extends PIXI.Container {

  constructor () {
    super();

    this.maze = null;
    this.room = null;
    this.gameStarted = false;
    this.joinRoom();

    this.on('dispose', this.onDispose.bind(this))
  }

  joinRoom () {
    this.room = ColyseusInstance.join('match');
    this.room.on('update', this.onUpdate.bind(this));

    let text = (ColyseusInstance.readyState === WebSocket.CLOSED)
      ? "Couldn't connect."
      : "Waiting for an opponent..."

    this.instructionText = new PIXI.Text(text, {
      font: "62px Verdana",
      fill: 0xFFFFFF,
      textAlign: 'center'
    });

    this.instructionText.pivot.x = this.instructionText.width / 2
    this.instructionText.pivot.y = this.instructionText.height / 2
    this.addChild(this.instructionText)

    console.log("Joinned", this.room);
  }

  onUpdate (state, patches) {
    if (!this.gameStarted && Object.keys(state.players).length === 2) {
      this.onJoin();
    }

    if (patches) {
      for (let i=0; i<patches.length; i++) {
        let patch = patches[i]
        if (patch.path === '/maze' && patch.op ==='add') {
          this.renderMaze(patch.value);
        }
        console.log('patch: ', patch);
      }
    }
  }

  renderMaze (maze) {
    var graphics = new PIXI.Graphics()
      , tileSize = 32;

    // Turn maze string into an 2d array
    this.maze = maze.split('\n').map(x => x.split('').map(y => y === ' ' ? 0 : 1));
    this.maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {

          graphics.beginFill(0xFFFF00);
          graphics.lineStyle(5, 0xFF0000);
          graphics.drawRect(x*tileSize, y*tileSize, tileSize, tileSize);

        }
      });
      this.addChild(graphics);
    });
  }

  onJoin () {
    this.removeChild(this.instructionText);
  }

  transitionIn () {
    return tweener.add(this.instructionText).from({ alpha: 0 }, 300, Tweener.ease.quadOut);
  }

  transitionOut () {
    tweener.remove(this.instructionText)
    return tweener.add(this.instructionText).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
  }

  onResize () {
    if (this.instructionText) {
      this.instructionText.x = Application.WIDTH / 2
      this.instructionText.y = Application.HEIGHT / 2 - this.instructionText.height / 3.8
    }
  }

  onDispose () {
    window.removeEventListener('resize', this.onResizeCallback)
  }

}

