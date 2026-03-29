import { useContext, useState, useEffect, useCallback, useRef } from "react";
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
  ArrowDownTrayIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
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
  const [regCount, setRegCount] = useState(0);
  const [registrations, setRegistrations] = useState([]);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewEvents, setHasNewEvents] = useState(false);
  const notifiedRegs = useRef(new Set());
  const attendedCount = registrations.filter(
    (r) => r.attendanceStatus === "present",
  ).length;

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDownloadAdmitCard = async (regId) => {
    try {
      const response = await axios.get(
        `/api/v1/registrations/${regId}/download-admit-card`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `AdmitCard_${regId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Admit card downloaded!");
      
      // Mark as read after download
      await axios.patch(`/api/v1/registrations/${regId}/student-read`);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Download failed");
    }
  };

  const handleDownloadCertificate = async (regId) => {
    try {
      const response = await axios.get(
        `/api/v1/registrations/${regId}/download-certificate`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate_${regId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded!");

      // Mark as read after download
      await axios.patch(`/api/v1/registrations/${regId}/student-read`);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Download failed");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch events
      let eventsUrl = "/api/v1/events?sort=startDate&limit=100";
      if (user.role === "collegeAdmin") {
        eventsUrl += `&collegeId=${user._id || user.id}`;
      }
      const eventsRes = await axios.get(eventsUrl);

      // Sort in frontend: Upcoming first (ASC), then Completed (DESC)
      const sortedEvents = [...eventsRes.data.data.events].sort((a, b) => {
        const aUpcoming = new Date(a.endDate) > new Date();
        const bUpcoming = new Date(b.endDate) > new Date();

        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;

        if (aUpcoming) {
          return new Date(a.startDate) - new Date(b.startDate);
        } else {
          return new Date(b.startDate) - new Date(a.startDate);
        }
      });

      setUpcomingEvents(sortedEvents);
      setTotalEventsCount(eventsRes.data.totalResults);
      setUpcomingEventsCount(
        eventsRes.data.data.events.filter(
          (e) => new Date(e.endDate) > new Date(),
        ).length,
      );

      // Check for new events
      if (user.role === "student" && user.lastViewedEventsAt) {
        const hasNew = sortedEvents.some(
          (e) => new Date(e.createdAt) > new Date(user.lastViewedEventsAt),
        );
        setHasNewEvents(hasNew);
      }

      // Fetch logs for admins
      if (user.role === "collegeAdmin" || user.role === "superAdmin") {
        try {
          const logsRes = await axios.get(`/api/v1/logs?limit=3`);
          setActivities(logsRes.data.data.logs);
        } catch (logError) {
          console.error("Logs fetch failed:", logError);
          setActivities([]);
        }
      }

      // Fetch registrations
      if (user.role === "student") {
        const res = await axios.get("/api/v1/registrations/my-registrations");
        setRegCount(res.data.results);
        setRegistrations(res.data.data.registrations);
        setUnreadCount(
          res.data.data.registrations.filter((r) => !r.isStudentRead).length,
        );

        // Handle notifications for students once
        const unreadRegs = res.data.data.registrations.filter(
          (r) => !r.isStudentRead,
        );
        unreadRegs.forEach((reg) => {
          const notificationKey = `${reg._id}-${reg.isCertificateIssued ? "cert" : reg.status}`;
          if (!notifiedRegs.current.has(notificationKey)) {
            if (reg.isCertificateIssued) {
              toast.success(
                `Congratulations! Your certificate for "${reg.eventId?.title || "Event"}" has been issued!`,
                {
                  position: "top-right",
                  autoClose: 6000,
                  icon: "🎓",
                },
              );
            } else if (reg.status !== "pending") {
              toast.info(
                `Update: Your registration for "${reg.eventId?.title || "Event"}" has been ${reg.status}!`,
                {
                  position: "top-right",
                  autoClose: 5000,
                  icon: reg.status === "approved" ? "✅" : "❌",
                },
              );
            }
            notifiedRegs.current.add(notificationKey);
          }
        });

        // Map student activities
        const studentActivities = res.data.data.registrations
          .slice(0, 3)
          .map((reg) => ({
            action: reg.isCertificateIssued
              ? `Certificate issued for "${reg.eventId?.title}"`
              : `Registration for "${reg.eventId?.title}" is ${reg.status}`,
            timestamp: reg.createdAt,
          }));
        setActivities(studentActivities);
      } else {
        const res = await axios.get("/api/v1/registrations/admin");
        setRegCount(res.data.totalResults);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!user) return null;

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Hackathon: "bg-blue-100 text-blue-700",
      Cultural: "bg-purple-100 text-purple-700",
      Workshop: "bg-green-100 text-green-700",
      Sports: "bg-orange-100 text-orange-700",
    };
    return colors[cat] || "bg-gray-100 text-gray-700";
  };

  const getCategoryImage = (cat) => {
    const images = {
      Hackathon:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop",
      Cultural:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
      Sports:
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&auto=format&fit=crop",
      Workshop:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop",
    };
    return (
      images[cat] ||
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop"
    );
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
      value: totalEventsCount.toString(),
      icon: CalendarIcon,
      trend: { value: 12, label: "all time" },
    },
    {
      title: "Upcoming Events",
      value: upcomingEventsCount.toString(),
      icon: ClockIcon,
      trend: { value: 2, label: "this week" },
    },
    {
      title:
        user.role === "student" ? "My Registrations" : "Total Registrations",
      value: regCount.toString(),
      icon: TicketIcon,
      trend: { value: 12, label: "this month" },
    },
  ];

  const CalendarModal = () => {
    const [currentDate] = useState(new Date());
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    ).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    if (!isCalendarOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary-900/60">
        <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl border border-secondary-100 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-secondary-900 uppercase tracking-tighter">
                {currentDate.toLocaleString("default", { month: "long" })}
              </h2>
              <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">
                {currentDate.getFullYear()} Event Schedule
              </span>
            </div>
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="p-3 hover:bg-secondary-50 rounded-2xl transition-colors group"
            >
              <XMarkIcon className="w-6 h-6 text-secondary-300 group-hover:text-red-500" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <span
                key={d}
                className="text-[10px] font-black text-secondary-300 uppercase tracking-widest"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`h-11 flex items-center justify-center rounded-xl text-xs font-black transition-all ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? "bg-primary-600 text-white shadow-lg" : day ? "text-secondary-600 hover:bg-secondary-50 cursor-pointer" : ""}`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button
              onClick={() => setIsCalendarOpen(false)}
              className="w-full rounded-[1.25rem] py-4 bg-secondary-900 text-white hover:bg-black font-black uppercase text-[10px] tracking-widest"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-secondary-50 pb-12">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-secondary-900 uppercase tracking-tight font-display">
              {user.role === "student" ? "Student Hub" : "Organizer Dashboard"}
            </h1>
            <p className="text-secondary-500 mt-1 font-medium italic opacity-70">
              Welcome back, {user.name.split(" ")[0]}!
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/events")}
            className="rounded-2xl shadow-lg shadow-primary-500/20 px-8"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Explore Events
          </Button>
        </div>

        {(user.role === "collegeAdmin" || user.role === "superAdmin") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                {...stat}
                className="bg-white border-none shadow-md rounded-[2rem] p-6"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-secondary-100 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => {
                    setActiveTab("Upcoming");
                    if (hasNewEvents) {
                      setHasNewEvents(false);
                      axios
                        .patch("/api/v1/users/update-last-viewed-events")
                        .catch(console.error);
                    }
                  }}
                  className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "Upcoming" ? "text-primary-600 border-b-2 border-primary-600" : "text-secondary-400 hover:text-secondary-600"}`}
                >
                  Upcoming Events
                  {hasNewEvents && (
                    <span className="absolute top-0 -right-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse shadow-blue-400/50 shadow-sm" />
                  )}
                </button>
                {user.role === "student" && (
                  <button
                    onClick={() => {
                      setActiveTab("Registered");
                      setUnreadCount(0); // Mark as read from dashboard UI
                    }}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "Registered" ? "text-primary-600 border-b-2 border-primary-600" : "text-secondary-400 hover:text-secondary-600"}`}
                  >
                    My Registrations
                    {unreadCount > 0 && (
                      <span className="absolute top-0 -right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse shadow-red-400/50 shadow-sm" />
                    )}
                  </button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/events")}
                className="font-black text-primary-600 text-[10px] uppercase tracking-widest pb-4"
              >
                View All →
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
                : activeTab === "Upcoming"
                  ? upcomingEvents.slice(0, 4).map((event) => (
                      <Card
                        key={event._id}
                        onClick={() => handleEventClick(event)}
                        className="p-5 flex flex-col sm:flex-row gap-5 hover:border-primary-300 transition-all cursor-pointer group shadow-sm hover:shadow-xl bg-white rounded-[2rem] border border-secondary-100"
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
                          <div className="flex items-start justify-between mb-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getCategoryColor(event.category)} shadow-sm`}
                            >
                              {event.category}
                            </span>
                            <div className="flex items-center gap-1.5 bg-success/10 text-success px-2 py-0.5 rounded-full text-[9px] font-black border border-success/10 uppercase tracking-tighter">
                              FREE
                            </div>
                          </div>
                          <h3 className="text-xl font-black text-secondary-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                            {event.title}
                          </h3>
                          <div className="flex items-center text-[10px] font-bold text-secondary-400 gap-5 mt-2 uppercase tracking-wide">
                            <div className="flex items-center gap-1.5">
                              <ClockIcon className="w-3.5 h-3.5 text-primary-500" />
                              {new Date(event.startDate).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPinIcon className="w-3.5 h-3.5 text-primary-500" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  : registrations.map((reg) => (
                      <Card
                        key={reg._id}
                        className="p-5 hover:border-primary-300 transition-all shadow-sm bg-white rounded-[2rem] border border-secondary-100 group"
                      >
                        <div className="flex flex-col sm:flex-row gap-5">
                          <div className="flex-shrink-0 w-full sm:w-16 h-16 bg-secondary-50 rounded-xl flex items-center justify-center overflow-hidden">
                             <img
                                src={reg.eventId?.image || getCategoryImage(reg.eventId?.category)}
                                alt="Event"
                                className="w-full h-full object-cover"
                              />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-black text-secondary-900 uppercase tracking-tight leading-none truncate mb-2">
                              {reg.eventId?.title}
                            </h3>
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
                                ID:{" "}
                                <span className="text-secondary-900">
                                  {reg._id.slice(-6).toUpperCase()}
                                </span>
                              </p>
                              <div className="inline-block">
                                <span
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${reg.status === "approved" ? "bg-green-100 text-green-700" : reg.status === "rejected" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                                >
                                  {reg.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row gap-2 self-center sm:self-end mt-4 sm:mt-0">
                             <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                 setSelectedEvent(reg.eventId);
                                 setIsDetailsOpen(true);
                              }}
                              className="w-10 h-10 p-0 text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                              title="Quick View"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Button>
                            {reg.status === "approved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadAdmitCard(reg._id)}
                                className="w-10 h-10 p-0 border-secondary-100 text-secondary-600 hover:border-primary-500 hover:text-primary-600 rounded-xl transition-all"
                                title="Download Admit Card"
                              >
                                <TicketIcon className="w-5 h-5" />
                              </Button>
                            )}
                            {reg.isCertificateIssued && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleDownloadCertificate(reg._id)}
                                className="w-10 h-10 p-0 bg-primary-600 hover:bg-black text-white rounded-xl shadow-lg shadow-primary-500/10 transition-all"
                                title="Download Certificate"
                              >
                                <AcademicCapIcon className="w-5 h-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
            </div>
          </div>

          <div className="space-y-6">
            {user.role === "collegeAdmin" || user.role === "superAdmin" ? (
              <div className="relative bg-primary-600 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl border border-primary-500">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-lg">
                      <SparklesIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      Quick Actions
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsCalendarOpen(true)}
                      className="w-full bg-primary-700 hover:bg-white text-white hover:text-primary-700 border border-primary-500 rounded-2xl p-4 flex items-center transition-all duration-300 font-black uppercase text-[10px] tracking-widest group shadow-lg"
                    >
                      <CalendarIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      My Calendar
                    </button>
                    <button
                      onClick={() =>
                        navigate("/admin", {
                          state: { activeTab: "Registrations" },
                        })
                      }
                      className="w-full bg-primary-700 hover:bg-white text-white hover:text-primary-700 border border-primary-500 rounded-2xl p-4 flex items-center transition-all duration-300 font-black uppercase text-[10px] tracking-widest group shadow-lg"
                    >
                      <ClipboardDocumentCheckIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      Registrations
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-8 border border-secondary-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 rounded-full blur-2xl" />
                <h3 className="text-xl font-black text-secondary-900 mb-6 uppercase tracking-tight">
                  Your Stats
                </h3>
                <div className="space-y-4 relative z-10">
                  <div className="bg-secondary-50 p-5 rounded-2xl flex items-center justify-between group cursor-default shadow-inner">
                    <div>
                      <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1 leading-none">
                        Attended
                      </p>
                      <p className="text-2xl font-black text-secondary-900 tracking-tighter leading-none">
                        {attendedCount}
                      </p>
                    </div>
                    <CheckCircleIcon className="w-8 h-8 text-primary-200 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <div className="bg-secondary-50 p-5 rounded-2xl flex items-center justify-between group cursor-default shadow-inner">
                    <div>
                      <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1 leading-none">
                        Registered
                      </p>
                      <p className="text-2xl font-black text-secondary-900 tracking-tighter leading-none">
                        {regCount}
                      </p>
                    </div>
                    <TicketIcon className="w-8 h-8 text-primary-200 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </div>
            )}

            <Card className="p-8 rounded-[2.5rem] border-secondary-100 shadow-sm bg-white">
              <h3 className="text-xl font-black text-secondary-900 mb-8 uppercase tracking-tight">
                Recent Activity
              </h3>
              <div className="space-y-6">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-4 group italic">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 shadow-sm" />
                    <div className="flex-grow">
                      <p className="text-xs font-bold text-secondary-700 leading-snug">
                        {act.action}
                      </p>
                      <p className="text-[9px] font-black text-secondary-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 opacity-70">
                        <ClockIcon className="w-3 h-3" />
                        {getTimeAgo(act.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-xs text-secondary-400 font-bold uppercase py-10 opacity-50 tracking-widest">
                    No Activity Yet
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        user={user}
        onRegister={fetchDashboardData}
      />
      <CalendarModal />
      <LaraChatbot user={user} />
    </div>
  );
};
export default Dashboard;
