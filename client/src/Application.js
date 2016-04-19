import PIXI from 'pixi.js'
import Tweener from 'tweener'
import ColyseusInstance from './ColyseusInstance';
import SceneManager from './core/SceneManager'
import {Howl} from 'howler';

window.Tweener = Tweener
window.tweener = new Tweener();

export default class Application {

  constructor () {

    let soundsprite = require('../public/audios/audios.json');
    this.sound = new Howl(soundsprite);
    this.sound.volume = 0.2;

    this.width = 640;
    this.height = 640;
    this.scale = this.getMaxScale();

    // canvas size
    this.screenWidth = window.innerWidth
    this.screenHeight = window.innerHeight

    this.scaledWidth = this.screenWidth * this.scale
    this.scaledHeight = this.screenHeight * this.scale

    this.renderer = new PIXI.WebGLRenderer(this.scaledWidth, this.scaledheight, {
    //this.renderer = new PIXI.WebGLRenderer(this.screenWidth, this.screenHeight, {
      // resolution: window.devicePixelRatio,
      antialias: true
    })
    this.renderer.backgroundColor = 0x000000;
    document.body.appendChild(this.renderer.view)

    this.stage = new SceneManager(Application.SCALE_RATIO)
    this.stage.scale.set(this.scale);

    this.container = new PIXI.Container()
    this.container.addChild(this.stage)

    window.addEventListener('resize', this.onResize.bind(this))
    this.onResize()

    // if (this.renderer.view.width > window.innerWidth) {
    //   this.renderer.view.style.position = "absolute"
    //   this.stage.x = (window.innerWidth - this.renderer.view.width) / 2
    // }
  }

  onResize (e) {
    this.scale = this.getMaxScale()

    this.screenWidth = window.innerWidth
    this.screenHeight = window.innerHeight

    this.scaledWidth = this.width * this.scale
    this.scaledHeight = this.height * this.scale

    this.renderer.resize(this.scaledWidth, this.scaledHeight)
    this.stage.scale.set(this.scale)

    Application.WIDTH = this.width;
    Application.HEIGHT = this.height;
    Application.MARGIN = (this.scaledHeight / 100) * 10
  }

  gotoScene (sceneClass) {
    this.stage.goTo(sceneClass)
  }

  getMaxScale () {
    return Math.min(window.innerWidth / this.width, window.innerHeight / this.height)
  }

  update (time) {
    time = time || 0;
    window.requestAnimationFrame( this.update.bind( this) )
    tweener.update(time / 1000);

    this.renderer.render(this.container)
  }

}
