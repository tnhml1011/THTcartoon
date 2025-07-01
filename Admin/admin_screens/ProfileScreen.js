import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from '../../src/components/ImagePicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const avatarPool = [
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/21.jpg',
  'https://randomuser.me/api/portraits/men/31.jpg',
  'https://randomuser.me/api/portraits/women/41.jpg',
  'https://randomuser.me/api/portraits/men/51.jpg',
  'https://randomuser.me/api/portraits/women/61.jpg',
];
const getRandomAvatar = () => avatarPool[Math.floor(Math.random() * avatarPool.length)];

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAvatar, setEditedAvatar] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userData) return;
    setEditedUsername(userData.username || '');
    setEditedPhone(userData.phone || '');
    setEditedAvatar(userData.photoURL || '');
  }, [userData]);

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

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => auth().signOut() },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Không tìm thấy dữ liệu người dùng</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.btnText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ Admin</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <ImagePicker
            value={isEditing ? editedAvatar : userData.photoURL}
            onChange={setEditedAvatar}
            style={styles.imagePicker}
          />
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.email}>{userData.email}</Text>
          <View style={styles.roleBadge}>
            <Icon name="shield-check" size={16} color="#fff" />
            <Text style={styles.roleText}>Admin</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <InfoCard
            title="Thông tin cá nhân"
            icon="account"
            content={
              <>
                <InfoRow
                  label="Tên:"
                  value={isEditing ? editedUsername : userData.username}
                  editable={isEditing}
                  onChange={setEditedUsername}
                  icon="account"
                />
                <InfoRow
                  label="SĐT:"
                  value={isEditing ? editedPhone : userData.phone}
                  editable={isEditing}
                  onChange={setEditedPhone}
                  keyboardType="phone-pad"
                  icon="phone"
                />
                <InfoRow
                  label="Email"
                  value={userData.email}
                  icon="email"
                />
                <InfoRow
                  label="Ngày tạo"
                  value={fmtDate(userData.createdAt)}
                  icon="clock-outline"
                />
              </>
            }
          />

          <InfoCard
            title="Thông tin quản trị"
            icon="shield-account"
            content={
              <>
                <InfoRow
                  label="Vai trò"
                  value="Quản trị viên"
                  icon="shield-check"
                />
                <InfoRow
                  label="Quyền hạn"
                  value="Toàn quyền quản lý hệ thống"
                  icon="key"
                />
              </>
            }
          />
        </View>

        <View style={styles.actionSection}>
          {isEditing ? (
            <View style={styles.editActions}>
              <ActionButton
                icon="check"
                text="Lưu thay đổi"
                onPress={saveChanges}
                color="#2ecc71"
              />
              <ActionButton
                icon="close"
                text="Hủy"
                onPress={() => setIsEditing(false)}
                color="#95a5a6"
              />
            </View>
          ) : (
            <ActionButton
              icon="pencil"
              text="Chỉnh sửa thông tin"
              onPress={() => setIsEditing(true)}
              color="#3498db"
            />
          )}

          <ActionButton
            icon="logout"
            text="Đăng xuất"
            onPress={handleLogout}
            color="#e74c3c"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const InfoCard = ({ title, icon, content }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Icon name={icon} size={24} color="#3498db" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardContent}>{content}</View>
  </View>
);

const InfoRow = ({ label, value, editable, onChange, keyboardType, icon }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabel}>
      <Icon name={icon} size={20} color="#666" style={styles.infoIcon} />
      <Text style={styles.infoLabelText}>{label}</Text>
    </View>
    {editable ? (
      <TextInput
        style={styles.infoInput}
        value={value}
        onChangeText={onChange}
        placeholder="Nhập..."
        keyboardType={keyboardType}
      />
    ) : (
      <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
    )}
  </View>
);

const ActionButton = ({ icon, text, onPress, color, style }) => (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: color }, style]}
    onPress={onPress}
  >
    <Icon name={icon} size={24} color="#fff" style={styles.actionIcon} />
    <Text style={styles.actionText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  imagePicker: {
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoSection: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabelText: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  infoInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionSection: {
    padding: 16,
    paddingBottom: 32,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  error: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
  },
}); 