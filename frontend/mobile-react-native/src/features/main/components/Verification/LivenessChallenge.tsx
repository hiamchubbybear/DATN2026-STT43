import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export enum ChallengeType {
  Blink = 'BLINK',
  Smile = 'SMILE',
  TurnLeft = 'TURN_LEFT',
  TurnRight = 'TURN_RIGHT',
}

interface LivenessChallengeProps {
  onComplete: () => void;
}

const LivenessChallenge: React.FC<LivenessChallengeProps> = ({ onComplete }) => {
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeType>(ChallengeType.Smile);
  const [progress] = useState(new Animated.Value(0));

  const challenges = [
    { type: ChallengeType.Smile, text: 'Please smile for the camera', icon: 'happy-outline' },
    { type: ChallengeType.Blink, text: 'Blink your eyes twice', icon: 'eye-outline' },
    { type: ChallengeType.TurnLeft, text: 'Turn your head slowly to the left', icon: 'arrow-back-outline' },
    { type: ChallengeType.TurnRight, text: 'Turn your head slowly to the right', icon: 'arrow-forward-outline' },
  ];

  useEffect(() => {
    // Mocking challenge progression
    // In a real app, this would be triggered by expo-face-detector classifications
    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        onComplete();
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const challenge = challenges.find(c => c.type === currentChallenge) || challenges[0];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name={challenge.icon as any} size={50} color="#ff4757" />
        <Text style={styles.text}>{challenge.text}</Text>
        
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
    marginTop: 10,
    textAlign: 'center',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#f1f2f6',
    borderRadius: 4,
    width: '100%',
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});

export default LivenessChallenge;
