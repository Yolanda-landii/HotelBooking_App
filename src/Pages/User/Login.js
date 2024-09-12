import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, loginSuccess, loginFailure } from '../../redux/slices/userSlice';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { checkAdminStatus } from '../../utils/firabaseUtils';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginRequest());

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const isAdmin = await checkAdminStatus(user);

      dispatch(loginSuccess({
        uid: user.uid,
        email: user.email,
        role: isAdmin ? 'admin' : 'user', // Set role based on admin status
      }));

      navigate(isAdmin ? '/admin' : '/');
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-bold ${loading ? 'bg-blue-300' : 'bg-blue-500'} hover:bg-blue-600`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
        <p className="mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
