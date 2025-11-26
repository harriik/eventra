import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ManageCoordinators = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    college: '',
    roll_no: ''
  });
  const [createdPassword, setCreatedPassword] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCreatedPassword(null);
    try {
      const res = await adminAPI.createCoordinator(form);
      toast.success('Coordinator created successfully');
      setCreatedPassword(res.data.generated_password);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coordinator');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add Coordinator</h1>
            <p className="mt-2 text-gray-600">
              Create a new coordinator account with an auto-generated password.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll No *
                  </label>
                  <input
                    type="text"
                    name="roll_no"
                    value={form.roll_no}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College *
                </label>
                <input
                  type="text"
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? 'Creating...' : 'Create Coordinator'}
              </button>
            </form>

            {createdPassword && (
              <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-sm text-gray-700 mb-1">
                  Generated password (share securely with the coordinator):
                </p>
                <p className="font-mono text-lg text-indigo-700">{createdPassword}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCoordinators;


