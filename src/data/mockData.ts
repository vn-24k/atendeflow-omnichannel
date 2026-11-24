import { Ticket, Contact, Agent, CannedResponse, KnowledgeArticle, Message } from '../types';

export const CURRENT_AGENT: Agent = {
  id: 'agent-1',
  name: 'Vinícius Caetano',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'Supervisor de Operações',
  status: 'online',
};

export const TEAM_AGENTS: Agent[] = [
  CURRENT_AGENT,
  {
    id: 'agent-2',
    name: 'Mariana Duarte',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'Especialista N2 WhatsApp',
    status: 'online',
  },
  {
    id: 'agent-3',
    name: 'Lucas Ferreira',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'Suporte Técnico e Integrações',
    status: 'busy',
  },
  {
    id: 'agent-4',
    name: 'Beatriz Lima',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    role: 'Customer Success',
    status: 'away',
  },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c-1',
    name: 'Rodrigo Medeiros',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    email: 'rodrigo@alphagestao.com.br',
    phone: '+55 11 98845-2190',
    company: 'Alpha Gestão Contábil',
    city: 'São Paulo, SP',
    tags: ['Cliente VIP', 'Contrato Pro', 'Renovação Próxima'],
    ltv: 'R$ 14.800',
    totalTickets: 8,
    internalNotes: 'Cliente muito objetivo. Prefere contato via WhatsApp e prefere falar sempre no horário da manhã.',
    createdAt: '15/03/2026',
  },
  {
    id: 'c-2',
    name: 'Camila Vasconcelos',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    email: 'camila.v@studioestetica.com',
    phone: '+55 11 97120-4389',
    company: 'Studio Vasconcelos Estética',
    city: 'Campinas, SP',
    tags: ['Lead Quente', 'Avaliação Grátis'],
    ltv: 'R$ 3.200',
    totalTickets: 3,
    internalNotes: 'Interessada no plano Enterprise para 5 unidades. Foco em automação de agendamentos pelo WhatsApp.',
    createdAt: '02/11/2026',
  },
  {
    id: 'c-3',
    name: 'Eduardo Silveira',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    email: 'eduardo@logexpress.com.br',
    phone: '+55 19 99654-1022',
    company: 'LogExpress Transportes',
    city: 'Santos, SP',
    tags: ['Suporte Crítico', 'SLA 1h', 'API Webhook'],
    ltv: 'R$ 29.500',
    totalTickets: 19,
    internalNotes: 'CTO da transportadora. Quando abre ticket é questão técnica de webhook ou emissão de NFe.',
    createdAt: '10/01/2026',
  },
  {
    id: 'c-4',
    name: 'Juliana Pires',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    email: 'juliana.pires@modaatacado.com.br',
    phone: '+55 11 98412-9901',
    company: 'Pires Confecções & Moda',
    city: 'São Paulo, SP',
    tags: ['E-commerce', 'Catálogo Pix'],
    ltv: 'R$ 8.900',
    totalTickets: 5,
    internalNotes: 'Dona de confecção. Dúvida frequente sobre cálculo automático de frete nas mensagens.',
    createdAt: '19/08/2026',
  },
  {
    id: 'c-5',
    name: 'Felipe Fontana',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    email: 'felipe@fontanaburgers.com.br',
    phone: '+55 11 99182-3344',
    company: 'Fontana Smash & Beer',
    city: 'São Bernardo do Campo, SP',
    tags: ['Gastronomia', 'Volume Alto'],
    ltv: 'R$ 5.400',
    totalTickets: 2,
    internalNotes: 'Pico de atendimento às sextas e sábados a partir das 18h.',
    createdAt: '05/10/2026',
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TCK-1042',
    contactId: 'c-1',
    contact: INITIAL_CONTACTS[0],
    channel: 'whatsapp',
    status: 'open',
    priority: 'high',
    subject: 'Solicitação de chave Pix e upgrade para plano anual',
    assignedAgent: CURRENT_AGENT,
    createdAt: 'Hoje, 07:15',
    updatedAt: 'Há 4 min',
    unreadCount: 1,
    lastMessage: 'Perfeito Vinícius, me envia a chave Pix para eu autorizar o pagamento agora mesmo.',
    lastMessageTime: '07:38',
  },
  {
    id: 'TCK-1041',
    contactId: 'c-2',
    contact: INITIAL_CONTACTS[1],
    channel: 'webchat',
    status: 'open',
    priority: 'normal',
    subject: 'Como funciona a integração com nosso catálogo de produtos?',
    assignedAgent: CURRENT_AGENT,
    createdAt: 'Hoje, 06:50',
    updatedAt: 'Há 12 min',
    unreadCount: 0,
    lastMessage: 'Entendi, então os pedidos chegam direto organizados no WhatsApp?',
    lastMessageTime: '07:30',
  },
  {
    id: 'TCK-1040',
    contactId: 'c-3',
    contact: INITIAL_CONTACTS[2],
    channel: 'email',
    status: 'pending',
    priority: 'urgent',
    subject: 'Instabilidade no webhook de despacho de mercadorias #LOG-992',
    assignedAgent: TEAM_AGENTS[2],
    createdAt: 'Hoje, 05:20',
    updatedAt: 'Há 35 min',
    unreadCount: 0,
    lastMessage: 'Equipe de infraestrutura já aplicou o patch no endpoint. Aguardando validação do cliente.',
    lastMessageTime: '07:05',
  },
  {
    id: 'TCK-1039',
    contactId: 'c-4',
    contact: INITIAL_CONTACTS[3],
    channel: 'instagram',
    status: 'open',
    priority: 'normal',
    subject: 'Vocês atendem no feriado prolongado de final de ano?',
    assignedAgent: TEAM_AGENTS[1],
    createdAt: 'Ontem, 21:10',
    updatedAt: 'Há 1 hora',
    unreadCount: 2,
    lastMessage: 'Oi Ju! Vi o story de vocês e queria saber como contrato.',
    lastMessageTime: '06:40',
  },
  {
    id: 'TCK-1038',
    contactId: 'c-5',
    contact: INITIAL_CONTACTS[4],
    channel: 'whatsapp',
    status: 'resolved',
    priority: 'low',
    subject: 'Configuração dos horários de expediente no bot',
    assignedAgent: CURRENT_AGENT,
    createdAt: 'Ontem, 16:00',
    updatedAt: 'Ontem, 17:30',
    unreadCount: 0,
    lastMessage: 'Muito obrigado, ficou perfeito! Nota 10 pro suporte.',
    lastMessageTime: '17:30',
    csatRating: 5,
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'TCK-1042': [
    {
      id: 'm-1',
      ticketId: 'TCK-1042',
      sender: 'client',
      senderName: 'Rodrigo Medeiros',
      content: 'Bom dia Vinícius! Tudo bem por aí? Estamos fechando o balanço do trimestre e decidimos antecipar a renovação anual da nossa conta.',
      timestamp: '07:15',
      status: 'read',
    },
    {
      id: 'm-2',
      ticketId: 'TCK-1042',
      sender: 'agent',
      senderName: 'Vinícius Caetano',
      content: 'Fala Rodrigo, bom dia! Excelente notícia meu amigo. Vamos emitir o plano anual com 20% de desconto institucional como combinamos.',
      timestamp: '07:22',
      status: 'read',
    },
    {
      id: 'm-3',
      ticketId: 'TCK-1042',
      sender: 'agent',
      senderName: 'Vinícius Caetano',
      content: 'ATENÇÃO EQUIPE: Aplicar o cupom ANUAL-ALPHA no painel financeiro antes de liberar os 10 acessos adicionais.',
      timestamp: '07:25',
      isInternalNote: true,
    },
    {
      id: 'm-4',
      ticketId: 'TCK-1042',
      sender: 'agent',
      senderName: 'Vinícius Caetano',
      content: 'Segue a proposta comercial atualizada com todos os termos de SLA de 1 hora garantidos em contrato.',
      timestamp: '07:28',
      attachment: {
        name: 'Proposta_Comercial_Alpha_Anual_2026.pdf',
        size: '1.4 MB',
        type: 'pdf',
      },
      status: 'read',
    },
    {
      id: 'm-5',
      ticketId: 'TCK-1042',
      sender: 'client',
      senderName: 'Rodrigo Medeiros',
      content: 'Perfeito Vinícius, me envia a chave Pix para eu autorizar o pagamento agora mesmo.',
      timestamp: '07:38',
      status: 'read',
    },
  ],
  'TCK-1041': [
    {
      id: 'm-201',
      ticketId: 'TCK-1041',
      sender: 'client',
      senderName: 'Camila Vasconcelos',
      content: 'Olá! Estou navegando no site de vocês e gostaria de tirar uma dúvida sobre o plano para franquias.',
      timestamp: '06:50',
      status: 'read',
    },
    {
      id: 'm-202',
      ticketId: 'TCK-1041',
      sender: 'agent',
      senderName: 'Vinícius Caetano',
      content: 'Olá Camila! Seja bem-vinda ao AtendeFlow. Com certeza, como posso te ajudar hoje?',
      timestamp: '07:05',
      status: 'read',
    },
    {
      id: 'm-203',
      ticketId: 'TCK-1041',
      sender: 'client',
      senderName: 'Camila Vasconcelos',
      content: 'Entendi, então os pedidos chegam direto organizados no WhatsApp?',
      timestamp: '07:30',
      status: 'read',
    },
  ],
};

