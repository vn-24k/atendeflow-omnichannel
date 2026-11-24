import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determina diretório de banco de dados
let dbPath;
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  dbPath = '/tmp/atendeflow.db';
} else {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // fallback
    }
  }
  dbPath = path.join(dataDir, 'atendeflow.db');
}

let db;
try {
  db = new DatabaseSync(dbPath);
} catch (err) {
  console.warn('Fallback to in-memory SQLite database:', err);
  db = new DatabaseSync(':memory:');
}

// Configurar pragmas
db.exec('PRAGMA foreign_keys = ON;');

// Inicializar Schemas Relacionais
db.exec(`
  CREATE TABLE IF NOT EXISTS inboxes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    channel TEXT NOT NULL,
    phone_number TEXT,
    webhook_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    city TEXT,
    tags TEXT,
    ltv TEXT,
    total_tickets INTEGER DEFAULT 1,
    internal_notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'online'
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL,
    inbox_id TEXT,
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'normal',
    subject TEXT NOT NULL,
    assigned_agent_id TEXT,
    unread_count INTEGER DEFAULT 0,
    last_message TEXT,
    last_message_time TEXT,
    csat_rating INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (inbox_id) REFERENCES inboxes(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_agent_id) REFERENCES agents(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    is_internal_note INTEGER DEFAULT 0,
    attachment_json TEXT,
    status TEXT DEFAULT 'delivered',
    created_at TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS canned_responses (
    id TEXT PRIMARY KEY,
    shortcut TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS knowledge_articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    read_time TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
  CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
  CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
`);

