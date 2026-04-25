'use client';
import { useRef, useCallback, useEffect } from 'react';

const REP_MILESTONES = new Set([5, 10, 15, 20, 25, 30, 50]);
const MILESTONE_PHRASES = {
  5: 'Nice work, 5 reps done!', 10: '10 reps! You are on fire!', 15: '15 reps, keep pushing!',
  20: '20 reps! Incredible effort!', 25: '25 reps, you are unstoppable!',
  30: '30 reps! Elite performance!', 50: '50 reps! You are a legend!',
};
const EXERCISE_START_PHRASES = {
  squat: 'Starting squats. Keep your chest up and drive through your heels.',
  pushup: 'Starting push-ups. Keep your core tight and elbows at 45 degrees.',
  lunge: 'Starting lunges. Step far enough and keep your torso upright.',
  curl: 'Starting bicep curls. Keep your elbows fixed and use a full range of motion.',
};

export function useVoiceCoach(enabled) {
  const lastFeedbackRef = useRef('');
  const lastRepRef = useRef(0);
  const announcedMilestonesRef = useRef(new Set());
  const lastFormScoreRef = useRef(1);
  const voiceRef = useRef(null);

  useEffect(() => {
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira'))
      );
      voiceRef.current = preferred || voices.find((v) => v.lang.startsWith('en')) || null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback((text, { rate = 1.05, pitch = 1.0, priority = false } = {}) => {
    if (!enabled || !text) return;
    if (priority && window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    else if (window.speechSynthesis.speaking) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate; utt.pitch = pitch; utt.volume = 1.0;
    if (voiceRef.current) utt.voice = voiceRef.current;
    window.speechSynthesis.speak(utt);
  }, [enabled]);

  const announceExerciseStart = useCallback((exercise) => {
    lastRepRef.current = 0; lastFeedbackRef.current = '';
    announcedMilestonesRef.current = new Set(); lastFormScoreRef.current = 1;
    speak(EXERCISE_START_PHRASES[exercise] || `Starting ${exercise}.`, { rate: 0.95 });
  }, [speak]);

  const processPoseResult = useCallback((data) => {
    if (!enabled || !data.detected) return;
    const repCount = data.rep_count ?? 0;
    const feedback = data.feedback?.[0] ?? '';
    const formScore = data.form_score ?? 1;

    if (repCount > lastRepRef.current && REP_MILESTONES.has(repCount) && !announcedMilestonesRef.current.has(repCount)) {
      announcedMilestonesRef.current.add(repCount);
      speak(MILESTONE_PHRASES[repCount], { rate: 1.1, pitch: 1.1, priority: true });
      lastRepRef.current = repCount;
      return;
    }
    lastRepRef.current = repCount;
    if (feedback && feedback !== lastFeedbackRef.current) {
      lastFeedbackRef.current = feedback;
      speak(feedback, { rate: 1.0, pitch: 0.95, priority: true });
      return;
    }
    if (formScore >= 0.9 && lastFormScoreRef.current < 0.9 && !feedback) {
      speak('Perfect form!', { rate: 1.05 });
    }
    lastFormScoreRef.current = formScore;
  }, [enabled, speak]);

  const announceWorkoutEnd = useCallback((reps) => {
    window.speechSynthesis.cancel();
    speak(`Workout complete! You completed ${reps} reps. Amazing work!`, { rate: 0.95, pitch: 1.1 });
  }, [speak]);

  const stop = useCallback(() => window.speechSynthesis.cancel(), []);

  return { speak, announceExerciseStart, processPoseResult, announceWorkoutEnd, stop };
}
