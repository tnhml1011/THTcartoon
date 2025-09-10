import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { MUX_UPLOAD_ENDPOINT } from "@env";  // lấy biến từ .env

const popularTags = [
  // 🎬 Tag thịnh hành cho video ngắn
  "#Shorts", "#Trending", "#Viral", "#FYP", "#Comedy", "#Meme",

  // 🎭 Tag liên quan đến hoạt hình
  "#Anime", "#Cartoon", "#Manga", "#Animation",
  "#FunnyCartoon", "#KidsAnimation", "#AnimeEdit", "#AnimeShorts", "#Otaku"
];

const UploadVideoScreen = ({ navigation }) => {
  const user = auth().currentUser;
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickVideo = async () => {
    const result = await launchImageLibrary({
      mediaType: "video",
      videoQuality: "high",
    });
    if (result.didCancel) return;
    const asset = result.assets[0];
    if (!asset || !asset.uri) {
      Alert.alert("Không chọn được video");
      return;
    }
    if (asset.duration && asset.duration > 60) {
      Alert.alert("Video phải ngắn hơn 60 giây!");
      return;
    }
    setVideo(asset);
  };

  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const uploadVideo = async () => {
  if (!user) {
    Alert.alert("Bạn cần đăng nhập để đăng video");
    return;
  }
  if (!video || !title.trim()) {
    Alert.alert("Vui lòng chọn video và nhập tiêu đề");
    return;
  }
  setLoading(true);

  try {
    // Upload video lên Mux
    const formData = new FormData();
    formData.append("file", {
      uri: video.uri,
      type: video.type,
      name: video.fileName || "upload.mp4",
    });

    const response = await fetch(MUX_UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = await response.json();
    if (!data.playbackId && !data.playbackUrl) throw new Error("Upload thất bại");

    // Tạo thumbnail URL từ Mux
    const thumbnailUrl = data.playbackId
      ? `https://image.mux.com/${data.playbackId}/thumbnail.jpg`
      : "";

    // Tự động tạo collection dựa trên tag
    const tagCollections = tags
      .map(tag => tag.toLowerCase())
      .filter(tag =>
        tag.includes("animation") ||
        tag.includes("cartoon") ||
        tag.includes("anime")
      );

    // Loại bỏ trùng lặp
    const collection = [...new Set(tagCollections)];

    // Metadata mở rộng
    const videoDoc = {
      title: title.trim(),
      description: description.trim(),
      videoUrl: data.playbackUrl,
      thumbnail: thumbnailUrl,
      author: user.displayName || user.email,
      userId: user.uid,
      collection: collection.length > 0 ? collection : ["uncategorized"], // nếu không có tag phù hợp
      identifier: title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, ""),
      tags,
      likes: 0,
      dislike: 0,
      views: 0,
      date: new Date().toISOString(),
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    // Lưu vào Firestore
    await firestore().collection("videos").add(videoDoc);

    Alert.alert("Đăng video thành công!");
    setTitle("");
    setDescription("");
    setVideo(null);
    setTags([]);
    navigation.goBack();

  } catch (err) {
    console.error(err);
    Alert.alert("Lỗi khi đăng video", err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🎬 Tải lên video ngắn</Text>

      <TouchableOpacity style={styles.button} onPress={pickVideo}>
        <Text>{video ? "✅ Video đã chọn" : "📂 Chọn video (≤ 60 s)"}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Tiêu đề video *"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.subHeader}>Chọn tag (tối đa 5):</Text>
      <View style={styles.tagsContainer}>
        {popularTags.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              tags.includes(tag) && styles.tagSelected
            ]}
            onPress={() => toggleTag(tag)}
          >
            <Text
              style={tags.includes(tag) ? styles.tagTextSelected : styles.tagText}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={uploadVideo}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.uploadText}>🚀 Đăng video</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  button: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  subHeader: { marginBottom: 8, fontWeight: "600" },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 20,
    margin: 4,
  },
  tagSelected: {
    backgroundColor: "#007bff",
  },
  tagText: { color: "#007bff" },
  tagTextSelected: { color: "#fff" },
  uploadBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadText: { color: "#fff", fontWeight: "bold" },
});

export default UploadVideoScreen;
