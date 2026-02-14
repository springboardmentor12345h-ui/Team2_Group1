import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "../context/AuthContext";
import LaraChatbot from "../components/Chatbot";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view dashboard.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Mock event data for demonstration
  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Workshop 2024",
      date: "2024-03-15",
      time: "10:00 AM",
      location: "Main Auditorium",
      category: "Workshop",
      attendees: 45,
      description: "Learn the latest web development technologies",
    },
    {
      id: 2,
      title: "Cultural Fest",
      date: "2024-03-20",
      time: "2:00 PM",
      location: "Campus Grounds",
      category: "Cultural",
      attendees: 120,
      description: "Annual cultural celebration with performances",
    },
    {
      id: 3,
      title: "Career Fair 2024",
      date: "2024-03-25",
      time: "9:00 AM",
      location: "Exhibition Hall",
      category: "Career",
      attendees: 200,
      description: "Meet top recruiters and explore opportunities",
    },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      Workshop: "bg-blue-100 text-blue-700 border-blue-200",
      Cultural: "bg-purple-100 text-purple-700 border-purple-200",
      Career: "bg-green-100 text-green-700 border-green-200",
      Sports: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Header/Navbar */}
      <header className="bg-[#f8f8fc] shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center shadow-sm">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  CampusEventHub
                </h1>
                <p className="text-xs text-purple-600 font-medium">
                  {user.college}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-purple-100 px-4 py-2 rounded-lg">
                <UserCircleIcon className="w-5 h-5 text-purple-600" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-purple-500 font-medium capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-white/80 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-200"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name.split(" ")[0]}! 👋
          </h2>
          <p className="text-gray-600">
            {user.role === "student"
              ? "Discover and register for upcoming campus events"
              : "Manage your events and track registrations"}
          </p>
        </div>

        {/* Role-specific Actions */}
        {user.role === "student" && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-2" />
                  Student Dashboard
                </h3>
                <p className="text-primary-100 mb-4">
                  Browse events, register for activities, and stay updated with
                  campus happenings.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                    Browse Events
                  </button>
                  <button className="bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-400 transition-colors">
                    My Registrations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(user.role === "collegeAdmin" || user.role === "superAdmin") && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-2" />
                  Admin Dashboard
                </h3>
                <p className="text-green-100 mb-4">
                  Create and manage events, approve registrations, and monitor
                  analytics.
                </p>
                <button className="bg-white text-green-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2">
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>Create New Event</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Upcoming Events
            </h3>
            <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1">
              <span>View All</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(event.category)}`}
                    >
                      {event.category}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {event.title}
                  </h4>

                  {/* Event Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2 text-primary-500" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{event.attendees} registered</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                    <span>View Details</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State (if no events) */}
        {upcomingEvents.length === 0 && (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No upcoming events
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later for new events and activities.
            </p>
            {(user.role === "collegeAdmin" || user.role === "superAdmin") && (
              <button className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center space-x-2">
                <PlusCircleIcon className="w-5 h-5" />
                <span>Create First Event</span>
              </button>
            )}
          </div>
        )}
      </main>
      <LaraChatbot user={user} />
    </div>
  );
};

export default Dashboard;
