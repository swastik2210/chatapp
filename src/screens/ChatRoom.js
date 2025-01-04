// src/screens/ChatRoom.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const ChatRoom = ({ route,navigation }) => {
  const { receiveruserId,userName } = route.params; // Get the userName passed from ChatList
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);
 // const userId= AsyncStorage.getItem('userId');
  const socket = useRef(null); // Using useRef to persist socket connection
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId); // Store userId in state
    };
    fetchUserId();
  }, []); 
  useEffect(() => {
    const connectSocket = async () => {
      const token = await AsyncStorage.getItem('userToken');
      socket.current = io('https://my-backend-app-e738.onrender.com', {
        query: { token },
      });

      // Receive new message from server
      socket.current.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    };

    connectSocket();
  }, []);

  // Fetch existing chat history with the selected user
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        //const storedUserId = await AsyncStorage.getItem('userId'); // Fetch and store userId
         //setUserId(storedUserId); 
       // console.log(userId,"userId")
        if (token) {
          const response = await fetch(`https://my-backend-app-e738.onrender.com/api/messages/${receiveruserId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          setMessages(data); // Set the messages state with the fetched data
          //console.log(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [receiveruserId]);

  // Send new message
 
  const sendMessage = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      if (newMessage.trim()) {
        const messageData = {
          receiver: receiveruserId,
          content: newMessage,
          sender: { _id: userId } 
        };
        setMessages((prevMessages) => [...prevMessages, messageData]);

        // Emit the message via socket
        socket.current.emit('sendMessage', messageData);

        // Optionally save the message to the backend
        await fetch('https://my-backend-app-e738.onrender.com/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        });

        // Clear input field after sending
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  const updateMessage = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      if (editingMessageId && newMessage.trim()) {
        const response = await fetch(`https://my-backend-app-e738.onrender.com/api/messages/${editingMessageId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newMessage }),
        });

        const updatedMessage = await response.json();

        // Update the local state
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === editingMessageId ? { ...msg, content: newMessage } : msg))
        );

        setEditingMessageId(null); // Clear editing state
        setNewMessage(''); // Clear input field
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };
  const deleteMessage = async (messageId) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      await fetch(`https://my-backend-app-e738.onrender.com/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId)); // Remove from UI
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  const handleSendOrUpdateMessage = () => {
    if (editingMessageId) {
      updateMessage(); // Update the message if in edit mode
    } else {
      sendMessage(); // Send a new message
    }
  };

  const handleEditMessage = (messageId, content) => {
    setEditingMessageId(messageId); // Set the message ID to be edited
    setNewMessage(content); 
    setIsOptionsVisible(false);// Populate the input with the current message content
  };
  const handleLongPressMessage = (messageId) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (message.sender._id === userId) { // Check if the message is sent by the current user
      setSelectedMessageId(messageId);
      setIsOptionsVisible(true);
    }
  };
  const renderMessage = ({ item }) => (
    <TouchableOpacity onLongPress={() => handleLongPressMessage(item._id)} style={[styles.message, item.sender._id === userId ? styles.myMessage : styles.otherMessage]}>
      <Text>{item.content}</Text>
      <Text style={styles.messageMeta}>{item.sender._id === userId ? 'Me' : item.sender.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
          placeholder="Type your message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendOrUpdateMessage}>
          <Text style={styles.sendButtonText}>{editingMessageId ? 'Update' : 'Send'}</Text>
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      <Modal
        transparent={true}
        visible={isOptionsVisible}
        animationType="slide"
        onRequestClose={() => setIsOptionsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={() => handleEditMessage(selectedMessageId, messages.find(msg => msg._id === selectedMessageId).content)}>
              <Text style={styles.optionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              deleteMessage(selectedMessageId);
              setIsOptionsVisible(false);
            }}>
              <Text style={styles.optionText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsOptionsVisible(false)}>
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  message: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  messageMeta: {
    fontSize: 10,
    color: '#555',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
  },
  optionsContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginVertical: 10,
    color: '#007BFF',
  },
});

export default ChatRoom;
