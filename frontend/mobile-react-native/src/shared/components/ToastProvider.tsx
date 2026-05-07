import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { registerToastHandler, type ToastOptions, type ToastType } from '../services/toast';

const { width } = Dimensions.get('window');

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const SuccessIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#4ADE80" fillOpacity="0.2" />
    <Path d="M8 12L11 15L16 9" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ErrorIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#F87171" fillOpacity="0.2" />
    <Path d="M15 9L9 15M9 9L15 15" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InfoIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#60A5FA" fillOpacity="0.2" />
    <Path d="M12 8V12M12 16H12.01" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setToast(options);
    
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hideToast();
    }, options.duration || 3000);
  }, [opacity, translateY, hideToast]);

  useEffect(() => {
    registerToastHandler(showToast);
    return () => registerToastHandler(null);
  }, [showToast]);

  const getIcon = (type?: ToastType) => {
    switch (type) {
      case 'success': return <SuccessIcon />;
      case 'error': return <ErrorIcon />;
      case 'info': return <InfoIcon />;
      default: return <SuccessIcon />;
    }
  };

  const getAccentColor = (type?: ToastType) => {
    switch (type) {
      case 'success': return '#4ADE80';
      case 'error': return '#F87171';
      case 'info': return '#60A5FA';
      default: return '#EE3F57';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { 
              opacity, 
              transform: [{ translateY }],
              borderLeftColor: getAccentColor(toast.type)
            }
          ]}
        >
          <View style={styles.iconContainer}>
            {getIcon(toast.type)}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{toast.title}</Text>
            <Text style={styles.message}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    borderLeftWidth: 4,
    zIndex: 9999,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#71717A',
    lineHeight: 18,
  },
});
