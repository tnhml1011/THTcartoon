import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function SavedVideosScreen() {
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchSavedVideos = async () => {
      try {
        const savedRef = firestore()
          .collection('users')
          .doc(user.uid)
          .collection('savedVideos');
        const snapshot = await savedRef.get();
        // Lấy doc.id để biết id document để xóa
        const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedVideos(videos);
      } catch (err) {
        console.error('Lỗi khi tải phim đã lưu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedVideos();
  }, [user]);

  const handleDeleteVideo = (videoId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa phim này khỏi danh sách đã lưu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore()
                .collection('users')
                .doc(user.uid)
                .collection('savedVideos')
                .doc(videoId)
                .delete();

              setSavedVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
            } catch (error) {
              console.error('Lỗi khi xóa phim:', error);
              Alert.alert('Lỗi', 'Xóa phim không thành công. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#000"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );

  if (savedVideos.length === 0)
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>Chưa có phim nào được lưu.</Text>
      </View>
    );

  return (
    <FlatList
      data={savedVideos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('VideoScreen', {
              videoUrl: item.videoUrl,
              title: item.title,
              author: item.author,
              thumbnail: item.thumbnail,
            })
          }
        >
          <Image
            source={{ uri: item.thumbnail || 'https://placehold.co/320x180?text=No+Image' }}
            style={styles.thumbnail}
          />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.author}>{item.author}</Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteVideo(item.id)}
          >
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    marginVertical: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 10,
    elevation: 1,
    alignItems: 'center',
  },
  thumbnail: {
    width: 120,
    height: 70,
  },
  info: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  author: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#ff4444',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    height: 70,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
