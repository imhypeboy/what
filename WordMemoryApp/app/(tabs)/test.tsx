import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '@/components/GlassContainer';
import { TossButton } from '@/components/TossButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { storageService } from '@/services/storageService';
import { Word } from '@/types';

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TestResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export default function TestScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [testMode, setTestMode] = useState<'select' | 'taking' | 'result' | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5분
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // 퀴즈 문제 생성
    const generateQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const wordSets = await storageService.getWordSets();
        const allWords: Word[] = wordSets.flatMap(ws => ws.words);
        if (allWords.length < 4) {
          setError('퀴즈를 시작하려면 최소 4개의 단어가 필요합니다.');
          setQuestions([]);
          setLoading(false);
          return;
        }
        // 랜덤 셔플
        const shuffled = [...allWords].sort(() => Math.random() - 0.5);
        // 최대 10문제
        const numQuestions = Math.min(10, shuffled.length);
        const questions: TestQuestion[] = [];
        for (let i = 0; i < numQuestions; i++) {
          const answerWord = shuffled[i];
          // 오답 후보
          const wrongWords = shuffled.filter(w => w.id !== answerWord.id).slice(0, 3);
          // 정답 위치 랜덤
          const correctIdx = Math.floor(Math.random() * 4);
          const options = [...wrongWords.map(w => w.meaning)];
          options.splice(correctIdx, 0, answerWord.meaning);
          questions.push({
            id: answerWord.id,
            question: `${answerWord.word}의 의미는?`,
            options,
            correctAnswer: correctIdx,
            explanation: answerWord.example || '',
          });
        }
        setQuestions(questions);
      } catch (e) {
        setError('문제 생성 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    generateQuestions();
  }, []);

  const startTest = (type: 'quick' | 'full') => {
    setTestMode('taking');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTestResults([]);
    setTimeLeft(type === 'quick' ? 180 : 600); // 3분 또는 10분
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('답안 선택', '답안을 선택해주세요.');
      return;
    }

    const result: TestResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
    };

    const newResults = [...testResults, result];
    setTestResults(newResults);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setTestMode('result');
    }
  };

  const calculateScore = () => {
    const correctCount = testResults.filter(r => r.isCorrect).length;
    return Math.round((correctCount / testResults.length) * 100);
  };

  if (testMode === 'taking') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={styles.headerGradient}
        >
          <View style={styles.testHeader}>
            <TossButton
              title="← 종료"
              onPress={() => setTestMode(null)}
              variant="ghost"
              size="small"
            />
            <Text style={[styles.progress, { color: colors.text }]}>
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
            <Text style={[styles.timer, { color: colors.gradients.warning[0] }]}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <GlassContainer style={styles.questionCard} borderRadius="xl">
            <Text style={[styles.questionNumber, { color: colors.textSecondary }]}>
              문제 {currentQuestionIndex + 1}
            </Text>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {currentQuestion.question}
            </Text>
          </GlassContainer>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <GlassContainer
                key={index}
                style={[
                  styles.optionCard,
                  selectedAnswer === index && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  }
                ]}
                borderRadius="lg"
              >
                <TossButton
                  title={`${String.fromCharCode(65 + index)}. ${option}`}
                  onPress={() => handleAnswerSelect(index)}
                  variant={selectedAnswer === index ? 'primary' : 'ghost'}
                  size="large"
                  fullWidth
                  style={{ justifyContent: 'flex-start' }}
                />
              </GlassContainer>
            ))}
          </View>
        </ScrollView>

        <View style={styles.testControls}>
          <TossButton
            title={currentQuestionIndex === questions.length - 1 ? '완료' : '다음'}
            onPress={handleNextQuestion}
            size="large"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  if (testMode === 'result') {
    const score = calculateScore();
    const correctCount = testResults.filter(r => r.isCorrect).length;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.content}>
          <GlassContainer style={styles.resultCard} borderRadius="xl">
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              시험 완료!
            </Text>
            <Text style={[styles.scoreText, { color: colors.primary }]}>
              {score}점
            </Text>
            <Text style={[styles.resultSummary, { color: colors.textSecondary }]}>
              {correctCount}개 문제를 맞혔습니다. ({testResults.length}문제 중)
            </Text>
          </GlassContainer>

          <View style={styles.resultDetails}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              상세 결과
            </Text>
            
            {questions.map((question, index) => {
              const result = testResults[index];
              return (
                <GlassContainer key={question.id} style={styles.resultItem} borderRadius="lg">
                  <View style={styles.resultItemHeader}>
                    <Text style={[styles.resultQuestionNumber, { color: colors.textSecondary }]}>
                      문제 {index + 1}
                    </Text>
                    <Text style={[
                      styles.resultStatus,
                      { color: result.isCorrect ? colors.gradients.success[0] : colors.gradients.error[0] }
                    ]}>
                      {result.isCorrect ? '정답' : '오답'}
                    </Text>
                  </View>
                  <Text style={[styles.resultQuestionText, { color: colors.text }]}>
                    {question.question}
                  </Text>
                  <Text style={[styles.resultExplanation, { color: colors.textSecondary }]}>
                    {question.explanation}
                  </Text>
                </GlassContainer>
              );
            })}
          </View>

          <View style={styles.resultActions}>
            <TossButton
              title="다시 시험보기"
              onPress={() => startTest('quick')}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <TossButton
              title="메인으로"
              onPress={() => setTestMode(null)}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <GlassContainer style={styles.welcomeCard} borderRadius="xl">
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            실력을 확인해보세요!
          </Text>
          <Text style={[styles.welcomeDescription, { color: colors.textSecondary }]}>
            학습한 내용을 바탕으로 시험을 진행합니다
          </Text>
        </GlassContainer>

        <View style={styles.testGrid}>
          <GlassContainer style={styles.testCard} borderRadius="lg">
            <View style={styles.testIcon}>
              <Text style={styles.testEmoji}>⚡</Text>
            </View>
            <Text style={[styles.testTitle, { color: colors.text }]}>
              빠른 시험
            </Text>
            <Text style={[styles.testDescription, { color: colors.textSecondary }]}>
              3분 / 10문제
            </Text>
            <Text style={[styles.testSubDescription, { color: colors.textTertiary }]}>
              기본 실력을 빠르게 확인해보세요
            </Text>
            <TossButton
              title="시작하기"
              onPress={() => startTest('quick')}
              size="small"
              style={{ marginTop: Spacing.md }}
            />
          </GlassContainer>

          <GlassContainer style={styles.testCard} borderRadius="lg">
            <View style={styles.testIcon}>
              <Text style={styles.testEmoji}>🎯</Text>
            </View>
            <Text style={[styles.testTitle, { color: colors.text }]}>
              완전 시험
            </Text>
            <Text style={[styles.testDescription, { color: colors.textSecondary }]}>
              10분 / 30문제
            </Text>
            <Text style={[styles.testSubDescription, { color: colors.textTertiary }]}>
              종합적인 실력을 측정해보세요
            </Text>
            <TossButton
              title="시작하기"
              onPress={() => startTest('full')}
              size="small"
              variant="secondary"
              style={{ marginTop: Spacing.md }}
            />
          </GlassContainer>
        </View>

        <GlassContainer style={styles.recentResults} borderRadius="lg">
          <Text style={[styles.recentTitle, { color: colors.text }]}>
            최근 시험 결과
          </Text>
          <View style={styles.resultsList}>
            <View style={styles.recentResultItem}>
              <Text style={[styles.recentDate, { color: colors.textSecondary }]}>2024.01.20</Text>
              <Text style={[styles.recentScore, { color: colors.primary }]}>85점</Text>
              <Text style={[styles.recentType, { color: colors.textTertiary }]}>빠른 시험</Text>
            </View>
            <View style={styles.recentResultItem}>
              <Text style={[styles.recentDate, { color: colors.textSecondary }]}>2024.01.19</Text>
              <Text style={[styles.recentScore, { color: colors.gradients.success[0] }]}>92점</Text>
              <Text style={[styles.recentType, { color: colors.textTertiary }]}>완전 시험</Text>
            </View>
          </View>
        </GlassContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  progress: {
    ...Typography.headline,
    fontWeight: '600',
  },
  timer: {
    ...Typography.headline,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
  testGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  testCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  testIcon: {
    marginBottom: Spacing.md,
  },
  testEmoji: {
    fontSize: 40,
  },
  testTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  testDescription: {
    ...Typography.callout,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  testSubDescription: {
    ...Typography.caption1,
    textAlign: 'center',
  },
  questionCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  questionNumber: {
    ...Typography.caption1,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  questionText: {
    ...Typography.title2,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionCard: {
    overflow: 'hidden',
  },
  testControls: {
    padding: Spacing.lg,
  },
  resultCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    ...Typography.title1,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  scoreText: {
    ...Typography.largeTitle,
    fontWeight: '700',
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  resultSummary: {
    ...Typography.callout,
    textAlign: 'center',
  },
  resultDetails: {
    marginBottom: Spacing.lg,
  },
  detailsTitle: {
    ...Typography.title3,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  resultItem: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  resultItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  resultQuestionNumber: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  resultStatus: {
    ...Typography.caption1,
    fontWeight: '700',
  },
  resultQuestionText: {
    ...Typography.callout,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  resultExplanation: {
    ...Typography.footnote,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  recentResults: {
    padding: Spacing.lg,
  },
  recentTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  resultsList: {
    gap: Spacing.sm,
  },
  recentResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  recentDate: {
    ...Typography.callout,
    flex: 1,
  },
  recentScore: {
    ...Typography.callout,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  recentType: {
    ...Typography.callout,
    flex: 1,
    textAlign: 'right',
  },
});