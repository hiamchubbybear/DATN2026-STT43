import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../components/ToastProvider';

interface AppRatingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AppRatingModal = ({ visible, onClose }: AppRatingModalProps) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast({ type: 'error', title: 'Error', message: 'Please select a rating' });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      console.log('Submitting app review:', { rating, comment });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast({ 
        type: 'success', 
        title: 'Thank You!', 
        message: 'Your feedback helps us improve the app.' 
      });
      onClose();
    } catch (error) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to submit review' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.content}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.iconWrap}>
              <Ionicons name="heart" size={40} color="#EE3F57" />
            </View>

            <Text style={styles.title}>Enjoying Mixer?</Text>
            <Text style={styles.subtitle}>Your feedback means a lot to us! How would you rate your experience?</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity 
                  key={star} 
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                >
                  <Ionicons 
                    name={star <= rating ? "star" : "star-outline"} 
                    size={36} 
                    color={star <= rating ? "#F59E0B" : "#D1D5DB"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Tell us what you think (optional)..."
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity 
              style={[styles.submitBtn, rating === 0 && styles.disabledBtn]} 
              onPress={handleSubmit}
              disabled={loading || rating === 0}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.maybeLater}>
              <Text style={styles.maybeLaterText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 4,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineLines: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  starBtn: {
    padding: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#EE3F57',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EE3F57',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  disabledBtn: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  maybeLater: {
    marginTop: 16,
    padding: 8,
  },
  maybeLaterText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
});
