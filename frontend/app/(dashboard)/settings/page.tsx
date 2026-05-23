'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    openaiKey: '',
    openaiModel: 'gpt-4o-mini',
    aiEnabled: true,
    autoReply: true,
    responseDelay: 2,
    businessName: '',
    businessHours: '',
    businessAddress: '',
    businessPhone: '',
    systemPrompt: '',
    products: '',
    faq: '',
    aiRules: '',
    evolutionApiUrl: '',
    evolutionApiKey: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'company' | 'integration'>('ai');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof Settings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Carregando configurações...</p>
      </div>
    );
  }

  const tabs = [
    { key: 'ai', label: '🤖 Inteligência Artificial' },
    { key: 'company', label: '🏢 Dados da Empresa' },
    { key: 'integration', label: '🔗 Integrações' },
  ] as const;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-400 mt-1">Configure a IA, dados da empresa e integrações</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#A61B4D] text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card-glass rounded-xl p-6 space-y-6">
        {activeTab === 'ai' && (
          <>
            {/* Toggle switches */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'aiEnabled' as const, label: 'IA Ativa', desc: 'Habilitar resposta automática com IA' },
                { key: 'autoReply' as const, label: 'Auto-resposta', desc: 'Responder automaticamente sem aprovação' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-[#141414] rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => update(item.key, !settings[item.key])}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings[item.key] ? 'bg-[#A61B4D]' : 'bg-[#2a2a2a]'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings[item.key] ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Modelo OpenAI</label>
                <select
                  value={settings.openaiModel}
                  onChange={(e) => update('openaiModel', e.target.value)}
                  className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Rápido e econômico)</option>
                  <option value="gpt-4o">GPT-4o (Mais inteligente)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legado)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delay de resposta (segundos)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={settings.responseDelay}
                  onChange={(e) => update('responseDelay', parseInt(e.target.value))}
                  className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chave OpenAI</label>
              <input
                type="password"
                value={settings.openaiKey || ''}
                onChange={(e) => update('openaiKey', e.target.value)}
                placeholder="sk-..."
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenha em: platform.openai.com/api-keys
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt do sistema (instruções da IA)
              </label>
              <textarea
                value={settings.systemPrompt || ''}
                onChange={(e) => update('systemPrompt', e.target.value)}
                rows={4}
                placeholder="Você é um atendente virtual da empresa X. Responda sempre de forma educada e profissional..."
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Produtos e Serviços
              </label>
              <textarea
                value={settings.products || ''}
                onChange={(e) => update('products', e.target.value)}
                rows={4}
                placeholder="Liste seus produtos e serviços com preços e descrições..."
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Perguntas Frequentes (FAQ)
              </label>
              <textarea
                value={settings.faq || ''}
                onChange={(e) => update('faq', e.target.value)}
                rows={4}
                placeholder="P: Como faço um pedido?\nR: Você pode fazer seu pedido via WhatsApp..."
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Regras da IA
              </label>
              <textarea
                value={settings.aiRules || ''}
                onChange={(e) => update('aiRules', e.target.value)}
                rows={3}
                placeholder="- Nunca mencionar concorrentes&#10;- Sempre oferecer o cardápio quando perguntado sobre preços&#10;- Em caso de reclamações, passar para atendente humano"
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm resize-none"
              />
            </div>
          </>
        )}

        {activeTab === 'company' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome da empresa</label>
                <input
                  value={settings.businessName || ''}
                  onChange={(e) => update('businessName', e.target.value)}
                  placeholder="Minha Empresa"
                  className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                <input
                  value={settings.businessPhone || ''}
                  onChange={(e) => update('businessPhone', e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Endereço</label>
              <input
                value={settings.businessAddress || ''}
                onChange={(e) => update('businessAddress', e.target.value)}
                placeholder="Rua X, 123 - Bairro - Cidade/UF"
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Horário de funcionamento</label>
              <input
                value={settings.businessHours || ''}
                onChange={(e) => update('businessHours', e.target.value)}
                placeholder="Seg-Sex: 8h às 18h | Sáb: 9h às 13h | Dom: fechado"
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
          </>
        )}

        {activeTab === 'integration' && (
          <>
            <div className="p-4 bg-[#141414] rounded-lg border border-[#A61B4D]/20">
              <h3 className="font-medium mb-1">Evolution API</h3>
              <p className="text-xs text-gray-400">Configure a integração com a Evolution API para o WhatsApp</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL da Evolution API</label>
              <input
                value={settings.evolutionApiUrl || ''}
                onChange={(e) => update('evolutionApiUrl', e.target.value)}
                placeholder="https://sua-evolution-api.com"
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chave da Evolution API
              </label>
              <input
                type="password"
                value={settings.evolutionApiKey || ''}
                onChange={(e) => update('evolutionApiKey', e.target.value)}
                placeholder="sua-chave-evolution"
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
          </>
        )}

        <div className="pt-4 border-t border-[#2a2a2a]">
          <button
            onClick={save}
            disabled={saving}
            className="btn-wine px-8 py-3 rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}
