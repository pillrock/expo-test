import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Switch, Text, View } from 'react-native';
import io from 'socket.io-client';

// Replace with your computer's IP address if running on physical device
// For Android Emulator, 10.0.2.2 is usually localhost
const SOCKET_URL = 'http://192.168.1.8:3000'; 

export default function TTSManager() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('tts-message', (data: { text: string }) => {
      console.log('Received TTS message:', data);
      setLastMessage(data.text);
      if (isEnabled) {
        speak(data.text);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isEnabled]);

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'vi-VN', // Vietnamese
      pitch: 1.0,
      rate: 1.0,
    });
  };

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
      
      <View style={styles.row}>
        <Text>Enable TTS:</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>

      {lastMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.label}>Last Message:</Text>
          <Text style={styles.message}>{lastMessage}</Text>
          <Button title="Replay" onPress={() => speak(lastMessage)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 10,
  },
  status: {
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  messageContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  message: {
    marginBottom: 10,
    fontSize: 16,
  },
});
