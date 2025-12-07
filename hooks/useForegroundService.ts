import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import io from 'socket.io-client';

export const useForegroundService = () => {
  const [isServiceRunning, setIsServiceRunning] = useState(false);

  useEffect(() => {
    // Listen for stop events (e.g. from notification button)
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === 3 && detail.pressAction?.id === 'stop') { // ACTION_PRESS
        stopForegroundService();
      }
    });
    return unsubscribe;
  }, []);

  const startForegroundService = async () => {
    if (Platform.OS !== 'android') {
      alert('Foreground Service is only supported on Android.');
      return;
    }

    try {
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
      
      // 3. Connect Socket within this context (or ensure existing socket stays alive)
      // Note: We create a separate socket connection here to ensure it's dedicated to the background service lifecycle
      await connectBackgroundSocket();

    } catch (error) {
      console.error('Failed to start foreground service:', error);
    }
  };

  const stopForegroundService = async () => {
    try {
      await notifee.stopForegroundService();
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

        const socket = io(serverUrl, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('Background Socket connected!');
            Speech.speak('Đã kết nối máy chủ');
        });

        socket.on('payment_received', async (data) => {
             console.log('Background Payment Received:', data);
             // Basic verification if needed, or just speak
             // If we really want to duplicate logic from TransactionContext:
             const storedCode = await AsyncStorage.getItem('client_code');
             if (storedCode && data.clientCode && data.clientCode === storedCode) {
                 const text = data.text || `Nhận ${data.transaction.transferAmount} đồng`;
                 Speech.speak(text, { language: 'vi-VN' });
             } else {
                 console.log("Background: Code mismatch or missing, ignoring.");
             }
        });

        socket.on('disconnect', () => {
            console.log('Background Socket disconnected');
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
