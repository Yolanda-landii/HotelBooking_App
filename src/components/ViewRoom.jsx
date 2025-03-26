import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db,auth } from '../config/firebase';
import { FaWifi, FaSwimmer, FaParking, FaShieldAlt, FaUtensils, FaSnowflake, FaStar, FaShare } from 'react-icons/fa';
import Navigation from './Navigation';

const ViewRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareMessage, setShowShareMessage] = useState(false);

  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribeRoom = onSnapshot(roomRef, (docSnapshot) => {
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

    const commentsRef = collection(db, 'rooms', roomId, 'comments');
    const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    });

    return () => {
      unsubscribeRoom();
      unsubscribeComments();
    };
  }, [roomId]);

  const handleBooking = () => {
    console.log('We are booking');
    const user = auth.currentUser;
    if (!user) {
      console.log('Redirecting to login page');
      navigate(`/login?redirectTo=/rooms/${roomId}/book`, { state: { room } });
      return;
    }
    navigate(`/rooms/${roomId}/book`, { state: { room } });
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '' || rating === 0) return;

    try {
      const commentRef = collection(db, 'rooms', roomId, 'comments');
      await addDoc(commentRef, {
        text: newComment,
        rating,
        timestamp: serverTimestamp(), 
      });

      setNewComment('');
      setRating(0);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

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

  const handleShare = async () => {
    const roomUrl = `https://hotel-booking-app-pink-six.vercel.app/rooms/${roomId}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setShowShareMessage(true);
      setTimeout(() => setShowShareMessage(false), 3000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="room-details p-6">
      <Navigation />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{room.name}</h1>
        <div className="flex items-center space-x-4">
          <p className="text-xl text-blue-600">R{room.price}</p>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Share Room"
          >
            <FaShare size={20} />
          </button>
        </div>
      </div>

      {showShareMessage && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Room URL copied to clipboard!
        </div>
      )}

      <img src={room.imageUrl} alt={room.name} className="w-full h-64 object-cover rounded-md my-4" />
      <p>{room.description}</p>
      <h2 className="text-xl font-semibold">Facilities</h2>
      <ul>
        {room.facilities.map((facility, index) => (
          <li key={index} className="flex items-center space-x-4">
            {getFacilityIcon(facility)}
            <p>{facility}</p>
          </li>
        ))}
      </ul>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
        onClick={handleBooking}
      >
        Book Now
      </button>

      {/* Rating and Comments Section */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-xl font-semibold">Rate & Comment</h2>
        <div className="flex space-x-2 my-2">
          {[1, 2, 3, 4, 5].map(star => (
            <FaStar 
              key={star} 
              className={`cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <textarea
          className="w-full border p-2 rounded-md"
          rows="3"
          placeholder="Leave a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md mt-2 hover:bg-green-700"
          onClick={handleCommentSubmit}
        >
          Submit
        </button>
        {/* Display Comments */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Reviews</h2>
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="border p-2 my-2 rounded-md">
                <div className="flex space-x-2">
                  {[...Array(comment.rating)].map((_, i) => <FaStar key={i} className="text-yellow-400" />)}
                </div>
                <p>{comment.text}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
      <footer className="footer bg-gray-800 text-white p-4 text-center">
        <p>Copyright © 2024 Hlala Nathi</p>
      </footer>
    </div>
  );
};

export default ViewRoom;