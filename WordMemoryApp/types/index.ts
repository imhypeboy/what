// 단어 인터페이스
export interface Word {
  id: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: Date;
  lastStudied?: Date;
  studyCount: number;
  correctCount: number;
}

// 단어장 인터페이스
export interface WordSet {
  id: string;
  title: string;
  description: string;
  category: string;
  words: Word[];
  createdAt: Date;
  updatedAt: Date;
  totalWords: number;
  studiedWords: number;
  correctRate: number;
  lastStudied?: Date;
}

// 학습 세션 인터페이스
export interface StudySession {
  id: string;
  wordSetId: string;
  mode: 'flashcard' | 'quiz' | 'review';
  startTime: Date;
  endTime?: Date;
  duration?: number; // 초 단위
  wordsStudied: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number; // 정답률 (0-100)
}

// 학습 결과 인터페이스
export interface StudyResult {
  id: string;
  sessionId: string;
  wordId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // 초 단위
  timestamp: Date;
}

// 시험 인터페이스
export interface Test {
  id: string;
  title: string;
  wordSetId: string;
  questions: TestQuestion[];
  timeLimit: number; // 분 단위
  passingScore: number; // 0-100
  createdAt: Date;
}

// 시험 문제 인터페이스
export interface TestQuestion {
  id: string;
  testId: string;
  wordId: string;
  questionType: 'multiple_choice' | 'fill_blank' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

// 시험 결과 인터페이스
export interface TestResult {
  id: string;
  testId: string;
  userId?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // 초 단위
  totalQuestions: number;
  correctAnswers: number;
  score: number; // 0-100
  passed: boolean;
  answers: TestAnswer[];
}

// 시험 답안 인터페이스
export interface TestAnswer {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  timeSpent: number; // 초 단위
}

// 학습 통계 인터페이스
export interface StudyStats {
  id: string;
  date: string; // YYYY-MM-DD 형식
  wordsLearned: number;
  studyTime: number; // 분 단위
  sessionsCompleted: number;
  averageAccuracy: number;
  streak: number; // 연속 학습 일수
}

// 사용자 설정 인터페이스
export interface UserSettings {
  id: string;
  dailyWordGoal: number;
  dailyTimeGoal: number; // 분 단위
  notificationsEnabled: boolean;
  studyReminders: {
    enabled: boolean;
    time: string; // HH:MM 형식
    days: number[]; // 0=일요일, 1=월요일, ...
  };
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// API 응답 타입들
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 검색 필터 인터페이스
export interface WordSearchFilter {
  query?: string;
  category?: string;
  difficulty?: Word['difficulty'];
  tags?: string[];
  studiedOnly?: boolean;
  notStudiedOnly?: boolean;
  sortBy?: 'alphabetical' | 'date_added' | 'difficulty' | 'study_count';
  sortOrder?: 'asc' | 'desc';
}

// 학습 모드별 설정
export interface StudyModeConfig {
  mode: 'flashcard' | 'quiz' | 'review';
  shuffleCards: boolean;
  showHints: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // 초 단위
  repeatIncorrect: boolean;
  maxWordsPerSession: number;
}

// 대시보드 데이터 인터페이스
export interface DashboardData {
  todaysStats: StudyStats;
  weeklyProgress: StudyStats[];
  monthlyProgress: StudyStats[];
  totalWords: number;
  totalStudyTime: number; // 분 단위
  currentStreak: number;
  longestStreak: number;
  recentSessions: StudySession[];
  upcomingReviews: Word[];
  achievements: Achievement[];
}

// 성취/업적 인터페이스
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'words' | 'time' | 'accuracy' | 'speed';
  target: number;
  progress: number;
  completed: boolean;
  unlockedAt?: Date;
  reward?: {
    type: 'badge' | 'theme' | 'feature';
    value: string;
  };
}