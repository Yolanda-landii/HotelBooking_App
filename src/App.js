import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Register from './Pages/User/Register';
import Login from './Pages/User/Login';
import HomePage from './Pages/User/HomePage';
import { NotificationsProvider } from "./contexts/NotificationsContext";
import Messages from './components/Messages';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/Admin/AdminPrivateRoute';
import RoomDetails from './components/RoomDetails';
import Logout from './components/logout';
import BookingForm from './components/BookingForm';
import ViewRoom from './components/ViewRoom';
import CheckoutForm from './components/CheckoutForm';
import AdminDashboard from './Pages/Admin/Admin';
import BookingConfirmation from './components/BookingConfirmation';
import Profile from './Pages/User/UserProfile';
import Bookings from './components/Bookings';
import Reservations from './Pages/Admin/Reservations';

const stripePromise = loadStripe('pk_test_51PyWUREMz50nif55fK8C9cxOdEly9YE9oI3FSiPamkRbdehoxGezQa8sunPYYuqKDmwZPKhsmqZDeBOSmgkZPhhg00hcETCYXE');


function App() {
  // const { currentUser } = useAuth();

  return (
    <Router>
      <NotificationsProvider>
      <Routes>
  {/* Public Routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/register" element={<Register />} />
  <Route path="/login" element={<Login />} />
  <Route path="/logout" element={<Logout />} />

  {/* Public Room Routes */}
  <Route path="/room/:roomId" element={<RoomDetails />} />
  <Route path="/rooms/:roomId" element={<ViewRoom />} />

  {/* Restricted Booking Routes */}
  <Route path="/rooms/:roomId/book" element={<PrivateRoute><BookingForm/></PrivateRoute>} />
  <Route path="/checkout" element={
    <PrivateRoute>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </PrivateRoute>
  } />
  <Route path="/booking-confirmation" element={<PrivateRoute><BookingConfirmation /></PrivateRoute>} />

  {/* User Routes */}
  <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
  <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
  <Route path="/profile" element={<Profile />} />

  {/* Admin Routes */}
  <Route path="/admin" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
  <Route path="/reservations" element={<AdminPrivateRoute><Reservations /></AdminPrivateRoute>} />
</Routes>

          </NotificationsProvider>
    </Router>
  );
}

export default App;
