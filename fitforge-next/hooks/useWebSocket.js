'use client';
/**
 * hooks/useWebSocket.js — WebSocket hook for workout pose analysis
 * Connects to the Python pose analysis microservice
 */
import { useEffect, useRef, useCallback, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/workout';

export function useWorkoutWebSocket(exercise, onMessage) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!exercise) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => { setConnected(true); setError(null); };
    ws.onmessage = (event) => {
      try { onMessage(JSON.parse(event.data)); } catch (_) {}
    };
    ws.onerror = () => setError('WebSocket connection failed');
    ws.onclose = () => setConnected(false);

    return () => { ws.close(); wsRef.current = null; };
  }, [exercise]);

  const sendFrame = useCallback((frameB64) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ frame: frameB64, exercise }));
    }
  }, [exercise]);

  return { connected, error, sendFrame };
}
