import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-white shadow-sm p-4 flex justify-between items-center px-10">
    <div className="text-xl font-bold text-indigo-900">Campus EventHub</div>
    <div className="space-x-6 font-medium text-gray-700">
      <Link to="/" className="hover:text-indigo-600">Events</Link>
      <Link to="/login" className="hover:text-indigo-600">Login</Link>
    </div>
  </nav>
);

export default Navbar;