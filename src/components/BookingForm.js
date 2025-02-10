import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBooking } from '../redux/slices/bookingSlice';
import { auth } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { room } = location.state || {}; // Extract room from location.state

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
        totalPrice: room.price * nights, // Calculate total price
        nights,
        userId,
      };

    dispatch(createBooking(bookingDetails))
      .then(() => {
        navigate(`/rooms/${room.id}/book/confirm`, { state: { bookingDetails } });
      })
      .catch((error) => {
        console.error('Error creating booking:', error);
      });
  };

  if (!room) return <p className="text-red-500">Error: Room data not found</p>;

  return (
    <div>
      <h2>Booking for {room.name}</h2>
      <label>
        Check-in:
        <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
      </label>
      <label>
        Check-out:
        <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
      </label>
      <div>
        <h3>Guests</h3>
        <input type="number" value={guests.adults} onChange={(e) => setGuests({ ...guests, adults: parseInt(e.target.value) || 0 })} placeholder="Adults" />
        <input type="number" value={guests.children} onChange={(e) => setGuests({ ...guests, children: parseInt(e.target.value) || 0 })} placeholder="Children" />
        <input type="number" value={guests.infants} onChange={(e) => setGuests({ ...guests, infants: parseInt(e.target.value) || 0 })} placeholder="Infants" />
        <input type="number" value={guests.pets} onChange={(e) => setGuests({ ...guests, pets: parseInt(e.target.value) || 0 })} placeholder="Pets" />
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
        onClick={handleSubmit}
        disabled={!checkin || !checkout || !guests.adults}
      >
        Next: Proceed to Payment
      </button>
    </div>
  );
};

export default BookingForm;
