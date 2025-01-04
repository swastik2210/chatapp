import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/Login';
import RegisterScreen from './src/screens/Register';
import ChatListScreen from './src/screens/ChatList';
import ChatRoom from './src/screens/ChatRoom';
import 'react-native-gesture-handler';
import {
  StyleSheet,
} from 'react-native';
function App(): React.JSX.Element {
  
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        </Stack.Navigator>
    </NavigationContainer>
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

export default App;