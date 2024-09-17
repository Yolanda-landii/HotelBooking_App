import React, { useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels, } from '../../redux/slices/hotelSlice';
import { fetchAllBookings } from '../../redux/slices/bookingSlice';
import { db, auth } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';



const Reservations =()=>{
    const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const bookings = useSelector((state) => state.booking.bookings) || [];
    useEffect(() => {
        dispatch(fetchHotels());
        dispatch(fetchAllBookings());
      }, [dispatch]);

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
                <img src="/path/to/logo.png" alt="Logo" className="w-24 h-auto" />
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
                {Array.isArray(bookings) && bookings.length === 0 ? (
                <p>No bookings found.</p>
                ) : (
                bookings.map((booking) => (
                    <div key={booking.id} className="p-4 mb-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                    <p><strong>Guest Name:</strong> {booking.guestName}</p>
                    <p><strong>Room:</strong> {booking.roomType}</p>
                    <p><strong>Check-in:</strong> {booking.checkInDate}</p>
                    <p><strong>Check-out:</strong> {booking.checkOutDate}</p>
                    <p><strong>Status:</strong> {booking.status}</p>

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