import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import UKMap from './components/UKMap';
import HeartIllnessRates from './components/DropdownUK';
import Navigation from './components/Navigation';
import Header from './components/Header';
import About from './pages/About';
import UK from './pages/UK';
import Footer from './components/Footer';
import Contact from './components/Contact';
import USA from './pages/USA';

function App() {

  return (
    <BrowserRouter>
      <div>
        {/* Include the Navigation component here so it appears on all pages */}
        
        {/* Define routes */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} /> {/* Add route to About page */}
          <Route path="/uk" element={<UK />} /> {/* Add route to About page */}
          <Route path="/contact" element={<Contact />} /> {/* Add Contact route */}
          <Route path="/usa" element={<USA />} />
        </Routes>
        <Footer /> {/* Place footer outside routes so it's always visible */}
      </div>
    </BrowserRouter>
  );
}

export default App;