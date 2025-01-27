import React from "react";

const RoomForm = ({ room, onSubmit, onChange, uploading, onImageChange, uploadImage, onGalleryChange, uploadGalleryImages }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">{room ? "Add New Room" : "Edit Room"}</h2>
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
      
      {/* Facilities */}
      <textarea
        name="facilities"
        placeholder="Facilities (comma-separated)"
        value={room?.facilities || ""}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />

      {/* Gallery Upload */}
      <input
        type="file"
        multiple
        onChange={onGalleryChange}
        className="block mb-2"
      />
      
      <button
        onClick={() => uploadGalleryImages((urls) => onChange({ target: { name: 'gallery', value: urls } }))}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>

      {/* Single Image Upload */}
      <input
        type="file"
        onChange={onImageChange}
        className="block mb-2"
      />
      {/* Gallery Preview */}
        {room.gallery && room.gallery.length > 0 && (
        <div className="flex space-x-2 mt-4">
            {room.gallery.map((imageUrl, index) => (
            <img
                key={index}
                src={imageUrl}
                alt={`Gallery image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md"
            />
            ))}
        </div>
        )}
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
        {room ? "Add Room" : "Update Room"}
      </button>
    </div>
  );
};

export default RoomForm;
