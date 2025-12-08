import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

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
  clientCode: string | null;
  updateClientCode: (code: string) => Promise<void>;
  markAsRead: (id: string) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
    null
  );
  const [clientCode, setClientCode] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadTransactions();
    loadClientCode();
    checkDailyReset();
  }, []);

  const loadClientCode = async () => {
    try {
      const stored = await AsyncStorage.getItem("client_code");
      if (stored) setClientCode(stored);
    } catch (e) {
      console.error("Failed to load client code", e);
    }
  };

  const updateClientCode = async (code: string) => {
    try {
      await AsyncStorage.setItem("client_code", code);
      setClientCode(code);
    } catch (e) {
      console.error("Failed to update client code", e);
      throw e;
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleTransaction = async (data: any) => {
      console.log("Received transaction data:", data);

      try {
        // Use state clientCode instead of reading from storage every time (though storage is source of truth, state is faster/synced)
        // However, inside this callback, clientCode might be stale closure if not careful.
        // Better to read Ref or just read AsyncStorage to be safe, OR put clientCode in dependency array?
        // If we put clientCode in dependency array, we re-subscribe socket listener every time code changes. That works.
        const storedCode = await AsyncStorage.getItem("client_code");

        // 1. Layer 1: Verify Client Code (Primary Check)
        if (!storedCode || !data.clientCode || data.clientCode !== storedCode) {
          console.log(`Ignored transaction. Code mismatch or missing.`);
          console.log(
            `Stored code: ${storedCode}, Data code: ${data.clientCode}`
          );

          return;
        }

        const tx = data.transaction;
        if (!tx) return;

        // 2. Layer 2: Verify Content Code (Secondary Check)
        // Logic: Extract number after "CH", divide by 365, compare with storedCode
        const content = tx.content || "";
        const chMatch = content.match(/CH(\d+)/i); // Case insensitive match for CH

        if (!chMatch) {
          console.log(
            "Ignored transaction. No 'CH' verification code found in content."
          );
          console.log(`Content: ${content}`);
          const newTx: Transaction = {
            id: tx.id ? tx.id.toString() : Date.now().toString(),
            time: tx.transactionDate || new Date().toISOString(),
            amount: tx.transferAmount,
            content: tx.content,
            gateway: tx.gateway || "Banking",
            isRead: false,
          };

          setTransactions((prev) => {
            // Avoid duplicates if ID exists
            if (prev.some((t) => t.id === newTx.id)) return prev;

            const updated = [newTx, ...prev];
            saveTransactions(updated);
            return updated;
          });
          setLastTransaction(newTx);
          return;
        }

        const contentCodeVal = parseInt(chMatch[1], 10);
        const clientCodeVal = parseInt(storedCode, 10);

        // Check if division results in the client code
        // We use Math.abs < 1 for float safety, though integer arithmetic is expected
        if (Math.abs(contentCodeVal / 365 - clientCodeVal) > 0.1) {
          console.log(
            `Ignored transaction. Secondary verification failed. ContentCode: ${contentCodeVal}, Expected: ${
              clientCodeVal * 365
            }`
          );
          return;
        }

        // 3. Process Valid Transaction
        const newTx: Transaction = {
          id: tx.id ? tx.id.toString() : Date.now().toString(),
          time: tx.transactionDate || new Date().toISOString(),
          amount: tx.transferAmount,
          content: tx.content,
          gateway: tx.gateway || "Banking",
          isRead: false,
        };

        setTransactions((prev) => {
          // Avoid duplicates if ID exists
          if (prev.some((t) => t.id === newTx.id)) return prev;

          const updated = [newTx, ...prev];
          saveTransactions(updated);
          return updated;
        });
        setLastTransaction(newTx);
      } catch (error) {
        console.error("Error processing transaction", error);
      }
    };

    socket.on("payment_received", handleTransaction);

    return () => {
      socket.off("payment_received", handleTransaction);
    };
  }, [socket]); // Keeping socket as dependency. handleTransaction reads AsyncStorage so closure staleness of state `clientCode` isn't an issue.

  const loadTransactions = async () => {
    try {
      const json = await AsyncStorage.getItem("transactions");
      if (json) {
        setTransactions(JSON.parse(json));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveTransactions = async (txs: Transaction[]) => {
    try {
      await AsyncStorage.setItem("transactions", JSON.stringify(txs));
    } catch (e) {
      console.error(e);
    }
  };

  const checkDailyReset = async () => {
    const today = new Date().toDateString();
    const lastDate = await AsyncStorage.getItem("last_date");

    if (lastDate !== today) {
      console.log("New day, resetting transactions");
      await AsyncStorage.setItem("transactions", "[]");
      await AsyncStorage.setItem("last_date", today);
      setTransactions([]);
    }
  };

  const removeTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
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
    <TransactionContext.Provider
      value={{
        transactions,
        lastTransaction,
        clientCode,
        updateClientCode,
        markAsRead,
        removeTransaction,
        clearTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
}
