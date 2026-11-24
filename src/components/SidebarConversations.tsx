import React from 'react';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Globe, 
  Instagram, 
  Mail, 
  Clock, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { Ticket, Channel, TicketStatus, Agent } from '../types';

interface SidebarConversationsProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  statusFilter: 'all' | 'mine' | 'unassigned' | 'resolved';
  setStatusFilter: (filter: 'all' | 'mine' | 'unassigned' | 'resolved') => void;
  channelFilter: Channel | 'all';
  setChannelFilter: (channel: Channel | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentAgent?: Agent;
  ticketCounts?: {
    total: number;
    mine: number;
    unassigned: number;
    resolved: number;
  };
}

export const SidebarConversations: React.FC<SidebarConversationsProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  statusFilter,
  setStatusFilter,
  channelFilter,
  setChannelFilter,
  searchQuery,
  setSearchQuery,
  currentAgent,
  ticketCounts,
}) => {
  // Helper for channel badges
  const renderChannelIcon = (channel: Channel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60" title="Canal: WhatsApp Oficial">
            <MessageCircle className="w-3.5 h-3.5" />
          </div>
        );
      case 'webchat':
        return (
          <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60" title="Canal: Chat do Site">
            <Globe className="w-3.5 h-3.5" />
          </div>
        );
      case 'instagram':
        return (
          <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60" title="Canal: Instagram Direct">
            <Instagram className="w-3.5 h-3.5" />
          </div>
        );
      case 'email':
        return (
          <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60" title="Canal: E-mail Corporativo">
            <Mail className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.2 rounded">Urgente</span>;
      case 'high':
        return <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded">Alta</span>;
      default:
        return null;
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Top Search & Filter Bar */}
      <div className="p-3 border-b border-slate-200 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, mensagem ou protocolo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas ({ticketCounts ? ticketCounts.total : tickets.length})
          </button>
          <button
            onClick={() => setStatusFilter('mine')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'mine'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Minhas ({ticketCounts ? ticketCounts.mine : tickets.filter(t => t.assignedAgent?.id === (currentAgent?.id || 'agent-1') && t.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setStatusFilter('unassigned')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'unassigned'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fila ({ticketCounts ? ticketCounts.unassigned : tickets.filter(t => t.status === 'open' && t.unreadCount > 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Resolvidas {ticketCounts ? `(${ticketCounts.resolved})` : ''}
          </button>
        </div>

        {/* Quick Channel Pill Filter */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Canal:</span>
            <button
              onClick={() => setChannelFilter('all')}
              className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                channelFilter === 'all' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`p-1 rounded ${
                channelFilter === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400 hover:text-emerald-600'
              }`}
              title="Filtrar WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChannelFilter('webchat')}
              className={`p-1 rounded ${
                channelFilter === 'webchat' ? 'bg-blue-100 text-blue-800' : 'text-slate-400 hover:text-blue-600'
              }`}
              title="Filtrar Web Chat"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChannelFilter('instagram')}
              className={`p-1 rounded ${
                channelFilter === 'instagram' ? 'bg-purple-100 text-purple-800' : 'text-slate-400 hover:text-purple-600'
              }`}
              title="Filtrar Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChannelFilter('email')}
              className={`p-1 rounded ${
                channelFilter === 'email' ? 'bg-amber-100 text-amber-800' : 'text-slate-400 hover:text-amber-600'
              }`}
              title="Filtrar E-mail"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Real-Time</span>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">Nenhuma conversa encontrada com esses filtros.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`p-3.5 cursor-pointer transition-all border-l-4 relative ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-600 shadow-xs'
                    : ticket.unreadCount > 0
                    ? 'bg-white border-blue-500 hover:bg-slate-50/80'
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                {/* Top Row: Avatar, Contact Name, Channel Badge & Time */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={ticket.contact.avatar}
                        alt={ticket.contact.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="absolute -bottom-1 -right-1">
                        {renderChannelIcon(ticket.channel)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {ticket.contact.name}
                        </span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {ticket.contact.company}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ticket.lastMessageTime}
                    </span>
                    {ticket.unreadCount > 0 && (
                      <span className="mt-1 block ml-auto w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold text-center leading-4 shadow-xs">
                        {ticket.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject & Preview */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {ticket.subject}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {ticket.lastMessage}
                  </p>
                </div>

                {/* Footer: Ticket ID, Status & Assigned Agent */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>{ticket.id}</span>
                    <span>•</span>
                    <span className={`capitalize font-semibold ${
                      ticket.status === 'resolved' ? 'text-emerald-600' : ticket.status === 'pending' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      {ticket.status === 'resolved' ? 'Resolvido' : ticket.status === 'pending' ? 'Pendente' : 'Aberto'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <img
                      src={ticket.assignedAgent.avatar}
                      alt={ticket.assignedAgent.name}
                      className="w-4 h-4 rounded-full object-cover"
                      title={`Responsável: ${ticket.assignedAgent.name}`}
                    />
                    <span className="truncate max-w-[80px]">{ticket.assignedAgent.name.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
