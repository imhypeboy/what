export const Colors = {
  light: {
    // iOS 16 inspired colors
    primary: '#74f1c3',
    secondary: '#a2f5d5',
    accent: '#FF9500',
    background: '#E8E8ED', // 아주 살짝 어둡게 조정
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',
    border: '#C6C6C8',
    divider: '#E5E5EA',
    
    // Glassmorphism colors
    glass: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'transparent',
      shadow: 'rgba(0, 0, 0, 0.05)',
    },
    
    // Toss-inspired gradients
    gradients: {
      primary: ['#74f1c3', '#a2f5d5'],
      secondary: ['#FF9500', '#FFCC02'],
      success: ['#30D158', '#32D74B'],
      warning: ['#FF9500', '#FFCC02'],
      error: ['#FF3B30', '#FF453A'],
    }
  },
  dark: {
    primary: '#74f1c3',
    secondary: '#a2f5d5',
    accent: '#FF9F0A',
    background: '#E8E8ED', // 아주 살짝 어둡게 조정
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',
    border: '#C6C6C8',
    divider: '#E5E5EA',
    
    glass: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'transparent',
      shadow: 'rgba(0, 0, 0, 0.05)',
    },
    
    gradients: {
      primary: ['#74f1c3', '#a2f5d5'],
      secondary: ['#FF9F0A', '#FFCC02'],
      success: ['#30D158', '#32D74B'],
      warning: ['#FF9F0A', '#FFCC02'],
      error: ['#FF453A', '#FF6961'],
    }
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
};

export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};