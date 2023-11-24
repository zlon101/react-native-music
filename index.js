import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import {name as appName} from './app.json';
import App from '@/entry';
// import App from './src/App';
// import {registerService} from '@/utils/track-player';

AppRegistry.registerComponent(appName, () => App);
// registerService();
