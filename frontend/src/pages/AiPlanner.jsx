// pages/AiPlanner.jsx — Generative AI Smart Recovery & Diet Planner
import { useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  CircularProgress, Divider, LinearProgress, Alert, Collapse,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import SnackingIcon from "@mui/icons-material/EmojiFoodBeverage";
import { aiPlannerApi } from "../services/auth";

// ─── Sub-components ──────────────────────────────────────────────────────────────

function SectionCard({ icon, title, color, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
        {/* Color accent bar */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color}, transparent)`,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: `${color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
          </Box>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BulletList({ items, color = "primary.main" }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <CheckCircleIcon sx={{ fontSize: 16, mt: 0.3, color, flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary">{item}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function MacroBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color }}>{value}g</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 99,
          bgcolor: "rgba(255,255,255,0.06)",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 99 },
        }}
      />
    </Box>
  );
}

// ─── Loading animation ────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Analyzing your workout performance...",
  "Calculating muscle fatigue & recovery needs...",
  "Generating personalized nutrition plan...",
  "Crafting your next workout recommendation...",
  "Finalizing your AI coaching plan...",
];

function LoadingScreen() {
  const [step, setStep] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(interval);
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 320,
        gap: 3,
      }}
    >
      {/* Pulsing AI brain icon */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(124,77,255,0.3), rgba(0,230,118,0.2))",
            border: "2px solid rgba(124,77,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 36, color: "secondary.main" }} />
        </Box>
      </motion.div>

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>Gemini AI is working...</Typography>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <Typography variant="body2" color="text.secondary">
              {LOADING_STEPS[step]}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Progress bar */}
      <Box sx={{ width: 280 }}>
        <LinearProgress
          variant="determinate"
          value={((step + 1) / LOADING_STEPS.length) * 100}
          sx={{
            height: 4,
            borderRadius: 99,
            bgcolor: "rgba(255,255,255,0.06)",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #7C4DFF, #00E676)",
              borderRadius: 99,
            },
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────

export default function AiPlanner() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const result = await aiPlannerApi.generatePlan();
      if (result.success) {
        setPlan(result.plan);
      } else {
        setError("Failed to generate plan. Please try again.");
      }
    } catch (e) {
      const msg = e?.response?.data?.detail || "Failed to connect to AI service.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hydrationPct = plan ? Math.min((plan.nutrition.hydration_ml / 3000) * 100, 100) : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: "linear-gradient(135deg, rgba(124,77,255,0.3), rgba(0,230,118,0.15))",
                border: "1px solid rgba(124,77,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoAwesomeIcon sx={{ color: "secondary.main", fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>AI Coach Planner</Typography>
              <Typography color="text.secondary" variant="body2">
                Powered by Google Gemini — personalized recovery & nutrition from your real workout data
              </Typography>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Generate button / hero */}
      {!plan && !loading && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card
            sx={{
              mb: 3,
              background: "linear-gradient(135deg, rgba(124,77,255,0.12), rgba(0,230,118,0.06))",
              border: "1px solid rgba(124,77,255,0.25)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
              <PsychologyIcon sx={{ fontSize: 56, color: "secondary.main", mb: 2, opacity: 0.85 }} />
              <Typography variant="h5" fontWeight={800} mb={1}>
                Get Your Personalized AI Recovery Plan
              </Typography>
              <Typography color="text.secondary" mb={3} maxWidth={520} mx="auto">
                Gemini AI will analyze your latest workout stats — including your actual rep count, form score,
                and coach feedback — to generate a science-backed recovery routine and tailored meal plan just for you.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", mb: 3 }}>
                {["Recovery stretches", "Post-workout meal", "Hydration targets", "Next session tips", "Motivation boost"].map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    size="small"
                    sx={{ bgcolor: "rgba(124,77,255,0.12)", color: "secondary.light", fontWeight: 600 }}
                  />
                ))}
              </Box>

              <Button
                id="generate-plan-btn"
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerate}
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #7C4DFF, #00E676)",
                  "&:hover": { background: "linear-gradient(135deg, #9d71ff, #29eb8a)" },
                }}
              >
                Generate My Plan
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error */}
      <Collapse in={!!error}>
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleGenerate}>Retry</Button>
          }
        >
          {error}
        </Alert>
      </Collapse>

      {/* Loading */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <LoadingScreen />
          </CardContent>
        </Card>
      )}

      {/* Plan output */}
      {plan && (
        <>
          {/* Summary banner */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card
              sx={{
                mb: 3,
                background: "linear-gradient(135deg, rgba(0,230,118,0.1), rgba(124,77,255,0.08))",
                border: "1px solid rgba(0,230,118,0.25)",
              }}
            >
              <CardContent sx={{ p: 3, display: "flex", gap: 2, alignItems: "flex-start" }}>
                <AutoAwesomeIcon sx={{ color: "primary.main", mt: 0.3, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="primary.main" fontWeight={700} mb={0.5}>
                    Your AI Coach says:
                  </Typography>
                  <Typography variant="body1" color="text.primary" lineHeight={1.7}>
                    {plan.summary}
                  </Typography>
                </Box>
                <Button
                  id="regenerate-plan-btn"
                  variant="outlined"
                  size="small"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={handleGenerate}
                  sx={{ flexShrink: 0, borderColor: "rgba(255,255,255,0.15)" }}
                >
                  Regenerate
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Motivation banner */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <Card
              sx={{
                mb: 3,
                bgcolor: "rgba(124,77,255,0.08)",
                border: "1px solid rgba(124,77,255,0.2)",
              }}
            >
              <CardContent sx={{ py: 2, px: 3, display: "flex", gap: 2, alignItems: "center" }}>
                <LightbulbIcon sx={{ color: "#ffab40", flexShrink: 0 }} />
                <Typography variant="body2" fontStyle="italic" color="text.secondary">
                  &ldquo;{plan.motivation}&rdquo;
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          <Grid container spacing={3}>
            {/* Recovery */}
            <Grid item xs={12} md={6}>
              <SectionCard icon={<DirectionsRunIcon fontSize="small" />} title="Recovery Plan" color="#00E676" delay={0.2}>
                <Typography variant="body2" color="text.secondary" mb={1.5} fontWeight={600}>
                  COOL-DOWN STRETCHES
                </Typography>
                <BulletList items={plan.recovery.cool_down} color="#00E676" />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>REST ADVICE</Typography>
                <Typography variant="body2" color="text.secondary" mb={1.5}>{plan.recovery.rest_recommendation}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>EXPECT SORENESS IN</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                  {plan.recovery.soreness_areas.map((area) => (
                    <Chip key={area} label={area} size="small" sx={{ bgcolor: "rgba(0,230,118,0.1)", color: "#00E676" }} />
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>RECOVERY TIPS</Typography>
                <BulletList items={plan.recovery.tips} color="#00E676" />
              </SectionCard>
            </Grid>

            {/* Nutrition */}
            <Grid item xs={12} md={6}>
              <SectionCard icon={<RestaurantIcon fontSize="small" />} title="Nutrition Plan" color="#ffab40" delay={0.3}>
                {/* Post-workout meal */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255,171,64,0.08)",
                    border: "1px solid rgba(255,171,64,0.2)",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={700} mb={0.5}>
                    POST-WORKOUT MEAL
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="text.primary" mb={1.5}>
                    {plan.nutrition.post_workout_meal.description}
                  </Typography>
                  <MacroBar label="Protein" value={plan.nutrition.post_workout_meal.protein_g} max={60} color="#00E676" />
                  <MacroBar label="Carbs" value={plan.nutrition.post_workout_meal.carbs_g} max={120} color="#ffab40" />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                    <Chip
                      label={`~${plan.nutrition.post_workout_meal.calories} kcal`}
                      size="small"
                      sx={{ bgcolor: "rgba(255,171,64,0.15)", color: "#ffab40", fontWeight: 700 }}
                    />
                  </Box>
                </Box>

                {/* Hydration */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <WaterDropIcon sx={{ color: "#2196f3", fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">HYDRATION TARGET</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: "#2196f3", ml: "auto" }}>
                      {(plan.nutrition.hydration_ml / 1000).toFixed(1)}L
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={hydrationPct}
                    sx={{
                      height: 8,
                      borderRadius: 99,
                      bgcolor: "rgba(33,150,243,0.1)",
                      "& .MuiLinearProgress-bar": { bgcolor: "#2196f3", borderRadius: 99 },
                    }}
                  />
                </Box>

                {/* Snacks */}
                <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>HEALTHY SNACKS</Typography>
                <BulletList items={plan.nutrition.snacks} color="#ffab40" />
                <Divider sx={{ my: 2 }} />

                {/* Avoid */}
                <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>AVOID TODAY</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {plan.nutrition.avoid.map((item, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <BlockIcon sx={{ fontSize: 16, mt: 0.3, color: "#ff5252", flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">{item}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Pre next workout */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>BEFORE NEXT WORKOUT</Typography>
                <Typography variant="body2" color="text.secondary">{plan.nutrition.pre_next_workout}</Typography>
              </SectionCard>
            </Grid>

            {/* Next Workout */}
            <Grid item xs={12}>
              <SectionCard icon={<TrendingUpIcon fontSize="small" />} title="Next Workout Recommendation" color="#7C4DFF" delay={0.4}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>RECOMMENDED EXERCISE</Typography>
                    <Typography variant="body1" fontWeight={700} color="secondary.main">
                      {plan.next_workout.recommendation}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>TARGET REPS</Typography>
                    <Typography variant="h3" fontWeight={900} color="secondary.main">
                      {plan.next_workout.target_reps}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>FORM FOCUS</Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "rgba(124,77,255,0.1)",
                        border: "1px solid rgba(124,77,255,0.2)",
                      }}
                    >
                      <Typography variant="body2" color="secondary.light" fontWeight={600}>
                        {plan.next_workout.focus}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
