import { AppRegistry } from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import {registerPlaybackService} from '@/utils/track-player';

AppRegistry.registerComponent(appName, () => App);
// registerPlaybackService();
