import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import EventListing from './pages/EventListing';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<EventListing />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;