"use strict";

var Room = require('colyseus').Room
  , generateMaze = require('generate-maze-by-clustering');

class MatchRoom extends Room {

  constructor (options) {
    super(options, 1000)

    this.setState({
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
    client.playerIndex = Object.keys(this.state.players).length;
    this.state.players[ client.id ] = client.playerIndex;

    if (this.clients.length === 2) {
      let maze = generateMaze([75, 75]);

      this.state.maze = maze.toText();
      this.state.messages.push(`${ client.id } joined.`);

      this.lock();
    }
  }

  onLeave (client) {
    this.state.messages.push(`${ client.id } leaved.`)
  }

  onMessage (client, data) {
    if (data.message == "kick") {
      this.clients.filter(c => c.id !== client.id).forEach(other => other.close())

    } else {
      this.state.messages.push(data.message)
    }

    console.log("MatchRoom:", client.id, data)
  }

  dispose () {
    console.log("Dispose MatchRoom")
  }

}

module.exports = MatchRoom;
