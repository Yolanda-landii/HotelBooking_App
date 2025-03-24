import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth, storage } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { updateUserProfile, fetchUserProfile } from '../../redux/slices/userSlice';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DEFAULT_PROFILE_PICTURE = '/images/default-profile.png';

function Profile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE);

  // Fetch user data on mount
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserProfile(user.uid));
    } else {
      console.error('User is not logged in or UID is missing');
    }
  }, [dispatch, user?.uid]); 
  

// Sync state with user profile when fetched
useEffect(() => {
  if (user && user.uid) {
    setEmail(user.email || '');
    setDisplayName(user.displayName || '');
    setLastName(user.lastName || '');
    setPhoneNumber(user.phoneNumber || '');
    setProfilePictureUrl(user.profilePictureUrl || DEFAULT_PROFILE_PICTURE);
  }
}, [user]);

  

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user?.uid) {
    console.error('User is not logged in or UID is missing');
    return;
  }

  let newProfilePictureUrl = profilePictureUrl;
  if (profilePicture) {
    try {
      const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
      const snapshot = await uploadBytes(profilePicRef, profilePicture);
      newProfilePictureUrl = await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error uploading image:', error);
      return;
    }
  }

  const profileData = {
    displayName,
    lastName,
    email,
    phoneNumber,
    profilePictureUrl: newProfilePictureUrl,
  };

  dispatch(updateUserProfile({ uid: user.uid, profileData }));
};

  
  

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/bookings" className="hover:underline">Bookings</Link></li>
            <li><Link to="/profile" className="hover:underline">Profile</Link></li>
            <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <img src={profilePictureUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4" />
            <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files[0])} className="mb-4" />
          </div>
          <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="block w-full mb-4 p-2 border rounded" />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="block w-full mb-4 p-2 border rounded" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full mb-4 p-2 border rounded" />
          <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="block w-full mb-4 p-2 border rounded" />
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}

        </form>
      </main>

      <footer className="footer bg-gray-800 text-white p-4 text-center">
      <p>Copyright © 2024 Hlala Nathi</p>
      </footer>
    </div>
  );
}

export default Profile;
