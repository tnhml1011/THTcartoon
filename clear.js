// migration.js
const admin = require("firebase-admin");

// 🔑 file serviceAccountKey.json bạn tải từ Firebase Console
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateVideos() {
  const snapshot = await db.collection("videos").get();

  console.log(`🔍 Tổng số videos: ${snapshot.size}`);

  let batch = db.batch();
  let count = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const updates = {};

    // Xóa field "id" vì đã trùng với doc.id
    if ("id" in data) {
      updates.id = admin.firestore.FieldValue.delete();
    }

    // Nếu có "like" thì merge vào "likes"
    if ("like" in data) {
      updates.like = admin.firestore.FieldValue.delete();
      updates.likes = (data.likes || 0) + (data.like || 0);
    }

    // Nếu có "view" thì merge vào "views"
    if ("view" in data) {
      updates.view = admin.firestore.FieldValue.delete();
      updates.views = (data.views || 0) + (data.view || 0);
    }

    // Nếu có gì cần update thì thêm vào batch
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Đã cập nhật ${count} videos`);
  } else {
    console.log("👍 Không có video nào cần cập nhật");
  }
}

migrateVideos().catch(console.error);
// clear.js