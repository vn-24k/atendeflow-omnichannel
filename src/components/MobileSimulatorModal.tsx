import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Send, 
  Mic, 
  Paperclip, 
  Smile, 
  CheckCheck, 
  Phone, 
  Video, 
  MoreVertical,
  Volume2
} from 'lucide-react';
import { api } from '../services/api';

interface MobileSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: () => void;
}

export const MobileSimulatorModal: React.FC<MobileSimulatorModalProps> = ({
  isOpen,
  onClose,
  onMessageSent
}) => {
  const [inputText, setInputText] = useState('');
  const [clientName, setClientName] = useState('Mariana Vasconcelos');
  const [clientPhone, setClientPhone] = useState('11988421099');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'client' | 'agent'; text: string; time: string; isAudio?: boolean }>>([
    { sender: 'client', text: 'Boa tarde! Gostaria de consultar o status da minha proposta comercial.', time: '14:20' },
    { sender: 'agent', text: 'Olá Mariana! Seja bem-vinda ao AtendeFlow. Já localizei sua proposta, um instante por favor.', time: '14:21' }
  ]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent, isAudio = false) => {
    if (e) e.preventDefault();
    const content = isAudio ? '🎤 Mensagem de Voz (0:14) — Decupagem acústica limpa' : inputText.trim();
    if (!content) return;

    setIsSending(true);
    const newMsg = {
      sender: 'client' as const,
      text: content,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isAudio
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    try {
      // Disparo real no webhook do AtendeFlow
      await api.sendWebhookWhatsApp({
        from: clientPhone,
        name: clientName,
        text: content
      });
      // Notifica o app pai para atualizar a fila
      onMessageSent();
    } catch (err) {
      console.error('Erro ao disparar webhook pelo simulador:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="relative bg-transparent flex flex-col items-center">
        {/* Botão de Fechar Superior */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-all shadow-lg"
        >
          <X className="w-4 h-4" />
          <span>Fechar Simulador</span>
        </button>

        {/* Smartphone Bezel / Frame */}
        <div className="w-[360px] h-[680px] bg-slate-900 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-700/80 flex flex-col relative overflow-hidden ring-12 ring-slate-950/60">
          {/* Dynamic Island / Speaker Notch */}
          <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          </div>

          {/* WhatsApp Interface Frame */}
          <div className="flex-1 bg-[#ECE5DD] rounded-[36px] overflow-hidden flex flex-col">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="AtendeFlow Suporte"
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/40"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold truncate leading-tight">AtendeFlow Central</h4>
                  <p className="text-[10px] text-emerald-200 leading-tight">online agora</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white/90">
                <Video className="w-4 h-4" />
                <Phone className="w-4 h-4" />
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>

            {/* Configuração Rápida do Contato */}
            <div className="bg-[#0b645a] px-3 py-1 text-white/80 flex items-center justify-between text-[10px] border-t border-white/10">
              <span className="font-medium">Você: {clientName}</span>
              <span className="font-mono text-emerald-200">+{clientPhone}</span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[radial-gradient(#d8d2c7_1px,transparent_1px)] [background-size:16px_16px]">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs relative shadow-xs ${
                      m.sender === 'client'
                        ? 'bg-[#DCF8C6] text-slate-800 rounded-tr-xs'
                        : 'bg-white text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {m.isAudio ? (
                      <div className="flex items-center gap-2 py-0.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Volume2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="h-1 bg-slate-300 rounded-full w-28 overflow-hidden">
                            <div className="h-full bg-emerald-600 w-2/3" />
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono">0:14</span>
                        </div>
                      </div>
                    ) : (
                      <p className="leading-relaxed">{m.text}</p>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                      <span>{m.time}</span>
                      {m.sender === 'client' && (
                        <CheckCheck className="w-3 h-3 text-sky-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Bottom Bar */}
            <form onSubmit={handleSendMessage} className="p-2 bg-[#F0F2F5] flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-slate-500 px-1">
                <Smile className="w-4 h-4 cursor-pointer hover:text-slate-700" />
                <Paperclip className="w-4 h-4 cursor-pointer hover:text-slate-700" />
              </div>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Mensagem..."
                className="flex-1 bg-white rounded-full px-3.5 py-2 text-xs text-slate-800 focus:outline-none border border-slate-200"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-8 h-8 rounded-full bg-[#128C7E] text-white flex items-center justify-center shrink-0 hover:bg-[#075E54] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, true)}
                  disabled={isSending}
                  className="w-8 h-8 rounded-full bg-[#128C7E] text-white flex items-center justify-center shrink-0 hover:bg-[#075E54] transition-colors"
                  title="Enviar Áudio Simulado"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
