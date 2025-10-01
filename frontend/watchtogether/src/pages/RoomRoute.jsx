import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RoomPage from './RoomPage';
import { joinRoom } from '../services/RoomService';
import {useRoom} from '../hooks/useRoom';

export default function RoomRoute() {
  const { roomId } = useParams();
  const {setRoomData} = useRoom();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await joinRoom(roomId, { displayName: 'Guest' });
        if (!cancelled) setData(res);
        setRoomData({...res, roomId});
        
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to join room');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [roomId]);

  if (loading) return <div className="text-white p-8">Joining room…</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;

  return <RoomPage roomDataOverride={{ ...data, roomId }} />;
} 