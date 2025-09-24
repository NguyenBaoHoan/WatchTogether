import React, { useState } from 'react';
import { RoomContext } from './RoomContext';
import { createRoom as createRoomAPI } from '../services/RoomService';

export default function RoomProvider({ children }) {
  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await createRoomAPI();
      setRoomData(data);
    } catch (err) {
      setError(err?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const value = { roomData, isLoading, error, createRoom };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}
