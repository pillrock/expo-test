import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import io from 'socket.io-client';

export const useForegroundService = () => {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let unsubscribe: () => void;
    try {
        const notifee = require('@notifee/react-native').default;
        unsubscribe = notifee.onForegroundEvent(({ type, detail }: any) => {
          if (type === 3 && detail.pressAction?.id === 'stop') { // ACTION_PRESS
            stopForegroundService();
          }
        });
    } catch (e) {
        console.warn("Notifee module not available:", e);
    }
    
    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, []);

  const startForegroundService = async () => {
    if (Platform.OS !== 'android') {
      alert('Foreground Service is only supported on Android.');
      return;
    }

    try {
      const notifeeModule = require('@notifee/react-native');
      const notifee = notifeeModule.default;
      const { AndroidImportance } = notifeeModule;

      // 1. Create channel
      const channelId = await notifee.createChannel({
        id: 'sticky_channel',
        name: 'Background TTS Service',
        importance: AndroidImportance.HIGH,
      });

      // 2. Display notification to start service
      await notifee.displayNotification({
        id: 'foreground-service',
        title: 'Ứng dụng báo tiền đang chạy',
        body: 'Đang lắng nghe giao dịch...',
        android: {
          channelId,
          asForegroundService: true,
          ongoing: true,
          color: '#4caf50',
          actions: [
            {
              title: 'Tắt Service',
              pressAction: { id: 'stop' },
            },
          ],
        },
      });

      setIsServiceRunning(true);
      
      // 3. Connect Socket within this context
      await connectBackgroundSocket();

    } catch (error) {
      console.error('Failed to start foreground service:', error);
    }
  };

  const stopForegroundService = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const notifee = require('@notifee/react-native').default;
      await notifee.stopForegroundService();
      
      // Cleanup socket
      if (socketRef.current) {
          console.log('Stopping service: disconnecting socket...');
          socketRef.current.disconnect();
          socketRef.current = null;
      }

      setIsServiceRunning(false);
    } catch (error) {
        console.error('Failed to stop foreground service:', error);
    }
  };

  const connectBackgroundSocket = async () => {
    try {
        const serverUrl = await AsyncStorage.getItem('server_url');
        if (!serverUrl) {
            console.log('No server URL found for background service');
            Speech.speak('Chưa cấu hình địa chỉ máy chủ');
            return;
        }

        // Clean up existing socket if any
        if (socketRef.current) {
            console.log('Socket already exists, disconnecting old one...');
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        const socket = io(serverUrl, {
            transports: ['websocket'],
            reconnection: true,
        });
        
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Background Socket connected! ID:', socket.id);
            Speech.speak('Đã kết nối máy chủ');
        });

        socket.on('payment_received', async (data) => {
             console.log('Background Payment Received:', data);
             // Basic verification if needed, or just speak
             const storedCode = await AsyncStorage.getItem('client_code');
             if (storedCode && data.clientCode && data.clientCode === storedCode) {
                 const text = data.text || `Nhận ${data.transaction.transferAmount} đồng`;
                 Speech.speak(text, { language: 'vi-VN' });
             } else {
                 console.log("Background: Code mismatch or missing, ignoring.");
             }
        });

        socket.on('disconnect', (reason) => {
            console.log('Background Socket disconnected:', reason);
        });
        
        socket.on('connect_error', (err) => {
            console.log('Background Socket connect error:', err);
        });

    } catch (e) {
        console.error('Error connecting background socket', e);
    }
  };

  return {
    isServiceRunning,
    startForegroundService,
    stopForegroundService,
  };
};
