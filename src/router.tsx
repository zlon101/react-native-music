import React from 'react';
import {View, Text} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './pages/home';
import Log from './pages/log';

export const Stack = createNativeStackNavigator();

const Detail = () => (
  <View>
    <Text>Detail</Text>
  </View>
);

const routes = [
  {
    path: 'Home',
    component: Home,
  },
  {
    path: 'Detail',
    component: Detail,
  },
  {
    path: 'Log',
    component: Log,
  },
] as const;

export default routes;

export type IRouteName = (typeof routes)[number]['path'];
