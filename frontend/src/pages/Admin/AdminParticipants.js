import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { registrationsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminParticipants = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    event_id: '',
    college: ''
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await registrationsAPI.getAll(filters);
      setRegistrations(response.data);
    } catch (error) {
      toast.error('Failed to load participants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchRegistrations();
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading participants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold w-fit">
              Admin · Participants
            </span>
            <h1 className="text-3xl font-bold text-white">All Participants</h1>
            <p className="text-slate-300 text-sm sm:text-base">View and filter all event registrations.</p>
          </div>

          {/* Filters */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Event ID
                </label>
                <input
                  type="text"
                  name="event_id"
                  value={filters.event_id}
                  onChange={handleFilterChange}
                  placeholder="Filter by event ID"
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  College
                </label>
                <input
                  type="text"
                  name="college"
                  value={filters.college}
                  onChange={handleFilterChange}
                  placeholder="Filter by college"
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleApplyFilters}
                  className="w-full bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition shadow-md shadow-indigo-500/20 text-sm font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Participant ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      College
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Registered On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-slate-400">
                        No registrations found
                      </td>
                    </tr>
                  ) : (
                    registrations.map((registration) => (
                      <tr key={registration._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-200">
                          {registration.participant_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                          {registration.user_id?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {registration.user_id?.college}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <div className="font-medium text-slate-100">{registration.event_id?.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(registration.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminParticipants;


