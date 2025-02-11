import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage, auth } from "../../config/firebase";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import RoomForm from "../../components/Admin/RoomForm";
import RoomList from "../../components/Admin/RoomList";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [newRoom, setNewRoom] = useState({
    name: "",
    price: 0,
    description: "",
    type: "",
    beds: 1,
    maxOccupancy: 1,
    facilities: "",
    size: "",
    availability: true,
    imageUrl: "",
    gallery: [],
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const roomsCollection = collection(db, "rooms");
        const roomsSnapshot = await getDocs(roomsCollection);
        let allComments = [];

        for (const roomDoc of roomsSnapshot.docs) {
          const commentsCollection = collection(db, `rooms/${roomDoc.id}/comments`);
          const commentsSnapshot = await getDocs(commentsCollection);
          const roomComments = commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            roomId: roomDoc.id,
          }));
          allComments = [...allComments, ...roomComments];
        }
        setComments(allComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "rooms"));
        const fetchedRooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(fetchedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGallery(files);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const uploadGalleryImages = async (callback) => {
    if (!gallery.length) {
      alert("Please select images.");
      return;
    }

    setUploading(true);
    const uploadedImages = [];
    for (const file of gallery) {
      const imageRef = ref(storage, `rooms/gallery/${Date.now()}_${file.name}`);
      try {
        const uploadTask = uploadBytesResumable(imageRef, file);
        await uploadTask;
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        uploadedImages.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
    callback(uploadedImages);
    setUploading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImage = async (callback) => {
    if (!imageFile) {
      alert("Please select an image.");
      return;
    }

    const imageRef = ref(storage, `rooms/${Date.now()}_${imageFile.name}`);
    setUploading(true);

    try {
      const uploadTask = uploadBytesResumable(imageRef, imageFile);
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed:", error);
          setUploading(false);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          callback(imageUrl);
          setUploading(false);
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom.imageUrl) {
      alert("Please upload an image first.");
      return;
    }

    try {
      const newRoomRef = collection(db, "rooms");
      const docRef = await addDoc(newRoomRef, newRoom);
      setRooms((prev) => [...prev, { id: docRef.id, ...newRoom }]);
      setNewRoom({
        name: "",
        price: 0,
        description: "",
        type: "",
        beds: 1,
        maxOccupancy: 1,
        facilities: "",
        size: "",
        availability: true,
        imageUrl: "",
        gallery: [],
      });
      setImageFile(null);
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await deleteDoc(doc(db, "rooms", id));
      setRooms((prev) => prev.filter((room) => room.id !== id));
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom({ ...room });
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom) {
      alert("Please select a valid room to update.");
      return;
    }

    try {
      const roomRef = doc(db, "rooms", selectedRoom.id);
      await updateDoc(roomRef, selectedRoom);
      setRooms((prev) =>
        prev.map((room) =>
          room.id === selectedRoom.id ? { ...room, ...selectedRoom } : room
        )
      );
      setSelectedRoom(null);
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  if (loading) return <p>Loading rooms...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
        </div>
        <nav className="nav">
          <ul className="flex space-x-6">
            <li><a href="/admin" className="hover:underline">Home</a></li>
            <li><a href="/reservations" className="hover:underline">Reservations</a></li>
            <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
          </ul>
        </nav>
      </header>
      {/*  */}
      <RoomForm
        room={selectedRoom || newRoom}
        onSubmit={selectedRoom ? handleUpdateRoom : handleAddRoom}
        onChange={handleInputChange}
        uploading={uploading}
        onImageChange={handleImageChange}
        uploadImage={uploadImage}
        onGalleryChange={handleGalleryChange}
        uploadGalleryImages={uploadGalleryImages}
      />

      <RoomList rooms={rooms} onDelete={handleDeleteRoom} onEdit={handleEditRoom} />
    </div>
  );
};

export default AdminDashboard;
