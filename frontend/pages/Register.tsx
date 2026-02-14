
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';

interface RegisterProps {
  onLogin: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    role: UserRole.STUDENT
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const newUser = await authService.register(formData);
      onLogin(newUser);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
           <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 text-2xl">
            <i className="fas fa-user-plus"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-1">Join CampusEventHub today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="email@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">College/University</label>
            <input
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="College Name"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                <select 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <option value={UserRole.STUDENT}>Student</option>
                  <option value={UserRole.COLLEGE_ADMIN}>College Admin</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg mt-4 transition-all ${loading ? 'opacity-50' : 'hover:bg-indigo-700'}`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
