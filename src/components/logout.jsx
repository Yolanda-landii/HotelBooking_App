import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; 

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await auth.signOut(); 
        navigate('/'); 
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    logoutUser(); 
  }, [navigate]);

  return <p>Logging out...</p>; 
};

export default Logout;
