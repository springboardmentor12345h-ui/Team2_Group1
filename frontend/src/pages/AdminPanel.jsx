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
  TrashIcon,
  CheckIcon,
  XMarkIcon,
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
  const { user, loading: authLoading } = useContext(AuthContext);
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
  const [exportingId, setExportingId] = useState(null);

  // Global Stat states
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotal, setEventsTotal] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(1);
  const [registrationsData, setRegistrationsData] = useState([]);
  const [registrationsPage, setRegistrationsPage] = useState(1);
  const [registrationsTotal, setRegistrationsTotal] = useState(1);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const fetchAdminData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [
        usersRes,
        eventsRes,
        logsRes,
        recentLogsRes,
        studentsRes,
        pendingRes,
        regsRes,
      ] = await Promise.all([
        axios.get(`/api/v1/users?page=${usersPage}&limit=10`),
        axios.get(`/api/v1/events?page=${eventsPage}&limit=10&sort=-createdAt`),
        axios.get(`/api/v1/logs?page=${logsPage}&limit=10`),
        axios.get(`/api/v1/logs?limit=5`),
        axios.get(`/api/v1/users?role=student&limit=1`),
        axios.get(`/api/v1/users?status=pending&limit=1`),
        axios.get(
          `/api/v1/registrations/admin?page=${registrationsPage}&limit=10`,
        ),
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
      if (user.role === "superAdmin") {
        setPendingUsersCount(pendingRes.data.totalResults);
      }

      setRegistrationsData(regsRes.data.data.registrations);
      setRegistrationsTotal(Math.ceil(regsRes.data.totalResults / 10));
      setPendingRegistrationsCount(
        regsRes.data.data.registrations.filter((r) => r.status === "pending")
          .length,
      );
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await axios.patch(`/api/v1/users/${userId}`, { status: newStatus });
      toast.success(`User ${newStatus} successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/api/v1/users/${userId}`);
      toast.success("User deleted successfully");
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`/api/v1/events/${eventId}`);
      toast.success("Event deleted successfully");
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  const handleUpdateRegistrationStatus = async (regId, newStatus) => {
    try {
      await axios.patch(`/api/v1/registrations/${regId}/status`, {
        status: newStatus,
      });
      toast.success(`Registration ${newStatus} successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update registration",
      );
    }
  };

  const handleDeleteRegistration = async (regId) => {
    if (!window.confirm("Are you sure you want to delete this registration?"))
      return;
    try {
      await axios.delete(`/api/v1/registrations/${regId}`);
      toast.success("Registration deleted successfully");
      fetchAdminData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete registration",
      );
    }
  };

  const handleExportCSV = async (eventId, eventTitle) => {
    setExportingId(eventId);
    try {
      const response = await axios.get(
        `/api/v1/events/${eventId}/export-participants`,
        {
          responseType: "blob",      // IMPORTANT: must be blob for file download
          withCredentials: true,     // remove if you use Authorization headers
        }
      );

      // Create a temporary download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${eventTitle.replace(/\s+/g, "_")}_participants.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        alert("No participants have registered for this event yet.");
      } else if (status === 403) {
        alert("You are not authorized to export this event's participants.");
      } else {
        alert("Export failed. Please try again.");
      }
    } finally {
      setExportingId(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;

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
        if (!user) return;
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
          } else if (activeTab === "Registrations") {
            const res = await axios.get(
              `/api/v1/registrations/admin?page=${registrationsPage}&limit=10`,
            );
            setRegistrationsData(res.data.data.registrations);
            setRegistrationsTotal(Math.ceil(res.data.totalResults / 10));
            setPendingRegistrationsCount(
              res.data.data.registrations.filter((r) => r.status === "pending")
                .length,
            );
          }
          // Always refresh recent logs and global states
          const [rLogRes, sRes, pRes] = await Promise.all([
            axios.get(`/api/v1/logs?limit=5`),
            axios.get(`/api/v1/users?role=student&limit=1`),
            axios.get(`/api/v1/users?status=pending&limit=1`),
          ]);
          setRecentLogs(rLogRes.data.data.logs);
          setTotalStudents(sRes.data.totalResults);
          if (user.role === "superAdmin") {
            setPendingUsersCount(pRes.data.totalResults);
          }
        } catch (e) {
          console.error("Selective Refresh failed", e);
        }
      };
      refreshCurrentTab();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, usersPage, eventsPage, logsPage, registrationsPage]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
                      className="flex items-center gap-4 group cursor-pointer"
                      onClick={() => setActiveTab("Event Management")}
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
            {user.role === "superAdmin" && (
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
            )}
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
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Actions
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
                          className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                            u.role === "student"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : u.role === "superAdmin"
                                ? "bg-red-50 text-red-600 border border-red-200 shadow-sm"
                                : "bg-purple-50 text-purple-600 border border-purple-100"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs font-black text-secondary-600 uppercase tracking-tighter">
                        {u.college || "Global Registry"}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${
                            u.status === "approved"
                              ? "text-success"
                              : u.status === "pending"
                                ? "text-orange-500"
                                : "text-red-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              u.status === "approved"
                                ? "bg-success animate-pulse shadow-sm shadow-success"
                                : u.status === "pending"
                                  ? "bg-orange-500 animate-bounce"
                                  : "bg-red-500"
                            }`}
                          ></span>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {user.role === "superAdmin" &&
                            u.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateUserStatus(u._id, "approved")
                                  }
                                  className="p-2 text-success hover:bg-success/10 rounded-xl"
                                  title="Approve"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateUserStatus(u._id, "rejected")
                                  }
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                                  title="Reject"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          {user.role === "superAdmin" &&
                            u.email !== "admin@example.com" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            )}
                        </div>
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
                          {(user.role === "superAdmin" ||
                            e.collegeId?._id === user._id) && (
                            <>
                              <button
                                onClick={() => handleExportCSV(e._id, e.title)}
                                disabled={exportingId === e._id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                              >
                                {exportingId === e._id ? "Exporting..." : "⬇ Export CSV"}
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingEvent(e);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-2 border border-secondary-100 rounded-xl hover:bg-primary-50 text-primary-600 transition-all ml-2"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(e._id)}
                                className="p-2 border border-secondary-100 rounded-xl hover:bg-red-50 text-red-600 transition-all ml-2"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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
      case "Registrations":
        return (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-[2.5rem] border border-secondary-100 shadow-xl bg-white overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-50/50 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Student Details
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Event Details
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Status
                    </th>
                    <th className="px-8 py-6 border-b border-secondary-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {registrationsData.map((reg) => (
                    <tr
                      key={reg._id}
                      className="hover:bg-secondary-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 font-black text-xs border border-primary-100">
                            {reg.studentId?.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-sm text-secondary-900 uppercase">
                              {reg.studentId?.name}
                            </div>
                            <div className="text-[10px] text-secondary-400 font-bold tracking-wider lowercase opacity-70 italic">
                              {reg.studentId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-xs text-secondary-900 uppercase">
                          {reg.eventId?.title}
                        </div>
                        <div className="text-[9px] text-primary-500 font-black uppercase tracking-widest mt-1">
                          {new Date(reg.eventId?.startDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${
                            reg.status === "approved"
                              ? "text-success"
                              : reg.status === "pending"
                                ? "text-orange-500"
                                : "text-red-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              reg.status === "approved"
                                ? "bg-success"
                                : reg.status === "pending"
                                  ? "bg-orange-500 animate-pulse"
                                  : "bg-red-500"
                            }`}
                          ></span>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {reg.status === "pending" &&
                            user.role === "collegeAdmin" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateRegistrationStatus(
                                      reg._id,
                                      "approved",
                                    )
                                  }
                                  className="p-2 text-success hover:bg-success/10 rounded-xl"
                                  title="Approve"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateRegistrationStatus(
                                      reg._id,
                                      "rejected",
                                    )
                                  }
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                                  title="Reject"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRegistration(reg._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Registration Pagination */}
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                Page {registrationsPage} of {registrationsTotal}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRegistrationsPage((p) => Math.max(1, p - 1))
                  }
                  disabled={registrationsPage === 1}
                  className="rounded-xl font-bold text-[10px] uppercase"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRegistrationsPage((p) =>
                      Math.min(registrationsTotal, p + 1),
                    )
                  }
                  disabled={registrationsPage === registrationsTotal}
                  className="rounded-xl font-bold text-[10px] uppercase"
                >
                  Next
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
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest ${
                                log.user?.role === "superAdmin"
                                  ? "text-red-500"
                                  : "text-primary-500"
                              }`}
                            >
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
                "Registrations",
                "Admin Logs",
              ]
                .filter((tab) => {
                  if (tab === "User Management")
                    return user?.role === "superAdmin";
                  return true;
                })

                .map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                    whitespace-nowrap py-6 px-1 border-b-4 font-black text-xs uppercase tracking-[0.15em] transition-all relative
                    ${
                      activeTab === tab
                        ? "border-primary-600 text-primary-700"
                        : "border-transparent text-secondary-400 hover:text-secondary-600 hover:border-secondary-200"
                    }
                  `}
                  >
                    {tab}
                    {tab === "User Management" && pendingUsersCount > 0 && (
                      <span className="absolute top-4 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    {tab === "Registrations" &&
                      pendingRegistrationsCount > 0 && (
                        <span className="absolute top-4 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                      )}
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
