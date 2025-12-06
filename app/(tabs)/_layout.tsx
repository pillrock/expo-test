import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import TabBarBackground from '@/components/ui/tab-bar-background';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2196F3', // Custom active color
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
             backgroundColor: '#151718',
             borderTopColor: '#333',
          },
          default: {
             backgroundColor: '#151718',
             borderTopColor: '#333',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cấu hình',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'settings' : 'settings-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Giao dịch',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'receipt' : 'receipt-outline'} color={color} />,
        }}
      />
    </Tabs>
  );
}
