import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button } from 'react-native';
import { Colors, Header } from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import router, { Stack } from '@/router';
import {setUp} from '@/utils/track-player';
import { LogProvider } from '@/pages/log/context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    console.log('useEffect setUp!');
    setUp();
  }, []);

  return (
    <>
      <LogProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            {
              router.map(item => <Stack.Screen name={item.path} component={item.component} key={item.path} />)
            }
            {/*<Stack.Screen name="Home" component={HomePage} options={{ title: 'Overview' }} />*/}
          </Stack.Navigator>
        </NavigationContainer>
        <View>
          <Text>cscscsscs</Text>
        </View>
      </LogProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default gestureHandlerRootHOC(App);
