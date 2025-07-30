import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  WordSet, 
  Word, 
  StudySession, 
  StudyResult, 
  TestResult, 
  StudyStats, 
  UserSettings 
} from '@/types';

// 키 상수들
const STORAGE_KEYS = {
  WORD_SETS: 'word_sets',
  STUDY_SESSIONS: 'study_sessions',
  STUDY_RESULTS: 'study_results',
  TEST_RESULTS: 'test_results',
  STUDY_STATS: 'study_stats',
  USER_SETTINGS: 'user_settings',
  APP_VERSION: 'app_version',
} as const;

class StorageService {
  // 기본 AsyncStorage 헬퍼 메서드들
  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  // 단어장 관련 메서드들
  async getWordSets(): Promise<WordSet[]> {
    const wordSets = await this.getItem<WordSet[]>(STORAGE_KEYS.WORD_SETS);
    return wordSets || [];
  }

  async saveWordSet(wordSet: WordSet): Promise<void> {
    const wordSets = await this.getWordSets();
    const existingIndex = wordSets.findIndex(ws => ws.id === wordSet.id);
    
    if (existingIndex >= 0) {
      wordSets[existingIndex] = wordSet;
    } else {
      wordSets.push(wordSet);
    }
    
    await this.setItem(STORAGE_KEYS.WORD_SETS, wordSets);
  }

  async getWordSet(id: string): Promise<WordSet | null> {
    const wordSets = await this.getWordSets();
    return wordSets.find(ws => ws.id === id) || null;
  }

  async deleteWordSet(id: string): Promise<void> {
    const wordSets = await this.getWordSets();
    const filteredWordSets = wordSets.filter(ws => ws.id !== id);
    await this.setItem(STORAGE_KEYS.WORD_SETS, filteredWordSets);
  }

  async addWordToSet(wordSetId: string, word: Word): Promise<void> {
    const wordSet = await this.getWordSet(wordSetId);
    if (!wordSet) throw new Error('Word set not found');
    
    const existingWordIndex = wordSet.words.findIndex(w => w.id === word.id);
    if (existingWordIndex >= 0) {
      wordSet.words[existingWordIndex] = word;
    } else {
      wordSet.words.push(word);
    }
    
    // 통계 업데이트
    wordSet.totalWords = wordSet.words.length;
    wordSet.updatedAt = new Date();
    
    await this.saveWordSet(wordSet);
  }

  async removeWordFromSet(wordSetId: string, wordId: string): Promise<void> {
    const wordSet = await this.getWordSet(wordSetId);
    if (!wordSet) throw new Error('Word set not found');
    
    wordSet.words = wordSet.words.filter(w => w.id !== wordId);
    wordSet.totalWords = wordSet.words.length;
    wordSet.updatedAt = new Date();
    
    await this.saveWordSet(wordSet);
  }

