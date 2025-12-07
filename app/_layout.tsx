import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SocketProvider } from '@/components/SocketContext';
import { TransactionProvider } from '@/components/TransactionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { expoPushToken, notification } = usePushNotifications();
  
  // Optional: You can handle notification navigation here if needed
  // console.log("Token in Layout:", expoPushToken);

  return (
    <SocketProvider>
      <TransactionProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </TransactionProvider>
    </SocketProvider>
  );
}
