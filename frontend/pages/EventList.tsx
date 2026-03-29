
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { Event, User } from '../types';

interface EventListProps {
  user: User | null;
}

const EventList: React.FC<EventListProps> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
      setLoading(false);
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.description.toLowerCase().includes(search.toLowerCase()) ||
                          e.college_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || e.category === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Events</h1>
          <p className="text-slate-500 mt-1">Discover and register for exciting inter-college events</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Sports', 'Hackathon', 'Cultural', 'Workshop'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search events, colleges, or topics..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-slate-500 mt-4 font-medium">Fetching events from database...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(event => (
            <Link 
              to={`/events/${event.id}`} 
              key={event.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-48">
                <img 
                  src={event.imageUrl || 'https://via.placeholder.com/800x400'} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
                    {event.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-2">{event.college_name}</p>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{event.title}</h3>
                <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <i className="far fa-calendar-alt text-indigo-400"></i>
                    {new Date(event.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <i className="fas fa-map-marker-alt text-indigo-400"></i>
                    {event.location}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <h3 className="text-xl font-bold text-slate-900">No events found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or category filters</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
