import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';


import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore, { FieldValue } from '@react-native-firebase/firestore';
const VideoScreen = ({ route }) => {
  const { videoUrl, title, author, thumbnail } = route.params;
  const navigation = useNavigation();

  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const user = auth().currentUser;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snapshot = await firestore().collection('videos').get();
        const allVideos = snapshot.docs.map(doc => doc.data());
        const filtered = allVideos.filter(video => video.videoUrl !== videoUrl);
        const randomFive = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);
        setRelatedVideos(randomFive);
      } catch (error) {
        console.error('Lỗi khi lấy video từ Firestore:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkIfSaved = async () => {
      if (!user) return;
      try {
        const savedSnapshot = await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('savedVideos')
          .where('videoUrl', '==', videoUrl)
          .get();

        if (!savedSnapshot.empty) {
          setIsSaved(true);
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra phim đã lưu:', error);
      }
    };

    fetchVideos();
    checkIfSaved();
  }, [videoUrl]);

  

const handleSaveVideo = async () => {
  if (!user) {
    Alert.alert('Lỗi', 'Bạn cần đăng nhập để lưu phim.');
    return;
  }

  try {
    const videoData = {
      videoUrl,
      title,
      author,
      savedAt: FieldValue.serverTimestamp(),  // Dùng FieldValue đúng cách
    };

    if (thumbnail) {
      videoData.thumbnail = thumbnail;
    }

    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('savedVideos')
      .add(videoData);

    setIsSaved(true);
    Alert.alert('Thành công', 'Phim đã được lưu vào danh sách!');
  } catch (error) {
    console.error('Lỗi khi lưu phim:', error);
    Alert.alert('Lỗi', 'Không thể lưu phim. Vui lòng thử lại.');
  }
};




  return (
    <View style={styles.container}>
      <Video
        source={{ uri: encodeURI(videoUrl) }}
        style={styles.video}
        controls
        resizeMode="contain"
      />

      <ScrollView style={styles.infoContainer}>
        <View style={styles.metaContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.author}>Đăng bởi: {author}</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaved && { backgroundColor: '#888' }]}
          onPress={handleSaveVideo}
          disabled={isSaved}
        >
          <Text style={styles.saveButtonText}>
            {isSaved ? 'Đã lưu' : '+ Lưu phim'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.relatedHeader}>Phim liên quan</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        ) : (
          relatedVideos.map((video, index) => (
            <TouchableOpacity
              key={index}
              style={styles.relatedCard}
              onPress={() =>
                navigation.push('VideoScreen', {
                  videoUrl: video.videoUrl,
                  title: video.title,
                  author: video.author,
                  thumbnail: video.thumbnail,
                })
              }
            >
              <Image
                source={{ uri: video.thumbnail || 'https://placehold.co/120x70?text=No+Image' }}
                style={styles.thumbnail}
              />
              <View style={styles.relatedInfo}>
                <Text numberOfLines={2} style={styles.relatedTitle}>
                  {video.title}
                </Text>
                <Text style={styles.relatedAuthor}>{video.author}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.4,
    backgroundColor: '#000',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  metaContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  relatedHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#000',
  },
  relatedCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  thumbnail: {
    width: 120,
    height: 70,
    backgroundColor: '#ccc',
  },
  relatedInfo: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  relatedAuthor: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
});

export default VideoScreen;
