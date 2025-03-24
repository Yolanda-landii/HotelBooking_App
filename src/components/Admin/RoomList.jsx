import React from "react";
import RoomCard from "./RoomCard";

const RoomList = ({ rooms, onDelete, onEdit }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Room List</h2>
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default RoomList;
