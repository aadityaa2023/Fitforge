// services/auth.js — Authentication API calls
import api from "./api";

export const authApi = {
  login: async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
  },
  register: async (username, email, password) => {
    const { data } = await api.post("/api/auth/register", { username, email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get("/api/auth/me");
    return data;
  },
};

export const gamificationApi = {
  getProfile: async () => {
    const { data } = await api.get("/api/gamification/profile");
    return data;
  },
  getLeaderboard: async () => {
    const { data } = await api.get("/api/gamification/leaderboard");
    return data;
  },
  getAchievements: async () => {
    const { data } = await api.get("/api/gamification/achievements");
    return data;
  },
};

export const workoutApi = {
  completeWorkout: async (payload) => {
    const { data } = await api.post("/api/workouts/complete", payload);
    return data;
  },
  getHistory: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/api/workouts/history?page=${page}&limit=${limit}`);
    return data;
  },
};

export const progressApi = {
  getWeekly: async () => {
    const { data } = await api.get("/api/progress/weekly");
    return data;
  },
  getStats: async () => {
    const { data } = await api.get("/api/progress/stats");
    return data;
  },
};
