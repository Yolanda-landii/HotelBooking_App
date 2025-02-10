import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaWifi, FaSwimmer, FaParking, FaShieldAlt, FaUtensils, FaSnowflake } from 'react-icons/fa';

const ViewRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const roomData = docSnapshot.data();
        if (roomData.facilities && typeof roomData.facilities === 'string') {
          roomData.facilities = roomData.facilities.split(',').map((facility) => facility.trim());
        }
        setRoom(roomData);
      } else {
        setError('Room not found');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleBooking = () => {
    if (room) {
      navigate(`/rooms/${roomId}/book`, { state: { room } });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const getFacilityIcon = (facility) => {
    switch (facility.toLowerCase()) {
      case 'free wifi': return <FaWifi className="w-8 h-8 text-blue-600" />;
      case 'swimming pool': return <FaSwimmer className="w-8 h-8 text-blue-600" />;
      case 'free parking': return <FaParking className="w-8 h-8 text-blue-600" />;
      case 'security': return <FaShieldAlt className="w-8 h-8 text-blue-600" />;
      case 'kitchen': return <FaUtensils className="w-8 h-8 text-blue-600" />;
      case 'air conditioning': return <FaSnowflake className="w-8 h-8 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="room-details p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{room.name}</h1>
        <p className="text-xl text-blue-600">R{room.price}</p>
      </div>
      <img src={room.imageUrl} alt={room.name} className="w-full h-64 object-cover rounded-md my-4" />
      <div className="description mb-4">
        <h2 className="text-xl font-semibold">Description</h2>
        <p>{room.description}</p>
      </div>
      <div className="facilities mb-4">
        <h2 className="text-xl font-semibold">Facilities</h2>
        {Array.isArray(room.facilities) && room.facilities.length > 0 ? (
          <ul>
            {room.facilities.map((facility, index) => (
              <li key={index} className="flex items-center space-x-4">
                {getFacilityIcon(facility)}
                <p>{facility}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No facilities available</p>
        )}
      </div>
      <div className="location mb-4">
        <h2 className="text-xl font-semibold">Location</h2>
        <p>{room.location || 'Location not provided'}</p>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
        onClick={handleBooking}
      >
        Book Now
      </button>
    </div>
  );
};

export default ViewRoom;
