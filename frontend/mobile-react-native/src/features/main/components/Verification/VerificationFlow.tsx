import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import LivenessCamera from './LivenessCamera';
import LivenessChallenge from './LivenessChallenge';
import { verificationService } from '../../../../services/api/verificationService';

enum Step {
  Intro = 1,
  IdFront = 2,
  IdBack = 3,
  Liveness = 4,
  Processing = 5,
  Success = 6,
}

const VerificationFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Intro);
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [frontImage, setFrontImage] = useState<any>(null);
  const [backImage, setBackImage] = useState<any>(null);
  const [selfieImage, setSelfieImage] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async (type: 'front' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Lấy toàn bộ ảnh gốc, không ép crop
      quality: 1,           // Chất lượng tối đa
    });

    if (!result.canceled) {
      if (type === 'front') setFrontImage(result.assets[0]);
      else setBackImage(result.assets[0]);
    }
  };

  const handleCaptureSelfie = (uri: string) => {
    setSelfieImage({ uri });
    setShowCamera(false);
    setCurrentStep(Step.Processing);
    submitData(uri);
  };

  const submitData = async (selfieUri: string) => {
    setIsLoading(true);
    try {
      await verificationService.submitVerification({
        idNumber: '123456789', // Placeholder
        fullName: 'Nguyen Van A', // Placeholder
        frontImage,
        backImage,
        selfieImage: { uri: selfieUri },
      });
      setCurrentStep(Step.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
      setCurrentStep(Step.Liveness);
    } finally {
      setIsLoading(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.fullscreen}>
        <LivenessCamera 
          onCapture={handleCaptureSelfie} 
          onClose={() => setShowCamera(false)} 
        />
        {/* Optional: Add LivenessChallenge overlay here */}
      </View>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case Step.Intro:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="shield-checkmark" size={80} color="#ff4757" />
            <Text style={styles.title}>Identity Verification</Text>
            <Text style={styles.description}>
              To keep our community safe, we need to verify your identity. This process only takes 2 minutes.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>1. Photo of your ID card (Front & Back)</Text>
              <Text style={styles.infoText}>2. A live selfie with anti-spoof check</Text>
            </View>
            <TouchableOpacity style={styles.mainButton} onPress={() => setCurrentStep(Step.IdFront)}>
              <Text style={styles.mainButtonText}>Start Verification</Text>
            </TouchableOpacity>
          </View>
        );

      case Step.IdFront:
      case Step.IdBack:
        const isFront = currentStep === Step.IdFront;
        const currentImg = isFront ? frontImage : backImage;
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{isFront ? 'ID Card Front' : 'ID Card Back'}</Text>
            <Text style={styles.stepSub}>Please upload a clear photo of your ID card</Text>
            
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(isFront ? 'front' : 'back')}>
              {currentImg ? (
                <Image source={{ uri: currentImg.uri }} style={styles.previewImage} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={40} color="#a4b0be" />
                  <Text style={styles.uploadText}>Tap to upload photo</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mainButton, !currentImg && styles.disabledButton]} 
              disabled={!currentImg}
              onPress={() => setCurrentStep(isFront ? Step.IdBack : Step.Liveness)}
            >
              <Text style={styles.mainButtonText}>Next Step</Text>
            </TouchableOpacity>
          </View>
        );

      case Step.Liveness:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="person-circle-outline" size={80} color="#ff4757" />
            <Text style={styles.stepTitle}>Face Verification</Text>
            <Text style={styles.stepSub}>Now we'll check if you're a real person. Follow the prompts on screen.</Text>
            
            <TouchableOpacity style={styles.mainButton} onPress={() => setShowCamera(true)}>
              <Text style={styles.mainButtonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>
        );

      case Step.Processing:
        return (
          <View style={styles.stepContent}>
            <ActivityIndicator size="large" color="#ff4757" />
            <Text style={styles.title}>Processing...</Text>
            <Text style={styles.description}>
              Our AI is analyzing your photos. This may take a few seconds.
            </Text>
          </View>
        );

      case Step.Success:
        return (
          <View style={styles.stepContent}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.title}>Under Review</Text>
            <Text style={styles.description}>
              Your verification has been submitted successfully. We'll notify you once it's approved!
            </Text>
            <TouchableOpacity style={styles.mainButton} onPress={() => { /* Navigate back */ }}>
              <Text style={styles.mainButtonText}>Back to Profile</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderStep()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f3542',
    marginTop: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#747d8c',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#f1f2f6',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginTop: 30,
  },
  infoText: {
    fontSize: 15,
    color: '#2f3542',
    marginBottom: 10,
    fontWeight: '500',
  },
  mainButton: {
    backgroundColor: '#ff4757',
    height: 56,
    borderRadius: 28,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ced6e0',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  stepSub: {
    fontSize: 15,
    color: '#747d8c',
    marginTop: 5,
    marginBottom: 30,
  },
  uploadBox: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#ced6e0',
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  uploadText: {
    color: '#a4b0be',
    marginTop: 10,
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default VerificationFlow;
