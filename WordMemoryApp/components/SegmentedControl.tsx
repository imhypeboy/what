import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SegmentItem {
  id: string;
  label: string;
  icon: string;
}

interface SegmentedControlProps {
  segments: SegmentItem[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function SegmentedControl({ segments, selectedIndex, onIndexChange }: SegmentedControlProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {segments.map((segment, index) => {
        const isSelected = selectedIndex === index;
        
        return (
          <TouchableOpacity
            key={segment.id}
            style={[
              styles.segmentButton,
              isSelected && styles.selectedButton,
              { backgroundColor: isSelected ? colors.primary : colors.glass.background }
            ]}
            onPress={() => onIndexChange(index)}
            activeOpacity={0.8}
          >
            {isSelected && (
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            
            <View style={styles.buttonContent}>
              <Text style={[
                styles.icon,
                { color: isSelected ? '#FFFFFF' : colors.textSecondary }
              ]}>
                {segment.icon}
              </Text>
              <Text style={[
                styles.label,
                { color: isSelected ? '#FFFFFF' : colors.textSecondary }
              ]}>
                {segment.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedButton: {
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});