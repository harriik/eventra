import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { registrationsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ParticipantList = () => {
  const { eventId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const fetchParticipants = async () => {
    try {
      const response = await registrationsAPI.getEventParticipants(eventId);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load participants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              Coordinator · Participants
            </span>
            <h1 className="text-3xl font-bold text-white">{data.event.title}</h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Total Participants: {data.total} · Date: {new Date(data.event.date).toLocaleDateString()}
            </p>
          </div>

          {data.participants.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-lg text-center">
              <p className="text-slate-300">No participants registered for this event.</p>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
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
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                  {data.participants.map((participant) => (
                    <tr key={participant.registration_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-200">
                        {participant.participant_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {participant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {participant.college}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {participant.mobile}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(participant.attendance_status)}`}>
                          {participant.attendance_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantList;


