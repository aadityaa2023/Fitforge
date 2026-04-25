'use client';
/**
 * lib/poseEngine.js
 * 
 * Pure JS port of the Python PoseAnalyzer.
 * Uses TensorFlow.js MoveNet keypoint indices instead of MediaPipe.
 * 
 * MoveNet keypoint index map:
 *  0: nose
 *  1: left_eye, 2: right_eye
 *  3: left_ear, 4: right_ear
 *  5: left_shoulder,  6: right_shoulder
 *  7: left_elbow,     8: right_elbow
 *  9: left_wrist,    10: right_wrist
 * 11: left_hip,      12: right_hip
 * 13: left_knee,     14: right_knee
 * 15: left_ankle,    16: right_ankle
 */

// ─── Keypoint indices (MoveNet) ─────────────────────────────────────────────
export const KP = {
  NOSE: 0,
  LEFT_EYE: 1, RIGHT_EYE: 2,
  LEFT_EAR: 3, RIGHT_EAR: 4,
  LEFT_SHOULDER: 5, RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7, RIGHT_ELBOW: 8,
  LEFT_WRIST: 9, RIGHT_WRIST: 10,
  LEFT_HIP: 11, RIGHT_HIP: 12,
  LEFT_KNEE: 13, RIGHT_KNEE: 14,
  LEFT_ANKLE: 15, RIGHT_ANKLE: 16,
};

export const KP_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
];

// Skeleton connections for canvas drawing
export const SKELETON_CONNECTIONS = [
  [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER],
  [KP.LEFT_SHOULDER, KP.LEFT_ELBOW],
  [KP.LEFT_ELBOW, KP.LEFT_WRIST],
  [KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW],
  [KP.RIGHT_ELBOW, KP.RIGHT_WRIST],
  [KP.LEFT_SHOULDER, KP.LEFT_HIP],
  [KP.RIGHT_SHOULDER, KP.RIGHT_HIP],
  [KP.LEFT_HIP, KP.RIGHT_HIP],
  [KP.LEFT_HIP, KP.LEFT_KNEE],
  [KP.LEFT_KNEE, KP.LEFT_ANKLE],
  [KP.RIGHT_HIP, KP.RIGHT_KNEE],
  [KP.RIGHT_KNEE, KP.RIGHT_ANKLE],
];

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/**
 * Calculate angle at vertex B formed by A-B-C (in degrees, 0-180).
 * @param {[number,number]} a
 * @param {[number,number]} b  (vertex)
 * @param {[number,number]} c
 */
export function calculateAngle(a, b, c) {
  const [ax, ay] = a;
  const [bx, by] = b;
  const [cx, cy] = c;

  const bax = ax - bx, bay = ay - by;
  const bcx = cx - bx, bcy = cy - by;

  const dot = bax * bcx + bay * bcy;
  const magBA = Math.sqrt(bax ** 2 + bay ** 2) + 1e-7;
  const magBC = Math.sqrt(bcx ** 2 + bcy ** 2) + 1e-7;

  const cosine = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosine) * 180) / Math.PI;
}

/** Extract [x, y] from a MoveNet keypoint (normalized 0-1 coords). */
function pt(kps, idx) {
  const kp = kps[idx];
  return [kp.x, kp.y];
}

/** Check if a keypoint has enough confidence to use. */
function visible(kps, idx, threshold = 0.25) {
  return kps[idx]?.score >= threshold;
}

// ─── Exercise state machines ──────────────────────────────────────────────────

