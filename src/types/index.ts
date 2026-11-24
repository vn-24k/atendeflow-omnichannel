export type Channel = 'whatsapp' | 'webchat' | 'instagram' | 'email';

export type TicketStatus = 'open' | 'pending' | 'resolved';

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
