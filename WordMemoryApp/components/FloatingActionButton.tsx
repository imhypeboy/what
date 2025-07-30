import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FloatingActionButtonProps {
  onPress: () => void;
  iconName: string;
  isDarkMode?: boolean;
  label?: string;
}

export function FloatingActionButton({ onPress, iconName, isDarkMode = false, label }: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);
  const size = 56;
  
  // 다크 모드일 때 색상 조정
  const fabColors = isDarkMode ? {
    glass: 'rgba(255, 255, 255, 0.15)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
    icon: '#74f1c3',
    shadow: '#74f1c3'
  } : {
    glass: 'rgba(255, 255, 255, 0.25)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    icon: '#74f1c3',
    shadow: '#74f1c3'
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    scale.value = withSpring(0.9, undefined, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <View style={styles.fabWrapper}>
      {/* 라벨 (안드로이드 접근성) */}
      {label && (
        <View style={[styles.label, { backgroundColor: fabColors.glass, borderColor: fabColors.glassBorder }]}>
          <Text style={[styles.labelText, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
            {label}
          </Text>
        </View>
      )}
      
      <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
        <TouchableOpacity 
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={styles.touchable}
          accessibilityLabel={label || '단어 추가'}
          accessibilityHint="새로운 단어를 추가합니다"
          accessibilityRole="button"
        >
          {/* 심플한 글래스 컨테이너 */}
          <View style={[
            styles.glassContainer, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              borderColor: fabColors.glassBorder,
              backgroundColor: fabColors.glass
            }
          ]}>
            <LinearGradient
              colors={[fabColors.glass, 'rgba(255,255,255,0.05)']}
              style={[styles.glassBg, { borderRadius: size / 2 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* 아이콘 */}
              <IconSymbol name={iconName} size={28} color={fabColors.icon} />
              
              {/* 상단 하이라이트 */}
              <LinearGradient
                colors={['rgba(255,255,255,0.4)', 'transparent']}
                style={[styles.highlight, { borderRadius: size / 2 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'flex-end',
  },
  label: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    // 안드로이드 그림자
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    shadowColor: '#74f1c3',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  touchable: {
    flex: 1,
    // 안드로이드 터치 피드백을 위한 최소 크기 보장
    minWidth: 48,
    minHeight: 48,
  },
  glassContainer: {
    borderWidth: 1,
    // 안드로이드에서 더 나은 접근성을 위한 그림자
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  glassBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '60%',
    height: '60%',
  },
});
