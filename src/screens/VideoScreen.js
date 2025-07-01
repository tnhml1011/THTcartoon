import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore, { FieldValue } from '@react-native-firebase/firestore';
import { Modalize } from 'react-native-modalize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const VideoScreen = ({ route }) => {
  const { videoUrl, title, author, thumbnail, description, date, collection, identifier, mediatype } = route.params;
  const navigation = useNavigation();

  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const user = auth().currentUser;
  const [videoData, setVideoData] = useState({ view: 0, like: 0, dislike: 0 });
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', null
  const [reactionLoading, setReactionLoading] = useState(false);
  const videoId = identifier; // Dùng identifier làm videoId

  // Giả lập số likes/views
  const fakeLikes = '9,5 N';
  const fakeViews = '132.313';

  // Định dạng ngày
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Thêm hàm formatRelativeTime
  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    if (diffMin < 1) return 'Vừa xong';
    if (diffHour < 1) return `${diffMin} phút trước`;
    if (diffDay < 1) return `${diffHour} giờ trước`;
    if (diffWeek < 1) return `${diffDay} ngày trước`;
    if (diffMonth < 1) return `${diffWeek} tuần trước`;
    if (diffYear < 1) return `${diffMonth} tháng trước`;
    return `${diffYear} năm trước`;
  }

  // Hashtag từ collection
  const hashtags = Array.isArray(collection) ? collection : [];

  const modalizeRef = useRef(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const windowHeight = Dimensions.get('window').height;
  const snapHeight = windowHeight * 0.6;
  const fullHeight = windowHeight * 0.98;

  function getYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.getFullYear();
  }
  function getDayMonth(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()} thg ${d.getMonth() + 1}`;
  }

  const openModal = () => {
    modalizeRef.current?.open();
  };
  const closeModal = () => {
    if (modalizeRef.current) {
      modalizeRef.current.close();
    }
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snapshot = await firestore().collection('videos').get();
        const allVideos = snapshot.docs.map(doc => ({
          ...doc.data(),
          identifier: doc.id,
        }));
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

  useEffect(() => {
    if (!videoId) return;
    const unsubscribe = firestore()
      .collection('videos')
      .doc(videoId)
      .onSnapshot(doc => {
        if (doc.exists && doc.data()) {
          const data = doc.data();
          setVideoData({
            view: data.view ?? 0,
            like: data.like ?? 0,
            dislike: data.dislike ?? 0,
          });
        } else {
          setVideoData({ view: 0, like: 0, dislike: 0 });
        }
      });
    return () => unsubscribe();
  }, [videoId]);

  useEffect(() => {
    if (!user || !videoId) return;
    const unsubscribe = firestore()
      .collection('videos')
      .doc(videoId)
      .collection('likes')
      .doc(user.uid)
      .onSnapshot(doc => {
        if (doc.exists && doc.data()) {
          setUserReaction(doc.data().type ?? null);
        } else {
          setUserReaction(null);
        }
      });
    return () => unsubscribe();
  }, [user, videoId]);

  // Tăng view mỗi lần màn hình được focus (chuyên nghiệp như YouTube)
  useFocusEffect(
    useCallback(() => {
      if (!videoId) return;
      const videoRef = firestore().collection('videos').doc(videoId);
      videoRef.update({
        view: FieldValue.increment(1)
      });
    }, [videoId])
  );

  // Like/Dislike chuyên nghiệp
  const handleReaction = async (type) => {
    if (!user || !videoId) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để like/dislike!');
      return;
    }
    setReactionLoading(true);
    const videoRef = firestore().collection('videos').doc(videoId);
    const userLikeRef = videoRef.collection('likes').doc(user.uid);
    try {
      if (userReaction === type) {
        // Bỏ like/dislike
        await userLikeRef.delete();
        await videoRef.update({
          [type]: FieldValue.increment(-1)
        });
      } else if (userReaction) {
        // Chuyển từ like sang dislike hoặc ngược lại
        await userLikeRef.set({ type });
        await videoRef.update({
          [userReaction]: FieldValue.increment(-1),
          [type]: FieldValue.increment(1)
        });
      } else {
        // Like/dislike mới
        await userLikeRef.set({ type });
        await videoRef.update({
          [type]: FieldValue.increment(1)
        });
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác. Vui lòng thử lại!');
    } finally {
      setReactionLoading(false);
    }
  };

  const handleSaveVideo = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để lưu phim.');
      return;
    }
    try {
      const videoData = {
        videoUrl,
        title,
        author,
        thumbnail,
        description,
        date,
        collection,
        identifier,
        mediatype,
        savedAt: FieldValue.serverTimestamp(),
      };
      // Loại bỏ các trường undefined/null
      Object.keys(videoData).forEach(
        (key) => (videoData[key] === undefined || videoData[key] === null) && delete videoData[key]
      );
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
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
    <>
      <View style={styles.container}>
        <Video
          source={{ uri: encodeURI(videoUrl) }}
          style={styles.video}
          controls
          resizeMode="contain"
        />
        <ScrollView style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.rowInfoBlock}>
            <Text style={styles.statText}>{videoData.view ?? 0} <Text style={styles.statLabel}>lượt xem</Text></Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.statText}>{formatRelativeTime(date)}</Text>
            <Text style={styles.dot}>·</Text>
            <TouchableOpacity onPress={openModal} activeOpacity={0.8}>
              <Text style={styles.seeMore}>... xem thêm</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reactionButtons}>
            <TouchableOpacity
              style={[styles.reactionBtn, userReaction === 'like' && styles.activeReaction]}
              onPress={() => handleReaction('like')}
              disabled={reactionLoading}
              activeOpacity={reactionLoading ? 0.5 : 0.8}
            >
              <Icon name="thumb-up" size={24} color={userReaction === 'like' ? '#007bff' : '#666'} />
              <Text style={[styles.reactionText, userReaction === 'like' && styles.activeReactionText]}>Like</Text>
              <Text style={styles.reactionCount}>{videoData.like ?? 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reactionBtn, userReaction === 'dislike' && styles.activeReaction]}
              onPress={() => handleReaction('dislike')}
              disabled={reactionLoading}
              activeOpacity={reactionLoading ? 0.5 : 0.8}
            >
              <Icon name="thumb-down" size={24} color={userReaction === 'dislike' ? '#007bff' : '#666'} />
              <Text style={[styles.reactionText, userReaction === 'dislike' && styles.activeReactionText]}>Dislike</Text>
              <Text style={styles.reactionCount}>{videoData.dislike ?? 0}</Text>
            </TouchableOpacity>
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
                    description: video.description,
                    date: video.date,
                    collection: video.collection,
                    identifier: video.identifier,
                    mediatype: video.mediatype,
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
      <Modalize
        ref={modalizeRef}
        snapPoint={snapHeight}
        modalHeight={fullHeight}
        snapPoints={[snapHeight, fullHeight]}
        withHandle
        withOverlay={false}
        panGestureEnabled
        disableScrollIfPossible={false}
        adjustToContentHeight={false}
        modalStyle={{ marginTop: 30, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
        onClose={() => {
          setShowFullDesc(false);
        }}
        HeaderComponent={
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalMainTitle}>Nội dung mô tả</Text>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={closeModal}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={28} color="#222" />
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 160 }}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalStatsRowBig}>
            <View style={styles.statColBig}>
              <Text style={styles.statNumBig}>{videoData.like ?? 0}</Text>
              <Text style={styles.statLabelBig}>Lượt thích</Text>
            </View>
            <View style={styles.statColBig}>
              <Text style={styles.statNumBig}>{videoData.view ?? 0}</Text>
              <Text style={styles.statLabelBig}>Lượt xem</Text>
            </View>
            <View style={styles.statColBig}>
              <Text style={styles.statNumBig}>{getYear(date)}</Text>
              <Text style={styles.statLabelBig}>{getDayMonth(date)}</Text>
            </View>
          </View>
          <View style={styles.hashtagRow}>
            {hashtags.map((tag, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>#{tag}</Text>
              </View>
            ))}
          </View>
          {thumbnail ? (
            <Image
              source={{ uri: thumbnail }}
              style={styles.modalThumbnail}
              resizeMode="cover"
            />
          ) : null}
          <Text style={styles.modalInfo}>Tác giả: {author}</Text>
          {identifier ? <Text style={styles.modalInfo}>ID: {identifier}</Text> : null}
          {mediatype ? <Text style={styles.modalInfo}>Loại: {mediatype}</Text> : null}
          {!showFullDesc ? (
            <>
              <Text
                style={styles.modalDescription}
                numberOfLines={4}
                ellipsizeMode="tail"
              >
                {description || 'Không có mô tả.'}
              </Text>
              {description && description.length > 120 && (
                <TouchableOpacity style={styles.seeMoreBtn} onPress={() => setShowFullDesc(true)}>
                  <Text style={styles.seeMoreText}>...thêm</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <Text style={styles.modalDescription}>{description || 'Không có mô tả.'}</Text>
              <TouchableOpacity style={styles.seeMoreBtn} onPress={() => setShowFullDesc(false)}>
                <Text style={styles.seeMoreText}>Thu gọn</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modalize>
    </>
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
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  modalMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#222',
  },
  closeBtn: {
    position: 'absolute',
    right: 10,
    top: 2,
    padding: 4,
    zIndex: 10,
  },
  modalThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginTop: 10,
  },
  reactionButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeReaction: {
    backgroundColor: '#e6f2ff',
  },
  reactionText: {
    marginLeft: 5,
    color: '#666',
    fontWeight: 'bold',
  },
  activeReactionText: {
    color: '#007bff',
  },
  headerBlock: {
    marginBottom: 12,
  },
  rowInfoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  dot: {
    marginHorizontal: 10,
  },
  seeMore: {
    color: '#007bff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  reactionCount: {
    marginLeft: 5,
    color: '#666',
    fontWeight: 'bold',
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  seeMoreBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  seeMoreText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  modalStatsRowBig: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  statColBig: {
    alignItems: 'center',
    flex: 1,
  },
  statNumBig: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  statLabelBig: {
    fontSize: 13,
    color: '#888',
  },
});

export default VideoScreen;
