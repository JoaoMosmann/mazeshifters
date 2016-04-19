import PIXI from 'pixi.js'

import Application from '../Application'
import MatchScreen from './MatchScreen'

export default class TitleScreen extends PIXI.Container {

  constructor () {
    super()

    let buttonText = `Click here to start`
      , instructionsText = `
- Use the arrow keys to move your character
- Hunters (Red) should catch the Preys (Blue)
- Hunters can fly over the walls by pressing the key 1.
  It lasts 2 seconds and have a 30 seconds cooldown
- Preys can turn into a wall by pressing the key 1.
  But if a Hunter get near you'll be revealed
- Preys can also turn invisible for 3 seconds by pressing key 2.
  If a Hunter touch you whilst invisible you won't die
- The game ends if all preys get cought or after 90 seconds
`;

    this.buttonText = new PIXI.Text(buttonText, {
      font: "20px Verdana",
      fill: 0xFFFFFF,
      textAlign: 'center'
    })
    this.buttonText.pivot.x = this.buttonText.width / 2
    this.buttonText.pivot.y = this.buttonText.height * 3
    this.addChild(this.buttonText)

    this.instructionText = new PIXI.Text(instructionsText, {
      font: "14px Verdana",
      fill: 0xFFFFFF,
      textAlign: 'center'
    });
    this.instructionText.pivot.x = this.instructionText.width / 2
    this.instructionText.pivot.y = 0
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
    window.focus();
    this.emit('goto', MatchScreen);
  }

  onResize () {
    this.buttonText.x = Application.WIDTH / 2
    this.buttonText.y = Application.HEIGHT / 2 - this.buttonText.height / 3.8
    this.instructionText.x = Application.WIDTH / 2
    this.instructionText.y = Application.HEIGHT / 2 - this.instructionText.height / 3.8
  }

  onDispose () {
    window.removeEventListener('resize', this.onResizeCallback)
  }

}
