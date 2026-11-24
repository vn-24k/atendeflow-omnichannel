import React from 'react';
import { 
  Ticket, 
  KanbanStage, 
  Channel, 
  Priority 
} from '../types';
import { 
  MessageSquare, 
  Clock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Globe, 
  Instagram, 
  Mail,
  MoreVertical,
  Plus,
  Flame,
  ChevronRight
} from 'lucide-react';

interface KanbanBoardProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onUpdateStage: (ticketId: string, stage: KanbanStage) => void;
  onOpenMobileSimulator: () => void;
}

interface ColumnConfig {
  id: KanbanStage;
  title: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onSelectTicket,
  onUpdateStage,
  onOpenMobileSimulator
}) => {
  const columns: ColumnConfig[] = [
    {
      id: 'new',
      title: 'Triagem / Novos',
      badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-200',
      badgeText: 'Aguardando atribuição',
      description: 'Mensagens recentes sem primeira resposta'
    },
    {
      id: 'in_progress',
      title: 'Em Atendimento',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
      badgeText: 'Operador em conversa ativa',
      description: 'Conversas ativas com operador designado'
    },
    {
      id: 'waiting_client',
      title: 'Aguardando Cliente',
      badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-200',
      badgeText: 'Pendente de resposta',
      description: 'Proposta enviada ou orçamento sob análise'
    },
    {
      id: 'resolved',
      title: 'Resolvidos / Concluídos',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      badgeText: 'SLA Cumprido',
      description: 'Casos fechados com CSAT avaliado'
    }
  ];

  // Helper para canal
  const getChannelBadge = (channel: Channel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30">
            <Smartphone className="w-3 h-3" /> WhatsApp
          </span>
        );
      case 'webchat':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Globe className="w-3 h-3" /> Webchat
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
            <Instagram className="w-3 h-3" /> Instagram
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Mail className="w-3 h-3" /> E-mail
          </span>
        );
    }
  };

  // Classificar ticket na coluna apropriada
  const getColumnTickets = (stage: KanbanStage) => {
    return tickets.filter(ticket => {
      if (ticket.kanbanStage) return ticket.kanbanStage === stage;
      // Fallback inteligente
      if (stage === 'resolved') return ticket.status === 'resolved';
      if (stage === 'waiting_client') return ticket.status === 'pending';
      if (stage === 'in_progress') return ticket.status === 'open' && ticket.assignedAgent.id !== 'agent-unassigned';
      return ticket.status === 'open';
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100/70 overflow-hidden select-none">
      {/* Top Bar do Kanban */}
      <div className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">Funil de Atendimento Kanban</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {tickets.length} tickets totais
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Gestão visual do fluxo de atendimento e SLA por estágio</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSimulator}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-sm shadow-emerald-600/30"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simular Nova Mensagem WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Grid de Colunas do Kanban */}
      <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-5 h-full min-w-[1100px]">
          {columns.map(col => {
            const colTickets = getColumnTickets(col.id);
            return (
              <div 
                key={col.id}
                className="w-80 flex flex-col rounded-2xl bg-slate-200/60 border border-slate-300/60 overflow-hidden shrink-0 shadow-xs"
              >
                {/* Cabeçalho da Coluna */}
                <div className="p-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">{col.title}</h2>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${col.badgeBg}`}>
                        {colTickets.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{col.description}</p>
                  </div>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {colTickets.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-400 font-medium">Nenhum ticket neste estágio</p>
                    </div>
                  ) : (
                    colTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer relative"
                        onClick={() => onSelectTicket(ticket.id)}
                      >
                        {/* Top info: Canal + Prioridade */}
                        <div className="flex items-center justify-between mb-2">
                          {getChannelBadge(ticket.channel)}
                          
                          <div className="flex items-center gap-1.5">
                            {ticket.priority === 'urgent' && (
                              <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                <Flame className="w-2.5 h-2.5" /> Urgente
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{ticket.id}</span>
                          </div>
                        </div>

                        {/* Contato & Assunto */}
                        <div className="flex items-start gap-2.5 mb-2.5">
                          <img
                            src={ticket.contact.avatar}
                            alt={ticket.contact.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {ticket.contact.name}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-700 truncate">{ticket.subject}</p>
                          </div>
                        </div>

                        {/* Snippet da mensagem */}
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 font-normal">
                          "{ticket.lastMessage}"
                        </p>

                        {/* Rodapé: Operador + Tempo + Mover */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={ticket.assignedAgent.avatar}
                              alt={ticket.assignedAgent.name}
                              className="w-4 h-4 rounded-full object-cover"
                              title={`Atendente: ${ticket.assignedAgent.name}`}
                            />
                            <span className="truncate max-w-[80px] text-[10px] font-medium">{ticket.assignedAgent.name.split(' ')[0]}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock className="w-2.5 h-2.5" /> {ticket.lastMessageTime}
                            </span>

                            {/* Botão de avanço de estágio rápido */}
                            {col.id === 'new' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStage(ticket.id, 'in_progress');
                                }}
                                className="p-1 rounded hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition-colors"
                                title="Assumir e Mover para Em Atendimento"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id === 'in_progress' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStage(ticket.id, 'waiting_client');
                                }}
                                className="p-1 rounded hover:bg-amber-50 text-amber-600 hover:text-amber-800 transition-colors"
                                title="Mover para Aguardando Cliente"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id === 'waiting_client' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStage(ticket.id, 'resolved');
                                }}
                                className="p-1 rounded hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition-colors"
                                title="Resolver Ticket"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
