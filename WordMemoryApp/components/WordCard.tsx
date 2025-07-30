import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { GlassContainer } from './GlassContainer';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface WordCardProps {
  word: string;
  meaning: string;
  onNext?: () => void;
  onPrevious?: () => void;
  showMeaning?: boolean;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - (Spacing.lg * 2);

export function WordCard({ 
  word, 
  meaning, 
  onNext, 
  onPrevious, 
  showMeaning = false,
  style 
}: WordCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isFlipped, setIsFlipped] = useState(showMeaning);
  const rotation = useSharedValue(showMeaning ? 180 : 0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const flipCard = () => {
    const newFlipped = !isFlipped;
    rotation.value = withTiming(newFlipped ? 180 : 0, { duration: 600 });
    runOnJS(setIsFlipped)(newFlipped);
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={flipCard} style={styles.cardContainer}>
        {/* Front Side - Word */}
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <GlassContainer
            style={styles.glassCard}
            borderRadius="xl"
            intensity={15}
          >
            <View style={styles.cardContent}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                단어
              </Text>
              <Text style={[styles.word, { color: colors.text }]}>
                {word}
              </Text>
              <Text style={[styles.hint, { color: colors.textTertiary }]}>
                탭하여 뜻 보기
              </Text>
            </View>
          </GlassContainer>
        </Animated.View>

        {/* Back Side - Meaning */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <GlassContainer
            style={styles.glassCard}
            borderRadius="xl"
            intensity={15}
            gradient
            gradientColors={colors.gradients.primary}
          >
            <View style={styles.cardContent}>
              <Text style={[styles.label, { color: 'rgba(255,255,255,0.8)' }]}>
                뜻
              </Text>
              <Text style={[styles.meaning, { color: '#FFFFFF' }]}>
                {meaning}
              </Text>
              <Text style={[styles.hint, { color: 'rgba(255,255,255,0.7)' }]}>
                탭하여 단어 보기
              </Text>
            </View>
          </GlassContainer>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: cardWidth,
    height: 280,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardBack: {
    position: 'absolute',
  },
  glassCard: {
    flex: 1,
    padding: Spacing.xl,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...Typography.caption1,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  word: {
    ...Typography.largeTitle,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  meaning: {
    ...Typography.title2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  hint: {
    ...Typography.caption2,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});