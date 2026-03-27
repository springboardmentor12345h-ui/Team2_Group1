import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import AuthContext from "../context/AuthContext";
import EventDetailsModal from "../components/EventDetailsModal";
import CreateEventModal from "../components/CreateEventModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Events = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Types");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [userRegistrations, setUserRegistrations] = useState([]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, category, status, date]);

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/v1/events?page=${page}&limit=8&`;
      if (query) url += `search=${query}&`;
      if (category !== "All Types") url += `category=${category}&`;
      if (status === "Upcoming")
        url += `endDate[gte]=${new Date().toISOString()}&`;
      if (status === "Completed")
        url += `endDate[lt]=${new Date().toISOString()}&`;
      if (date) {
        // ✅ Date Filter (No timezone shift issue)
        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59`;
        url += `startDate[gte]=${startOfDay}&`;
        url += `startDate[lte]=${endOfDay}&`;
      }

      const { data } = await axios.get(url);

      setEvents(data.data.events);
      setTotalPages(Math.ceil(data.totalResults / 8));
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [page, query, category, status, date]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchEvents, query, category, page, status, date]);

  const fetchUserRegistrations = useCallback(async () => {
    if (!user || user.role !== "student") return;
    try {
      const { data } = await axios.get(
        "/api/v1/registrations/my-registrations",
      );
      setUserRegistrations(data.data.registrations.map((r) => r.eventId._id));
    } catch (error) {
      console.error("Failed to load user registrations", error);
    }
  }, [user]);

  useEffect(() => {
    fetchUserRegistrations();
  }, [fetchUserRegistrations]);

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Hackathon: "bg-blue-100 text-blue-700",
      Cultural: "bg-purple-100 text-purple-700",
      Sports: "bg-orange-100 text-orange-700",
      Workshop: "bg-green-100 text-green-700",
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

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now > end) return "Completed";
    if (now >= start && now <= end) return "Ongoing";
    return "Upcoming";
  };

  return (
    <div className="min-h-screen bg-secondary-50 pb-12">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              All Events
            </h1>
            <p className="text-secondary-500 mt-1">
              Discover and register for exciting inter-college events
            </p>
          </div>
          {user &&
            (user.role === "collegeAdmin" || user.role === "superAdmin") && (
              <Button
                variant="primary"
                onClick={() => setIsCreateOpen(true)}
                className="group"
              >
                <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                Create Event
              </Button>
            )}
        </div>

        {/* Filters */}
        <Card className="mb-8 p-4 bg-white/50 backdrop-blur-md border-white">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-10 h-12"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-secondary-400 absolute left-3 top-3.5" />
            </div>
            <div className="relative min-w-[150px]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-700 appearance-none shadow-sm cursor-pointer"
              >
                <option>All</option>
                <option>Upcoming</option>
                <option>Completed</option>
              </select>
              <ClockIcon className="w-5 h-5 text-secondary-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
            <div className="relative min-w-[180px]">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 h-12 cursor-pointer"
              />
              <CalendarIcon className="w-5 h-5 text-secondary-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
            <div className="relative min-w-[180px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-700 appearance-none shadow-sm cursor-pointer"
              >
                <option>All Types</option>
                <option>Hackathon</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Workshop</option>
              </select>
              <FunnelIcon className="w-5 h-5 text-secondary-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl h-[450px] animate-pulse"
              >
                <div className="h-48 bg-secondary-100 rounded-t-3xl" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-1/2 bg-secondary-100 rounded" />
                  <div className="h-8 w-3/4 bg-secondary-100 rounded" />
                  <div className="h-20 w-full bg-secondary-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {events.map((event) => (
              <Card
                key={event._id}
                onClick={() => handleViewDetails(event)}
                className="overflow-hidden group h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-secondary-100 hover:border-primary-200 cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={event.image || getCategoryImage(event.category)}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <div
                      className={`backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black shadow-lg border uppercase tracking-widest ${
                        getEventStatus(event) === "Completed"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : getEventStatus(event) === "Ongoing"
                            ? "bg-orange-50 text-orange-600 border-orange-100"
                            : "bg-success/10 text-success border-success/20"
                      }`}
                    >
                      {getEventStatus(event)}
                    </div>
                    {userRegistrations.includes(event._id) && (
                      <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg uppercase tracking-widest border border-primary-500">
                        Registered
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-secondary-900 px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      Quick View
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${getCategoryColor(event.category)}`}
                    >
                      {event.category}
                    </span>
                    <span className="text-[10px] font-medium text-secondary-400">
                      {event.collegeId?.college || "Global"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-secondary-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {event.title}
                  </h3>

                  <p className="text-xs text-secondary-500 mb-4 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-secondary-600 mb-5 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-primary-500" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-primary-500" />
                      <span>
                        {new Date(event.startDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={
                      userRegistrations.includes(event._id)
                        ? "primary"
                        : "outline"
                    }
                    className={`w-full justify-center rounded-xl py-3 font-bold transition-all ${
                      userRegistrations.includes(event._id)
                        ? "bg-primary-600 text-white border-primary-600 cursor-default"
                        : "border-secondary-200 group-hover:border-primary-500 group-hover:bg-primary-50 group-hover:text-primary-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!userRegistrations.includes(event._id)) {
                        handleViewDetails(event);
                      }
                    }}
                  >
                    {userRegistrations.includes(event._id)
                      ? "Registered"
                      : "View Full Details"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-8">
            <Button
              variant="outline"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === 1}
              className="px-6 py-2 rounded-xl font-bold border-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => {
                    setPage(i + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    page === i + 1
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                      : "bg-white text-secondary-600 hover:bg-secondary-50 border border-secondary-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === totalPages}
              className="px-6 py-2 rounded-xl font-bold border-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
            >
              Next
            </Button>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-secondary-100">
            <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="w-10 h-10 text-secondary-300" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-2">
              No events found
            </h3>
            <p className="text-secondary-500 max-w-xs mx-auto">
              We couldn't find any events matching your current search or
              filters.
            </p>
            <Button
              variant="ghost"
              className="mt-6 text-primary-600"
              onClick={() => {
                setQuery("");
                setCategory("All Types");
                setStatus("All");
                setDate("");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        event={selectedEvent}
        onRegisterSuccess={fetchUserRegistrations}
      />

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onEventCreated={(newEvent) => setEvents([newEvent, ...events])}
      />
    </div>
  );
};

export default Events;
