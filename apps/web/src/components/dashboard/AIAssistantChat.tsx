'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  MessageSquare,
  History,
  Plus,
  MoreVertical,
  Archive,
  Trash2,
  Edit3,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  Tag,
  Layers,
  Package,
  Palette,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    data?: any;
    status?: 'pending' | 'completed' | 'failed';
  };
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}

interface AIAssistantChatProps {
  className?: string;
}

export function AIAssistantChat({ className }: AIAssistantChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/ai-assistant/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/ai-assistant/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Yeni Konuşma' }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          conversationId: activeConversation?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!activeConversation) {
          // New conversation was created
          setActiveConversation({
            id: data.conversationId,
            title: 'Yeni Konuşma',
            messages: [
              { id: '1', role: 'user', content: messageContent, timestamp: new Date() },
              { id: '2', role: 'assistant', content: data.message.content, timestamp: new Date(), metadata: data.message.metadata },
            ],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          // Add to existing conversation
          setActiveConversation(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [
                ...prev.messages,
                { id: Date.now().toString(), role: 'user', content: messageContent, timestamp: new Date() },
                { id: (Date.now() + 1).toString(), role: 'assistant', content: data.message.content, timestamp: new Date(), metadata: data.message.metadata },
              ],
              updatedAt: new Date(),
            };
          });
        }

        loadConversations(); // Refresh sidebar
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'brand-sync',
      label: 'Marka Eşitleme',
      icon: <Tag className="w-4 h-4" />,
      description: 'Pazaryerlerinden markaları çek ve senkronize et',
      onClick: () => handleQuickAction('Marka eşitleme işlemi başlatıldı. Hangi pazaryerinden marka eşitlemek istediğinizi belirtin? (Trendyol, Amazon, vb.)'),
    },
    {
      id: 'category-sync',
      label: 'Kategori Eşitleme',
      icon: <Layers className="w-4 h-4" />,
      description: 'Kategori hiyerarşilerini ve özelliklerini eşitle',
      onClick: () => handleQuickAction('Kategori eşitleme işlemi başlatıldı. Hangi pazaryerinden kategori eşitlemek istediğinizi belirtin?'),
    },
    {
      id: 'product-upload',
      label: 'Ürün Yükleme',
      icon: <Package className="w-4 h-4" />,
      description: 'Tekli veya toplu ürün yükleme işlemi yap',
      onClick: () => handleQuickAction('Ürün yükleme işlemi başlatıldı. Yüklemek istediğiniz ürünün SKU veya ID\'sini belirtin.'),
    },
    {
      id: 'variant-manage',
      label: 'Varyant İşlemleri',
      icon: <Palette className="w-4 h-4" />,
      description: 'Varyant senkronizasyonu ve yönetimi',
      onClick: () => handleQuickAction('Varyant yönetimi başlatıldı. Hangi ürünün varyantlarını yönetmek istediğinizi belirtin.'),
    },
    {
      id: 'bulk-upload',
      label: 'Toplu Yükleme',
      icon: <Upload className="w-4 h-4" />,
      description: 'Excel/CSV ile toplu ürün yükleme',
      onClick: () => handleQuickAction('Toplu yükleme işlemi başlatıldı. Excel veya CSV dosyanızı yükleyebilirsiniz.'),
    },
  ];

  const handleQuickAction = async (initialMessage: string) => {
    await createNewConversation();
    // The user will see the initial message and can respond
  };

  const executeQuickAction = async (actionId: string, platform?: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (!action) return;

    let endpoint = '';
    switch (actionId) {
      case 'brand-sync':
        endpoint = '/api/ai-assistant/quick/brand-sync';
        break;
      case 'category-sync':
        endpoint = '/api/ai-assistant/quick/category-sync';
        break;
      case 'product-upload':
        endpoint = '/api/ai-assistant/quick/product-upload';
        break;
      default:
        return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveConversation({
          id: data.conversationId,
          title: action.label,
          messages: [
            { id: '1', role: 'assistant', content: data.message.content, timestamp: new Date(), metadata: data.message.metadata },
          ],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        loadConversations();
      }
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  return (
    <div className={cn('flex h-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl', className)}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={createNewConversation}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Yeni Konuşma
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-2">
                Konuşmalar
              </div>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                    activeConversation?.id === conv.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  )}
                >
                  <MessageSquare className="w-4 h-4 mt-0.5 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(conv.updatedAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  {conv.status === 'archived' && <Archive className="w-3 h-3 text-slate-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  Sopyo AI Asistan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pazaryeri Yönetimi AI
                </p>
              </div>
            </div>
          </div>
          
          {activeConversation && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {}}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Konuşmayı düzenle"
              >
                <Edit3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={() => {}}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Arşivle"
              >
                <Archive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={() => {}}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeConversation ? (
            // Welcome Screen with Quick Actions
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Sopyo AI Asistan'a Hoş Geldiniz
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  E-ticaret ve pazaryeri yönetiminde size yardımcı olmak için buradayım.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => executeQuickAction(action.id)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {action.label}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Active Conversation
            <>
              {activeConversation.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md'
                    )}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className={cn('mb-1 last:mb-0', line.startsWith('**') && 'font-semibold')}>
                          {line.replace(/\*\*/g, '')}
                        </p>
                      ))}
                    </div>
                    
                    {/* Status Badge */}
                    {message.metadata?.status && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        {message.metadata.status === 'pending' && (
                          <>
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-600 dark:text-amber-400">İşlem devam ediyor...</span>
                          </>
                        )}
                        {message.metadata.status === 'completed' && (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">İşlem tamamlandı</span>
                          </>
                        )}
                        {message.metadata.status === 'failed' && (
                          <>
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-600 dark:text-red-400">İşlem başarısız</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <p className={cn(
                      'text-xs mt-1',
                      message.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Yanıt yazılıyor...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={activeConversation ? "Mesajınızı yazın..." : "Yeni konuşma başlatmak için mesaj yazın..."}
                className="w-full px-4 py-3 pr-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[56px] max-h-[200px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                rows={1}
                style={{ height: 'auto' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className="text-xs text-center text-slate-400 mt-2">
            AI Asistan bazı hatalar yapabilir. Önemli kararlar için lütfen bilgileri kontrol edin.
          </p>
        </div>
      </div>
    </div>
  );
}
