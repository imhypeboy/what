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

const segments = [
  { id: 'words', label: '단어장', icon: '📚' },
  { id: 'study', label: '학습', icon: '🎯' },
  { id: 'test', label: '시험', icon: '📝' },
  { id: 'progress', label: '진도', icon: '📊' }
];

export default function MainScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <WordSetsScreen 
          isDarkMode={false} 
          onStartStudy={() => setSelectedIndex(1)} // 학습 화면으로 이동
        />;
      case 1:
        return <StudyScreen onComplete={() => setSelectedIndex(0)} />;
      case 2:
        return <TestScreen />;
      case 3:
        return <ProgressScreen />;
      default:
        return <WordSetsScreen 
          isDarkMode={false} 
          onStartStudy={() => setSelectedIndex(1)} // 학습 화면으로 이동
        />;
    }
  };

  // 모든 탭에서 밝은 배경 사용
  const backgroundColor = colors.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="dark" />
      
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