  // 학습 세션 관련 메서드들
  async getStudySessions(): Promise<StudySession[]> {
    const sessions = await this.getItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS);
    return sessions || [];
  }

  async saveStudySession(session: StudySession): Promise<void> {
    const sessions = await this.getStudySessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    await this.setItem(STORAGE_KEYS.STUDY_SESSIONS, sessions);
  }

  async getStudySessionsByWordSet(wordSetId: string): Promise<StudySession[]> {
    const sessions = await this.getStudySessions();
    return sessions.filter(s => s.wordSetId === wordSetId);
  }

  // 학습 결과 관련 메서드들
  async getStudyResults(): Promise<StudyResult[]> {
    const results = await this.getItem<StudyResult[]>(STORAGE_KEYS.STUDY_RESULTS);
    return results || [];
  }

  async saveStudyResult(result: StudyResult): Promise<void> {
    const results = await this.getStudyResults();
    results.push(result);
    await this.setItem(STORAGE_KEYS.STUDY_RESULTS, results);
  }

  async getStudyResultsBySession(sessionId: string): Promise<StudyResult[]> {
    const results = await this.getStudyResults();
    return results.filter(r => r.sessionId === sessionId);
  }

  // 시험 결과 관련 메서드들
  async getTestResults(): Promise<TestResult[]> {
    const results = await this.getItem<TestResult[]>(STORAGE_KEYS.TEST_RESULTS);
    return results || [];
  }

  async saveTestResult(result: TestResult): Promise<void> {
    const results = await this.getTestResults();
    results.push(result);
    await this.setItem(STORAGE_KEYS.TEST_RESULTS, results);
  }

  // 학습 통계 관련 메서드들
  async getStudyStats(): Promise<StudyStats[]> {
    const stats = await this.getItem<StudyStats[]>(STORAGE_KEYS.STUDY_STATS);
    return stats || [];
  }

  async saveStudyStats(stats: StudyStats): Promise<void> {
    const allStats = await this.getStudyStats();
    const existingIndex = allStats.findIndex(s => s.date === stats.date);
    
    if (existingIndex >= 0) {
      allStats[existingIndex] = stats;
    } else {
      allStats.push(stats);
    }
    
    await this.setItem(STORAGE_KEYS.STUDY_STATS, allStats);
  }

  async getStudyStatsByDateRange(startDate: string, endDate: string): Promise<StudyStats[]> {
    const stats = await this.getStudyStats();
    return stats.filter(s => s.date >= startDate && s.date <= endDate);
  }

  async getTodayStats(): Promise<StudyStats | null> {
    const today = new Date().toISOString().split('T')[0];
    const stats = await this.getStudyStats();
    return stats.find(s => s.date === today) || null;
  }

  // 사용자 설정 관련 메서드들
  async getUserSettings(): Promise<UserSettings | null> {
    return await this.getItem<UserSettings>(STORAGE_KEYS.USER_SETTINGS);
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  // 통계 계산 헬퍼 메서드들
  async calculateWordSetProgress(wordSetId: string): Promise<{
    totalWords: number;
    studiedWords: number;
    correctRate: number;
  }> {
    const wordSet = await this.getWordSet(wordSetId);
    if (!wordSet) {
      return { totalWords: 0, studiedWords: 0, correctRate: 0 };
    }

    const studiedWords = wordSet.words.filter(w => w.studyCount > 0);
    const totalCorrect = wordSet.words.reduce((sum, w) => sum + w.correctCount, 0);
    const totalStudied = wordSet.words.reduce((sum, w) => sum + w.studyCount, 0);
    
    return {
      totalWords: wordSet.words.length,
      studiedWords: studiedWords.length,
      correctRate: totalStudied > 0 ? (totalCorrect / totalStudied) * 100 : 0,
    };
  }

  async calculateCurrentStreak(): Promise<number> {
    const stats = await this.getStudyStats();
    if (stats.length === 0) return 0;

    // 날짜별로 정렬
    const sortedStats = stats.sort((a, b) => b.date.localeCompare(a.date));
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const stat of sortedStats) {
      const statDate = new Date(stat.date);
      const daysDiff = Math.floor((currentDate.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak && stat.wordsLearned > 0) {
        streak++;
        currentDate = statDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // 데이터 초기화 및 관리
  async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  }

  async exportData(): Promise<string> {
    const data = {
      wordSets: await this.getWordSets(),
      studySessions: await this.getStudySessions(),
      studyResults: await this.getStudyResults(),
      testResults: await this.getTestResults(),
      studyStats: await this.getStudyStats(),
      userSettings: await this.getUserSettings(),
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.wordSets) await this.setItem(STORAGE_KEYS.WORD_SETS, data.wordSets);
      if (data.studySessions) await this.setItem(STORAGE_KEYS.STUDY_SESSIONS, data.studySessions);
      if (data.studyResults) await this.setItem(STORAGE_KEYS.STUDY_RESULTS, data.studyResults);
      if (data.testResults) await this.setItem(STORAGE_KEYS.TEST_RESULTS, data.testResults);
      if (data.studyStats) await this.setItem(STORAGE_KEYS.STUDY_STATS, data.studyStats);
      if (data.userSettings) await this.setItem(STORAGE_KEYS.USER_SETTINGS, data.userSettings);
      
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }

  // 샘플 데이터 생성 (개발/테스트용)
  async initializeSampleData(): Promise<void> {
    const existingWordSets = await this.getWordSets();
    if (existingWordSets.length > 0) return; // 이미 데이터가 있으면 스킵

    const sampleWordSet: WordSet = {
      id: 'sample-1',
      title: 'TOEIC 필수 단어',
      description: '토익 시험 필수 어휘 모음',
      category: '영어',
      words: [
        {
          id: 'word-1',
          word: 'Appreciate',
          meaning: '감사하다, 인정하다',
          example: 'I appreciate your help.',
          difficulty: 'medium',
          tags: ['business', 'common'],
          createdAt: new Date(),
          studyCount: 0,
          correctCount: 0,
        },
        {
          id: 'word-2',
          word: 'Collaborate',
          meaning: '협력하다, 공동 작업하다',
          example: 'We need to collaborate on this project.',
          difficulty: 'medium',
          tags: ['business', 'teamwork'],
          createdAt: new Date(),
          studyCount: 0,
          correctCount: 0,
        },
        {
          id: 'word-3',
          word: 'Demonstrate',
          meaning: '증명하다, 보여주다',
          example: 'Can you demonstrate how to use this?',
          difficulty: 'medium',
          tags: ['business', 'presentation'],
          createdAt: new Date(),
          studyCount: 0,
          correctCount: 0,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalWords: 3,
      studiedWords: 0,
      correctRate: 0,
    };

    await this.saveWordSet(sampleWordSet);

    // 기본 사용자 설정
    const defaultSettings: UserSettings = {
      id: 'user-1',
      dailyWordGoal: 20,
      dailyTimeGoal: 30,
      notificationsEnabled: true,
      studyReminders: {
        enabled: true,
        time: '19:00',
        days: [1, 2, 3, 4, 5], // 평일
      },
      theme: 'auto',
      soundEnabled: true,
      vibrationEnabled: true,
    };

    await this.saveUserSettings(defaultSettings);
  }
}

export const storageService = new StorageService();