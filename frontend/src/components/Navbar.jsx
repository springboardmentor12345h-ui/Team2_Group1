import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as SolidBellIcon } from "@heroicons/react/24/solid";
import AuthContext from "../context/AuthContext";
import Button from "./ui/Button";
import axios from "axios";
import { toast } from "react-toastify";

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

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    setIsProfileOpen(false);
    sessionStorage.removeItem("hasShownPendingToast");
    logout();
    navigate("/login");
  };

  const location = useLocation();

  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch admin notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && (user.role === "collegeAdmin" || user.role === "superAdmin")) {
        try {
          const res = await axios.get("/api/v1/registrations/admin");
          setNotifications(res.data.data.registrations);
        } catch (error) {
          console.error("Failed to fetch notifications");
        }
      }
    };
    fetchNotifications();

    let intervalId;
    if (user && (user.role === "collegeAdmin" || user.role === "superAdmin")) {
      intervalId = setInterval(fetchNotifications, 10000); // refresh every 10s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  const markAsRead = async (registrationId) => {
    try {
      await axios.patch(`/api/v1/registrations/${registrationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === registrationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read");
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false); // Close profile if open
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="bg-white border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Side: Logo and Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:-rotate-3">
                <RocketLaunchIcon className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-secondary-900 tracking-tight">
                CampusEventHub
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/">Home</NavLink>
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
                
                {/* Notification Bell */}
                {(user.role === "collegeAdmin" || user.role === "superAdmin") && (
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={handleNotificationClick}
                      className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-full transition-colors relative"
                    >
                      {unreadCount > 0 ? (
                        <>
                          <SolidBellIcon className="w-6 h-6 text-primary-600 animate-pulse" />
                          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
                        </>
                      ) : (
                        <BellIcon className="w-6 h-6" />
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-secondary-100 transform origin-top-right overflow-hidden z-50 transition-all max-h-[85vh] flex flex-col">
                        <div className="px-4 py-3 border-b border-secondary-100 bg-secondary-50 flex items-center justify-between sticky top-0">
                          <h3 className="text-sm font-bold text-secondary-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="overflow-y-auto w-full">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-secondary-500 text-sm">
                              No notifications yet
                            </div>
                          ) : (
                            <div className="divide-y divide-secondary-50">
                              {notifications.map((notif) => (
                                <div
                                  key={notif._id}
                                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                                  className={`px-4 py-3 cursor-pointer transition-colors ${notif.isRead ? 'bg-white opacity-70' : 'bg-primary-50/30 hover:bg-primary-50/50'}`}
                                >
                                  <p className="text-sm text-secondary-900 font-medium leading-snug">
                                    <span className="font-bold text-primary-700">{notif.studentId?.name}</span> registered for <span className="font-bold">{notif.eventId?.title}</span>
                                  </p>
                                  <p className="text-xs text-secondary-500 mt-1 flex items-center justify-between">
                                    <span>{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                        setIsProfileOpen(!isProfileOpen);
                        setIsNotificationsOpen(false);
                    }}
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
