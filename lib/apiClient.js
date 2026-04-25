'use client';
/**
 * lib/apiClient.js — Axios instance with JWT interceptor (client-side)
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '', // Same origin — Next.js API routes
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fitforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fitforge_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data;
  },
  register: async (username, email, password) => {
    const { data } = await api.post('/api/auth/register', { username, email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
};

export const gamificationApi = {
  getProfile: async () => {
    const { data } = await api.get('/api/gamification/profile');
    return data;
  },
  getLeaderboard: async () => {
    const { data } = await api.get('/api/gamification/leaderboard');
    return data;
  },
  getAchievements: async () => {
    const { data } = await api.get('/api/gamification/achievements');
    return data;
  },
};

export const workoutApi = {
  completeWorkout: async (payload) => {
    const { data } = await api.post('/api/workouts/complete', payload);
    return data;
  },
  getHistory: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/api/workouts/history?page=${page}&limit=${limit}`);
    return data;
  },
};

export const progressApi = {
  getWeekly: async () => {
    const { data } = await api.get('/api/progress/weekly');
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/api/progress/stats');
    return data;
  },
};

export const aiPlannerApi = {
  generatePlan: async (workoutStats = {}) => {
    const { data } = await api.post('/api/ai-planner/generate', workoutStats);
    return data;
  },
};
