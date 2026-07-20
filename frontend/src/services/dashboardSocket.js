const DEFAULT_WS_URL = "ws://localhost:8000/ws/dashboard";

export function connectDashboardSocket({ onData, onError, onStatusChange }) {
  let socket = null;
  let reconnectTimer = null;
  let stopped = false;

  const wsUrl = import.meta.env.VITE_DASHBOARD_WS_URL ?? DEFAULT_WS_URL;

  const connect = () => {
    if (stopped) {
      return;
    }

    onStatusChange?.("connecting");

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      onStatusChange?.("connected");

      // The backend waits for messages while its broadcaster sends updates.
      socket.send("subscribe");
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload?.type === "error") {
          onError?.(new Error(payload.message));
          return;
        }

        onData?.(payload);
      } catch (error) {
        onError?.(error);
      }
    };

    socket.onerror = () => {
      onStatusChange?.("error");
    };

    socket.onclose = () => {
      onStatusChange?.("disconnected");

      if (!stopped) {
        reconnectTimer = window.setTimeout(connect, 3000);
      }
    };
  };

  connect();

  return () => {
    stopped = true;

    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
    }

    if (socket) {
      socket.close();
    }
  };
}
