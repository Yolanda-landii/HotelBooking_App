import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels, addHotel, deleteHotel, updateHotel } from '../../redux/slices/hotelSlice';
import { storage, auth } from '../../config/firebase'; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase storage utilities
import { signOut } from 'firebase/auth'; // Import signOut function
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hotels, status, error } = useSelector((state) => state.hotels);

  const [newHotel, setNewHotel] = useState({
    name: '',
    price: '',
    imageUrl: '',
    distance: '',
    roomType: '',
    capacity: '',
    availability: '',
  });
  
  const [imageFile, setImageFile] = useState(null); // For storing the selected image file
  const [uploading, setUploading] = useState(false); // Track uploading state
  const [editingHotel, setEditingHotel] = useState(null); // Stores the currently editing hotel

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login'); // Redirect to login page after logout
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingHotel) {
      setEditingHotel((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewHotel((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    const imageRef = ref(storage, `hotels/${imageFile.name}`);
    setUploading(true);

    try {
      const uploadTask = uploadBytesResumable(imageRef, imageFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          console.error('Upload failed:', error);
          setUploading(false);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          if (editingHotel) {
            setEditingHotel((prev) => ({ ...prev, imageUrl }));
          } else {
            setNewHotel((prev) => ({ ...prev, imageUrl }));
          }
          setUploading(false);
        }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
    }
  };

  const handleAddHotel = () => {
    if (!newHotel.imageUrl) {
      alert('Please upload an image first.');
      return;
    }

    dispatch(addHotel(newHotel));
    setNewHotel({
      name: '',
      price: '',
      imageUrl: '',
      distance: '',
      roomType: '',
      capacity: '',
      availability: '',
    });
    setImageFile(null);
  };

  const handleDeleteHotel = (id) => {
    dispatch(deleteHotel(id));
  };

  const handleEditHotel = (id) => {
    const hotelToEdit = hotels.find((hotel) => hotel.id === id);
    setEditingHotel(hotelToEdit);
  };

  const handleSaveEditHotel = async () => {
    if (!editingHotel.imageUrl) {
      alert('Please upload an image first.');
      return;
    }

    dispatch(updateHotel({ id: editingHotel.id, updatedData: editingHotel }));
    setEditingHotel(null);
    setImageFile(null); // Reset image file after editing
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>

      {/* Add Hotel Form */}
      <div className="mb-6 p-4 bg-gray-100 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Add New Hotel</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <input
            type="text"
            name="name"
            placeholder="Hotel Name"
            onChange={handleInputChange}
            value={newHotel.name}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="price"
            placeholder="Price"
            onChange={handleInputChange}
            value={newHotel.price}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="roomType"
            placeholder="Room Type"
            onChange={handleInputChange}
            value={newHotel.roomType}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            onChange={handleInputChange}
            value={newHotel.capacity}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="availability"
            placeholder="Availability"
            onChange={handleInputChange}
            value={newHotel.availability}
            className="p-2 border border-gray-300 rounded"
          />

          {/* Image Upload */}
          <input
            type="file"
            onChange={handleImageChange}
            className="p-2 border border-gray-300 rounded"
          />

          <button
            onClick={handleUploadImage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>

        <button
          onClick={handleAddHotel}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={uploading}
        >
          Add Hotel
        </button>
      </div>

      {/* List of Hotels with Edit/Delete */}
      <div className="grid grid-cols-1 gap-4">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="p-4 bg-white rounded shadow">
            {editingHotel && editingHotel.id === hotel.id ? (
              <div>
                <input
                  type="text"
                  name="name"
                  value={editingHotel.name}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded mb-2"
                />
                <input
                  type="text"
                  name="price"
                  value={editingHotel.price}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded mb-2"
                />
                <input
                  type="text"
                  name="distance"
                  value={editingHotel.distance}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded mb-2"
                />
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="p-2 border border-gray-300 rounded mb-2"
                />
                <button
                  onClick={handleUploadImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>

                <button
                  onClick={handleSaveEditHotel}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  disabled={uploading}
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                <p className="text-gray-700 mb-2">{hotel.price}</p>
                <p className="text-gray-500 mb-2">{hotel.distance} km away</p>
                <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-48 object-cover rounded mb-2" />
                <button
                  onClick={() => handleDeleteHotel(hotel.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEditHotel(hotel.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
