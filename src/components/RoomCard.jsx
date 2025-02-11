import { FaHeart, FaRegHeart, FaShareAlt, FaStar } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';

const RoomCard = ({ room, user, onLike, onShare, onViewDetails, onRate }) => {
  return (
    <div className="hotel-card bg-white p-4 shadow-lg rounded-md border border-gray-200">
      <img src={room.imageUrl} alt={room.name} className="hotel-image w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="hotel-name text-xl font-bold">{room.name}</h3>
      <p className="hotel-price text-lg text-blue-600 mt-2">R{room.price}</p>
      <p className="hotel-distance text-sm text-gray-500 mt-1">
        <MdLocationOn className="inline mr-1" />
        {room.distance} km away
      </p>
      <div className="flex items-center mt-3">
        <button className="like-button text-red-500 hover:text-red-600" onClick={() => onLike(room.id)}>
          {user?.favorites?.includes(room.id) ? <FaHeart className="w-6 h-6 text-red-500" /> : <FaRegHeart className="w-6 h-6 text-gray-400" />}
        </button>
        <button className="share-button text-blue-500 hover:text-blue-600 ml-4" onClick={() => onShare(room.id)}>
          <FaShareAlt className="w-6 h-6" />
        </button>
        <div className="rating flex items-center ml-auto">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={`w-5 h-5 ${index < (room.rating || 0) ? 'text-yellow-500' : 'text-gray-300'} cursor-pointer`}
              onClick={() => onRate(room.id, index + 1)}
            />
          ))}
        </div>
      </div>
      <button className="view-details-btn mt-4 p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 w-full" onClick={() => onViewDetails(room.id)}>
        View Details
      </button>
    </div>
  );
};

export default RoomCard;
