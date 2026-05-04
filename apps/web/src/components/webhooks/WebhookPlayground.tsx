'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Webhook, 
  Check, 
  AlertCircle, 
  Clock, 
  Copy,
  Trash2,
  Play,
  RefreshCw
} from 'lucide-react';

interface WebhookEvent {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  response?: {
    status: number;
    body: string;
    latency: number;
  };
}

interface WebhookPlaygroundProps {
  webhookUrl: string;
  availableEvents: string[];
}

const samplePayloads: Record<string, Record<string, unknown>> = {
  'product.created': {
    event: 'product.created',
    data: {
      id: 'prod_123',
      title: 'iPhone 15 Pro',
      sku: 'APP-IPH15-001',
      price: 79999.99,
      stock: 150,
    },
    timestamp: new Date().toISOString(),
  },
  'product.updated': {
    event: 'product.updated',
    data: {
      id: 'prod_123',
      changes: {
        price: { old: 74999.99, new: 79999.99 },
        stock: { old: 200, new: 150 },
      },
    },
    timestamp: new Date().toISOString(),
  },
  'order.created': {
    event: 'order.created',
    data: {
      id: 'ord_456',
      platform: 'TRENDYOL',
      totalAmount: 1250.00,
      customer: {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
      },
      items: [
        { productId: 'prod_123', quantity: 2, price: 625.00 },
      ],
    },
    timestamp: new Date().toISOString(),
  },
  'stock.low': {
    event: 'stock.low',
    data: {
      productId: 'prod_789',
      title: 'MacBook Pro',
      currentStock: 5,
      threshold: 10,
    },
    timestamp: new Date().toISOString(),
  },
};

export function WebhookPlayground({ webhookUrl, availableEvents }: WebhookPlaygroundProps) {
  const [selectedEvent, setSelectedEvent] = useState(availableEvents[0]);
  const [customPayload, setCustomPayload] = useState('');
  const [useCustomPayload, setUseCustomPayload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<WebhookEvent[]>([]);

  const sendWebhook = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    const payload = useCustomPayload 
      ? JSON.parse(customPayload)
      : samplePayloads[selectedEvent];

    const newEvent: WebhookEvent = {
      id: `evt_${Date.now()}`,
      event: selectedEvent,
      payload,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    setEvents(prev => [newEvent, ...prev]);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': selectedEvent,
          'X-Webhook-Signature': 'test-signature',
        },
        body: JSON.stringify(payload),
      });

      const body = await response.text();
      const latency = Date.now() - startTime;

      setEvents(prev => prev.map(e => 
        e.id === newEvent.id 
          ? {
              ...e,
              status: response.ok ? 'success' : 'error',
              response: {
                status: response.status,
                body: body.slice(0, 500),
                latency,
              },
            }
          : e
      ));
    } catch (error) {
      setEvents(prev => prev.map(e => 
        e.id === newEvent.id 
          ? {
              ...e,
              status: 'error',
              response: {
                status: 0,
                body: error instanceof Error ? error.message : 'Network error',
                latency: Date.now() - startTime,
              },
            }
          : e
      ));
    }

    setIsLoading(false);
  };

  const clearEvents = () => setEvents([]);

  const copyPayload = (payload: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center gap-3">
          <Webhook className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-lg font-semibold text-white">Webhook Playground</h2>
            <p className="text-sm text-white/80">Test webhook entegrasyonunuz</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-0">
        {/* Left Panel - Configuration */}
        <div className="p-6 border-r border-slate-200 dark:border-slate-700">
          <div className="space-y-6">
            {/* Webhook URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Webhook URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Event Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Event Türü
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              >
                {availableEvents.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>

            {/* Payload Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="custom-payload"
                checked={useCustomPayload}
                onChange={(e) => setUseCustomPayload(e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="custom-payload" className="text-sm text-slate-700 dark:text-slate-300">
                Özel payload kullan
              </label>
            </div>

            {/* Payload Editor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payload (JSON)
              </label>
              <textarea
                value={useCustomPayload ? customPayload : JSON.stringify(samplePayloads[selectedEvent], null, 2)}
                onChange={(e) => useCustomPayload && setCustomPayload(e.target.value)}
                readOnly={!useCustomPayload}
                rows={12}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={sendWebhook}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Webhook Gönder
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - Event Log */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Gönderim Geçmişi ({events.length})
            </h3>
            <button
              onClick={clearEvents}
              disabled={events.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Temizle
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Henüz webhook gönderilmedi</p>
                <p className="text-sm mt-1">Soldaki formu doldurun ve gönderin</p>
              </div>
            ) : (
              events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    event.status === 'success'
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : event.status === 'error'
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {event.status === 'success' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : event.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      )}
                      <span className="font-medium text-sm">{event.event}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {event.response && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${
                          event.response.status >= 200 && event.response.status < 300
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          Status: {event.response.status || 'Error'}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.response.latency}ms
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-mono line-clamp-3">
                        {event.response.body}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => copyPayload(event.payload)}
                    className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    <Copy className="w-3 h-3" />
                    Payload'ı kopyala
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebhookPlayground;
