import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { cloudinary } from '../config/cloudinary';

const ImagePicker = ({ value, onChange, style }) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewImageModal, setViewImageModal] = useState(false);

  const handleImagePick = async (type) => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      };

      const result = type === 'camera' 
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        return;
      }

      setLoading(true);
      setModalVisible(false);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        type: result.assets[0].type,
        name: result.assets[0].fileName,
      });
      formData.append('upload_preset', 'imagemanage');
      formData.append('folder', 'profile');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Đang tải ảnh...</Text>
          </View>
        ) : (
          <Image
            source={{ uri: value || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
            style={styles.image}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {value ? (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  setModalVisible(false);
                  setViewImageModal(true);
                }}
              >
                <Text style={styles.optionText}>👁️ Xem ảnh đại diện</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleImagePick('camera')}
            >
              <Text style={styles.optionText}>📸 Chụp ảnh mới</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleImagePick('gallery')}
            >
              <Text style={styles.optionText}>🖼️ Chọn từ thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, styles.cancelOption]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.optionText, styles.cancelText]}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={viewImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewImageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setViewImageModal(false)}
        >
          <View style={styles.viewImageModalContent}>
            <Image
              source={{ uri: value || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    marginTop: 8,
    color: '#3498db',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cancelText: {
    color: '#e74c3c',
  },
  viewImageModalContent: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  fullImage: {
    width: '90%',
    height: '70%',
    borderRadius: 16,
  },
});

export default ImagePicker; 