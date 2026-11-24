# AtendeFlow — Central Corporativa de Atendimento Omnichannel

> Plataforma corporativa para centralização e gestão de conversas multicanal (WhatsApp Oficial, Chat Web, Instagram Direct e E-mail), com colaboração em equipe, notas internas privadas, CRM integrado, Base de Conhecimento pública e telemetria avançada de SLA e CSAT.

---

## 🏛️ Visão Geral & Arquitetura

O **AtendeFlow** foi desenvolvido para resolver o gargalo crítico de operações de atendimento, vendas e pós-venda. Ele unifica em uma única interface ágil e desktop-grade todas as interações de clientes da empresa, garantindo que nenhum chamado seja esquecido e que o tempo de primeira resposta (FRT) permaneça abaixo de 3 minutos.

```
                    ┌─────────────────────────────────┐
                    │       ATENDEFLOW PLATFORM       │
                    │    Inbox Unificada Omnichannel  │
                    └────────────────┬────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
│ WHATSAPP OFICIAL │       │ WIDGET CHAT WEB  │        │ INSTAGRAM & MAIL │
│  Conexão Direta  │       │  Simulador Vivo  │        │  DMs e Suporte   │
└──────────────────┘       └──────────────────┘        └──────────────────┘
```

---

## ⚡ Recursos de Engenharia

1. **Inbox Unificada Multicanal:**
   - Visualização em tempo real de filas de atendimento com abas (`Minhas`, `Não Atribuídas`, `Todas`, `Resolvidas`).
   - Identificação visual instantânea por canal: WhatsApp (verde), Chat do Site (azul), Instagram Direct (roxo) e E-mail (âmbar).
   - Indicadores de prioridade (`Urgente`, `Alta`, `Normal`) e contadores de mensagens não lidas.

2. **Timeline de Chat com Notas Internas Privadas:**
   - Mensagens públicas com status de entregue e lido.
   - **Modo Colaborativo de Equipe:** Alternância para *Nota Interna Privada* (balão âmbar com cadeado), visível exclusivamente para atendentes e supervisores, sem que o cliente veja no WhatsApp ou web.
   - Envio de anexos (propostas comerciais, notas fiscais e comprovantes em PDF).

3. **Macros & Respostas Rápidas (Canned Responses):**
   - Inserção de respostas pré-programadas com um clique ou via atalho (`/pix`, `/horario`, `/boasvindas`, `/sla`).

4. **CRM 360° do Cliente Integrado:**
   - Ficha completa com dados cadastrais, telefone com link direto para WhatsApp, e-mail, empresa e cidade.
   - Gestão dinâmica de tags de segmentação (`VIP`, `Lead Quente`, `Contrato Pro`).
   - Cálculo de LTV e histórico acumulado de atendimentos.
   - Bloco de anotações internas com persistência automática.

5. **Simulador Interativo do Cliente:**
   - Widget flutuante que permite simular em tempo real o envio de mensagens como cliente final, testando a entrada do chamado na fila do operador.

6. **Central de Ajuda Pública (Knowledge Base):**
   - Base de conhecimento categorizada (Primeiros Passos, Faturamento, Integrações, Segurança).
   - Busca instantânea por palavras-chave com artigos completos e cálculo de leitura.

7. **Dashboard Executivo de Métricas & SLA:**
   - Monitoramento de Tempo Médio de Primeira Resposta (FRT), Tempo Médio de Resolução (MTTR) e Índice de Satisfação (CSAT).
   - Gráficos de distribuição percentual de tráfego por canal.
   - Tabela de produtividade individual por atendente.

---

## 🛠️ Stack Tecnológica

- **Framework:** React 19 + TypeScript
- **Bundler & Build Tool:** Vite 6
- **Estilização:** Tailwind CSS v4
- **Ícones & Microinterações:** Lucide React & Framer Motion
- **Tipografia:** Plus Jakarta Sans & Cabinet Grotesk
- **Deploy:** Vercel (Edge Network)

---

## 🚀 Como Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build
```

---

**Autor:** Vinicius Caetano (`vn-24k`)  
**Licença:** Proprietária / MIT
