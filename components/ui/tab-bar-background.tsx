import { View } from 'react-native';

// This is a overflow-safe, simple background for the tab bar.
// On iOS, you can optionally use expo-blur for a blur effect.
export default function TabBarBackground() {
  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}
