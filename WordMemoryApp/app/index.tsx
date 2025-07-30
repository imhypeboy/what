import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Colors } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

// 각 탭의 컨텐츠 컴포넌트들을 import
import WordSetsScreen from './(tabs)/index';
import StudyScreen from './(tabs)/study';
import TestScreen from './(tabs)/test';
import ProgressScreen from './(tabs)/progress';

const segments = ['단어장', '학습', '시험', '진도'];

export default function MainScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <WordSetsScreen isDarkMode={true} />;
      case 1:
        return <StudyScreen />;
      case 2:
        return <TestScreen />;
      case 3:
        return <ProgressScreen />;
      default:
        return <WordSetsScreen isDarkMode={true} />;
    }
  };

  // 단어장 탭일 때 다크 배경 적용
  const isDarkMode = selectedIndex === 0;
  const backgroundColor = isDarkMode ? '#1a1a1a' : colors.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* 상단 세그먼트 컨트롤 */}
      <SegmentedControl
        segments={segments}
        selectedIndex={selectedIndex}
        onIndexChange={setSelectedIndex}
      />
      
      {/* 선택된 탭의 컨텐츠 */}
      <View style={[styles.content, { backgroundColor }]}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});