// utils/offlineSync.js
import { workoutApi } from "../services/auth";

export const saveWorkoutOffline = (payload) => {
  const existing = JSON.parse(localStorage.getItem('offlineWorkouts') || '[]');
  existing.push({ ...payload, _offlineId: Date.now() });
  localStorage.setItem('offlineWorkouts', JSON.stringify(existing));
};

export const syncOfflineWorkouts = async () => {
  const offline = JSON.parse(localStorage.getItem('offlineWorkouts') || '[]');
  if (offline.length === 0) return;

  const successfulSyncs = [];

  for (const w of offline) {
    try {
      // Remove offline id before sending
      const payload = { ...w };
      delete payload._offlineId;
      await workoutApi.completeWorkout(payload);
      successfulSyncs.push(w._offlineId);
    } catch (e) {
      console.error("Failed to sync offline workout:", e);
    }
  }

  if (successfulSyncs.length > 0) {
    const remaining = offline.filter(w => !successfulSyncs.includes(w._offlineId));
    localStorage.setItem('offlineWorkouts', JSON.stringify(remaining));
    return successfulSyncs.length;
  }
  return 0;
};
