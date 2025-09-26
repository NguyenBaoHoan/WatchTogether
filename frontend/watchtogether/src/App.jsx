import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat bg-[url('https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/06/anh-thanh-pho-30.jpg')]">
      <div className="min-h-screen bg-black/50">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
