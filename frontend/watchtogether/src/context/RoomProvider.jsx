import React, { useState, useEffect } from 'react';
import { RoomContext } from './RoomContext';
import { createRoom as createRoomAPI, getParticipants } from '../services/RoomService';

export default function RoomProvider({ children }) {
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await createRoomAPI();
      setRoomData(data);
      // Fetch participants after creating room
      await fetchParticipants(data.roomId);
    } catch (err) {
      setError(err?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async (roomId) => {
    try {
      const participantsData = await getParticipants(roomId);
      setParticipants(participantsData);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  };

  // Auto-fetch participants when roomData changes
  useEffect(() => {
    if (roomData?.roomId) {
      fetchParticipants(roomData.roomId);
    }
  }, [roomData]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (roomData?.wsUrl) {
      const ws = new WebSocket(roomData.wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'participant_joined') {
          setParticipants(prev => [...prev, data.participant]);
        } else if (data.type === 'participant_left') {
          setParticipants(prev => prev.filter(p => p.id !== data.participantId));
        } else if (data.type === 'participants_updated') {
          setParticipants(data.participants);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return () => ws.close();
    }
  }, [roomData]);

  const value = { 
    roomData, 
    setRoomData,
    participants, 
    isLoading, 
    error,
    createRoom, 
    fetchParticipants
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}
