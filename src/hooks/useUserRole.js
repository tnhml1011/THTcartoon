// hooks/useUserRole.js
import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const useUserRole = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      setRole(null);
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot(
        doc => {
          if (doc.exists) {
            const data = doc.data();
            setRole(data.role || 'user');
          } else {
            setRole('user');
          }
          setLoading(false);
        },
        error => {
          console.error('Error fetching user role: ', error);
          setRole('user');
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [auth().currentUser?.uid]);

  return { role, loading };
};

export default useUserRole;
