
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Registration, Event, RegistrationStatus } from '../types';
import { eventService } from '../services/eventService';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [allEvents, userRegs] = await Promise.all([
          eventService.getEvents(),
          eventService.getRegistrations(user.id)
        ]);
        setEvents(allEvents);
        setRegistrations(userRegs);
      } catch (err) {
        setError('Failed to connect to server. Check your backend status.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user.id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}</h1>
        <p className="text-slate-500 mt-1">Manage your event participations</p>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{registrations.length}</p>
            <p className="text-slate-400 text-sm font-medium">Registrations</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b">
          <h2 className="text-xl font-bold text-slate-900">My Events</h2>
        </div>
        <div className="p-8">
          {registrations.length > 0 ? (
            <div className="space-y-6">
              {registrations.map(reg => {
                const event = events.find(e => e.id === reg.event_id);
                if (!event) return null;
                return (
                  <div key={reg.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl border border-slate-50">
                    <div className="flex items-center gap-5">
                      <img src={event.imageUrl || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-2xl object-cover" alt="event" />
                      <div>
                        <Link to={`/events/${event.id}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600">
                          {event.title}
                        </Link>
                        <p className="text-sm text-slate-500">{event.college_name}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase ${
                      reg.status === RegistrationStatus.PENDING ? 'bg-orange-50 text-orange-600' :
                      reg.status === RegistrationStatus.APPROVED ? 'bg-green-50 text-green-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>You haven't registered for any events yet.</p>
              <Link to="/" className="text-indigo-600 font-bold hover:underline mt-4 block">Browse Events</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
