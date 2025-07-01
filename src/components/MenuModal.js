import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MenuModal = ({ visible, onClose, onLogout }) => {
  const navigation = useNavigation();

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Home'); }} style={styles.menuItem}>
            <Text style={styles.menuText}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Saved'); }} style={styles.menuItem}>
            <Text style={styles.menuText}>Phim đã lưu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Profile'); }} style={styles.menuItem}>
            <Text style={styles.menuText}>Thông tin người dùng</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            Alert.alert(
              'Xác nhận',
              'Bạn có chắc muốn đăng xuất?',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', style: 'destructive', onPress: () => { onClose(); onLogout(); } },
              ],
              { cancelable: true }
            );
          }} style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <Text style={[styles.menuText, { color: 'red' }]}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 10,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: 160,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
});

export default MenuModal;
