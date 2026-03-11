
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Registration, RegistrationStatus, Event } from '../types';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [regData, eventData] = await Promise.all([
          eventService.getRegistrations(),
          eventService.getEvents()
        ]);
        // Note: For User data, in a real app, you'd have an admin endpoint like GET /api/admin/users
        setRegistrations(regData);
        setEvents(eventData);
        setUsers([user]); // Simple fallback for now
      } catch (err) {
        setError('Failed to fetch admin data. Check backend.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleStatusUpdate = async (regId: string, status: RegistrationStatus) => {
    try {
      await eventService.updateRegistrationStatus(regId, status);
      // Optimistic update
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status } : r));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const chartData = [
    { name: 'Jan', regs: 400 },
    { name: 'Feb', regs: 1200 },
    { name: 'Mar', regs: registrations.length * 10 || 800 },
  ];

  if (loading) return <div className="py-20 text-center"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 mx-auto rounded-full"></div></div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage Campus Event Hub</p>
        </div>
        <Link to="/create-event" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100">
          <i className="fas fa-plus mr-2"></i> Create Event
        </Link>
      </header>

      {error && <div className="bg-red-50 p-4 rounded-xl text-red-700">{error}</div>}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b px-8 py-2 flex gap-8">
          {['Overview', 'Registrations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-bold transition-all relative ${
                activeTab === tab ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'Overview' && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip />
                  <Bar dataKey="regs" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'Registrations' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-4">Event ID</th>
                    <th className="pb-4">User ID</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map(reg => (
                    <tr key={reg.id} className="group">
                      <td className="py-4 text-sm">{reg.event_id}</td>
                      <td className="py-4 text-sm">{reg.user_id}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                          reg.status === RegistrationStatus.PENDING ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button onClick={() => handleStatusUpdate(reg.id, RegistrationStatus.APPROVED)} className="text-green-600 hover:bg-green-50 p-2 rounded">
                          <i className="fas fa-check"></i>
                        </button>
                        <button onClick={() => handleStatusUpdate(reg.id, RegistrationStatus.REJECTED)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registrations.length === 0 && <p className="text-center py-10 text-slate-400">No registrations found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
