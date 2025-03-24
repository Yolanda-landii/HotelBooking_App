import React from "react";
import { useNavigate } from "react-router-dom";

const RoomCard = ({ room, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/room/${room.id}`);
  };

  return (
    <div
      className="flex flex-col border rounded-lg shadow-md p-4 mb-4 cursor-pointer bg-white"
      onClick={handleCardClick}
    >
      {/* Room Name and Price */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">{room.name}</h3>
        <p className="text-lg text-blue-600">R{room.price}</p>
      </div>

      {/* Room Images */}
      {room.imageUrl ? (
        <img
          src={room.imageUrl}
          alt={room.name}
          className="w-full h-48 object-cover rounded-md mb-2"
        />
      ) : (
        <p className="text-gray-500">No main image available</p>
      )}

      {/* Room Details */}
      <div className="text-gray-700">
        <p>
          <strong>Type:</strong> {room.type || "N/A"}
        </p>
        <p>
          <strong>Description:</strong> {room.description || "No description"}
        </p>
        <p>
          <strong>Beds:</strong> {room.beds || "N/A"}
        </p>
        <p>
          <strong>Max Occupancy:</strong> {room.maxOccupancy || "N/A"} guests
        </p>
        <p>
          <strong>Size:</strong> {room.size || "N/A"} m²
        </p>
        <p>
          <strong>Availability:</strong>{" "}
          {room.availability ? "Available" : "Not Available"}
        </p>
        <p>
          <strong>Facilities:</strong>{" "}
          {Array.isArray(room.facilities)
            ? room.facilities.join(", ")
            : "Not specified"}
        </p>
      </div>

      {/* Room Gallery */}
      {room.gallery && room.gallery.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-gray-700 font-semibold">Gallery:</h4>
          <div className="flex space-x-2 mt-2">
            {room.gallery.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`${room.name} gallery image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md"
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No gallery images available</p>
      )}

      {/* Edit and Delete Buttons */}
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(room);
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(room.id);
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
