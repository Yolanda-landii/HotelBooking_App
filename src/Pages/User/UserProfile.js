import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import Navigation from '../../components/Navigation';

const Profile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    address: '',
    profilePicture: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData({
              displayName: userData.displayName || '',
              email: currentUser.email || '',
              phoneNumber: userData.phoneNumber || '',
              address: userData.address || '',
              profilePicture: userData.profilePicture || ''
            });
          }
        }
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleFileSelect = (event) => {
    if (event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let profilePictureUrl = profileData.profilePicture;

      // Upload new profile picture if selected
      if (selectedFile) {
        const fileRef = ref(storage, `profilePictures/${currentUser.uid}`);
        await uploadBytes(fileRef, selectedFile);
        profilePictureUrl = await getDownloadURL(fileRef);
      }

      // Update user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        profilePicture: profilePictureUrl
      });

      setProfileData(prev => ({
        ...prev,
        profilePicture: profilePictureUrl
      }));
      
      setSuccess('Profile updated successfully!');
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Profile Settings</h1>
          
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={profileData.profilePicture || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Address
              </label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <p>Copyright © 2024 Hlala Nathi</p>
      </footer>
    </div>
  );
};

export default Profile;
