import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { fetchUserBookings, selectBookings, selectBookingStatus, selectBookingError } from "../redux/slices/bookingSlice";
import { useAuth } from "../contexts/AuthContext"; 

const Bookings = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectBookings);
  const status = useSelector(selectBookingStatus);
  const error = useSelector(selectBookingError);
  const { currentUser } = useAuth(); 

  // State for filtering by status (e.g., Pending, Approved, Canceled)
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUserBookings(currentUser.uid)); 
    }
  }, [dispatch, currentUser]);

  // Filter bookings based on the selected status
  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-6">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/bookings" className="hover:underline">Bookings</a></li>
            <li><a href="/messages" className="hover:underline">Messages</a></li>
            <li><a href="/profile" className="hover:underline">Profile</a></li>
            <li><Link to="/logout" className="hover:underline">Logout</Link></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Booking History</h2>

        {/* Status Filter */}
        <div className="mb-4">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`mr-2 ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            All
          </button>
          <button 
            onClick={() => setFilterStatus('Pending')}
            className={`mr-2 ${filterStatus === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>
            Pending
          </button>
          <button 
            onClick={() => setFilterStatus('Approved')}
            className={`mr-2 ${filterStatus === 'Approved' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
            Approved
          </button>
          <button 
            onClick={() => setFilterStatus('Canceled')}
            className={`mr-2 ${filterStatus === 'Canceled' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
            Canceled
          </button>
        </div>

        {status === "loading" && <p className="text-gray-600">Loading bookings...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {status === "succeeded" && filteredBookings.length === 0 ? (
          <p className="text-gray-600">You have no bookings yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-4 shadow-lg rounded-md border border-gray-200">
                <h3 className="text-xl font-bold">{booking.hotelName}</h3>
                <p className="text-gray-600">Check-in: {booking.checkin}</p>
                <p className="text-gray-600">Check-out: {booking.checkout}</p>

                <p className="text-gray-600">
                  Guests: {booking.guests?.adults || 0} Adults, 
                  {booking.guests?.children || 0} Children, 
                  {booking.guests?.infants || 0} Infants, 
                  {booking.guests?.pets || 0} Pets
                </p>

                <p className="text-gray-600">
                  Status: <span className={`font-semibold 
                      ${booking.status === 'Approved' ? 'text-green-500' : 
                      booking.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                      {booking.status}
                  </span>
                </p>

                <p className="text-blue-600 font-semibold mt-2">Total: R{booking.totalPrice}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer bg-gray-800 text-white p-4 text-center">
        <p>Copyright © 2024 Hlala Nathi</p>
      </footer>
    </div>
  );
};

export default Bookings;
