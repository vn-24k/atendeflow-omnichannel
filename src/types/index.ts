export type Channel = 'whatsapp' | 'webchat' | 'instagram' | 'email';

export type TicketStatus = 'open' | 'pending' | 'resolved';

export type KanbanStage = 'new' | 'in_progress' | 'waiting_client' | 'resolved';

export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export interface Attachment {
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc';
  url?: string;
}

export interface Message {
  id: string;
  ticketId: string;
  sender: 'client' | 'agent' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
  isInternalNote?: boolean;
  mediaType?: 'text' | 'audio' | 'image' | 'file';
  audioDuration?: number; // segundos
  attachment?: Attachment;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  tags: string[];
  ltv: string;
  totalTickets: number;
  internalNotes: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'busy' | 'away' | 'offline';
}

export interface Ticket {
  id: string;
  contactId: string;
  contact: Contact;
  channel: Channel;
  status: TicketStatus;
  kanbanStage?: KanbanStage;
  priority: Priority;
  subject: string;
  assignedAgent: Agent;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  csatRating?: number;
}

export interface CannedResponse {
  id: string;
  shortcut: string;
  title: string;
  content: string;
  category: 'Cobrança' | 'Suporte' | 'Boas-Vindas' | 'Informações';
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Primeiros Passos' | 'Faturamento & Planos' | 'Integrações' | 'Segurança';
  summary: string;
  content: string;
  readTime: string;
  views: number;
  helpfulCount: number;
  updatedAt: string;
}

export interface ChannelStatus {
  id: string;
  name: string;
  channel: Channel;
  status: 'connected' | 'connecting' | 'disconnected';
  endpoint: string;
  port?: number;
  lastSync: string;
  qrCode?: string;
  messagesReceivedToday: number;
  messagesSentToday: number;
}

export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  trigger: 'message_received' | 'ticket_created' | 'after_hours' | 'unassigned_sla';
  isActive: boolean;
  actionType: 'send_menu' | 'auto_reply' | 'assign_round_robin' | 'tag_vip';
  config: {
    menuOptions?: { key: string; label: string; department: string }[];
    autoReplyText?: string;
    slaMinutes?: number;
  };
}
