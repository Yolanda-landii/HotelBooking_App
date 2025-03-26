import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Navigation from './Navigation';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room } = location.state || {}; 

  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkExistingBooking = async (userId, roomId, checkinDate, checkoutDate) => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      where('roomId', '==', roomId),
      where('status', '!=', 'cancelled')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.some(doc => {
      const booking = doc.data();
      const existingCheckin = new Date(booking.checkin);
      const existingCheckout = new Date(booking.checkout);
      const newCheckin = new Date(checkinDate);
      const newCheckout = new Date(checkoutDate);

      // Check if date ranges overlap
      return (
        (newCheckin >= existingCheckin && newCheckin < existingCheckout) ||
        (newCheckout > existingCheckin && newCheckout <= existingCheckout) ||
        (newCheckin <= existingCheckin && newCheckout >= existingCheckout)
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room) {
      setError("Room data is undefined");
      return;
    }

    const nights = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
    if (nights <= 0) {
      setError("Checkout date must be after check-in date.");
      return;
    }
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check for existing booking
      const hasExistingBooking = await checkExistingBooking(userId, room.id, checkin, checkout);
      if (hasExistingBooking) {
        setError('You already have an active booking for this room during these dates.');
        setLoading(false);
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
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('Booking Details before navigation:', bookingDetails);
      console.log('Room Details:', room);

      // Navigate with state
      navigate('/checkout', { 
        state: { 
          bookingDetails: bookingDetails
        } 
      });
    } catch (error) {
      console.error('Error processing booking:', error);
      setError('Failed to process booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: Room data not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Book {room.name}</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Check-in Date
              </label>
              <input
                type="date"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Check-out Date
              </label>
              <input
                type="date"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Number of Guests
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm">Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={guests.adults}
                    onChange={(e) => setGuests({ ...guests, adults: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm">Children</label>
                  <input
                    type="number"
                    min="0"
                    value={guests.children}
                    onChange={(e) => setGuests({ ...guests, children: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md text-white font-bold ${
                loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm; 