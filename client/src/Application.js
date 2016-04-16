import PIXI from 'pixi.js'
import Tweener from 'tweener'
import ColyseusInstance from './ColyseusInstance';

window.Tweener = Tweener
window.tweener = new Tweener();

export default class Application {

  constructor () {
    console.log('Application initialized', Tweener, PIXI, ColyseusInstance);

    var matchRoom = ColyseusInstance.join("match")
    matchRoom.on('error', function(error) {
      console.error(error)
    })

    matchRoom.on('join', function() {
      console.log(ColyseusInstance.id, "joined", matchRoom.name)
    })

    matchRoom.on('leave', function() {
      console.log(ColyseusInstance.id, "leaved", matchRoom.name)
    })

    matchRoom.on('data', function(data) {
      console.log(ColyseusInstance.id, "received on", matchRoom.name, data)
    })

    matchRoom.on('setup', function(state) {
      console.log("setup:", state)

      // setup initial messages
      for (var i=0; i<state.messages.length; i++) {
        console.log('message:', state.messages[i]);
      }
    })

    matchRoom.on('patch', function(patch) {
      for (var i=0; i<patch.length; i++) {
        console.log('message:', patch[i]);
      }

      console.log("patch:", patch)
    })

    matchRoom.on('update', function(state) {
      console.log("update:", state)
    })

    setInterval(x => ColyseusInstance.send( {message: 'Hey ' + Math.random()} ), 3000);
  }

}
