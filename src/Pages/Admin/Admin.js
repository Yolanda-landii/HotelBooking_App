import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels, addHotel, deleteHotel, updateHotel } from '../../redux/slices/hotelSlice';
import { fetchAllBookings } from '../../redux/slices/bookingSlice';
import { storage, auth } from '../../config/firebase';
// import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const hotels = useSelector((state) => state.hotels.hotels) || [];
  const hotelStatus = useSelector((state) => state.hotels.status);
  const hotelError = useSelector((state) => state.hotels.error);


  const bookingStatus = useSelector((state) => state.booking.status);
  const bookingError = useSelector((state) => state.booking.error);

  const [newHotel, setNewHotel] = useState({
    name: '', price: '', imageUrl: '', distance: '', roomType: '', capacity: '', availability: ''
  });

  const [editingHotel, setEditingHotel] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchHotels());
    dispatch(fetchAllBookings());
  }, [dispatch]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
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
      uploadTask.on('state_changed', () => {}, (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
      }, async () => {
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        if (editingHotel) {
          setEditingHotel((prev) => ({ ...prev, imageUrl }));
        } else {
          setNewHotel((prev) => ({ ...prev, imageUrl }));
        }
        setUploading(false);
      });
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
    setNewHotel({ name: '', price: '', imageUrl: '', distance: '', roomType: '', capacity: '', availability: '' });
    setImageFile(null);
  };

  const handleDeleteHotel = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDeleteHotel = (id) => {
    dispatch(deleteHotel(id));
    setShowDeleteConfirm(null);
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
    setImageFile(null);
  };

  

  if (hotelStatus === 'loading' || bookingStatus === 'loading') return <p className="text-center py-4">Loading...</p>;
  if (hotelStatus === 'failed') return <p className="text-center text-red-500">Error: {hotelError}</p>;
  if (bookingStatus === 'failed') return <p className="text-center text-red-500">Error: {bookingError}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
                <div className="logo">
                <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
                </div>
                <nav className="nav">
                <ul className="flex space-x-6">
                    <li><a href="/admin" className="hover:underline">Home</a></li>
                    <li><a href="/reservations" className="hover:underline">Reservations</a></li>
                    <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
                </ul>
                </nav>
            </header>

    

      {/* Add Hotel Form */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Add New Hotel</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <input
            type="text"
            name="name"
            placeholder="Hotel Name"
            onChange={handleInputChange}
            value={newHotel.name}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="price"
            placeholder="Price"
            onChange={handleInputChange}
            value={newHotel.price}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="roomType"
            placeholder="Room Type"
            onChange={handleInputChange}
            value={newHotel.roomType}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            onChange={handleInputChange}
            value={newHotel.capacity}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="availability"
            placeholder="Availability"
            onChange={handleInputChange}
            value={newHotel.availability}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="distance"
            placeholder="Distance"
            onChange={handleInputChange}
            value={newHotel.distance}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="file"
            onChange={handleImageChange}
            className="col-span-1 sm:col-span-2 md:col-span-4"
          />
          {imageFile && (
            <div className="col-span-1 sm:col-span-2 md:col-span-4">
              <button
                onClick={handleUploadImage}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          )}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end">
            <button
              onClick={handleAddHotel}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Edit Hotel Form */}
      {editingHotel && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Edit Hotel</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <input
              type="text"
              name="name"
              placeholder="Hotel Name"
              onChange={handleInputChange}
              value={editingHotel.name}
              className="p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="price"
              placeholder="Price"
              onChange={handleInputChange}
              value={editingHotel.price}
              className="p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="roomType"
              placeholder="Room Type"
              onChange={handleInputChange}
              value={editingHotel.roomType}
              className="p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              name="capacity"
              placeholder="Capacity"
              onChange={handleInputChange}
              value={editingHotel.capacity}
              className="p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="availability"
              placeholder="Availability"
              onChange={handleInputChange}
              value={editingHotel.availability}
              className="p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="distance"
              placeholder="Distance"
              onChange={handleInputChange}
              value={editingHotel.distance}
              className="p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="file"
              onChange={handleImageChange}
              className="col-span-1 sm:col-span-2 md:col-span-4"
            />
            {imageFile && (
              <div className="col-span-1 sm:col-span-2 md:col-span-4">
                <button
                  onClick={handleUploadImage}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            )}
            <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end">
              <button
                onClick={handleSaveEditHotel}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotel List */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Hotel List</h3>
        {Array.isArray(hotels) && hotels.length === 0 ? (
          <p>No hotels available.</p>
        ) : (
          hotels.map((hotel) => (
            <div key={hotel.id} className="p-4 mb-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              <h4 className="text-xl font-semibold">{hotel.name}</h4>
              <p><strong>Price:</strong> {hotel.price}</p>
              <p><strong>Room Type:</strong> {hotel.roomType}</p>
              <p><strong>Capacity:</strong> {hotel.capacity}</p>
              <p><strong>Availability:</strong> {hotel.availability}</p>
              <p><strong>Distance:</strong> {hotel.distance}</p>
              <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-40 object-cover mt-2" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEditHotel(hotel.id)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button onClick={() => handleDeleteHotel(hotel.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-semibold mb-4">Confirm Delete</h4>
            <p>Are you sure you want to delete this hotel?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => confirmDeleteHotel(showDeleteConfirm)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
