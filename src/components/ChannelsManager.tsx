import React, { useState } from 'react';
import { 
  Radio, 
  Smartphone, 
  Globe, 
  Instagram, 
  Mail, 
  QrCode, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  Wifi, 
  ExternalLink,
  Power,
  Server
} from 'lucide-react';

interface ChannelsManagerProps {
  whatsappConnected: boolean;
  onToggleWhatsApp: (status: boolean) => void;
  onOpenMobileSimulator: () => void;
}

export const ChannelsManager: React.FC<ChannelsManagerProps> = ({
  whatsappConnected,
  onToggleWhatsApp,
  onOpenMobileSimulator
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const embedScriptCode = `<script 
  src="https://atendeflow-swart.vercel.app/widget.js" 
  data-primary-color="#4f46e5"
  data-title="Suporte AtendeFlow"
  data-agent="Equipe de Atendimento">
</script>`;

  const webhookEndpoint = `${window.location.origin}/api/webhooks/whatsapp`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(embedScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleRefreshConnection = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onToggleWhatsApp(true);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto select-none">
      {/* Header */}
      <div className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">Canais de Atendimento & WhatsApp Bridge</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              4 Canais Ativos
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Gerencie a conexão do WhatsApp (porta 5005), Webhooks e widgets embeddables</p>
        </div>

        <button
          onClick={handleRefreshConnection}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Verificar Sincronia</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-6xl space-y-6">
        {/* Banner do WhatsApp Bridge (Porta 5005) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Smartphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-heading font-black text-lg tracking-tight">WhatsApp Multi-Dispositivo (Porta 5005)</h3>
                  <p className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    STATUS: {whatsappConnected ? 'CONECTADO & ESCUTANDO EVENTOS' : 'AGUARDANDO LEITURA DO QR CODE'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Integração nativa com o WhatsApp Bridge local. Receba mensagens instantâneas de clientes, áudios com decupagem e disparos em massa através dos webhooks da plataforma.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-black transition-all shadow-md"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Escanear QR Code</span>
              </button>

              <button
                onClick={onOpenMobileSimulator}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-black transition-all shadow-md shadow-emerald-500/25"
              >
                <Smartphone className="w-4 h-4" />
                <span>Abrir Simulador WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Canais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card WhatsApp */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center border border-[#25D366]/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${whatsappConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {whatsappConnected ? 'Ativo' : 'Desconectado'}
                </span>
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900">WhatsApp Oficial</h4>
              <p className="text-[11px] text-slate-500 mt-1">Conexão Baileys / Bridge via porta local 5005</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">1.482 msgs hoje</span>
              <button 
                onClick={() => onToggleWhatsApp(!whatsappConnected)}
                className="text-indigo-600 font-bold hover:underline"
              >
                {whatsappConnected ? 'Desconectar' : 'Conectar'}
              </button>
            </div>
          </div>

          {/* Card Webchat Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Online
                </span>
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900">Widget para Sites</h4>
              <p className="text-[11px] text-slate-500 mt-1">Script autônomo embeddable em qualquer HTML</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">widget.js pronto</span>
              <button 
                onClick={handleCopyScript}
                className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copiado!' : 'Copiar Tag'}</span>
              </button>
            </div>
          </div>

          {/* Card Instagram Direct */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center border border-fuchsia-200">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Sincronizado
                </span>
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900">Instagram Direct</h4>
              <p className="text-[11px] text-slate-500 mt-1">Direct Messages e respostas automáticas em Stories</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">324 msgs hoje</span>
              <span className="text-slate-400 font-semibold">@atendeflow</span>
            </div>
          </div>

          {/* Card E-mail */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ativo
                </span>
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900">E-mail Corporativo</h4>
              <p className="text-[11px] text-slate-500 mt-1">suporte@atendeflow.com via IMAP / SMTP com TLS</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">18 tickets hoje</span>
              <span className="text-slate-400 font-semibold">SSL Ativo</span>
            </div>
          </div>
        </div>

        {/* Seção de Webhook & Snippet de Integração */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Webhook do WhatsApp */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                <h4 className="font-heading font-black text-sm text-slate-900">Endpoint de Webhook WhatsApp</h4>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">POST</span>
            </div>
            <p className="text-xs text-slate-500">
              Configure esta URL no seu serviço WhatsApp Bridge ou Evolution API para receber chamadas de eventos em tempo real.
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs">
              <span className="truncate flex-1">{webhookEndpoint}</span>
              <button 
                onClick={handleCopyWebhook}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copiar URL do Webhook"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Snippet do Widget HTML */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <h4 className="font-heading font-black text-sm text-slate-900">Código de Instalação do Widget</h4>
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">HTML</span>
            </div>
            <p className="text-xs text-slate-500">
              Cole esta tag antes do fechamento de <code className="text-indigo-600">&lt;/body&gt;</code> de qualquer site para ativar o chat de clientes.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto relative">
              <pre>{embedScriptCode}</pre>
              <button 
                onClick={handleCopyScript}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copiar Tag de Script"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#128C7E] flex items-center justify-center mx-auto border border-emerald-200">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">Escanear WhatsApp</h3>
              <p className="text-xs text-slate-500 mt-1">
                Abra o WhatsApp no seu celular ➔ Aparelhos Conectados ➔ Conectar um aparelho
              </p>
            </div>

            {/* Simulação visual do QR Code */}
            <div className="p-4 bg-slate-900 rounded-2xl mx-auto inline-block border-4 border-emerald-500/30">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ATENDEFLOW_WHATSAPP_BRIDGE_PORT_5005_AUTHENTICATED"
                alt="QR Code de Conexão WhatsApp"
                className="w-44 h-44 rounded-lg bg-white p-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onToggleWhatsApp(true);
                  setShowQRModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
              >
                Confirmar Conexão
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
