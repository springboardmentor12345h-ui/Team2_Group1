import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  ChartBarIcon,
  BellAlertIcon,
  CheckCircleIcon,
  FunnelIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ClockIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import EditEventModal from "../components/EditEventModal";
import axios from "axios";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import StatsCard from "../components/ui/StatsCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { toast } from "react-toastify";

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [usersData, setUsersData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLatency, setApiLatency] = useState(150);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes, logsRes] = await Promise.all([
        axios.get("/api/v1/users"),
        axios.get("/api/v1/events"),
        axios.get("/api/v1/logs"),
      ]);
      setUsersData(usersRes.data.data.users);
      setEventsData(eventsRes.data.data.events);
      setLogsData(logsRes.data.data.logs);
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== "collegeAdmin" && user.role !== "superAdmin")) {
      navigate("/dashboard");
      return;
    }
    fetchAdminData();
    // Simulate real-time logs and health
    const interval = setInterval(() => {
      setApiLatency(Math.floor(Math.random() * (160 - 140 + 1)) + 140);

      // Real-time polling for dynamic data
      const refreshData = async () => {
        try {
          const [usersRes, eventsRes, logsRes] = await Promise.all([
            axios.get("/api/v1/users"),
            axios.get("/api/v1/events"),
            axios.get("/api/v1/logs"),
          ]);
          setUsersData(usersRes.data.data.users);
          setEventsData(eventsRes.data.data.events);
          setLogsData(logsRes.data.data.logs);
        } catch (e) {
          console.error("BG Refresh failed", e);
        }
      };
      refreshData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Total Events",
      value: loading ? "..." : eventsData.length.toString(),
      trend: { value: 12, label: "vs last month" },
      icon: ChartBarIcon,
    },
    {
      title: "Active Users",
      value: loading ? "..." : usersData.length.toString(),
      trend: { value: 8, label: "vs last month" },
      icon: UsersIcon,
    },
    {
      title: "Upcoming Events",
      value: loading
        ? "..."
        : eventsData
            .filter((e) => new Date(e.startDate) > new Date())
            .length.toString(),
      trend: { value: 23, label: "this week" },
      icon: ClockIcon,
    },
    {
      title: "Total Registrations",
      value: "842",
      trend: { value: 15, label: "vs last month" },
      icon: CheckCircleIcon,
    },
  ];

  const getCategoryImage = (category) => {
    const images = {
      Hackathon:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop",
      Cultural:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&auto=format&fit=crop",
      Sports:
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&auto=format&fit=crop",
      Workshop:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop",
    };
    return (
      images[category] ||
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&auto=format&fit=crop"
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Events Section */}
              <Card className="p-8 border-secondary-100 rounded-[2.5rem] bg-white shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-display font-black text-secondary-900 text-xl">
                    Recent Events
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("Event Management")}
                    className="text-primary-600 font-bold"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-6">
                  {eventsData.slice(0, 4).map((event) => (
                    <div
                      key={event._id}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={getCategoryImage(event.category)}
                          alt={event.category}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h5 className="font-black text-secondary-900 leading-none group-hover:text-primary-600 transition-colors">
                          {event.title}
                        </h5>
                        <p className="text-xs text-secondary-400 font-bold uppercase mt-1.5 tracking-wider flex items-center gap-2">
                          {event.collegeId?.college || "Global Hub"}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          event.category === "Hackathon"
                            ? "bg-blue-100 text-blue-700"
                            : event.category === "Cultural"
                              ? "bg-purple-100 text-purple-700"
                              : event.category === "Sports"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                        }`}
                      >
                        {event.category}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* System Health Section */}
              <Card className="p-8 border-secondary-100 rounded-[2.5rem] bg-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-50" />
                <h4 className="font-display font-black text-secondary-900 mb-8 text-xl">
                  System Health
                </h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-secondary-50 hover:bg-white hover:shadow-md transition-all group">
                    <span className="text-secondary-500 font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      Server Status
                    </span>
                    <span className="font-black text-success uppercase tracking-widest text-xs">
                      Healthy
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-secondary-50 hover:bg-white hover:shadow-md transition-all">
                    <span className="text-secondary-500 font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                      Database
                    </span>
                    <span className="font-black text-secondary-900 uppercase tracking-widest text-xs">
                      Connected
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-secondary-50 hover:bg-white hover:shadow-md transition-all">
                    <span className="text-secondary-500 font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-warning"></div>
                      API Response
                    </span>
                    <span className="font-black text-primary-600 tracking-widest text-xs">
                      {apiLatency}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-secondary-50 hover:bg-white hover:shadow-md transition-all">
                    <span className="text-secondary-500 font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary-400"></div>
                      Uptime
                    </span>
                    <span className="font-black text-secondary-900 tracking-widest text-xs">
                      99.9%
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      case "User Management":
        return (
          <div className="overflow-x-auto rounded-[2rem] border border-secondary-100 shadow-xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary-50/50 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    User
                  </th>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    Role
                  </th>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    College
                  </th>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {usersData.length > 0 ? (
                  usersData.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-secondary-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm group-hover:scale-110 transition-transform flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-sm text-secondary-900 leading-tight">
                              {u.name}
                            </div>
                            <div className="text-[10px] text-secondary-400 uppercase tracking-wider mt-0.5">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.role === "student" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-secondary-600">
                        {u.college || "N/A"}
                      </td>
                      <td className="px-8 py-5 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-success font-black text-xs uppercase tracking-widest">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-10 font-bold text-secondary-400"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case "Event Management":
        return (
          <div className="overflow-x-auto rounded-[2rem] border border-secondary-100 shadow-xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary-50/50 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    Event Details
                  </th>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    Organizer
                  </th>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    Date
                  </th>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {eventsData.length > 0 ? (
                  eventsData.map((e) => (
                    <tr
                      key={e._id}
                      className="hover:bg-secondary-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-secondary-100">
                            <img
                              src={getCategoryImage(e.category)}
                              alt={e.category}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-black text-sm text-secondary-900 leading-tight">
                              {e.title}
                            </div>
                            <div className="text-[10px] text-secondary-400 font-bold uppercase tracking-wider mt-1.5">
                              {e.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-secondary-600">
                        {e.collegeId?.name || "Admin"}
                        <div className="text-[10px] opacity-60 font-medium">
                          {e.collegeId?.college}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-primary-600">
                        {new Date(e.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-sm flex gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-success/10 text-success">
                          Published
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEvent(e);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 hover:bg-secondary-100 rounded-lg text-primary-600"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-10 font-bold text-secondary-400"
                    >
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case "Admin Logs":
        return (
          <div className="overflow-x-auto rounded-[2rem] border border-secondary-100 shadow-xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary-50/50 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    Admin Action
                  </th>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    User
                  </th>
                  <th className="px-8 py-5 border-b border-secondary-100">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {logsData.length > 0 ? (
                  logsData.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-secondary-50/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></div>
                          <span className="text-sm font-black text-secondary-900">
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-secondary-100 flex items-center justify-center text-[10px] font-black text-secondary-600 flex-shrink-0 border border-secondary-200">
                            {log.user?.name?.charAt(0) || "S"}
                          </div>
                          <span className="text-sm font-bold text-secondary-600">
                            {log.user?.name || "System"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-[0.1em]">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-[9px] font-medium text-secondary-400 uppercase tracking-wider mt-0.5">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-10 font-bold text-secondary-400"
                    >
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return (
          <div className="p-20 text-center font-bold text-secondary-400">
            Select a tab to view content
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-secondary-900 tracking-tight">
              Admin Interface
            </h1>
            <p className="text-secondary-500 mt-2 font-medium">
              Real-time monitoring and administrative controls
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              {...stat}
              className="shadow-lg hover:shadow-2xl transition-all duration-300 border-none bg-white p-8 rounded-[2.5rem]"
            />
          ))}
        </div>

        <Card className="rounded-[3rem] border-secondary-100 shadow-2xl overflow-hidden bg-white">
          <div className="border-b border-secondary-100 bg-secondary-50/30">
            <nav className="flex space-x-12 px-10" aria-label="Tabs">
              {[
                "Overview",
                "User Management",
                "Event Management",
                "Admin Logs",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    whitespace-nowrap py-6 px-1 border-b-4 font-black text-xs uppercase tracking-[0.15em] transition-all
                    ${
                      activeTab === tab
                        ? "border-primary-600 text-primary-700"
                        : "border-transparent text-secondary-400 hover:text-secondary-600 hover:border-secondary-200"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-secondary-900 tracking-tight">
                {activeTab}
              </h3>
            </div>

            {renderTabContent()}
          </div>
        </Card>
      </div>
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onEventUpdated={(updatedEvent) => {
          setEventsData((prev) =>
            prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev)),
          );
        }}
      />
    </div>
  );
};

export default AdminPanel;
