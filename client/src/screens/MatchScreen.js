import PIXI from 'pixi.js'
import lerp from 'lerp';
import Maze from '../core/Maze';
import Player from '../core/Player';

import Application from '../Application'
import ColyseusInstance from '../ColyseusInstance';

import {tileSize} from '../core/Constants';

export default class MatchScreen extends PIXI.Container {

  constructor () {
    super();

    this.state = null;
    this.maze = null;
    this.currentPlayer = null;
    this.players = {};
    this.room = null;
    this.gameStarted = false;
    this.joinRoom();

    this.on('dispose', this.onDispose.bind(this))

    this.onEnterFrame = function () {
      window.requestAnimationFrame(this.onEnterFrame);
      if (this.currentPlayer) {
        this.x = lerp(this.x, (Application.WIDTH / 2) - this.currentPlayer.data.position.x * tileSize, 0.1);
        this.y = lerp(this.y, (Application.HEIGHT / 2) - this.currentPlayer.data.position.y * tileSize, 0.1);
      }
    };
    this.onEnterFrame = this.onEnterFrame.bind(this);
    this.onEnterFrame();
  }

  joinRoom () {
    this.room = ColyseusInstance.join('match');
    this.room.on('update', this.onUpdate.bind(this));

    let text = (ColyseusInstance.readyState === WebSocket.CLOSED)
      ? "Couldn't connect."
      : "Waiting for an opponent..."

    this.instructionText = new PIXI.Text(text, {
      font: "20px Verdana",
      fill: 0xFFFFFF,
      textAlign: 'center'
    });

    this.instructionText.pivot.x = this.instructionText.width / 2
    this.instructionText.pivot.y = this.instructionText.height / 2
    this.addChild(this.instructionText)

    console.log("Joinned", this.room);
  }

  onUpdate (state, patches) {
    this.state = state;
    if (!this.gameStarted && state.game.started) {
      this.onJoin();
      this.renderMaze(state.maze);
      Object.keys(state.players)
        .forEach(this.addPlayer.bind(this));
    }

    if (patches) {
      for (let i=0; i<patches.length; i++) {
        let patch = patches[i]
          , path = patch.path.substr(1).split('/');

        if (path[0] === 'players') {
          if (patch.op === 'add' && path.length === 2 && this.gameStarted) {
            this.addPlayer(patch.value.id);
          } else
          if (patch.op === 'replace') {
            this.onPlayerUpdate(path[1]);
          }
        }
        else
        if (path[0] === 'game' && path[1] === 'ended') {
          if (state.game.ended) {
            alert(state.game.winner + 'S ARE THE WINNERS.\n\n THE PAGE WILL REFRESH FOR AN NEW GAME');
            location.reload();
          }
        }
        console.log('patch: ', patch);
      }
    }
    console.log("STATE:", state);
  }

  addPlayer (playerId) {
    let player = this.state.players[playerId]
      , playerInstance;

    if (!this.players[playerId]) {
      if (player.id === ColyseusInstance.id) {
        playerInstance = new Player(player, this.room);
        this.currentPlayer = playerInstance;
      } else {
        playerInstance = new Player(player);
      }
      this.players[player.id] = playerInstance;
      this.addChildAt(playerInstance.graphics, 1 + playerInstance.data.position.y);
      this.onPlayerUpdate(player.id);
    }
  }

  onPlayerUpdate (id) {
    let player = this.players[id];
    player.update(this.state.players[id]);
    this.addChildAt(player.graphics, 1 + player.data.position.y);
  }

  renderMaze (data) {
      let MazeInstance = new Maze(data)
        , texture = PIXI.Texture.fromImage('images/terrain.png')
        , tilingSprite = new PIXI.extras.TilingSprite(texture, tileSize*data[0].length, tileSize*data.length);

      this.maze = MazeInstance;
      this.addChild(tilingSprite);
      MazeInstance.graphics
                  .forEach(row => this.addChild(row));
  }

  onJoin () {
    this.gameStarted = true;
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
      if (this.state) {
        this.onUpdate(this.state);
      }
    }
  }

  onDispose () {
    window.removeEventListener('resize', this.onResizeCallback)
  }

}

