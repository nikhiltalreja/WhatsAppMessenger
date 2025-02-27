import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected';

export function WhatsAppStatus() {
  const [status, setStatus] = useState<WhatsAppStatus>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
              if (data.status === 'connected') {
                setIsLoading(false);
                toast({
                  title: "WhatsApp Connected",
                  description: "Successfully connected to WhatsApp Web"
                });
              } else if (data.status === 'disconnected') {
                setIsLoading(false);
              }
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

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/whatsapp-connect', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to connect to WhatsApp');
      }
      toast({
        description: "Launching WhatsApp Web. Please scan the QR code when prompted."
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to WhatsApp Web. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/whatsapp-disconnect', { method: 'POST' });
      toast({
        description: "Disconnected from WhatsApp Web"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect from WhatsApp Web",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      {status === 'connected' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Disconnect
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
          disabled={isLoading || status === 'connecting'}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Connect
        </Button>
      )}
    </div>
  );
}