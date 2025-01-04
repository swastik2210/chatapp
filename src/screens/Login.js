// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,setError]=useState('')
  const [token,setToken]=useState('')

  const handleLogin = async () => {
    // Basic validation
    
    if (!email || !password) {
      //Alert.alert('Error', 'Please enter both email and password');
      setError("Please enter both email and password")
      return;
    }
   
    // Set loading to true while the request is being processed
    setLoading(true);

    // Prepare the payload for the API
    const payload = {
      email,
      password,
    };

    try {
      // Call your API with fetch
      const response = await fetch('https://my-backend-app-e738.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
     // console.log("data",data);
      // Handle the API response
      if (response.ok) {
        navigation.navigate('ChatList');
        await AsyncStorage.setItem('userToken', data?.token);
        await AsyncStorage.setItem('userId', data?.userId);
      } else {

        setError(data?.error)
      }
    } catch (error) {
      // Handle network errors
      //Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      // Set loading to false after request is complete
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email or Username"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={()=>handleLogin()} disabled={loading} />
      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;
