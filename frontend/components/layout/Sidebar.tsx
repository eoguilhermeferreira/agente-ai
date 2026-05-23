'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', icon: '⬛', label: 'Dashboard' },
  { href: '/whatsapp', icon: '📱', label: 'WhatsApp' },
  { href: '/chat', icon: '💬', label: 'Chat ao Vivo' },
  { href: '/settings', icon: '⚙️', label: 'Configurações' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, company, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0D0D0D] border-r border-[#1a1a1a] flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 gradient-wine rounded-lg flex items-center justify-center font-bold glow-wine-sm">
            CN
          </div>
          <div>
            <p className="font-bold text-base">Chat<span className="text-gradient">Nex</span></p>
            <p className="text-xs text-gray-500">by Nodex</p>
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
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full ${
                isActive ? 'active text-[#A61B4D]' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
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
  );
}
