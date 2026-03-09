import React, { useContext, useState } from "react";
import Modal from "./ui/Modal";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  CheckCircleIcon,
  UserIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const EventDetailsModal = ({ isOpen, onClose, event }) => {
  const { user } = useContext(AuthContext);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRegisterClick = () => {
    if (!user) {
      toast.error("Please login to register for events");
      return;
    }
    if (user.role !== "student") {
      toast.error("Only students can register for events");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    // Simulating API call for registration
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmation(false);
      toast.success(`Successfully registered for ${event.title}!`);
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="relative">
        {/* Banner Image */}
        <div className="h-48 sm:h-64 w-full relative">
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
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  new Date() > new Date(event.endDate)
                    ? "bg-red-600 text-white"
                    : "bg-success/90 text-white"
                }`}
              >
                {new Date() > new Date(event.endDate) ? "Completed" : "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {!showConfirmation ? (
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
              <button className="px-4 py-2 text-secondary-400 font-medium text-sm hover:text-secondary-600">
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

            {(!user || user.role === "student") && (
              <div className="mt-8 flex gap-4">
                {new Date() > new Date(event.endDate) ? (
                  <div className="flex-1 bg-secondary-100 text-secondary-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-default border border-secondary-200">
                    <ClockIcon className="w-5 h-5" />
                    EVENT COMPLETED
                  </div>
                ) : (
                  <button
                    className={`flex-1 ${
                      user?.role === "student"
                        ? "bg-primary-600 hover:bg-primary-700"
                        : "bg-secondary-300 cursor-not-allowed"
                    } text-white font-bold py-4 rounded-2xl active:scale-95`}
                    onClick={handleRegisterClick}
                    disabled={user?.role !== "student"}
                  >
                    {user?.role === "student"
                      ? "Register Now"
                      : "Registration Only for Students"}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircleIcon className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Confirm Registration
            </h2>
            <p className="text-secondary-500 mb-10 max-w-sm mx-auto">
              Please verify your details before confirming your registration for{" "}
              <span className="text-primary-600 font-bold">{event.title}</span>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
              <div className="bg-white border border-secondary-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 text-secondary-400 mb-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Student Name
                  </span>
                </div>
                <p className="text-lg font-bold text-secondary-900">
                  {user?.name || "N/A"}
                </p>
              </div>
              <div className="bg-white border border-secondary-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 text-secondary-400 mb-2">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    College/Institution
                  </span>
                </div>
                <p className="text-lg font-bold text-secondary-900">
                  {user?.college || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-primary-600 disabled:opacity-50"
                onClick={handleConfirmRegistration}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    CONFIRMING...
                  </div>
                ) : (
                  "CONFIRM & REGISTER"
                )}
              </button>
              <button
                className="px-8 py-4 border-2 border-secondary-100 text-secondary-500 font-bold hover:bg-secondary-50 rounded-2xl"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EventDetailsModal;