function analyzeSquat(kps, repCount, stage) {
  const feedback = [];
  let formIssues = 0;

  // Prefer left side; fall back to right if not visible
  const side = visible(kps, KP.LEFT_HIP) ? 'left' : 'right';
  const hipIdx    = side === 'left' ? KP.LEFT_HIP    : KP.RIGHT_HIP;
  const kneeIdx   = side === 'left' ? KP.LEFT_KNEE   : KP.RIGHT_KNEE;
  const ankleIdx  = side === 'left' ? KP.LEFT_ANKLE  : KP.RIGHT_ANKLE;
  const shoulderIdx = side === 'left' ? KP.LEFT_SHOULDER : KP.RIGHT_SHOULDER;

  if (!visible(kps, hipIdx) || !visible(kps, kneeIdx) || !visible(kps, ankleIdx)) {
    return { repCount, stage, feedback: ['Move into frame'], angles: {}, formScore: 0.5 };
  }

  const hip      = pt(kps, hipIdx);
  const knee     = pt(kps, kneeIdx);
  const ankle    = pt(kps, ankleIdx);
  const shoulder = pt(kps, shoulderIdx);

  const kneeAngle = calculateAngle(hip, knee, ankle);
  const backAngle = calculateAngle(shoulder, hip, knee);

  let newStage = stage;
  if (kneeAngle < 100) newStage = 'down';
  else if (kneeAngle > 160) newStage = 'up';

  let newRepCount = repCount;
  if (newStage === 'up' && stage === 'down') newRepCount += 1;

  if (newStage === 'down' && kneeAngle > 95) {
    feedback.push('Go deeper — past parallel!');
    formIssues += 1;
  }
  if (backAngle < 130) {
    feedback.push('Keep your back straight!');
    formIssues += 1;
  }

  const angles = { knee: Math.round(kneeAngle * 10) / 10, back: Math.round(backAngle * 10) / 10 };
  const formScore = Math.max(0, 1 - formIssues * 0.3);
  return { repCount: newRepCount, stage: newStage, feedback, angles, formScore };
}

function analyzePushup(kps, repCount, stage) {
  const feedback = [];
  let formIssues = 0;

  const side = visible(kps, KP.LEFT_SHOULDER) ? 'left' : 'right';
  const shoulderIdx = side === 'left' ? KP.LEFT_SHOULDER : KP.RIGHT_SHOULDER;
  const elbowIdx    = side === 'left' ? KP.LEFT_ELBOW    : KP.RIGHT_ELBOW;
  const wristIdx    = side === 'left' ? KP.LEFT_WRIST    : KP.RIGHT_WRIST;
  const hipIdx      = side === 'left' ? KP.LEFT_HIP      : KP.RIGHT_HIP;
  const ankleIdx    = side === 'left' ? KP.LEFT_ANKLE    : KP.RIGHT_ANKLE;

  if (!visible(kps, shoulderIdx) || !visible(kps, elbowIdx) || !visible(kps, wristIdx)) {
    return { repCount, stage, feedback: ['Move into frame'], angles: {}, formScore: 0.5 };
  }

  const shoulder = pt(kps, shoulderIdx);
  const elbow    = pt(kps, elbowIdx);
  const wrist    = pt(kps, wristIdx);
  const hip      = pt(kps, hipIdx);
  const ankle    = pt(kps, ankleIdx);

  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const bodyAngle  = visible(kps, ankleIdx)
    ? calculateAngle(shoulder, hip, ankle)
    : 180; // assume straight if ankle not visible

  let newStage = stage;
  if (elbowAngle < 90) newStage = 'down';
  else if (elbowAngle > 160) newStage = 'up';

  let newRepCount = repCount;
  if (newStage === 'up' && stage === 'down') newRepCount += 1;

  if (bodyAngle < 160) {
    feedback.push("Keep your hips level — don't sag!");
    formIssues += 1;
  }
  if (newStage === 'up' && elbowAngle < 155) {
    feedback.push('Fully extend your arms at the top!');
    formIssues += 1;
  }

  const angles = {
    elbow: Math.round(elbowAngle * 10) / 10,
    body: Math.round(bodyAngle * 10) / 10,
  };
  const formScore = Math.max(0, 1 - formIssues * 0.35);
  return { repCount: newRepCount, stage: newStage, feedback, angles, formScore };
}

function analyzeLunge(kps, repCount, stage) {
  const feedback = [];
  let formIssues = 0;

  const side = visible(kps, KP.LEFT_HIP) ? 'left' : 'right';
  const hipIdx      = side === 'left' ? KP.LEFT_HIP      : KP.RIGHT_HIP;
  const kneeIdx     = side === 'left' ? KP.LEFT_KNEE     : KP.RIGHT_KNEE;
  const ankleIdx    = side === 'left' ? KP.LEFT_ANKLE    : KP.RIGHT_ANKLE;
  const shoulderIdx = side === 'left' ? KP.LEFT_SHOULDER : KP.RIGHT_SHOULDER;

  if (!visible(kps, hipIdx) || !visible(kps, kneeIdx) || !visible(kps, ankleIdx)) {
    return { repCount, stage, feedback: ['Move into frame'], angles: {}, formScore: 0.5 };
  }

  const hip      = pt(kps, hipIdx);
  const knee     = pt(kps, kneeIdx);
  const ankle    = pt(kps, ankleIdx);
  const shoulder = pt(kps, shoulderIdx);

  const kneeAngle  = calculateAngle(hip, knee, ankle);
  const trunkAngle = calculateAngle(shoulder, hip, knee);

  let newStage = stage;
  if (kneeAngle < 100) newStage = 'down';
  else if (kneeAngle > 160) newStage = 'up';

  let newRepCount = repCount;
  if (newStage === 'up' && stage === 'down') newRepCount += 1;

  if (trunkAngle < 150) {
    feedback.push('Keep your torso upright!');
    formIssues += 1;
  }
  if (newStage === 'down' && kneeAngle > 100) {
    feedback.push('Lower your back knee toward the floor!');
    formIssues += 1;
  }

  const angles = {
    knee: Math.round(kneeAngle * 10) / 10,
    trunk: Math.round(trunkAngle * 10) / 10,
  };
  const formScore = Math.max(0, 1 - formIssues * 0.3);
  return { repCount: newRepCount, stage: newStage, feedback, angles, formScore };
}

