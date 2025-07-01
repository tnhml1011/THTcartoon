import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const EditMovieScreen = ({ route, navigation }) => {
  const { movie } = route.params;
  const [title, setTitle] = useState(movie.title || '');
  const [author, setAuthor] = useState(movie.author || '');
  const [description, setDescription] = useState(movie.description || '');
  const [thumbnail, setThumbnail] = useState(movie.thumbnail || '');
  const [videoUrl, setVideoUrl] = useState(movie.videoUrl || '');
  const [date, setDate] = useState(movie.date || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [collection, setCollection] = useState(Array.isArray(movie.collection) ? movie.collection.join(',') : '');
  const [mediatype, setMediatype] = useState(movie.mediatype || '');
  const [like, setLike] = useState(String(movie.like ?? 0));
  const [dislike, setDislike] = useState(String(movie.dislike ?? 0));
  const [view, setView] = useState(String(movie.view ?? 0));

  const handleUpdate = async () => {
    try {
      await firestore().collection('videos').doc(movie.id).update({
        title,
        author,
        description,
        thumbnail,
        videoUrl,
        date: date || null,
        collection: collection.trim() ? collection.split(',').map(s => s.trim()) : [],
        mediatype,
        like: isNaN(Number(like)) ? 0 : Number(like),
        dislike: isNaN(Number(dislike)) ? 0 : Number(dislike),
        view: isNaN(Number(view)) ? 0 : Number(view),
      });
      Alert.alert('Thành công', 'Đã cập nhật phim!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật phim: ' + (e?.message || ''));
    }
  };

  const handleDelete = async () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa phim này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await firestore().collection('videos').doc(movie.id).delete();
          Alert.alert('Đã xóa phim');
          navigation.goBack();
        } catch (e) {
          Alert.alert('Lỗi', 'Không thể xóa phim');
        }
      }}
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <TextInput label="Tiêu đề" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" />
      <TextInput label="Tác giả" value={author} onChangeText={setAuthor} style={styles.input} mode="outlined" />
      <TextInput label="Mô tả" value={description} onChangeText={setDescription} style={styles.input} mode="outlined" multiline />
      <TextInput label="Thumbnail URL" value={thumbnail} onChangeText={setThumbnail} style={styles.input} mode="outlined" />
      <TextInput label="Video URL" value={videoUrl} onChangeText={setVideoUrl} style={styles.input} mode="outlined" />
      <TextInput
        label="Ngày (ISO)"
        value={date}
        onChangeText={setDate}
        style={styles.input}
        mode="outlined"
        right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
      />
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
      <TextInput
        label="Collection (phân cách dấu phẩy)"
        value={collection}
        onChangeText={setCollection}
        style={styles.input}
        mode="outlined"
      />
      <TextInput label="Media type" value={mediatype} onChangeText={setMediatype} style={styles.input} mode="outlined" />
      <TextInput label="Lượt thích" value={like} onChangeText={setLike} style={styles.input} mode="outlined" keyboardType="numeric" />
      <TextInput label="Lượt không thích" value={dislike} onChangeText={setDislike} style={styles.input} mode="outlined" keyboardType="numeric" />
      <TextInput label="Lượt xem" value={view} onChangeText={setView} style={styles.input} mode="outlined" keyboardType="numeric" />
      <Button mode="contained" onPress={handleUpdate} style={{ marginTop: 16 }}>Lưu thay đổi</Button>
      <Button mode="outlined" onPress={handleDelete} style={{ marginTop: 8 }} color="red">Xóa phim</Button>
      <View style={{height: 80}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: { marginBottom: 12 },
});

export default EditMovieScreen; 