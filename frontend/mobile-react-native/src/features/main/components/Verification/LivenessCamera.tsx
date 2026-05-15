import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface LivenessCameraProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

const LivenessCamera: React.FC<LivenessCameraProps> = ({ onCapture, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1, // Chụp với chất lượng cao nhất
          base64: false,
        });
        if (photo) {
          onCapture(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <View style={[styles.faceGuide, styles.faceDetected]} />
          
          <View style={styles.controls}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>
            Position your face in the box and tap to capture
          </Text>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 280,
    height: 350,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 140,
    borderStyle: 'dashed',
  },
  faceDetected: {
    borderColor: '#4CAF50',
    borderStyle: 'solid',
    borderWidth: 3,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    position: 'absolute',
    top: 60,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  button: {
    backgroundColor: '#ff4757',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LivenessCamera;
