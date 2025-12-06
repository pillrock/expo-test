import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import io, { Socket } from 'socket.io-client';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  connect: (url: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const connect = (url: string) => {
    if (socket) {
      socket.disconnect();
    }

    setConnectionStatus('connecting');

    try {
      const newSocket = io(url);

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnectionStatus('connected');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnectionStatus('disconnected');
      });

      newSocket.on('connect_error', (err) => {
        console.log('Socket connection error', err);
        setConnectionStatus('error');
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Socket creation error", error);
      setConnectionStatus('error');
      Alert.alert('Lỗi', 'URL không hợp lệ');
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected: connectionStatus === 'connected', 
      connectionStatus,
      connect, 
      disconnect 
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
