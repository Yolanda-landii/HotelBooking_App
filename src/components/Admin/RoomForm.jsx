import React from "react";

const RoomForm = ({ room, onSubmit, onChange, uploading, onImageChange, uploadImage }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">{room ? "Edit Room" : "Add New Room"}</h2>
      <input
        type="text"
        name="name"
        placeholder="Room Name"
        value={room?.name || ""}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      <textarea
        name="description"
        placeholder="Room Description"
        value={room?.description || ""}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={room?.price || 0}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      <input
        type="number"
        name="beds"
        placeholder="Number of Beds"
        value={room?.beds || 1}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      <input
        type="number"
        name="maxOccupancy"
        placeholder="Max Occupancy"
        value={room?.maxOccupancy || 1}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      <input
        type="file"
        onChange={onImageChange}
        className="block mb-2"
      />
      <button
        onClick={() => uploadImage((url) => onChange({ target: { name: 'imageUrl', value: url } }))}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      <button
        onClick={onSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
      >
        {room ? "Update Room" : "Add Room"}
      </button>
    </div>
  );
};

export default RoomForm;
