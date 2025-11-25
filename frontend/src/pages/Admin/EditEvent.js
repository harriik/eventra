import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { eventsAPI, adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about: '',
    date: '',
    venue: '',
    team_size: 1,
    total_prize: '',
    coordinator_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [coordinatorLoading, setCoordinatorLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchCoordinators();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getById(id);
      const eventData = response.data;
      setEvent(eventData);
      
      // Format date for datetime-local input
      const date = new Date(eventData.date);
      const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        about: eventData.about || '',
        date: formattedDate,
        venue: eventData.venue || '',
        team_size: eventData.team_size || 1,
        total_prize: eventData.total_prize || '',
        coordinator_ids: eventData.coordinator_ids?.map(c => c._id || c) || []
      });
    } catch (error) {
      toast.error('Failed to load event');
      console.error(error);
      navigate('/admin/dashboard');
    }
  };

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

    try {
      await eventsAPI.update(id, formData);
      toast.success('Event updated successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoordinators = async () => {
    if (formData.coordinator_ids.length === 0) {
      toast.error('Please select at least one coordinator');
      return;
    }

    setCoordinatorLoading(true);
    try {
      await eventsAPI.reassignCoordinators(id, formData.coordinator_ids);
      toast.success('Coordinators reassigned successfully!');
      fetchEvent();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reassign coordinators');
      console.error(error);
    } finally {
      setCoordinatorLoading(false);
    }
  };

  const handleRemoveCoordinator = async (coordinatorId) => {
    if (!window.confirm('Are you sure you want to remove this coordinator?')) return;

    try {
      await eventsAPI.removeCoordinator(id, coordinatorId);
      toast.success('Coordinator removed successfully!');
      fetchEvent();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove coordinator');
      console.error(error);
    }
  };

  if (!event) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
            <p className="mt-2 text-gray-600">Update event details and manage coordinators</p>
          </div>

          {/* Coordinator Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Manage Coordinators</h2>
            
            {/* Current Coordinators */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Coordinators</h3>
              {event.coordinator_ids && event.coordinator_ids.length > 0 ? (
                <div className="space-y-2">
                  {event.coordinator_ids.map((coordinator) => (
                    <div key={coordinator._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-semibold">{coordinator.name}</p>
                        <p className="text-sm text-gray-600">📧 {coordinator.email}</p>
                        {coordinator.mobile && (
                          <p className="text-sm text-gray-600">📱 {coordinator.mobile}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveCoordinator(coordinator._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No coordinators assigned</p>
              )}
            </div>

            {/* Assign/Reassign Coordinators */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Assign/Reassign Coordinators</h3>
              {coordinators.length === 0 ? (
                <p className="text-sm text-gray-500">No coordinators available</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 mb-4">
                  {coordinators.map((coordinator) => (
                    <label key={coordinator._id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.coordinator_ids.includes(coordinator._id)}
                        onChange={() => handleCoordinatorChange(coordinator._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">
                        {coordinator.name} ({coordinator.email})
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <button
                onClick={handleAssignCoordinators}
                disabled={coordinatorLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm"
              >
                {coordinatorLoading ? 'Updating...' : 'Reassign Coordinators'}
              </button>
            </div>
          </div>

          {/* Event Details Form */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">Event Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                  About the Event *
                </label>
                <textarea
                  id="about"
                  name="about"
                  rows="4"
                  required
                  value={formData.about}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                    Venue *
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="team_size" className="block text-sm font-medium text-gray-700">
                    Team Size
                  </label>
                  <input
                    type="number"
                    id="team_size"
                    name="team_size"
                    min="1"
                    value={formData.team_size}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="total_prize" className="block text-sm font-medium text-gray-700">
                    Total Prize
                  </label>
                  <input
                    type="text"
                    id="total_prize"
                    name="total_prize"
                    value={formData.total_prize}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Event'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
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

export default EditEvent;



