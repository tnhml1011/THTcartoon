import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CLOUD_NAME = 'dhejopg9q';
const UPLOAD_PRESET = 'modzymovie';

const AddMovieScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailLocal, setThumbnailLocal] = useState('');
  const [videoLocal, setVideoLocal] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [date, setDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const uploadToCloudinary = async (uri, folder) => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: uri.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
      name: uri.split('/').pop() || 'upload',
    });
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('folder', folder);
    data.append('resource_type', 'auto');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: data,
    });
    return res.json();
  };

  const handleSelectThumbnail = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (!result.didCancel && !result.errorCode) {
      setThumbnailLocal(result.assets[0].uri);
    }
  };

  const handleSelectVideo = async () => {
    const result = await launchImageLibrary({
      mediaType: 'video',
    });
    if (!result.didCancel && !result.errorCode) {
      setVideoLocal(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !author || !thumbnailLocal || !videoLocal) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    setUploading(true);
    try {
      // Upload thumbnail
      let thumbnailCloudUrl = '';
      if (thumbnailLocal) {
        const uploadResult = await uploadToCloudinary(thumbnailLocal, 'movie_uploads/movie_thumbnails');
        thumbnailCloudUrl = uploadResult.secure_url;
        setThumbnailUrl(thumbnailCloudUrl);
      }
      // Upload video
      let videoCloudUrl = '';
      if (videoLocal) {
        const uploadResult = await uploadToCloudinary(videoLocal, 'movie_uploads/movie_videos');
        videoCloudUrl = uploadResult.secure_url;
        setVideoUrl(videoCloudUrl);
      }
      // Lưu Firestore
      await firestore().collection('videos').add({
        title,
        author,
        description,
        thumbnail: thumbnailCloudUrl,
        videoUrl: videoCloudUrl,
        date,
        createdAt: firestore.FieldValue.serverTimestamp(),
        like: 0,
        dislike: 0,
        view: 0,
      });
      Alert.alert('Thành công', 'Phim đã được thêm');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm phim');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Tiêu đề phim</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <Text style={styles.label}>Tác giả</Text>
      <TextInput
        value={author}
        onChangeText={setAuthor}
        style={styles.input}
      />
      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 100 }]}
        multiline
      />
      <Text style={styles.label}>Ảnh thumbnail</Text>
      <TouchableOpacity onPress={handleSelectThumbnail} style={styles.uploadButton} disabled={uploading}>
        {thumbnailLocal ? (
          <Image source={{ uri: thumbnailLocal }} style={styles.thumbnail} />
        ) : (
          <Text>Chọn ảnh thumbnail</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.label}>Video</Text>
      <TouchableOpacity onPress={handleSelectVideo} style={styles.uploadButton} disabled={uploading}>
        {videoLocal ? (
          <View style={{ alignItems: 'center' }}>
            <Icon name="video" size={32} color="#007bff" />
            <Text style={{ marginTop: 4, color: '#007bff', fontSize: 13 }} numberOfLines={1} ellipsizeMode="middle">
              {videoLocal.split('/').pop()}
            </Text>
          </View>
        ) : (
          <Text>Chọn video</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.label}>Ngày (ISO)</Text>
      <View style={styles.dateInputRow}>
        <TextInput
          value={date}
          onChangeText={setDate}
          style={[styles.input, { flex: 1 }]}
          placeholder="YYYY-MM-DDTHH:mm:ssZ"
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginLeft: 8 }} disabled={uploading}>
          <Icon name="calendar" size={28} color="#007bff" />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        date={date ? new Date(date) : new Date()}
        onConfirm={(selectedDate) => {
          setShowDatePicker(false);
          setDate(selectedDate.toISOString());
        }}
        onCancel={() => setShowDatePicker(false)}
      />
      <Button title={uploading ? 'Đang tải lên...' : 'Thêm phim'} onPress={handleSubmit} disabled={uploading} />
      <View style={{height: 80}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 20,
    borderRadius: 4,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default AddMovieScreen;