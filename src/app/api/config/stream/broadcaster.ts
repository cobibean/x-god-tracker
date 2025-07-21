import { ConfigType } from '@/lib/config-schemas';

// Store active SSE connections
const clients = new Set<ReadableStreamDefaultController>();

export function addClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
}

export function removeClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
}

export async function broadcastConfigChange(type: ConfigType, data: unknown) {
  const message = JSON.stringify({ type, data });
  const sseData = `data: ${message}\n\n`;

  // Send to all connected clients
  for (const client of clients) {
    try {
      client.enqueue(new TextEncoder().encode(sseData));
    } catch {
      // Remove disconnected clients
      clients.delete(client);
      console.log('Removed disconnected SSE client');
    }
  }
}

export function getClientCount(): number {
  return clients.size;
} 