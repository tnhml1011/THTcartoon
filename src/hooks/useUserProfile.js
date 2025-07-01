import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

export default function useUserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAvatar, setEditedAvatar] = useState('');

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

  useEffect(() => {
    if (!userData) return;
    setEditedUsername(userData.username || '');
    setEditedPhone(userData.phone || '');
    setEditedAvatar(userData.photoURL || '');
  }, [userData]);

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

  return {
    userData,
    loading,
    isEditing,
    setIsEditing,
    editedUsername,
    setEditedUsername,
    editedPhone,
    setEditedPhone,
    editedAvatar,
    setEditedAvatar,
    saveChanges,
    handleLogout,
  };
} 