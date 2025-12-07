import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useTransaction } from './TransactionContext';
import { ThemedText } from './themed-text';

export default function TTSManager() {
  const [isEnabled, setIsEnabled] = useState(true);
  const { lastTransaction } = useTransaction();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    if (lastTransaction) {
      const speechText = `Đã nhận ${lastTransaction.amount} đồng`;
      
      setDisplayMessage(speechText);
      console.log("TTS Triggered:", speechText);

      if (isEnabled) {
        speak(speechText);
      }
    }
  }, [lastTransaction]);

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'vi-VN', 
      pitch: 0.9,
      rate: 1.0,
    });
  };

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
         <View style={styles.titleWrapper}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#E0E0E0" style={{marginRight: 8}} />
          <ThemedText type="defaultSemiBold" style={{color: '#E0E0E0'}}>Text to Speech</ThemedText>
        </View>
        <Switch
          trackColor={{ false: "#3e3e3e", true: "#1565C0" }}
          thumbColor={isEnabled ? "#2196F3" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>

      {displayMessage ? (
        <View style={styles.messageBubble}>
          <View style={styles.messageHeader}>
             <ThemedText style={styles.messageLabel}>Tin nhắn cuối:</ThemedText>
             <TouchableOpacity onPress={() => speak(displayMessage)} hitSlop={10}>
                <Ionicons name="volume-high-outline" size={20} color="#2196F3" />
             </TouchableOpacity>
          </View>
          <ThemedText style={styles.messageText}>{displayMessage}</ThemedText>
        </View>
      ) : (
         <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Đang chờ giao dịch...</ThemedText>
         </View>
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleWrapper: {
     flexDirection: 'row',
     alignItems: 'center',
  },
  messageBubble: {
    backgroundColor: '#2C2C2C',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 0,
  },
  messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
  },
  messageLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
  },
  emptyContainer: {
      padding: 10,
      alignItems: 'center',
  },
  emptyText: {
      color: '#666',
      fontSize: 14,
      fontStyle: 'italic',
  }
});
