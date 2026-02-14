
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { Event, User, RegistrationStatus, Feedback } from '../types';

interface EventDetailsProps {
  user: User | null;
}

const EventDetails: React.FC<EventDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;
      try {
        const found = await eventService.getEventById(id);
        if (found) {
          setEvent(found);
          const feedbackData = await eventService.getFeedback(id);
          setFeedback(feedbackData);
          if (user) {
            const regs = await eventService.getRegistrations(user.id);
            const already = regs.some(r => r.event_id === id);
            setIsRegistered(already);
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to load event details. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    loadEventData();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (event) {
      try {
        await eventService.registerForEvent(event.id, user.id);
        setIsRegistered(true);
        alert('Registration successful! Your request is pending approval.');
      } catch (err) {
        alert('Registration failed. Please try again.');
      }
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;
    
    try {
      await eventService.addFeedback({
        event_id: event.id,
        user_id: user.id,
        user_name: user.name,
        rating,
        comments: newComment
      });
      setNewComment('');
      // Refresh feedback after adding
      const updatedFeedback = await eventService.getFeedback(event.id);
      setFeedback(updatedFeedback);
    } catch (err) {
      alert('Failed to post comment.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="text-red-500 text-5xl mb-4"><i className="fas fa-exclamation-triangle"></i></div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
      <p className="text-slate-600 mb-6">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">
        Retry
      </button>
    </div>
  );

  if (!event) return <div className="text-center py-20">Event not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
        <img src={event.imageUrl || 'https://via.placeholder.com/1200x600'} className="w-full h-full object-cover" alt={event.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <div className="flex gap-2 mb-4">
             <span className="bg-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
               {event.category}
             </span>
             <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
               {event.college_name}
             </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm font-medium opacity-90">
             <div className="flex items-center gap-2">
               <i className="fas fa-calendar"></i>
               {new Date(event.start_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
             </div>
             <div className="flex items-center gap-2">
               <i className="fas fa-map-marker-alt"></i>
               {event.location}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">About the Event</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed text-lg">
                {event.description}
              </p>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Comments ({feedback.length})</h2>
            
            {user && (
              <form onSubmit={handleSubmitFeedback} className="mb-10">
                <textarea
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  placeholder="Share your thoughts about this event..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
                <div className="flex justify-end mt-4">
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">
                    Post Comment
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {feedback.map((f, i) => (
                <div key={i} className="flex gap-4 border-b pb-6 last:border-0">
                  <div className="flex-grow">
                    <h4 className="font-bold text-slate-900">{f.user_name}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{f.comments}</p>
                  </div>
                </div>
              ))}
              {feedback.length === 0 && <p className="text-center text-slate-400 py-4">No comments yet.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-slate-900">Registration</h3>
            <button
              disabled={isRegistered}
              onClick={handleRegister}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                isRegistered 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
              }`}
            >
              {isRegistered ? 'Already Registered' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
