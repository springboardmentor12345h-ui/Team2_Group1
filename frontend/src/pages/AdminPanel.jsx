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
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLatency, setApiLatency] = useState(150);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Global Stat states
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEventsCount, setTotalEventsCount] = useState(0);

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotal, setEventsTotal] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(1);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes, logsRes, recentLogsRes, studentsRes] =
        await Promise.all([
          axios.get(`/api/v1/users?page=${usersPage}&limit=10`),
          axios.get(
            `/api/v1/events?page=${eventsPage}&limit=10&sort=-createdAt`,
          ),
          axios.get(`/api/v1/logs?page=${logsPage}&limit=10`),
          axios.get(`/api/v1/logs?limit=5`),
          axios.get(`/api/v1/users?role=student&limit=1`), // Fetch to get totalResults for students
        ]);
      setUsersData(usersRes.data.data.users);
      setUsersTotal(Math.ceil(usersRes.data.totalResults / 10));

      setEventsData(eventsRes.data.data.events);
      setEventsTotal(Math.ceil(eventsRes.data.totalResults / 10));
      setTotalEventsCount(eventsRes.data.totalResults);

      setLogsData(logsRes.data.data.logs);
      setLogsTotal(Math.ceil(logsRes.data.totalResults / 10));

      setRecentLogs(recentLogsRes.data.data.logs);
      setTotalStudents(studentsRes.data.totalResults);
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
    // Simulate real-time health and fetch recent logs
    const interval = setInterval(() => {
      setApiLatency(Math.floor(Math.random() * (160 - 140 + 1)) + 140);

      // Auto-refresh the current tab's data
      const refreshCurrentTab = async () => {
        try {
          if (activeTab === "User Management") {
            const res = await axios.get(
              `/api/v1/users?page=${usersPage}&limit=10`,
            );
            setUsersData(res.data.data.users);
            setUsersTotal(Math.ceil(res.data.totalResults / 10));
          } else if (activeTab === "Event Management") {
            const res = await axios.get(
              `/api/v1/events?page=${eventsPage}&limit=10&sort=-createdAt`,
            );
            setEventsData(res.data.data.events);
            setEventsTotal(Math.ceil(res.data.totalResults / 10));
            setTotalEventsCount(res.data.totalResults);
          } else if (activeTab === "Admin Logs") {
            const res = await axios.get(
              `/api/v1/logs?page=${logsPage}&limit=10`,
            );
            setLogsData(res.data.data.logs);
            setLogsTotal(Math.ceil(res.data.totalResults / 10));
          }
          // Always refresh recent logs and global states
          const [rLogRes, sRes] = await Promise.all([
            axios.get(`/api/v1/logs?limit=5`),
            axios.get(`/api/v1/users?role=student&limit=1`),
          ]);
          setRecentLogs(rLogRes.data.data.logs);
          setTotalStudents(sRes.data.totalResults);
        } catch (e) {
          console.error("Selective Refresh failed", e);
        }
      };
      refreshCurrentTab();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, usersPage, eventsPage, logsPage]);

  const stats = [
    {
      title: "Total Events",
      value: loading ? "..." : totalEventsCount.toString(),
      trend: { value: 12, label: "vs last month" },
      icon: ChartBarIcon,
    },
    {
      title: "Active Users",
      value: loading ? "..." : totalStudents.toString(),
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
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Events Section */}
              <Card className="p-8 border-secondary-100 rounded-[2.5rem] bg-white shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-display font-black text-secondary-900 text-xl tracking-tight">
                    Recent Events
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("Event Management")}
                    className="text-primary-600 font-black text-[10px] uppercase tracking-widest"
                  >
                    View All →
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
                        <p className="text-xs text-secondary-400 font-bold uppercase mt-1.5 tracking-wider">
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

              {/* Recent Activity (Logs) */}
              <Card className="p-8 border-secondary-100 rounded-[2.5rem] bg-white shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-display font-black text-secondary-900 text-xl tracking-tight">
                    Recent Activity
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("Admin Logs")}
                    className="text-primary-600 font-black text-[10px] uppercase tracking-widest"
                  >
                    History →
                  </Button>
                </div>
                <div className="space-y-6">
                  {recentLogs.map((log) => (
                    <div key={log._id} className="flex gap-4 items-start group">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
                      <div className="flex-grow">
                        <p className="text-sm font-black text-secondary-900 leading-snug">
                          {log.action}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-black text-secondary-400 uppercase tracking-wider">
                            BY {log.user?.name || "SYSTEM"}
                          </span>
                          <span className="text-[9px] font-bold text-secondary-300">
                            •{" "}
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* System Health Section */}
            <Card className="p-8 border-secondary-100 rounded-[2.5rem] bg-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-50" />
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-display font-black text-secondary-900 text-xl tracking-tight">
                  System Health & Metrics
                </h4>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase">
                    Live
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-secondary-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-secondary-100">
                  <span className="text-secondary-400 font-black text-[10px] uppercase tracking-[0.1em] block mb-2">
                    Server Status
                  </span>
                  <span className="font-black text-success text-sm uppercase">
                    Active / Healthy
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-secondary-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-secondary-100">
                  <span className="text-secondary-400 font-black text-[10px] uppercase tracking-[0.1em] block mb-2">
                    Latency
                  </span>
                  <span className="font-black text-primary-600 text-sm tracking-widest">
                    {apiLatency}ms
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-secondary-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-secondary-100">
                  <span className="text-secondary-400 font-black text-[10px] uppercase tracking-[0.1em] block mb-2">
                    Database
                  </span>
                  <span className="font-black text-secondary-900 text-sm uppercase">
                    Sync Ready
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-secondary-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-secondary-100">
                  <span className="text-secondary-400 font-black text-[10px] uppercase tracking-[0.1em] block mb-2">
                    Secure Layer
                  </span>
                  <span className="font-black text-secondary-900 text-sm uppercase">
                    SSL Active
                  </span>
                </div>
              </div>
            </Card>
          </div>
        );
      case "User Management":
        return (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-[2.5rem] border border-secondary-100 shadow-xl bg-white overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-50/50 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      User Details
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Role & Access
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      College Hub
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {usersData.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-secondary-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-700 font-black text-sm group-hover:scale-110 transition-transform flex-shrink-0 border border-primary-100">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-sm text-secondary-900 leading-tight sans uppercase">
                              {u.name}
                            </div>
                            <div className="text-[10px] text-secondary-400 font-bold tracking-wider mt-1 lowercase opacity-70 italic">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${u.role === "student" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-purple-50 text-purple-600 border border-purple-100"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs font-black text-secondary-600 uppercase tracking-tighter">
                        {u.college || "Global Registry"}
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-2 text-success font-black text-[10px] uppercase tracking-widest">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-sm shadow-success"></span>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* User Pagination */}
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                Page {usersPage} of {usersTotal}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  disabled={usersPage === 1}
                  className="rounded-xl font-bold text-[10px] uppercase"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setUsersPage((p) => Math.min(usersTotal, p + 1))
                  }
                  disabled={usersPage === usersTotal}
                  className="rounded-xl font-bold text-[10px] uppercase"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        );
      case "Event Management":
        return (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-[2.5rem] border border-secondary-100 shadow-xl bg-white overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-50/50 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Event
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Host
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Launch Date
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Global Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {eventsData.map((e) => (
                    <tr
                      key={e._id}
                      className="hover:bg-secondary-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border border-secondary-100 group-hover:rotate-3 transition-transform">
                            <img
                              src={e.image || getCategoryImage(e.category)}
                              alt={e.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-black text-sm text-secondary-900 leading-tight uppercase tracking-tight">
                              {e.title}
                            </div>
                            <div className="text-[9px] text-primary-500 font-black uppercase tracking-widest mt-2">
                              {e.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs font-black text-secondary-900 leading-tight uppercase tracking-tight">
                          {e.collegeId?.name || "Hub Admin"}
                        </div>
                        <div className="text-[9px] text-secondary-400 font-bold uppercase mt-1 tracking-widest">
                          {e.collegeId?.college}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[11px] font-black text-purple-600 italic tracking-widest">
                        {new Date(e.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                              new Date() > new Date(e.endDate)
                                ? "bg-red-50 text-red-600 border-red-100"
                                : "bg-success/5 text-success border border-success/10"
                            }`}
                          >
                            {new Date() > new Date(e.endDate)
                              ? "Completed"
                              : "Active"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingEvent(e);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 border border-secondary-100 rounded-xl hover:bg-primary-50 text-primary-600 transition-all"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Event Pagination */}
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                Showing Page {eventsPage} of {eventsTotal}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                  disabled={eventsPage === 1}
                  className="rounded-xl font-bold text-[10px] uppercase"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEventsPage((p) => Math.min(eventsTotal, p + 1))
                  }
                  disabled={eventsPage === eventsTotal}
                  className="rounded-xl font-bold text-[10px] uppercase"
                >
                  Next Step
                </Button>
              </div>
            </div>
          </div>
        );
      case "Admin Logs":
        return (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-[2.5rem] border border-secondary-100 shadow-xl bg-white overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-50/50 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Identity Change & Action
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Authorized Admin
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Temporal Stamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {logsData.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-secondary-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-primary-600 group-hover:scale-150 transition-transform"></div>
                          <span className="text-[13px] font-black text-secondary-900 tracking-tight leading-tight">
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-secondary-900 flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-lg">
                            {log.user?.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <span className="text-xs font-black text-secondary-900 uppercase tracking-tight block">
                              {log.user?.name || "Hub System"}
                            </span>
                            <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">
                              {log.user?.role || "Core"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-secondary-900 uppercase tracking-widest">
                            {new Date(log.timestamp).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "2-digit" },
                            )}
                          </span>
                          <span className="text-[9px] font-bold text-secondary-400 uppercase mt-1">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Logs Pagination */}
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                History Log {logsPage} / {logsTotal}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                  disabled={logsPage === 1}
                  className="rounded-xl font-bold text-[10px] uppercase"
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogsPage((p) => Math.min(logsTotal, p + 1))}
                  disabled={logsPage === logsTotal}
                  className="rounded-xl font-bold text-[10px] uppercase"
                >
                  Forward
                </Button>
              </div>
            </div>
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
