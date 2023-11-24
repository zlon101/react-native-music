import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { AppRegistry, LogBox } from 'react-native';
import {name as appName} from './app.json';
import App from '@/entry';
// import App from './src/App';
import {registerService} from '@/utils/track-player';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

AppRegistry.registerComponent(appName, () => App);
registerService();
