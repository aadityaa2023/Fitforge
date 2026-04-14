import { useState, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, Typography, Box,
  TextField, Switch, FormControlLabel, IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

const PLATES_LBS = [45, 35, 25, 10, 5, 2.5];
const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

export default function PlateCalculator({ open, onClose }) {
  const [weight, setWeight] = useState(135);
  const [barWeight, setBarWeight] = useState(45);
  const [isKg, setIsKg] = useState(false);

  const calculatePlates = () => {
    let platesToPut = [];
    let remaining = weight - barWeight;
    if (remaining <= 0) return platesToPut;
    
    // Each side gets half
    let sideWeight = remaining / 2;
    const availablePlates = isKg ? PLATES_KG : PLATES_LBS;

    for (let p of availablePlates) {
      while (sideWeight >= p) {
        platesToPut.push(p);
        sideWeight -= p;
      }
    }

    return platesToPut;
  };

  const plates = useMemo(() => calculatePlates(), [weight, barWeight, isKg]);

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { background: "rgba(18,18,26,0.98)", borderRadius: 3, minWidth: 320 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FitnessCenterIcon color="primary" />
          <Typography fontWeight={700}>Plate Calculator</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3, pt: 1 }}>
          <TextField 
            label="Target Weight" 
            type="number"
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))} 
            fullWidth
          />
          <TextField 
            label="Barbell Weight" 
            type="number"
            value={barWeight} 
            onChange={(e) => setBarWeight(Number(e.target.value))} 
            fullWidth
          />
        </Box>
        <FormControlLabel
          control={<Switch checked={isKg} onChange={(e) => setIsKg(e.target.checked)} color="primary" />}
          label={isKg ? "Kilograms (KG)" : "Pounds (LBS)"}
          sx={{ mb: 3 }}
        />
        
        <Box p={2} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={1} align="center">
            PER SIDE
          </Typography>
          <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
            {plates.length === 0 ? (
              <Typography color="text.secondary">Just the bar!</Typography>
            ) : (
              plates.map((val, idx) => (
                <Box 
                  key={idx}
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "black",
                    fontWeight: "bold",
                    flexShrink: 0,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
                  }}
                >
                  {val}
                </Box>
              ))
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
