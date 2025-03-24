import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';

const MessagesPage = () => {
    const navigate = useNavigate();
  const messages = useSelector((state) => state.booking.messages);
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  }
  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-100">
      <header className="header flex justify-between items-center p-4 bg-gray-900 text-white">
    <div className="logo">
      <img src="/images/logo.png" alt="Logo" className="w-24 h-auto" />
    </div>
    <nav className="nav">
      <ul className="flex space-x-6">
        <li><a href="/admin" className="hover:underline">Home</a></li>
        <li><a href="/notifications" className="hover:underline">Messages</a></li>
        <li><a href="/reservations" className="hover:underline">Reservations</a></li>
        <li><button onClick={handleLogout} className="hover:underline">Logout</button></li>
      </ul>
    </nav>
  </header>
      <h2 className="text-xl font-bold mb-4">Admin Messages</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500">No new messages.</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li key={msg.id} className="p-3 bg-gray-100 rounded-md shadow">
              {msg.text} <span className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessagesPage;
