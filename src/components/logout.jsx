import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button 
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