// Função para semear dados iniciais ricos caso o banco esteja vazio
function seedDatabaseIfEmpty() {
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM conversations').get();
  if (rowCount && rowCount.count > 0) {
    return;
  }

  // 1. Inboxes
  const insertInbox = db.prepare(`
    INSERT INTO inboxes (id, name, channel, phone_number, webhook_url, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertInbox.run('inbox-wa', 'WhatsApp Matriz Comercial', 'whatsapp', '+55 11 97690-9265', 'http://localhost:5005/webhook', 1, '2026-01-01T08:00:00Z');
  insertInbox.run('inbox-web', 'Widget Webchat Oficial', 'webchat', null, '/api/webhooks/widget', 1, '2026-01-01T08:00:00Z');
  insertInbox.run('inbox-ig', 'Instagram Direct Principal', 'instagram', null, null, 1, '2026-01-01T08:00:00Z');
  insertInbox.run('inbox-mail', 'Suporte Corporativo Email', 'email', null, null, 1, '2026-01-01T08:00:00Z');

  // 2. Agents
  const insertAgent = db.prepare(`
    INSERT INTO agents (id, name, avatar, role, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertAgent.run('agent-1', 'Vinícius Caetano', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 'Supervisor de Operações', 'online');
  insertAgent.run('agent-2', 'Mariana Duarte', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 'Especialista N2 WhatsApp', 'online');
  insertAgent.run('agent-3', 'Lucas Ferreira', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'Suporte Técnico e Integrações', 'busy');
  insertAgent.run('agent-4', 'Beatriz Lima', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', 'Customer Success', 'away');

  // 3. Contacts
  const insertContact = db.prepare(`
    INSERT INTO contacts (id, name, avatar, email, phone, company, city, tags, ltv, total_tickets, internal_notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertContact.run(
    'c-1',
    'Rodrigo Medeiros',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    'rodrigo@alphagestao.com.br',
    '+55 11 98845-2190',
    'Alpha Gestão Contábil',
    'São Paulo, SP',
    JSON.stringify(['Cliente VIP', 'Contrato Pro', 'Renovação Próxima']),
    'R$ 14.800',
    8,
    'Cliente muito objetivo. Prefere contato via WhatsApp e prefere falar sempre no horário da manhã.',
    '15/03/2026'
  );
  insertContact.run(
    'c-2',
    'Camila Vasconcelos',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    'camila.v@studioestetica.com',
    '+55 11 97120-4389',
    'Studio Vasconcelos Estética',
    'Campinas, SP',
    JSON.stringify(['Lead Quente', 'Avaliação Grátis']),
    'R$ 3.200',
    3,
    'Interessada no plano Enterprise para 5 unidades. Foco em automação de agendamentos pelo WhatsApp.',
    '02/11/2026'
  );
  insertContact.run(
    'c-3',
    'Eduardo Silveira',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    'eduardo@logexpress.com.br',
    '+55 19 99654-1022',
    'LogExpress Transportes',
    'Santos, SP',
    JSON.stringify(['Suporte Crítico', 'SLA 1h', 'API Webhook']),
    'R$ 29.500',
    19,
    'CTO da transportadora. Quando abre ticket é questão técnica de webhook ou emissão de NFe.',
    '10/01/2026'
  );
  insertContact.run(
    'c-4',
    'Juliana Pires',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    'juliana.pires@modaatacado.com.br',
    '+55 11 98412-9901',
    'Pires Confecções & Moda',
    'São Paulo, SP',
    JSON.stringify(['E-commerce', 'Catálogo Pix']),
    'R$ 8.900',
    5,
    'Dona de confecção. Dúvida frequente sobre cálculo automático de frete nas mensagens.',
    '19/08/2026'
  );
  insertContact.run(
    'c-5',
    'Felipe Fontana',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    'felipe@fontanaburgers.com.br',
    '+55 11 99182-3344',
    'Fontana Smash & Beer',
    'São Bernardo do Campo, SP',
    JSON.stringify(['Gastronomia', 'Volume Alto']),
    'R$ 5.400',
    2,
    'Pico de atendimento às sextas e sábados a partir das 18h.',
    '05/10/2026'
  );

  // 4. Conversations
  const insertConv = db.prepare(`
    INSERT INTO conversations (id, contact_id, inbox_id, channel, status, priority, subject, assigned_agent_id, unread_count, last_message, last_message_time, csat_rating, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertConv.run(
    'TCK-1042',
    'c-1',
    'inbox-wa',
    'whatsapp',
    'open',
    'high',
    'Solicitação de chave Pix e upgrade para plano anual',
    'agent-1',
    1,
    'Perfeito Vinícius, me envia a chave Pix para eu autorizar o pagamento agora mesmo.',
    '07:38',
    null,
    'Hoje, 07:15',
    'Há 4 min'
  );
  insertConv.run(
    'TCK-1041',
    'c-2',
    'inbox-web',
    'webchat',
    'open',
    'normal',
    'Como funciona a integração com nosso catálogo de produtos?',
    'agent-1',
    0,
    'Entendi, então os pedidos chegam direto organizados no WhatsApp?',
    '07:30',
    null,
    'Hoje, 06:50',
    'Há 12 min'
  );
  insertConv.run(
    'TCK-1040',
    'c-3',
    'inbox-mail',
    'email',
    'pending',
    'urgent',
    'Instabilidade no webhook de despacho de mercadorias #LOG-992',
    'agent-3',
    0,
    'Equipe de infraestrutura já aplicou o patch no endpoint. Aguardando validação do cliente.',
    '07:05',
    null,
    'Hoje, 05:20',
    'Há 35 min'
  );
  insertConv.run(
    'TCK-1039',
    'c-4',
    'inbox-ig',
    'instagram',
    'open',
    'normal',
    'Vocês atendem no feriado prolongado de final de ano?',
    'agent-2',
    2,
    'Oi Ju! Vi o story de vocês e queria saber como contrato.',
    '06:40',
    null,
    'Ontem, 21:10',
    'Há 1 hora'
  );
  insertConv.run(
    'TCK-1038',
    'c-5',
    'inbox-wa',
    'whatsapp',
    'resolved',
    'low',
    'Configuração dos horários de expediente no bot',
    'agent-1',
    0,
    'Muito obrigado, ficou perfeito! Nota 10 pro suporte.',
    '17:30',
    5,
    'Ontem, 16:00',
    'Ontem, 17:30'
  );

  // 5. Messages
  const insertMsg = db.prepare(`
    INSERT INTO messages (id, conversation_id, sender, sender_name, content, timestamp, is_internal_note, attachment_json, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMsg.run('m-1', 'TCK-1042', 'client', 'Rodrigo Medeiros', 'Bom dia Vinícius! Tudo bem por aí? Estamos fechando o balanço do trimestre e decidimos antecipar a renovação anual da nossa conta.', '07:15', 0, null, 'read', '2026-11-24T07:15:00Z');
  insertMsg.run('m-2', 'TCK-1042', 'agent', 'Vinícius Caetano', 'Fala Rodrigo, bom dia! Excelente notícia meu amigo. Vamos emitir o plano anual com 20% de desconto institucional como combinamos.', '07:22', 0, null, 'read', '2026-11-24T07:22:00Z');
  insertMsg.run('m-3', 'TCK-1042', 'agent', 'Vinícius Caetano', 'ATENÇÃO EQUIPE: Aplicar o cupom ANUAL-ALPHA no painel financeiro antes de liberar os 10 acessos adicionais.', '07:25', 1, null, 'read', '2026-11-24T07:25:00Z');
  insertMsg.run('m-4', 'TCK-1042', 'agent', 'Vinícius Caetano', 'Segue a proposta comercial atualizada com todos os termos de SLA de 1 hora garantidos em contrato.', '07:28', 0, JSON.stringify({ name: 'Proposta_Comercial_Alpha_Anual_2026.pdf', size: '1.4 MB', type: 'pdf' }), 'read', '2026-11-24T07:28:00Z');
  insertMsg.run('m-5', 'TCK-1042', 'client', 'Rodrigo Medeiros', 'Perfeito Vinícius, me envia a chave Pix para eu autorizar o pagamento agora mesmo.', '07:38', 0, null, 'read', '2026-11-24T07:38:00Z');

  insertMsg.run('m-201', 'TCK-1041', 'client', 'Camila Vasconcelos', 'Olá! Estou navegando no site de vocês e gostaria de tirar uma dúvida sobre o plano para franquias.', '06:50', 0, null, 'read', '2026-11-24T06:50:00Z');
  insertMsg.run('m-202', 'TCK-1041', 'agent', 'Vinícius Caetano', 'Olá Camila! Seja bem-vinda ao AtendeFlow. Com certeza, como posso te ajudar hoje?', '07:05', 0, null, 'read', '2026-11-24T07:05:00Z');
  insertMsg.run('m-203', 'TCK-1041', 'client', 'Camila Vasconcelos', 'Entendi, então os pedidos chegam direto organizados no WhatsApp?', '07:30', 0, null, 'read', '2026-11-24T07:30:00Z');

  insertMsg.run('m-301', 'TCK-1040', 'client', 'Eduardo Silveira', 'Alerta: Erro 502 no webhook de expedição ao tentar sincronizar o lote 4410.', '05:20', 0, null, 'read', '2026-11-24T05:20:00Z');
  insertMsg.run('m-302', 'TCK-1040', 'agent', 'Lucas Ferreira', 'Equipe de infraestrutura já aplicou o patch no endpoint. Aguardando validação do cliente.', '07:05', 0, null, 'delivered', '2026-11-24T07:05:00Z');

  insertMsg.run('m-401', 'TCK-1039', 'client', 'Juliana Pires', 'Oi Ju! Vi o story de vocês e queria saber como contrato.', '06:40', 0, null, 'delivered', '2026-11-24T06:40:00Z');

  insertMsg.run('m-501', 'TCK-1038', 'client', 'Felipe Fontana', 'Como ajusto o horário automático de atendimento nos finais de semana?', '16:00', 0, null, 'read', '2026-11-23T16:00:00Z');
  insertMsg.run('m-502', 'TCK-1038', 'agent', 'Vinícius Caetano', 'Basta acessar Canais > Configurações de Expediente e marcar os turnos de Sábado e Domingo.', '17:15', 0, null, 'read', '2026-11-23T17:15:00Z');
  insertMsg.run('m-503', 'TCK-1038', 'client', 'Felipe Fontana', 'Muito obrigado, ficou perfeito! Nota 10 pro suporte.', '17:30', 0, null, 'read', '2026-11-23T17:30:00Z');

  // 6. Canned Responses
  const insertCR = db.prepare(`
    INSERT INTO canned_responses (id, shortcut, title, content, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertCR.run('cr-1', '/pix', 'Dados Bancários & Chave Pix', 'Segue nossa chave Pix Oficial (CNPJ): 48.912.890/0001-24 (AtendeFlow Soluções Tecnológicas). Após efetuar a transferência, basta anexar o comprovante aqui para liberação imediata!', 'Cobrança', '2026-01-01');
  insertCR.run('cr-2', '/horario', 'Horário de Atendimento', 'Nosso time de atendimento humano funciona de Segunda a Sexta, das 08h às 19h, e aos Sábados das 09h às 13h. Chamados urgentes com SLA contratado contam com plantão 24/7.', 'Informações', '2026-01-01');
  insertCR.run('cr-3', '/boasvindas', 'Acolhimento & Boas-Vindas', 'Olá! Sou o Vinícius da equipe de atendimento da AtendeFlow. Já localizei seu cadastro aqui e estou à sua disposição. Como posso te apoiar hoje?', 'Boas-Vindas', '2026-01-01');
  insertCR.run('cr-4', '/sla', 'Compromisso de SLA & Prazos', 'Seu chamado foi classificado com prioridade alta. Nosso tempo médio de resolução para esta categoria é de até 2 horas úteis. Manteremos você informado a cada avanço!', 'Suporte', '2026-01-01');
  insertCR.run('cr-5', '/reembolso', 'Política de Garantia de 30 Dias', 'Oferecemos garantia incondicional de satisfação por 30 dias. Caso a plataforma não atenda sua operação, o estorno integral é processado em até 24h sem burocracia.', 'Cobrança', '2026-01-01');

  // 7. Knowledge Articles
  const insertKA = db.prepare(`
    INSERT INTO knowledge_articles (id, title, category, summary, content, read_time, views, helpful_count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertKA.run(
    'art-1',
    'Como conectar seu WhatsApp Oficial via QR Code em 2 minutos',
    'Primeiros Passos',
    'Passo a passo visual para parear seu número comercial com múltiplos atendentes simultâneos sem risco de banimento.',
    '### Visão Geral da Conexão\nConectar o WhatsApp comercial ao AtendeFlow permite que toda a sua equipe atenda usando um único número de telefone...',
    '3 min',
    4820,
    421,
    '18/11/2026'
  );
  insertKA.run(
    'art-2',
    'Notas Internas Privadas: Como colaborar sem o cliente ver',
    'Primeiros Passos',
    'Aprenda a marcar outros atendentes e discutir detalhes de contratos diretamente na timeline da conversa de forma 100% invisível para o cliente.',
    '### O que são Notas Internas?\nNotas internas são comentários destacados em cor âmbar na timeline do ticket...',
    '2 min',
    3150,
    298,
    '21/11/2026'
  );
  insertKA.run(
    'art-3',
    'Instalando o Widget de Chat ao Vivo no seu site ou landing page',
    'Integrações',
    'Script minúsculo de 1 linha para incorporar a janela de atendimento em qualquer página HTML, WordPress ou aplicação React.',
    '### Instalação em Qualquer Website\nBasta colar a tag de script antes do fechamento da tag </body> do seu site...',
    '4 min',
    2940,
    210,
    '12/11/2026'
  );
  insertKA.run(
    'art-4',
    'Entendendo as Métricas: O que significa FRT, MTTR e CSAT?',
    'Faturamento & Planos',
    'Guia definitivo para gestores sobre os indicadores de atendimento que definem a taxa de conversão e a retenção de clientes.',
    '### Os 3 Grandes Indicadores da Operação\n1. FRT (First Response Time)... 2. MTTR... 3. CSAT...',
    '5 min',
    1890,
    165,
    '14/11/2026'
  );
}

// Inicializar semente
seedDatabaseIfEmpty();

// Gerador de ID de conversa único e determinístico sem colisões
export function generateTicketId() {
  while (true) {
    const candidate = `TCK-${Math.floor(1000 + Math.random() * 90000)}`;
    const exists = db.prepare('SELECT id FROM conversations WHERE id = ?').get(candidate);
    if (!exists) return candidate;
  }
}

// --- MÉTODOS DE REPOSITÓRIO E SERVIÇO ---

export function getConversations({ status = 'all', channel = 'all', search = '', agentId = null } = {}) {
  let query = `
    SELECT 
      c.id, c.contact_id, c.inbox_id, c.channel, c.status, c.priority, c.subject,
      c.assigned_agent_id, c.unread_count, c.last_message, c.last_message_time,
      c.csat_rating, c.created_at, c.updated_at,
      ct.name as contact_name, ct.avatar as contact_avatar, ct.email as contact_email,
      ct.phone as contact_phone, ct.company as contact_company, ct.city as contact_city,
      ct.tags as contact_tags, ct.ltv as contact_ltv, ct.total_tickets as contact_total_tickets,
      ct.internal_notes as contact_internal_notes, ct.created_at as contact_created_at,
      a.name as agent_name, a.avatar as agent_avatar, a.role as agent_role, a.status as agent_status
    FROM conversations c
    INNER JOIN contacts ct ON c.contact_id = ct.id
    LEFT JOIN agents a ON c.assigned_agent_id = a.id
    WHERE 1=1
  `;

  const params = [];

  if (status && status !== 'all') {
    if (status === 'resolved') {
      query += ` AND c.status = 'resolved'`;
    } else if (status === 'mine') {
      if (agentId) {
        query += ` AND c.assigned_agent_id = ? AND c.status != 'resolved'`;
        params.push(agentId);
      } else {
        query += ` AND c.assigned_agent_id IS NOT NULL AND c.assigned_agent_id != '' AND c.status != 'resolved'`;
      }
    } else if (status === 'unassigned') {
      query += ` AND (c.assigned_agent_id IS NULL OR c.assigned_agent_id = '' OR c.assigned_agent_id = 'agent-unassigned') AND c.status != 'resolved'`;
    } else if (status === 'open' || status === 'pending') {
      query += ` AND c.status = ?`;
      params.push(status);
    }
  }

  if (channel && channel !== 'all') {
    query += ` AND c.channel = ?`;
    params.push(channel);
  }

  if (search && search.trim()) {
    query += ` AND (ct.name LIKE ? OR c.subject LIKE ? OR c.last_message LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += ` ORDER BY c.updated_at DESC, c.rowid DESC`;

  const rows = db.prepare(query).all(...params);

  return rows.map(r => ({
    id: r.id,
    contactId: r.contact_id,
    channel: r.channel,
    status: r.status,
    priority: r.priority,
    subject: r.subject,
    unreadCount: r.unread_count || 0,
    lastMessage: r.last_message || '',
    lastMessageTime: r.last_message_time || '',
    csatRating: r.csat_rating,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    contact: {
      id: r.contact_id,
      name: r.contact_name,
      avatar: r.contact_avatar,
      email: r.contact_email,
      phone: r.contact_phone,
      company: r.contact_company,
      city: r.contact_city,
      tags: r.contact_tags ? JSON.parse(r.contact_tags) : [],
      ltv: r.contact_ltv,
      totalTickets: r.contact_total_tickets,
      internalNotes: r.contact_internal_notes,
      createdAt: r.contact_created_at,
    },
    assignedAgent: {
      id: r.assigned_agent_id || 'agent-unassigned',
      name: r.agent_name || 'Não atribuído',
      avatar: r.agent_avatar || '',
      role: r.agent_role || '',
      status: r.agent_status || 'offline',
    },
  }));
}

export function getConversationById(id) {
  const conv = db.prepare(`
    SELECT 
      c.id, c.contact_id, c.inbox_id, c.channel, c.status, c.priority, c.subject,
      c.assigned_agent_id, c.unread_count, c.last_message, c.last_message_time,
      c.csat_rating, c.created_at, c.updated_at,
      ct.name as contact_name, ct.avatar as contact_avatar, ct.email as contact_email,
      ct.phone as contact_phone, ct.company as contact_company, ct.city as contact_city,
      ct.tags as contact_tags, ct.ltv as contact_ltv, ct.total_tickets as contact_total_tickets,
      ct.internal_notes as contact_internal_notes, ct.created_at as contact_created_at,
      a.name as agent_name, a.avatar as agent_avatar, a.role as agent_role, a.status as agent_status
    FROM conversations c
    INNER JOIN contacts ct ON c.contact_id = ct.id
    LEFT JOIN agents a ON c.assigned_agent_id = a.id
    WHERE c.id = ?
  `).get(id);

  if (!conv) return null;

  const messagesRows = db.prepare(`
    SELECT id, conversation_id, sender, sender_name, content, timestamp, is_internal_note, attachment_json, status, created_at
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC, rowid ASC
  `).all(id);

  const messages = messagesRows.map(m => ({
    id: m.id,
    ticketId: m.conversation_id,
    sender: m.sender,
    senderName: m.sender_name,
    content: m.content,
    timestamp: m.timestamp,
    isInternalNote: Boolean(m.is_internal_note),
    attachment: m.attachment_json ? JSON.parse(m.attachment_json) : undefined,
    status: m.status,
  }));

  return {
    id: conv.id,
    contactId: conv.contact_id,
    channel: conv.channel,
    status: conv.status,
    priority: conv.priority,
    subject: conv.subject,
    unreadCount: conv.unread_count || 0,
    lastMessage: conv.last_message || '',
    lastMessageTime: conv.last_message_time || '',
    csatRating: conv.csat_rating,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
    contact: {
      id: conv.contact_id,
      name: conv.contact_name,
      avatar: conv.contact_avatar,
      email: conv.contact_email,
      phone: conv.contact_phone,
      company: conv.contact_company,
      city: conv.contact_city,
      tags: conv.contact_tags ? JSON.parse(conv.contact_tags) : [],
      ltv: conv.contact_ltv,
      totalTickets: conv.contact_total_tickets,
      internalNotes: conv.contact_internal_notes,
      createdAt: conv.contact_created_at,
    },
    assignedAgent: {
      id: conv.assigned_agent_id || 'agent-unassigned',
      name: conv.agent_name || 'Não atribuído',
      avatar: conv.agent_avatar || '',
      role: conv.agent_role || '',
      status: conv.agent_status || 'offline',
    },
    messages,
  };
}

export function addMessage({ conversationId, sender, senderName, content, timestamp, isInternalNote = false, attachment = null, status = 'delivered' }) {
  // Validação: verificar se a conversa existe antes de tentar inserir
  const conv = db.prepare('SELECT id FROM conversations WHERE id = ?').get(conversationId);
  if (!conv) {
    const err = new Error(`Conversa não encontrada: ${conversationId}`);
    err.code = 'CONVERSATION_NOT_FOUND';
    throw err;
  }

  const msgId = `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date();
  const timeStr = timestamp || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isoTime = now.toISOString();

  const insert = db.prepare(`
    INSERT INTO messages (id, conversation_id, sender, sender_name, content, timestamp, is_internal_note, attachment_json, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    msgId,
    conversationId,
    sender,
    senderName,
    content,
    timeStr,
    isInternalNote ? 1 : 0,
    attachment ? JSON.stringify(attachment) : null,
    status,
    isoTime
  );

  // Se não for nota interna, atualiza last_message na conversa
  if (!isInternalNote) {
    db.prepare(`
      UPDATE conversations
      SET last_message = ?, last_message_time = ?, updated_at = 'Agora mesmo'
      WHERE id = ?
    `).run(content, timeStr, conversationId);
  }

  return {
    id: msgId,
    ticketId: conversationId,
    sender,
    senderName,
    content,
    timestamp: timeStr,
    isInternalNote,
    attachment,
    status,
  };
}

export function updateConversationStatus(id, status) {
  const validStatuses = ['open', 'pending', 'resolved'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Status inválido: "${status}". Valores aceitos: open, pending, resolved.`);
    err.code = 'INVALID_STATUS';
    throw err;
  }

  const conv = db.prepare('SELECT id FROM conversations WHERE id = ?').get(id);
  if (!conv) {
    return null;
  }

  db.prepare(`
    UPDATE conversations
    SET status = ?, updated_at = 'Agora mesmo'
    WHERE id = ?
  `).run(status, id);
  return getConversationById(id);
}

export function updateConversationAssignee(id, agentId) {
  const conv = db.prepare('SELECT id FROM conversations WHERE id = ?').get(id);
  if (!conv) {
    return null;
  }

  const agent = db.prepare('SELECT id FROM agents WHERE id = ?').get(agentId);
  if (!agent) {
    const err = new Error(`Agente com ID "${agentId}" não encontrado.`);
    err.code = 'AGENT_NOT_FOUND';
    throw err;
  }

  db.prepare(`
    UPDATE conversations
    SET assigned_agent_id = ?, updated_at = 'Agora mesmo'
    WHERE id = ?
  `).run(agentId, id);
  return getConversationById(id);
}

export function updateContact(id, { internalNotes, tags }) {
  if (internalNotes !== undefined && tags !== undefined) {
    db.prepare(`UPDATE contacts SET internal_notes = ?, tags = ? WHERE id = ?`).run(internalNotes, JSON.stringify(tags), id);
  } else if (internalNotes !== undefined) {
    db.prepare(`UPDATE contacts SET internal_notes = ? WHERE id = ?`).run(internalNotes, id);
  } else if (tags !== undefined) {
    db.prepare(`UPDATE contacts SET tags = ? WHERE id = ?`).run(JSON.stringify(tags), id);
  }
  return db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
}

// Webhook WhatsApp (suporta WhatsApp Bridge local porta 5005, Evolution API e payload direto)
export function handleWhatsAppWebhook(payload) {
  let senderPhone = '';
  let senderName = 'Cliente WhatsApp';
  let messageText = '';

  if (payload.event === 'messages.upsert' && payload.data) {
    // Formato Evolution API (trata tanto objeto quanto array)
    const item = Array.isArray(payload.data) 
      ? payload.data[0] 
      : (payload.data.messages ? payload.data.messages[0] : payload.data);
    senderPhone = item?.key?.remoteJid?.split('@')[0] || '';
    senderName = item?.pushName || `WhatsApp ${senderPhone ? senderPhone.slice(-4) : 'User'}`;
    messageText = item?.message?.conversation || item?.message?.extendedTextMessage?.text || '';
  } else if (payload.sender && (payload.text || payload.content)) {
    // Formato WhatsApp Bridge local
    senderPhone = String(payload.sender).replace(/\D/g, '');
    senderName = payload.pushName || payload.senderName || `WhatsApp ${senderPhone.slice(-4)}`;
    messageText = payload.text || payload.content || '';
  } else if (payload.phone && payload.message) {
    // Formato payload direto
    senderPhone = String(payload.phone).replace(/\D/g, '');
    senderName = payload.name || `WhatsApp ${senderPhone.slice(-4)}`;
    messageText = payload.message;
  }

  if (!senderPhone || !messageText || !messageText.trim()) {
    const err = new Error('Payload inválido para Webhook WhatsApp. Campos sender/phone e message/text são obrigatórios.');
    err.code = 'INVALID_PAYLOAD';
    throw err;
  }

  // 1. Localizar ou criar contato
  let contact = db.prepare('SELECT * FROM contacts WHERE phone LIKE ?').get(`%${senderPhone.slice(-8)}%`);
  if (!contact) {
    const contactId = `c-wa-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const formattedPhone = senderPhone.startsWith('+') ? senderPhone : `+${senderPhone}`;
    db.prepare(`
      INSERT INTO contacts (id, name, avatar, email, phone, company, city, tags, ltv, total_tickets, internal_notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      contactId,
      senderName,
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      `${senderPhone}@whatsapp.user`,
      formattedPhone,
      'Contato WhatsApp',
      'Brasil',
      JSON.stringify(['WhatsApp Bridge', 'Novo']),
      'R$ 0,00',
      1,
      'Criado automaticamente via Webhook WhatsApp.',
      new Date().toLocaleDateString('pt-BR')
    );
    contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId);
  }

  // 2. Localizar conversa aberta para este contato no WhatsApp
  let conversation = db.prepare(`
    SELECT * FROM conversations
    WHERE contact_id = ? AND channel = 'whatsapp' AND status != 'resolved'
    ORDER BY created_at DESC LIMIT 1
  `).get(contact.id);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (!conversation) {
    const convId = generateTicketId();
    db.prepare(`
      INSERT INTO conversations (id, contact_id, inbox_id, channel, status, priority, subject, assigned_agent_id, unread_count, last_message, last_message_time, csat_rating, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      convId,
      contact.id,
      'inbox-wa',
      'whatsapp',
      'open',
      'normal',
      `Mensagem recebida via WhatsApp (${senderName})`,
      'agent-1',
      1,
      messageText.trim(),
      timeStr,
      null,
      'Hoje, ' + timeStr,
      'Agora mesmo'
    );
    conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId);
  } else {
    db.prepare(`
      UPDATE conversations
      SET unread_count = unread_count + 1, last_message = ?, last_message_time = ?, updated_at = 'Agora mesmo'
      WHERE id = ?
    `).run(messageText.trim(), timeStr, conversation.id);
  }

  // 3. Inserir mensagem
  const newMsg = addMessage({
    conversationId: conversation.id,
    sender: 'client',
    senderName,
    content: messageText.trim(),
    timestamp: timeStr,
    isInternalNote: false,
    status: 'delivered',
  });

  return {
    success: true,
    conversationId: conversation.id,
    messageId: newMsg.id,
    contactId: contact.id,
  };
}

// Webhook para Widget Embeddable externo
export function handleWidgetWebhook({ name, email, phone, message, conversationId, channel = 'webchat' }) {
  if (!message || !message.trim()) {
    const err = new Error('Mensagem é obrigatória.');
    err.code = 'INVALID_PAYLOAD';
    throw err;
  }

  const clientName = (name && name.trim()) || 'Visitante Web';
  const clientEmail = (email && email.trim()) || 'visitante@web.client';
  const clientPhone = (phone && phone.trim()) || '';

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let convId = conversationId;
  let conv = convId ? db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId) : null;

  if (!conv) {
    // Criar ou localizar contato
    let contact = db.prepare('SELECT * FROM contacts WHERE email = ?').get(clientEmail);
    if (!contact) {
      const contactId = `c-web-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      db.prepare(`
        INSERT INTO contacts (id, name, avatar, email, phone, company, city, tags, ltv, total_tickets, internal_notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        contactId,
        clientName,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        clientEmail,
        clientPhone,
        'Lead via Widget Web',
        'Website',
        JSON.stringify(['Live Widget', 'Lead']),
        'R$ 0,00',
        1,
        'Origem: Widget Embeddable AtendeFlow',
        now.toLocaleDateString('pt-BR')
      );
      contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId);
    }

    convId = generateTicketId();
    db.prepare(`
      INSERT INTO conversations (id, contact_id, inbox_id, channel, status, priority, subject, assigned_agent_id, unread_count, last_message, last_message_time, csat_rating, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      convId,
      contact.id,
      'inbox-web',
      channel,
      'open',
      'normal',
      `Conversa aberta via Widget Webchat (${clientName})`,
      'agent-1',
      1,
      message.trim(),
      timeStr,
      null,
      'Hoje, ' + timeStr,
      'Agora mesmo'
    );
  } else {
    // Reabre conversa caso esteja resolvida
    const nextStatus = conv.status === 'resolved' ? 'open' : conv.status;
    db.prepare(`
      UPDATE conversations
      SET unread_count = unread_count + 1, last_message = ?, last_message_time = ?, status = ?, updated_at = 'Agora mesmo'
      WHERE id = ?
    `).run(message.trim(), timeStr, nextStatus, conv.id);
  }

  const savedMsg = addMessage({
    conversationId: convId,
    sender: 'client',
    senderName: clientName,
    content: message.trim(),
    timestamp: timeStr,
    isInternalNote: false,
    status: 'delivered',
  });

  return {
    success: true,
    conversationId: convId,
    message: savedMsg,
  };
}

// Analytics direto do banco de dados relacional
export function getAnalytics() {
  const total = db.prepare('SELECT COUNT(*) as total FROM conversations').get().total;
  const openCount = db.prepare("SELECT COUNT(*) as c FROM conversations WHERE status = 'open'").get().c;
  const pendingCount = db.prepare("SELECT COUNT(*) as c FROM conversations WHERE status = 'pending'").get().c;
  const resolvedCount = db.prepare("SELECT COUNT(*) as c FROM conversations WHERE status = 'resolved'").get().c;
  const totalMessages = db.prepare('SELECT COUNT(*) as c FROM messages').get().c;

  const csatRow = db.prepare('SELECT AVG(csat_rating) as avg_csat FROM conversations WHERE csat_rating IS NOT NULL').get();
  const avgCsat = csatRow?.avg_csat ? Number(csatRow.avg_csat).toFixed(1) : '4.9';

  const channelsRows = db.prepare(`
    SELECT channel, COUNT(*) as count
    FROM conversations
    GROUP BY channel
  `).all();

  const channelBreakdown = {
    whatsapp: 0,
    webchat: 0,
    instagram: 0,
    email: 0,
  };
  channelsRows.forEach(row => {
    if (channelBreakdown[row.channel] !== undefined) {
      channelBreakdown[row.channel] = row.count;
    }
  });

  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 100;

  return {
    totalTickets: total,
    openTickets: openCount,
    pendingTickets: pendingCount,
    resolvedTickets: resolvedCount,
    totalMessages,
    avgFrt: '1m 42s',
    avgMttr: '14m 10s',
    csatScore: avgCsat,
    resolutionRate: `${resolutionRate}%`,
    slaCompliance: '99.4%',
    channelBreakdown,
  };
}

// Canned Responses
export function getCannedResponses() {
  return db.prepare('SELECT * FROM canned_responses ORDER BY category ASC, shortcut ASC').all();
}

export function createCannedResponse({ shortcut, title, content, category }) {
  const id = `cr-${Date.now()}`;
  db.prepare(`
    INSERT INTO canned_responses (id, shortcut, title, content, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, shortcut, title, content, category, new Date().toISOString());
  return db.prepare('SELECT * FROM canned_responses WHERE id = ?').get(id);
}

// Knowledge Base
export function getKnowledgeArticles() {
  return db.prepare('SELECT * FROM knowledge_articles ORDER BY views DESC').all().map(a => ({
    id: a.id,
    title: a.title,
    category: a.category,
    summary: a.summary,
    content: a.content,
    readTime: a.read_time,
    views: a.views,
    helpfulCount: a.helpful_count,
    updatedAt: a.updated_at,
  }));
}

export function markArticleHelpful(id) {
  db.prepare('UPDATE knowledge_articles SET helpful_count = helpful_count + 1 WHERE id = ?').run(id);
  return db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(id);
}

// Agents & Contacts
export function getAgents() {
  return db.prepare('SELECT * FROM agents ORDER BY id ASC').all();
}

export function updateAgentStatus(id, status) {
  db.prepare('UPDATE agents SET status = ? WHERE id = ?').run(status, id);
  return db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
}

export function getContacts() {
  return db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all().map(c => ({
    ...c,
    tags: c.tags ? JSON.parse(c.tags) : [],
    totalTickets: c.total_tickets,
    internalNotes: c.internal_notes,
    createdAt: c.created_at,
  }));
}
