import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const PAGE_SIZE = 10;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [displayedVideos, setDisplayedVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snapshot = await firestore().collection('videos').get();
        const videoData = snapshot.docs.map(doc => doc.data());
        setVideos(videoData);
        setDisplayedVideos(videoData.slice(0, PAGE_SIZE));
      } catch (error) {
        console.error('Lỗi khi lấy video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const filtered = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedVideos(filtered.slice(0, page * PAGE_SIZE));
  }, [searchTerm, page, videos]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('VideoScreen', {
          videoUrl: item.videoUrl,
          title: item.title,
          author: item.author,
        })
      }
    >
      <Image
        source={{ uri: item.thumbnail || 'https://placehold.co/320x180?text=No+Image' }}
        style={styles.thumbnail}
      />
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm phim..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={displayedVideos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={
            displayedVideos.length < videos.length && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                <Text style={styles.loadMoreText}>Xem thêm</Text>
              </TouchableOpacity>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  info: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  author: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  loadMoreButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
