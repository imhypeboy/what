import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '@/components/GlassContainer';
import { TossButton } from '@/components/TossButton';
import { TossInput } from '@/components/TossInput';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { storageService } from '@/services/storageService';
import { WordSet } from '@/types';

export default function WordSetsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [wordSets, setWordSets] = useState<WordSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWordSet, setSelectedWordSet] = useState<WordSet | null>(null);
  const [showWordForm, setShowWordForm] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newPronunciation, setNewPronunciation] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // 앱 시작 시 데이터 로드
  useEffect(() => {
    loadWordSets();
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await storageService.initializeSampleData();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const loadWordSets = async () => {
    try {
      setLoading(true);
      const sets = await storageService.getWordSets();
      
      // 각 단어장의 진도 계산
      const setsWithProgress = await Promise.all(
        sets.map(async (set) => {
          const progress = await storageService.calculateWordSetProgress(set.id);
          return {
            ...set,
            studiedWords: progress.studiedWords,
            correctRate: progress.correctRate,
          };
        })
      );
      
      setWordSets(setsWithProgress);
    } catch (error) {
      console.error('Error loading word sets:', error);
      Alert.alert('오류', '단어장을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWordSet = async () => {
    if (!newSetTitle.trim()) {
      Alert.alert('오류', '단어장 제목을 입력해주세요.');
      return;
    }

    try {
      const newWordSet: WordSet = {
        id: `wordset-${Date.now()}`,
        title: newSetTitle.trim(),
        description: newSetDescription.trim(),
        category: '일반',
        words: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        totalWords: 0,
        studiedWords: 0,
        correctRate: 0,
      };

      await storageService.saveWordSet(newWordSet);
      Alert.alert('성공', '새 단어장이 추가되었습니다!');
      
      setShowAddForm(false);
      setNewSetTitle('');
      setNewSetDescription('');
      
      // 목록 새로고침
      await loadWordSets();
    } catch (error) {
      console.error('Error adding word set:', error);
      Alert.alert('오류', '단어장 추가 중 오류가 발생했습니다.');
    }
  };

  const handleAddWord = async (wordSetId: string) => {
    // 간단한 프롬프트로 단어 추가 (나중에 모달로 교체 가능)
    Alert.prompt(
      '단어 추가',
      '추가할 단어를 입력하세요 (형식: 단어|뜻|예문)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: async (input) => {
            if (!input) return;
            
            const parts = input.split('|');
            if (parts.length < 2) {
              Alert.alert('오류', '올바른 형식으로 입력해주세요.\n예: apple|사과|I eat an apple');
              return;
            }

            try {
              const word: Word = {
                id: `word_${Date.now()}`,
                word: parts[0].trim(),
                meaning: parts[1].trim(),
                example: parts[2]?.trim(),
                difficulty: 'medium',
                tags: [],
                createdAt: new Date(),
                studyCount: 0,
                correctCount: 0,
              };

              await storageService.addWordToSet(wordSetId, word);
              await loadWordSets();
              Alert.alert('성공', '단어가 추가되었습니다!');
            } catch (error) {
              console.error('Error adding word:', error);
              Alert.alert('오류', '단어 추가에 실패했습니다.');
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const handleDeleteWordSet = async (wordSetId: string) => {
    Alert.alert(
      '단어장 삭제',
      '정말로 이 단어장을 삭제하시겠습니까? 모든 학습 기록이 함께 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteWordSet(wordSetId);
              Alert.alert('완료', '단어장이 삭제되었습니다.');
              await loadWordSets();
            } catch (error) {
              console.error('Error deleting word set:', error);
              Alert.alert('오류', '단어장 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const WordSetCard = ({ wordSet }: { wordSet: WordSet }) => {
    const progressPercent = wordSet.totalWords > 0 
      ? Math.round((wordSet.studiedWords / wordSet.totalWords) * 100) 
      : 0;

    return (
      <GlassContainer style={styles.wordSetCard} borderRadius="lg" intensity={40}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryTag}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {wordSet.category}
            </Text>
          </View>
          <Text style={[styles.wordCount, { color: colors.textSecondary }]}>
            {wordSet.totalWords}개
          </Text>
        </View>
        
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {wordSet.title}
        </Text>
        
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          {wordSet.description}
        </Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              학습 진도
            </Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>
              {progressPercent}%
            </Text>
          </View>
          
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={[styles.progressBar, { width: `${progressPercent}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TossButton
            title="학습하기"
            onPress={() => {
              if (wordSet.totalWords === 0) {
                Alert.alert('알림', '먼저 단어를 추가해주세요.');
                return;
              }
              Alert.alert('학습', `${wordSet.title} 학습을 시작합니다`);
            }}
            size="small"
            style={{ flex: 1 }}
            disabled={wordSet.totalWords === 0}
          />
          <TossButton
            title="삭제"
            onPress={() => handleDeleteWordSet(wordSet.id)}
            variant="ghost"
            size="small"
            style={{ flex: 1 }}
          />
        </View>
      </GlassContainer>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showAddForm && (
          <GlassContainer style={styles.addForm} borderRadius="lg">
            <Text style={[styles.formTitle, { color: colors.text }]}>
              새 단어장 만들기
            </Text>
            
            <TossInput
              label="제목"
              placeholder="단어장 제목을 입력하세요"
              value={newSetTitle}
              onChangeText={setNewSetTitle}
              variant="glass"
            />
            
            <TossInput
              label="설명"
              placeholder="단어장 설명을 입력하세요 (선택사항)"
              value={newSetDescription}
              onChangeText={setNewSetDescription}
              variant="glass"
              multiline
            />
            
            <View style={styles.formActions}>
              <TossButton
                title="취소"
                onPress={() => setShowAddForm(false)}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <TossButton
                title="만들기"
                onPress={handleAddWordSet}
                style={{ flex: 1 }}
              />
            </View>
          </GlassContainer>
        )}

        <View style={styles.wordSetsGrid}>
          {loading ? (
            <GlassContainer style={styles.loadingContainer} borderRadius="lg">
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                단어장을 불러오는 중...
              </Text>
            </GlassContainer>
          ) : wordSets.length === 0 ? (
            <GlassContainer style={styles.emptyContainer} borderRadius="lg">
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                단어장이 없습니다
              </Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                새 단어장을 만들어 학습을 시작해보세요!
              </Text>
            </GlassContainer>
          ) : (
            wordSets.map((wordSet) => (
              <WordSetCard key={wordSet.id} wordSet={wordSet} />
            ))
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingActionButton 
        onPress={() => setShowAddForm(true)} 
        iconName="plus"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  addForm: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  formTitle: {
    ...Typography.title3,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  wordSetsGrid: {
    gap: Spacing.md,
  },
  wordSetCard: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryTag: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  wordCount: {
    ...Typography.caption1,
    fontWeight: '500',
  },
  cardTitle: {
    ...Typography.title3,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    ...Typography.callout,
    marginBottom: Spacing.lg,
  },
  progressSection: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    ...Typography.footnote,
    fontWeight: '500',
  },
  progressPercent: {
    ...Typography.footnote,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.callout,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Typography.title3,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    ...Typography.callout,
    textAlign: 'center',
  },
});