import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'messages'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Messages</h2>
      {messages.length === 0 ? <p>No messages yet.</p> : messages.map(msg => (
        <div key={msg.id} className="p-2 border-b">
          <p><strong>{msg.title}</strong></p>
          <p>{msg.body}</p>
        </div>
      ))}
    </div>
  );
};

export default MessagesPage;