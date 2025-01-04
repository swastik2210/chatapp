// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const[error,setError]=useState('')
  const[loading,setLoading]=useState(false)

  const handleRegister = async () => {
    // Call your backend register API here
    const payload = { email, password, username };
    setLoading(true)
    try {
      const response = await fetch('https://my-backend-app-e738.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        setError("Please fill all the three requiremenst")
        console.error('Registration failed:', response.status, response.statusText);
        return;
      }
      else{
        navigation.navigate("Login");
      }
  
      const data = await response.json();
      console.log('Registration successful, response:', data);
  
      // Handle registration success (e.g., navigate to login screen or home)
    } catch (error) {
      console.error('Error during registration:', error);
    } finally{
      setLoading(false);
    }

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
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
      <Button title={loading ? 'Registering...' : 'Register'} onPress={()=>handleRegister()} disabled={loading} />
      <Button
        title="Login"
        onPress={() => navigation.navigate('Login')}
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

export default RegisterScreen;
