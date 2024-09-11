import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Pages/Register';
import Login from './Pages/Login';
import HomePage from './Pages/HomePage';
import PrivateRoute from './components/PrivateRoute';
import HotelDetail from './components/HotelDetails';
import Admin from './Pages/Admin';
import BookingConfirmation from './components/BookingConfirmation';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Private Route for HomePage */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }  
        />
        
        <Route path="/hotel-details/:id" element={<HotelDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      </Routes>
    </Router>
  );
}

export default App;
