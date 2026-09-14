const API_BASE_URL = '/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Auth API
const signup = (name: string, email: string, password: string, role: string = 'user') => {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
};

const login = (email: string, password: string) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

const getMe = () => {
  return apiRequest('/auth/me');
};

// Task API
const getTasks = (page: number = 1, limit: number = 10, status: string = '', search: string = '') => {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  return apiRequest(`/tasks?${params.toString()}`);
};

const getTaskStats = () => {
  return apiRequest('/tasks/stats');
};

const createTask = (title: string, description: string = '', status: string = 'Pending') => {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description, status }),
  });
};

const updateTask = (id: string, title: string, description: string = '', status: string = 'Pending') => {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description, status }),
  });
};

const deleteTask = (id: string) => {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
};

// Notification API
const getNotifications = (page: number = 1, limit: number = 10, before?: string) => {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (before) params.append('before', before);

  return apiRequest(`/notifications?${params.toString()}`);
};

const getUnreadNotificationCount = () => {
  return apiRequest('/notifications/unread-count');
};

const markNotificationAsRead = (id: string) => {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
};

const deleteNotification = (id: string) => {
  return apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
  });
};

const sendNotification = (title: string, message: string) => {
  return apiRequest('/notifications', {
    method: 'POST',
    body: JSON.stringify({ title, message }),
  });
};

const api = {
  signup,
  login,
  getMe,
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  deleteNotification,
  sendNotification,
};

export {
  api,
  signup,
  login,
  getMe,
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  deleteNotification,
  sendNotification,
};
export default api;
