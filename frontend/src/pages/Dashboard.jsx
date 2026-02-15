import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  SparklesIcon,
  TicketIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import LaraChatbot from "../components/Chatbot";
import StatsCard from "../components/ui/StatsCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EventDetailsModal from "../components/EventDetailsModal";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch events (accessible to all)
      const eventsRes = await axios.get("/api/v1/events?sort=-startDate");
      setUpcomingEvents(eventsRes.data.data.events);

      // Only fetch logs if user is an admin
      if (user.role === "collegeAdmin" || user.role === "superAdmin") {
        try {
          const logsRes = await axios.get("/api/v1/logs?limit=10");
          setActivities(logsRes.data.data.logs);
        } catch (logError) {
          console.error("Logs fetch failed:", logError);
          setActivities([]);
        }
      } else {
        // Mock activities for students until student-specific logs are implemented
        setActivities([
          {
            action: "Welcome to CampusEventHub!",
            timestamp: new Date(),
          },
          {
            action: "Browse upcoming events to get started",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <p className="text-secondary-600 mb-4">
            Please login to view dashboard.
          </p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Hackathon: "bg-blue-100 text-blue-700",
      Cultural: "bg-purple-100 text-purple-700",
      Workshop: "bg-green-100 text-green-700",
      Sports: "bg-orange-100 text-orange-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const stats = [
    {
      title: "Total Events",
      value: upcomingEvents.length.toString(),
      icon: CalendarIcon,
      trend: { value: 12, label: "all time" },
    },
    {
      title: "Upcoming Events",
      value: upcomingEvents
        .filter((e) => new Date(e.startDate) > new Date())
        .length.toString(),
      icon: ClockIcon,
      trend: { value: 2, label: "this week" },
    },
    {
      title: "Total Registrations",
      value: "842",
      icon: TicketIcon,
      trend: { value: 12, label: "this month" },
    },
  ];
  return (
    <div className="min-h-screen bg-secondary-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 font-display">
              {user.role === "student"
                ? "Student Dashboard"
                : "Organizer Dashboard"}
            </h1>
            <p className="text-secondary-500 mt-1">
              Welcome back, {user.name.split(" ")[0]}! Here's what's happening.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/events")}
            className="rounded-2xl shadow-lg ring-primary-500/20 hover:ring-8 transition-all"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Explore Events
          </Button>
        </div>

        {(user.role === "collegeAdmin" || user.role === "superAdmin") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900">
                Upcoming Events
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/events")}
                className="font-bold text-primary-600"
              >
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {loading
                ? [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-28 bg-white/50 rounded-2xl animate-pulse"
                    />
                  ))
                : upcomingEvents.slice(0, 4).map((event) => (
                    <Card
                      key={event._id}
                      onClick={() => handleEventClick(event)}
                      className="p-4 flex flex-col sm:flex-row gap-5 hover:border-primary-300 transition-all cursor-pointer group shadow-sm hover:shadow-xl bg-white/80 backdrop-blur-sm"
                    >
                      <div className="flex-shrink-0 w-full sm:w-20 h-20 bg-primary-50 rounded-2xl flex flex-col items-center justify-center text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                          {new Date(event.startDate).toLocaleDateString(
                            "en-US",
                            { month: "short" },
                          )}
                        </span>
                        <span className="text-2xl font-black leading-none mt-1">
                          {new Date(event.startDate).getDate()}
                        </span>
                      </div>

                      <div className="flex-grow py-1">
                        <div className="flex items-start justify-between mb-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getCategoryColor(event.category)} shadow-sm`}
                          >
                            {event.category}
                          </span>
                          <div className="flex items-center gap-1.5 bg-success/10 text-success px-2 py-0.5 rounded-full text-[10px] font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                            FREE
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center text-xs text-secondary-500 gap-5 mt-2 font-medium">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4 text-primary-500" />
                            {new Date(event.startDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPinIcon className="w-4 h-4 text-primary-500" />
                            {event.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center pr-2">
                        <div className="w-10 h-10 rounded-full border border-secondary-100 flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
                          <CalendarIcon className="w-5 h-5 text-secondary-400 group-hover:text-primary-600" />
                        </div>
                      </div>
                    </Card>
                  ))}
            </div>
          </div>

          <div className="space-y-6">
            {user.role === "collegeAdmin" || user.role === "superAdmin" ? (
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-xl font-black mb-1 relative z-10 tracking-tight">
                  Quick Actions
                </h3>
                <p className="text-primary-100/80 text-sm mb-8 relative z-10 font-medium">
                  Manage your event activities effortlessly.
                </p>
                <div className="space-y-3 relative z-10">
                  <button className="w-full bg-white/10 hover:bg-white text-white hover:text-primary-700 border border-white/20 rounded-2xl p-4 flex items-center transition-all duration-300 font-bold group/btn shadow-inner">
                    <CalendarIcon className="w-5 h-5 mr-3 group-hover/btn:scale-110 transition-transform" />
                    My Calendar
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white text-white hover:text-primary-700 border border-white/20 rounded-2xl p-4 flex items-center transition-all duration-300 font-bold group/btn shadow-inner">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 mr-3 group-hover/btn:scale-110 transition-transform" />
                    Registrations
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-7 border border-secondary-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 rounded-full blur-2xl" />
                <h3 className="text-xl font-black text-secondary-900 mb-2 relative z-10">
                  Your Stats
                </h3>
                <div className="flex flex-col gap-4 relative z-10 mt-6">
                  <div className="bg-secondary-50 p-4 rounded-2xl flex items-center justify-between group/stat">
                    <div>
                      <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                        Attended
                      </p>
                      <p className="text-2xl font-black text-secondary-900 mt-1">
                        0
                      </p>
                    </div>
                    <CalendarIcon className="w-8 h-8 text-primary-200 group-hover/stat:text-primary-500 transition-colors" />
                  </div>
                </div>
              </div>
            )}

            <Card className="p-7 rounded-[2rem] border-secondary-100 shadow-sm bg-white/50 backdrop-blur-sm">
              <h3 className="text-xl font-black text-secondary-900 mb-8 tracking-tight">
                Recent Activity
              </h3>
              <div className="space-y-6">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="relative">
                      <div className="w-3 h-3 mt-1.5 rounded-full bg-primary-500 ring-4 ring-primary-50 flex-shrink-0 group-hover:scale-125 transition-transform duration-300 z-10 relative" />
                      {i !== activities.length - 1 && (
                        <div className="absolute top-4 left-[5.5px] w-[1px] h-12 bg-secondary-100" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-secondary-700 leading-relaxed font-medium">
                        {act.action}{" "}
                        {act.target && (
                          <span className="font-black text-primary-600 hover:underline cursor-pointer">
                            "{act.target}"
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] font-black text-secondary-400 uppercase mt-1.5 tracking-widest flex items-center gap-1.5">
                        <ClockIcon className="w-3 h-3" />
                        {getTimeAgo(act.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <SparklesIcon className="w-6 h-6 text-secondary-300" />
                    </div>
                    <p className="text-sm text-secondary-400 font-medium">
                      No recent activity yet
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        event={selectedEvent}
      />

      <LaraChatbot user={user} />
    </div>
  );
};

export default Dashboard;
