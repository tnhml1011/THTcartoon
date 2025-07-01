import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

export default function useSavedVideos() {
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth().currentUser;

  const fetchSavedVideos = async () => {
    if (!user) return;
    try {
      const savedRef = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('savedVideos');
      const snapshot = await savedRef.get();
      const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedVideos(videos);
    } catch (err) {
      console.error('Lỗi khi tải phim đã lưu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return { savedVideos, loading, handleDeleteVideo, fetchSavedVideos };
} 