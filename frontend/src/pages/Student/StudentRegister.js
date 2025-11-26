import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    college: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (pwd) => {
    const errs = [];
    if (!pwd || pwd.length < 8) errs.push('At least 8 characters');
    if (!/[a-z]/.test(pwd)) errs.push('At least one lowercase letter');
    if (!/[A-Z]/.test(pwd)) errs.push('At least one uppercase letter');
    if (!/[0-9]/.test(pwd)) errs.push('At least one number');
    if (!/[!@#$%^&*()_+\-=[\]{};"\'\\:,<>./?`~|]/.test(pwd)) errs.push('At least one symbol');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePassword(formData.password);
    setPasswordErrors(errors);
    if (errors.length > 0) return;

    setLoading(true);
    const result = await register({ ...formData, role: 'student' });

    if (result.success) {
      navigate('/student/dashboard');
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 mb-4">
              <span className="text-xl">📝</span>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Student Registration
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Create your EVENTRA account to register for symposium events.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Already registered?{' '}
              <Link to="/student/login" className="font-medium text-indigo-300 hover:text-indigo-200">
                Login to your account
              </Link>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-100">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-slate-100">
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-100">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-slate-100">
                    College Name
                  </label>
                  <input
                    id="college"
                    name="college"
                    type="text"
                    required
                    value={formData.college}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-100">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => {
                    handleChange(e);
                    setPasswordErrors(validatePassword(e.target.value));
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <div className="mt-2 text-xs">
                  {passwordErrors.length === 0 ? (
                    formData.password ? (
                      <p className="text-emerald-400">Strong password</p>
                    ) : null
                  ) : (
                    <ul className="list-disc list-inside text-red-400">
                      {passwordErrors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-950 disabled:opacity-60 transition"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
