import PIXI from 'pixi.js'

export default class Resources {

  static load (onLoadComplete) {
    this.onLoadComplete = onLoadComplete

    this.numLoads = 0
    this.filesToLoad = 2

    App.sound.on('load', this.incrementLoader.bind(this))

    this.loader = new PIXI.loaders.Loader();
    this.loader.add('terrain', 'images/terrain.png');
    this.loader.add('wall', 'images/wall_block.png');
    this.loader.on('complete', this.incrementLoader.bind(this))
    this.loader.load();
  }

  static incrementLoader () {
    this.numLoads++
    if (this.numLoads === this.filesToLoad) {
      document.body.className = "loaded"
      setTimeout(x => document.querySelector('.loading').style.display = 'none', 500);
      this.onLoadComplete()
    }
  }

}
