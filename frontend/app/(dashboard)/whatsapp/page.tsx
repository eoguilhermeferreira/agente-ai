'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';

type InstanceStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'QR_CODE';

interface Instance {
  id: string;
  instanceName: string;
  status: InstanceStatus;
  qrCode?: string;
}

export default function WhatsAppPage() {
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const loadInstance = async () => {
    try {
      const res = await api.get('/whatsapp/instance');
      setInstance(res.data.instance);
      if (res.data.instance?.qrCode) {
        setQrCode(res.data.instance.qrCode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstance();
  }, []);

  useEffect(() => {
    if (instance?.status === 'QR_CODE' || instance?.status === 'CONNECTING') {
      const interval = setInterval(async () => {
        try {
          const res = await api.get('/whatsapp/status');
          if (res.data.status !== instance?.status) {
            await loadInstance();
          }
          if (res.data.status === 'QR_CODE') {
            const qrRes = await api.get('/whatsapp/qrcode');
            if (qrRes.data.qrCode) setQrCode(qrRes.data.qrCode);
          }
        } catch (e) {
          console.error(e);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [instance?.status]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await api.post('/whatsapp/instance');
      setInstance(res.data.instance);
      if (res.data.instance?.qrCode) {
        setQrCode(res.data.instance.qrCode);
      }
      toast.success('Instância criada! Escaneie o QR Code');
    } catch {
      toast.error('Erro ao criar instância');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja desconectar o WhatsApp?')) return;
    try {
      await api.delete('/whatsapp/instance');
      setInstance(null);
      setQrCode(null);
      toast.success('WhatsApp desconectado');
    } catch {
      toast.error('Erro ao desconectar');
    }
  };

  const handleRefreshQr = async () => {
    try {
      const res = await api.get('/whatsapp/qrcode');
      if (res.data.qrCode) {
        setQrCode(res.data.qrCode);
        toast.success('QR Code atualizado');
      }
    } catch {
      toast.error('Erro ao atualizar QR Code');
    }
  };

  const statusConfig: Record<InstanceStatus, { color: string; label: string; dot: string }> = {
    CONNECTED: { color: 'text-green-400 bg-green-400/10 border-green-400/20', label: '● Conectado', dot: 'bg-green-400' },
    DISCONNECTED: { color: 'text-red-400 bg-red-400/10 border-red-400/20', label: '● Desconectado', dot: 'bg-red-400' },
    CONNECTING: { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', label: '◌ Conectando...', dot: 'bg-yellow-400' },
    QR_CODE: { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', label: '⬡ Aguardando QR', dot: 'bg-blue-400' },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  const status = (instance?.status || 'DISCONNECTED') as InstanceStatus;
  const cfg = statusConfig[status];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Conexão WhatsApp</h1>
        <p className="text-gray-400 mt-1">Conecte seu WhatsApp para ativar o atendimento automático com IA</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Status card */}
        <div className="card-glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold">Status da Conexão</h2>
            {instance && (
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${cfg.color}`}>
                {cfg.label}
              </span>
            )}
          </div>

          {!instance ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="font-semibold mb-2">Nenhuma instância configurada</h3>
              <p className="text-gray-400 text-sm mb-6">
                Conecte seu WhatsApp para começar a receber e responder mensagens automaticamente
              </p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="btn-wine px-8 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {connecting ? 'Criando instância...' : '+ Conectar WhatsApp'}
              </button>
            </div>
          ) : status === 'CONNECTED' ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="font-semibold text-green-400 mb-2">WhatsApp Conectado!</h3>
              <p className="text-gray-400 text-sm mb-2">Instância: <code className="text-[#A61B4D]">{instance.instanceName}</code></p>
              <p className="text-gray-500 text-sm mb-6">A IA está respondendo automaticamente seus clientes</p>
              <button
                onClick={handleDisconnect}
                className="px-6 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all"
              >
                Desconectar
              </button>
            </div>
          ) : (status === 'QR_CODE' || qrCode) ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-400">Escaneie o QR Code com seu WhatsApp</p>
              <div className="p-5 bg-white rounded-2xl shadow-xl">
                {qrCode ? (
                  <QRCodeCanvas
                    value={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                    size={220}
                    level="M"
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                    Gerando QR Code...
                  </div>
                )}
              </div>
              <div className="text-center text-sm text-gray-400 space-y-1">
                <p>1. Abra o WhatsApp no celular</p>
                <p>2. Toque em <strong className="text-white">Dispositivos conectados</strong></p>
                <p>3. Toque em <strong className="text-white">Conectar dispositivo</strong></p>
                <p>4. Aponte a câmera para o QR Code acima</p>
              </div>
              <button
                onClick={handleRefreshQr}
                className="text-xs text-[#A61B4D] hover:text-[#c42460] underline"
              >
                QR Code expirou? Clique aqui para atualizar
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="animate-spin w-10 h-10 border-2 border-[#A61B4D] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Conectando ao WhatsApp...</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="card-glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Como funciona?</h3>
          <div className="space-y-3 text-sm text-gray-400">
            {[
              { icon: '🔗', text: 'Sua conta WhatsApp é conectada via Evolution API' },
              { icon: '🤖', text: 'Mensagens recebidas são processadas pela IA (GPT-4o)' },
              { icon: '⚡', text: 'Respostas automáticas enviadas em segundos' },
              { icon: '👁️', text: 'Você pode acompanhar todas as conversas em tempo real' },
            ].map((item) => (
              <div key={item.icon} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
