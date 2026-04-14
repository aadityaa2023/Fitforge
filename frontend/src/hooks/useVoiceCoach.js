// hooks/useVoiceCoach.js
// Voice AI Coach using the browser's native Web Speech API (speechSynthesis).
// Speaks real-time form feedback, rep milestones, and motivational prompts.
import { useRef, useCallback, useEffect } from "react";

const REP_MILESTONES = new Set([5, 10, 15, 20, 25, 30, 50]);

const MILESTONE_PHRASES = {
  5:  "Nice work, 5 reps done!",
  10: "10 reps! You are on fire!",
  15: "15 reps, keep pushing!",
  20: "20 reps! Incredible effort!",
  25: "25 reps, you are unstoppable!",
  30: "30 reps! Elite performance!",
  50: "50 reps! You are a legend!",
};

const EXERCISE_START_PHRASES = {
  squat:  "Starting squats. Keep your chest up and drive through your heels.",
  pushup: "Starting push-ups. Keep your core tight and elbows at 45 degrees.",
  lunge:  "Starting lunges. Step far enough and keep your torso upright.",
  curl:   "Starting bicep curls. Keep your elbows fixed and use a full range of motion.",
};

export function useVoiceCoach(enabled) {
  const lastFeedbackRef  = useRef("");
  const lastRepRef       = useRef(0);
  const announcedMilestonesRef = useRef(new Set());
  const lastFormScoreRef = useRef(1);
  const utteranceRef     = useRef(null);
  const voiceRef         = useRef(null);

  // Pick the best available voice (prefer female English voices)
  useEffect(() => {
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer a natural-sounding English voice
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Karen") ||
            v.name.includes("Zira"))
      );
      voiceRef.current = preferred || voices.find((v) => v.lang.startsWith("en")) || null;
    };

    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback(
    (text, { rate = 1.05, pitch = 1.0, priority = false } = {}) => {
      if (!enabled || !text) return;

      // Cancel current speech if priority message (e.g., form warning)
      if (priority && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      } else if (window.speechSynthesis.speaking) {
        // Don't queue too many — skip if already speaking
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate   = rate;
      utterance.pitch  = pitch;
      utterance.volume = 1.0;
      if (voiceRef.current) utterance.voice = voiceRef.current;

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  /** Call this once when the user starts a workout session. */
  const announceExerciseStart = useCallback(
    (exercise) => {
      lastRepRef.current = 0;
      lastFeedbackRef.current = "";
      announcedMilestonesRef.current = new Set();
      lastFormScoreRef.current = 1;

      const phrase = EXERCISE_START_PHRASES[exercise] || `Starting ${exercise}.`;
      speak(phrase, { rate: 0.95 });
    },
    [speak]
  );

  /** Call this on every WebSocket pose result. */
  const processPoseResult = useCallback(
    (data) => {
      if (!enabled || !data.detected) return;

      const repCount  = data.rep_count ?? 0;
      const feedback  = data.feedback?.[0] ?? "";
      const formScore = data.form_score ?? 1;

      // 1. Rep milestone announcements (highest priority)
      if (
        repCount > lastRepRef.current &&
        REP_MILESTONES.has(repCount) &&
        !announcedMilestonesRef.current.has(repCount)
      ) {
        announcedMilestonesRef.current.add(repCount);
        speak(MILESTONE_PHRASES[repCount], { rate: 1.1, pitch: 1.1, priority: true });
        lastRepRef.current = repCount;
        return; // Don't stack speech
      }

      lastRepRef.current = repCount;

      // 2. Form feedback — speak only when it changes
      if (feedback && feedback !== lastFeedbackRef.current) {
        lastFeedbackRef.current = feedback;
        speak(feedback, { rate: 1.0, pitch: 0.95, priority: true });
        return;
      }

      // 3. Perfect form acknowledgement — when score crosses from bad to good
      if (formScore >= 0.9 && lastFormScoreRef.current < 0.9 && !feedback) {
        speak("Perfect form!", { rate: 1.05 });
      }

      lastFormScoreRef.current = formScore;
    },
    [enabled, speak]
  );

  /** Call this when the workout ends. */
  const announceWorkoutEnd = useCallback(
    (reps) => {
      window.speechSynthesis.cancel();
      speak(`Workout complete! You completed ${reps} reps. Amazing work!`, {
        rate: 0.95,
        pitch: 1.1,
      });
    },
    [speak]
  );

  /** Stop all speech immediately. */
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, announceExerciseStart, processPoseResult, announceWorkoutEnd, stop };
}
