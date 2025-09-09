import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Dimensions, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Video from "react-native-video";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Icon from "react-native-vector-icons/Ionicons";

const { height } = Dimensions.get("window");

const ShortsScreen = () => {
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("videos")
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(list);
      });
    return unsubscribe;
  }, []);

  const handleLike = async (videoId) => {
    if (!user) return Alert.alert("Thông báo", "Bạn cần đăng nhập để like video.");
    const videoRef = firestore().collection("videos").doc(videoId);
    await videoRef.update({
      likes: firestore.FieldValue.increment(1),
    });
  };

  const handleSave = async (videoId) => {
    if (!user) return Alert.alert("Thông báo", "Bạn cần đăng nhập để lưu video.");
    await firestore()
      .collection("users")
      .doc(user.uid)
      .collection("savedVideos")
      .doc(videoId)
      .set({ savedAt: firestore.FieldValue.serverTimestamp() });
    Alert.alert("Thành công", "Video đã được lưu.");
  };

  const renderItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: item.url }}
        style={styles.video}
        resizeMode="cover"
        repeat
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.actionBtn}>
            <Icon name="heart-outline" size={28} color="white" />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert("Bình luận", "Mở màn hình bình luận")} style={styles.actionBtn}>
            <Icon name="chatbubble-outline" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSave(item.id)} style={styles.actionBtn}>
            <Icon name="bookmark-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      pagingEnabled
      snapToAlignment="start"
      decelerationRate={"fast"}
      showsVerticalScrollIndicator={false}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    height,
    width: "100%",
    backgroundColor: "black",
  },
  video: {
    height: "100%",
    width: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 60,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    color: "white",
    fontSize: 18,
    flex: 1,
  },
  actions: {
    alignItems: "center",
    marginRight: 10,
  },
  actionBtn: {
    marginBottom: 20,
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
  },
});

export default ShortsScreen;
