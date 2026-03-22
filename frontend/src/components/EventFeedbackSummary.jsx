import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StarIcon, ChatBubbleLeftIcon, ChartBarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Modal from "./ui/Modal";
import AuthContext from "../context/AuthContext";

const EventFeedbackSummary = ({ eventId, eventTitle }) => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [eventId]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`/api/v1/feedback/${eventId}/summary`);
      setSummary(response.data.data);
    } catch (error) {
      console.error("Failed to fetch feedback summary", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-8 w-24 bg-secondary-50 rounded-lg shrink-0"></div>;
  if (!summary) return <span className="text-[10px] text-secondary-400 font-bold">N/A</span>;

  return (
    <>
      <div className="flex flex-col gap-2 min-w-max">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-black text-secondary-600 uppercase">
             <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
             {summary.averageRating.toFixed(1)} avg
          </span>
          <span className="text-secondary-300">|</span>
          <span className="flex items-center gap-1 text-[10px] font-black text-secondary-600 uppercase">
             <ChatBubbleLeftIcon className="w-3 h-3 text-blue-500" />
             {summary.totalComments} comments
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors w-max"
        >
          <ChartBarIcon className="w-3 h-3" /> View Details
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="max-w-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-secondary-900 leading-tight">
              Feedback: {eventTitle}
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="text-secondary-400 hover:text-secondary-600">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-secondary-900">{summary.averageRating.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1 text-center">
                Average Rating<br/>out of 5
              </span>
            </div>
            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 flex flex-col justify-center">
              {[5, 4, 3, 2, 1].map(star => {
                const count = summary.breakdown[star] || 0;
                const percentage = summary.totalRatings > 0 ? (count / summary.totalRatings) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-bold w-4 text-secondary-600">{star}★</span>
                    <div className="flex-grow h-1.5 bg-secondary-200 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-secondary-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-black text-secondary-900 text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
              <ChatBubbleLeftIcon className="w-4 h-4 text-primary-500" /> Recent Comments
            </h4>
            <div className="space-y-3">
              {summary.recentComments.length === 0 ? (
                <p className="text-sm text-secondary-500 italic">No comments yet.</p>
              ) : (
                summary.recentComments.map(c => (
                  <div key={c._id} className="bg-white border border-secondary-100 p-3 rounded-xl shadow-sm">
                    <p className="text-sm text-secondary-700 mb-2">{c.comment}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{c.userName}</span>
                      <span className="text-[10px] font-semibold text-secondary-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EventFeedbackSummary;
