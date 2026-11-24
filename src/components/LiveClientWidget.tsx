import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Smartphone, 
  CheckCheck, 
  Globe, 
  MessageCircle, 
  Sparkles,
  Bot
} from 'lucide-react';
import { Channel } from '../types';

interface LiveClientWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateMessage: (channel: Channel, clientName: string, text: string) => void;
}

export const LiveClientWidget: React.FC<LiveClientWidgetProps> = ({
  isOpen,
  onClose,
  onSimulateMessage,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('whatsapp');
  const [clientName, setClientName] = useState('Matheus Oliveira');
  const [clientMessage, setClientMessage] = useState('Olá! Gostaria de saber como contratar o plano para a minha empresa.');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMessage.trim()) return;

    onSimulateMessage(selectedChannel, clientName.trim(), clientMessage.trim());
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-88 md:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden select-none animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm">Simulador do Cliente</h4>
            <p className="text-[10px] text-indigo-100">Dispare um ticket real para a fila do operador</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Widget Body Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-3.5 bg-slate-50/50 text-xs">
        {/* Channel Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Simular Canal de Origem:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedChannel('whatsapp')}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left font-bold transition-all ${
                selectedChannel === 'whatsapp'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('webchat')}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left font-bold transition-all ${
                selectedChannel === 'webchat'
                  ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Chat do Site</span>
            </button>
          </div>
        </div>

        {/* Client Name Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Nome do Cliente Simulado:
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            required
          />
        </div>

        {/* Client Message Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Mensagem a ser enviada:
          </label>
          <textarea
            value={clientMessage}
            onChange={(e) => setClientMessage(e.target.value)}
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none leading-relaxed"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={sentSuccess}
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
            sentSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
          }`}
        >
          {sentSuccess ? (
            <>
              <CheckCheck className="w-4 h-4" />
              <span>Ticket enviado com sucesso! Abrindo na fila...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Disparar Mensagem Agora</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