export const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: 'cr-1',
    shortcut: '/pix',
    title: 'Dados Bancários & Chave Pix',
    content: 'Segue nossa chave Pix Oficial (CNPJ): 48.912.890/0001-24 (AtendeFlow Soluções Tecnológicas). Após efetuar a transferência, basta anexar o comprovante aqui para liberação imediata!',
    category: 'Cobrança',
  },
  {
    id: 'cr-2',
    shortcut: '/horario',
    title: 'Horário de Atendimento',
    content: 'Nosso time de atendimento humano funciona de Segunda a Sexta, das 08h às 19h, e aos Sábados das 09h às 13h. Chamados urgentes com SLA contratado contam com plantão 24/7.',
    category: 'Informações',
  },
  {
    id: 'cr-3',
    shortcut: '/boasvindas',
    title: 'Acolhimento & Boas-Vindas',
    content: 'Olá! Sou o Vinícius da equipe de atendimento da AtendeFlow. Já localizei seu cadastro aqui e estou à sua disposição. Como posso te apoiar hoje?',
    category: 'Boas-Vindas',
  },
  {
    id: 'cr-4',
    shortcut: '/sla',
    title: 'Compromisso de SLA & Prazos',
    content: 'Seu chamado foi classificado com prioridade alta. Nosso tempo médio de resolução para esta categoria é de até 2 horas úteis. Manteremos você informado a cada avanço!',
    category: 'Suporte',
  },
  {
    id: 'cr-5',
    shortcut: '/reembolso',
    title: 'Política de Garantia de 30 Dias',
    content: 'Oferecemos garantia incondicional de satisfação por 30 dias. Caso a plataforma não atenda sua operação, o estorno integral é processado em até 24h sem burocracia.',
    category: 'Cobrança',
  },
];

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art-1',
    title: 'Como conectar seu WhatsApp Oficial via QR Code em 2 minutos',
    category: 'Primeiros Passos',
    summary: 'Passo a passo visual para parear seu número comercial com múltiplos atendentes simultâneos sem risco de banimento.',
    readTime: '3 min',
    views: 4820,
    helpfulCount: 421,
    updatedAt: '18/11/2026',
    content: `
### Visão Geral da Conexão
Conectar o WhatsApp comercial ao AtendeFlow permite que toda a sua equipe atenda usando um único número de telefone, mantendo o histórico unificado e as métricas de resposta centralizadas.

#### Passo 1: Acesse Configurações de Canais
1. No menu lateral, clique em **Canais de Entrada** > **WhatsApp**.
2. Clique no botão azul **Conectar Novo Número**.

#### Passo 2: Escaneamento Seguro
1. Abra o WhatsApp no celular do administrador da empresa.
2. Vá em **Aparelhos Conectados** > **Conectar Aparelho**.
3. Aponte a câmera para o QR Code gerado na tela do AtendeFlow.

> **Importante:** Mantenha o telefone conectado à internet nas primeiras sincronizações para descarregar o histórico de conversas ativas.
    `,
  },
  {
    id: 'art-2',
    title: 'Notas Internas Privadas: Como colaborar sem o cliente ver',
    category: 'Primeiros Passos',
    summary: 'Aprenda a marcar outros atendentes e discutir detalhes de contratos diretamente na timeline da conversa de forma 100% invisível para o cliente.',
    readTime: '2 min',
    views: 3150,
    helpfulCount: 298,
    updatedAt: '21/11/2026',
    content: `
### O que são Notas Internas?
Notas internas são comentários destacados em cor âmbar na timeline do ticket. Elas são visíveis **exclusivamente para a sua equipe interna** e jamais chegam ao WhatsApp ou chat do cliente.

#### Como Utilizar:
* No rodapé da conversa, clique na aba **"Nota Interna"** ou use o atalho **Shift + Enter**.
* O campo de texto ficará com fundo amarelo suave e aviso de privacidade.
* Digite sua anotação ou mencione outro membro da equipe.
    `,
  },
  {
    id: 'art-3',
    title: 'Instalando o Widget de Chat ao Vivo no seu site ou landing page',
    category: 'Integrações',
    summary: 'Script minúsculo de 1 linha para incorporar a janela de atendimento em qualquer página HTML, WordPress ou aplicação React.',
    readTime: '4 min',
    views: 2940,
    helpfulCount: 210,
    updatedAt: '12/11/2026',
    content: `
### Instalação em Qualquer Website
Basta colar a tag de script antes do fechamento da tag \`</body>\` do seu site:

\`\`\`html
<script src="https://cdn.atendeflow.com.br/widget.js" data-app-id="SEU_ID_AQUI" async></script>
\`\`\`

O widget se adapta automaticamente às cores da sua marca e detecta se há operadores online para oferecer opções de WhatsApp quando a equipe estiver em horário de almoço.
    `,
  },
  {
    id: 'art-4',
    title: 'Entendendo as Métricas: O que significa FRT, MTTR e CSAT?',
    category: 'Faturamento & Planos',
    summary: 'Guia definitivo para gestores sobre os indicadores de atendimento que definem a taxa de conversão e a retenção de clientes.',
    readTime: '5 min',
    views: 1890,
    helpfulCount: 165,
    updatedAt: '14/11/2026',
    content: `
### Os 3 Grandes Indicadores da Operação

1. **FRT (First Response Time):** Tempo decorrido entre a mensagem do cliente e a primeira intervenção humana. Operações de alta performance mantêm o FRT abaixo de 3 minutos.
2. **MTTR (Mean Time to Resolution):** Tempo médio total desde a abertura até o fechamento com status Resolvido.
3. **CSAT (Customer Satisfaction Score):** Nota de 1 a 5 estrelas enviada automaticamente após a resolução do ticket.
    `,
  },
];
