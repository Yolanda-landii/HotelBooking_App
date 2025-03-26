import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Navigation from './Navigation';

const Favorites = () => {
  const [favoriteRooms, setFavoriteRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchFavoriteRooms = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (!userDoc.exists()) {
          setError('User document not found');
          return;
        }

        const favorites = userDoc.data().favorites || [];
        
        if (favorites.length === 0) {
          setFavoriteRooms([]);
          setLoading(false);
          return;
        }

        const roomsCollection = collection(db, 'rooms');
        const roomsSnapshot = await getDocs(roomsCollection);
        const rooms = roomsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const favoriteRoomsData = rooms.filter(room => favorites.includes(room.id));
        setFavoriteRooms(favoriteRoomsData);
      } catch (err) {
        setError('Error fetching favorite rooms');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteRooms();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your favorite rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Favorite Rooms</h1>
        
        {favoriteRooms.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-gray-600 text-lg">You haven't added any rooms to your favorites yet.</p>
            <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              Browse Rooms
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRooms.map((room) => (
              <Link
                key={room.id}
                to={`/rooms/${room.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={room.images?.[0] || room.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <FaHeart className="text-red-500 text-2xl" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-2">{room.location}</p>
                  <p className="text-blue-600 font-bold">R{room.price}/night</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;