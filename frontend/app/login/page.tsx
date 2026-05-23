'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Preencha todos os campos');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo ao ChatNex!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao fazer login';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#A61B4D]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 gradient-wine rounded-xl flex items-center justify-center font-bold text-lg glow-wine-sm">
              CN
            </div>
            <span className="text-2xl font-bold">Chat<span className="text-gradient">Nex</span></span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-400">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-wine w-full py-3 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Não tem conta?{' '}
            <Link href="/register" className="text-[#A61B4D] hover:text-[#c42460] font-medium">
              Criar conta grátis
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          ChatNex por{' '}
          <span className="text-[#A61B4D]">Nodex</span> — Agência de Marketing Digital
        </p>
      </div>
    </div>
  );
}
