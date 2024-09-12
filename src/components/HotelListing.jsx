import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels } from '../redux/slices/hotelSlice';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { FaHeart, FaShareAlt, FaStar } from 'react-icons/fa'; // For icons
import { MdLocationOn } from 'react-icons/md';

const HotelListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hotels, loading, error } = useSelector((state) => state.hotels);
  const [sortOption, setSortOption] = useState(''); // For sorting

  useEffect(() => {
    // Fetch hotels on component mount
    dispatch(fetchHotels());

    // Set up real-time listener
    const unsubscribe = onSnapshot(collection(db, 'hotels'), (snapshot) => {
      const updatedHotels = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch({ type: 'hotels/fetchHotels/fulfilled', payload: updatedHotels });
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
  // const handleShare = (hotelId) => {
  //   if (navigator.share) {
  //     navigator.share({
  //       title: 'Check out this hotel!',
  //       url: `http://your-app-url/hotel-details/${hotelId}`,
  //     }).catch((error) => console.log('Error sharing:', error));
  //   } else {
  //     alert('Share functionality is not supported on this browser.');
  //   }
  // };
  

  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortOption === 'Price') {
      return a.price - b.price;
    } else if (sortOption === 'Rating') {
      return b.rating - a.rating; // Assuming you have a rating field
    }
    return 0; 
  });

  const handleViewDetails = (hotelId) => {
    navigate(`/hotel-details/${hotelId}`);
  };

  const handleLike = (hotelId) => {
    // Implement like functionality here
    console.log(`Liked hotel with ID: ${hotelId}`);
  };

  const handleShare = (hotelId) => {
    // Implement share functionality here
    console.log(`Shared hotel with ID: ${hotelId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="hotel-listing">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="logo">
          <img src="/path/to/logo.png" alt="Logo" className="w-24 h-auto" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-6">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/rooms" className="hover:underline">Rooms</a></li>
            <li><a href="/profile" className="hover:underline">Profile</a></li>
            <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
          </ul>
        </nav>
      </header>
      {/* Search/Filter Section */}
      <section className="search-filter bg-white p-6 shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6">
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <input type="text" placeholder="Where?" className="input-field p-3 border border-gray-300 rounded-md shadow-sm mb-3 sm:mb-0" />
            <input type="date" className="input-field p-3 border border-gray-300 rounded-md shadow-sm" />
            <button className="search-btn p-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700">Check-in - Check-out</button>
          </div>
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
      <section className="hotel-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {sortedHotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card bg-white p-4 shadow-lg rounded-md border border-gray-200">
            <img src={hotel.imageUrl} alt={hotel.name} className="hotel-image w-full h-48 object-cover rounded-md mb-4" />
            <h3 className="hotel-name text-xl font-bold">{hotel.name}</h3>
            <p className="hotel-price text-lg text-blue-600 mt-2">R{hotel.price}</p>
            <p className="hotel-distance text-sm text-gray-500 mt-1"><MdLocationOn className="inline mr-1" />{hotel.distance} km away</p>
            <div className="flex items-center mt-3">
              <button className="like-button text-red-500 hover:text-red-600" onClick={() => handleLike(hotel.id)}>
                <FaHeart className="w-6 h-6" />
              </button>
              <button className="share-button text-blue-500 hover:text-blue-600 ml-4" onClick={() => handleShare(hotel.id)}>
                <FaShareAlt className="w-6 h-6" />
              </button>
              <div className="rating flex items-center ml-auto">
                {[...Array(5)].map((_, index) => (
                  <FaStar key={index} className={`w-5 h-5 ${index < hotel.rating ? 'text-yellow-500' : 'text-gray-300'}`} />
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
