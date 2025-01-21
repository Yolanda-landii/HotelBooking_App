import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    name: '',
    price: 0,
    description: '',
    type: '', // New field: Room Type
    beds: 1, // New field: Number of Beds
    maxOccupancy: 1, // New field: Max Occupancy
    facilities: '', // New field: Facilities
    size: '', // New field: Room Size
    availability: true,
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'rooms'));
        const fetchedRooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

  const handleAddRoom = async () => {
    if (!newRoom.imageUrl) {
      alert('Please upload an image first.');
      return;
    }

    try {
      const newRoomRef = collection(db, 'rooms');
      await addDoc(newRoomRef, newRoom);
      setRooms((prev) => [...prev, { ...newRoom }]);
      setNewRoom({
        name: '',
        price: 0,
        description: '',
        type: '',
        beds: 1,
        maxOccupancy: 1,
        facilities: '',
        size: '',
        availability: true,
        imageUrl: '',
      });
      setImageFile(null);
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await deleteDoc(doc(db, 'rooms', id));
      setRooms((prev) => prev.filter((room) => room.id !== id));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  if (loading) return <p>Loading rooms...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center bg-gray-900 text-white p-4">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
          Logout
        </button>
      </header>

      <div className="p-6 bg-white rounded-lg shadow-lg mb-6">
        <h2>Add New Room</h2>
        <input
          type="text"
          name="name"
          placeholder="Room Name"
          value={newRoom.name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newRoom.price}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Room Description"
          value={newRoom.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="type"
          placeholder="Room Type (e.g., Suite, Double)"
          value={newRoom.type}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="beds"
          placeholder="Number of Beds"
          value={newRoom.beds}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="maxOccupancy"
          placeholder="Max Occupancy"
          value={newRoom.maxOccupancy}
          onChange={handleInputChange}
        />
        <textarea
          name="facilities"
          placeholder="Facilities (comma-separated, e.g., Wi-Fi, AC, TV)"
          value={newRoom.facilities}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="size"
          placeholder="Room Size (e.g., 300 sq ft)"
          value={newRoom.size}
          onChange={handleInputChange}
        />
        <input
          type="checkbox"
          name="availability"
          checked={newRoom.availability}
          onChange={handleInputChange}
        />
        <label>Available</label>
        <input type="file" onChange={handleImageChange} />
        <button
          onClick={() => uploadImage((url) => setNewRoom((prev) => ({ ...prev, imageUrl: url })))}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <button onClick={handleAddRoom}>Add Room</button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2>Room List</h2>
        {rooms.map((room) => (
          <div key={room.id} className="flex justify-between items-center">
            <div>
              <h3>{room.name}</h3>
              <p>Type: {room.type}</p>
              <p>Price: {room.price}</p>
              <p>Beds: {room.beds}</p>
              <p>Max Occupancy: {room.maxOccupancy}</p>
              <p>Facilities: {room.facilities}</p>
              <p>Size: {room.size}</p>
            </div>
            <div>
              <button onClick={() => navigate(`/admin/hotel-update/${room.id}`)}>Edit</button>
              <button onClick={() => handleDeleteRoom(room.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
