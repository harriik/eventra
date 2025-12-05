import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { eventsAPI, adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [coordinators, setCoordinators] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about: '',
    date: '',
    venue: '',
    team_size: 1,
    min_team_size: 1,
    max_team_size: 1,
    total_prize: '',
    coordinator_ids: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const response = await adminAPI.getUsers({ role: 'coordinator' });
      setCoordinators(response.data);
    } catch (error) {
      toast.error('Failed to load coordinators');
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 1 : value
    });
  };

  const handleCoordinatorChange = (coordinatorId) => {
    const isChecked = formData.coordinator_ids.includes(coordinatorId);
    setFormData({
      ...formData,
      coordinator_ids: isChecked
        ? formData.coordinator_ids.filter(id => id !== coordinatorId)
        : [...formData.coordinator_ids, coordinatorId]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate min <= max
    if (formData.min_team_size > formData.max_team_size) {
      toast.error('Min team size cannot be greater than max team size');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        about: formData.about,
        date: formData.date,
        venue: formData.venue,
        min_team_size: formData.min_team_size,
        max_team_size: formData.max_team_size,
        team_size: formData.max_team_size, // Set to max for backward compatibility
        total_prize: formData.total_prize || 'N/A',
        coordinator_ids: formData.coordinator_ids.length > 0 ? formData.coordinator_ids : []
      };
      await eventsAPI.create(submitData);
      toast.success('Event created successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold w-fit">
              Admin · Events
            </span>
            <h1 className="text-3xl font-bold text-white">Create Event</h1>
            <p className="text-slate-300 text-sm sm:text-base">Publish a new symposium or workshop.</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-200">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-200">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description of the event"
                />
              </div>

              <div>
                <label htmlFor="about" className="block text-sm font-medium text-slate-200">
                  About the Event *
                </label>
                <textarea
                  id="about"
                  name="about"
                  rows="4"
                  required
                  value={formData.about}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Detailed information about the event"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-slate-200">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-slate-200">
                    Venue *
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="min_team_size" className="block text-sm font-medium text-slate-200">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    id="min_team_size"
                    name="min_team_size"
                    min="1"
                    value={formData.min_team_size}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="max_team_size" className="block text-sm font-medium text-slate-200">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    id="max_team_size"
                    name="max_team_size"
                    min="1"
                    value={formData.max_team_size}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="team_size" className="block text-sm font-medium text-slate-200">
                    Team Size (Legacy)
                  </label>
                  <input
                    type="number"
                    id="team_size"
                    name="team_size"
                    min="1"
                    value={formData.team_size}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Auto-set from max"
                  />
                  <p className="text-xs text-slate-500 mt-1">Will be set to max team size</p>
                </div>

                <div>
                  <label htmlFor="total_prize" className="block text-sm font-medium text-slate-200">
                    Total Prize
                  </label>
                  <input
                    type="text"
                    id="total_prize"
                    name="total_prize"
                    value={formData.total_prize}
                    onChange={handleChange}
                    placeholder="e.g., ₹50,000 or N/A"
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Assign Coordinators (Optional)
                </label>
                {coordinators.length === 0 ? (
                  <p className="text-sm text-slate-400">No coordinators available</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-700 rounded-lg p-3 bg-slate-900/60">
                    {coordinators.map((coordinator) => (
                      <label key={coordinator._id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.coordinator_ids.includes(coordinator._id)}
                          onChange={() => handleCoordinatorChange(coordinator._id)}
                          className="rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-200">
                          {coordinator.name} ({coordinator.email})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-xl hover:bg-indigo-400 transition disabled:opacity-60 shadow-lg shadow-indigo-500/20 text-sm font-semibold"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex-1 bg-slate-800 text-slate-100 px-6 py-3 rounded-xl hover:bg-slate-700 transition border border-slate-700 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;

