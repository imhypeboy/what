import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Colors, BorderRadius, Typography, Shadows, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TossButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  gradient?: boolean;
  icon?: React.ReactNode;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function TossButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  gradient = true,
  icon,
}: TossButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    opacity.value = withTiming(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return colors.gradients.primary;
      case 'secondary':
        return colors.gradients.secondary;
      case 'success':
        return colors.gradients.success;
      case 'warning':
        return colors.gradients.warning;
      case 'error':
        return colors.gradients.error;
      default:
        return colors.gradients.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          minHeight: 36,
        };
      case 'medium':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: 48,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: 56,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return Typography.footnote;
      case 'medium':
        return Typography.callout;
      case 'large':
        return Typography.headline;
    }
  };

  const containerStyle = [
    styles.container,
    getSizeStyles(),
    {
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
    },
    !gradient && variant !== 'ghost' && {
      backgroundColor: colors.primary,
    },
    variant === 'ghost' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    getTextSize(),
    {
      color: variant === 'ghost' ? colors.primary : '#FFFFFF',
    },
    textStyle,
  ];

  if (variant === 'ghost') {
    return (
      <AnimatedTouchableOpacity
        style={[containerStyle, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        {icon && <>{icon}</>}
        <Text style={buttonTextStyle}>{title}</Text>
      </AnimatedTouchableOpacity>
    );
  }

  if (gradient) {
    return (
      <AnimatedTouchableOpacity
        style={[animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        <LinearGradient
          colors={getVariantColors()}
          style={containerStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {icon && <>{icon}</>}
          <Text style={buttonTextStyle}>{title}</Text>
        </LinearGradient>
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity
      style={[containerStyle, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      {icon && <>{icon}</>}
      <Text style={buttonTextStyle}>{title}</Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});