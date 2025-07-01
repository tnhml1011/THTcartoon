// Import các hàm từ Firebase SDK
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Cấu hình Firebase từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBVBTHOuiWhIDJM3SgEXPNCrhv8K0oGEqc",
  authDomain: "movies-62f71.firebaseapp.com",
  projectId: "movies-62f71",
  storageBucket: "movies-62f71.appspot.com", // đúng phải là .com chứ không phải .app
  messagingSenderId: "601354374244",
  appId: "1:601354374244:android:2f16dfb1ef71f709886371"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Xuất Firestore và Storage để sử dụng
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
