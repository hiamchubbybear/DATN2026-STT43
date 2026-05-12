import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '../components/ToastProvider';

interface UserReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
}

const REPORT_REASONS = [
  'Inappropriate content',
  'Harassment or bullying',
  'Fake profile / Spam',
  'Underage user',
  'Stolen photos',
  'Other'
];

export const UserReportModal = ({ visible, onClose, targetUserId, targetUserName }: UserReportModalProps) => {
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages].slice(0, 3)); // Max 3 images
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      showToast({ type: 'error', title: 'Error', message: 'Please select a reason' });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      console.log('Reporting user:', { targetUserId, selectedReason, description, images });
      await new Task(resolve => setTimeout(resolve, 1500)); 
      
      showToast({ 
        type: 'success', 
        title: 'Report Submitted', 
        message: 'Thank you for helping us keep the community safe.' 
      });
      onClose();
    } catch (error) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to submit report' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Report {targetUserName}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <Text style={styles.label}>Why are you reporting this user?</Text>
              <View style={styles.reasonsGrid}>
                {REPORT_REASONS.map(reason => (
                  <TouchableOpacity 
                    key={reason}
                    style={[
                      styles.reasonChip,
                      selectedReason === reason && styles.selectedChip
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text style={[
                      styles.reasonText,
                      selectedReason === reason && styles.selectedChipText
                    ]}>{reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Additional Details (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Tell us more about the issue..."
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Evidence (Photos)</Text>
              <View style={styles.imageRow}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrap}>
                    <Image source={{ uri }} style={styles.evidenceImg} />
                    <TouchableOpacity 
                      style={styles.removeImgBtn}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 3 && (
                  <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
                    <Ionicons name="camera-outline" size={24} color="#6B7280" />
                    <Text style={styles.addImgText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.submitBtn, !selectedReason && styles.disabledBtn]} 
                onPress={handleSubmit}
                disabled={loading || !selectedReason}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    padding: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  reasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChip: {
    backgroundColor: '#FFF1F2',
    borderColor: '#EE3F57',
  },
  reasonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#EE3F57',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  evidenceImg: {
    width: '100%',
    height: '100%',
  },
  removeImgBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  addImgBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImgText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingTop: 0,
  },
  submitBtn: {
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
});
