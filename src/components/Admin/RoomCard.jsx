import React from "react";

const RoomCard = ({ room, onDelete, onEdit }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="font-bold">{room.name}</h3>
        <p>Type: {room.type}</p>
        <p>Price: {room.price}</p>
        <p>Facilities: {room.facilities}</p>
      </div>
      <div>
        <button
          onClick={() => onDelete(room.id)}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
        >
          Delete
        </button>
        <button
          onClick={() => onEdit(room)}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
