import React, { useState, useEffect, useContext } from "react";
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

const Events = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Types");

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = "/api/v1/events?";
      if (query) url += `search=${query}&`;
      if (category !== "All Types") url += `category=${category}&`;

      const { data } = await axios.get(url);
      setEvents(data.data.events);
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query, category]);

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

  return (
    <div className="min-h-screen bg-secondary-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                placeholder="Search events by title, description or category..."
                className="pl-10 h-12"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-secondary-400 absolute left-3 top-3.5" />
            </div>
            <div className="relative min-w-[200px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-700 appearance-none shadow-sm"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card
                key={event._id}
                className="overflow-hidden group h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-secondary-100 hover:border-primary-200"
              >
                <div
                  className="h-48 overflow-hidden relative"
                  onClick={() => handleViewDetails(event)}
                >
                  <img
                    src={event.image || getCategoryImage(event.category)}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-secondary-700 shadow-sm border border-white">
                    Upcoming
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-secondary-900 px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      Quick View
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getCategoryColor(event.category)}`}
                    >
                      {event.category}
                    </span>
                    <span className="text-xs font-medium text-secondary-400">
                      College: {event.collegeId?.college || "Global"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {event.title}
                  </h3>

                  <p className="text-sm text-secondary-500 mb-6 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm font-medium text-secondary-600 mb-6 mt-auto">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary-500" />
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
                    variant="outline"
                    className="w-full justify-center rounded-xl py-3 border-secondary-200 group-hover:border-primary-500 group-hover:bg-primary-50 group-hover:text-primary-700 transition-all font-bold"
                    onClick={() => handleViewDetails(event)}
                  >
                    View Full Details
                  </Button>
                </div>
              </Card>
            ))}
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
