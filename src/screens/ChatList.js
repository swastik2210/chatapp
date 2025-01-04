// src/screens/ChatListScreen.js
import React,{useState,useEffect} from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ChatList = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // const chats = [
  //   { _id: '1', name: 'John Doe' },
  //   { _id: '2', name: 'Jane Smith' },
  // ];
  //const userId=AsyncStorage.getItem('userId')
  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await fetch('https://my-backend-app-e738.onrender.com/api/users', {
          method: 'GET', // Use GET if you are retrieving data
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setUsers(data); 
        //console.log("Fetched users data:", data);// Set the users state with the fetched data
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatRoom', { receiveruserId: item._id,userName:item.username })}
    >
      <Text style={styles.chatName}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  chatItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  chatName: {
    fontSize: 18,
  },
});

export default ChatList;
