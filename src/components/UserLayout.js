import React from 'react';
import Navbar from './Navigation';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
