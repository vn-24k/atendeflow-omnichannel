import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  Tag, 
  MessageSquare, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Contact, Ticket } from '../types';

interface ContactsCRMViewProps {
  contacts: Contact[];
  tickets: Ticket[];
  onOpenConversationWithContact: (contactId: string) => void;
}

export const ContactsCRMView: React.FC<ContactsCRMViewProps> = ({
  contacts,
  tickets,
  onOpenConversationWithContact,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Coletar todas as tags únicas
  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.company.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone.includes(search);

    const matchesTag = selectedTag === 'all' || (contact.tags && contact.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">CRM & Diretório de Clientes</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {contacts.length} Clientes Cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Histórico unificado, valor vitalício (LTV) e canais de contato</p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 w-72">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, empresa ou telefone..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Tag Filters */}
      <div className="px-6 py-3 bg-white/60 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filtrar:
        </span>
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            selectedTag === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({contacts.length})
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedTag === tag
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid de Cards de Contatos */}
      <div className="p-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContacts.map(contact => {
          const contactTickets = tickets.filter(t => t.contactId === contact.id);
          return (
            <div
              key={contact.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <h3 className="font-heading font-black text-sm text-slate-900 truncate">{contact.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{contact.company}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{contact.city}</span>
                    </p>
                  </div>
                </div>

                {/* Detalhes de Contato */}
                <div className="space-y-1.5 py-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">WhatsApp:</span>
                    <span className="font-mono font-medium text-slate-800">{contact.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">E-mail:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{contact.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">LTV Acumulado:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {contact.ltv}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {contact.tags?.map(t => (
                    <span
                      key={t}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Notas Internas */}
                {contact.internalNotes && (
                  <p className="mt-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed italic">
                    "{contact.internalNotes}"
                  </p>
                )}
              </div>

              {/* Botão de Ação */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {contactTickets.length} conversa(s)
                </span>
                <button
                  onClick={() => onOpenConversationWithContact(contact.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ver Atendimento</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
