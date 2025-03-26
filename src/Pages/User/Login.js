import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Temporary function to make current user an admin
  const makeAdmin = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('No user logged in');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        role: 'admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert('User has been made admin. Please log out and log back in.');
    } catch (err) {
      console.error('Error making user admin:', err);
      alert('Failed to make user admin');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // If user document doesn't exist or needs update
      if (!userDoc.exists()) {
        // Set up admin for specific email (replace with your admin email)
        const isAdmin = email === 'admin@example.com';
        await setDoc(userDocRef, {
          email: user.email,
          role: isAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        });
      }

      // Get updated user data
      const updatedUserDoc = await getDoc(userDocRef);
      const userData = updatedUserDoc.data();

      // Update Redux store
      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        role: userData.role
      }));

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        // Redirect to the intended page or home
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Sign in to your account</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="email-address" className="block text-gray-700 text-sm font-bold mb-2">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-bold ${loading ? 'bg-blue-300' : 'bg-blue-500'} hover:bg-blue-600`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
