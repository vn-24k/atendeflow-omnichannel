import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Lock, 
  Unlock, 
  Zap, 
  CheckCheck, 
  FileText, 
  User, 
  MessageCircle, 
  Globe, 
  Instagram, 
  Mail, 
  AlertTriangle,
  Smile,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { Ticket, Message, CannedResponse, Agent, Channel } from '../types';

interface ChatAreaProps {
  ticket: Ticket | null;
  messages: Message[];
  onSendMessage: (content: string, isInternal: boolean, attachment?: any) => void;
  onUpdateStatus: (ticketId: string, status: Ticket['status']) => void;
  onAssignAgent: (ticketId: string, agent: Agent) => void;
  cannedResponses: CannedResponse[];
  teamAgents: Agent[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  ticket,
  messages,
  onSendMessage,
  onUpdateStatus,
  onAssignAgent,
  cannedResponses,
  teamAgents,
}) => {
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showMacros, setShowMacros] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, ticket]);

  if (!ticket) {
    return (
      <main className="flex-1 bg-slate-50 flex items-center justify-center p-8 select-none">
        <div className="text-center max-w-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-800">Nenhuma conversa selecionada</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Selecione uma conversa na fila ao lado para iniciar o atendimento ou abra o simulador do cliente para criar um novo ticket em tempo real.
          </p>
        </div>
      </main>
    );
  }

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), isInternalNote);
    setInputText('');
    setShowMacros(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplyMacro = (macro: CannedResponse) => {
    setInputText(macro.content);
    setShowMacros(false);
  };

  const handleSimulateAttachment = () => {
    onSendMessage('Comprovante_Pagamento_Ted_Alpha.pdf', isInternalNote, {
      name: 'Comprovante_Pagamento_Ted_Alpha.pdf',
      size: '840 KB',
      type: 'pdf'
    });
  };

  const renderChannelIcon = (channel: Channel) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'webchat':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-purple-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <main className="flex-1 bg-[#F8FAFC] flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Header of Active Ticket */}
      <div className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={ticket.contact.avatar}
              alt={ticket.contact.name}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
              {renderChannelIcon(ticket.channel)}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-sm text-slate-900 truncate">
                {ticket.contact.name}
              </h2>
              <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {ticket.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
              <span>{ticket.contact.company}</span>
              <span>•</span>
              <span className="capitalize">{ticket.channel === 'webchat' ? 'Chat do Site' : ticket.channel}</span>
            </p>
          </div>
        </div>

        {/* Action Controls: Agent Assignment & Status Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Agent Assign Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium transition-colors"
            >
              <img
                src={ticket.assignedAgent.avatar}
                alt={ticket.assignedAgent.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="hidden sm:inline">{ticket.assignedAgent.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showAssignDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Atribuir Atendente</p>
                {teamAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      onAssignAgent(ticket.id, agent);
                      setShowAssignDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${
                      ticket.assignedAgent.id === agent.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img src={agent.avatar} alt={agent.name} className="w-5 h-5 rounded-full object-cover" />
                    <div>
                      <p className="leading-tight">{agent.name}</p>
                      <p className="text-[10px] text-slate-400">{agent.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors ${
                ticket.status === 'resolved'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : ticket.status === 'pending'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{ticket.status === 'resolved' ? 'Resolvido' : ticket.status === 'pending' ? 'Pendente' : 'Aberto'}</span>
              <ChevronDown className="w-3 h-3 text-current opacity-70" />
            </button>

            {showStatusDropdown && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-20 space-y-0.5">
                <button
                  onClick={() => {
                    onUpdateStatus(ticket.id, 'open');
                    setShowStatusDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  🟢 Em Aberto
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus(ticket.id, 'pending');
                    setShowStatusDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-50"
                >
                  🟡 Pendente
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus(ticket.id, 'resolved');
                    setShowStatusDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  ✅ Resolvido
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Ticket Open Notification Banner */}
        <div className="flex items-center justify-center my-2">
          <div className="bg-slate-200/80 text-slate-600 text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Ticket aberto via <strong>{ticket.channel.toUpperCase()}</strong> em {ticket.createdAt}</span>
          </div>
        </div>

        {messages.map((msg) => {
          // If it's an internal note (Team only!)
          if (msg.isInternalNote) {
            return (
              <div key={msg.id} className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 my-3 max-w-xl mx-auto shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nota Interna da Equipe (Invisível para o Cliente)</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-normal">{msg.timestamp}</span>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <div className="mt-2 text-[10px] text-amber-700 flex items-center gap-1">
                  <span>Por: <strong>{msg.senderName}</strong></span>
                </div>
              </div>
            );
          }

          const isAgent = msg.sender === 'agent';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-xl ${isAgent ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {!isAgent && (
                <img
                  src={ticket.contact.avatar}
                  alt={ticket.contact.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                />
              )}

              <div className={`space-y-1 ${isAgent ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isAgent
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200/80 text-slate-900 rounded-tl-xs'
                  }`}
                >
                  {/* Audio Player if message is audio */}
                  {(msg.mediaType === 'audio' || msg.content.includes('🎤') || msg.content.includes('Mensagem de Voz')) ? (
                    <div className="flex items-center gap-3 py-1">
                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
                          audio.play().catch(() => {});
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isAgent ? 'bg-white text-indigo-700 shadow-sm' : 'bg-indigo-600 text-white'
                        }`}
                        title="Tocar áudio decupado"
                      >
                        ▶
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-0.5 h-4">
                          {[3, 6, 9, 12, 8, 4, 10, 14, 11, 7, 5, 12, 9, 3, 7, 11, 6].map((h, i) => (
                            <span
                              key={i}
                              style={{ height: `${h}px` }}
                              className={`w-1 rounded-full ${isAgent ? 'bg-white/70' : 'bg-indigo-400'}`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-[10px] opacity-80 mt-1">
                          <span className="font-mono">0:14</span>
                          <span className="text-[9px] uppercase font-bold tracking-wider">Voz Humana</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Attachment Card if present */}
                  {msg.attachment && (
                    <div className={`mt-2.5 p-2 rounded-xl border flex items-center justify-between gap-3 ${
                      isAgent ? 'bg-indigo-700/60 border-indigo-500/80 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 shrink-0 opacity-80" />
                        <div className="truncate">
                          <p className="font-semibold text-xs truncate">{msg.attachment.name}</p>
                          <p className="text-[10px] opacity-70">{msg.attachment.size}</p>
                        </div>
                      </div>
                      <button className="text-[10px] font-bold underline shrink-0 hover:opacity-80">
                        Baixar
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer time & status */}
                <div className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${isAgent ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {isAgent && <CheckCheck className="w-3 h-3 text-indigo-600" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Collaboration Controls */}
      <div className="bg-white border-t border-slate-200 p-3 md:p-4 shrink-0 space-y-2 select-none">
        {/* Toggle Mode: Public Message vs Team Internal Note */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setIsInternalNote(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                !isInternalNote
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Unlock className="w-3 h-3" />
              <span>Resposta ao Cliente</span>
            </button>
            <button
              onClick={() => setIsInternalNote(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                isInternalNote
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Nota Interna (Equipe)</span>
            </button>
          </div>

          {/* Quick Macros Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowMacros(!showMacros)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white transition-all shadow-xs"
              title="Respostas Prontas e Macros"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Respostas Rápidas</span>
            </button>

            {showMacros && (
              <div className="absolute right-0 bottom-full mb-2 w-72 md:w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-30 space-y-1">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1">
                  <span className="text-[11px] font-bold text-slate-800">Selecione uma Macro (/atalho)</span>
                  <span className="text-[10px] text-slate-400">Clique para inserir</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                  {cannedResponses.map((macro) => (
                    <button
                      key={macro.id}
                      onClick={() => handleApplyMacro(macro)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 text-xs"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-900">{macro.title}</span>
                        <code className="text-[10px] bg-slate-100 text-indigo-600 px-1 rounded font-mono">{macro.shortcut}</code>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{macro.content}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Input Box */}
        <div className={`relative border rounded-xl transition-all shadow-xs ${
          isInternalNote 
            ? 'bg-amber-50/50 border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/20' 
            : 'bg-white border-slate-200 focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600'
        }`}>
          {isInternalNote && (
            <div className="px-3 pt-2 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5 border-b border-amber-200/60 pb-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Modo Nota Interna: esta mensagem será lida apenas pela sua equipe.</span>
            </div>
          )}

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isInternalNote
                ? "Escreva uma nota privada para os colegas sobre este chamado..."
                : `Responder para ${ticket.contact.name} via ${ticket.channel.toUpperCase()}... (Pressione Enter para enviar)`
            }
            rows={3}
            className="w-full bg-transparent p-3 text-xs text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none"
          />

          {/* Bottom Bar: Attachments, Audio & Send */}
          <div className="px-3 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                onClick={handleSimulateAttachment}
                className="p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Anexar arquivo ou PDF"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              {/* Botão de Envio de Áudio */}
              <button
                type="button"
                onClick={() => {
                  onSendMessage('🎤 Mensagem de Voz (0:18) — Áudio enviado pelo operador', isInternalNote);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-colors border border-emerald-200"
                title="Enviar Áudio de Voz Decupado"
              >
                <span>🎤 Gravar Áudio</span>
              </button>

              {/* Botão de Template Interativo WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  setInputText('✅ Seu agendamento foi confirmado para amanhã às 14:30. Caso precise remarcar, responda com 1.');
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold transition-colors border border-indigo-200"
                title="Inserir modelo de confirmação do WhatsApp"
              >
                <span>⚡ Template Whats</span>
              </button>

              <button
                onClick={() => setInputText(prev => prev + ' 👍 ')}
                className="p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Inserir emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                !inputText.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isInternalNote
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              <span>{isInternalNote ? 'Gravar Nota' : 'Enviar'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
