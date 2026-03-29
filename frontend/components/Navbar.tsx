
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <span className="font-bold text-xl tracking-tight text-indigo-950">CampusEventHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium">Events</Link>
            
            {user ? (
              <>
                {user.role === UserRole.STUDENT && (
                  <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium">My Dashboard</Link>
                )}
                {(user.role === UserRole.COLLEGE_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                  <Link to="/admin-dashboard" className="text-slate-600 hover:text-indigo-600 font-medium">Admin Panel</Link>
                )}
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase font-bold mt-1">{user.role.replace('_', ' ')}</p>
                  </div>
                  <button onClick={handleLogout} className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-600 transition-colors">
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-700 p-2">
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 pt-2 pb-6 flex flex-col gap-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-slate-600 py-2 font-medium">Events</Link>
          {user ? (
            <>
              {user.role === UserRole.STUDENT && (
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-600 py-2 font-medium">My Dashboard</Link>
              )}
              {(user.role === UserRole.COLLEGE_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className="text-slate-600 py-2 font-medium">Admin Panel</Link>
              )}
              <div className="border-t pt-4">
                <p className="font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 uppercase mb-4">{user.role}</p>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full bg-slate-100 text-slate-600 py-2 rounded-lg font-medium">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-2 text-slate-600 font-medium">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-medium">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
