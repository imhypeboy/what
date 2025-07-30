import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  Alert,
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

interface StudyScreenProps {
  onComplete?: () => void;
}

export default function StudyScreen({ onComplete }: StudyScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<'flashcard' | 'quiz' | null>('flashcard'); // 바로 플래시카드 시작
  const [showMeaning, setShowMeaning] = useState(false);
  const [wordSets, setWordSets] = useState<WordSet[]>([]);
  const [selectedWordSet, setSelectedWordSet] = useState<WordSet | null>(null);
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

  // 앱 시작 시 데이터 로드 및 자동 시작
  useEffect(() => {
    loadWordSets();
  }, []);

  // 데이터 로드 후 자동으로 학습 시작
  useEffect(() => {
    if (!loading && selectedWordSet && studyWords.length > 0) {
      startStudySession(selectedWordSet.id);
    }
  }, [loading, selectedWordSet, studyWords]);

  const loadWordSets = async () => {
    try {
      const sets = await storageService.getWordSets();
      setWordSets(sets);
      if (sets.length > 0) {
        setSelectedWordSet(sets[0]);
        setStudyWords(sets[0].words);
      }
    } catch (error) {
      // 모든 console.error, console.log 등 디버깅 코드 제거
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
      // 학습 통계 저장
      const today = new Date().toISOString().split('T')[0];
      const prevStats = await storageService.getTodayStats();
      const newStats = {
        id: prevStats?.id || `stats_${today}`,
        date: today,
        wordsLearned: (prevStats?.wordsLearned || 0) + studyWords.length,
        studyTime: (prevStats?.studyTime || 0) + (updatedSession.duration ? Math.round(updatedSession.duration / 60) : 1),
        sessionsCompleted: (prevStats?.sessionsCompleted || 0) + 1,
        averageAccuracy: updatedSession.accuracy,
        streak: (prevStats?.streak || 0) + 1,
      };
      await storageService.saveStudyStats(newStats);
    }
    setCurrentSession(null);
    setStudyMode(null);
    setCurrentIndex(0);
    if (onComplete) onComplete();
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
      endStudySession(); // 마지막 단어 학습 시 바로 세션 종료 및 홈 전환
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



  // 단어가 있으면 플래시카드 화면, 없으면 안내 화면
  if (studyWords.length === 0 || !currentWord) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <GlassContainer style={styles.welcomeCard} borderRadius="xl">
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              학습할 단어가 없습니다
            </Text>
            <Text style={[styles.welcomeDescription, { color: colors.textSecondary }]}>
              단어장에서 단어를 추가한 후 학습을 시작해보세요
            </Text>
            <TossButton
              title="단어장으로 이동"
              onPress={() => {
                Alert.alert('안내', '단어장 탭에서 단어를 추가해주세요!');
              }}
              style={{ marginTop: Spacing.lg }}
            />
          </GlassContainer>

          <GlassContainer style={styles.statsCard} borderRadius="lg">
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              오늘의 학습 현황
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>학습한 단어</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.gradients.success[0] }]}>0%</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>정답률</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.gradients.warning[0] }]}>0분</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>학습 시간</Text>
              </View>
            </View>
          </GlassContainer>
        </View>
      </View>
    );
  }

  // 플래시카드 학습 화면 (Modal 제거, 일반 화면으로)
  return (
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
            {currentIndex + 1} / {studyWords.length}
          </Text>
        </View>

        {/* 카드 컨테이너 */}
        <View style={styles.cardContainer}>
          <SwipeableWordCard
            key={currentWord.id}
            word={currentWord}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        </View>

        {/* 하단 컨트롤 - 스와이프 대신 버튼으로도 제어 가능 */}
        <View style={styles.studyControls}>
          <GlassContainer style={styles.helpContainer} borderRadius="md" intensity={60}>
            <Text style={[styles.helpText, { color: 'rgba(255,255,255,0.8)' }]}>
              💡 카드를 탭하여 뜻을 확인하고, 좌우로 스와이프하세요
            </Text>
          </GlassContainer>
          
          {/* 스와이프 버튼 (웹 호환성) */}
          <View style={styles.swipeButtons}>
            <TossButton
              title="⬅️ 다시 암기"
              onPress={handleSwipeLeft}
              variant="ghost"
              size="small"
              style={styles.swipeButton}
            />
            <TossButton
              title="이해했어요 ➡️"
              onPress={handleSwipeRight}
              variant="primary"
              size="small"
              style={styles.swipeButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
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
  emptyEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
    textAlign: 'center',
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
    gap: Spacing.md,
  },
  swipeButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  swipeButton: {
    flex: 1,
  },
});