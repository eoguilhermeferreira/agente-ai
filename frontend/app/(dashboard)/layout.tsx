'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Image src="/chatnex-icon.png" alt="ChatNex" width={52} height={52} className="rounded-xl" />
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[#A61B4D] rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-[#A61B4D] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="w-2 h-2 bg-[#A61B4D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen overflow-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
