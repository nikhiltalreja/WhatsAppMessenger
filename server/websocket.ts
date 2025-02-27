import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ 
    server,
    path: '/ws' 
  });

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });
  });
}

export function broadcastStatus(status: 'disconnected' | 'connecting' | 'connected') {
  const message = JSON.stringify({ type: 'whatsapp_status', status });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}