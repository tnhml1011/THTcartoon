// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/* ------ Dữ liệu avatar mẫu ------ */
const avatarPool = [
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/21.jpg',
  'https://randomuser.me/api/portraits/men/31.jpg',
  'https://randomuser.me/api/portraits/women/41.jpg',
  'https://randomuser.me/api/portraits/men/51.jpg',
  'https://randomuser.me/api/portraits/women/61.jpg',
];
const getRandomAvatar = () =>
  avatarPool[Math.floor(Math.random() * avatarPool.length)];

export default function ProfileScreen() {
  /* ---------- State ---------- */
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAvatar, setEditedAvatar] = useState('');

  /* ---------- Lấy dữ liệu ---------- */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth().currentUser.uid;
        const snap = await firestore().collection('users').doc(uid).get();
        if (snap.exists) setUserData(snap.data());
      } catch (e) {
        console.error('Error loading user data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  /* ---------- Đồng bộ dữ liệu vào form ---------- */
  useEffect(() => {
    if (!userData) return;
    setEditedUsername(userData.username || '');
    setEditedPhone(userData.phone || '');
    setEditedAvatar(userData.photoURL || getRandomAvatar());
  }, [userData]);

  /* ---------- Format ngày ---------- */
  const fmtDate = (ts) =>
    ts?.toDate
      ? ts.toDate().toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '';

  /* ---------- Cập nhật Firestore ---------- */
  const saveChanges = async () => {
    try {
      const uid = auth().currentUser.uid;

      await firestore().collection('users').doc(uid).update({
        username: editedUsername.trim(),
        phone: editedPhone.trim(),
        photoURL: editedAvatar,
      });

      setUserData((prev) => ({
        ...prev,
        username: editedUsername.trim(),
        phone: editedPhone.trim(),
        photoURL: editedAvatar,
      }));

      Alert.alert('✅ Thành công', 'Thông tin đã cập nhật');
      setIsEditing(false);
    } catch (e) {
      console.error('Update error:', e);
      Alert.alert('❌ Lỗi', 'Không thể cập nhật thông tin');
    }
  };

  /* ---------- Đăng xuất ---------- */
  const handleLogout = () => auth().signOut();

  /* ---------- Chọn avatar mới ---------- */
  const changeAvatar = () => setEditedAvatar(getRandomAvatar());

  /* ---------- Loading ---------- */
  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );

  /* ---------- Không có data ---------- */
  if (!userData)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Không tìm thấy dữ liệu người dùng</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.btnText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    );

  /* ---------- UI ---------- */
  return (
    <View style={styles.wrapper}>
      {/* Avatar */}
      <TouchableOpacity onPress={isEditing ? changeAvatar : null}>
        <Image
          source={{ uri: isEditing ? editedAvatar : userData.photoURL || editedAvatar }}
          style={styles.avatar}
        />
        {isEditing && <Text style={styles.changeHint}>Đổi avatar</Text>}
      </TouchableOpacity>

      {/* Tiêu đề */}
      <Text style={styles.title}>Thông tin tài khoản</Text>

      {/* Username */}
      <InfoRow
        label="👤 Tên"
        editable={isEditing}
        value={editedUsername}
        onChange={setEditedUsername}
      />

      {/* Phone */}
      <InfoRow
        label="📱 Số điện thoại"
        editable={isEditing}
        value={editedPhone}
        onChange={setEditedPhone}
        keyboardType="phone-pad"
      />

      {/* Email (không cho sửa ở đây) */}
      <InfoRow label="📧 Email" value={userData.email} />

      {/* CreatedAt */}
      <InfoRow label="🕒 Ngày tạo" value={fmtDate(userData.createdAt)} />

      {/* Nút hành động */}
      {isEditing ? (
        <View style={styles.rowBtn}>
          <ActionBtn color="#2ecc71" text="💾 Lưu" onPress={saveChanges} />
          <ActionBtn color="#95a5a6" text="❌ Hủy" onPress={() => setIsEditing(false)} />
        </View>
      ) : (
        <ActionBtn color="#3498db" text="✏️ Chỉnh sửa" onPress={() => setIsEditing(true)} />
      )}

      <ActionBtn
        style={{ marginTop: 10 }}
        color="#e74c3c"
        text="🚪 Đăng xuất"
        onPress={handleLogout}
      />
    </View>
  );
}

/* ---------- Components con ---------- */
const InfoRow = ({ label, value, editable, onChange, keyboardType }) => (
  <View style={styles.card}>
    <Text style={styles.label}>{label}:</Text>
    {editable ? (
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="Nhập..."
        keyboardType={keyboardType}
      />
    ) : (
      <Text style={styles.value}>{value || 'Chưa cập nhật'}</Text>
    )}
  </View>
);

const ActionBtn = ({ text, onPress, color, style }) => (
  <TouchableOpacity
    style={[styles.actionBtn, { backgroundColor: color }, style]}
    onPress={onPress}
  >
    <Text style={styles.btnText}>{text}</Text>
  </TouchableOpacity>
);

/* ---------- Style ---------- */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  wrapper: { flex: 1, paddingHorizontal: 24, paddingTop: 40, backgroundColor: '#f5f7fa' },

  avatar: {
    width: 110,
    height: 110,
    alignSelf: 'center',
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  changeHint: { textAlign: 'center', color: '#3498db', marginTop: 6 },

  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 24,
    color: '#333',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 12,
    elevation: 2,
  },
  label: { flex: 1, fontSize: 15, fontWeight: '600', color: '#555' },
  value: { flex: 1.5, fontSize: 15, color: '#222' },
  input: {
    flex: 1.5,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: '#222',
  },

  actionBtn: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { height: 4, width: 0 },
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  rowBtn: { flexDirection: 'row', justifyContent: 'space-between' },

  logoutBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: '60%',
  },
  error: { fontSize: 18, color: '#e74c3c', marginBottom: 20 },
});
