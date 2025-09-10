import React, { useState, useMemo } from 'react';
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
  const [sortOption, setSortOption] = useState('newest'); // default: mới nhất
  const { videos, displayedVideos, loading, loadMore } = useFetchVideos(searchTerm);

  // Sắp xếp video theo lựa chọn
  const sortedVideos = useMemo(() => {
    let data = [...displayedVideos];
    switch (sortOption) {
      case 'views':
        return data.sort((a, b) => (b.view ?? 0) - (a.view ?? 0));
      case 'title':
        return data.sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
      default:
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }, [displayedVideos, sortOption]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('VideoScreen', {
          videoId: item.id,
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
      {/* Thumbnail */}
      <Image
        source={{ uri: item.thumbnail || 'https://placehold.co/320x180?text=No+Image' }}
        style={styles.thumbnail}
      />

      {/* Video info */}
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.view ?? 0} lượt xem</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{formatRelativeTime(item.date)}</Text>
        </View>
        <Text style={styles.author}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm phim..."
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Filter/Sort */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, sortOption === 'newest' && styles.activeFilter]}
          onPress={() => setSortOption('newest')}
        >
          <Text style={[styles.filterText, sortOption === 'newest' && styles.activeFilterText]}>
            Mới nhất
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, sortOption === 'views' && styles.activeFilter]}
          onPress={() => setSortOption('views')}
        >
          <Text style={[styles.filterText, sortOption === 'views' && styles.activeFilterText]}>
            Nhiều lượt xem
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, sortOption === 'title' && styles.activeFilter]}
          onPress={() => setSortOption('title')}
        >
          <Text style={[styles.filterText, sortOption === 'title' && styles.activeFilterText]}>
            Tên phim (A-Z)
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={sortedVideos}
          keyExtractor={(item) => item.id}
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

  // Search
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
  },
  filterText: {
    fontSize: 13,
    color: '#555',
  },
  activeFilter: {
    backgroundColor: '#007bff',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },

  // List
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },

  // Card
  card: {
    marginBottom: 18,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#ddd',
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  dot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 6,
  },
  author: {
    fontSize: 13,
    color: '#007bff',
    marginTop: 4,
    fontWeight: '500',
  },

  // Load More
  loadMoreButton: {
    marginTop: 10,
    marginBottom: 30,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default HomeScreen;
