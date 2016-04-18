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
    return this.clients.length < 4;
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

      if (!this.state.maze[newPos.y][newPos.x] || (player.type === 'HUNTER' && player.form === 1)) {
        player.position = newPos;

        if (player.type === 'PREY' && player.form === 1) {
          player.form = 0;
        } else
        if (player.type === 'HUNTER') {
         Object.keys(this.state.players)
              .map(playerId => this.state.players[playerId])
              .filter(player2 => player2.type === 'PREY')
              .filter(prey => prey.form === 1)
              .filter(p => Math.sqrt((player.position.x-p.position.x)*(player.position.x-p.position.x) + (player.position.y-p.position.y)*(player.position.y-p.position.y)) < 7)
              .forEach(prey => {
                prey.form = 0;
              });
        }

        Object.keys(this.state.players)
              .map(playerId => this.state.players[playerId])
              .filter(player2 => player2.type !== player.type)
              .forEach(opponent => {
                if (player.position.x === opponent.position.x && player.position.y === opponent.position.y) {
                  let prey = player.type === 'PREY' ? player : opponent;
                  let hunter = player.type === 'PREY' ? opponent : player;
                  if (prey.form !== 2) {
                    prey.dead = true;
                  }
                  this.checkPlayers();
                }
              });
      }
    }
    else
    if (data.type === 'spell') {
      let player = this.state.players[client.id];

      if (player.type === 'PREY') {
        if (data.value === 'turn_wall') {
          player.form = 1;
        } else
        if (data.value === 'turn_invisible') {
          player.form = 2;
          player.cooldowns.turnInvisible = true;
          setTimeout(x => {
            player.cooldowns.turnInvisible = false;
          }, 25000);
          setTimeout(x => {
            player.form = 1;
          }, 3000);
        }
      } else
      if (player.type === 'HUNTER') {
        if (data.value === 'turn_eagle' && !player.cooldowns.turnEagle) {
          player.form = 1;
          player.cooldowns.turnEagle = true;
          setTimeout(x => {
            player.cooldowns.turnEagle = false;
          }, 30000);
          setTimeout(x => {
            player.form = 0;
          }, 1500);
        }
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
      let maze = generateMaze([11, 11]);
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
    player.form = 0;
    player.dead = false;
    player.id = client.id;
    player.type = player.index % 2 ? 'HUNTER' : 'PREY';
    player.cooldowns = {
      turnEagle: false,
      turnInvisible: false
    };

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
