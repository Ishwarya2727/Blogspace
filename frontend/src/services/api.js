const API_BASE = '/api';

// Helper for making HTTP requests with optional JWT token
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('blogspace_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Auth endpoints
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request('/auth/me'),

  // Post endpoints
  getPosts: () => request('/posts'),

  getPostById: (id) => request(`/posts/${id}`),

  createPost: (title, content) =>
    request('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),

  updatePost: (id, title, content) =>
    request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    }),

  deletePost: (id) =>
    request(`/posts/${id}`, {
      method: 'DELETE',
    }),

  // Comment endpoints
  getComments: (postId) => request(`/posts/${postId}/comments`),

  addComment: (postId, content) =>
    request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deleteComment: (commentId) =>
    request(`/comments/${commentId}`, {
      method: 'DELETE',
    }),
};
