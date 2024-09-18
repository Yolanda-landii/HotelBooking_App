import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import { fetchAllBookings } from '../../redux/slices/bookingSlice';
import { db, auth } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Reservations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch bookings from Redux state
  const bookings = useSelector((state) => state.booking.bookings) || [];
  const memoizedBookings = useMemo(() => bookings, [bookings]);
  const [bookingsWithDetails, setBookingsWithDetails] = useState([]);

  useEffect(() => {
    dispatch(fetchHotels());
    dispatch(fetchAllBookings());
  }, [dispatch]);

  useEffect(() => {
    const fetchUserDetailsForBookings = async () => {
      if (bookings.length > 0) {
        const updatedBookings = await Promise.all(
          bookings.map(async (booking) => {
            try {
              // Fetch user details from Firestore using the userId in the booking
              const userDocRef = doc(db, 'users', booking.userId);
              const userDocSnapshot = await getDoc(userDocRef);
              const userData = userDocSnapshot.exists() ? userDocSnapshot.data() : null;

              // Add user details and booking details to the booking object
              return { 
                ...booking, 
                user: userData,  // Attach user data
                bookingDetails: {  // Attach booking details (if needed)
                  guestName: booking.guestName,
                  roomType: booking.roomType,
                  checkInDate: booking.checkInDate,
                  checkOutDate: booking.checkOutDate,
                  status: booking.status
                }
              };
            } catch (error) {
              console.error('Error fetching user details:', error);
              return { ...booking, user: null };
            }
          })
        );
        setBookingsWithDetails(updatedBookings);
      }
    };

    fetchUserDetailsForBookings();
  }, [bookings]); // Now `bookings` is used directly inside the effect

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'Approved' });
      dispatch(fetchAllBookings()); // Refresh the bookings list
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleModifyBooking = async (bookingId, updatedDetails) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, updatedDetails);
      dispatch(fetchAllBookings()); // Refresh the bookings list
    } catch (error) {
      console.error('Error modifying booking:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'Canceled' });
      dispatch(fetchAllBookings()); // Refresh the bookings list
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-6">
            <li><a href="/admin" className="hover:underline">Home</a></li>
            <li><a href="/reservations" className="hover:underline">Reservations</a></li>
            <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
          </ul>
        </nav>
      </header>

      {/* Manage Bookings */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Manage Bookings</h3>
        {bookings.length === 0 ? (
  <p>No bookings found.</p>
) : (
  bookingsWithDetails.map((booking) => (
    <div key={booking.id} className="p-4 mb-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
      <p><strong>Guest Name:</strong> {booking.guestName}</p>
      <p><strong>Room:</strong> {booking.roomType}</p>
      <p><strong>Check-in:</strong> {booking.checkInDate}</p>
      <p><strong>Check-out:</strong> {booking.checkOutDate}</p>
      <p><strong>Status:</strong> {booking.status}</p>

      {/* Display user details */}
      {booking.user && (
        <div className="mt-2">
          <p><strong>User Email:</strong> {booking.user.email}</p>
          <p><strong>Phone:</strong> {booking.user.phone || 'N/A'}</p>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={() => handleApproveBooking(booking.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Approve
        </button>
        <button onClick={() => handleModifyBooking(booking.id, { roomType: 'New Room Type' })} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          Modify
        </button>
        <button onClick={() => handleCancelBooking(booking.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Cancel
        </button>
      </div>
    </div>
  ))
)}

      </div>
    </div>
  );
};

export default Reservations;
