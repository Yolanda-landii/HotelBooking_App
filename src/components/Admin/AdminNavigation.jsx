import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';

const AdminNavigation = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
      <div className="logo">
        <Link to="/admin">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </Link>
      </div>
      <nav className="nav">
        <ul className="flex space-x-6">
          <li><Link to="/admin" className="hover:underline">Dashboard</Link></li>
          <li><Link to="/reservations" className="hover:underline">Reservations</Link></li>
          <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
        </ul>
      </nav>
    </header>
  );
};

export default AdminNavigation; 