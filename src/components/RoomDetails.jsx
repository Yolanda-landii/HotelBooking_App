import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaWifi, FaSwimmer, FaParking, FaShieldAlt, FaUtensils, FaSnowflake } from 'react-icons/fa'; // Importing icons for facilities

const RoomDetails = () => {
  const { roomId } = useParams(); // Get the room ID from the URL
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        const roomDoc = await getDoc(roomRef);
        if (roomDoc.exists()) {
          setRoom(roomDoc.data());
        } else {
          setError('Room not found');
        }
      } catch (error) {
        setError('Error fetching room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const getFacilityIcon = (facility) => {
    switch (facility) {
      case 'Free WiFi':
        return <FaWifi className="w-8 h-8 text-blue-600" />;
      case 'Swimming Pool':
        return <FaSwimmer className="w-8 h-8 text-blue-600" />;
      case 'Free Parking':
        return <FaParking className="w-8 h-8 text-blue-600" />;
      case 'Security':
        return <FaShieldAlt className="w-8 h-8 text-blue-600" />;
      case 'Kitchen':
        return <FaUtensils className="w-8 h-8 text-blue-600" />;
      case 'Air Conditioning':
        return <FaSnowflake className="w-8 h-8 text-blue-600" />;
      default:
        return null;
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
        <ul>
          {room.facilities && room.facilities.map((facility, index) => (
            <li key={index} className="flex items-center space-x-4">
              {getFacilityIcon(facility)}
              <p>{facility}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="location mb-4">
        <h2 className="text-xl font-semibold">Location</h2>
        <p>{room.location}</p>
      </div>
      
    </div>
  );
};

export default RoomDetails;
