import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { attendanceAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AttendanceStats = () => {
  const { eventId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [eventId]);

  const fetchStats = async () => {
    try {
      const response = await attendanceAPI.getByEvent(eventId);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load attendance stats');
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
            <p className="mt-4 text-slate-300">Loading stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Link
            to="/coordinator/dashboard"
            className="text-indigo-300 hover:text-indigo-200 mb-2 inline-flex items-center gap-2 text-sm font-semibold"
          >
            ← Back to Dashboard
          </Link>

          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold w-fit">
              Coordinator · Stats
            </span>
            <h1 className="text-3xl font-bold text-white">Attendance Statistics</h1>
            <p className="text-slate-300 text-sm sm:text-base">{data.event.title}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 mb-2">Total Registered</p>
              <p className="text-3xl font-bold text-indigo-300">{data.summary.total_registered}</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 mb-2">Present</p>
              <p className="text-3xl font-bold text-emerald-300">{data.summary.present}</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 mb-2">Absent</p>
              <p className="text-3xl font-bold text-red-300">{data.summary.absent}</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 mb-2">Attendance %</p>
              <p className="text-3xl font-bold text-purple-300">{data.summary.attendance_percentage}%</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Detailed Attendance</h2>
            </div>
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
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-800">
                {data.attendance.map((record) => (
                  <tr key={record.registration_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-200">
                      {record.participant_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {record.college}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'Present' ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30' :
                        record.status === 'Absent' ? 'bg-red-500/15 text-red-200 border border-red-500/30' :
                        'bg-slate-700 text-slate-200 border border-slate-600'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;


