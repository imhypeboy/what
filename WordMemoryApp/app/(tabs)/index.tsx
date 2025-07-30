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
import { WordSet, Word } from '@/types';

interface WordSetsScreenProps {
  isDarkMode?: boolean;
}

export default function WordSetsScreen({ isDarkMode = false }: WordSetsScreenProps = {}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // 다크 모드 색상 오버라이드
  const screenColors = isDarkMode ? {
    ...colors,
    background: '#1a1a1a',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    glass: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.12)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    }
  } : colors;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [wordSets, setWordSets] = useState<WordSet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 단어 추가 모달 상태
  const [showWordModal, setShowWordModal] = useState(false);
  const [selectedWordSetForAdd, setSelectedWordSetForAdd] = useState<string | null>(null);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newExample, setNewExample] = useState('');

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

  const handleAddWordToFirstSet = async () => {
    if (wordSets.length === 0) {
      Alert.alert('📚 단어장이 없습니다', '먼저 단어장을 만들어주세요!', [
        { text: '취소', style: 'cancel' },
        { text: '단어장 만들기', onPress: () => setShowAddForm(true) }
      ]);
      return;
    }

    // 첫 번째 단어장에 단어 추가
    const firstWordSet = wordSets[0];
    setSelectedWordSetForAdd(firstWordSet.id);
    setShowWordModal(true);
  };

  const handleWordModalSubmit = async () => {
    if (!newWord.trim() || !newMeaning.trim() || !selectedWordSetForAdd) {
      Alert.alert('❌ 입력 오류', '단어와 뜻을 모두 입력해주세요.');
      return;
    }

    try {
      const word: Word = {
        id: `word_${Date.now()}`,
        word: newWord.trim(),
        meaning: newMeaning.trim(),
        example: newExample.trim() || undefined,
        difficulty: 'medium',
        tags: [],
        createdAt: new Date(),
        studyCount: 0,
        correctCount: 0,
      };

      await storageService.addWordToSet(selectedWordSetForAdd, word);
      await loadWordSets();
      
      // 모달 닫기 및 폼 초기화
      setShowWordModal(false);
      setSelectedWordSetForAdd(null);
      setNewWord('');
      setNewMeaning('');
      setNewExample('');
      
      Alert.alert('✅ 완료!', `"${word.word}" 단어가 추가되었습니다!`);
    } catch (error) {
      console.error('Error adding word:', error);
      Alert.alert('❌ 오류', '단어 추가에 실패했습니다.');
    }
  };

  const handleWordModalCancel = () => {
    setShowWordModal(false);
    setSelectedWordSetForAdd(null);
    setNewWord('');
    setNewMeaning('');
    setNewExample('');
  };



  const handleDeleteWordSet = async (wordSetId: string) => {
    
    try {
      await storageService.deleteWordSet(wordSetId);
      
      await loadWordSets();
      
      // 성공 알림 (간단한 alert 사용)
      alert('✅ 단어장이 삭제되었습니다!');
      
    } catch (error) {
      console.error('❌ 삭제 오류:', error);
      alert(`❌ 오류: 단어장 삭제에 실패했습니다.\n\n${error}`);
    }
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
            title="+ 단어"
            onPress={() => {
              setSelectedWordSetForAdd(wordSet.id);
              setShowWordModal(true);
            }}
            variant="primary"
            size="small"
            style={{ flex: 1 }}
          />
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
            title="🗑️ 삭제"
            onPress={() => {
              if (confirm(`"${wordSet.title}" 단어장을 삭제하시겠습니까?\n\n모든 학습 기록이 함께 삭제됩니다.`)) {
                handleDeleteWordSet(wordSet.id);
              }
            }}
            variant="ghost"
            size="small"
            style={{ flex: 1 }}
          />
        </View>
      </GlassContainer>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: screenColors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showAddForm && (
          <GlassContainer 
            style={[styles.addForm, { 
              backgroundColor: screenColors.glass.background,
              borderColor: screenColors.glass.border 
            }]} 
            borderRadius="lg"
          >
            <Text style={[styles.formTitle, { color: screenColors.text }]}>
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

      {/* 단어 추가 모달 */}
      {showWordModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <GlassContainer 
              style={[styles.wordModal, { 
                backgroundColor: screenColors.glass.background,
                borderColor: screenColors.glass.border 
              }]} 
              borderRadius="xl"
            >
              <Text style={[styles.modalTitle, { color: screenColors.text }]}>
                📝 새 단어 추가
              </Text>
              
              <TossInput
                placeholder="단어 (예: apple)"
                value={newWord}
                onChangeText={setNewWord}
                variant="glass"
                style={styles.modalInput}
              />
              
              <TossInput
                placeholder="뜻 (예: 사과)"
                value={newMeaning}
                onChangeText={setNewMeaning}
                variant="glass"
                style={styles.modalInput}
              />
              
              <TossInput
                placeholder="예문 (선택사항)"
                value={newExample}
                onChangeText={setNewExample}
                variant="glass"
                multiline
                style={styles.modalInput}
              />
              
              <View style={styles.modalActions}>
                <TossButton
                  title="취소"
                  onPress={handleWordModalCancel}
                  variant="ghost"
                  style={styles.modalButton}
                />
                <TossButton
                  title="추가하기"
                  onPress={handleWordModalSubmit}
                  variant="primary"
                  style={styles.modalButton}
                />
              </View>
            </GlassContainer>
          </View>
        </View>
      )}

      <FloatingActionButton 
        onPress={handleAddWordToFirstSet} 
        iconName="plus"
        isDarkMode={true}
        label="단어 추가"
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
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
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
    marginBottom: Spacing.xs / 2,
  },
  cardDescription: {
    ...Typography.footnote,
    opacity: 0.7,
    marginBottom: Spacing.lg,
  },
  wordCountBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  wordCountText: {
    ...Typography.callout,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  wordsPreview: {
    marginBottom: Spacing.lg,
  },
  previewTitle: {
    ...Typography.caption1,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  previewWords: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  previewWord: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    maxWidth: 80,
  },
  previewWordText: {
    ...Typography.caption1,
    fontWeight: '500',
    textAlign: 'center',
  },
  moreWords: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreWordsText: {
    ...Typography.caption1,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressSection: {
    marginBottom: Spacing.lg,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  progressPercentage: {
    ...Typography.callout,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  cardActions: {
    gap: Spacing.md,
  },
  primaryAction: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#74f1c3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryActionText: {
    ...Typography.callout,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryActionText: {
    ...Typography.footnote,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: Spacing.xl * 2,
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: Spacing.lg,
  },
  loadingText: {
    ...Typography.callout,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: Spacing.xl * 2,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.title2,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    ...Typography.callout,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  emptyAction: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#74f1c3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyActionText: {
    ...Typography.callout,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // 단어 추가 모달 스타일
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  wordModal: {
    padding: Spacing.xl,
    borderWidth: 1,
  },
  modalTitle: {
    ...Typography.title2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalInput: {
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});