'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types';
import toast from 'react-hot-toast';

export default function AtendimentosPage() {
  const { company } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const loadPending = async () => {
    try {
      const res = await api.get('/conversations?status=PENDING&limit=50');
      setConversations(res.data.conversations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
    const interval = setInterval(loadPending, 8000);
    return () => clearInterval(interval);
  }, []);

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

        socket.on('connect', () => {
          socket.emit('join-company', company.id);
        });

        socket.on('human-needed', (data: { conversationId: string; clientName: string; clientPhone: string; lastMessage: string }) => {
          setConversations(prev => {
            const exists = prev.find(c => c.id === data.conversationId);
            if (exists) {
              return prev.map(c =>
                c.id === data.conversationId
                  ? { ...c, lastMessage: data.lastMessage }
                  : c
              );
            }
            return [
              {
                id: data.conversationId,
                clientName: data.clientName,
                clientPhone: data.clientPhone,
                lastMessage: data.lastMessage,
                lastMessageAt: new Date().toISOString(),
                unreadCount: 0,
                status: 'PENDING',
                aiEnabled: false,
              },
              ...prev,
            ];
          });
        });

        socket.on('human-resolved', (data: { conversationId: string }) => {
          setConversations(prev => prev.filter(c => c.id !== data.conversationId));
        });
      });

    return () => {
      cancelled = true;
      activeSocket?.disconnect();
      socketRef.current = null;
    };
  }, [company?.id]);

  const resolve = async (convId: string) => {
    setResolving(convId);
    try {
      await api.patch(`/conversations/${convId}/resolve`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      toast.success('Conversa resolvida');
    } catch {
      toast.error('Erro ao resolver conversa');
    } finally {
      setResolving(null);
    }
  };

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Agora';
    if (diff === 1) return 'Há 1 minuto';
    return `Há ${diff} minutos`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Atendimentos Humanos</h1>
            {conversations.length > 0 && (
              <span className="relative flex items-center justify-center w-6 h-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50"></span>
                <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-xs font-bold text-white">
                  {conversations.length}
                </span>
              </span>
            )}
          </div>
          <p className="text-gray-400 mt-1">Conversas que precisam de atenção humana</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a]"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#1a1a1a] rounded w-1/4"></div>
                  <div className="h-3 bg-[#1a1a1a] rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="card-glass rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-lg font-medium text-green-400">Nenhum atendimento pendente</p>
          <p className="text-sm text-gray-500 mt-2">Todos os clientes estão sendo atendidos pela IA</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map(conv => (
            <div key={conv.id} className="card-glass rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-wine rounded-full flex items-center justify-center text-base font-bold flex-shrink-0">
                  {(conv.clientName || conv.clientPhone)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-medium">{conv.clientName || conv.clientPhone}</p>
                    <p className="text-xs text-gray-500 flex-shrink-0">{timeAgo(conv.lastMessageAt)}</p>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5 truncate">{conv.clientPhone}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{conv.lastMessage}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1a1a1a]">
                <Link
                  href={`/chat?id=${conv.id}`}
                  className="flex-1 text-center py-2 px-4 rounded-lg text-sm font-medium bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300 hover:text-white transition-all"
                >
                  Abrir Chat
                </Link>
                <button
                  onClick={() => resolve(conv.id)}
                  disabled={resolving === conv.id}
                  className="flex-1 btn-wine py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {resolving === conv.id ? 'Resolvendo...' : 'Resolver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
