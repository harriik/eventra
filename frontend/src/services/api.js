import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  assignCoordinators: (id, coordinatorIds) => api.post(`/events/${id}/coordinators`, { coordinator_ids: coordinatorIds }),
  reassignCoordinators: (id, coordinatorIds) => api.put(`/events/${id}/coordinators`, { coordinator_ids: coordinatorIds }),
  removeCoordinator: (id, coordinatorId) => api.delete(`/events/${id}/coordinators/${coordinatorId}`)
};

// Registrations API
export const registrationsAPI = {
  enroll: (eventId) => api.post('/registrations', { event_id: eventId }),
  getMyRegistrations: () => api.get('/registrations/my-registrations'),
  getEventParticipants: (eventId) => api.get(`/registrations/event/${eventId}/participants`),
  getAll: (params) => api.get('/registrations/all', { params })
};

// Attendance API
export const attendanceAPI = {
  mark: (registrationId, status) => api.post('/attendance/mark', { registration_id: registrationId, status }),
  getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`)
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getEventStats: () => api.get('/admin/events/stats'),
  createCoordinator: (data) => api.post('/admin/coordinators', data)
};

// Teams API
export const teamsAPI = {
  create: (teamData) => api.post('/teams', teamData),
  join: (teamCode, eventId, teamId = null) => api.post('/teams/join', { team_code: teamCode, team_id: teamId, event_id: eventId }),
  getMyTeam: (eventId) => api.get(`/teams/my-team/${eventId}`),
  getAvailableTeams: (eventId) => api.get(`/teams/available/${eventId}`),
  register: (teamId) => api.post(`/teams/${teamId}/register`),
  leave: (teamId) => api.delete(`/teams/${teamId}/leave`),
  delete: (teamId) => api.delete(`/teams/${teamId}`)
};

export default api;

