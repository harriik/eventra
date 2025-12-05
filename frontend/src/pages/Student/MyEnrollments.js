import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { registrationsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const MyEnrollments = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await registrationsAPI.getMyRegistrations();
      setRegistrations(response.data);
    } catch (error) {
      toast.error('Failed to load enrollments');
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
            <p className="mt-4 text-slate-300">Loading enrollments...</p>
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
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold w-fit">
              Your events
            </span>
            <h1 className="text-3xl font-bold text-white">My Enrollments</h1>
            <p className="text-slate-300 text-sm sm:text-base">View your registered events and participant IDs.</p>
          </div>

          {registrations.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-lg text-center">
              <p className="text-slate-300 mb-3">You haven't enrolled in any events yet.</p>
              <a
                href="/student/events"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition shadow-md shadow-indigo-500/20"
              >
                Browse Events →
              </a>
            </div>
          ) : (
            <div className="grid gap-6">
              {registrations.map((registration) => (
                <div key={registration._id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{registration.event_id?.title}</h3>
                      <p className="text-slate-300 text-sm">{registration.event_id?.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(registration.attendance)}`}>
                      {registration.attendance}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-slate-300">
                    <div>
                      <p className="text-slate-400">Participant ID</p>
                      <p className="font-semibold text-indigo-200">{registration.participant_id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Event Date</p>
                      <p className="font-semibold">
                        {new Date(registration.event_id?.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Venue</p>
                      <p className="font-semibold">{registration.event_id?.venue}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Registered On</p>
                      <p className="font-semibold">
                        {new Date(registration.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {registration.team_info && (
                    <div className="mt-4 border-t border-slate-800 pt-4">
                      <p className="text-sm text-slate-400 mb-1">
                        Team:{' '}
                        <span className="font-semibold text-slate-100">
                          {registration.team_info.team_name}
                        </span>
                      </p>
                      {registration.team_info.teammates.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Teammates:</p>
                          <div className="flex flex-wrap gap-2">
                            {registration.team_info.teammates.map((mate) => (
                              <span
                                key={mate.id}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-xs font-medium text-indigo-200"
                              >
                                {mate.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEnrollments;


