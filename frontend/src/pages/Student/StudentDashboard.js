import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold w-fit">
              Welcome back
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Student Dashboard</h1>
              <p className="text-slate-300 text-sm sm:text-base">
                Hello {user?.name || 'Student'}, manage your event journey with a clean, modern workspace.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/student/events"
              className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/20 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-indigo-300 text-3xl">📅</div>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/30">Explore</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Browse Events</h3>
              <p className="text-sm text-slate-300">
                Discover upcoming symposiums, read details, and pick what excites you.
              </p>
            </Link>

            <Link
              to="/student/enrollments"
              className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/20 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-emerald-300 text-3xl">📋</div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-500/30">Manage</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">My Enrollments</h3>
              <p className="text-sm text-slate-300">
                Track your registrations, participant IDs, and team details in one place.
              </p>
            </Link>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-indigo-300 text-3xl">👤</div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">Profile</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Your Details</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p><span className="text-slate-400">Name:</span> {user?.name || 'N/A'}</p>
                <p><span className="text-slate-400">Email:</span> {user?.email || 'N/A'}</p>
                <p><span className="text-slate-400">College:</span> {user?.college || 'N/A'}</p>
                <p><span className="text-slate-400">Mobile:</span> {user?.mobile || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


