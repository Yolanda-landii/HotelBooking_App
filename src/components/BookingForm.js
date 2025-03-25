import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createBooking } from '../redux/slices/bookingSlice';
import { auth } from '../config/firebase';
import Navigation from './Navigation';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { room } = location.state || {}; 

  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });

  const handleSubmit = () => {
    if (!room) {
      console.error("Room data is undefined");
      return;
    }

    const nights = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
    if (nights <= 0) {
      alert("Checkout date must be after check-in date.");
      return;
    }
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const bookingDetails = {
      roomId: room.id,
      hotelName: room.name,
      checkin,
      checkout,
      guests,
      totalPrice: room.price * nights,
      nights,
      userId,
    };

    dispatch(createBooking(bookingDetails))
      .then(() => {
        console.log("Booking Details before navigation:", bookingDetails);
        navigate(`/checkout`, { state: { bookingDetails } });
      })
      .catch((error) => {
        console.error('Error creating booking:', error);
      });
  };

  if (!room) return <p className="text-red-500 text-center">Error: Room data not found</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <Navigation />
      
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Booking for {room.name}</h2>
        
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Check-in:</span>
            <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          
          <label className="block">
            <span className="text-gray-700">Check-out:</span>
            <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold">Guests</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {Object.keys(guests).map((key) => (
              <label key={key} className="block">
                <span className="text-gray-700 capitalize">{key}:</span>
                <input 
                  type="number" 
                  value={guests[key]} 
                  onChange={(e) => setGuests({ ...guests, [key]: parseInt(e.target.value) || 0 })} 
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>
        
        <button
          className="w-full bg-blue-600 text-white mt-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-200"
          onClick={handleSubmit}
          disabled={!checkin || !checkout || !guests.adults}
        >
          Next: Proceed to Payment
        </button>
      </div>
      <footer className="footer bg-gray-800 text-white p-4 text-center mt-auto">
<p>Copyright © 2024 Hlala Nathi</p>
      </footer>
    </div>
  );
};

export default BookingForm;
