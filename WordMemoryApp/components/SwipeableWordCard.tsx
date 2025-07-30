import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassContainer } from './GlassContainer';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Word } from '@/types';

interface SwipeableWordCardProps {
  word: Word;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - (Spacing.lg * 2);
const swipeThreshold = 80; // 더 민감하게 (화면의 1/4 → 고정값 80px)
const velocityThreshold = 800; // 속도 기반 임계값 추가

export function SwipeableWordCard({
  word,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableWordCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const flipCard = useCallback(() => {
    const newFlipped = !isFlipped;
    rotation.value = withTiming(newFlipped ? 180 : 0, { duration: 600 });
    runOnJS(setIsFlipped)(newFlipped);
  }, [isFlipped, rotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const cardContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number; startY: number; }>({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
      rotate.value = interpolate(translateX.value, [-screenWidth, screenWidth], [-15, 15]);
    },
    onEnd: (event) => {
      
      // 거리 또는 속도 기반으로 스와이프 인식
      const shouldSwipe = Math.abs(event.translationX) > swipeThreshold || Math.abs(event.velocityX) > velocityThreshold;
      
      if (shouldSwipe) {
        // 햅틱 피드백
        runOnJS(() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (e) {
            // console.log('햅틱 피드백 실패:', e);
          }
        })();
        
        if (event.translationX > 0 || event.velocityX > 0) {
          // 우측 스와이프 - 이해했음
          translateX.value = withTiming(screenWidth, { duration: 300 }, () => {
            runOnJS(onSwipeRight)();
            // 카드 위치 리셋
            translateX.value = 0;
            translateY.value = 0;
            rotate.value = 0;
          });
        } else {
          // 좌측 스와이프 - 다시 암기
          translateX.value = withTiming(-screenWidth, { duration: 300 }, () => {
            runOnJS(onSwipeLeft)();
            // 카드 위치 리셋
            translateX.value = 0;
            translateY.value = 0;
            rotate.value = 0;
          });
        }
      } else {
        // 스와이프 임계값 미달시 원위치
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, cardContainerStyle]}>
        {/* Front Side - Word */}
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <Pressable style={[styles.photoCard, styles.frontCard, { backgroundColor: '#FFFFFF' }]} onPress={flipCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.categoryText}>WORD</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.word, { color: colors.text }]}>{word.word}</Text>
              {word.pronunciation && (
                <Text style={[styles.pronunciation, { color: colors.textSecondary }]}>
                  /{word.pronunciation}/
                </Text>
              )}
            </View>
            <View style={styles.cardFooter}>
              <Text style={[styles.hint, { color: colors.textTertiary }]}>탭하여 뜻 보기</Text>
              <View style={styles.swipeIndicators}>
                <Text style={[styles.swipeHint, { color: '#FF3B30' }]}>⬅️ 다시</Text>
                <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(word.difficulty) }]} />
                <Text style={[styles.swipeHint, { color: '#30D158' }]}>이해 ➡️</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Back Side - Meaning */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Pressable style={[styles.photoCard, styles.backCard, { backgroundColor: colors.primary }]} onPress={flipCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={[styles.categoryText, { color: '#FFFFFF' }]}>MEANING</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.meaning, { color: '#FFFFFF' }]}>{word.meaning}</Text>
              {word.example && (
                <Text style={[styles.example, { color: 'rgba(255,255,255,0.8)' }]}>
                  "{word.example}"
                </Text>
              )}
            </View>
            <View style={styles.cardFooter}>
              <Text style={[styles.hint, { color: 'rgba(255,255,255,0.7)' }]}>탭하여 단어 보기</Text>
              <View style={styles.swipeIndicators}>
                <Text style={[styles.swipeHint, { color: 'rgba(255, 59, 48, 0.8)' }]}>⬅️ 다시</Text>
                <View style={[styles.difficultyDot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <Text style={[styles.swipeHint, { color: 'rgba(48, 209, 88, 0.8)' }]}>이해 ➡️</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'easy': return '#30D158';
      case 'medium': return '#FF9500';
      case 'hard': return '#FF3B30';
      default: return colors.textTertiary;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardBack: {
    position: 'absolute',
  },
  photoCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  frontCard: {
    // 앞면 카드 스타일
  },
  backCard: {
    // 뒷면 카드 스타일
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: Spacing.lg,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    ...Typography.caption2,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  word: {
    ...Typography.largeTitle,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 38,
  },
  pronunciation: {
    ...Typography.callout,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  meaning: {
    ...Typography.title1,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 32,
  },
  example: {
    ...Typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    lineHeight: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  hint: {
    ...Typography.caption2,
    fontStyle: 'italic',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  swipeIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  swipeHint: {
    ...Typography.caption2,
    fontWeight: '600',
    fontSize: 11,
  },
});
// Re-export interpolate from reanimated
function interpolate(
  value: number,
  inputRange: readonly number[],
  outputRange: readonly number[]
) {
  'worklet';
  return (
    outputRange[0] +
    ((value - inputRange[0]) * (outputRange[1] - outputRange[0])) /
      (inputRange[1] - inputRange[0])
  );
}