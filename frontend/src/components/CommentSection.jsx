import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import { TrashIcon } from "@heroicons/react/24/outline";

const CommentSection = ({ eventId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/v1/feedback/${eventId}/comments`);
      setComments(response.data.data.comments);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/v1/feedback/${eventId}/comment`, {
        comment: newComment,
      });
      setComments([response.data.data.comment, ...comments]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    
    try {
      await axios.delete(`/api/v1/feedback/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-secondary-100 p-6 sm:p-8 mt-6 max-w-2xl mx-auto shadow-sm">
      <h3 className="font-black text-secondary-900 text-lg mb-6 flex items-center gap-2">
        <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-xl text-sm">
          {comments.length}
        </span>
        Comments
      </h3>

      <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <p className="text-secondary-400 text-sm text-center py-8 font-medium">
            No comments yet. Be the first to start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center flex-shrink-0 border border-secondary-200 shadow-sm text-primary-700 font-bold uppercase">
                {comment.userId?.name?.charAt(0) || "U"}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-secondary-900 leading-tight">
                      {comment.userId?.name || "Unknown"}
                    </span>
                    {comment.userId?.college && (
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider bg-secondary-50 px-2 py-0.5 rounded-md">
                        {comment.userId.college}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-secondary-700 mt-1 leading-relaxed">
                  {comment.comment}
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[11px] font-semibold text-secondary-400">
                    {formatTime(comment.createdAt)}
                  </span>
                  
                  {user && (user._id === comment.userId?._id || user.role === "superAdmin") && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-[11px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      <TrashIcon className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-secondary-100">
        {user ? (
          <form onSubmit={handlePostComment} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center flex-shrink-0 shadow-md text-white font-bold uppercase">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="flex-grow relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-secondary-50 border border-secondary-200 rounded-2xl px-4 py-3 text-sm text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none transition-all"
                rows="2"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] font-bold text-secondary-400">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary-200"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 bg-secondary-50 rounded-2xl border border-secondary-100 border-dashed">
            <p className="text-sm font-semibold text-secondary-500">
              Please <a href="/login" className="text-primary-600 hover:underline">log in</a> to join the conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
