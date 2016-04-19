import PIXI from 'pixi.js'
import {tileSize} from './Constants';

export default class Maze {
  constructor (data) {
    this.graphics = [];

    // Turn maze string into an 2d array
    this.cells = data;

    Maze.WIDTH = this.cells[0].length;
    Maze.HEIGHT = this.cells.length;

    this.cells.forEach((row, y) => {
      let rowContainer = new PIXI.Container();
      row.forEach((cell, x) => {
        if (cell === 1) {
          let wall = PIXI.Sprite.fromImage('images/wall_block.png');
          wall.x = x * tileSize;
          wall.y = (y * tileSize) - 16;
          rowContainer.addChild(wall);
        }
      });
      this.graphics.push(rowContainer);
    });

  }
}
