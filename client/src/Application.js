import PIXI from 'pixi.js'
import Tweener from 'tweener'

window.Tweener = Tweener
window.tweener = new Tweener();

import Colyseus from 'colyseus.js'
window.colyseus = new Colyseus(
  //"wss://tictactoe-colyseus.herokuapp.com"
  window.location.protocol.replace("http", "ws") + "//" + window.location.hostname + ((window.location.port) ? ':' + window.location.port : '')
  // window.location.protocol.replace("http", "ws") + "//" + process.env.
)

export default class Application {

  constructor () {
    console.log('Application initialized', Colyseus, Tweener, PIXI);
    alert('aehooo');
  }

}
