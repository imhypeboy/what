import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          borderTopWidth: 0,
          paddingVertical: 8,
          height: 70,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '단어장',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 28 : 24} name="book.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: '학습',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 28 : 24} name="brain.head.profile" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: '시험',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 28 : 24} name="checkmark.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: '진도',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 28 : 24} name="chart.bar.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
