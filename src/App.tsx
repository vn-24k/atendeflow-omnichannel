import React, { useState } from 'react';
import { Header } from './components/Header';
import { SidebarConversations } from './components/SidebarConversations';
import { ChatArea } from './components/ChatArea';
import { ContactCRM } from './components/ContactCRM';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { LiveClientWidget } from './components/LiveClientWidget';

import { 
  INITIAL_TICKETS, 
  INITIAL_MESSAGES, 
  CURRENT_AGENT, 
  TEAM_AGENTS, 
  CANNED_RESPONSES, 
  KNOWLEDGE_ARTICLES,
  INITIAL_CONTACTS
} from './data/mockData';
import { Ticket, Message, Agent, Channel, Contact } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'inbox' | 'knowledge' | 'analytics'>('inbox');
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('TCK-1042');
  const [currentAgent, setCurrentAgent] = useState<Agent>(CURRENT_AGENT);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'mine' | 'unassigned' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ticket & Contact
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;
  const currentMessages = selectedTicketId ? (messagesMap[selectedTicketId] || []) : [];

  // Toggle Agent Online/Busy/Away
  const handleToggleAgentStatus = () => {
    setCurrentAgent(prev => {
      const nextStatus = prev.status === 'online' ? 'busy' : prev.status === 'busy' ? 'away' : 'online';
      return { ...prev, status: nextStatus };
    });
  };

  // Send Message (Public or Internal Note)
  const handleSendMessage = (content: string, isInternal: boolean, attachment?: any) => {
    if (!selectedTicketId) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      ticketId: selectedTicketId,
      sender: 'agent',
      senderName: currentAgent.name,
      content,
      timestamp: timeStr,
      isInternalNote: isInternal,
      attachment,
      status: 'delivered',
    };

    setMessagesMap(prev => ({
      ...prev,
      [selectedTicketId]: [...(prev[selectedTicketId] || []), newMsg],
    }));

    // If it's a public response, update ticket last message
    if (!isInternal) {
      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            lastMessage: content,
            lastMessageTime: timeStr,
            unreadCount: 0,
            updatedAt: 'Agora mesmo',
          };
        }
        return t;
      }));
    }
  };

  // Update Ticket Status (Open, Pending, Resolved)
  const handleUpdateStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status };
      }
      return t;
    }));
  };

  // Assign Ticket to Team Agent
  const handleAssignAgent = (ticketId: string, agent: Agent) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, assignedAgent: agent };
      }
      return t;
    }));
  };

  // Update Contact Tags
  const handleUpdateTags = (contactId: string, tags: string[]) => {
    setTickets(prev => prev.map(t => {
      if (t.contact.id === contactId) {
        return {
          ...t,
          contact: { ...t.contact, tags },
        };
      }
      return t;
    }));
  };

  // Update Contact Notes
  const handleUpdateNotes = (contactId: string, notes: string) => {
    setTickets(prev => prev.map(t => {
      if (t.contact.id === contactId) {
        return {
          ...t,
          contact: { ...t.contact, internalNotes: notes },
        };
      }
      return t;
    }));
  };

  // Simulate incoming ticket from Client Widget
  const handleSimulateClientMessage = (channel: Channel, clientName: string, text: string) => {
    const newTicketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newContact: Contact = {
      id: `c-sim-${Date.now()}`,
      name: clientName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      email: `${clientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: '+55 11 98991-0022',
      company: 'Empresa do Cliente',
      city: 'São Paulo, SP',
      tags: ['Novo Lead', 'Simulação'],
      ltv: 'R$ 0,00',
      totalTickets: 1,
      internalNotes: 'Ticket iniciado via Simulador do Cliente.',
      createdAt: 'Hoje',
    };

    const newTicket: Ticket = {
      id: newTicketId,
      contactId: newContact.id,
      contact: newContact,
      channel,
      status: 'open',
      priority: 'high',
      subject: text.slice(0, 48) + '...',
      assignedAgent: currentAgent,
      createdAt: `Hoje, ${timeStr}`,
      updatedAt: 'Agora mesmo',
      unreadCount: 1,
      lastMessage: text,
      lastMessageTime: timeStr,
    };

    const initialClientMessage: Message = {
      id: `m-sim-${Date.now()}`,
      ticketId: newTicketId,
      sender: 'client',
      senderName: clientName,
      content: text,
      timestamp: timeStr,
      status: 'delivered',
    };

    setTickets(prev => [newTicket, ...prev]);
    setMessagesMap(prev => ({
      ...prev,
      [newTicketId]: [initialClientMessage],
    }));
    setSelectedTicketId(newTicketId);
    setCurrentTab('inbox');
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(ticket => {
    // Channel filter
    if (channelFilter !== 'all' && ticket.channel !== channelFilter) return false;

    // Status filter
    if (statusFilter === 'mine' && ticket.assignedAgent.id !== currentAgent.id) return false;
    if (statusFilter === 'unassigned' && ticket.status === 'resolved') return false;
    if (statusFilter === 'resolved' && ticket.status !== 'resolved') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ticket.contact.name.toLowerCase().includes(q);
      const matchSubject = ticket.subject.toLowerCase().includes(q);
      const matchCompany = ticket.contact.company.toLowerCase().includes(q);
      const matchId = ticket.id.toLowerCase().includes(q);
      if (!matchName && !matchSubject && !matchCompany && !matchId) return false;
    }

    return true;
  });

  const unreadTotal = tickets.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

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
            tickets={filteredTickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={(id) => {
              setSelectedTicketId(id);
              // Clear unread count on select
              setTickets(prev => prev.map(t => t.id === id ? { ...t, unreadCount: 0 } : t));
            }}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            channelFilter={channelFilter}
            setChannelFilter={setChannelFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Column 2: Central Chat & Timeline Area */}
          <ChatArea
            ticket={selectedTicket}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onUpdateStatus={handleUpdateStatus}
            onAssignAgent={handleAssignAgent}
            cannedResponses={CANNED_RESPONSES}
            teamAgents={TEAM_AGENTS}
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
          articles={KNOWLEDGE_ARTICLES}
          onOpenWidget={() => setIsWidgetOpen(true)}
        />
      )}

      {currentTab === 'analytics' && (
        <AnalyticsDashboard tickets={tickets} />
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
