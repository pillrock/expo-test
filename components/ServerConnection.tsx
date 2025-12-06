import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSocket } from './SocketContext';
import { ThemedText } from './themed-text';

export function ServerConnection() {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.5:3000');
  const [isEditing, setIsEditing] = useState(false);
  const [isShowHost, setIsShowHost] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { connect, isConnected, connectionStatus } = useSocket();

  useEffect(() => {
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('server_url');
      if (savedUrl) {
        setServerUrl(savedUrl);
        connect(savedUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
        setIsLoaded(true);
    }
  };

  const handleSaveAndConnect = async () => {
    // Basic validation
    let urlToSave = serverUrl.trim();
    if (!urlToSave.startsWith('http')) {
        urlToSave = `http://${urlToSave}`;
        setServerUrl(urlToSave);
    }

    try {
      await AsyncStorage.setItem('server_url', urlToSave);
      setIsEditing(false);
      connect(urlToSave);
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = () => {
      switch (connectionStatus) {
          case 'connected': return '#4CAF50';
          case 'connecting': return '#FFC107';
          case 'error': return '#F44336';
          default: return '#9E9E9E';
      }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
        case 'connected': return 'Online';
        case 'connecting': return 'Connecting...';
        case 'error': return 'Error';
        default: return 'Offline';
    }
  };

  if (!isLoaded) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
           <Ionicons name="server-outline" size={20} color="#E0E0E0" style={{marginRight: 8}} />
           <ThemedText type="defaultSemiBold" style={{color: '#E0E0E0'}}>Server Host</ThemedText>
        </View>
        
        <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</ThemedText>
        </View>
      </View>

      <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="Enter server URL (e.g., http://192.168.1.5:3000)"
            placeholderTextColor="#666"
            editable={isEditing}
            autoCapitalize="none"
            secureTextEntry={!isShowHost}
          />
          <TouchableOpacity onPress={() => setIsShowHost(!isShowHost)} style={styles.eyeIcon}>
              <Ionicons name={isShowHost ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
          </TouchableOpacity>
      </View>

      {isEditing ? (
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAndConnect}>
            <ThemedText style={styles.saveButtonText}>Lưu & Kết nối</ThemedText>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{marginLeft: 4}} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
             <ThemedText style={styles.editButtonText}>Sửa Host</ThemedText>
             <Ionicons name="create-outline" size={16} color="#bbb" style={{marginLeft: 4}} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2A2A2A',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
  },
  statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
  },
  statusText: {
      fontSize: 12,
      fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#FFF',
  },
  inputDisabled: {
      opacity: 0.7,
  },
  eyeIcon: {
      padding: 10,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingVertical: 4,
  },
  editButtonText: {
      color: '#bbb',
      fontSize: 14,
  }
});
