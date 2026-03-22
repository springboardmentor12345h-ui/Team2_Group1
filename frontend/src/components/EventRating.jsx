import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const EventRating = ({ eventId, currentUserId }) => {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    fetchRating();
  }, [eventId, currentUserId]);

  const fetchRating = async () => {
    try {
      // Append userId if available so the backend marks userRating
      const url = `/api/v1/feedback/${eventId}/rating${currentUserId ? `?userId=${currentUserId}` : ''}`;
      const response = await axios.get(url);
      setRatingData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch rating", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (value) => {
    if (!currentUserId) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/v1/feedback/${eventId}/rate`, {
        rating: value,
      });
      setRatingData(response.data.data);
      setShowThanks(true);
      setTimeout(() => setShowThanks(false), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !ratingData) {
    return (
      <div className="animate-pulse bg-secondary-50 rounded-3xl h-48 max-w-2xl mx-auto mt-6"></div>
    );
  }

  const { averageRating, totalRatings, userRating, breakdown } = ratingData;
  const userStars = userRating || 0;
  
  return (
    <div className="bg-white rounded-3xl border border-secondary-100 p-6 sm:p-8 mt-6 max-w-2xl mx-auto shadow-sm">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        
        {/* Left Side: Interactive Stars */}
        <div className="flex-1 flex flex-col items-center justify-center bg-secondary-50/50 rounded-2xl p-6 border border-secondary-100 w-full">
          <h3 className="font-black text-secondary-900 text-lg mb-4">
            Rate this Event
          </h3>
          
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={!currentUserId || isSubmitting}
                onMouseEnter={() => currentUserId && setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
              >
                {star <= (hoveredStar || userStars) ? (
                  <StarIconSolid className={`w-10 h-10 ${userStars > 0 && !hoveredStar ? 'text-orange-400' : 'text-yellow-400'} drop-shadow-sm transition-colors`} />
                ) : (
                  <StarIcon className={`w-10 h-10 ${currentUserId ? 'text-secondary-300 hover:text-yellow-400' : 'text-secondary-200'} transition-colors`} />
                )}
              </button>
            ))}
          </div>

          <div className="h-6">
            {!currentUserId ? (
              <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Login to rate this event</p>
            ) : showThanks ? (
              <p className="text-sm font-black text-success animate-fade-in-up">Thanks for rating!</p>
            ) : userStars > 0 ? (
              <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Your rating: <span className="text-orange-500 font-black">{userStars}/5</span></p>
            ) : (
              <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Select a star to rate</p>
            )}
          </div>
        </div>

        {/* Right Side: Overall Stats */}
        <div className="flex-1 w-full">
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black text-secondary-900 leading-none">
              {averageRating.toFixed(1)}
            </span>
            <div className="mb-1">
              <span className="text-sm font-bold text-secondary-400 uppercase tracking-widest block">/ 5</span>
              <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider inline-flex items-center gap-1 mt-0.5">
                <StarIconSolid className="w-3 h-3 text-yellow-400" />
                {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown[star] || 0;
              const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
              
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-secondary-600 w-4">{star}</span>
                  <StarIconSolid className="w-3.5 h-3.5 text-secondary-300 shrink-0" />
                  <div className="flex-grow h-2.5 bg-secondary-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-success/80 to-success rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-secondary-400 w-8 text-right tabular-nums">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EventRating;
