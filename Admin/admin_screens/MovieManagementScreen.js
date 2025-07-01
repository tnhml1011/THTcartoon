import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MovieManagementScreen = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('videos')
      .onSnapshot(snapshot => {
        const moviesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMovies(moviesList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const handleDeleteMovie = async (id) => {
    try {
      await firestore().collection('videos').doc(id).delete();
      Alert.alert('Thành công', 'Phim đã được xóa');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa phim');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.movieItem}
            onPress={() => navigation.navigate('DetailMovie', { movie: item })}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.movieTitle}>{item.title}</Text>
              <Text style={styles.movieId}>ID: {item.id}</Text>
              <Text style={styles.movieAuthor}>{item.author}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('EditMovie', { movie: item })}
                style={styles.editButton}
              >
                <Icon name="edit" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteMovie(item.id)}
                style={styles.deleteButton}
              >
                <Icon name="delete" size={20} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddMovie')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f8fa',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e3eaff',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#f4f8ff',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  movieId: {
    color: '#b0b8c1',
    fontSize: 12,
    marginBottom: 2,
  },
  movieAuthor: {
    color: '#6c7a89',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#007bff',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 1,
  },
  deleteButton: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3b30',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default MovieManagementScreen;