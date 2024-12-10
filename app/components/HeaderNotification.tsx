'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/firebase/config';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface HeaderNotification {
  message: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export default function HeaderNotification() {
  const [notification, setNotification] = useState<HeaderNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const headerNotificationsRef = collection(db, 'headerNotifications');
    const q = query(
      headerNotificationsRef,
      where('active', '==', true),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const notificationData = snapshot.docs[0].data() as HeaderNotification;
        console.log('Current notification:', notificationData);
        setNotification(notificationData);
      } else {
        setNotification(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkTime = () => {
      if (!notification || !notification.startTime || !notification.endTime) {
        setIsVisible(false);
        return;
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [startHours, startMinutes] = notification.startTime.split(':').map(Number);
      const [endHours, endMinutes] = notification.endTime.split(':').map(Number);
      
      const startTimeMinutes = startHours * 60 + startMinutes;
      const endTimeMinutes = endHours * 60 + endMinutes;

      setIsVisible(
        currentTime >= startTimeMinutes && 
        currentTime <= endTimeMinutes
      );
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [notification]);

  if (!notification || !isVisible) return null;

  return (
    <div className="bg-indigo-600 text-white py-2 px-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <span className="mr-2">📢</span>
            <p className="text-sm font-medium">
              {notification.message}
            </p>
            <span className="ml-4 text-xs opacity-75">
              ({notification.startTime} - {notification.endTime})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 