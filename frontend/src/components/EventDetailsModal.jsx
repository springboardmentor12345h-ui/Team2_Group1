import React from "react";
import Modal from "./ui/Modal";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

const EventDetailsModal = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  const getCategoryColor = (category) => {
    const colors = {
      Hackathon: "bg-blue-100 text-blue-700",
      Cultural: "bg-purple-100 text-purple-700",
      Sports: "bg-orange-100 text-orange-700",
      Workshop: "bg-green-100 text-green-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="relative">
        {/* Banner Image */}
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={
              event.image ||
              `https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80`
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getCategoryColor(event.category)}`}
              >
                {event.category}
              </span>
              <span className="bg-success/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-secondary-900 mb-1">
              {event.title}
            </h2>
            <p className="text-secondary-500 font-medium">
              College: {event.collegeId?.college || "Global"}
            </p>
          </div>

          <div className="flex border-b border-secondary-100 mb-8">
            <button className="px-4 py-2 text-primary-600 border-b-2 border-primary-600 font-bold text-sm">
              Event Details
            </button>
            <button className="px-4 py-2 text-secondary-400 font-medium text-sm hover:text-secondary-600 transition-colors">
              Comments (0)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-600">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">
                    Start Time
                  </p>
                  <p className="text-lg font-bold text-secondary-900">
                    {new Date(event.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                  <MapPinIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-lg font-bold text-secondary-900">
                    {event.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <UserGroupIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">
                    Participants
                  </p>
                  <p className="text-lg font-bold text-secondary-900">
                    342 / 500
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="w-5 h-5 text-primary-500" />
                  <h4 className="font-bold text-secondary-900 uppercase text-xs tracking-wider">
                    Tags
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["music", "dance", "art", "culture"].map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 capitalize"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-primary-500" />
                  <h4 className="font-bold text-secondary-900 uppercase text-xs tracking-wider">
                    Requirements
                  </h4>
                </div>
                <p className="text-sm text-secondary-600 leading-relaxed">
                  Registration required for participation. Please bring your
                  student ID card.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrophyIcon className="w-5 h-5 text-primary-500" />
                  <h4 className="font-bold text-secondary-900 uppercase text-xs tracking-wider">
                    Prizes
                  </h4>
                </div>
                <p className="text-sm text-secondary-600 leading-relaxed">
                  Winner gets a trophy and $500 cash prize.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-100">
            <h4 className="font-bold text-secondary-900 mb-2">Description</h4>
            <p className="text-secondary-600 text-sm leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95">
              Register Now
            </button>
            <button className="px-6 border border-secondary-200 hover:bg-secondary-50 rounded-2xl transition-colors">
              Share
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventDetailsModal;
