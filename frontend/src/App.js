import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Student Routes
import StudentLogin from './pages/Student/StudentLogin';
import StudentRegister from './pages/Student/StudentRegister';
import StudentDashboard from './pages/Student/StudentDashboard';
import EventList from './pages/Student/EventList';
import EventDetails from './pages/Student/EventDetails';
import MyEnrollments from './pages/Student/MyEnrollments';

// Coordinator Routes
import CoordinatorLogin from './pages/Coordinator/CoordinatorLogin';
import CoordinatorDashboard from './pages/Coordinator/CoordinatorDashboard';
import ParticipantList from './pages/Coordinator/ParticipantList';
import AttendanceMarking from './pages/Coordinator/AttendanceMarking';
import AttendanceStats from './pages/Coordinator/AttendanceStats';

// Admin Routes
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreateEvent from './pages/Admin/CreateEvent';
import EditEvent from './pages/Admin/EditEvent';
import AdminParticipants from './pages/Admin/AdminParticipants';
import AdminReports from './pages/Admin/AdminReports';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Home from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/register" element={<StudentRegister />} />
            <Route
              path="/student/dashboard"
              element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>}
            />
            <Route
              path="/student/events"
              element={<ProtectedRoute requiredRole="student"><EventList /></ProtectedRoute>}
            />
            <Route
              path="/student/events/:id"
              element={<ProtectedRoute requiredRole="student"><EventDetails /></ProtectedRoute>}
            />
            <Route
              path="/student/enrollments"
              element={<ProtectedRoute requiredRole="student"><MyEnrollments /></ProtectedRoute>}
            />
            
            {/* Coordinator Routes */}
            <Route path="/coordinator/login" element={<CoordinatorLogin />} />
            <Route
              path="/coordinator/dashboard"
              element={<ProtectedRoute requiredRole="coordinator"><CoordinatorDashboard /></ProtectedRoute>}
            />
            <Route
              path="/coordinator/events/:eventId/participants"
              element={<ProtectedRoute requiredRole="coordinator"><ParticipantList /></ProtectedRoute>}
            />
            <Route
              path="/coordinator/events/:eventId/attendance"
              element={<ProtectedRoute requiredRole="coordinator"><AttendanceMarking /></ProtectedRoute>}
            />
            <Route
              path="/coordinator/events/:eventId/stats"
              element={<ProtectedRoute requiredRole="coordinator"><AttendanceStats /></ProtectedRoute>}
            />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/events/create"
              element={<ProtectedRoute requiredRole="admin"><CreateEvent /></ProtectedRoute>}
            />
            <Route
              path="/admin/events/edit/:id"
              element={<ProtectedRoute requiredRole="admin"><EditEvent /></ProtectedRoute>}
            />
            <Route
              path="/admin/participants"
              element={<ProtectedRoute requiredRole="admin"><AdminParticipants /></ProtectedRoute>}
            />
            <Route
              path="/admin/reports"
              element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>}
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

