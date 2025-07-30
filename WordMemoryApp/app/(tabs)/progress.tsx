import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '@/components/GlassContainer';
import { TossButton } from '@/components/TossButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');

interface WeeklyData {
  day: string;
  wordsLearned: number;
  studyTime: number; // minutes
}

interface MonthlyStats {
  totalWords: number;
  totalTime: number; // minutes
  averageScore: number;
  streak: number; // days
}

// 임시 데이터
const weeklyData: WeeklyData[] = [
  { day: '월', wordsLearned: 15, studyTime: 25 },
  { day: '화', wordsLearned: 12, studyTime: 20 },
  { day: '수', wordsLearned: 8, studyTime: 15 },
  { day: '목', wordsLearned: 20, studyTime: 35 },
  { day: '금', wordsLearned: 18, studyTime: 30 },
  { day: '토', wordsLearned: 25, studyTime: 45 },
  { day: '일', wordsLearned: 10, studyTime: 18 },
];

const monthlyStats: MonthlyStats = {
  totalWords: 450,
  totalTime: 720, // 12 hours
  averageScore: 85,
  streak: 12,
};

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const maxWordsLearned = Math.max(...weeklyData.map(d => d.wordsLearned));
  const maxStudyTime = Math.max(...weeklyData.map(d => d.studyTime));

  const BarChart = ({ data, maxValue, type }: { 
    data: WeeklyData[], 
    maxValue: number, 
    type: 'words' | 'time' 
  }) => {
    const chartWidth = screenWidth - (Spacing.lg * 4);
    const barWidth = (chartWidth - (Spacing.sm * 6)) / 7;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((item, index) => {
            const value = type === 'words' ? item.wordsLearned : item.studyTime;
            const height = (value / maxValue) * 120;
            
            return (
              <View key={item.day} style={styles.barContainer}>
                <View style={[styles.barBackground, { width: barWidth, height: 120 }]}>
                  <LinearGradient
                    colors={type === 'words' ? colors.gradients.primary : colors.gradients.secondary}
                    style={[styles.bar, { width: barWidth, height }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </View>
                <Text style={[styles.barValue, { color: colors.text }]}>
                  {value}
                </Text>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const StatsCard = ({ 
    title, 
    value, 
    unit, 
    color, 
    icon 
  }: { 
    title: string; 
    value: string | number; 
    unit: string; 
    color: string; 
    icon: string; 
  }) => (
    <GlassContainer style={styles.statsCard} borderRadius="lg">
      <View style={styles.statsHeader}>
        <Text style={styles.statsIcon}>{icon}</Text>
        <Text style={[styles.statsTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.statsValue, { color }]}>
        {value}
      </Text>
      <Text style={[styles.statsUnit, { color: colors.textTertiary }]}>
        {unit}
      </Text>
    </GlassContainer>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 기간 선택 */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TossButton
              key={period}
              title={period === 'week' ? '주간' : period === 'month' ? '월간' : '연간'}
              onPress={() => setSelectedPeriod(period)}
              variant={selectedPeriod === period ? 'primary' : 'ghost'}
              size="small"
              style={{ flex: 1 }}
            />
          ))}
        </View>

        {/* 이번 주 요약 */}
        <GlassContainer style={styles.summaryCard} borderRadius="xl">
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            이번 주 요약
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                {weeklyData.reduce((sum, day) => sum + day.wordsLearned, 0)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                학습한 단어
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.gradients.success[0] }]}>
                {Math.round(weeklyData.reduce((sum, day) => sum + day.studyTime, 0) / 60)}h
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                학습 시간
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.gradients.warning[0] }]}>
                {monthlyStats.streak}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                연속 학습일
              </Text>
            </View>
          </View>
        </GlassContainer>

        {/* 주간 학습 단어 차트 */}
        <GlassContainer style={styles.chartCard} borderRadius="lg">
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              일별 학습 단어
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              이번 주
            </Text>
          </View>
          <BarChart data={weeklyData} maxValue={maxWordsLearned} type="words" />
        </GlassContainer>

        {/* 주간 학습 시간 차트 */}
        <GlassContainer style={styles.chartCard} borderRadius="lg">
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              일별 학습 시간
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              분 단위
            </Text>
          </View>
          <BarChart data={weeklyData} maxValue={maxStudyTime} type="time" />
        </GlassContainer>

        {/* 월간 통계 */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          이번 달 성과
        </Text>
        
        <View style={styles.statsGrid}>
          <StatsCard
            title="총 학습 단어"
            value={monthlyStats.totalWords}
            unit="개"
            color={colors.primary}
            icon="📚"
          />
          <StatsCard
            title="총 학습 시간"
            value={Math.round(monthlyStats.totalTime / 60)}
            unit="시간"
            color={colors.gradients.success[0]}
            icon="⏰"
          />
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="평균 점수"
            value={monthlyStats.averageScore}
            unit="점"
            color={colors.gradients.warning[0]}
            icon="🎯"
          />
          <StatsCard
            title="연속 학습일"
            value={monthlyStats.streak}
            unit="일"
            color={colors.gradients.secondary[0]}
            icon="🔥"
          />
        </View>

        {/* 목표 설정 */}
        <GlassContainer style={styles.goalCard} borderRadius="lg">
          <Text style={[styles.goalTitle, { color: colors.text }]}>
            이번 달 목표
          </Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>
                단어 학습 목표
              </Text>
              <Text style={[styles.goalProgress, { color: colors.primary }]}>
                {monthlyStats.totalWords}/600개 (75%)
              </Text>
            </View>
            <View style={[styles.goalBarBg, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={[styles.goalBar, { width: '75%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>
                학습 시간 목표
              </Text>
              <Text style={[styles.goalProgress, { color: colors.gradients.success[0] }]}>
                {Math.round(monthlyStats.totalTime / 60)}/20시간 (60%)
              </Text>
            </View>
            <View style={[styles.goalBarBg, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={colors.gradients.success}
                style={[styles.goalBar, { width: '60%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          <TossButton
            title="목표 수정하기"
            onPress={() => {}}
            variant="ghost"
            size="small"
            style={{ marginTop: Spacing.md }}
          />
        </GlassContainer>

        {/* 학습 팁 */}
        <GlassContainer style={styles.tipCard} borderRadius="lg">
          <Text style={[styles.tipTitle, { color: colors.text }]}>
            💡 학습 팁
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            꾸준한 학습이 가장 중요합니다! 매일 조금씩이라도 학습하면 더 나은 결과를 얻을 수 있어요.
          </Text>
        </GlassContainer>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.title3,
    fontWeight: '600',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    ...Typography.title1,
    fontWeight: '700',
  },
  summaryLabel: {
    ...Typography.caption1,
    marginTop: Spacing.xs / 2,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    marginHorizontal: Spacing.sm,
  },
  chartCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  chartHeader: {
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    ...Typography.headline,
    fontWeight: '600',
  },
  chartSubtitle: {
    ...Typography.caption1,
    marginTop: Spacing.xs / 2,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  barContainer: {
    alignItems: 'center',
  },
  barBackground: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  bar: {
    borderRadius: 4,
  },
  barValue: {
    ...Typography.caption2,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  barLabel: {
    ...Typography.caption2,
  },
  sectionTitle: {
    ...Typography.title3,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statsCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statsHeader: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statsIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs / 2,
  },
  statsTitle: {
    ...Typography.caption1,
    textAlign: 'center',
  },
  statsValue: {
    ...Typography.title2,
    fontWeight: '700',
  },
  statsUnit: {
    ...Typography.caption2,
    marginTop: Spacing.xs / 2,
  },
  goalCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  goalTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  goalItem: {
    marginBottom: Spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  goalLabel: {
    ...Typography.callout,
  },
  goalProgress: {
    ...Typography.callout,
    fontWeight: '600',
  },
  goalBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalBar: {
    height: '100%',
    borderRadius: 4,
  },
  tipCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tipTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  tipText: {
    ...Typography.callout,
    lineHeight: 22,
  },
});