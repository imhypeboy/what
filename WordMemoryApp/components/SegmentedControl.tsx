import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function SegmentedControl({ segments, selectedIndex, onIndexChange }: SegmentedControlProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const translateX = useSharedValue(0);
  const segmentWidth = (screenWidth - (Spacing.lg * 2) - 8) / segments.length;

  useEffect(() => {
    translateX.value = withSpring(selectedIndex * segmentWidth, {
      damping: 20,
      stiffness: 300,
    });
  }, [selectedIndex, segmentWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.glass.background }]}>
      {/* 움직이는 선택 배경 */}
      <Animated.View
        style={[
          styles.selectedBackground,
          {
            width: segmentWidth,
            backgroundColor: '#FFFFFF',
          },
          animatedStyle,
        ]}
      />
      
      {/* 세그먼트 버튼들 */}
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment}
          style={[styles.segment, { width: segmentWidth }]}
          onPress={() => onIndexChange(index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: selectedIndex === index ? colors.primary : colors.textSecondary,
                fontWeight: selectedIndex === index ? '600' : '400',
              },
            ]}
          >
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: 4,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBackground: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: '100%',
    borderRadius: BorderRadius.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segment: {
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: {
    ...Typography.callout,
    fontSize: 15,
  },
});