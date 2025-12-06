import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

export interface Transaction {
  id: string;
  time: string;
  amount: number;
  content: string;
  gateway?: string;
  isRead: boolean;
}

interface TransactionContextType {
  transactions: Transaction[];
  lastTransaction: Transaction | null;
  markAsRead: (id: string) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadTransactions();
    checkDailyReset();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTransaction = async (data: any) => {
      console.log('Received transaction data:', data);
      
      try {
         const storedCode = await AsyncStorage.getItem('client_code');
         
         // 1. Verify Strictly
         if (!storedCode || !data.clientCode || data.clientCode !== storedCode) {
             console.log(`Ignored transaction. Code mismatch or missing.`);
             return; 
         }

         const tx = data.transaction;
         if (!tx) return;

         // 2. Process Valid Transaction
         const newTx: Transaction = {
             id: tx.id ? tx.id.toString() : Date.now().toString(),
             time: tx.transactionDate || new Date().toISOString(),
             amount: tx.transferAmount,
             content: tx.content,
             gateway: tx.gateway || 'Banking',
             isRead: false,
         };

         setTransactions(prev => {
             // Avoid duplicates if ID exists
             if (prev.some(t => t.id === newTx.id)) return prev;
             
             const updated = [newTx, ...prev];
             saveTransactions(updated);
             return updated;
         });
         setLastTransaction(newTx);

      } catch (error) {
          console.error("Error processing transaction", error);
      }
    };

    socket.on('payment_received', handleTransaction);

    return () => {
      socket.off('payment_received', handleTransaction);
    };
  }, [socket]);

  const loadTransactions = async () => {
      try {
          const json = await AsyncStorage.getItem('transactions');
          if (json) {
              setTransactions(JSON.parse(json));
          }
      } catch (e) { console.error(e); }
  };

  const saveTransactions = async (txs: Transaction[]) => {
      try {
          await AsyncStorage.setItem('transactions', JSON.stringify(txs));
      } catch (e) { console.error(e); }
  };

  const checkDailyReset = async () => {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('last_date');
      
      if (lastDate !== today) {
          console.log("New day, resetting transactions");
          await AsyncStorage.setItem('transactions', '[]');
          await AsyncStorage.setItem('last_date', today);
          setTransactions([]);
      }
  };


  const removeTransaction = async (id: string) => {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      await saveTransactions(updated);
  };

  const clearTransactions = async () => {
      setTransactions([]);
      await saveTransactions([]);
  };

  const markAsRead = (id: string) => {
      // Logic if we want to change UI style for read items
  };

  return (
    <TransactionContext.Provider value={{ transactions, lastTransaction, markAsRead, removeTransaction, clearTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}
