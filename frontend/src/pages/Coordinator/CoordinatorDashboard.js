import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll({ coordinatorId: user?._id });
      const serverFiltered = response.data || [];
      // Fallback filter if backend doesn't filter
      const myEvents = serverFiltered.filter((event) => {
        if (!event.coordinator_ids || event.coordinator_ids.length === 0) return false;
        return event.coordinator_ids.some((coord) => {
          const id = coord._id || coord;
          return id?.toString() === user?._id?.toString();
        });
      });
      setEvents(myEvents);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load events');
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
            <p className="mt-4 text-slate-300">Loading your events...</p>
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
              Coordinator Space
            </span>
            <h1 className="text-3xl font-bold text-white">Coordinator Dashboard</h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Welcome, {user?.name}. Manage participants and attendance for your assigned events.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 p-10 rounded-2xl shadow-lg text-center">
              <p className="text-slate-300">You are not assigned to any events yet.</p>
              <p className="text-slate-500 text-sm mt-2">Contact admin to get assigned as a coordinator.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-indigo-500/20 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/30">
                      Live
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-4 line-clamp-3">{event.description}</p>
                  <div className="mb-4 space-y-1 text-sm text-slate-400">
                    <p>📅 {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</p>
                    <p>📍 {event.venue || 'Venue TBD'}</p>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to={`/coordinator/events/${event._id}/participants`}
                      className="block w-full text-center bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition text-sm font-semibold"
                    >
                      View Participants
                    </Link>
                    <Link
                      to={`/coordinator/events/${event._id}/attendance`}
                      className="block w-full text-center bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-400 transition text-sm font-semibold"
                    >
                      Mark Attendance
                    </Link>
                    <Link
                      to={`/coordinator/events/${event._id}/stats`}
                      className="block w-full text-center bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-400 transition text-sm font-semibold"
                    >
                      View Stats
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;