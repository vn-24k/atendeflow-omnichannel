import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Tag, 
  Plus, 
  X, 
  ExternalLink, 
  DollarSign, 
  History, 
  FileEdit,
  ShieldAlert,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Contact, Ticket } from '../types';

interface ContactCRMProps {
  contact: Contact | null;
  ticket: Ticket | null;
  onUpdateTags: (contactId: string, tags: string[]) => void;
  onUpdateNotes: (contactId: string, notes: string) => void;
}

export const ContactCRM: React.FC<ContactCRMProps> = ({
  contact,
  ticket,
  onUpdateTags,
  onUpdateNotes,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [notes, setNotes] = useState(contact?.internalNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!contact) {
    return null;
  }

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!contact.tags.includes(newTagInput.trim())) {
      const updated = [...contact.tags, newTagInput.trim()];
      onUpdateTags(contact.id, updated);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = contact.tags.filter(t => t !== tagToRemove);
    onUpdateTags(contact.id, updated);
  };

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    onUpdateNotes(contact.id, notes);
    setTimeout(() => setIsSavingNotes(false), 500);
  };

  const cleanPhone = contact.phone.replace(/\D/g, '');

  return (
    <aside className="w-80 lg:w-88 bg-white border-l border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto hidden xl:flex flex-col select-none">
      {/* Profile Header */}
      <div className="p-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-indigo-50 shadow-md shadow-slate-200 mb-3"
        />
        <h3 className="font-heading font-bold text-base text-slate-900 leading-tight">
          {contact.name}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{contact.company}</p>

        {/* Quick Action: Open directly in WhatsApp Web */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chamar no WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </a>
        </div>
      </div>

      {/* CRM Details & Key Metrics */}
      <div className="p-5 space-y-5 flex-1">
        {/* Metric Cards (LTV & Tickets) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LTV Estimado</span>
            <p className="font-heading font-black text-sm text-slate-900 mt-0.5">{contact.ltv}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Atendimentos</span>
            <p className="font-heading font-black text-sm text-slate-900 mt-0.5">{contact.totalTickets} chamados</p>
          </div>
        </div>

        {/* Contact Info List */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dados Cadastrais</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{contact.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{contact.city}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Cliente desde {contact.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Segmentação (Tags)</h4>
            <button
              onClick={() => setIsAddingTag(true)}
              className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Adicionar</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors"
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {isAddingTag && (
            <div className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                placeholder="Nome da tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                autoFocus
              />
              <button
                onClick={handleAddTag}
                className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-lg"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsAddingTag(false)}
                className="text-slate-400 text-xs px-1"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Permanent Internal Notes (CRM) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileEdit className="w-3.5 h-3.5 text-slate-400" />
              <span>Anotações do CRM</span>
            </h4>
            {isSavingNotes && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Salvo!
              </span>
            )}
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            rows={4}
            placeholder="Observações permanentes sobre o perfil do cliente, preferências de negociação e histórico..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all resize-none leading-relaxed"
          />
          <p className="text-[10px] text-slate-400">As anotações são salvas automaticamente ao sair do campo.</p>
        </div>
      </div>
    </aside>
  );
};
