import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { fetchUserBookings, selectBookings, selectBookingStatus, selectBookingError } from "../redux/slices/bookingSlice";
import { useAuth } from "../contexts/AuthContext";
import Navigation from './Navigation';

const Bookings = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectBookings);
  const status = useSelector(selectBookingStatus);
  const error = useSelector(selectBookingError);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log("Fetching bookings for user:", currentUser.uid);
      dispatch(fetchUserBookings(currentUser.uid));
    }
  }, [dispatch, currentUser]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navigation />
      {/* Main Content */}
      <main className="flex-grow container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Booking History</h2>

        {status === "loading" && <p className="text-gray-600">Loading bookings...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {status === "succeeded" && bookings.length === 0 ? (
            <p className="text-gray-600">You have no bookings yet.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
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
