const axios = require('axios');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

// Khởi tạo Firebase
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});
const db = firebaseAdmin.firestore();

// Hàm lấy link .mp4 từ metadata
async function getMp4Link(identifier) {
  const url = `https://archive.org/metadata/${identifier}`;
  try {
    const res = await axios.get(url);
    const files = res.data.files;

    const videoFile = files.find(f => f.name && f.name.endsWith('.mp4'));
    if (videoFile) {
      return `https://archive.org/download/${identifier}/${videoFile.name}`;
    }
  } catch (err) {
    console.error(`❌ Lỗi lấy video từ metadata ${identifier}: ${err.message}`);
  }
  return null;
}

// Hàm kiểm tra xem video đã tồn tại chưa (tránh lưu trùng)
async function videoExists(identifier) {
  const snapshot = await db.collection('videos').where('identifier', '==', identifier).limit(1).get();
  return !snapshot.empty;
}

// Hàm crawl từ collection animation_unsorted
async function crawlAnimationUnsorted(page = 1) {
  const query = `collection:animation_unsorted AND mediatype:movies`;
const apiUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=description&fl[]=mediatype&fl[]=collection&fl[]=date&rows=50&page=${page}&output=json`;

  try {
    const res = await axios.get(apiUrl);
    const docs = res.data.response.docs;

    console.log(`🔍 Trang ${page}: nhận ${docs.length} mục`);

    if (!docs.length) return 0;

    let savedCount = 0;

    for (const doc of docs) {
      // Bỏ qua nếu đã có
      if (await videoExists(doc.identifier)) {
        console.log(`⚠️ Bỏ qua ${doc.identifier} (đã có trong Firestore)`);
        continue;
      }

      const mp4Url = await getMp4Link(doc.identifier);
      if (mp4Url) {
        const videoRef = db.collection('videos').doc(); // tạo doc ID ngẫu nhiên
        const videoId = videoRef.id;

        const item = {
  id: videoId,
  identifier: doc.identifier,
  title: doc.title || null,
  description: doc.description || null,
  author: doc.creator || null,
  date: doc.date || null,
  mediatype: doc.mediatype || null,
  collection: doc.collection || [],
  thumbnail: `https://archive.org/services/img/${doc.identifier}`,
  videoUrl: mp4Url
};


        await videoRef.set(item);
        savedCount++;
        console.log(`✅ [${videoId}] Lưu: ${item.title}`);
      } else {
        console.log(`⏭ Bỏ qua: ${doc.identifier} - không có file .mp4`);
      }
    }

    return savedCount;
  } catch (err) {
    console.error(`❌ Lỗi trang ${page}: ${err.message}`);
    return 0;
  }
}

// Hàm sleep để tránh giới hạn tốc độ
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Chạy crawl tối đa 50 trang
(async () => {
  let totalSaved = 0;

  for (let page = 1; page <= 50; page++) {
    console.log(`📄 Đang crawl trang ${page}`);
    const saved = await crawlAnimationUnsorted(page);
    totalSaved += saved;

    if (saved === 0) break;
    await sleep(1000); // chờ 1s giữa các trang
  }

  console.log(`🎉 Hoàn tất crawl. Tổng số video đã lưu: ${totalSaved}`);
})();
