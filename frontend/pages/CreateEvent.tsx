
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { User } from '../types';

interface CreateEventProps {
  user: User;
}

const CreateEvent: React.FC<CreateEventProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hackathon',
    location: '',
    start_date: '',
    end_date: '',
    imageUrl: `https://picsum.photos/seed/${Math.random()}/800/400`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await eventService.createEvent({
        ...formData,
        college_id: user.id,
        college_name: user.college,
        category: formData.category as any
      });
      navigate('/admin-dashboard');
    } catch (err) {
      alert('Failed to create event. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Host New Event</h1>
          <p className="text-slate-500 mt-2">Publish an event to all colleges</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
              <input
                required
                className="w-full px-5 py-3 border border-slate-200 rounded-xl outline-none"
                placeholder="Symposium 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            {/* ... other fields remain similar ... */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select
                className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="hackathon">Hackathon</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
              <input
                required
                className="w-full px-5 py-3 border border-slate-200 rounded-xl outline-none"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <input
                type="datetime-local"
                required
                className="w-full px-5 py-3 border border-slate-200 rounded-xl"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
              <input
                type="datetime-local"
                required
                className="w-full px-5 py-3 border border-slate-200 rounded-xl"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold">
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
