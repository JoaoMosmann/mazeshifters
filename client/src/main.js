import Application from './Application';
import TitleScreen from './screens/TitleScreen';
import Resources from './Resources';

let App = window.App = new Application();
Resources.load(onLoad);

function onLoad () {
  App.gotoScene (TitleScreen);
  App.update();
}

document.addEventListener('click', x => window.focus());
