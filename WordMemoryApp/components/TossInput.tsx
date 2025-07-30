import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TossInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  variant?: 'default' | 'glass';
}

export function TossInput({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  variant = 'default',
  ...textInputProps
}: TossInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!textInputProps.value || !!textInputProps.defaultValue);
  
  const borderColor = useSharedValue(colors.border);
  const backgroundColor = useSharedValue(variant === 'glass' ? colors.glass.background : colors.surface);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    backgroundColor: backgroundColor.value,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = withTiming(error ? colors.gradients.error[0] : colors.primary);
    if (variant === 'glass') {
      backgroundColor.value = withTiming('rgba(255, 255, 255, 0.4)');
    }
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColor.value = withTiming(error ? colors.gradients.error[0] : colors.border);
    if (variant === 'glass') {
      backgroundColor.value = withTiming(colors.glass.background);
    }
    textInputProps.onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setHasValue(text.length > 0);
    textInputProps.onChangeText?.(text);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label, 
          { color: colors.textSecondary },
          isFocused && { color: error ? colors.gradients.error[0] : colors.primary },
          labelStyle
        ]}>
          {label}
        </Text>
      )}
      
      <Animated.View style={[
        styles.inputContainer,
        {
          borderColor: colors.border,
          backgroundColor: variant === 'glass' ? colors.glass.background : colors.surface,
        },
        animatedContainerStyle,
        error && { borderColor: colors.gradients.error[0] }
      ]}>
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            inputStyle
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          {...textInputProps}
        />
      </Animated.View>
      
      {error && (
        <Text style={[styles.errorText, { color: colors.gradients.error[0] }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.footnote,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  input: {
    ...Typography.body,
    padding: 0,
    margin: 0,
  },
  errorText: {
    ...Typography.caption1,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
});