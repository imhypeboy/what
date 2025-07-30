import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: keyof typeof BorderRadius;
  shadow?: boolean;
  gradient?: boolean;
  gradientColors?: string[];
}

export function GlassContainer({
  children,
  style,
  intensity = 80,
  tint = 'light',
  borderRadius = 'lg',
  shadow = true,
  gradient = false,
  gradientColors,
}: GlassContainerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const containerStyle = [
    styles.container,
    {
      borderRadius: BorderRadius[borderRadius],
      backgroundColor: colors.glass.background,
      borderColor: colors.glass.border,
    },
    shadow && (colorScheme === 'light' ? Shadows.medium : Shadows.small),
    style,
  ];

  if (gradient) {
    const gradColors = gradientColors || colors.gradients.primary;
    return (
      <LinearGradient
        colors={gradColors}
        style={containerStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={intensity} tint={tint} style={styles.blur}>
          {children}
        </BlurView>
      </LinearGradient>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={containerStyle}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});