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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading enrollments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
            <p className="mt-2 text-gray-600">View your registered events and participant IDs</p>
          </div>

          {registrations.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600 mb-4">You haven't enrolled in any events yet.</p>
              <a
                href="/student/events"
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Browse Events →
              </a>
            </div>
          ) : (
            <div className="grid gap-6">
              {registrations.map((registration) => (
                <div key={registration._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{registration.event_id?.title}</h3>
                      <p className="text-gray-600">{registration.event_id?.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(registration.attendance)}`}>
                      {registration.attendance}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Participant ID</p>
                      <p className="font-semibold text-indigo-600">{registration.participant_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Event Date</p>
                      <p className="font-semibold">
                        {new Date(registration.event_id?.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Venue</p>
                      <p className="font-semibold">{registration.event_id?.venue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registered On</p>
                      <p className="font-semibold">
                        {new Date(registration.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {registration.team_info && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm text-gray-500 mb-1">
                        Team:{' '}
                        <span className="font-semibold text-gray-900">
                          {registration.team_info.team_name}
                        </span>
                      </p>
                      {registration.team_info.teammates.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Teammates:</p>
                          <div className="flex flex-wrap gap-2">
                            {registration.team_info.teammates.map((mate) => (
                              <span
                                key={mate.id}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-xs font-medium text-indigo-700"
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


