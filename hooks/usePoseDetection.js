'use client';
/**
 * hooks/usePoseDetection.js
 *
 * Loads TensorFlow.js MoveNet model in the browser and runs real-time
 * pose inference on a <video> element. Returns keypoints on every frame.
 *
 * Uses MoveNet.SinglePose.Lightning (fastest) or Thunder (more accurate).
 * Model is downloaded once and cached by the browser.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

// Lazy-import TF.js so it only loads on the client
let tfLib = null;
let poseDetectionLib = null;

async function loadPoseDetectionLib() {
  if (window.poseDetection) return window.poseDetection;

  try {
    // 1. Load and initialize TensorFlow.js core via NPM (prevents race conditions)
    if (!tfLib) {
      tfLib = await import('@tensorflow/tfjs');
      await import('@tensorflow/tfjs-backend-webgl');
      await tfLib.ready();
      // Expose globally so the CDN script can find it
      if (typeof window !== 'undefined') {
        window.tf = tfLib;
      }
    }

    // 2. Dynamically inject the pose-detection script to bypass Next.js Turbopack 
    // export errors caused by its internal @mediapipe/pose dependency.
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3';
      script.async = true;
      script.onload = () => resolve(window.poseDetection);
      script.onerror = () => reject(new Error('Failed to load pose-detection script'));
      document.head.appendChild(script);
    });

  } catch (err) {
    console.error('Failed to load TensorFlow libraries:', err);
    throw err;
  }
}

/**
 * @param {React.RefObject} videoRef  — ref to the <video> element
 * @param {boolean} active            — only run when true (workout is live)
 * @param {function} onPose           — callback(keypoints, score) on each frame
 * @param {'Lightning'|'Thunder'} variant — speed vs accuracy tradeoff
 */
export function usePoseDetection(videoRef, active, onPose, variant = 'Lightning') {
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const [modelState, setModelState] = useState('idle'); // idle | loading | ready | error

  // ── Load model ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (detectorRef.current) return; // already loaded
      setModelState('loading');
      try {
        const poseDetection = await loadPoseDetectionLib();
        const modelType =
          variant === 'Thunder'
            ? poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
            : poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING;

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType, enableSmoothing: true }
        );

        if (!cancelled) {
          detectorRef.current = detector;
          setModelState('ready');
        }
      } catch (err) {
        console.error('[usePoseDetection] Model load failed:', err);
        if (!cancelled) setModelState('error');
      }
    }

    init();
    return () => { cancelled = true; };
  }, [variant]);

  // ── Inference loop ──────────────────────────────────────────────────────────
  const runLoop = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;

    if (!detector || !video || video.readyState < 2 || !active) {
      rafRef.current = requestAnimationFrame(runLoop);
      return;
    }

    try {
      const poses = await detector.estimatePoses(video, {
        maxPoses: 1,
        flipHorizontal: true, // mirror for selfie-camera UX
      });

      if (poses.length > 0 && poses[0].keypoints) {
        const pose = poses[0];
        // Normalize keypoints: {x, y} are pixel coords → normalize to 0-1
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        const normalized = pose.keypoints.map((kp) => ({
          x: kp.x / w,
          y: kp.y / h,
          score: kp.score ?? 0,
          name: kp.name,
        }));
        onPose(normalized, pose.score ?? 1);
      }
    } catch (err) {
      // Suppress individual frame errors silently
    }

    rafRef.current = requestAnimationFrame(runLoop);
  }, [active, videoRef, onPose]);

  useEffect(() => {
    if (modelState !== 'ready') return;
    rafRef.current = requestAnimationFrame(runLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [modelState, runLoop]);

  return { modelState };
}
