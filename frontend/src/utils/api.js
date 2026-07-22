const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  // Auth
  register: (body) => fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  login: (body) => fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe: () => fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),

  // Interviews
  getInterviews: () => fetch(`${API_BASE}/interviews`, { headers: getHeaders() }).then(handleResponse),
  createInterview: (body) => fetch(`${API_BASE}/interviews`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getInterview: (id) => fetch(`${API_BASE}/interviews/${id}`, { headers: getHeaders() }).then(handleResponse),
  endInterview: (id) => fetch(`${API_BASE}/interviews/${id}/end`, { method: 'PUT', headers: getHeaders() }).then(handleResponse),
  deleteInterview: (id) => fetch(`${API_BASE}/interviews/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  deleteAllInterviews: () => fetch(`${API_BASE}/interviews`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  generateCheatSheet: (body) => fetch(`${API_BASE}/interviews/cheat-sheet`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Questions
  getNextQuestion: (interviewId) => fetch(`${API_BASE}/questions/${interviewId}/questions/next`, { headers: getHeaders() }).then(handleResponse),
  submitAnswer: (interviewId, body) => fetch(`${API_BASE}/questions/${interviewId}/answers`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Results
  getResults: (interviewId) => fetch(`${API_BASE}/results/${interviewId}/results`, { headers: getHeaders() }).then(handleResponse),
  getSkills: (interviewId) => fetch(`${API_BASE}/results/${interviewId}/skills`, { headers: getHeaders() }).then(handleResponse),
  generateActionPlan: (interviewId) => fetch(`${API_BASE}/results/${interviewId}/action-plan`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

  // Dashboard
  getDashboardStats: () => fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() }).then(handleResponse),
  getRecruiterView: () => fetch(`${API_BASE}/dashboard/recruiter-view`, { headers: getHeaders() }).then(handleResponse),

  // Profile
  updateProfile: (body) => fetch(`${API_BASE}/profile/update`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  changePassword: (body) => fetch(`${API_BASE}/profile/password`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  deleteAccount: () => fetch(`${API_BASE}/profile/account`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  getProfileStats: () => fetch(`${API_BASE}/profile/stats`, { headers: getHeaders() }).then(handleResponse),

  // Email Verification
  sendVerification: () => fetch(`${API_BASE}/verify/send`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  verifyEmail: (token) => fetch(`${API_BASE}/verify/confirm/${token}`, { headers: getHeaders() }).then(handleResponse),
  forgotPassword: (body) => fetch(`${API_BASE}/verify/forgot-password`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  resetPassword: (token, body) => fetch(`${API_BASE}/verify/reset-password/${token}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Leaderboard
  getLeaderboard: (period = 'all') => fetch(`${API_BASE}/leaderboard?period=${period}`, { headers: getHeaders() }).then(handleResponse),

  // Admin
  getAdminStats: () => fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() }).then(handleResponse),
  getAdminUsers: (page = 1, search = '') => fetch(`${API_BASE}/admin/users?page=${page}&search=${search}`, { headers: getHeaders() }).then(handleResponse),
  getAdminUser: (id) => fetch(`${API_BASE}/admin/users/${id}`, { headers: getHeaders() }).then(handleResponse),
  updateUserRole: (id, body) => fetch(`${API_BASE}/admin/users/${id}/role`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  deleteUser: (id) => fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  getAdminInterviews: (page = 1) => fetch(`${API_BASE}/admin/interviews?page=${page}`, { headers: getHeaders() }).then(handleResponse),
  deleteAnyInterview: (id) => fetch(`${API_BASE}/admin/interviews/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};
