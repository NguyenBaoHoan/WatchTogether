import React, { useState, useEffect } from 'react';
import { RoomContext } from './RoomContext';
import { createRoom as createRoomAPI, getParticipants } from '../services/RoomService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

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
      // Note: fetchParticipants will be called by useEffect when roomData changes
    } catch (err) {
      setError(err?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async (roomId) => {
    try {
      console.log('Fetching participants for room:', roomId);
      const participantsData = await getParticipants(roomId);
      console.log('Fetched participants:', participantsData.length, 'participants');
      setParticipants(participantsData || []);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      setParticipants([]); // Reset to empty array on error
    }
  };

  // Function to refresh participants - useful for manual sync
  const refreshParticipants = async () => {
    if (roomData?.roomId) {
      await fetchParticipants(roomData.roomId);
    }
  };

  // Auto-fetch participants when roomData changes and setup WebSocket
  useEffect(() => {
    if (!roomData?.roomId) return;

    let wsClient = null;
    let timeoutId = null;

    // 1) Fetch initial participants first
    const setupWebSocket = async () => {
      await fetchParticipants(roomData.roomId);
      
      // 2) Setup WebSocket connection AFTER initial fetch completes
      // Small delay to ensure fetch is fully processed and avoid race condition
      timeoutId = setTimeout(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        wsClient = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 3000,
          debug: () => {},
        });

        wsClient.onConnect = () => {
          console.log('WebSocket connected for room:', roomData.roomId);
          
          // Subscribe to room events
          wsClient.subscribe(`/topic/rooms/${roomData.roomId}`, (msg) => {
            try {
              const { type, payload } = JSON.parse(msg.body);
              console.log('Received WebSocket event:', type, payload);
              
              if (type === 'participant_joined') {
                setParticipants(prev => {
                  // Check if participant already exists to avoid duplicates
                  const exists = prev.some(p => p.id === payload.id);
                  if (exists) {
                    console.log('Participant already exists, skipping:', payload.id);
                    return prev;
                  }
                  console.log('Adding new participant:', payload.displayName);
                  return [...prev, payload];
                });
              } else if (type === 'participant_left') {
                setParticipants(prev => {
                  const updated = prev.filter(p => p.id !== payload);
                  console.log('Participant left, new count:', updated.length);
                  return updated;
                });
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          });
        };

        wsClient.onDisconnect = () => {
          console.log('WebSocket disconnected');
        };

        wsClient.activate();
      }, 100); // 100ms delay to avoid race condition
    };

    setupWebSocket();
    
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (wsClient) {
        wsClient.deactivate();
      }
    };
  }, [roomData]);

  const value = { 
    roomData, 
    setRoomData,
    participants, 
    isLoading, 
    error,
    createRoom, 
    fetchParticipants,
    refreshParticipants
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}
