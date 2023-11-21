import { AppRegistry } from 'react-native';
import {name as appName} from './app.json';
import App from './src/App';
// import {registerService} from '@/utils/track-player';

console.log('registerComponent');
AppRegistry.registerComponent(appName, () => App);
// registerService();
