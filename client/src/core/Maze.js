import PIXI from 'pixi.js'
import {tileSize} from './Constants';

export default class Maze {
  constructor (data) {
    this.graphics = new PIXI.Graphics();

    // Turn maze string into an 2d array
    this.cells = data;
    console.log(data);
    this.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          this.graphics.beginFill(0x555555);
          this.graphics.lineStyle(1, 0x888888);
          this.graphics.drawRect(x*tileSize, y*tileSize, tileSize, tileSize);
        }
      });
    });

  }
}
