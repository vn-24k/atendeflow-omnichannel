import React from 'react';
import { 
  MessageSquare, 
  BookOpen, 
  BarChart3, 
  Smartphone, 
  Search, 
  Bell, 
  CheckCircle2, 
  ChevronDown
} from 'lucide-react';
import { Agent } from '../types';

interface HeaderProps {
  currentTab: 'inbox' | 'knowledge' | 'analytics';
  setCurrentTab: (tab: 'inbox' | 'knowledge' | 'analytics') => void;
  currentAgent: Agent;
  onToggleStatus: () => void;
  unreadTotal: number;
  onOpenWidget: () => void;
  isWidgetOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentAgent,
  onToggleStatus,
  unreadTotal,
  onOpenWidget,
  isWidgetOpen,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Main Tabs */}
      <div className="flex items-center gap-6 md:gap-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-lg tracking-tight text-slate-900">AtendeFlow</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60">Omni</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Central Unificada de Atendimento</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setCurrentTab('inbox')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'inbox'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inbox</span>
            {unreadTotal > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadTotal}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('knowledge')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'knowledge'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Base de Ajuda</span>
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'analytics'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Métricas & SLA</span>
          </button>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Simulator Button */}
        <button
          onClick={onOpenWidget}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            isWidgetOpen
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
          }`}
          title="Abrir o Widget de Chat para simular mensagens vindas de clientes reais"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">Simulador do Cliente</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </button>

        {/* Global Search Shortcut */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-500">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Buscar cliente...</span>
          <kbd className="bg-white border border-slate-200 rounded px-1 text-[10px] text-slate-400 font-mono">⌘K</kbd>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Operator Profile & Status Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={currentAgent.avatar}
              alt={currentAgent.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
            />
            <button
              onClick={onToggleStatus}
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white transition-colors ${
                currentAgent.status === 'online'
                  ? 'bg-emerald-500'
                  : currentAgent.status === 'busy'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
              title={`Status: ${currentAgent.status.toUpperCase()} (Clique para alternar)`}
            />
          </div>

          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1 cursor-pointer" onClick={onToggleStatus}>
              <span className="text-xs font-bold text-slate-900 leading-tight">{currentAgent.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              <span>{currentAgent.status === 'online' ? 'Disponível' : currentAgent.status === 'busy' ? 'Ocupado' : 'Ausente'}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
