import Colyseus from 'colyseus.js'

let instance = new Colyseus(
  //"wss://peaceful-lowlands-42461.herokuapp.com"
  window.location.protocol.replace("http", "ws") + "//" + window.location.hostname + ((window.location.port) ? ':' + window.location.port : '')
  // window.location.protocol.replace("http", "ws") + "//" + process.env.
);

export {instance as default};
