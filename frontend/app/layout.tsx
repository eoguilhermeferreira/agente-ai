import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ToasterProvider from '@/components/ui/ToasterProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChatNex — Atendimento com IA para WhatsApp',
  description:
    'Plataforma SaaS de atendimento automático via WhatsApp com inteligência artificial. Por Nodex.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full dark">
      <body className={`${inter.className} h-full bg-[#0D0D0D] text-white antialiased`}>
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
