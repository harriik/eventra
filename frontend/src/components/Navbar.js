import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
    <nav className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-lg sm:text-xl font-bold tracking-tight text-white">
            EVENTRA
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-100 hover:bg-slate-900/70 border border-slate-800 transition"
                >
                  Dashboard
                </Link>
                <span className="hidden sm:inline-flex px-3 py-2 text-sm text-slate-300 bg-slate-900/60 border border-slate-800 rounded-lg">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/student/login"
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-100 hover:bg-slate-900/70 border border-slate-800 transition"
                >
                  Student Login
                </Link>
                <Link
                  to="/coordinator/login"
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-100 hover:bg-slate-900/70 border border-slate-800 transition"
                >
                  Coordinator Login
                </Link>
                <Link
                  to="/admin/login"
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



