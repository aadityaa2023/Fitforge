// hooks/useWebSocket.js — Manages WebSocket lifecycle for workout sessions
import { useEffect, useRef, useCallback, useState } from "react";

const WS_URL = "ws://localhost:8000/ws/workout";

export function useWorkoutWebSocket(exercise, onMessage) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!exercise) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (_) {}
    };

    ws.onerror = () => {
      setError("WebSocket connection failed");
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [exercise]); // reconnect when exercise changes

  const sendFrame = useCallback((frameB64) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ frame: frameB64, exercise }));
    }
  }, [exercise]);

  return { connected, error, sendFrame };
}
