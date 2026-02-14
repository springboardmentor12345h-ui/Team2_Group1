
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import { User, UserRole } from './types';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={() => { authService.logout(); setUser(null); }} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register onLogin={setUser} /> : <Navigate to="/" />} />
            <Route path="/" element={<EventList user={user} />} />
            <Route path="/events/:id" element={<EventDetails user={user} />} />

            <Route 
              path="/dashboard" 
              element={user?.role === UserRole.STUDENT ? <UserDashboard user={user} /> : <Navigate to="/admin-dashboard" />} 
            />

            <Route 
              path="/admin-dashboard" 
              element={user && (user.role === UserRole.COLLEGE_ADMIN || user.role === UserRole.SUPER_ADMIN) ? <AdminDashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/create-event" 
              element={user?.role === UserRole.COLLEGE_ADMIN ? <CreateEvent user={user} /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
        <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} CampusEventHub. Built for inter-college excellence with MERN.
        </footer>
      </div>
    </Router>
  );
};

export default App;
