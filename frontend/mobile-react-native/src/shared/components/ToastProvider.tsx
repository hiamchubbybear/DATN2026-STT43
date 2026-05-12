import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions, Platform, BlurView } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { registerToastHandler, type ToastOptions, type ToastType } from '../services/toast';

const { width } = Dimensions.get('window');

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastIcon = ({ type }: { type?: ToastType }) => {
  const getColors = () => {
    switch (type) {
      case 'success': return ['#10B981', '#34D399'];
      case 'error': return ['#EF4444', '#F87171'];
      case 'info': return ['#3B82F6', '#60A5FA'];
      default: return ['#EE3F57', '#FB7185'];
    }
  };

  const colors = getColors();

  return (
    <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors[0]} />
          <Stop offset="100%" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="16" fill="url(#iconGrad)" fillOpacity="0.15" />
      {type === 'success' && (
        <Path d="M11 16L14 19L21 12" stroke={colors[0]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {type === 'error' && (
        <Path d="M20 12L12 20M12 12L20 20" stroke={colors[0]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {type === 'info' && (
        <>
          <Path d="M16 11V17" stroke={colors[0]} strokeWidth="2.5" strokeLinecap="round" />
          <Circle cx="16" cy="21" r="1.25" fill={colors[0]} />
        </>
      )}
    </Svg>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-120)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -120, duration: 350, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.95, duration: 300, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY, scale]);

  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setToast(options);
    
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hideToast();
    }, options.duration || 3500);
  }, [opacity, translateY, scale, hideToast]);

  useEffect(() => {
    registerToastHandler(showToast);
    return () => registerToastHandler(null);
  }, [showToast]);

  const getAccentColor = (type?: ToastType) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#EE3F57';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View 
          style={[
            styles.toastWrapper, 
            { 
              opacity, 
              transform: [{ translateY }, { scale }],
            }
          ]}
        >
          <View style={styles.toastContainer}>
            <View style={[styles.accentBar, { backgroundColor: getAccentColor(toast.type) }]} />
            <View style={styles.contentRow}>
              <ToastIcon type={toast.type} />
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 34,
    left: 16,
    right: 16,
    zIndex: 99999,
  },
  toastContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 84,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  accentBar: {
    width: 6,
    height: '100%',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18181B',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#71717A',
    lineHeight: 18,
    fontWeight: '500',
  },
});
