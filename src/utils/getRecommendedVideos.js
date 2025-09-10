import firestore from '@react-native-firebase/firestore';

const getRecommendedVideos = async (uid, currentVideoId = null) => {
  try {
    const userRef = firestore().collection('users').doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data() || {};

    const liked = userData.likedVideos || [];
    const saved = userData.savedVideos || [];

    // Lấy 1 video tham chiếu từ history hoặc liked/saved
    let refVideoId = null;

    // Ưu tiên video đã xem
    const historySnap = await userRef.collection('history').orderBy('viewedAt', 'desc').limit(1).get();
    if (!historySnap.empty) {
      refVideoId = historySnap.docs[0].id;
    } else if (liked.length > 0) {
      refVideoId = liked[0];
    } else if (saved.length > 0) {
      refVideoId = saved[0];
    }

    // Nếu chưa có hành vi → random
    if (!refVideoId) {
      const snap = await firestore().collection('videos').limit(10).get();
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(v => v.id !== currentVideoId);
    }

    // Lấy thông tin video tham chiếu
    const refVideoSnap = await firestore().collection('videos').doc(refVideoId).get();
    if (!refVideoSnap.exists) return [];
    const refData = refVideoSnap.data();

    const author = refData.author;
    const collection = refData.collection;

    let result = [];

    // Lấy video cùng tác giả
    if (author) {
      const snap = await firestore()
        .collection('videos')
        .where('author', '==', author)
        .limit(10)
        .get();
      result.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    // Nếu chưa đủ, lấy thêm cùng collection
    if (result.length < 5 && collection) {
      const snap = await firestore()
        .collection('videos')
        .where('collection', '==', collection)
        .limit(10)
        .get();
      result.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    // Loại bỏ video hiện tại
    result = result.filter(v => v.id !== currentVideoId);

    // Nếu vẫn chưa đủ thì thêm random
    if (result.length < 5) {
      const snap = await firestore().collection('videos').limit(10).get();
      result.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    return result.slice(0, 5);
  } catch (err) {
    console.error('Lỗi gợi ý video:', err);
    return [];
  }
};

export default getRecommendedVideos;
