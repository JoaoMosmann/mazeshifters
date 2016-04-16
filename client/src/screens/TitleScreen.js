import PIXI from 'pixi.js'

import Application from '../Application'
import MatchScreen from './MatchScreen'

export default class TitleScreen extends PIXI.Container {

  constructor () {
    super()

    this.instructionText = new PIXI.Text("Click here to start", {
      font: "62px Verdana",
      fill: 0xFFFFFF,
      textAlign: 'center'
    })
    this.instructionText.pivot.x = this.instructionText.width / 2
    this.instructionText.pivot.y = this.instructionText.height / 2
    this.addChild(this.instructionText)

    this.interactive = true
    this.once('click', this.startGame.bind(this))

    this.on('dispose', this.onDispose.bind(this))
  }

  transitionIn () {
    return tweener.add(this.instructionText).from({ alpha: 0 }, 300, Tweener.ease.quadOut);
  }

  transitionOut () {
    tweener.remove(this.instructionText)

    return tweener.add(this.instructionText).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
  }

  startGame () {
    this.emit('goto', MatchScreen);
  }

  onResize () {
    this.instructionText.x = Application.WIDTH / 2
    this.instructionText.y = Application.HEIGHT / 2 - this.instructionText.height / 3.8
  }

  onDispose () {
    window.removeEventListener('resize', this.onResizeCallback)
  }

}
