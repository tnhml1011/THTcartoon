import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Image ,FlatList, TextInput, Alert } from 'react-native';
import Video from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const VideoScreen = ({ route, navigation }) => {
  const { videoId, videoUrl, title, author, description, date, thumbnail } = route.params;
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [userLiked, setUserLiked] = useState(false);
  const [userSaved, setUserSaved] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [suggestedVideos, setSuggestedVideos] = useState([]);

  const user = auth().currentUser;
    useEffect(() => {
  // Lắng nghe Likes
  const unsubscribeLikes = firestore()
    .collection('videos')
    .doc(videoId)
    .collection('likes')
    .onSnapshot(snapshot => {
      setLikes(snapshot.size); // đếm số document = số lượt like
      if (user) {
        const liked = snapshot.docs.some(doc => doc.id === user.uid);
        setUserLiked(liked);
      }
    });

  // Lắng nghe Comments
  const unsubscribeComments = firestore()
    .collection('videos')
    .doc(videoId)
    .collection('comments')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(data);
    });

  return () => {
    unsubscribeLikes();
    unsubscribeComments();
  };
}, [videoId, user]);  
  // useEffect(() => {
  //   const unsubscribe = firestore()
  //     .collection('videos')
  //     .doc(videoId)
  //     .onSnapshot(doc => {
  //       if (doc.exists && doc.data()) {
  //         setLikes(doc.data().likes || 0);
  //       } else {
  //         setLikes(0);
  //       }
  //     });

  //   const unsubscribeComments = firestore()
  //     .collection('videos')
  //     .doc(videoId)
  //     .collection('comments')
  //     .orderBy('createdAt', 'desc')
  //     .onSnapshot(snapshot => {
  //       const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //       setComments(data);
  //     });

  //   return () => {
  //     unsubscribe();
  //     unsubscribeComments();
  //   };
  // }, [videoId]);

  // Kiểm tra user đã like/save chưa
  useEffect(() => {
    if (user) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then(doc => {
          if (doc.exists) {
            setUserLiked(doc.data().likedVideos?.includes(videoId) || false);
            setUserSaved(doc.data().savedVideos?.includes(videoId) || false);
          }
        });
    }
  }, [user, videoId]);

  // Lấy 5 video ngẫu nhiên (sau này bạn thay bằng theo tag)
  useEffect(() => {
    firestore()
      .collection('videos')
      .get()
      .then(snapshot => {
        let allVideos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allVideos = allVideos.filter(v => v.id !== videoId); // bỏ video hiện tại

        // shuffle & lấy 5 video
        let shuffled = allVideos.sort(() => 0.5 - Math.random());
        setSuggestedVideos(shuffled.slice(0, 5));
      });
  }, [videoId]);

  // Toggle Like
  const handleLike = async () => {
  if (!user) {
    Alert.alert('Bạn cần đăng nhập để thích video');
    return;
  }

  const likeRef = firestore()
    .collection('videos')
    .doc(videoId)
    .collection('likes')
    .doc(user.uid);

  const docSnap = await likeRef.get();

  if (docSnap.exists) {
    // đã like rồi -> unlike
    await likeRef.delete();
    setUserLiked(false);
  } else {
    // chưa like -> tạo mới
    await likeRef.set({
      userId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    setUserLiked(true);
  }
};

  // Toggle Save
  const handleSave = async () => {
    if (!user) {
      Alert.alert('Bạn cần đăng nhập để lưu video');
      return;
    }

    const userRef = firestore().collection('users').doc(user.uid);

    await userRef.get().then(doc => {
      let savedVideos = doc.data().savedVideos || [];

      if (savedVideos.includes(videoId)) {
        savedVideos = savedVideos.filter(id => id !== videoId);
        setUserSaved(false);
      } else {
        savedVideos.push(videoId);
        setUserSaved(true);
      }

      userRef.update({ savedVideos });
    });
  };

  // Gửi comment
  const handleComment = async () => {
  if (!user) {
    Alert.alert('Bạn cần đăng nhập để bình luận');
    return;
  }
  if (!commentText.trim()) return;

  await firestore()
    .collection('videos')
    .doc(videoId)
    .collection('comments')
    .add({
      text: commentText,
      userId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

  setCommentText('');
};
  return (
    <View style={styles.container}>
      <Video source={{ uri: videoUrl }} style={styles.video} controls resizeMode="contain" />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>Tác giả: {author}</Text>
      <Text style={styles.meta}>Ngày: {date}</Text>
      <Text style={styles.description}>
        {showFullDesc 
          ? description 
          : description.length > 100 
            ? description.substring(0, 100) + "..." 
            : description}
      </Text>

      {description.length > 100 && (
        <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
          <Text style={styles.moreLess}>
            {showFullDesc ? "Thu gọn" : "Xem thêm"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Nút Like & Save */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.button}>
          <Text>{userLiked ? '💖 Bỏ Thích' : '👍 Thích'} ({likes})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.button}>
          <Text>{userSaved ? '💾 Đã lưu' : '💾 Lưu Video'}</Text>
        </TouchableOpacity>
      </View>

      {/* Bình luận */}
      <Text style={styles.commentHeader}>Bình luận</Text>
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text style={styles.comment}>{item.text}</Text>}
      />
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

      {/* Video gợi ý */}
<Text style={styles.suggestHeader}>Có thể bạn cũng thích</Text>
      <FlatList
        data={suggestedVideos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestItem}
            onPress={() => navigation.push('VideoScreen', { ...item, videoId: item.id })}
          >
            {/* Thumbnail bên trái */}
           {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            ) : (
              <View
                style={[
                  styles.thumbnail,
                  { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }
                ]}
              >
                <Text>🎬</Text>
              </View>
                )}

            {/* Thông tin bên phải */}
            <View style={styles.suggestInfo}>
              <Text numberOfLines={2} style={styles.suggestTitle}>{item.title}</Text>
              <Text style={styles.suggestMeta}>👤 {item.author}</Text>
              <Text style={styles.suggestMeta}>📅 {item.date || 'Không rõ'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  video: { width: '100%', height: 200, backgroundColor: '#000' },
  title: { fontWeight: 'bold', fontSize: 18, marginVertical: 8 },
  meta: { fontSize: 14, color: '#555' },
  description: { marginVertical: 8 },
  moreLess: { color: 'blue', marginBottom: 5 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  button: { padding: 10, backgroundColor: '#eee', borderRadius: 8 },
  commentHeader: { fontWeight: 'bold', marginVertical: 10, fontSize: 16 },
  comment: { backgroundColor: '#f1f1f1', padding: 5, borderRadius: 5, marginVertical: 2 },
  commentBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 5, marginRight: 5 },
  suggestHeader: { fontWeight: 'bold', fontSize: 16, marginVertical: 10 },
  suggestItem: { padding: 10, backgroundColor: '#fafafa', borderRadius: 8, marginVertical: 5 },
  suggestTitle: { fontSize: 15, fontWeight: '600' },
  suggestMeta: { fontSize: 13, color: '#666' },
  suggestHeader: {
  fontWeight: 'bold',
  fontSize: 16,
  marginVertical: 10,
},
suggestItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 8,
  backgroundColor: '#fff',
  borderRadius: 8,
  marginVertical: 5,
  elevation: 2, // bóng nhẹ trên Android
  shadowColor: '#000', // bóng trên iOS
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
thumbnailBox: {
  marginRight: 10,
},
thumbnail: {
  width: 100,
  height: 60,
  borderRadius: 6,
},
suggestInfo: {
  flex: 1,
  justifyContent: 'center',
},
suggestTitle: {
  fontSize: 15,
  fontWeight: '600',
  marginBottom: 4,
},
suggestMeta: {
  fontSize: 13,
  color: '#666',
},

});

export default VideoScreen;
