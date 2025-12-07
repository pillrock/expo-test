import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

export function CodeGenerator() {
  const [code, setCode] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowCode, setIsShowCode] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    loadCode();
  }, []);

  const loadCode = async () => {
    try {
      const storedCode = await AsyncStorage.getItem('client_code');
      if (storedCode) {
        setCode(storedCode);
      }
    } catch (error) {
      console.error('Failed to load code', error);
    } finally {
        setIsLoaded(true);
    }
  };

  const handleGenerateCode = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    Alert.alert(
      'Mã Code Mới', 
      `Mã: ${randomCode}\n\nHãy cấu hình mã này trên Webhook server.\nVí dụ: "Authorization":"Apikey ${randomCode}"`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Lưu & Kích hoạt', onPress: () => saveCode(randomCode) }
      ]
    );
  };

  const handleManualSave = () => {
    if (!manualCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã code');
      return;
    }
    saveCode(manualCode.trim());
    setIsManualEntry(false);
    setManualCode('');
  };

  const handleEditCode = () => {
    if (code) {
      setManualCode(code);
      setIsManualEntry(true);
    }
  };

  const saveCode = async (newCode: string) => {
    try {
      await AsyncStorage.setItem('client_code', newCode);
      setCode(newCode);
      Alert.alert('Thành công', 'Đã lưu và kích hoạt mã code!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu mã code');
      console.error(error);
    }
  };

 
  if (!isLoaded) return null;

  return (
    <View style={styles.card}>
       <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Ionicons name="key-outline" size={20} color="#E0E0E0" style={{marginRight: 8}} />
          <ThemedText type="defaultSemiBold" style={{color: '#E0E0E0'}}>Client Key</ThemedText>
        </View>
         {code && (
             <View style={styles.statusBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#4CAF50" style={{marginRight: 4}} />
                <ThemedText style={styles.statusText}>Active</ThemedText>
            </View>
         )}
      </View>

      {code && !isManualEntry ? (
        <View>
             <View style={styles.codeRow}>
                <TouchableOpacity style={styles.codeDisplay} activeOpacity={0.7} onPress={() => {}}>
                    <ThemedText type="title" style={styles.codeText}>
                        {isShowCode ? code : '••••••'}
                    </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setIsShowCode(!isShowCode)} style={styles.iconButton}>
                    <Ionicons name={isShowCode ? "eye-off-outline" : "eye-outline"} size={22} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleEditCode} style={styles.iconButton}>
                    <Ionicons name="create-outline" size={22} color="#2196F3" />
                </TouchableOpacity>
               
             </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
            {!isManualEntry ? (
              <>
                <ThemedText style={styles.emptyText}>Chưa có mã kết nối</ThemedText>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.createButton} onPress={handleGenerateCode}>
                      <Ionicons name="add-circle-outline" size={20} color="#fff" style={{marginRight: 8}} />
                      <ThemedText style={styles.createButtonText}>Tạo mã mới</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.manualButton} onPress={() => setIsManualEntry(true)}>
                      <Ionicons name="keypad-outline" size={20} color="#fff" style={{marginRight: 8}} />
                      <ThemedText style={styles.manualButtonText}>Nhập mã</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.manualInputContainer}>
                 <ThemedText style={styles.emptyText}>{code ? 'Chỉnh sửa mã kết nối' : 'Nhập mã kết nối của bạn'}</ThemedText>
                 <TextInput
                    style={styles.input}
                    value={manualCode}
                    onChangeText={setManualCode}
                    placeholder="Nhập mã code..."
                    placeholderTextColor="#666"
                    keyboardType="default"
                    autoCapitalize="none"
                 />
                 <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.createButton, {backgroundColor: '#4CAF50', flex: 1, marginRight: 8}]} onPress={handleManualSave}>
                        <ThemedText style={styles.createButtonText}>Lưu</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.manualButton, {backgroundColor: '#444', flex: 1}]} onPress={() => setIsManualEntry(false)}>
                        <ThemedText style={styles.manualButtonText}>Hủy</ThemedText>
                    </TouchableOpacity>
                 </View>
              </View>
            )}
        </View>
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
    marginBottom: 16,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20', // Darker green bg
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  codeDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2C',
    padding: 16,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#444',
    marginRight: 10,
  },
  codeText: {
    letterSpacing: 4,
    color: '#FFF',
    fontSize: 24,
  },
  iconButton: {
      padding: 10,
      backgroundColor: '#2C2C2C',
      borderRadius: 10,
      marginLeft: 6,
      borderWidth: 1,
      borderColor: '#333',
      justifyContent: 'center',
      alignItems: 'center',
  },
  helperText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
      alignItems: 'center',
      paddingVertical: 10,
      width: '100%',
  },
  emptyText: {
      color: '#888',
      marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  createButton: {
      flexDirection: 'row',
      backgroundColor: '#2196F3',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#2196F3',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
  },
  createButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
  },
  manualButton: {
    flexDirection: 'row',
    backgroundColor: '#424242',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  manualButtonText: {
    color: '#E0E0E0',
    fontWeight: '600',
    fontSize: 14,
  },
  manualInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#2C2C2C',
    color: '#FFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 16,
    fontSize: 16,
  }
});
