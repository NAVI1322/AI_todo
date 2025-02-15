import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor:', {
      url: config.url,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null,
      headers: config.headers
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found');
      // Redirect to login if not on login or register page
      const publicPaths = ['/login', '/register', '/'];
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname === '/') {
        window.location.href = '/login';
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
      originalRequest: error.config
    });
    
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Profile functions
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    // If there's an error, try to get the user from localStorage as fallback
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Set the token in axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Set the token in axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Reset axios default headers
    delete api.defaults.headers.common['Authorization'];
    // Redirect to login
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      // If there's an error, try to get the user from localStorage as fallback
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export const taskService = {
  // Get all tasks
  getTasks: () => api.get('/tasks').then(res => res.data),
  
  // Get a single task
  getTask: (id) => api.get(`/tasks/${id}`).then(res => res.data),
  
  // Create a new task
  createTask: (data) => api.post('/tasks', data).then(res => res.data),
  
  // Update a task
  updateTask: (id, data) => api.put(`/tasks/${id}`, data).then(res => res.data),
  
  // Delete a task
  deleteTask: (id) => api.delete(`/tasks/${id}`).then(res => res.data),
  
  // Toggle task completion
  toggleTask: (id) => api.put(`/tasks/${id}/toggle`).then(res => res.data),
  
  // Get tasks by status
  getTasksByStatus: (status) => api.get(`/tasks/status/${status}`).then(res => res.data),
  
  // Get tasks by priority
  getTasksByPriority: (priority) => api.get(`/tasks/priority/${priority}`).then(res => res.data),
  
  // Get tasks by date range
  getTasksByDateRange: (startDate, endDate) => 
    api.get(`/tasks/date-range`, { params: { startDate, endDate } }).then(res => res.data)
};

export const pathService = {
  // Path operations
  getPaths: async () => {
    try {
      const response = await api.get('/paths');
      console.log('Fetched paths:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching paths:', error);
      throw error;
    }
  },

  getPath: async (id) => {
    try {
      if (!id) {
        throw new Error('Path ID is required');
      }
      console.log('Fetching path:', id);
      const response = await api.get(`/paths/${id}`);
      console.log('Fetched path data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching path:', error);
      throw error;
    }
  },

  createPath: async (data) => {
    try {
      const response = await api.post('/paths', data);
      console.log('Created path:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating path:', error);
      throw error;
    }
  },

  createPathByAI: async (topic, duration) => {
    try {
      // Convert duration to number and validate
      const numDuration = Number(duration);
      console.log('Creating path with:', {
        topic,
        originalDuration: duration,
        convertedDuration: numDuration,
        isInteger: Number.isInteger(numDuration),
        inRange: numDuration >= 1 && numDuration <= 30
      });

      if (!Number.isInteger(numDuration) || numDuration < 1 || numDuration > 30) {
        throw new Error(`Invalid duration: ${duration}. Must be a whole number between 1 and 30.`);
      }

      if (!topic || topic.trim().length === 0) {
        throw new Error('Topic is required.');
      }

      // Log the request payload
      const payload = { 
        topic: topic.trim(), 
        duration: numDuration 
      };
      console.log('Sending request with payload:', payload);

      const response = await api.post('/paths/generate', payload);
      console.log('Server response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error creating AI path:', error);
      throw error;
    }
  },

  updatePath: async (id, data) => {
    try {
      if (!id) {
        throw new Error('Path ID is required');
      }
      console.log('Updating path:', { id, data });
      const response = await api.put(`/paths/${id}`, data);
      console.log('Updated path:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating path:', error);
      throw error;
    }
  },

  deletePath: async (id) => {
    try {
      if (!id) {
        throw new Error('Path ID is required');
      }
      console.log('Deleting path:', id);
      const response = await api.delete(`/paths/${id}`);
      console.log('Deleted path:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting path:', error);
      throw error;
    }
  },

  updateTaskCompletion: async (pathId, dayIndex, taskId, completed) => {
    try {
      if (!pathId || dayIndex === undefined || !taskId) {
        throw new Error('Path ID, day index, and task ID are required');
      }
      console.log('Updating task completion:', { pathId, dayIndex, taskId, completed });
      const response = await api.put(`/paths/${pathId}/days/${dayIndex}/tasks/${taskId}/complete`, { completed });
      console.log('Updated task completion:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating task completion:', error);
      throw error;
    }
  }
};

export default api; 