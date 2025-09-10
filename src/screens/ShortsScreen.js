import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import Video from "react-native-video";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Icon from "react-native-vector-icons/Ionicons";

const { height } = Dimensions.get("window");

const ShortsScreen = () => {
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);
  const viewableIndex = useRef(0);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("videos")
      .orderBy("createdAt", "desc") // video mới nhất lên đầu
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

  // FlatList callback để xác định video đang hiển thị
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      viewableIndex.current = viewableItems[0].index;
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  const renderItem = ({ item, index }) => {
    const isActive = index === viewableIndex.current;

    return (
      <View style={styles.videoContainer}>
        {item.thumbnail && !isActive ? (
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.video}
            resizeMode="cover"
          />
        ) : (
          <Video
            source={{ uri: item.videoUrl }}
            style={styles.video}
            resizeMode="cover"
            repeat
            paused={!isActive}
          />
        )}

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
            <Text style={[styles.actionText, { marginTop: 8 }]}>{item.views || 0} lượt xem</Text>
          </View>
        </View>
      </View>
    );
  };

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
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewConfigRef.current}
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
