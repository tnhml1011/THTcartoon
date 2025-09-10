import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Hàm format thời gian "x phút trước"
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString();
};

const VideoScreen = ({ route, navigation }) => {
  const { videoId } = route.params;

  const [user, setUser] = useState(auth().currentUser);
  const [video, setVideo] = useState(null);
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userSaved, setUserSaved] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  const ensureUserDoc = async (uid) => {
    const ref = firestore().collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        likedVideos: [],
        savedVideos: [],
        viewedCollections: {},
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    }
    return ref;
  };

  // Lấy video & comment
  useEffect(() => {
    if (!videoId) return;

    const videoRef = firestore().collection('videos').doc(videoId);

    const unsubVideo = videoRef.onSnapshot(snap => {
      if (snap.exists) {
        const data = snap.data();
        setVideo({ id: snap.id, ...data });
        setLikes(data.likes || 0);

        // cập nhật thói quen xem (lưu collection)
        if (user && data.collection) {
          const userRef = firestore().collection('users').doc(user.uid);
          userRef.set(
            { viewedCollections: { [data.collection]: firestore.FieldValue.increment(1) } },
            { merge: true }
          );
        }
      } else {
        setVideo(null);
      }
    });

    const unsubComments = videoRef
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        const arr = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setComments(arr);
      });

    return () => {
      unsubVideo();
      unsubComments();
    };
  }, [videoId, user]);

  // Kiểm tra Like/Save
  useEffect(() => {
    (async () => {
      if (!user) {
        setUserLiked(false);
        setUserSaved(false);
        return;
      }
      const ref = await ensureUserDoc(user.uid);
      const snap = await ref.get();
      const data = snap.data() || {};
      setUserLiked((data.likedVideos || []).includes(videoId));
      setUserSaved((data.savedVideos || []).includes(videoId));
    })();
  }, [user, videoId]);

  // Lấy video gợi ý theo collection, nếu chưa đủ thì thêm ngẫu nhiên
  useEffect(() => {
    (async () => {
      if (!video) return;

      let suggested = [];

      // Lấy video cùng collection
      if (video.collection) {
        const snap = await firestore()
          .collection('videos')
          .where('collection', '==', video.collection)
          .limit(6)
          .get();

        suggested = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(v => v.id !== videoId);
      }

      // Nếu chưa đủ 5 thì bổ sung ngẫu nhiên
      if (suggested.length < 5) {
        const snapAll = await firestore().collection('videos').get();
        const allVideos = snapAll.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(v => v.id !== videoId && !suggested.some(s => s.id === v.id));

        const shuffled = allVideos.sort(() => 0.5 - Math.random());
        suggested = [...suggested, ...shuffled.slice(0, 5 - suggested.length)];
      }

      setSuggestedVideos(suggested);
    })();
  }, [video, videoId]);

  // Like
  const handleLike = async () => {
    if (!user) {
      Alert.alert('Bạn cần đăng nhập để thích video');
      return;
    }
    const userRef = await ensureUserDoc(user.uid);
    const videoRef = firestore().collection('videos').doc(videoId);
    const snap = await userRef.get();
    const data = snap.data() || {};
    let liked = data.likedVideos || [];

    if (liked.includes(videoId)) {
      liked = liked.filter(v => v !== videoId);
      await Promise.all([
        userRef.update({ likedVideos: liked }),
        videoRef.update({ likes: firestore.FieldValue.increment(-1) }),
      ]);
      setUserLiked(false);
    } else {
      liked.push(videoId);
      await Promise.all([
        userRef.update({ likedVideos: liked }),
        videoRef.update({ likes: firestore.FieldValue.increment(1) }),
      ]);
      setUserLiked(true);
    }
  };

  // Save
  const handleSave = async () => {
    if (!user) {
      Alert.alert('Bạn cần đăng nhập để lưu video');
      return;
    }
    const userRef = await ensureUserDoc(user.uid);
    const snap = await userRef.get();
    const data = snap.data() || {};
    let saved = data.savedVideos || [];

    if (saved.includes(videoId)) {
      saved = saved.filter(v => v !== videoId);
      await userRef.update({ savedVideos: saved });
      setUserSaved(false);
    } else {
      saved.push(videoId);
      await userRef.update({ savedVideos: saved });
      setUserSaved(true);
    }
  };

  // Comment
  const handleComment = async () => {
    if (!user) {
      Alert.alert('Bạn cần đăng nhập để bình luận');
      return;
    }
    if (!commentText.trim()) return;
    const videoRef = firestore().collection('videos').doc(videoId);

    await videoRef.collection('comments').add({
      text: commentText.trim(),
      userId: user.uid,
      userName: user.displayName || user.email || 'Người dùng',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    setCommentText('');
  };

  if (!video) return <Text style={{ padding: 20 }}>❌ Không tìm thấy video</Text>;

  return (
    <FlatList
      data={comments}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.commentItem}>
          <Text style={styles.commentUser}>
            👤 {item.userName}{' '}
            <Text style={styles.commentTime}>
              • {formatRelativeTime(item.createdAt)}
            </Text>
          </Text>
          <Text>{item.text}</Text>
        </View>
      )}
      ListHeaderComponent={
        <View>
          <Video source={{ uri: video.videoUrl }} style={styles.video} controls resizeMode="contain" />
          <Text style={styles.title}>{video.title}</Text>
          <Text style={styles.meta}>👤 {video.author}</Text>
          <Text style={styles.meta}>📅 {video.date}</Text>

          <Text
            style={styles.description}
            numberOfLines={showFullDesc ? undefined : 3}
          >
            {video.description}
          </Text>
          {video.description && video.description.length > 100 && (
            <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
              <Text style={styles.showMore}>
                {showFullDesc ? '🔼 Thu gọn' : '🔽 Xem thêm'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleLike} style={styles.button}>
              <Text>{userLiked ? '💖 Bỏ thích' : '👍 Thích'} ({likes})</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.button}>
              <Text>{userSaved ? '💾 Đã lưu' : '💾 Lưu video'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.commentHeader}>Bình luận ({comments.length})</Text>
        </View>
      }
      ListFooterComponent={
        <View>
          <View style={styles.commentBox}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Nhập bình luận..."
              style={styles.input}
            />
            <TouchableOpacity onPress={handleComment} style={styles.button}>
              <Text>Gửi</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.relatedTitle}>Video gợi ý</Text>
          {suggestedVideos.map(v => (
            <TouchableOpacity
              key={v.id}
              style={styles.relatedItem}
              onPress={() => navigation.push('VideoScreen', { videoId: v.id })}
            >
              {v.thumbnail ? (
                <Image source={{ uri: v.thumbnail }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text>🎬</Text>
                </View>
              )}
              <View style={styles.relatedInfo}>
                <Text numberOfLines={2} style={styles.relatedVideoTitle}>{v.title}</Text>
                <Text style={styles.suggestMeta}>👤 {v.author}</Text>
                <Text style={styles.suggestMeta}>📅 {v.date || 'Không rõ'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      }
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Chưa có bình luận</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  video: { width: '100%', height: 220, backgroundColor: '#000' },
  title: { fontWeight: 'bold', fontSize: 18, marginVertical: 8 },
  meta: { fontSize: 14, color: '#555' },
  description: { marginVertical: 8, fontSize: 14 },
  showMore: { color: '#007bff', marginTop: 4, fontWeight: '500' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  button: { padding: 10, backgroundColor: '#eee', borderRadius: 8 },
  commentHeader: { fontWeight: 'bold', marginVertical: 10, fontSize: 16 },
  commentItem: { marginVertical: 6, backgroundColor: '#f1f1f1', padding: 8, borderRadius: 6 },
  commentUser: { fontWeight: 'bold', color: '#333', marginBottom: 2 },
  commentTime: { fontSize: 12, color: '#777', fontWeight: 'normal' },
  commentBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginRight: 8 },
  relatedTitle: { fontWeight: 'bold', fontSize: 16, marginVertical: 10 },
  relatedItem: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#fff', borderRadius: 8, marginVertical: 5 },
  thumbnail: { width: 100, height: 60, borderRadius: 6, marginRight: 10 },
  relatedInfo: { flex: 1 },
  relatedVideoTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  suggestMeta: { fontSize: 13, color: '#666' },
});

export default VideoScreen;
