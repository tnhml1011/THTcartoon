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
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function SavedScreen() {
  const [loading, setLoading] = useState(true);
  const [savedVideos, setSavedVideos] = useState([]);
  const navigation = useNavigation();
  const user = auth().currentUser;

  // load danh sách video đã lưu
  useEffect(() => {
    if (!user) return;

    const unsub = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(async snap => {
        if (!snap.exists) {
          setSavedVideos([]);
          setLoading(false);
          return;
        }

        const data = snap.data() || {};
        const savedIds = data.savedVideos || [];

        if (savedIds.length === 0) {
          setSavedVideos([]);
          setLoading(false);
          return;
        }

        try {
          const promises = savedIds.map(id =>
            firestore().collection('videos').doc(id).get()
          );
          const docs = await Promise.all(promises);
          const videos = docs
            .filter(d => d.exists)
            .map(d => ({ id: d.id, ...d.data() }));
          setSavedVideos(videos);
        } catch (err) {
          console.error('Lỗi tải savedVideos:', err);
        }
        setLoading(false);
      });

    return () => unsub();
  }, [user]);

  // xóa video khỏi danh sách lưu
  const handleDeleteVideo = async videoId => {
    if (!user) return Alert.alert('Bạn cần đăng nhập');

    try {
      const userRef = firestore().collection('users').doc(user.uid);
      await userRef.update({
        savedVideos: firestore.FieldValue.arrayRemove(videoId),
      });
    } catch (e) {
      console.error('Lỗi khi xóa video:', e);
      Alert.alert('Có lỗi khi xóa video');
    }
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
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('VideoScreen', {
              videoId: item.id, // 🔑 Quan trọng: truyền videoId
              videoUrl: item.videoUrl,
              title: item.title,
              author: item.author,
              thumbnail: item.thumbnail,
              description: item.description,
              date: item.date,
              collection: item.collection,
              identifier: item.identifier,
              mediatype: item.mediatype,
            })
          }
        >
          <Image
            source={{
              uri: item.thumbnail || 'https://placehold.co/320x180?text=No+Image',
            }}
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
