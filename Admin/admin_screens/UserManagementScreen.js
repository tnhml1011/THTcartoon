// Admin/admin_screens/UserManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Provider as PaperProvider } from 'react-native-paper';

const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return re.test(email);
};
const validatePhone = (phone) => /^\d{9,11}$/.test(phone);

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    fetchUsers();
    // Lưu lại thông tin admin hiện tại để đăng nhập lại sau khi thêm user
    const currentUser = auth().currentUser;
    if (currentUser) {
      AsyncStorage.getItem('userCredentials').then((creds) => {
        if (creds) {
          const { email, password } = JSON.parse(creds);
          setAdminEmail(email);
          setAdminPassword(password);
        } else {
          setAdminEmail(currentUser.email);
          // Nếu không có password, yêu cầu nhập lại khi cần
        }
      });
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await firestore()
        .collection('users')
        .where('role', '==', 'user')
        .get();

      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!username || !phone || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (9-11 số)');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email phải đúng định dạng @gmail.com');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }
    try {
      // Lưu lại user admin hiện tại
      const prevUser = auth().currentUser;
      // Tạo user mới với Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { uid } = userCredential.user;
      // Lưu thông tin user vào Firestore
      await firestore()
        .collection('users')
        .doc(uid)
        .set({
          username: username.trim(),
          phone: phone.trim(),
          email: email.trim(),
          role: 'user',
          createdAt: firestore.FieldValue.serverTimestamp(),
          photoURL: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
        });
      // Đăng nhập lại bằng tài khoản admin
      if (adminEmail && adminPassword) {
        await auth().signInWithEmailAndPassword(adminEmail, adminPassword);
      } else {
        Alert.alert('Cảnh báo', 'Không thể tự động đăng nhập lại tài khoản admin. Vui lòng đăng nhập lại thủ công.');
      }
      Alert.alert('Thành công', 'Thêm người dùng mới thành công!');
      setModalVisible(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!username || !phone) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await firestore()
        .collection('users')
        .doc(selectedUser.id)
        .update({
          username: username.trim(),
          phone: phone.trim(),
        });

      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
      setModalVisible(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleDeleteUser = async () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa người dùng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // Chỉ xóa trong Firestore
              await firestore().collection('users').doc(selectedUser.id).delete();
              Alert.alert('Thành công', 'Xóa người dùng thành công!');
              setModalVisible(false);
              fetchUsers();
            } catch (error) {
              Alert.alert('Lỗi', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const resetForm = () => {
    setUsername('');
    setPhone('');
    setEmail('');
    setPassword('');
    setSelectedUser(null);
    setIsEditing(false);
    setIsAdding(false);
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setPhone(user.phone);
    setEmail(user.email);
    setIsEditing(true);
    setModalVisible(true);
  };

  const openAddUser = () => {
    resetForm();
    setIsAdding(true);
    setModalVisible(true);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => openUserDetails(item)}>
      <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Danh sách Users</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddUser}>
            <Text style={styles.addButtonText}>+ Thêm User</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            resetForm();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isAdding ? 'Thêm người dùng mới' : 'Chi tiết người dùng'}
              </Text>

              <TextInput
                label="Tên người dùng"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
              />

              <TextInput
                label="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="phone" />}
              />

              {isAdding && (
                <>
                  <TextInput
                    label="Email (@gmail.com)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="email" />}
                  />

                  <TextInput
                    label="Mật khẩu (tối thiểu 6 ký tự)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="lock" />}
                  />
                </>
              )}

              <View style={styles.modalButtons}>
                {isEditing && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDeleteUser}
                  >
                    <Text style={styles.buttonText}>Xóa</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={isAdding ? handleAddUser : handleUpdateUser}
                >
                  <Text style={styles.buttonText}>{isAdding ? 'Thêm' : 'Lưu'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </PaperProvider>
  );
};

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserManagementScreen;
