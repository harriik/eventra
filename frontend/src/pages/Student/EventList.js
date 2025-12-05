import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { eventsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
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
            <p className="mt-4 text-slate-300">Loading events...</p>
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
              Explore events
            </span>
            <h1 className="text-3xl font-bold text-white">Available Events</h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Browse and enroll in symposium events with a modern, unified experience.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-lg text-center">
              <p className="text-slate-300">No events available at the moment.</p>
              <p className="text-slate-500 text-sm mt-2">Check back soon for new symposiums.</p>
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
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                      {event.venue || 'Venue'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-4 line-clamp-3">{event.description}</p>
                  <div className="mb-4 space-y-1 text-sm text-slate-400">
                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                    <p>📍 {event.venue || 'TBD'}</p>
                  </div>
                  <Link
                    to={`/student/events/${event._id}`}
                    className="inline-block w-full text-center bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition text-sm font-semibold shadow-md shadow-indigo-500/20"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;


