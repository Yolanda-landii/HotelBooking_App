import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels } from '../redux/slices/hotelSlice';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { FaHeart, FaRegHeart, FaShareAlt, FaStar } from 'react-icons/fa'; // For icons
import { MdLocationOn } from 'react-icons/md';
import { updateFavorites } from '../redux/slices/userSlice'; // Import the updateFavorites action

const HotelListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hotels, loading, error } = useSelector((state) => state.hotels);
  const user = useSelector((state) => state.user.user); // Accessing user state correctly
  const [sortOption, setSortOption] = useState(''); // For sorting
  const [rating, setRating] = useState({}); // Local state for hotel ratings

  useEffect(() => {
    // Fetch hotels on component mount
    dispatch(fetchHotels());

    // Set up real-time listener
    const unsubscribe = onSnapshot(collection(db, 'hotels'), (snapshot) => {
      const updatedHotels = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch({ type: 'hotels/fetchHotels/fulfilled', payload: updatedHotels });

      // Initialize rating state
      const ratings = {};
      updatedHotels.forEach((hotel) => {
        ratings[hotel.id] = hotel.rating || 0;
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login'); // Redirect to login page after logout
  };

  const handleLike = async (hotelId) => {
    if (!user) {
      alert('You need to be logged in to like a hotel');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userFavorites = userDoc.data()?.favorites || [];
      const isFavorite = userFavorites.includes(hotelId);

      await updateDoc(userRef, {
        favorites: isFavorite
          ? userFavorites.filter((id) => id !== hotelId)
          : [...userFavorites, hotelId],
      });

      dispatch(updateFavorites(isFavorite
        ? userFavorites.filter((id) => id !== hotelId)
        : [...userFavorites, hotelId]));

      console.log(isFavorite ? `Removed hotel ${hotelId} from favorites` : `Added hotel ${hotelId} to favorites`);
    } catch (error) {
      console.error('Error liking hotel: ', error);
    }
  };

  const handleShare = (hotelId) => {
    const hotelUrl = `http://your-app-url/hotel-details/${hotelId}`;

    if (navigator.share) {
      navigator.share({
        title: 'Check out this hotel!',
        url: hotelUrl,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleRatingClick = async (hotelId, newRating) => {
    try {
      // Update local state
      setRating(prevRating => ({ ...prevRating, [hotelId]: newRating }));

      // Update Firestore
      const hotelRef = doc(db, 'hotels', hotelId);
      await updateDoc(hotelRef, { rating: newRating });

      console.log(`Updated hotel ${hotelId} rating to ${newRating}`);
    } catch (error) {
      console.error('Error updating rating: ', error);
    }
  };

  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortOption === 'Price') {
      return a.price - b.price;
    } else if (sortOption === 'Rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  const handleViewDetails = (hotelId) => {
    navigate(`/hotel-details/${hotelId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="hotel-listing">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-6">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/profile" className="hover:underline">Profile</a></li>
            <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
          </ul>
        </nav>
      </header>

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
            Pretoria: {hotels.length} hotels found
          </h2>
        </div>
      </section>

      {/* Hotel Grid Section */}
      <section className="hotel-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
  {sortedHotels.map((hotel) => (
    <div key={hotel.id} className="hotel-card bg-white p-4 shadow-lg rounded-md border border-gray-200">
      <img src={hotel.imageUrl} alt={hotel.name} className="hotel-image w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="hotel-name text-xl font-bold">{hotel.name}</h3>
      <p className="hotel-price text-lg text-blue-600 mt-2">R{hotel.price}</p>
      <p className="hotel-distance text-sm text-gray-500 mt-1">
        <MdLocationOn className="inline mr-1" />
        {hotel.distance} km away
      </p>
      <div className="flex items-center mt-3">
        <button className="like-button text-red-500 hover:text-red-600" onClick={() => handleLike(hotel.id)}>
          {user?.favorites?.includes(hotel.id) ? (
            <FaHeart className="w-6 h-6 text-red-500" />
          ) : (
            <FaRegHeart className="w-6 h-6 text-gray-400" />
          )}
        </button>
        <button className="share-button text-blue-500 hover:text-blue-600 ml-4" onClick={() => handleShare(hotel.id)}>
          <FaShareAlt className="w-6 h-6" />
        </button>
        <div className="rating flex items-center ml-auto">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={`w-5 h-5 ${index < (rating[hotel.id] || 0) ? 'text-yellow-500' : 'text-gray-300'} cursor-pointer`}
              onClick={() => handleRatingClick(hotel.id, index + 1)}
            />
          ))}
        </div>
      </div>
      <button
        className="view-details-btn mt-4 p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 w-full"
        onClick={() => handleViewDetails(hotel.id)}
      >
        View Details
      </button>
    </div>
  ))}
</section>

      <footer className="footer bg-gray-800 text-white p-4 text-center">
        <p>Copyright © 2024 Hotel Booking</p>
      </footer>
    </div>
  );
};

export default HotelListing;
