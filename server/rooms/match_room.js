"use strict";

var Room = require('colyseus').Room
  , generateMaze = require('generate-maze-by-clustering');

class MatchRoom extends Room {

  constructor (options) {

    super(options, 50);

    this.setState({
      game: {
        started: false,
        ended: false,
        winner: null
      },
      players: {},
      messages: []
    });
    this.maze = null;

    console.log("MatchRoom created!", options)
  }

  requestJoin(options) {
    // only 2 players are allowed to play
    return this.clients.length < 2;
  }

  onJoin (client) {
    if (!this.state.maze) {
      this.generateMaze();
    }

    this.state.messages.push(`${ client.id } joined.`);
    this.state.players[ client.id ] = this.generatePlayer(client);

    if (this.clients.length === 2) {
      this.state.game.started = true;
      setTimeout(x => {
        this.state.game.winner = 'PREY';
        this.state.game.ended = true;
        setTimeout(x => {
          this.disconnect();
        }, 50);
      }, 90*1000);
      this.lock();
    }
  }

  onLeave (client) {
    this.state.messages.push(`${ client.id } leaved.`)
  }

  onMessage (client, data) {

    if (data.type === 'direction') {
      let player = this.state.players[client.id]
        , curPos = player.position
        , newPos = {x: curPos.x + data.x, y: curPos.y + data.y};

      if (!this.state.maze[newPos.y][newPos.x]) {
        player.position = newPos;
        Object.keys(this.state.players)
              .map(playerId => this.state.players[playerId])
              .filter(player2 => player2.type !== player.type)
              .forEach(opponent => {
                if (player.position.x === opponent.position.x && player.position.y === opponent.position.y) {
                  player.type === 'PREY' ? (player.dead = true) : (opponent.dead = true);
                  this.checkPlayers();
                }
              });
      }
    }

    console.log("MatchRoom:", client.id, data)
  }

  checkPlayers () {
    var preysAlive = Object.keys(this.state.players)
                          .map(id => this.state.players[id])
                          .filter(player => player.type === 'PREY')
                          .filter(prey => !prey.dead)
                          .length;
    if (preysAlive === 0) {
      console.log('GAME ENDED. WINNER: HUNTER');
      this.state.game.winner = 'HUNTER';
      this.state.game.ended = true;
      setTimeout(x => {
        this.disconnect();
      }, 50);
    }

  }

  generateMaze () {
      let maze = generateMaze([5, 5]);
      this.state.maze = maze.toText()
                            .split('\n')
                            .map(x => x.split('')
                                       .map(y => y === ' ' ? 0 : 1)
                            );
  }

  generatePlayer (client) {
    let player = {}
      , position = {x: 0, y: 0};

    player.index = Object.keys(this.state.players).length;
    player.dead = false;
    player.id = client.id;
    player.type = player.index % 2 ? 'HUNTER' : 'PREY';
    while(this.state.maze[position.y][position.x]) {
      position.x = Math.floor(Math.random() * this.state.maze[0].length);
      position.y = Math.floor(Math.random() * this.state.maze.length);
    }
    player.position = position;
    return player;
  }

  dispose () {
    console.log("Dispose MatchRoom")
  }

}

module.exports = MatchRoom;
