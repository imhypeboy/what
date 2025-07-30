import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { GlassContainer } from '@/components/GlassContainer';
import { TossButton } from '@/components/TossButton';
import { SwipeableWordCard } from '@/components/SwipeableWordCard';
import { Colors, Typography, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { storageService } from '@/services/storageService';
import { Word, WordSet, StudySession, StudyResult } from '@/types';

export default function StudyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<'flashcard' | 'quiz' | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [wordSets, setWordSets] = useState<WordSet[]>([]);
  const [selectedWordSet, setSelectedWordSet] = useState<WordSet | null>(null);
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

  // 앱 시작 시 데이터 로드
  useEffect(() => {
    loadWordSets();
  }, []);

  const loadWordSets = async () => {
    try {
      const sets = await storageService.getWordSets();
      setWordSets(sets);
      if (sets.length > 0) {
        setSelectedWordSet(sets[0]);
        setStudyWords(sets[0].words);
      }
    } catch (error) {
      console.error('Error loading word sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentWord = studyWords.length > 0 ? studyWords[currentIndex] : null;

  const startStudySession = async (wordSetId: string) => {
    if (studyWords.length === 0) {
      Alert.alert('알림', '학습할 단어가 없습니다.\n먼저 단어장에 단어를 추가해주세요.');
      return;
    }
    
    const session: StudySession = {
      id: `session_${Date.now()}`,
      wordSetId,
      mode: 'flashcard',
      startTime: new Date(),
      wordsStudied: 0,
      correctAnswers: 0,
      totalQuestions: studyWords.length,
      accuracy: 0,
    };
    
    await storageService.saveStudySession(session);
    setCurrentSession(session);
    setStudyMode('flashcard');
  };

  const endStudySession = async () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
        duration: Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000),
        accuracy: currentSession.totalQuestions > 0 ? (currentSession.correctAnswers / currentSession.totalQuestions) * 100 : 0,
      };
      
      await storageService.saveStudySession(updatedSession);
    }
    setCurrentSession(null);
    setStudyMode(null);
    setCurrentIndex(0);
  };

  const updateWordProgress = async (word: Word, isCorrect: boolean) => {
    const updatedWord = {
      ...word,
      studyCount: word.studyCount + 1,
      correctCount: isCorrect ? word.correctCount + 1 : word.correctCount,
      lastStudied: new Date(),
    };
    
    if (selectedWordSet) {
      await storageService.addWordToSet(selectedWordSet.id, updatedWord);
      
      // 로컬 상태 업데이트
      const updatedWords = studyWords.map(w => w.id === word.id ? updatedWord : w);
      setStudyWords(updatedWords);
    }
  };

  const handleNext = () => {
    if (currentIndex < studyWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
    } else {
      Alert.alert('완료', '모든 단어를 학습했습니다!', [
        { text: '다시 시작', onPress: () => setCurrentIndex(0) },
        { text: '종료', onPress: endStudySession }
      ]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowMeaning(false);
    }
  };

  const handleSwipeLeft = useCallback(async () => {
    if (!currentWord || !currentSession) return;
    
    // 다시 암기 - 틀린 것으로 처리
    await updateWordProgress(currentWord, false);
    
    // 세션 업데이트
    const updatedSession = {
      ...currentSession,
      wordsStudied: currentSession.wordsStudied + 1,
    };
    setCurrentSession(updatedSession);
    
    handleNext();
  }, [currentWord, currentSession]);

  const handleSwipeRight = useCallback(async () => {
    if (!currentWord || !currentSession) return;
    
    // 암기 완료 - 맞은 것으로 처리
    await updateWordProgress(currentWord, true);
    
    // 세션 업데이트
    const updatedSession = {
      ...currentSession,
      wordsStudied: currentSession.wordsStudied + 1,
      correctAnswers: currentSession.correctAnswers + 1,
    };
    setCurrentSession(updatedSession);
    
    handleNext();
  }, [currentWord, currentSession]);

  const startFlashcardMode = () => {
    if (studyWords.length === 0) {
      Alert.alert('알림', '학습할 단어가 없습니다.\n먼저 단어장에 단어를 추가해주세요.');
      return;
    }
    setStudyMode('flashcard');
    setCurrentIndex(0);
    setShowMeaning(false);
  };

  const startQuizMode = () => {
    Alert.alert('준비 중', '퀴즈 모드는 곧 추가됩니다!');
  };

  const StudyModal = () => (
    <Modal
      visible={studyMode === 'flashcard'}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.studyModalContainer}>
        {/* 블러 배경 */}
        <BlurView intensity={8} tint="dark" style={StyleSheet.absoluteFillObject} />
        
        {/* 어두운 오버레이 */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.2)' }]} />
        
        <SafeAreaView style={styles.studyContent}>
          {/* 헤더 */}
          <View style={styles.studyHeader}>
            <TossButton
              title="← 뒤로"
              onPress={() => setStudyMode(null)}
              variant="ghost"
              size="small"
            />
            <Text style={[styles.progress, { color: '#FFFFFF' }]}>
              {studyWords.length > 0 ? currentIndex + 1 : 0} / {studyWords.length}
            </Text>
          </View>

          {/* 카드 컨테이너 */}
          <View style={styles.cardContainer}>
            {currentWord ? (
              <SwipeableWordCard
                key={currentWord.id}
                word={currentWord}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            ) : (
              <View style={styles.noWordContainer}>
                <Text style={[styles.noWordText, { color: 'rgba(255,255,255,0.8)' }]}>
                  학습할 단어가 없습니다
                </Text>
                <Text style={[styles.noWordSubText, { color: 'rgba(255,255,255,0.6)' }]}>
                  단어장에 단어를 추가해주세요
                </Text>
              </View>
            )}
          </View>

          {/* 하단 컨트롤 */}
          <View style={styles.studyControls}>
            <GlassContainer style={styles.helpContainer} borderRadius="md" intensity={60}>
              <Text style={[styles.helpText, { color: 'rgba(255,255,255,0.8)' }]}>
                💡 카드를 탭하여 뜻을 확인하고, 좌우로 스와이프하세요
              </Text>
            </GlassContainer>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
      </View>
      
      <StudyModal />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  progress: {
    ...Typography.headline,
    fontWeight: '600',
  },
  sessionProgress: {
    ...Typography.callout,
    marginTop: Spacing.xs,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  controlButton: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
  wordSetSelector: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  selectorTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  wordSetButtons: {
    gap: Spacing.sm,
  },
  wordSetButton: {
    marginBottom: Spacing.xs,
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
  noWordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  noWordText: {
    ...Typography.title2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  noWordSubText: {
    ...Typography.body,
    textAlign: 'center',
  },
  // Study Modal Styles
  studyModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  studyContent: {
    flex: 1,
  },
  studyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  studyControls: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});