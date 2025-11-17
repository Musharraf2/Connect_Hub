import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

interface UseWebSocketOptions {
  url: string;
  topics: string[];
  onMessage: (topic: string, message: any) => void;
  enabled?: boolean;
  userId?: number;
}

export const useWebSocket = ({ url, topics, onMessage, enabled = true, userId }: UseWebSocketOptions) => {
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<{ [key: string]: any }>({});

  const connect = useCallback(() => {
    if (!enabled || clientRef.current?.connected) return;

    // Append userId to URL if provided
    const wsUrl = userId ? `${url}?userId=${userId}` : url;
    const socket = new SockJS(wsUrl);
    const client = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[WebSocket]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WebSocket] Connected');
        
        // Subscribe to all topics
        topics.forEach((topic) => {
          if (!subscriptionsRef.current[topic]) {
            subscriptionsRef.current[topic] = client.subscribe(topic, (message: IMessage) => {
              try {
                const data = JSON.parse(message.body);
                onMessage(topic, data);
              } catch (error) {
                console.error('[WebSocket] Parse error:', error);
                onMessage(topic, message.body);
              }
            });
          }
        });
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
      },
      onStompError: (frame) => {
        console.error('[WebSocket] Error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [url, topics, onMessage, enabled, userId]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      // Unsubscribe from all topics
      Object.keys(subscriptionsRef.current).forEach((topic) => {
        subscriptionsRef.current[topic]?.unsubscribe();
      });
      subscriptionsRef.current = {};

      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled]);

  return {
    isConnected: clientRef.current?.connected ?? false,
    disconnect,
  };
};
