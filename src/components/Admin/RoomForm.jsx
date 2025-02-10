import React, { useState } from "react";

const RoomForm = ({
  room,
  onSubmit,
  onChange,
  uploading,
  onImageChange,
  uploadImage,
  onGalleryChange,
  uploadGalleryImages,
}) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!room?.name) newErrors.name = "Room name is required.";
    if (!room?.description) newErrors.description = "Description is required.";
    if (!room?.price || room.price <= 0)
      newErrors.price = "Price must be greater than zero.";
    if (!room?.beds || room.beds <= 0)
      newErrors.beds = "Number of beds must be greater than zero.";
    if (!room?.maxOccupancy || room.maxOccupancy <= 0)
      newErrors.maxOccupancy = "Max occupancy must be greater than zero.";
    if (!room?.facilities)
      newErrors.facilities = "Facilities are required.";
    if (!room?.imageUrl) newErrors.imageUrl = "Main image is required.";
    if (!room?.gallery || room.gallery.length === 0)
      newErrors.gallery = "At least one gallery image is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">
        {room ? "Edit Room" : "Add New Room"}
      </h2>

      {/* Room Name */}
      <input
        type="text"
        name="name"
        placeholder="Room Name"
        value={room?.name || ""}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

      {/* Room Description */}
      <textarea
        name="description"
        placeholder="Room Description"
        value={room?.description || ""}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      {errors.description && (
        <p className="text-red-500 text-sm">{errors.description}</p>
      )}

      {/* Price */}
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={room?.price || 0}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

      {/* Number of Beds */}
      <input
        type="number"
        name="beds"
        placeholder="Number of Beds"
        value={room?.beds || 1}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      {errors.beds && <p className="text-red-500 text-sm">{errors.beds}</p>}

      {/* Max Occupancy */}
      <input
        type="number"
        name="maxOccupancy"
        placeholder="Max Occupancy"
        value={room?.maxOccupancy || 1}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      {errors.maxOccupancy && (
        <p className="text-red-500 text-sm">{errors.maxOccupancy}</p>
      )}

      {/* Facilities */}
      <textarea
        name="facilities"
        placeholder="Facilities (comma-separated)"
        value={room?.facilities || ""}
        onChange={onChange}
        className="block mb-2 p-2 border rounded"
      />
      {errors.facilities && (
        <p className="text-red-500 text-sm">{errors.facilities}</p>
      )}

      {/* Gallery Upload */}
      <input
        type="file"
        multiple
        onChange={onGalleryChange}
        className="block mb-2"
      />
      <button
        onClick={() =>
          uploadGalleryImages((urls) =>
            onChange({ target: { name: "gallery", value: urls } })
          )
        }
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>
      {errors.gallery && (
        <p className="text-red-500 text-sm">{errors.gallery}</p>
      )}

      {/* Single Image Upload */}
      <input
        type="file"
        onChange={onImageChange}
        className="block mb-2"
      />
      <button
        onClick={() =>
          uploadImage((url) =>
            onChange({ target: { name: "imageUrl", value: url } })
          )
        }
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {errors.imageUrl && (
        <p className="text-red-500 text-sm">{errors.imageUrl}</p>
      )}

      {/* Submit Button */}
      <button
        onClick={handleFormSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
      >
        {room ? "Update Room" : "Add Room"}
      </button>
    </div>
  );
};

export default RoomForm;
