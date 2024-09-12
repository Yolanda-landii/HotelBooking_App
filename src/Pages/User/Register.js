import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerRequest, registerSuccess, registerFailure } from '../../redux/slices/userSlice';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { Link } from 'react-router-dom';
import { setDoc, doc } from 'firebase/firestore';

function Register() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role

  const addUserToFirestore = async (userCredential, role) => {
    const { uid, email } = userCredential.user;
    await setDoc(doc(db, 'users', uid), {
      email,
      role,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    dispatch(registerRequest());

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      dispatch(registerSuccess({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      }));
      
      await addUserToFirestore(userCredential, role); // Use the selected role
    } catch (error) {
      dispatch(registerFailure(error.message));
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
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
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-bold ${loading ? 'bg-blue-300' : 'bg-blue-500'} hover:bg-blue-600`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
