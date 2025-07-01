const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateVideos() {
  const videosRef = db.collection('videos');
  const snapshot = await videosRef.get();

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    batch.update(doc.ref, {
      view: 0,
      like: 0,
      dislike: 0
    });
    count++;
  });

  await batch.commit();
  console.log(`Updated ${count} videos`);
}

updateVideos().then(() => process.exit());
