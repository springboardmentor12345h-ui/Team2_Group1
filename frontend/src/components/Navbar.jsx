import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "../context/AuthContext";
import Button from "./ui/Button";

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-secondary-600 hover:text-primary-600 hover:bg-secondary-50"
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate("/login");
  };

  const location = useLocation();

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Side: Logo and Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:-rotate-3">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-secondary-900 tracking-tight">
                CampusEventHub
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/events">Events</NavLink>
              {user && <NavLink to="/dashboard">Dashboard</NavLink>}
              {user &&
                (user.role === "collegeAdmin" ||
                  user.role === "superAdmin") && (
                  <NavLink to="/admin">Admin Panel</NavLink>
                )}
            </div>
          </div>

          {/* Right Side: Profile/Auth */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-secondary-50 transition-colors border border-transparent focus:border-secondary-200 focus:ring-2 focus:ring-primary-100"
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold text-secondary-900 leading-tight">
                        {user.name}
                      </div>
                      <div className="text-xs text-secondary-500 font-medium capitalize">
                        {user.role}
                      </div>
                    </div>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover border border-secondary-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 border border-primary-200">
                        <UserCircleIcon className="w-6 h-6" />
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-secondary-100 ring-1 ring-black ring-opacity-5 transform origin-top-right transition-all">
                      <div className="px-4 py-3 border-b border-secondary-100 sm:hidden">
                        <p className="text-sm font-semibold text-secondary-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-secondary-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-red-50 flex items-center gap-2"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
