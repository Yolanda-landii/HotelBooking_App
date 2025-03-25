import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { currentUser } = useAuth();

  return (
    <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
      <div className="logo">
        <Link to="/">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </Link>
      </div>
      <nav className="nav">
        <ul className="flex space-x-6">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          {currentUser ? (
            <>
              <li><Link to="/bookings" className="hover:underline">Bookings</Link></li>
              <li><Link to="/messages" className="hover:underline">Messages</Link></li>
              <li><Link to="/profile" className="hover:underline">Profile</Link></li>
              <li><Link to="/logout" className="hover:underline">Logout</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="hover:underline">Login</Link></li>
              <li><Link to="/register" className="hover:underline">Sign Up</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;