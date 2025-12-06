import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Transaction, useTransaction } from '@/components/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Alert, FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const { transactions, removeTransaction, clearTransactions } = useTransaction();

  const totalAmount = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const handleRemove = (id: string) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa giao dịch này?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => removeTransaction(id) }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Cảnh báo",
      "Bạn có chắc muốn xóa TẤT CẢ lịch sử giao dịch?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa tất cả", style: "destructive", onPress: clearTransactions }
      ]
    );
  };

  const formatTime = (timeString: string) => {
    try {
        const date = new Date(timeString);
        // Check if date is valid
        if (isNaN(date.getTime())) return timeString;
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
    } catch (e) {
        return timeString;
    }
  };

  const renderItem: ListRenderItem<Transaction> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet-outline" size={24} color="#4CAF50" />
          </View>
          <View style={styles.contentContainer}>
            <ThemedText style={styles.amount}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}
            </ThemedText>
            <ThemedText style={styles.time}>{formatTime(item.time)}</ThemedText>
            <ThemedText style={styles.description} numberOfLines={2}>
            {item.content}
            </ThemedText>
            {item.gateway && <ThemedText style={styles.gateway}>{item.gateway}</ThemedText>}
          </View>
      </View>
      
      <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.deleteButton} hitSlop={10}>
          <Ionicons name="trash-outline" size={20} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <View>
            <ThemedText type="title" style={{color: '#ECEDEE'}}>Lịch sử giao dịch</ThemedText>
            <ThemedText style={styles.subtitle}>Tổng thu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</ThemedText>
        </View>
        {transactions.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
                <Ionicons name="trash-bin-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
        )}
      </ThemedView>

      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#444" />
            <ThemedText style={styles.emptyText}>Chưa có giao dịch nào</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  clearAllButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 82, 82, 0.1)',
      borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontFamily: 'Courier', // Monospace for numbers often looks better
  },
  description: {
    fontSize: 14,
    color: '#ECEDEE',
    marginBottom: 2,
  },
  gateway: {
      fontSize: 10,
      color: '#666',
      textTransform: 'uppercase',
      fontWeight: '600',
  },
  deleteButton: {
      padding: 8,
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -60,
  },
  emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: '#666',
  }
});
