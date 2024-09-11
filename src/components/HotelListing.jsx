import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels } from '../redux/slices/hotelSlice';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="hotel-listing">
  
      <header className="header flex justify-between items-center p-4 bg-gray-100">
        <div className="logo">
          <img src="/path/to/logo.png" alt="Logo" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-4">
            <li><a href="/">Home</a></li>
            <li><a href="/rooms">Rooms</a></li>
            <li><a href="/admin">Admin</a></li>
            <li><a href="/profile">Profile</a></li>
            <li className="user-info">Yolanda - Online</li>
          </ul>
        </nav>
      </header>
      {/* Search/Filter Section */}
      <section className="search-filter bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <input type="text" placeholder="Where?" className="input-field p-2 border rounded-md" />
            <input type="date" className="input-field p-2 border rounded-md" />
            <button className="search-btn p-2 bg-blue-500 text-white rounded-md">Check-in - Check-out</button>
          </div>
          <div className="sort">
            <select className="sort-dropdown p-2 border rounded-md" value={sortOption} onChange={handleSortChange}>
              <option value="">Sort by:</option>
              <option value="Price">Price</option>
              <option value="Rating">Rating</option>
            </select>
          </div>
        </div>
        <div className="location-info mb-4">
          <h2 className="text-lg font-bold">Pretoria: {hotels.length} hotels found</h2>
        </div>
      </section>
      <section className="hotel-grid grid grid-cols-3 gap-4 p-6">
        {sortedHotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card bg-white p-4 shadow-lg rounded-md">
            <img src={hotel.imageUrl} alt={hotel.name} className="hotel-image w-full h-48 object-cover rounded-md" />
            <h3 className="hotel-name text-xl font-bold mt-4">{hotel.name}</h3>
            <p className="hotel-price text-lg mt-2">{hotel.price}</p>
            <p className="hotel-distance text-sm text-gray-500">{hotel.distance} km away</p>
            <div className="flex justify-between items-center mt-4">
              <button className="add-to-favorites">
                <i className="heart-icon"></i>
              </button>
              <button 
                className="view-details p-2 bg-blue-500 text-white rounded-md"
                onClick={() => handleViewDetails(hotel.id)} 
              >
                View Details
              </button>
            </div>
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
