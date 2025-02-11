import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setFavorites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const removeFavorite = async (favId) => {
    await deleteDoc(doc(db, 'favorites', favId));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Favorites</h2>
      {favorites.length === 0 ? <p>No favorite rooms.</p> : favorites.map(fav => (
        <div key={fav.id} className="p-2 border-b flex justify-between">
          <p>{fav.roomName}</p>
          <button className="text-red-500" onClick={() => removeFavorite(fav.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default FavoritesPage;