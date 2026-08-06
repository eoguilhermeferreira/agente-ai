'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function IntegrationsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    api.get('/integrations/api-key')
      .then(res => setApiKey(res.data.apiKey))
      .catch(() => toast.error('Erro ao carregar API key'))
      .finally(() => setLoading(false));
  }, []);

  const copy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    toast.success('Chave copiada!');
  };

  const masked = apiKey ? apiKey.slice(0, 8) + '••••••••••••••••••••••••••••••' : '';

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Integrações</h1>
      <p className="text-gray-400 text-sm mb-8">Use a sua API key para conectar sistemas externos ao ChatNex.</p>

      <div className="card-glass rounded-2xl p-6 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-300 mb-1">Sua API Key</p>
          <p className="text-xs text-gray-500 mb-3">Cole essa chave no sistema externo que vai se comunicar com o ChatNex.</p>

          {loading ? (
            <div className="h-12 bg-[#141414] rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 font-mono text-sm text-gray-300 truncate">
                {visible ? apiKey : masked}
              </div>
              <button
                onClick={() => setVisible(v => !v)}
                className="px-3 py-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-gray-400 hover:text-white transition-all text-sm"
                title={visible ? 'Ocultar' : 'Mostrar'}
              >
                {visible ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
              <button
                onClick={copy}
                className="px-4 py-3 btn-wine rounded-lg text-sm font-medium"
              >
                Copiar
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-[#1a1a1a] pt-5 space-y-3">
          <p className="text-sm font-medium text-gray-300">Como usar</p>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex gap-3">
              <span className="w-5 h-5 bg-[#A61B4D]/20 text-[#A61B4D] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <p>Copie sua API key acima e cole no campo correspondente do sistema externo.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 bg-[#A61B4D]/20 text-[#A61B4D] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <p>O sistema externo pode enviar mensagens via WhatsApp chamando <span className="font-mono text-xs bg-[#141414] px-1.5 py-0.5 rounded">POST /api/integrations/send-message</span> com o header <span className="font-mono text-xs bg-[#141414] px-1.5 py-0.5 rounded">x-api-key</span>.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 bg-[#A61B4D]/20 text-[#A61B4D] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <p>O ChatNex também notifica o sistema externo automaticamente a cada mensagem recebida ou resposta da IA — configure a URL em Configurações.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
