"use strict";

var colyseus = require('colyseus')
  , http = require('http')
  , express = require('express')
  , port = process.env.PORT || 2657
  , app = express();

var server = http.createServer(app)
  , gameServer = new colyseus.Server({server: server})

var MatchRoom = require('./rooms/match_room')

gameServer.register("match", MatchRoom)

app.use(express.static(__dirname + "/../client/public"))
server.listen(port);

console.log(`Listening on http://localhost:${ port }`)
//var generateMaze = require('generate-maze-by-clustering');
//var maze = generateMaze([20, 10]);
//console.log(maze.toText());


