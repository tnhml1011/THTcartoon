import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

const PAGE_SIZE = 10;

export default function useFetchVideos(searchTerm = '') {
  const [videos, setVideos] = useState([]);
  const [displayedVideos, setDisplayedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snapshot = await firestore().collection('videos').get();
        const videoData = snapshot.docs.map(doc => ({
          ...doc.data(),
          identifier: doc.id,
        }));
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

  const loadMore = () => setPage(prev => prev + 1);

  return { videos, displayedVideos, loading, loadMore, setSearchPage: setPage };
} 