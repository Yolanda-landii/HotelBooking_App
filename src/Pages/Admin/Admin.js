import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms, addRoom, deleteRoom, updateRoom } from '../../redux/slices/roomSlice';
import { fetchAllBookings } from '../../redux/slices/bookingSlice';
import { storage, auth } from '../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const rooms = useSelector((state) => state.rooms.rooms) || [];
  const roomStatus = useSelector((state) => state.rooms.status);
  const roomError = useSelector((state) => state.rooms.error);

  const [newRoom, setNewRoom] = useState({ roomType: '', capacity: '', price: '', availability: '', imageUrl: '' });
  const [editingRoom, setEditingRoom] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchRooms());
    dispatch(fetchAllBookings());
  }, [dispatch]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const targetRoom = editingRoom || newRoom;
    const setRoom = editingRoom ? setEditingRoom : setNewRoom;
    setRoom({ ...targetRoom, [name]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImage = async (callback) => {
    if (!imageFile) {
      alert('Please select an image.');
      return;
    }

    const imageRef = ref(storage, `rooms/${imageFile.name}`);
    setUploading(true);

    try {
      const uploadTask = uploadBytesResumable(imageRef, imageFile);
      uploadTask.on(
        'state_changed',
        null,
        (error) => console.error('Upload failed:', error),
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          callback(imageUrl);
          setUploading(false);
        }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
    }
  };

  const handleAddRoom = () => {
    if (!newRoom.imageUrl) {
      alert('Please upload an image first.');
      return;
    }

    dispatch(addRoom(newRoom));
    setNewRoom({ roomType: '', capacity: '', price: '', availability: '', imageUrl: '' });
    setImageFile(null);
  };

  const handleSaveEditRoom = () => {
    if (!editingRoom.imageUrl) {
      alert('Please upload an image first.');
      return;
    }

    dispatch(updateRoom({ id: editingRoom.id, updatedData: editingRoom }));
    setEditingRoom(null);
    setImageFile(null);
  };

  if (roomStatus === 'loading') return <p>Loading rooms...</p>;
  if (roomError) return <p>Error: {roomError}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center bg-gray-900 text-white p-4">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
          Logout
        </button>
      </header>

      {/* Add/Edit Room */}
      <div className="p-6 bg-white rounded-lg shadow-lg mb-6">
        <h2>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
        <input
          type="text"
          name="roomType"
          placeholder="Room Type"
          value={editingRoom ? editingRoom.roomType : newRoom.roomType}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={editingRoom ? editingRoom.capacity : newRoom.capacity}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={editingRoom ? editingRoom.price : newRoom.price}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="availability"
          placeholder="Availability"
          value={editingRoom ? editingRoom.availability : newRoom.availability}
          onChange={handleInputChange}
        />
        <input type="file" onChange={handleImageChange} />
        <button
          onClick={() => uploadImage((url) => (editingRoom ? setEditingRoom({ ...editingRoom, imageUrl: url }) : setNewRoom({ ...newRoom, imageUrl: url })))}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <button onClick={editingRoom ? handleSaveEditRoom : handleAddRoom}>
          {editingRoom ? 'Save Changes' : 'Add Room'}
        </button>
      </div>

      {/* Room List */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2>Room List</h2>
        {rooms.map((room) => (
          <div key={room.id} className="flex justify-between items-center">
            <div>
              <h3>{room.roomType}</h3>
              <p>Price: {room.price}</p>
              <p>Capacity: {room.capacity}</p>
            </div>
            <div>
              <button onClick={() => setEditingRoom(room)}>Edit</button>
              <button onClick={() => dispatch(deleteRoom(room.id))}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
