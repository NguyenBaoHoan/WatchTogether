import React from 'react';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import { useRoom } from './hooks/useRoom';

function App() {
  const { roomData } = useRoom();
  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat bg-[url('https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/06/anh-thanh-pho-30.jpg')]">
      <div className="min-h-screen bg-black/50">
        {roomData ? <RoomPage /> : <HomePage />}
      </div>
    </div>
  );
}

export default App;
