import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DetailMovieScreen = ({ route, navigation }) => {
  const { movie } = route.params;

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
    <ScrollView style={styles.container}>
      <Image source={{ uri: movie.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.title}>{movie.title}</Text>
      <Text style={styles.label}>ID</Text>
      <Text style={styles.value}>{movie.id}</Text>
      <View style={styles.divider} />
      <Text style={styles.label}>Tác giả</Text>
      <Text style={styles.value}>{movie.author}</Text>
      <Text style={styles.label}>Mô tả</Text>
      <Text style={styles.value}>{movie.description}</Text>
      <View style={styles.divider} />
      <Text style={styles.label}>Video URL</Text>
      <Text style={styles.value}>{movie.videoUrl}</Text>
      <Text style={styles.label}>Ngày</Text>
      <Text style={styles.value}>{movie.date}</Text>
      <Text style={styles.label}>Collection</Text>
      <Text style={styles.value}>{Array.isArray(movie.collection) ? movie.collection.join(', ') : ''}</Text>
      <Text style={styles.label}>Media type</Text>
      <Text style={styles.value}>{movie.mediatype}</Text>
      <View style={styles.divider} />
      <Text style={styles.label}>Lượt thích</Text>
      <Text style={styles.value}>{movie.like}</Text>
      <Text style={styles.label}>Lượt không thích</Text>
      <Text style={styles.value}>{movie.dislike}</Text>
      <Text style={styles.label}>Lượt xem</Text>
      <Text style={styles.value}>{movie.view}</Text>
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          icon="pencil"
          onPress={() => navigation.navigate('EditMovie', { movie })}
          style={{ flex: 1, marginRight: 10 }}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 16 }}
        >
          Sửa
        </Button>
        <Button
          mode="outlined"
          icon="delete"
          onPress={handleDelete}
          style={{ flex: 1, borderColor: 'red' }}
          color="red"
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 16 }}
        >
          Xóa
        </Button>
      </View>
      <View style={{height: 80}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  thumbnail: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    color: '#888',
    marginTop: 10,
    marginBottom: 2,
    fontSize: 14,
  },
  value: {
    color: '#222',
    fontSize: 15,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 28,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
});

export default DetailMovieScreen; 