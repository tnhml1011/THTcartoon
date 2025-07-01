import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import useFetchVideos from '../hooks/useFetchVideos';
import formatRelativeTime from '../utils/formatRelativeTime';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const { videos, displayedVideos, loading, loadMore } = useFetchVideos(searchTerm);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('VideoScreen', {
          videoUrl: item.videoUrl,
          title: item.title,
          author: item.author,
          thumbnail: item.thumbnail,
          description: item.description,
          date: item.date,
          collection: item.collection,
          identifier: item.identifier,
          mediatype: item.mediatype,
        })
      }
    >
      <Image
        source={{ uri: item.thumbnail || 'https://placehold.co/320x180?text=No+Image' }}
        style={styles.thumbnail}
      />
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Text style={{ fontSize: 12, color: '#888' }}>{item.view ?? 0} lượt xem</Text>
          <Text style={{ fontSize: 12, color: '#888', marginHorizontal: 6 }}>·</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>{formatRelativeTime(item.date)}</Text>
        </View>
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
