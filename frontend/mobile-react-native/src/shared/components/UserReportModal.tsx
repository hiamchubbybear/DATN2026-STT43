import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { reportService } from '../../services/api/reportService';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

type Props = {
  visible: boolean;
  targetUserId: string;
  targetUserName: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const CloseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 12" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CameraIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M23 19C23 19.5523 22.5523 20 22 20H2C1.44772 20 1 19.5523 1 19V7C1 6.44772 1.44772 6 2 6H7L9 3H15L17 6H22C22.5523 6 23 6.44772 23 7V19Z" stroke="#EE3F57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="#EE3F57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const UserReportModal: React.FC<Props> = ({ visible, targetUserId, targetUserName, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const reasons = [
    t('report.reasons.harassment'),
    t('report.reasons.fake_profile'),
    t('report.reasons.scam'),
    t('report.reasons.inappropriate_content'),
    t('report.reasons.other')
  ];

  const [reason, setReason] = useState(reasons[0]);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop(),
        type: asset.mimeType || 'image/jpeg'
      }));
      setImages([...images, ...selectedImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('report.description_required'));
      return;
    }

    setLoading(true);
    try {
      await reportService.submitReport(targetUserId, reason, description, images);

      if (onSuccess) onSuccess();
      Alert.alert(t('common.success'), t('report.success'));
      onClose();
    } catch (error) {
      console.error('Report failed:', error);
      Alert.alert(t('common.error'), t('report.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('report.title', { name: targetUserName })}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 24, color: '#111' }}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>{t('report.reason_label')}</Text>
            <View style={styles.reasonsContainer}>
              {reasons.map((r) => (
                <TouchableOpacity 
                  key={r} 
                  style={[styles.reasonItem, reason === r && styles.reasonSelected]}
                  onPress={() => setReason(r)}
                >
                  <Text style={[styles.reasonText, reason === r && styles.reasonTextSelected]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('report.description_label')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('report.description_placeholder')}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>{t('report.evidence_label')}</Text>
            <View style={styles.imagesContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.evidenceImage} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
                <CameraIcon />
                <Text style={styles.addText}>{t('report.add_photo')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{t('report.submit')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  closeBtn: { padding: 4 },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 12, marginTop: 8 },
  reasonsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  reasonItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#F3F4F6' },
  reasonSelected: { backgroundColor: '#FFF0F2', borderColor: '#EE3F57' },
  reasonText: { fontSize: 14, color: '#666' },
  reasonTextSelected: { color: '#EE3F57', fontWeight: '600' },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, textAlignVertical: 'top', minHeight: 100, borderWeight: 1, borderColor: '#E5E7EB' },
  imagesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4, marginBottom: 40 },
  imageWrapper: { width: 80, height: 80, position: 'relative' },
  evidenceImage: { width: 80, height: 80, borderRadius: 8 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#000', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  removeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  addBtn: { width: 80, height: 80, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  addText: { fontSize: 11, color: '#EE3F57', marginTop: 4 },
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 12, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontWeight: '600', color: '#666' },
  submitBtn: { flex: 2, height: 50, borderRadius: 12, backgroundColor: '#EE3F57', alignItems: 'center', justifyContent: 'center' },
  submitText: { fontWeight: '600', color: '#fff' },
});
