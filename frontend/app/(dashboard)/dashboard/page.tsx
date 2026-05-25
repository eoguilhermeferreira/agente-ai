'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats, Conversation } from '@/types';

interface DashboardData {
  stats: DashboardStats;
  whatsapp: { status: string; connected: boolean; qrCode: string | null };
  recentConversations: Conversation[];
}

export default function DashboardPage() {
  const { user, company } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    CONNECTED: 'text-green-400 bg-green-400/10',
    DISCONNECTED: 'text-red-400 bg-red-400/10',
    CONNECTING: 'text-yellow-400 bg-yellow-400/10',
    QR_CODE: 'text-blue-400 bg-blue-400/10',
  };

  const statusLabel = {
    CONNECTED: 'Conectado',
    DISCONNECTED: 'Desconectado',
    CONNECTING: 'Conectando...',
    QR_CODE: 'Aguardando QR',
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500">Carregando dashboard...</div>
      </div>
    );
  }

  const whatsappStatus = (data?.whatsapp?.status as keyof typeof statusColor) || 'DISCONNECTED';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Olá, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">Bem-vindo ao painel da {company?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total de Conversas', value: data?.stats.totalConversations ?? 0, icon: '💬' },
          { label: 'Conversas Abertas', value: data?.stats.openConversations ?? 0, icon: '📂' },
          { label: 'Mensagens Hoje', value: data?.stats.todayMessages ?? 0, icon: '📨' },
          { label: 'Total de Mensagens', value: data?.stats.totalMessages ?? 0, icon: '📊' },
        ].map((stat) => (
          <div key={stat.label} className="card-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold">{stat.value.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* WhatsApp Status */}
        <div className="card-glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Status do WhatsApp</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[whatsappStatus]}`}>
              {statusLabel[whatsappStatus]}
            </span>
          </div>

          {data?.whatsapp.qrCode && !data.whatsapp.connected ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-400">Escaneie o QR Code com seu WhatsApp</p>
              <div className="p-4 bg-white rounded-xl">
                <img
                  src={data.whatsapp.qrCode.startsWith('data:') ? data.whatsapp.qrCode : `data:image/png;base64,${data.whatsapp.qrCode}`}
                  alt="QR Code WhatsApp"
                  width={200}
                  height={200}
                />
              </div>
              <p className="text-xs text-gray-500">WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
            </div>
          ) : data?.whatsapp.connected ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-green-400 font-medium">WhatsApp conectado e funcionando</p>
              <p className="text-xs text-gray-500">A IA está respondendo automaticamente</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 bg-[#A61B4D]/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">📱</span>
              </div>
              <p className="text-gray-400 text-sm">WhatsApp não conectado</p>
              <Link
                href="/whatsapp"
                className="btn-wine px-6 py-2 rounded-lg text-sm font-medium"
              >
                Conectar WhatsApp
              </Link>
            </div>
          )}
        </div>

        {/* Recent conversations */}
        <div className="card-glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Conversas Recentes</h2>
            <Link href="/chat" className="text-xs text-[#A61B4D] hover:text-[#c42460]">
              Ver todas →
            </Link>
          </div>

          {data?.recentConversations && data.recentConversations.length > 0 ? (
            <div className="space-y-3">
              {data.recentConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat?id=${conv.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors"
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
                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#A61B4D] rounded-full text-xs flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhuma conversa ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
