import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../../redux/slices/userSlice'; // Ensure this import path is correct
import { fetchUserBookings } from '../../redux/slices/bookingSlice'; // Ensure this import path is correct
import { getUserProfile, updateProfile } from '../../utils/firabaseUtils'; // Ensure this import path is correct

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [profileData, setProfileData] = useState({ email: '', role: '' });
  const [isEditing, setIsEditing] = useState(false);
  const bookings = useSelector((state) => state.booking.bookings); // Adjust if needed
  const favorites = useSelector((state) => state.booking.favorites); // Adjust if needed

  useEffect(() => {
    if (user && user.uid) {
      const fetchProfile = async () => {
        try {
          const data = await getUserProfile(user.uid);
          setProfileData(data);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };

      fetchProfile();
      dispatch(fetchUserBookings(user.uid));
      // Dispatch action for fetching favorites if needed
    }
  }, [dispatch, user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (user && user.uid) {
      await updateProfile(user.uid, profileData);
      dispatch(updateUserProfile({ ...profileData, uid: user.uid }));
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {isEditing ? (
        <div className="mb-6">
          <input
            type="text"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
            placeholder="Email"
          />
          <button
            onClick={handleSaveClick}
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-lg">Email: {profileData.email}</p>
          <p className="text-lg">Role: {profileData.role}</p>
          <button
            onClick={handleEditClick}
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit Profile
          </button>
        </div>
      )}
      <section>
        <h2 className="text-xl font-bold mb-4">Bookings</h2>
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id} className="border-b border-gray-300 p-2">
              {booking.hotelName} - {booking.date}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-bold mb-4">Favorites</h2>
        <ul>
          {favorites.map((favorite) => (
            <li key={favorite.id} className="border-b border-gray-300 p-2">
              {favorite.hotelName}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Profile;
