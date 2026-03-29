import React, { useContext, useState } from "react";
import Modal from "./ui/Modal";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
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
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";

const EventDetailsModal = ({ isOpen, onClose, event, onRegisterSuccess }) => {
  const { user } = useContext(AuthContext);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Details"); // New tab state
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  React.useEffect(() => {
    const fetchRealTimeData = async () => {
      if (!isOpen || !event?._id) return;
      setIsLoading(true);
      try {
        // 1. Fetch fresh event data (which now includes registrationCount in backend)
        const eventRes = await axios.get(`/api/v1/events/${event._id}`);
        setCurrentEvent(eventRes.data.data.event);

        // 2. Fetch registration status for current student
        if (user && user.role === "student") {
          const regRes = await axios.get("/api/v1/registrations/my-registrations");
          const registered = regRes.data.data.registrations.some(r => r.eventId._id === event._id);
          setIsRegistered(registered);
        }

        // 3. Fetch reviews
        const reviewsRes = await axios.get(`/api/v1/reviews/${event._id}`);
        setReviews(reviewsRes.data.data.reviews);
      } catch (error) {
        console.error("Failed to fetch real-time event data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealTimeData();
  }, [isOpen, event?._id, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please provide a rating");
    setIsSubmittingReview(true);
    try {
      await axios.post("/api/v1/reviews", {
        eventId: event._id,
        rating,
        comment,
      });
      toast.success("Review submitted successfully!");
      setComment("");
      // Refresh reviews
      const reviewsRes = await axios.get(`/api/v1/reviews/${event._id}`);
      setReviews(reviewsRes.data.data.reviews);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isOpen || !currentEvent) return null;

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
    try {
      await axios.post("/api/v1/registrations", { eventId: event._id });
      toast.success(`Successfully registered for ${event.title}!`);
      setIsRegistered(true);
      if (onRegisterSuccess) onRegisterSuccess();
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
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
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getCategoryColor(currentEvent.category)}`}
              >
                {currentEvent.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  new Date() > new Date(currentEvent.endDate)
                    ? "bg-red-600 text-white"
                    : new Date() >= new Date(currentEvent.startDate)
                      ? "bg-orange-50 text-orange-600 border-orange-100"
                      : "bg-success/10 text-success border-success/20"
                }`}
              >
                {new Date() > new Date(currentEvent.endDate)
                  ? "Completed"
                  : new Date() >= new Date(currentEvent.startDate)
                    ? "Ongoing"
                    : "Upcoming"}
              </span>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Content */}
        {!showConfirmation ? (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-secondary-900 mb-1">
                {currentEvent.title}
              </h2>
              <p className="text-secondary-500 font-medium">
                College: {currentEvent.collegeId?.college || "Global"}
              </p>
            </div>

            <div className="flex border-b border-secondary-100 mb-8">
              <button
                onClick={() => setActiveTab("Details")}
                className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === "Details" ? "text-primary-600 border-primary-600" : "text-secondary-400 border-transparent hover:text-secondary-600"}`}
              >
                Event Details
              </button>
              <button
                onClick={() => setActiveTab("Reviews")}
                className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === "Reviews" ? "text-primary-600 border-primary-600" : "text-secondary-400 border-transparent hover:text-secondary-600"}`}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            {activeTab === "Details" ? (
              <>
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
                      {new Date(currentEvent.startDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {new Date(currentEvent.startDate).toLocaleDateString("en-US", {
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
                      {currentEvent.location}
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
                       {currentEvent.registrationCount || 0} Registered
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
                    Registration required. Please bring your verified student ID.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrophyIcon className="w-5 h-5 text-primary-500" />
                    <h4 className="font-bold text-secondary-900 uppercase text-xs tracking-wider">
                      Recognition
                    </h4>
                  </div>
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    Digital merit certificates issued for all participants.
                  </p>
                </div>
              </div>
            </div>

                <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-100">
                  <h4 className="font-bold text-secondary-900 mb-2">Description</h4>
                  <p className="text-secondary-600 text-sm leading-relaxed">
                    {currentEvent.description}
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-8">
                {/* Review Form (Only for registered students on completed events) */}
                {user?.role === "student" && isRegistered && new Date() > new Date(currentEvent.endDate) && !reviews.some(r => r.user?._id === user._id) && (
                  <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                    <h4 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-primary-600" />
                      Rate this Event
                    </h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transform active:scale-90 transition-transform"
                          >
                            {star <= rating ? (
                              <StarIconSolid className="w-8 h-8 text-yellow-400" />
                            ) : (
                              <StarIcon className="w-8 h-8 text-secondary-300" />
                            )}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full h-24 p-4 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="bg-primary-600 text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-primary-700 disabled:opacity-50"
                      >
                        {isSubmittingReview ? "Submitting..." : "Post Review"}
                      </button>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev._id} className="flex gap-4 p-4 rounded-2xl bg-white border border-secondary-100">
                        <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-500 flex-shrink-0">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-bold text-secondary-900 text-sm">{rev.user?.name}</h5>
                            <span className="text-[10px] text-secondary-400 font-medium">
                              {rev.createdAt ? formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true }) : "recently"}
                            </span>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <StarIconSolid key={s} className={`w-3 h-3 ${s <= rev.rating ? "text-yellow-400" : "text-secondary-100"}`} />
                            ))}
                          </div>
                          <p className="text-secondary-600 text-sm leading-relaxed italic border-l-4 border-primary-100 pl-4 py-1">
                            "{rev.comment}"
                          </p>
                          <p className="text-[10px] text-secondary-400 mt-2 font-black uppercase tracking-widest opacity-60">Verified Attendee • {rev.user?.college}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-secondary-50 rounded-2xl border-2 border-dashed border-secondary-100">
                      <StarIcon className="w-12 h-12 text-secondary-200 mx-auto mb-4" />
                      <p className="text-secondary-400 font-medium italic">No reviews yet for this event.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(!user || user.role === "student") && (
              <div className="mt-8 flex gap-4">
                {new Date() > new Date(currentEvent.endDate) ? (
                  <div className="flex-1 bg-secondary-100 text-secondary-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-default border border-secondary-200">
                    <ClockIcon className="w-5 h-5" />
                    EVENT COMPLETED
                  </div>
                ) : isRegistered ? (
                  <div className="flex-1 bg-primary-100 text-primary-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-default border border-primary-200">
                    <CheckCircleIcon className="w-5 h-5" />
                    ALREADY REGISTERED
                  </div>
                ) : (
                  <button
                    className={`flex-1 ${
                      user?.role === "student"
                        ? "bg-primary-600 hover:bg-primary-700 font-black shadow-lg shadow-primary-200"
                        : "bg-secondary-300 cursor-not-allowed"
                    } text-white font-bold py-4 rounded-2xl active:scale-95 transition-all`}
                    onClick={handleRegisterClick}
                    disabled={user?.role !== "student"}
                  >
                    {user?.role === "student"
                      ? "Register Now"
                      : "Registration Restricted to Students"}
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
