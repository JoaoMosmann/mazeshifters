import Colyseus from 'colyseus.js'

export default class ColyseusInstance {

  constructor () {
  }

  static init () {
    let instance = new Colyseus(
      window.location.protocol.replace("http", "ws") + "//" + window.location.hostname + ((window.location.port) ? ':' + window.location.port : '')
    );
    ColyseusInstance.client = instance;
  }

}
