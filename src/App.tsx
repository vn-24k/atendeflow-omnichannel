import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SidebarConversations } from './components/SidebarConversations';
import { ChatArea } from './components/ChatArea';
import { ContactCRM } from './components/ContactCRM';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { LiveClientWidget } from './components/LiveClientWidget';

import { Ticket, Message, Agent, Channel, CannedResponse, KnowledgeArticle } from './types';
import { api } from './services/api';

const DEFAULT_AGENT: Agent = {
  id: 'agent-1',
  name: 'Vinícius Caetano',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'Supervisor de Operações',
  status: 'online',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'inbox' | 'knowledge' | 'analytics'>('inbox');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent>(DEFAULT_AGENT);
  const [teamAgents, setTeamAgents] = useState<Agent[]>([DEFAULT_AGENT]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

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

  // 3. Inicialização geral (equipe, respostas rápidas, base de conhecimento e analytics)
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        const [agents, canned, articles, analytics, initialConvs] = await Promise.all([
          api.getAgents().catch(() => [DEFAULT_AGENT]),
          api.getCannedResponses().catch(() => []),
          api.getKnowledgeArticles().catch(() => []),
          api.getAnalytics().catch(() => null),
          api.getConversations().catch(() => []),
        ]);

        if (agents && agents.length > 0) {
          setTeamAgents(agents);
          setCurrentAgent(agents[0]);
        }
        setCannedResponses(canned);
        setKnowledgeArticles(articles);
        setAnalyticsData(analytics);
        setTickets(initialConvs);

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
    if (currentTab !== 'inbox') return;

    const interval = setInterval(async () => {
      try {
        const [updatedConvs, currentFullTicket, updatedAnalytics] = await Promise.all([
          api.getConversations({
            status: statusFilter,
            channel: channelFilter,
            search: searchQuery,
            agentId: currentAgent.id,
          }),
          selectedTicketId ? api.getConversationById(selectedTicketId).catch(() => null) : null,
          api.getAnalytics().catch(() => null),
        ]);

        setTickets(updatedConvs);
        if (updatedAnalytics) setAnalyticsData(updatedAnalytics);

        if (currentFullTicket && selectedTicketId && Array.isArray(currentFullTicket.messages)) {
          setMessagesMap(prev => ({
            ...prev,
            [selectedTicketId]: currentFullTicket.messages,
          }));
        }
      } catch {
        // Silêncio em caso de oscilação transitória
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentTab, statusFilter, channelFilter, searchQuery, currentAgent.id, selectedTicketId]);

  // Selected Ticket & Contact
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;
  const currentMessages = selectedTicketId ? (messagesMap[selectedTicketId] || []) : [];

  // Toggle Agent Online/Busy/Away
  const handleToggleAgentStatus = async () => {
    const nextStatus = currentAgent.status === 'online' ? 'busy' : currentAgent.status === 'busy' ? 'away' : 'online';
    try {
      const updated = await api.updateAgentStatus(currentAgent.id, nextStatus);
      setCurrentAgent(updated);
      setTeamAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch {
      setCurrentAgent(prev => ({ ...prev, status: nextStatus }));
    }
  };

  // Enviar Mensagem Pública ou Nota Interna com persistência no SQLite
  const handleSendMessage = async (content: string, isInternal: boolean, attachment?: any) => {
    if (!selectedTicketId) return;

    try {
      let savedMsg: Message;
      if (isInternal) {
        savedMsg = await api.sendInternalNote(selectedTicketId, {
          content,
          senderName: currentAgent.name,
        });
      } else {
        savedMsg = await api.sendMessage(selectedTicketId, {
          content,
          senderName: currentAgent.name,
          attachment,
        });
      }

      setMessagesMap(prev => ({
        ...prev,
        [selectedTicketId]: [...(prev[selectedTicketId] || []), savedMsg],
      }));

      // Atualiza o ticket na lista
      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            lastMessage: isInternal ? t.lastMessage : content,
            lastMessageTime: savedMsg.timestamp,
            unreadCount: 0,
            updatedAt: 'Agora mesmo',
          };
        }
        return t;
      }));

      // Atualizar métricas do banco
      api.getAnalytics().then(setAnalyticsData).catch(() => {});
    } catch (err) {
      console.error('Erro ao enviar mensagem para o banco:', err);
    }
  };

  // Atualizar Status do Ticket (Open, Pending, Resolved)
  const handleUpdateStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      const updatedTicket = await api.updateTicketStatus(ticketId, status);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: updatedTicket.status } : t));
      api.getAnalytics().then(setAnalyticsData).catch(() => {});
    } catch (err) {
      console.error('Erro ao atualizar status na API:', err);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    }
  };

  // Atribuir Agente Responsável
  const handleAssignAgent = async (ticketId: string, agent: Agent) => {
    try {
      const updated = await api.assignAgent(ticketId, agent.id);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedAgent: updated.assignedAgent } : t));
    } catch (err) {
      console.error('Erro ao atribuir agente na API:', err);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedAgent: agent } : t));
    }
  };

  // Atualizar Tags do Contato no SQLite
  const handleUpdateTags = async (contactId: string, tags: string[]) => {
    try {
      const updatedContact = await api.updateContact(contactId, { tags });
      setTickets(prev => prev.map(t => {
        if (t.contact.id === contactId) {
          return {
            ...t,
            contact: { ...t.contact, tags: updatedContact.tags },
          };
        }
        return t;
      }));
    } catch (err) {
      console.error('Erro ao atualizar tags na API:', err);
    }
  };

  // Atualizar Notas Internas do Contato no SQLite
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

  // Disparo de mensagem externa via Webhook Real (WhatsApp Bridge / Widget)
  const handleSimulateClientMessage = async (channel: Channel, clientName: string, text: string) => {
    try {
      const webhookResponse = await api.simulateClientMessage(channel, clientName, text);
      const convId = webhookResponse?.result?.conversationId;

      // Recarrega conversas do banco relacional
      const updatedList = await api.getConversations();
      setTickets(updatedList);

      if (convId) {
        setSelectedTicketId(convId);
        await fetchSelectedTicketMessages(convId);
      } else if (updatedList.length > 0) {
        setSelectedTicketId(updatedList[0].id);
        await fetchSelectedTicketMessages(updatedList[0].id);
      }

      setCurrentTab('inbox');
      api.getAnalytics().then(setAnalyticsData).catch(() => {});
    } catch (err) {
      console.error('Erro ao simular webhook de cliente:', err);
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Main Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentAgent={currentAgent}
        onToggleStatus={handleToggleAgentStatus}
        unreadTotal={unreadTotal}
        onOpenWidget={() => setIsWidgetOpen(true)}
        isWidgetOpen={isWidgetOpen}
      />

      {/* Main Content Areas */}
      {currentTab === 'inbox' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Conversations Queue Sidebar */}
          <SidebarConversations
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={(id) => {
              setSelectedTicketId(id);
              // Limpar unread localmente
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

          {/* Column 2: Central Chat & Timeline Area */}
          <ChatArea
            ticket={selectedTicket}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onUpdateStatus={handleUpdateStatus}
            onAssignAgent={handleAssignAgent}
            cannedResponses={cannedResponses}
            teamAgents={teamAgents}
          />

          {/* Column 3: Contact CRM Profile Sidebar */}
          <ContactCRM
            contact={selectedTicket?.contact || null}
            ticket={selectedTicket}
            onUpdateTags={handleUpdateTags}
            onUpdateNotes={handleUpdateNotes}
          />
        </div>
      )}

      {currentTab === 'knowledge' && (
        <KnowledgeBase
          articles={knowledgeArticles}
          onOpenWidget={() => setIsWidgetOpen(true)}
        />
      )}

      {currentTab === 'analytics' && (
        <AnalyticsDashboard tickets={tickets} analytics={analyticsData} />
      )}

      {/* Interactive Floating Live Client Widget */}
      <LiveClientWidget
        isOpen={isWidgetOpen}
        onClose={() => setIsWidgetOpen(false)}
        onSimulateMessage={handleSimulateClientMessage}
      />
    </div>
  );
}
