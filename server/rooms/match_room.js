"use strict";

var Room = require('colyseus').Room;

class MatchRoom extends Room {

  constructor (options) {
    super(options, 1000)

    this.setState({ messages: [] })

    console.log("MatchRoom created!", options)
  }

  onJoin (client) {
    this.state.messages.push(`${ client.id } joined.`)
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
