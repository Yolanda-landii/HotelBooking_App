import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Register from './Pages/User/Register';
import Login from './Pages/User/Login';
import HomePage from './Pages/User/HomePage';
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
import Reservations from './Pages/Admin/Reservations';

const stripePromise = loadStripe('pk_test_51PyWUREMz50nif55fK8C9cxOdEly9YE9oI3FSiPamkRbdehoxGezQa8sunPYYuqKDmwZPKhsmqZDeBOSmgkZPhhg00hcETCYXE');


function App() {
  // const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* User Side Routes */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }  
        />
        <Route path="/room/:roomId" element={<RoomDetails />} />
        <Route path="/rooms/:roomId" element={<ViewRoom />} />
        <Route path="/rooms/:roomId/book" element={<BookingForm/>} />
        <Route path="/rooms/:roomId/book/confirm" element={<Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin Side Routes */}
        <Route path="/admin" element={
            <AdminPrivateRoute>
              <AdminDashboard />
            </AdminPrivateRoute>
          } 
        />
        <Route path='/reservations' element={<Reservations />} />
      </Routes>
    </Router>
  );
}

export default App;
