import React from 'react';
import Header from '../components/layout/Header.jsx';
import Hero from '../components/features/Hero.jsx';
import About from '../components/features/About.jsx';
import Footer from '../components/layout/Footer.jsx';

const HomePage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;

