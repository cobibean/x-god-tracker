import { NextRequest } from 'next/server';
import { addClient, removeClient } from './broadcaster';

// GET /api/config/stream - Server-Sent Events endpoint
export async function GET(request: NextRequest) {
  // Check if client accepts text/event-stream
  const acceptHeader = request.headers.get('accept');
  if (!acceptHeader?.includes('text/event-stream')) {
    return new Response('SSE endpoint - use EventSource to connect', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Create readable stream for SSE
  let currentController: ReadableStreamDefaultController | null = null;
  let keepAliveInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      currentController = controller;
      
      // Add client to broadcaster
      addClient(controller);

      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({ 
        type: 'connection', 
        message: 'Connected to config updates',
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(welcomeMessage));

      // Setup keep-alive ping every 30 seconds
      keepAliveInterval = setInterval(() => {
        try {
          const pingMessage = `data: ${JSON.stringify({ 
            type: 'ping', 
            timestamp: new Date().toISOString() 
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(pingMessage));
        } catch (error) {
          // Client disconnected
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
            keepAliveInterval = null;
          }
          removeClient(controller);
        }
      }, 30000);
    },

    cancel(reason) {
      // Clean up when client disconnects
      if (currentController) {
        removeClient(currentController);
        currentController = null;
      }
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      console.log('SSE client disconnected:', reason);
    }
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Accept, Cache-Control',
    },
  });
} 