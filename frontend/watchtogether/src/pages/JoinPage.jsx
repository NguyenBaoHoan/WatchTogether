
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function JoinPage() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (username && roomId) {
      // Điều hướng đến phòng và gửi "username" qua state
      navigate(`/room/${roomId}`, { state: { username: username } });
    }
  };

  // Đây là JSX của màn hình đăng nhập (step === 1)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleJoin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">WatchTogether</h1>
        </div>
        <div className="space-y-4">
          <input
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter Name"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            required
          />
          <button className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold">
            Join Room
          </button>
        </div>
      </form>
    </div>
  );
}

export default JoinPage;