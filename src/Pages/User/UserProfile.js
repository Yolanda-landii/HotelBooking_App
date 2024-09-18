import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../../config/firebase'; // Ensure storage is imported
import { signOut } from 'firebase/auth';
import { updateUserProfile, fetchUserProfile } from '../../redux/slices/userSlice';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // For profile picture upload

const DEFAULT_PROFILE_PICTURE = '/images/default-profile.png'; // Default picture URL

function Profile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(user?.email || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');  // New field for last name
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');  // New field for phone number
  const [profilePicture, setProfilePicture] = useState(null); // For file input
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || DEFAULT_PROFILE_PICTURE); // URL for the profile picture

  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfile(user.uid));
    }
  }, [dispatch, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newProfilePictureUrl = profilePictureUrl; // Use existing picture URL if not updating
    if (profilePicture) {
      // Upload profile picture to Firebase Storage
      const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
      const snapshot = await uploadBytes(profilePicRef, profilePicture);
      newProfilePictureUrl = await getDownloadURL(snapshot.ref); // Get the download URL
    }

    // Prepare the profile data to update
    const profileData = {
      displayName,
      lastName, // Include last name
      email,
      phoneNumber, // Include phone number
      profilePictureUrl: newProfilePictureUrl, // Include profile picture URL
    };

    // Dispatch the updateUserProfile action with the updated profile data
    dispatch(updateUserProfile({ uid: user.uid, profileData }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="profile-container p-6 bg-gray-100 min-h-screen">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-6">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/profile" className="hover:underline">Profile</a></li>
            <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
          </ul>
        </nav>
      </header>

      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <img 
            src={profilePictureUrl} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePicture(e.target.files[0])}
            className="mb-4"
          />
        </div>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="block w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="block w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="block w-full mb-4 p-2 border rounded"
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}

export default Profile;
