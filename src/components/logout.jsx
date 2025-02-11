import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; // Assuming Firebase auth is configured

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await auth.signOut(); // Sign out the user using Firebase
        navigate('/login'); // Redirect to the login page after logout
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    logoutUser(); // Call the logout function when the component is mounted
  }, [navigate]);

  return <p>Logging out...</p>; // Show a loading message while logging out
};

export default Logout;
