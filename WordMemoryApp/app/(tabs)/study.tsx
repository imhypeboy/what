import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '@/components/GlassContainer';
import { TossButton } from '@/components/TossButton';
import { WordCard } from '@/components/WordCard';
import { Colors, Typography, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Word {
  id: string;
  word: string;
  meaning: string;
  example?: string;
}

// 임시 데이터
const mockWords: Word[] = [
  {
    id: '1',
    word: 'Appreciate',
    meaning: '감사하다, 인정하다',
    example: 'I appreciate your help.',
  },
  {
    id: '2',
    word: 'Collaborate',
    meaning: '협력하다, 공동 작업하다',
    example: 'We need to collaborate on this project.',
  },
  {
    id: '3',
    word: 'Demonstrate',
    meaning: '증명하다, 보여주다',
    example: 'Can you demonstrate how to use this?',
  },
  {
    id: '4',
    word: 'Elaborate',
    meaning: '자세히 설명하다',
    example: 'Could you elaborate on that point?',
  },
  {
    id: '5',
    word: 'Facilitate',
    meaning: '촉진하다, 쉽게 하다',
    example: 'This tool will facilitate our work.',
  },
];

export default function StudyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<'flashcard' | 'quiz' | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);

  const currentWord = mockWords[currentIndex];

  const handleNext = () => {
    if (currentIndex < mockWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
    } else {
      Alert.alert('완료', '모든 단어를 학습했습니다!', [
        { text: '다시 시작', onPress: () => setCurrentIndex(0) },
        { text: '종료', onPress: () => setStudyMode(null) }
      ]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowMeaning(false);
    }
  };

  const handleFlipCard = () => {
    setShowMeaning(!showMeaning);
  };

  const startFlashcardMode = () => {
    setStudyMode('flashcard');
    setCurrentIndex(0);
    setShowMeaning(false);
  };

  const startQuizMode = () => {
    Alert.alert('준비 중', '퀴즈 모드는 곧 추가됩니다!');
  };

  if (studyMode === 'flashcard') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TossButton
              title="← 뒤로"
              onPress={() => setStudyMode(null)}
              variant="ghost"
              size="small"
            />
            <Text style={[styles.progress, { color: colors.text }]}>
              {currentIndex + 1} / {mockWords.length}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.cardContainer}>
          <WordCard
            word={currentWord.word}
            meaning={currentWord.meaning}
            showMeaning={showMeaning}
          />
        </View>

        <View style={styles.controls}>
          <View style={styles.navigationButtons}>
            <TossButton
              title="이전"
              onPress={handlePrevious}
              variant="ghost"
              disabled={currentIndex === 0}
              style={{ flex: 1 }}
            />
            <TossButton
              title="다음"
              onPress={handleNext}
              style={{ flex: 1 }}
            />
          </View>
          
          <GlassContainer style={styles.helpContainer} borderRadius="md">
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              💡 카드를 탭하여 뜻을 확인하세요
            </Text>
          </GlassContainer>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>학습하기</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <GlassContainer style={styles.welcomeCard} borderRadius="xl">
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            어떤 방식으로 학습하시겠어요?
          </Text>
          <Text style={[styles.welcomeDescription, { color: colors.textSecondary }]}>
            학습 방법을 선택해주세요
          </Text>
        </GlassContainer>

        <View style={styles.modeGrid}>
          <GlassContainer style={styles.modeCard} borderRadius="lg">
            <View style={styles.modeIcon}>
              <Text style={styles.modeEmoji}>📚</Text>
            </View>
            <Text style={[styles.modeTitle, { color: colors.text }]}>
              플래시카드
            </Text>
            <Text style={[styles.modeDescription, { color: colors.textSecondary }]}>
              단어와 뜻을 번갈아 보며 암기하세요
            </Text>
            <TossButton
              title="시작하기"
              onPress={startFlashcardMode}
              size="small"
              style={{ marginTop: Spacing.md }}
            />
          </GlassContainer>

          <GlassContainer style={styles.modeCard} borderRadius="lg">
            <View style={styles.modeIcon}>
              <Text style={styles.modeEmoji}>🧠</Text>
            </View>
            <Text style={[styles.modeTitle, { color: colors.text }]}>
              퀴즈 모드
            </Text>
            <Text style={[styles.modeDescription, { color: colors.textSecondary }]}>
              문제를 풀며 실력을 확인해보세요
            </Text>
            <TossButton
              title="시작하기"
              onPress={startQuizMode}
              size="small"
              variant="secondary"
              style={{ marginTop: Spacing.md }}
            />
          </GlassContainer>
        </View>

        <GlassContainer style={styles.statsCard} borderRadius="lg">
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            오늘의 학습 현황
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>12</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>학습한 단어</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.gradients.success[0] }]}>8</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>정답률</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.gradients.warning[0] }]}>15분</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>학습 시간</Text>
            </View>
          </View>
        </GlassContainer>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    fontWeight: '700',
  },
  progress: {
    ...Typography.headline,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    paddingVertical: Spacing.lg,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  helpContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  helpText: {
    ...Typography.footnote,
    textAlign: 'center',
  },
  welcomeCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.title2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  welcomeDescription: {
    ...Typography.callout,
    textAlign: 'center',
  },
  modeGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modeCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  modeIcon: {
    marginBottom: Spacing.md,
  },
  modeEmoji: {
    fontSize: 40,
  },
  modeTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  modeDescription: {
    ...Typography.footnote,
    textAlign: 'center',
  },
  statsCard: {
    padding: Spacing.lg,
  },
  statsTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.title1,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.caption1,
    marginTop: Spacing.xs / 2,
  },
});