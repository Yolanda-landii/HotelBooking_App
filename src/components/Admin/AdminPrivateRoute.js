import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkAdminStatus } from '../../utils/firabaseUtils';

function AdminPrivateRoute({ children }) {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (currentUser) {
        const adminStatus = await checkAdminStatus(currentUser);
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    };

    verifyAdmin();
  }, [currentUser]);

  if (loading) return <p>Loading...</p>;

  return isAdmin ? children : <Navigate to="/" />;
}

export default AdminPrivateRoute;
