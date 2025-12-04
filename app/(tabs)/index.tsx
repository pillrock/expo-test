import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TTSManager from '@/components/TTSManager';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">TTS Webhook App</ThemedText>
      </ThemedView>
      
      <View style={styles.contentContainer}>
        <ThemedText style={styles.description}>
          This app listens for webhook events from the server and converts text to speech.
        </ThemedText>
        
        <TTSManager />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  description: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});
