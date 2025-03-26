import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms } from '../redux/slices/roomSlice';
import { useNavigate, Link } from 'react-router-dom';
import { collection, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaHeart, FaRegHeart, FaShareAlt, FaStar } from 'react-icons/fa'; 
import { MdLocationOn } from 'react-icons/md';
import { updateFavorites } from '../redux/slices/userSlice'; 
import Navigation from './Navigation';

const HotelListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const roomsState = useSelector((state) => state.rooms);
  const { rooms = [], loading = false, error = null } = roomsState || {};
  const user = useSelector((state) => state.user?.user); 
  const [sortOption, setSortOption] = useState('');
  const [rating, setRating] = useState({}); 

  useEffect(() => {
    dispatch(fetchRooms());
    console.log("Fetching rooms...");
  
    // Set up real-time listener
    const unsubscribe = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const updatedRooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch({ type: 'rooms/fetchRooms/fulfilled', payload: updatedRooms });
      console.log("Updated rooms: ", updatedRooms);  // Log real-time data
  
      // Initialize rating state
      const ratings = {};
      updatedRooms.forEach((room) => {
        ratings[room.id] = room.rating || 0;
      });
      setRating(ratings);
    });
  
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [dispatch]);
  

  // Handle sorting
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleLike = async (roomId) => {
    if (!user) {
      alert('You need to be logged in to like a hotel');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userFavorites = userDoc.data()?.favorites || [];
      const isFavorite = userFavorites.includes(roomId);

      await updateDoc(userRef, {
        favorites: isFavorite
          ? userFavorites.filter((id) => id !== roomId)
          : [...userFavorites, roomId],
      });

      dispatch(updateFavorites(isFavorite
        ? userFavorites.filter((id) => id !== roomId)
        : [...userFavorites, roomId]));

      console.log(isFavorite ? `Removed room ${roomId} from favorites` : `Added hotel ${roomId} to favorites`);
    } catch (error) {
      console.error('Error liking hotel: ', error);
    }
  };

  const handleShare = (roomId) => {
    const roomUrl = `http://your-app-url/hotel-details/${roomId}`;

    if (navigator.share) {
      navigator.share({
        title: 'Check out this hotel!',
        url: roomUrl,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleRatingClick = async (roomId, newRating) => {
    try {
      // Update local state
      setRating(prevRating => ({ ...prevRating, [roomId]: newRating }));

      // Update Firestore
      const hotelRef = doc(db, 'rooms', roomId);
      await updateDoc(hotelRef, { rating: newRating });

      console.log(`Updated rooms ${roomId} rating to ${newRating}`);
    } catch (error) {
      console.error('Error updating rating: ', error);
    }
  };

  const sortedRooms = [...rooms].sort((a, b) => {
    if (sortOption === 'Price') {
      return a.price - b.price;
    } else if (sortOption === 'Rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  const handleViewDetails = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="hotel-listing flex flex-col min-h-screen">
      <Navigation />

      {/* Search/Filter Section */}
      <section className="search-filter bg-white p-6 shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6">
          {/* <div className="flex flex-col sm:flex-row sm:space-x-4"> */}
            {/* <input type="text" placeholder="Where?" className="input-field p-3 border border-gray-300 rounded-md shadow-sm mb-3 sm:mb-0" />
            <button className="search-btn p-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700">Search</button> */}
          {/* </div> */}
          <div className="sort mt-4 sm:mt-0">
            <select className="sort-dropdown p-3 border border-gray-300 rounded-md shadow-sm" value={sortOption} onChange={handleSortChange}>
              <option value="">Sort by:</option>
              <option value="Price">Price</option>
              <option value="Rating">Rating</option>
            </select>
          </div>
        </div>
        <div className="location-info mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Pretoria: {rooms.length} rooms found
          </h2>
        </div>
      </section>

      {/* Hotel Grid Section */}
      <section className="hotel-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
  {sortedRooms.map((room) => (
    <div key={room.id} className="hotel-card bg-white p-4 shadow-lg rounded-md border border-gray-200">
      <img src={room.imageUrl} alt={room.name} className="hotel-image w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="hotel-name text-xl font-bold">{room.name}</h3>
      <p className="hotel-price text-lg text-blue-600 mt-2">R{room.price}</p>
      <p className="hotel-distance text-sm text-gray-500 mt-1">
        <MdLocationOn className="inline mr-1" />
        {room.distance} km away
      </p>
      <div className="flex items-center mt-3">
        <button className="like-button text-red-500 hover:text-red-600" onClick={() => handleLike(room.id)}>
          {user?.favorites?.includes(room.id) ? (
            <FaHeart className="w-6 h-6 text-red-500" />
          ) : (
            <FaRegHeart className="w-6 h-6 text-gray-400" />
          )}
        </button>
        <button className="share-button text-blue-500 hover:text-blue-600 ml-4" onClick={() => handleShare(room.id)}>
          <FaShareAlt className="w-6 h-6" />
        </button>
        <div className="rating flex items-center ml-auto">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={`w-5 h-5 ${index < (rating[room.id] || 0) ? 'text-yellow-500' : 'text-gray-300'} cursor-pointer`}
              onClick={() => handleRatingClick(room.id, index + 1)}
            />
          ))}
        </div>
      </div>
      <button
        className="view-details-btn mt-4 p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 w-full"
        onClick={() => handleViewDetails(room.id)}
      >
        View Details
      </button>
    </div>
  ))}
</section>

<footer className="footer bg-gray-800 text-white p-4 text-center mt-auto">
<p>Copyright © 2024 Hlala Nathi</p>
      </footer>
    </div>
  );
};

export default HotelListing;
