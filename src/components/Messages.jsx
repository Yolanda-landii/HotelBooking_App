import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", auth.currentUser?.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
                <div className="logo">
                <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
                </div>
                <nav className="nav">
                <ul className="flex space-x-6">
                    <li><a href="/" className="hover:underline">Home</a></li>
                    <li><a href="/bookings" className="hover:underline">Bookings</a></li>
                    <li><a href="/messages" className="hover:underline">Messages</a></li>
                    <li><a href="/profile" className="hover:underline">Profile</a></li>
                    <li><Link to="/logout" className="hover:underline">Logout</Link></li>
                </ul>
                </nav>
            </header>
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`flex ${
                index % 2 === 0 ? "justify-start" : "justify-end"
              }`}
            >
              <p
                className={`p-3 rounded-lg text-sm shadow-md max-w-xs ${
                  index % 2 === 0
                    ? "bg-gray-300 text-gray-800"
                    : "bg-blue-500 text-white"
                }`}
              >
                {notification.message}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">No new notifications</p>
        )}
      </div>
      <footer className="footer bg-gray-800 text-white p-4 text-center mt-auto">
<p>Copyright © 2024 Hlala Nathi</p>
      </footer>
    </div>
    
  );
};

export default Notifications;
