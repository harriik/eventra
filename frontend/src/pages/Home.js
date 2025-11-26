import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'coordinator':
        return '/coordinator/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-4">
                Smart Symposium Management · EVENTRA
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Manage your
                <span className="text-indigo-400"> Symposium </span>
                with confidence.
              </h1>
              <p className="mt-4 text-lg text-slate-300 max-w-xl">
                EVENTRA brings registrations, teams, coordinators, and reports into
                one clean, role-based platform for your college events.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold shadow-lg shadow-indigo-500/25 transition"
                  >
                    Go to my dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/student/register"
                      className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold shadow-lg shadow-indigo-500/25 transition"
                    >
                      Get started as Student
                    </Link>
                    <Link
                      to="/student/login"
                      className="inline-flex items-center px-6 py-3 rounded-xl border border-slate-600 text-sm font-semibold hover:bg-slate-900/60 transition"
                    >
                      Student Login
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Illustration / stats */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/60 rounded-2xl p-4">
                  <p className="text-xs text-slate-400">Total Events</p>
                  <p className="mt-2 text-2xl font-bold text-indigo-300">20+</p>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-4">
                  <p className="text-xs text-slate-400">Participants</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">1500+</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                Track enrollments, teams, and attendance in real time with a clean,
                responsive interface for students, coordinators, and admins.
              </p>
            </div>
          </div>

          {/* Role-based cards */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">
              Built for every role
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Students */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20 transition">
                <div className="text-3xl mb-3">👨‍🎓</div>
                <h3 className="text-lg font-semibold mb-2 text-slate-50">Students</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Discover events, form teams, track participant IDs, and see your
                  attendance history.
                </p>
                <Link
                  to="/student/register"
                  className="text-indigo-300 text-sm font-semibold hover:text-indigo-200"
                >
                  Register now →
                </Link>
              </div>

              {/* Coordinators */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20 transition">
                <div className="text-3xl mb-3">🧑‍🏫</div>
                <h3 className="text-lg font-semibold mb-2 text-slate-50">Coordinators</h3>
                <p className="text-sm text-slate-300 mb-4">
                  View assigned events, manage participant lists, and mark attendance
                  with simple present/absent controls.
                </p>
                <Link
                  to="/coordinator/login"
                  className="text-indigo-300 text-sm font-semibold hover:text-indigo-200"
                >
                  Coordinator login →
                </Link>
              </div>

              {/* Admins */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20 transition">
                <div className="text-3xl mb-3">🛠️</div>
                <h3 className="text-lg font-semibold mb-2 text-slate-50">Admins</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Create events, assign coordinators, and monitor registrations and
                  attendance with clear analytics.
                </p>
                <Link
                  to="/admin/login"
                  className="text-indigo-300 text-sm font-semibold hover:text-indigo-200"
                >
                  Admin login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
