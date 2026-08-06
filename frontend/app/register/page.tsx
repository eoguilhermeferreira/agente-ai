'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    companyPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.companyName) {
      return toast.error('Preencha todos os campos obrigatórios');
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Conta criada com sucesso!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao criar conta';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#A61B4D]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 gradient-wine rounded-xl flex items-center justify-center font-bold text-lg glow-wine-sm">
              CN
            </div>
            <span className="text-2xl font-bold">Chat<span className="text-gradient">Nex</span></span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Criar conta</h1>
          <p className="text-gray-400">Preencha os dados para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Seu nome</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="João Silva"
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome da empresa</label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Minha Empresa Ltda"
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Telefone <span className="text-gray-500">(opcional)</span></label>
            <input
              type="text"
              name="companyPhone"
              value={form.companyPhone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-wine w-full py-3 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#A61B4D] hover:text-[#c42460] font-medium">
              Fazer login
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          ChatNex por{' '}
          <a href="https://instagram.com/agencynodex" target="_blank" rel="noopener noreferrer" className="text-[#A61B4D]">
            Nodex
          </a>
        </p>
      </div>
    </div>
  );
}
