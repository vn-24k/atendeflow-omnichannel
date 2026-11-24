# AtendeFlow — Central Corporativa de Atendimento Omnichannel Full-Stack

> Plataforma corporativa de atendimento omnichannel de nível sênior (alternativa open-source ao Chatwoot, Intercom e Zendesk), equipada com banco de dados relacional SQLite, backend REST completo, webhooks para WhatsApp Bridge e clientes externos, widget embeddable autônomo, timeline colaborativa com notas internas privadas, CRM 360°, Base de Conhecimento e telemetria analítica de SLA e CSAT.

---

## 🏛️ Arquitetura de Produção Full-Stack

O **AtendeFlow** foi concebido sob rigorosa arquitetura relacional e desacoplada, eliminando qualquer dependência de dados mockados em memória. Todas as mensagens, contatos, conversas e telemetria persistem diretamente no banco de dados SQLite em disco.

```
                    ┌─────────────────────────────────┐
                    │       ATENDEFLOW PLATFORM       │
                    │   React 19 + TypeScript + REST  │
                    └────────────────┬────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│   WHATSAPP BRIDGE  │    │  WIDGET EMBEDDABLE │    │  API REST BACKEND  │
│ Webhook Porta 5005 │    │    public/widget.js│    │   /api/conversations│
└──────────┬─────────┘    └──────────┬─────────┘    └──────────┬─────────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │    BANCO DE DADOS RELACIONAL    │
                    │   SQLite Nativo com Foreign Keys │
                    │ inboxes, contacts, conversations│
                    │ messages, canned, articles, etc │
                    └─────────────────────────────────┘
```

---

## ⚡ Recursos de Engenharia & Backend

### 1. Banco de Dados Relacional Real (SQLite)
- Tabelas com integridade referencial estrita (`FOREIGN KEY ... REFERENCES`):
  - `inboxes`: canais de entrada e webhooks associados.
  - `contacts`: perfil CRM com telefone, e-mail, LTV, tags dinâmicas e notas internas.
  - `agents`: operadores e supervisores com status operacional (`online`, `busy`, `away`, `offline`).
  - `conversations`: tickets multicanal com SLA, prioridade, operador responsável e contadores não lidos.
  - `messages`: histórico de mensagens públicas e notas internas privadas destacadas.
  - `canned_responses`: macros de respostas rápidas categorizadas.
  - `knowledge_articles`: artigos da central de ajuda pública com contadores de views e utilidade.
- Índices otimizados por `status`, `channel`, `contact_id` e `conversation_id`.

### 2. Endpoints da API REST
- `GET /api/conversations`: Listagem de conversas com filtros relacionais de status (`all`, `mine`, `unassigned`, `resolved`), canal e busca por texto.
- `GET /api/conversations/:id`: Detalhes da conversa com suas mensagens ordenadas cronologicamente e ficha CRM.
- `POST /api/conversations/:id/messages`: Gravação de nova mensagem pública com atualização atômica de `last_message` e timestamp.
- `POST /api/conversations/:id/notes`: Gravação de notas internas confidenciais (invisíveis para clientes).
- `PATCH /api/conversations/:id/status`: Transição de status do chamado (`open` -> `pending` -> `resolved`).
- `PATCH /api/conversations/:id/assign`: Atribuição de atendente responsável.
- `POST /api/webhooks/whatsapp`: Webhook pronto para receber mensagens do WhatsApp Bridge local (porta 5005) ou Evolution API, criando contatos e tickets automaticamente.
- `POST /api/webhooks/widget`: Webhook para o Widget de Chat embeddable externo.
- `GET /api/reports/analytics`: Telemetria em tempo real calculada direto do banco (FRT, MTTR, CSAT, taxa de resolução e distribuição de canais).
- `GET & POST /api/canned-responses`: Gerenciamento de respostas prontas.
- `GET /api/knowledge-articles`: Artigos da base de conhecimento.
- `PATCH /api/contacts/:id`: Atualização de tags e notas do CRM.

### 3. Widget Embeddable Autônomo (`public/widget.js`)
Script em JavaScript Vanilla ultra-leve, sem dependências externas, que pode ser incorporado em qualquer página HTML, WordPress, Shopify ou React:
```html
<script src="https://atendeflow-swart.vercel.app/widget.js" data-title="Suporte Oficial" data-primary-color="#4F46E5" async></script>
```
- Janela flutuante moderna com histórico persistido na sessão do visitante.
- Comunicação direta via API REST com o AtendeFlow.
- Polling inteligente para receber respostas do atendente em tempo real.
- Página demonstrativa pronta disponível em `/widget-demo.html`.

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Framer Motion
- **Backend:** Node.js Serverless / Standalone HTTP Router
- **Banco de Dados:** SQLite nativo com Foreign Keys e persistência relacional
- **Build & Dev:** Vite 6 com plugin de middleware de API integrado
- **Deploy:** Vercel (Edge & Serverless Functions) + GitHub CI/CD

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento integrado (Frontend + API + SQLite)
npm run dev

# 3. Executar servidor de produção standalone
npm run build
npm start
```

---

## 🧪 Testes Automatizados de Integração

A aplicação conta com uma suíte de testes de integração profunda que valida todos os endpoints da API REST e a integridade relacional do SQLite:

```bash
node tests/integration_test.js
```

---

**Autor:** Vinicius Caetano (`vn-24k`)  
**Licença:** Proprietária / MIT
