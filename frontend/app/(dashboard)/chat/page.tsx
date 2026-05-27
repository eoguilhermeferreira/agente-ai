'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message } from '@/types';
import toast from 'react-hot-toast';

function ChatContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');
  const { company } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedConvRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedRef = useRef<Conversation | null>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    selectedRef.current = selected;
    setIsTyping(false);
  }, [selected]);

  // Socket.io — connects once company is loaded
  useEffect(() => {
    if (!company?.id) return;

    let cancelled = false;
    let activeSocket: Socket | null = null;

    fetch('/api/config')
      .then(r => r.json())
      .then(({ socketUrl }: { socketUrl: string }) => {
        if (cancelled || !socketUrl) return;

        const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
        activeSocket = socket;
        socketRef.current = socket;

        const joinRooms = () => {
          socket.emit('join-company', company.id);
          if (selectedRef.current) {
            socket.emit('join-conversation', selectedRef.current.id);
          }
        };

        socket.on('connect', joinRooms);

        socket.on('new-message', (data: { conversationId: string; message: string; fromMe: boolean; clientName?: string; clientPhone?: string }) => {
          setConversations(prev =>
            prev.map(c => c.id === data.conversationId
              ? {
                  ...c,
                  lastMessage: data.message,
                  unreadCount: selectedRef.current?.id === data.conversationId ? 0 : c.unreadCount + 1,
                }
              : c
            )
          );
        });

        socket.on('message', (msg: { content: string; fromMe: boolean; createdAt: string }) => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: `ws-${Date.now()}-${Math.random()}`,
              content: msg.content,
              fromMe: msg.fromMe,
              type: 'TEXT' as const,
              status: 'SENT' as const,
              createdAt: msg.createdAt,
            },
          ]);
        });

        socket.on('typing', (data: { conversationId: string }) => {
          if (selectedRef.current?.id === data.conversationId) {
            setIsTyping(true);
          }
        });

        socket.on('stop-typing', (data: { conversationId: string }) => {
          if (selectedRef.current?.id === data.conversationId) {
            setIsTyping(false);
          }
        });
      });

    return () => {
      cancelled = true;
      activeSocket?.disconnect();
      socketRef.current = null;
    };
  }, [company?.id]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === selectedId);
      if (conv && loadedConvRef.current !== selectedId) {
        loadedConvRef.current = selectedId;
        selectConversation(conv);
      }
    }
  }, [selectedId, conversations]);

  useEffect(() => {
    if (selected && socketRef.current?.connected) {
      socketRef.current.emit('join-conversation', selected.id);
    }
  }, [selected]);

  // Polling fallback: refresh messages every 4s when a conversation is open
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/conversations/${selected.id}/messages`);
        const incoming: Message[] = res.data.messages;
        // Only update if there are new messages (avoid unnecessary re-renders)
        if (incoming.length > messagesRef.current.length) {
          setMessages(incoming);
        }
      } catch {
        // silent
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/conversations?limit=50');
      setConversations(res.data.conversations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setSelected(conv);
    setLoadingMsgs(true);
    try {
      const res = await api.get(`/conversations/${conv.id}/messages`);
      setMessages(res.data.messages);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );
      // Join conversation room directly here as well, in case socket was already connected
      // when selected changed (the useEffect may have missed the window)
      if (socketRef.current?.connected) {
        socketRef.current.emit('join-conversation', conv.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected || sending) return;

    setSending(true);
    const content = newMsg;
    setNewMsg('');

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      content,
      fromMe: true,
      type: 'TEXT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.post(`/conversations/${selected.id}/send`, { message: content });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, lastMessage: content } : c
        )
      );
    } catch {
      toast.error('Erro ao enviar mensagem');
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setNewMsg(content);
    } finally {
      setSending(false);
    }
  };

  const toggleAI = async () => {
    if (!selected) return;
    try {
      const res = await api.patch(`/conversations/${selected.id}/toggle-ai`);
      setSelected({ ...selected, aiEnabled: res.data.aiEnabled });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, aiEnabled: res.data.aiEnabled } : c
        )
      );
      toast.success(res.data.aiEnabled ? 'IA ativada' : 'IA desativada para esta conversa');
    } catch {
      toast.error('Erro ao alternar IA');
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex">
      {/* Conversations list */}
      <div className="w-80 border-r border-[#1a1a1a] flex flex-col bg-[#0D0D0D]">
        <div className="p-4 border-b border-[#1a1a1a]">
          <h2 className="font-semibold text-lg">Chat ao Vivo</h2>
          <p className="text-xs text-gray-500 mt-1">{conversations.length} conversa(s)</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 text-center text-gray-500 text-sm">Carregando...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm text-gray-400">Nenhuma conversa ainda</p>
              <p className="text-xs text-gray-600 mt-1">Conecte o WhatsApp para começar</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#141414] transition-colors border-b border-[#0f0f0f] text-left ${
                  selected?.id === conv.id ? 'bg-[#1a1a1a] border-l-2 border-l-[#A61B4D]' : ''
                }`}
              >
                <div className="w-10 h-10 gradient-wine rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {(conv.clientName || conv.clientPhone)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {conv.clientName || conv.clientPhone}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-1 w-5 h-5 bg-[#A61B4D] rounded-full text-xs flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-4">💬</p>
              <h3 className="font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-gray-400 text-sm">Escolha uma conversa na lista ao lado</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0D0D0D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-wine rounded-full flex items-center justify-center text-sm font-bold">
                  {(selected.clientName || selected.clientPhone)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{selected.clientName || selected.clientPhone}</p>
                  {isTyping ? (
                    <p className="text-xs text-[#A61B4D] animate-pulse">IA digitando...</p>
                  ) : (
                    <p className="text-xs text-gray-500">{selected.clientPhone}</p>
                  )}
                </div>
              </div>
              <button
                onClick={toggleAI}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selected.aiEnabled
                    ? 'bg-[#A61B4D]/20 text-[#A61B4D] hover:bg-[#A61B4D]/30'
                    : 'bg-[#1a1a1a] text-gray-500 hover:bg-[#2a2a2a]'
                }`}
              >
                🤖 IA {selected.aiEnabled ? 'Ativa' : 'Inativa'}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#090909]">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">Carregando mensagens...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Nenhuma mensagem
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.fromMe
                          ? 'gradient-wine rounded-br-sm text-white'
                          : 'bg-[#1a1a1a] rounded-bl-sm text-gray-100'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.fromMe ? 'text-white/60' : 'text-gray-500'} text-right`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="px-4 py-4 border-t border-[#1a1a1a] bg-[#0D0D0D] flex gap-3">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="input-dark flex-1 rounded-xl px-4 py-3 text-sm"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMsg.trim() || sending}
                className="btn-wine px-5 py-3 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? '...' : '→'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Carregando...</div>}>
      <ChatContent />
    </Suspense>
  );
}
