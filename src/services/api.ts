import { Ticket, Message, Agent, CannedResponse, KnowledgeArticle, Contact, Channel, TicketStatus } from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Erro ${res.status}: Falha na requisição`);
  }

  return res.json();
}

export const api = {
  // Conversas & Tickets
  async getConversations(params?: {
    status?: string;
    channel?: string;
    search?: string;
    agentId?: string;
  }): Promise<Ticket[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.channel && params.channel !== 'all') query.set('channel', params.channel);
    if (params?.search) query.set('search', params.search);
    if (params?.agentId) query.set('agentId', params.agentId);

    const queryString = query.toString();
    const res = await request<{ success: boolean; data: Ticket[] }>(
      `/conversations${queryString ? `?${queryString}` : ''}`
    );
    return res.data;
  },

  async getConversationById(id: string): Promise<Ticket & { messages: Message[] }> {
    const res = await request<{ success: boolean; data: Ticket & { messages: Message[] } }>(
      `/conversations/${id}`
    );
    return res.data;
  },

  // Envio de Mensagem Pública (salva no banco de dados SQLite)
  async sendMessage(
    ticketId: string,
    payload: { content: string; senderName: string; attachment?: any }
  ): Promise<Message> {
    const res = await request<{ success: boolean; data: Message }>(
      `/conversations/${ticketId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          content: payload.content,
          sender: 'agent',
          senderName: payload.senderName,
          attachment: payload.attachment,
        }),
      }
    );
    return res.data;
  },

  // Envio de Nota Interna Privada (salva no banco com is_internal_note = 1)
  async sendInternalNote(
    ticketId: string,
    payload: { content: string; senderName: string }
  ): Promise<Message> {
    const res = await request<{ success: boolean; data: Message }>(
      `/conversations/${ticketId}/notes`,
      {
        method: 'POST',
        body: JSON.stringify({
          content: payload.content,
          senderName: payload.senderName,
        }),
      }
    );
    return res.data;
  },

  // Atualizar Status do Ticket (open, pending, resolved)
  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    const res = await request<{ success: boolean; data: Ticket }>(
      `/conversations/${ticketId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return res.data;
  },

  // Atualizar Estágio Kanban do Ticket
  async updateKanbanStage(ticketId: string, stage: string): Promise<Ticket> {
    const res = await request<{ success: boolean; data: Ticket }>(
      `/conversations/${ticketId}/kanban-stage`,
      {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      }
    );
    return res.data;
  },

  // Disparo de mensagem WhatsApp diretamente via Webhook (porta 5005 Bridge)
  async sendWebhookWhatsApp(payload: { from?: string; phone?: string; name: string; text: string }): Promise<any> {
    return request('/webhooks/whatsapp', {
      method: 'POST',
      body: JSON.stringify({
        phone: payload.phone || payload.from || '5511999887766',
        name: payload.name,
        message: payload.text,
      }),
    });
  },

  // Listar Contatos do CRM
  async getContacts(): Promise<Contact[]> {
    const res = await request<{ success: boolean; data: Contact[] }>('/contacts');
    return res.data;
  },

  // Atribuir Agente Responsável
  async assignAgent(ticketId: string, agentId: string): Promise<Ticket> {
    const res = await request<{ success: boolean; data: Ticket }>(
      `/conversations/${ticketId}/assign`,
      {
        method: 'PATCH',
        body: JSON.stringify({ agentId }),
      }
    );
    return res.data;
  },

  // Disparo de mensagem de cliente via Webhook Real
  async simulateClientMessage(channel: Channel, clientName: string, text: string): Promise<any> {
    if (channel === 'whatsapp') {
      return request('/webhooks/whatsapp', {
        method: 'POST',
        body: JSON.stringify({
          phone: '5511999887766',
          name: clientName,
          message: text,
        }),
      });
    }

    return request('/webhooks/widget', {
      method: 'POST',
      body: JSON.stringify({
        name: clientName,
        email: `${clientName.toLowerCase().replace(/\s+/g, '')}@exemplo.com.br`,
        message: text,
        channel,
      }),
    });
  },

  // Relatório Analítico direto do Banco
  async getAnalytics(): Promise<any> {
    const res = await request<{ success: boolean; data: any }>('/reports/analytics');
    return res.data;
  },

  // Respostas Rápidas (Canned Responses)
  async getCannedResponses(): Promise<CannedResponse[]> {
    const res = await request<{ success: boolean; data: CannedResponse[] }>('/canned-responses');
    return res.data;
  },

  async createCannedResponse(data: Omit<CannedResponse, 'id'>): Promise<CannedResponse> {
    const res = await request<{ success: boolean; data: CannedResponse }>('/canned-responses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // Base de Conhecimento
  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    const res = await request<{ success: boolean; data: KnowledgeArticle[] }>('/knowledge-articles');
    return res.data;
  },

  async markArticleHelpful(id: string): Promise<any> {
    const res = await request<{ success: boolean; data: any }>(`/knowledge-articles/${id}/helpful`, {
      method: 'POST',
    });
    return res.data;
  },

  // Equipe de Agentes
  async getAgents(): Promise<Agent[]> {
    const res = await request<{ success: boolean; data: Agent[] }>('/agents');
    return res.data;
  },

  async updateAgentStatus(agentId: string, status: Agent['status']): Promise<Agent> {
    const res = await request<{ success: boolean; data: Agent }>(`/agents/${agentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  // Contatos CRM
  async updateContact(id: string, data: { internalNotes?: string; tags?: string[] }): Promise<Contact> {
    const res = await request<{ success: boolean; data: Contact }>(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};
