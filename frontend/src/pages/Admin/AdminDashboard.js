import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI, eventsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-64 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 h-max">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wide text-slate-500">Admin</p>
                <p className="text-lg font-semibold text-white">Control Center</p>
              </div>
              <div className="space-y-2 text-sm text-slate-200">
                <Link to="/admin/dashboard" className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20">
                  <span>Overview</span>
                  <span className="text-xs text-indigo-200">Now</span>
                </Link>
                <Link to="/admin/events/create" className="block px-3 py-2 rounded-xl hover:bg-slate-800/80 border border-slate-800">
                  Create Event
                </Link>
                <Link to="/admin/coordinators/new" className="block px-3 py-2 rounded-xl hover:bg-slate-800/80 border border-slate-800">
                  Add Coordinator
                </Link>
                <Link to="/admin/participants" className="block px-3 py-2 rounded-xl hover:bg-slate-800/80 border border-slate-800">
                  Participants
                </Link>
                <Link to="/admin/reports" className="block px-3 py-2 rounded-xl hover:bg-slate-800/80 border border-slate-800">
                  Reports
                </Link>
              </div>
            </aside>

            <main className="flex-1 space-y-8">
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold w-fit">
                  Admin Dashboard
                </span>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Overview & Analytics</h1>
                    <p className="text-slate-300 text-sm sm:text-base">
                      Monitor events, coordinators, registrations, and attendance performance.
                    </p>
                  </div>
                  <button
                    onClick={fetchDashboard}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-100 hover:bg-slate-800 transition text-sm font-semibold"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <p className="text-xs text-slate-400 mb-2">Total Students</p>
                  <p className="text-3xl font-bold text-indigo-300">{stats?.stats.total_students || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Active in the system</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <p className="text-xs text-slate-400 mb-2">Total Events</p>
                  <p className="text-3xl font-bold text-blue-300">{stats?.stats.total_events || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Live & upcoming</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <p className="text-xs text-slate-400 mb-2">Registrations</p>
                  <p className="text-3xl font-bold text-emerald-300">{stats?.stats.total_registrations || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Across all events</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <p className="text-xs text-slate-400 mb-2">Attendance %</p>
                  <p className="text-3xl font-bold text-purple-300">{stats?.stats.overall_attendance_percentage || 0}%</p>
                  <p className="text-xs text-slate-500 mt-1">Overall average</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/admin/events/create"
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/20 transition"
                >
                  <div className="text-indigo-300 text-3xl mb-3">➕</div>
                  <h3 className="text-lg font-semibold text-white mb-1">Create Event</h3>
                  <p className="text-sm text-slate-300">Publish a new symposium or workshop.</p>
                </Link>
                <Link
                  to="/admin/coordinators/new"
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/20 transition"
                >
                  <div className="text-indigo-300 text-3xl mb-3">🧑‍🏫</div>
                  <h3 className="text-lg font-semibold text-white mb-1">Add Coordinator</h3>
                  <p className="text-sm text-slate-300">Create coordinator accounts instantly.</p>
                </Link>
                <Link
                  to="/admin/participants"
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/20 transition"
                >
                  <div className="text-indigo-300 text-3xl mb-3">👥</div>
                  <h3 className="text-lg font-semibold text-white mb-1">Participants</h3>
                  <p className="text-sm text-slate-300">Review registrations and status.</p>
                </Link>
                <Link
                  to="/admin/reports"
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/20 transition"
                >
                  <div className="text-indigo-300 text-3xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold text-white mb-1">Reports</h3>
                  <p className="text-sm text-slate-300">Download attendance & enrollment data.</p>
                </Link>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Events Overview</h2>
                    <p className="text-xs text-slate-400">Monitor assignments and attendance</p>
                  </div>
                  <button
                    onClick={fetchDashboard}
                    className="text-xs px-3 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                  >
                    Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Coordinator
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Attendance %
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {stats?.events.map((event) => (
                        <tr key={event._id || event.event_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-white">{event.title}</div>
                            <div className="text-xs text-slate-400">{event.event_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {event.coordinator || 'Not assigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {event.participants_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-200">
                            {event.attendance_percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/admin/events/edit/${event._id || event.event_id}`}
                                className="text-indigo-300 hover:text-indigo-200"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={async () => {
                                  if (!window.confirm('Delete this event? This action cannot be undone.')) return;
                                  try {
                                    await eventsAPI.delete(event._id || event.event_id);
                                    toast.success('Event deleted successfully');
                                    fetchDashboard();
                                  } catch (error) {
                                    toast.error('Failed to delete event');
                                    console.error(error);
                                  }
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


