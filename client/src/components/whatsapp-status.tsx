import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected';

export function WhatsAppStatus() {
  const [status, setStatus] = useState<WhatsAppStatus>('disconnected');

  useEffect(() => {
    // Initial status check
    fetch('/api/whatsapp-status')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('disconnected'));

    // WebSocket connection for real-time updates
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      try {
        ws = new WebSocket(`ws://${window.location.host}/ws`);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'whatsapp_status') {
              setStatus(data.status);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          // Try to reconnect after 2 seconds
          reconnectTimer = setTimeout(connect, 2000);
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        reconnectTimer = setTimeout(connect, 2000);
      }
    }

    connect();

    // Cleanup
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">WhatsApp Status:</span>
      {status === 'connected' && (
        <Badge className="bg-green-500 hover:bg-green-600">
          Connected
        </Badge>
      )}
      {status === 'connecting' && (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Loader2 className="h-3 w-4 animate-spin mr-1" />
          Connecting
        </Badge>
      )}
      {status === 'disconnected' && (
        <Badge variant="destructive">
          Disconnected
        </Badge>
      )}
    </div>
  );
}