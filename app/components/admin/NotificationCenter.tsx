'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

interface HeaderNotification {
  message: string;
  timestamp: Date;
  active: boolean;
  startTime: string;
  endTime: string;
}

export default function NotificationCenter() {
  const [message, setMessage] = useState('');
  const [headerMessage, setHeaderMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<{id: string, email?: string, role?: string}[]>([]);
  const [currentHeaderNotification, setCurrentHeaderNotification] = useState<HeaderNotification | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = await getDocs(collection(db, 'users'));
      const usersData = usersCollection.docs
        .map(doc => ({
          id: doc.id,
          email: doc.data().email,
          role: doc.data().role
        }))
        .filter(user => 
          user.role === 'user' && 
          user.role !== 'admin'
        );
      setUsers(usersData);
    };
    fetchUsers();

    // Fetch current header notification
    const fetchHeaderNotification = async () => {
      const headerNotificationsRef = collection(db, 'headerNotifications');
      const q = query(
        headerNotificationsRef,
        where('active', '==', true),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCurrentHeaderNotification(snapshot.docs[0].data() as HeaderNotification);
      }
    };
    fetchHeaderNotification();
  }, []);

  const sendHeaderNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerMessage || !startTime || !endTime) return;

    setSending(true);
    try {
      const docRef = await addDoc(collection(db, 'headerNotifications'), {
        message: headerMessage,
        timestamp: new Date(),
        active: true,
        startTime: startTime,
        endTime: endTime
      });

      setCurrentHeaderNotification({
        message: headerMessage,
        timestamp: new Date(),
        active: true,
        startTime,
        endTime
      });
      
      setHeaderMessage('');
      setStartTime('');
      setEndTime('');
      alert('Header notification set successfully!');
    } catch (error) {
      console.error('Error setting header notification:', error);
      alert('Error setting header notification');
    } finally {
      setSending(false);
    }
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || (!userId && userId !== 'all')) return;

    setSending(true);
    try {
      if (userId === 'all') {
        // Send to all users with role "user"
        const notifications = users.map(user => addDoc(collection(db, 'notifications'), {
          userId: user.id,
          message,
          timestamp: new Date(),
          read: false
        }));
        await Promise.all(notifications);
      } else {
        // Send to single user
        await addDoc(collection(db, 'notifications'), {
          userId,
          message,
          timestamp: new Date(),
          read: false
        });
      }
      setMessage('');
      setUserId('');
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Header Notification Card */}
      <div className="bg-white p-6 rounded-lg shadow-md h-fit">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Header Notification</h2>
          {currentHeaderNotification && (
            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              Active
            </span>
          )}
        </div>

        {currentHeaderNotification && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-600 mb-2">Current Header Message:</p>
            <p className="text-md font-medium text-gray-800 mb-2">
              {currentHeaderNotification.message}
            </p>
            <div className="flex gap-4 text-sm text-gray-600">
              <p>Start: {currentHeaderNotification.startTime}</p>
              <p>End: {currentHeaderNotification.endTime}</p>
            </div>
          </div>
        )}

        <form onSubmit={sendHeaderNotification} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              New Header Message
            </label>
            <textarea
              value={headerMessage}
              onChange={(e) => setHeaderMessage(e.target.value)}
              rows={2}
              placeholder="Type your header notification message here..."
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setHeaderMessage('');
                setStartTime('');
                setEndTime('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={sending}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-200
                ${sending 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95'
                }`}
            >
              {sending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Set Header Notification'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* User Notification Card */}
      <div className="bg-white p-6 rounded-lg shadow-md h-fit">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">User Notifications</h2>
          <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
            {users.length} Users
          </span>
        </div>

        <form onSubmit={sendNotification} className="space-y-5">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              required
            >
              <option value="">Choose recipient...</option>
              <option value="all" className="font-medium">
                📢 All Users ({users.length})
              </option>
              <optgroup label="Individual Users">
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    👤 {user.email || user.id}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Type your notification message here..."
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setMessage('');
                setUserId('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={sending}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-200
                ${sending 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95'
                }`}
            >
              {sending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Notification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 