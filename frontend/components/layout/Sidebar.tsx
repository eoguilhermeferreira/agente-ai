'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { LayoutDashboard, Smartphone, MessageSquare, Headphones, Settings } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function playAlertSound() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const pattern = [880, 1100, 880, 1100, 880, 1320, 880];
    let t = ctx.currentTime;
    pattern.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.9, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
      t += 0.26;
    });
    setTimeout(() => ctx.close(), 3000);
  } catch {}
}

const staticNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/whatsapp', icon: Smartphone, label: 'WhatsApp' },
  { href: '/chat', icon: MessageSquare, label: 'Chat ao Vivo' },
  { href: '/atendimentos', icon: Headphones, label: 'Atendimentos' },
  { href: '/settings', icon: Settings, label: 'Configurações' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, company, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  usePushNotifications();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/conversations?status=PENDING&limit=1');
        setPendingCount(res.data.total ?? 0);
      } catch {
        // silent
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 15000);
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

        socket.on('human-needed', (data: { clientName?: string; clientPhone?: string }) => {
          setPendingCount(prev => prev + 1);
          playAlertSound();
          if (Notification.permission === 'granted') {
            const name = data?.clientName || data?.clientPhone || 'Cliente';
            new Notification('🚨 Atendimento Humano Necessário!', {
              body: `${name} precisa de atendimento humano agora.`,
              icon: '/chatnex-icon.png',
              requireInteraction: true,
              tag: 'human-needed',
            });
          }
        });

        socket.on('human-resolved', () => {
          setPendingCount(prev => Math.max(0, prev - 1));
        });
      });

    return () => {
      cancelled = true;
      activeSocket?.disconnect();
      socketRef.current = null;
    };
  }, [company?.id]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[#0D0D0D] border-r border-[#1a1a1a] flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <Image src="/chatnex-icon.png" alt="ChatNex" width={36} height={36} className="rounded-lg" />
            <div>
              <p className="font-bold text-base">Chat<span className="text-gradient">Nex</span></p>
            </div>
          </div>
        </div>

        {/* Company info */}
        {company && (
          <div className="px-4 py-3 mx-3 mt-3 bg-[#141414] rounded-lg border border-[#1a1a1a]">
            <p className="text-xs text-gray-500">Empresa</p>
            <p className="text-sm font-medium truncate">{company.name}</p>
            <span className="inline-block text-xs bg-[#A61B4D]/20 text-[#A61B4D] px-2 py-0.5 rounded-full mt-1">
              {company.plan}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {staticNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isAtendimentos = item.href === '/atendimentos';
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full ${
                  isActive ? 'active text-[#A61B4D]' : 'text-gray-400'
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {isAtendimentos && pendingCount > 0 && (
                  <span className="w-5 h-5 bg-red-600 rounded-full text-xs flex items-center justify-center text-white font-bold flex-shrink-0">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 gradient-wine rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs text-gray-500 hover:text-[#A61B4D] py-2 rounded-lg hover:bg-[#1a1a1a] transition-all"
          >
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D] border-t border-[#1a1a1a] flex items-center justify-around px-2 py-2">
        {staticNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isAtendimentos = item.href === '/atendimentos';
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-[#A61B4D]' : 'text-gray-500'
              }`}
            >
              <Icon size={22} strokeWidth={1.75} />
              <span className="text-[10px] font-medium leading-none">
                {item.label === 'Inteligência Artificial' ? 'IA' : item.label === 'Configurações' ? 'Config' : item.label === 'Chat ao Vivo' ? 'Chat' : item.label === 'Atendimentos' ? 'Atend.' : item.label}
              </span>
              {isAtendimentos && pendingCount > 0 && (
                <span className="absolute -top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
