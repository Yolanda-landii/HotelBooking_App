import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import Navigation from './Navigation';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Create a query for the user's bookings
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef, 
      where("userId", "==", currentUser.uid)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const bookingsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort bookings by createdAt date on the client side
        bookingsList.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        
        setBookings(bookingsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
        setLoading(false);
      }
    }, (err) => {
      console.error('Error in snapshot listener:', err);
      setError('Failed to load bookings');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navigation />
      <main className="flex-grow container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Booking History</h2>

        {loading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">You have no bookings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold mb-2">{booking.hotelName}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-semibold">Check-in:</span> {new Date(booking.checkin).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Check-out:</span> {new Date(booking.checkout).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Guests:</span> {booking.guests.adults + booking.guests.children}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Total Price:</span> R{booking.totalPrice}
                  </p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status || 'pending'}
                  </div>
                </div>
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
