import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Pages/User/Register';
import Login from './Pages/User/Login';
import HomePage from './Pages/User/HomePage';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/Admin/AdminPrivateRoute';
import HotelDetail from './components/HotelDetails';
import AdminDashboard from './Pages/Admin/Admin';
import BookingConfirmation from './components/BookingConfirmation';
import Profile from './Pages/User/UserProfile';

function App() {
  // const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* User Side Routes */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }  
        />
        <Route path="/hotel-details/:id" element={<HotelDetail />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin Side Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminPrivateRoute>
              <AdminDashboard />
            </AdminPrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
