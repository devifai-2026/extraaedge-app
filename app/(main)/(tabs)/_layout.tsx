import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import AnimatedFAB from '@/components/AnimatedFAB';
import { HapticTab } from '@/components/haptic-tab';
import { Theme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Theme.colors.navigation.active,
          tabBarInactiveTintColor: Theme.colors.navigation.inactive,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: Theme.colors.navigation.background,
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            elevation: 0,
            shadowOpacity: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Ionicons size={24} name="grid-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="leads"
          options={{
            title: 'Leads',
            tabBarIcon: ({ color }) => <Ionicons size={24} name="people-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="activities"
          options={{
            title: 'Activities',
            tabBarIcon: ({ color }) => <Ionicons size={24} name="calendar-outline" color={color} />,
          }}
        />
      </Tabs>
      <AnimatedFAB />
    </View>
  );
}
