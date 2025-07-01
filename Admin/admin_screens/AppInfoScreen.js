import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const APP_NAME = 'THT Cartoon';
const APP_VERSION = 'v1.0.0';
const STUDENTS = [
  { name: 'Trần Công Thành', id: '2124802010805', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { name: 'Trần Nhật Hào', id: '2124802010699', avatar: 'https://randomuser.me/api/portraits/men/51.jpg' },
  { name: 'Đỗ Thành Trọng', id: '2124802010285', avatar: 'https://randomuser.me/api/portraits/men/11.jpg' },
];

const AppInfoScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* App Info Section */}
      <View style={styles.section}>
        <View style={styles.appHeader}>
          <Image source={require('../admin_assets/app_logo.png')} style={styles.logo} />
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.version}>Phiên bản {APP_VERSION}</Text>
        </View>
      </View>

      {/* Group Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="account-group" size={24} color="#007bff" />
          <Text style={styles.sectionTitle}>Thông tin nhóm</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>Nhóm THT Cartoon</Text>
          <Text style={styles.groupDesc}>Dự án phát triển ứng dụng xem phim hoạt hình</Text>
        </View>
      </View>

      {/* Members Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="account-multiple" size={24} color="#007bff" />
          <Text style={styles.sectionTitle}>Danh sách thành viên</Text>
        </View>
        {STUDENTS.map((student, index) => (
          <View key={index} style={styles.memberCard}>
            <Image source={{ uri: student.avatar }} style={styles.avatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{student.name}</Text>
              <Text style={styles.memberId}>MSSV: {student.id}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  section: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  appHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#007bff',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  version: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  groupInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#007bff',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  groupDesc: {
    fontSize: 14,
    color: '#666',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#007bff',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3eaff',
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  memberId: {
    fontSize: 14,
    color: '#666',
  },
});

export default AppInfoScreen; 