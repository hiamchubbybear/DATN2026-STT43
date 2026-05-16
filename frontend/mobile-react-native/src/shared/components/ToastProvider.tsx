import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions, Platform, PanResponder } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { registerToastHandler, type ToastOptions, type ToastType } from '../services/toast';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const panY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panX = useRef(new Animated.Value(0)).current;

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -120, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.9, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setToast(null);
      panY.setValue(0);
      panX.setValue(0);
    });
  }, [opacity, translateY, scale, panY, panX]);

  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setToast(options);
    panY.setValue(0);
    panX.setValue(0);
    
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hideToast();
    }, options.duration || 3500);
  }, [opacity, translateY, scale, hideToast, panY, panX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => 
        Math.abs(gestureState.dy) > 5 || Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (_, gestureState) => {
        panY.setValue(gestureState.dy < 0 ? gestureState.dy : gestureState.dy * 0.2);
        panX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldDismiss = 
          gestureState.dy < -30 || 
          Math.abs(gestureState.dx) > width * 0.4 ||
          Math.abs(gestureState.vx) > 0.5 ||
          gestureState.vy < -0.5;

        if (shouldDismiss) {
          if (gestureState.dx > 0) {
            Animated.timing(panX, { toValue: width, duration: 200, useNativeDriver: true }).start(hideToast);
          } else if (gestureState.dx < 0) {
            Animated.timing(panX, { toValue: -width, duration: 200, useNativeDriver: true }).start(hideToast);
          } else {
            hideToast();
          }
        } else {
          Animated.parallel([
            Animated.spring(panY, { toValue: 0, friction: 8, useNativeDriver: true }),
            Animated.spring(panX, { toValue: 0, friction: 8, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

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

  const combinedTranslateY = Animated.add(translateY, panY);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View 
          {...panResponder.panHandlers}
          style={[
            styles.toastWrapper, 
            { 
              opacity, 
              transform: [
                { translateY: combinedTranslateY }, 
                { translateX: panX },
                { scale }
              ],
            }
          ]}
        >
          <View style={styles.toastContainer}>
            <View style={[styles.accentBar, { backgroundColor: getAccentColor(toast.type) }]} />
            <View style={styles.contentRow}>
              <ToastIcon type={toast.type} />
              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  {toast.title || (toast as any).text1 || t('common.notification') || 'Thông báo'}
                </Text>
                <Text style={styles.message}>
                  {toast.message || (toast as any).text2 || t('common.error_occurred') || 'Đã có lỗi xảy ra'}
                </Text>
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
    top: Platform.OS === 'ios' ? 60 : 40, // Higher top margin for Notch/Dynamic Island
    left: 20,
    right: 20,
    zIndex: 999999,
  },
  toastContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'visible', // Changed from hidden to avoid clipping shadows
    minHeight: 70,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  accentBar: {
    width: 6,
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 1,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '500',
  },
});
