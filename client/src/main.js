import Application from './Application';
import TitleScreen from './screens/TitleScreen';

var loader = new PIXI.loaders.Loader();
loader.add('terrain', 'images/terrain.png');
loader.add('wall', 'images/wall_block.png');

loader.on('complete', () => {
  var app = new Application();
  app.gotoScene (TitleScreen);
  app.update();
});
loader.load();

document.addEventListener('click', x => window.focus());
