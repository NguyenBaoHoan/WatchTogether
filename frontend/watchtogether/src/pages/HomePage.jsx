import { useRoom } from '../hooks/useRoom'; // 1. Import hook để lấy logic
import React from 'react';
import Header from '../components/layout/Header.jsx';
import Hero from '../components/features/Hero.jsx';
import About from '../components/features/About.jsx';
import Footer from '../components/layout/Footer.jsx';

const HomePage = () => {
  const { createRoom, isLoading } = useRoom(); // 2. Sử dụng hook để lấy hàm và trạng thái
  return (
    <>
      <Header />
      <main>
        <Hero onCreateRoomClick={createRoom} isLoading={isLoading} />
        <About />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;

