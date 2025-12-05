import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminReports = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getEventStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading reports...</p>
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
              Admin · Reports
            </span>
            <h1 className="text-3xl font-bold text-white">Event Reports & Statistics</h1>
            <p className="text-slate-300 text-sm sm:text-base">Comprehensive event-wise enrollment and attendance stats.</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
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
                      Total Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Not Marked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                  {stats.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-slate-400">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    stats.map((event) => (
                      <tr key={event.event_id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-white">{event.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-200">
                          {event.total_registered}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-200">
                          {event.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-200">
                          {event.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-300">
                          {event.not_marked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          <span className={`px-2 py-1 rounded-full ${
                            parseFloat(event.attendance_percentage) >= 80 
                              ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30'
                              : parseFloat(event.attendance_percentage) >= 50
                              ? 'bg-yellow-500/15 text-yellow-200 border border-yellow-500/30'
                              : 'bg-red-500/15 text-red-200 border border-red-500/30'
                          }`}>
                            {event.attendance_percentage}%
                          </span>
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

export default AdminReports;


