import React from 'react';
import { 
  MessageSquare, 
  Kanban, 
  Radio, 
  Bot, 
  Users, 
  BookOpen, 
  BarChart3, 
  Smartphone, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Agent } from '../types';

export type ActiveModule = 'inbox' | 'kanban' | 'channels' | 'automations' | 'contacts' | 'knowledge' | 'analytics';

interface AppNavigationProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  currentAgent: Agent;
  onToggleStatus: () => void;
  unreadCount: number;
  onOpenMobileSimulator: () => void;
  isSimulatorOpen: boolean;
  whatsappConnected: boolean;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  activeModule,
  setActiveModule,
  currentAgent,
  onToggleStatus,
  unreadCount,
  onOpenMobileSimulator,
  isSimulatorOpen,
  whatsappConnected
}) => {
  const navItems = [
    {
      id: 'inbox' as ActiveModule,
      label: 'Inbox de Mensagens',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null,
      shortcut: '1'
    },
    {
      id: 'kanban' as ActiveModule,
      label: 'Funil Kanban',
      icon: Kanban,
      badge: null,
      shortcut: '2'
    },
    {
      id: 'channels' as ActiveModule,
      label: 'Canais & WhatsApp',
      icon: Radio,
      indicator: whatsappConnected ? 'emerald' : 'rose',
      shortcut: '3'
    },
    {
      id: 'automations' as ActiveModule,
      label: 'Robô & Automações',
      icon: Bot,
      badge: null,
      shortcut: '4'
    },
    {
      id: 'contacts' as ActiveModule,
      label: 'CRM de Contatos',
      icon: Users,
      badge: null,
      shortcut: '5'
    },
    {
      id: 'knowledge' as ActiveModule,
      label: 'Base de Conhecimento',
      icon: BookOpen,
      badge: null,
      shortcut: '6'
    },
    {
      id: 'analytics' as ActiveModule,
      label: 'Métricas & SLA',
      icon: BarChart3,
      badge: null,
      shortcut: '7'
    }
  ];

  return (
    <aside className="w-14 sm:w-16 md:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800/80 shrink-0 select-none z-40 transition-all duration-200">
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-2 md:px-4 flex items-center justify-center md:justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-base tracking-tight text-white">AtendeFlow</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Central Corporativa</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Bridge Quick Status Pill */}
        <div className="px-3 py-3 hidden md:block">
          <div 
            onClick={() => setActiveModule('channels')}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${whatsappConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <p className="text-[11px] font-semibold text-slate-200 group-hover:text-white flex items-center gap-1">
                  <span>WhatsApp Bridge</span>
                </p>
                <p className="text-[9px] text-slate-400">Porta 5005 • {whatsappConnected ? 'Sincronizado' : 'Aguardando'}</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-3 md:py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="hidden md:inline truncate">{item.label}</span>

                {item.badge && (
                  <span className={`hidden md:inline-flex ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-indigo-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.indicator && (
                  <span className={`hidden md:inline-block ml-auto w-2 h-2 rounded-full ${
                    item.indicator === 'emerald' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Mobile Simulator Shortcut & Agent Profile */}
      <div className="p-2 border-t border-slate-800/80 space-y-2">
        {/* Mobile Simulator CTA */}
        <button
          onClick={onOpenMobileSimulator}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            isSimulatorOpen
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-900/90 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40 hover:border-emerald-500/50'
          }`}
          title="Abrir Simulador de WhatsApp para testar recebimento de mensagens"
        >
          <Smartphone className="w-4 h-4 shrink-0 text-emerald-400" />
          <div className="hidden md:block text-left truncate">
            <p className="leading-tight">Simulador Cliente</p>
            <p className="text-[9px] text-slate-400 font-normal">WhatsApp Interativo</p>
          </div>
          <span className="hidden md:inline-block ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>

        {/* Operator Profile Card */}
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative shrink-0">
              <img
                src={currentAgent.avatar}
                alt={currentAgent.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
              />
              <button
                onClick={onToggleStatus}
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 transition-colors ${
                  currentAgent.status === 'online'
                    ? 'bg-emerald-500'
                    : currentAgent.status === 'busy'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
                title={`Status: ${currentAgent.status.toUpperCase()} (Clique para alternar)`}
              />
            </div>
            <div className="hidden md:block text-left truncate">
              <p className="text-xs font-bold text-slate-200 truncate">{currentAgent.name}</p>
              <button 
                onClick={onToggleStatus}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span className="capitalize">{currentAgent.status}</span>
                <span className="text-[9px] text-slate-500">(Trocar)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
