import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookingForm = ({ room }) => {
  const navigate = useNavigate();
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });
  
  const handleSubmit = () => {
    const bookingDetails = {
      roomId: room.id,
      hotelName: room.name,
      checkin,
      checkout,
      guests,
      totalPrice: room.price * (checkout - checkin), 
      nights: checkout - checkin,
    };
    
    // Redirect to the payment screen with the booking details
    navigate(`/rooms/${room.id}/book/confirm`, { state: { bookingDetails } });
  };
  
  return (
    
    <div>
      <h2>Booking Details</h2>
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
        <input type="number" value={guests.adults} onChange={(e) => setGuests({ ...guests, adults: e.target.value })} placeholder="Adults" />
        <input type="number" value={guests.children} onChange={(e) => setGuests({ ...guests, children: e.target.value })} placeholder="Children" />
        <input type="number" value={guests.infants} onChange={(e) => setGuests({ ...guests, infants: e.target.value })} placeholder="Infants" />
        <input type="number" value={guests.pets} onChange={(e) => setGuests({ ...guests, pets: e.target.value })} placeholder="Pets" />
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
