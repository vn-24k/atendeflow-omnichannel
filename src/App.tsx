import React, { useState, useEffect, useCallback } from 'react';
import { AppNavigation, ActiveModule } from './components/AppNavigation';
import { SidebarConversations } from './components/SidebarConversations';
import { ChatArea } from './components/ChatArea';
import { ContactCRM } from './components/ContactCRM';
import { KanbanBoard } from './components/KanbanBoard';
import { ChannelsManager } from './components/ChannelsManager';
import { AutomationsManager } from './components/AutomationsManager';
import { ContactsCRMView } from './components/ContactsCRMView';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MobileSimulatorModal } from './components/MobileSimulatorModal';
import { LiveClientWidget } from './components/LiveClientWidget';

import { Ticket, Message, Agent, Channel, CannedResponse, KnowledgeArticle, Contact, KanbanStage } from './types';
import { api } from './services/api';

const DEFAULT_AGENT: Agent = {
  id: 'agent-1',
  name: 'Vinícius Caetano',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'Supervisor de Operações',
  status: 'online',
};

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('inbox');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent>(DEFAULT_AGENT);
  const [teamAgents, setTeamAgents] = useState<Agent[]>([DEFAULT_AGENT]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'mine' | 'unassigned' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Carregar lista de conversas da API do Backend
  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.getConversations({
        status: statusFilter,
        channel: channelFilter,
        search: searchQuery,
        agentId: currentAgent.id,
      });
      setTickets(data);
      if (!selectedTicketId && data.length > 0) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err) {
      console.error('Falha ao buscar conversas da API:', err);
    }
  }, [statusFilter, channelFilter, searchQuery, currentAgent.id, selectedTicketId]);

  // 2. Carregar mensagens da conversa selecionada
  const fetchSelectedTicketMessages = useCallback(async (ticketId: string) => {
    try {
      const fullTicket = await api.getConversationById(ticketId);
      if (fullTicket && Array.isArray(fullTicket.messages)) {
        setMessagesMap(prev => ({
          ...prev,
          [ticketId]: fullTicket.messages,
        }));
      }
    } catch (err) {
      console.error(`Falha ao buscar mensagens do ticket ${ticketId}:`, err);
    }
  }, []);

  // 3. Inicialização geral (equipe, respostas rápidas, base de conhecimento, contatos e analytics)
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        const [agents, canned, articles, analytics, initialConvs, contactsList] = await Promise.all([
          api.getAgents().catch(() => [DEFAULT_AGENT]),
          api.getCannedResponses().catch(() => []),
          api.getKnowledgeArticles().catch(() => []),
          api.getAnalytics().catch(() => null),
          api.getConversations().catch(() => []),
          api.getContacts().catch(() => []),
        ]);

        if (agents && agents.length > 0) {
          setTeamAgents(agents);
          setCurrentAgent(agents[0]);
        }
        setCannedResponses(canned);
        setKnowledgeArticles(articles);
        setAnalyticsData(analytics);
        setTickets(initialConvs);
        setContacts(contactsList);

        if (initialConvs.length > 0) {
          const firstId = initialConvs[0].id;
          setSelectedTicketId(firstId);
          await fetchSelectedTicketMessages(firstId);
        }
      } catch (err) {
        console.error('Erro na inicialização da API:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, [fetchSelectedTicketMessages]);

  // Atualizar conversas quando filtros mudarem
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Atualizar mensagens quando selecionar outro ticket
  useEffect(() => {
    if (selectedTicketId) {
      fetchSelectedTicketMessages(selectedTicketId);
    }
  }, [selectedTicketId, fetchSelectedTicketMessages]);

  // Polling contínuo em background (4s) para sincronização omnichannel em tempo real sem F5
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [updatedConvs, currentFullTicket, updatedAnalytics, updatedContacts] = await Promise.all([
          api.getConversations({
            status: statusFilter,
            channel: channelFilter,
            search: searchQuery,
            agentId: currentAgent.id,
          }),
          selectedTicketId ? api.getConversationById(selectedTicketId).catch(() => null) : null,
          api.getAnalytics().catch(() => null),
          api.getContacts().catch(() => []),
        ]);

        setTickets(updatedConvs);
        if (updatedAnalytics) setAnalyticsData(updatedAnalytics);
        if (updatedContacts.length > 0) setContacts(updatedContacts);

        if (currentFullTicket && selectedTicketId && Array.isArray(currentFullTicket.messages)) {
          setMessagesMap(prev => ({
            ...prev,
            [selectedTicketId]: currentFullTicket.messages,
          }));
        }
      } catch {
        // Silêncio em caso de oscilação momentânea
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedTicketId, statusFilter, channelFilter, searchQuery, currentAgent.id]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;
  const currentMessages = selectedTicketId ? messagesMap[selectedTicketId] || [] : [];

  // Enviar Mensagem Pública ou Nota Interna
  const handleSendMessage = async (content: string, isInternal: boolean, attachment?: any) => {
    if (!selectedTicketId) return;

    try {
      let savedMessage: Message;
      if (isInternal) {
        savedMessage = await api.sendInternalNote(selectedTicketId, {
          content,
          senderName: currentAgent.name,
        });
      } else {
        savedMessage = await api.sendMessage(selectedTicketId, {
          content,
          senderName: currentAgent.name,
          attachment,
        });
      }

      setMessagesMap(prev => ({
        ...prev,
        [selectedTicketId]: [...(prev[selectedTicketId] || []), savedMessage],
      }));

      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            lastMessage: isInternal ? `[Nota Interna] ${content}` : content,
            lastMessageTime: 'Agora mesmo',
          };
        }
        return t;
      }));

      api.getAnalytics().then(setAnalyticsData).catch(() => {});
    } catch (err) {
      console.error('Falha ao enviar mensagem:', err);
    }
  };

  // Atualizar Status do Ticket
  const handleUpdateStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      const updated = await api.updateTicketStatus(ticketId, status);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: updated.status } : t));
      api.getAnalytics().then(setAnalyticsData).catch(() => {});
    } catch (err) {
      console.error('Erro ao atualizar status na API:', err);
    }
  };

  // Atualizar Estágio Kanban
  const handleUpdateStage = async (ticketId: string, stage: KanbanStage) => {
    try {
      const updated = await api.updateKanbanStage(ticketId, stage);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, kanbanStage: stage, status: updated.status } : t));
      api.getAnalytics().then(setAnalyticsData).catch(() => {});
    } catch (err) {
      console.error('Erro ao atualizar estágio kanban na API:', err);
    }
  };

  // Atribuir Agente
  const handleAssignAgent = async (ticketId: string, agent: Agent) => {
    try {
      const updated = await api.assignAgent(ticketId, agent.id);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedAgent: updated.assignedAgent } : t));
    } catch (err) {
      console.error('Erro ao atribuir agente na API:', err);
    }
  };

  // Alternar Status do Operador
  const handleToggleAgentStatus = async () => {
    const nextStatus = currentAgent.status === 'online' ? 'busy' : currentAgent.status === 'busy' ? 'away' : 'online';
    try {
      const updated = await api.updateAgentStatus(currentAgent.id, nextStatus);
      setCurrentAgent(prev => ({ ...prev, status: updated.status }));
      setTeamAgents(prev => prev.map(a => a.id === currentAgent.id ? { ...a, status: updated.status } : a));
    } catch (err) {
      console.error('Erro ao alternar status do agente:', err);
    }
  };

  // Atualizar Tags
  const handleUpdateTags = async (contactId: string, tags: string[]) => {
    try {
      await api.updateContact(contactId, { tags });
      setTickets(prev => prev.map(t => {
        if (t.contact.id === contactId) {
          return {
            ...t,
            contact: { ...t.contact, tags },
          };
        }
        return t;
      }));
    } catch (err) {
      console.error('Erro ao atualizar tags na API:', err);
    }
  };

  // Atualizar Notas Internas do Contato
  const handleUpdateNotes = async (contactId: string, notes: string) => {
    try {
      const updatedContact = await api.updateContact(contactId, { internalNotes: notes });
      setTickets(prev => prev.map(t => {
        if (t.contact.id === contactId) {
          return {
            ...t,
            contact: { ...t.contact, internalNotes: updatedContact.internalNotes },
          };
        }
        return t;
      }));
    } catch (err) {
      console.error('Erro ao atualizar notas do contato na API:', err);
    }
  };

  // Abrir conversa a partir do CRM
  const handleOpenConversationWithContact = (contactId: string) => {
    const existing = tickets.find(t => t.contactId === contactId);
    if (existing) {
      setSelectedTicketId(existing.id);
      setActiveModule('inbox');
    } else {
      setActiveModule('inbox');
    }
  };

  const unreadTotal = tickets.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const ticketCounts = {
    total: analyticsData?.totalTickets ?? tickets.length,
    mine: tickets.filter(t => t.assignedAgent?.id === currentAgent.id && t.status !== 'resolved').length,
    unassigned: analyticsData?.openTickets ?? tickets.filter(t => t.status === 'open' && t.unreadCount > 0).length,
    resolved: analyticsData?.resolvedTickets ?? tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="h-screen w-screen bg-[#0F172A] flex overflow-hidden font-sans">
      {/* 1. Barra Lateral de Navegação Master (Chatwoot / Linear Style) */}
      <AppNavigation
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        currentAgent={currentAgent}
        onToggleStatus={handleToggleAgentStatus}
        unreadCount={unreadTotal}
        onOpenMobileSimulator={() => setIsSimulatorOpen(true)}
        isSimulatorOpen={isSimulatorOpen}
        whatsappConnected={whatsappConnected}
      />

      {/* 2. Área Central Dinâmica por Módulo */}
      <main className="flex-1 flex overflow-hidden bg-slate-50">
        {/* Módulo 1: Inbox Omnichannel (3 Colunas) */}
        {activeModule === 'inbox' && (
          <div className="flex-1 flex overflow-hidden">
            <SidebarConversations
              tickets={tickets}
              selectedTicketId={selectedTicketId}
              onSelectTicket={(id) => {
                setSelectedTicketId(id);
                setTickets(prev => prev.map(t => t.id === id ? { ...t, unreadCount: 0 } : t));
              }}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              channelFilter={channelFilter}
              setChannelFilter={setChannelFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentAgent={currentAgent}
              ticketCounts={ticketCounts}
            />

            <ChatArea
              ticket={selectedTicket}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              onUpdateStatus={handleUpdateStatus}
              onAssignAgent={handleAssignAgent}
              cannedResponses={cannedResponses}
              teamAgents={teamAgents}
            />

            <ContactCRM
              contact={selectedTicket?.contact || null}
              ticket={selectedTicket}
              onUpdateTags={handleUpdateTags}
              onUpdateNotes={handleUpdateNotes}
            />
          </div>
        )}

        {/* Módulo 2: Funil Kanban de Atendimento */}
        {activeModule === 'kanban' && (
          <KanbanBoard
            tickets={tickets}
            onSelectTicket={(id) => {
              setSelectedTicketId(id);
              setActiveModule('inbox');
            }}
            onUpdateStage={handleUpdateStage}
            onOpenMobileSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {/* Módulo 3: Canais & WhatsApp Bridge (Porta 5005) */}
        {activeModule === 'channels' && (
          <ChannelsManager
            whatsappConnected={whatsappConnected}
            onToggleWhatsApp={setWhatsappConnected}
            onOpenMobileSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {/* Módulo 4: Robô de Triagem & Automações */}
        {activeModule === 'automations' && (
          <AutomationsManager />
        )}

        {/* Módulo 5: CRM & Diretório de Contatos */}
        {activeModule === 'contacts' && (
          <ContactsCRMView
            contacts={contacts}
            tickets={tickets}
            onOpenConversationWithContact={handleOpenConversationWithContact}
          />
        )}

        {/* Módulo 6: Base de Ajuda */}
        {activeModule === 'knowledge' && (
          <KnowledgeBase
            articles={knowledgeArticles}
            onOpenWidget={() => setIsWidgetOpen(true)}
          />
        )}

        {/* Módulo 7: Métricas & SLA */}
        {activeModule === 'analytics' && (
          <AnalyticsDashboard tickets={tickets} analytics={analyticsData} />
        )}
      </main>

      {/* Simulador de Smartphone WhatsApp (Interativo e Realista) */}
      <MobileSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onMessageSent={fetchConversations}
      />

      {/* Widget Flutuante para Web */}
      <LiveClientWidget
        isOpen={isWidgetOpen}
        onClose={() => setIsWidgetOpen(false)}
        onSimulateMessage={async (channel, name, text) => {
          await api.simulateClientMessage(channel, name, text);
          fetchConversations();
        }}
      />
    </div>
  );
}
