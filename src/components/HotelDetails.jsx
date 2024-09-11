import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking, selectBookingStatus, selectBookingError } from '../redux/slices/bookingSlice';

const HotelDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bookingStatus = useSelector(selectBookingStatus);
  const bookingError = useSelector(selectBookingError);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState({
    checkin: '',
    checkout: '',
    guests: {
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0,
    },
  });

  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch hotel details from Firebase
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const hotelRef = doc(db, 'hotels', id);
        const docSnap = await getDoc(hotelRef);

        if (docSnap.exists()) {
          setHotel({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('No such document!');
        }
      } catch (err) {
        setError('Error fetching document');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  // Update the total price whenever booking data changes
  useEffect(() => {
    let nights = 1; // Default to 1 night if dates are not set
    if (booking.checkin && booking.checkout) {
      const checkinDate = new Date(booking.checkin);
      const checkoutDate = new Date(booking.checkout);
      const diffTime = checkoutDate - checkinDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      nights = diffDays > 0 ? diffDays : 1;
    }

    if (hotel) {
      const guestCount = booking.guests.adults + booking.guests.children;
      const extraGuests = guestCount - 1;
      const extraGuestFee = extraGuests > 0 ? extraGuests * 500 * nights : 0;
      const price = hotel.price * nights + extraGuestFee;
      setTotalPrice(price);
    }
  }, [booking, hotel]);

  // Handle booking form changes
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBooking((prev) => ({ ...prev, [name]: value }));
  };

  // Handle guest selection change
  const handleGuestsChange = (category, increment) => {
    setBooking((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        [category]: Math.max(0, prev.guests[category] + increment),
      },
    }));
  };

  // Handle booking submission
  const handleBookNow = () => {
    if (!currentUser) {
      setError('You must be logged in to book a room.');
      return;
    }

    if (!booking.checkin || !booking.checkout) {
      setError('Please select valid check-in and check-out dates.');
      return;
    }

    const totalGuests =
      booking.guests.adults +
      booking.guests.children +
      booking.guests.infants;

    const bookingData = {
      hotelId: id,
      userId: currentUser.uid,
      checkin: booking.checkin,
      checkout: booking.checkout,
      guests: totalGuests,
      hotelName: hotel?.name,
      totalPrice: totalPrice, // Use the calculated total price
    };

    dispatch(createBooking(bookingData));
    navigate('/booking-confirmation', { state: { bookingDetails: bookingData } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!hotel) return <p>No hotel details found</p>;

  return (
    <div className="hotel-detail">
      {/* Header */}
      <header className="header flex justify-between items-center p-4 bg-gray-800 text-white">
        <div className="logo">
          <img src="/path/to/logo.png" alt="Logo" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-4">
            <li><a href="/">Home</a></li>
            <li><a href="/rooms">Rooms</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </nav>
      </header>

      <div className="content-container flex p-6">
        {/* Hotel Image */}
        <div className="image-gallery flex-1">
          <img
            src={hotel.imageUrl}
            alt="Main Hotel View"
            className="w-full h-96 object-cover rounded-md"
          />
        </div>

        {/* Booking Section */}
        <div className="booking-section w-1/3 ml-8 p-6 bg-gray-50 rounded-md shadow-lg">
          <h2 className="text-xl font-bold mb-4">R{hotel.price} / Night</h2>

          {/* Date Picker */}
          <div className="date-picker flex gap-4 mb-4">
            <div>
              <label htmlFor="checkin" className="block">
                Check-in
              </label>
              <input
                type="date"
                id="checkin"
                name="checkin"
                value={booking.checkin}
                onChange={handleBookingChange}
                className="p-2 border rounded-md w-full"
              />
            </div>
            <div>
              <label htmlFor="checkout" className="block">
                Check-out
              </label>
              <input
                type="date"
                id="checkout"
                name="checkout"
                value={booking.checkout}
                onChange={handleBookingChange}
                className="p-2 border rounded-md w-full"
              />
            </div>
          </div>

          {/* Guests Dropdown */}
          <div className="guests-section mb-4 relative">
            <button
              className="p-2 border rounded-md w-full bg-gray-200 text-left"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            >
              {`${booking.guests.adults} Adults, ${booking.guests.children} Children, ${booking.guests.infants} Infants, ${booking.guests.pets} Pets`}
            </button>
            {showGuestDropdown && (
              <div className="guest-dropdown absolute bg-white shadow-lg p-4 mt-2 w-full rounded-md z-10">
                {/* Adults */}
                <div className="flex items-center justify-between mb-2">
                  <label>Adults (Age 13+)</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleGuestsChange('adults', -1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="mx-4">{booking.guests.adults}</span>
                    <button
                      onClick={() => handleGuestsChange('adults', 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Children */}
                <div className="flex items-center justify-between mb-2">
                  <label>Children (Ages 2–12)</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleGuestsChange('children', -1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="mx-4">{booking.guests.children}</span>
                    <button
                      onClick={() => handleGuestsChange('children', 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Infants */}
                <div className="flex items-center justify-between mb-2">
                  <label>Infants (Under 2)</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleGuestsChange('infants', -1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="mx-4">{booking.guests.infants}</span>
                    <button
                      onClick={() => handleGuestsChange('infants', 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Pets */}
                <div className="flex items-center justify-between mb-2">
                  <label>Pets</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleGuestsChange('pets', -1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="mx-4">{booking.guests.pets}</span>
                    <button
                      onClick={() => handleGuestsChange('pets', 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total Price */}
          <div className="total-price mb-4">
            <h3>
              Total Price:{' '}
              <span className="font-bold">R{totalPrice.toFixed(2)}</span>
            </h3>
          </div>

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            className="p-2 bg-blue-600 text-white w-full rounded-md"
          >
            Book Now
          </button>

          {/* Booking Status Messages */}
          {bookingStatus === 'loading' && <p>Processing your booking...</p>}
          {bookingStatus === 'succeeded' && (
            <p className="text-green-500">Booking successful!</p>
          )}
          {bookingStatus === 'failed' && (
            <p className="text-red-500">Booking failed: {bookingError}</p>
          )}
        </div>
      </div>

      {/* Amenities Section */}
      <div className="amenities-container p-6">
        <h3 className="text-lg font-bold mb-4">What the Place Offers:</h3>
        <div className="amenities flex flex-col space-y-4">
          <div className="amenity flex items-center">
            <img src="/images/wifi.png" alt="WiFi" className="w-8 h-8" />
            <p className="ml-4">Free WiFi</p>
          </div>
          <div className="amenity flex items-center">
            <img src="/images/swimming.png" alt="Pool" className="w-8 h-8" />
            <p className="ml-4">Swimming Pool</p>
          </div>
          <div className="amenity flex items-center">
            <img src="/images/parking.png" alt="Parking" className="w-8 h-8" />
            <p className="ml-4">Free Parking</p>
          </div>
          <div className="amenity flex items-center">
            <img src="/images/encrypted.png" alt="Security" className="w-8 h-8" />
            <p className="ml-4">Security</p>
          </div>
          <div className="amenity flex items-center">
            <img src="/images/kitchen.png" alt="Kitchen" className="w-8 h-8" />
            <p className="ml-4">Kitchen</p>
          </div>
          <div className="amenity flex items-center">
            <img
              src="/images/air-conditioner.png"
              alt="Air Conditioning"
              className="w-8 h-8"
            />
            <p className="ml-4">Air Conditioning</p>
          </div>
        </div>
      </div>

      <footer className="footer bg-gray-800 text-white p-4 text-center">
        <p>Copyright © 2024 Hotel Booking</p>
      </footer>
    </div>
  );
};

export default HotelDetail;