function analyzeCurl(kps, repCount, stage) {
  const feedback = [];
  let formIssues = 0;

  const side = visible(kps, KP.LEFT_SHOULDER) ? 'left' : 'right';
  const shoulderIdx = side === 'left' ? KP.LEFT_SHOULDER : KP.RIGHT_SHOULDER;
  const elbowIdx    = side === 'left' ? KP.LEFT_ELBOW    : KP.RIGHT_ELBOW;
  const wristIdx    = side === 'left' ? KP.LEFT_WRIST    : KP.RIGHT_WRIST;

  if (!visible(kps, shoulderIdx) || !visible(kps, elbowIdx) || !visible(kps, wristIdx)) {
    return { repCount, stage, feedback: ['Move into frame'], angles: {}, formScore: 0.5 };
  }

  const shoulder = pt(kps, shoulderIdx);
  const elbow    = pt(kps, elbowIdx);
  const wrist    = pt(kps, wristIdx);

  const elbowAngle = calculateAngle(shoulder, elbow, wrist);

  let newStage = stage;
  if (elbowAngle < 50) newStage = 'up';
  else if (elbowAngle > 150) newStage = 'down';

  let newRepCount = repCount;
  if (newStage === 'down' && stage === 'up') newRepCount += 1;

  if (newStage === 'up' && elbowAngle > 60) {
    feedback.push('Curl all the way up!');
    formIssues += 1;
  }
  if (newStage === 'down' && elbowAngle < 160) {
    feedback.push('Fully extend at the bottom!');
    formIssues += 1;
  }

  const angles = { elbow: Math.round(elbowAngle * 10) / 10 };
  const formScore = Math.max(0, 1 - formIssues * 0.35);
  return { repCount: newRepCount, stage: newStage, feedback, angles, formScore };
}

const ANALYZERS = {
  squat: analyzeSquat,
  pushup: analyzePushup,
  lunge: analyzeLunge,
  curl: analyzeCurl,
};

// ─── Stateful PoseEngine class ────────────────────────────────────────────────

export class PoseEngine {
  constructor(exercise) {
    this.exercise = exercise;
    this.repCount = 0;
    this.stage = 'up';
    this.perfectReps = 0;
    this.feedbackHistory = [];
  }

  /**
   * Process an array of MoveNet keypoints for one frame.
   * @param {Array} keypoints  — TF.js pose.keypoints array
   * @returns {object}  PoseResult-compatible object
   */
  processFrame(keypoints) {
    const analyzer = ANALYZERS[this.exercise];
    if (!analyzer) throw new Error(`Unknown exercise: ${this.exercise}`);

    const prevRep = this.repCount;
    const result = analyzer(keypoints, this.repCount, this.stage);

    this.repCount = result.repCount;
    this.stage = result.stage;

    // Track perfect reps
    if (this.repCount > prevRep && result.formScore >= 0.85) {
      this.perfectReps += 1;
    }

    // Accumulate unique feedback
    for (const fb of result.feedback) {
      const recent = this.feedbackHistory.slice(-5);
      if (!recent.includes(fb)) this.feedbackHistory.push(fb);
    }

    return {
      detected: true,
      exercise: this.exercise,
      rep_count: this.repCount,
      stage: this.stage,
      feedback: result.feedback,
      angles: result.angles,
      form_score: Math.round(result.formScore * 100) / 100,
      perfect_reps: this.perfectReps,
    };
  }

  reset() {
    this.repCount = 0;
    this.stage = 'up';
    this.perfectReps = 0;
    this.feedbackHistory = [];
  }
}
