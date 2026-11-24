(function () {
  'use strict';

  // Evitar dupla inicialização
  if (window.AtendeFlowWidgetLoaded) return;
  window.AtendeFlowWidgetLoaded = true;

  // Localizar tag de script para obter configurações
  const scriptTag = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Detectar a URL base da API a partir do src do script ou fallback para host atual
  let baseUrl = '';
  if (scriptTag && scriptTag.src) {
    try {
      const url = new URL(scriptTag.src);
      baseUrl = url.origin;
    } catch {
      baseUrl = window.location.origin;
    }
  } else {
    baseUrl = window.location.origin;
  }

  const primaryColor = scriptTag?.getAttribute('data-primary-color') || '#4F46E5';
  const widgetTitle = scriptTag?.getAttribute('data-title') || 'AtendeFlow • Suporte';
  const agentName = scriptTag?.getAttribute('data-agent') || 'Atendimento Omnichannel';

  // Estado local do widget
  const STORAGE_KEY = 'atendeflow_widget_session';
  let sessionData = {
    conversationId: null,
    clientName: 'Visitante Web',
    messages: [
      {
        id: 'welcome',
        sender: 'agent',
        senderName: agentName,
        content: 'Olá! Seja muito bem-vindo ao AtendeFlow. Como nossa equipe pode te apoiar hoje?',
        timestamp: getFormattedTime(),
      }
    ]
  };

  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      sessionData = JSON.parse(saved);
    }
  } catch {
    // sessionStorage indisponível
  }

  function saveSession() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch {}
  }

  function getFormattedTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // Estilos isolados do Widget
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #atendeflow-widget-root {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    #atendeflow-widget-root * {
      box-sizing: border-box;
    }
    #atendeflow-trigger-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${primaryColor}, #3730A3);
      color: #ffffff;
      border: none;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    #atendeflow-trigger-btn:hover {
      transform: scale(1.06);
      box-shadow: 0 14px 28px -4px rgba(79, 70, 229, 0.5);
    }
    #atendeflow-trigger-btn:active {
      transform: scale(0.96);
    }
    #atendeflow-online-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background-color: #10B981;
      border: 2.5px solid #ffffff;
      border-radius: 50%;
    }
    #atendeflow-chat-window {
      display: none;
      width: 380px;
      height: 560px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 100px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.16), 0 0 1px 1px rgba(0, 0, 0, 0.05);
      border: 1px solid #E2E8F0;
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 16px;
      animation: atendeflowFadeIn 0.25s ease-out forwards;
    }
    @keyframes atendeflowFadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .atendeflow-header {
      background: linear-gradient(135deg, ${primaryColor}, #312E81);
      color: #ffffff;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .atendeflow-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .atendeflow-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      border: 1.5px solid rgba(255, 255, 255, 0.4);
    }
    .atendeflow-header-text h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .atendeflow-header-text p {
      margin: 2px 0 0;
      font-size: 11px;
      opacity: 0.85;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .atendeflow-pulse-dot {
      width: 6px;
      height: 6px;
      background: #34D399;
      border-radius: 50%;
    }
    .atendeflow-close-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .atendeflow-close-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .atendeflow-messages-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #F8FAFC;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .atendeflow-msg-bubble {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.45;
      word-break: break-word;
    }
    .atendeflow-msg-agent {
      align-self: flex-start;
      background: #ffffff;
      color: #1E293B;
      border: 1px solid #E2E8F0;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    .atendeflow-msg-client {
      align-self: flex-end;
      background: ${primaryColor};
      color: #ffffff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
    }
    .atendeflow-msg-time {
      font-size: 10px;
      opacity: 0.7;
      margin-top: 4px;
      text-align: right;
    }
    .atendeflow-input-footer {
      padding: 12px 14px;
      background: #ffffff;
      border-top: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .atendeflow-input-field {
      flex: 1;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 13.5px;
      color: #1E293B;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .atendeflow-input-field:focus {
      border-color: ${primaryColor};
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
    .atendeflow-send-btn {
      background: ${primaryColor};
      color: #ffffff;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.15s, transform 0.1s;
    }
    .atendeflow-send-btn:hover {
      opacity: 0.9;
    }
    .atendeflow-send-btn:active {
      transform: scale(0.95);
    }
    .atendeflow-watermark {
      font-size: 10px;
      color: #94A3B8;
      text-align: center;
      padding-bottom: 6px;
      background: #ffffff;
    }
  `;
  document.head.appendChild(styleEl);

  // Criar elemento container
  const rootEl = document.createElement('div');
  rootEl.id = 'atendeflow-widget-root';

  rootEl.innerHTML = `
    <div id="atendeflow-chat-window">
      <div class="atendeflow-header">
        <div class="atendeflow-header-info">
          <div class="atendeflow-avatar">AF</div>
          <div class="atendeflow-header-text">
            <h3>${widgetTitle}</h3>
            <p><span class="atendeflow-pulse-dot"></span> Online • Resposta em ~2 min</p>
          </div>
        </div>
        <button class="atendeflow-close-btn" id="atendeflow-close-trigger" aria-label="Fechar chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="atendeflow-messages-body" id="atendeflow-msgs-container"></div>

      <form class="atendeflow-input-footer" id="atendeflow-form">
        <input type="text" class="atendeflow-input-field" id="atendeflow-text-input" placeholder="Digite sua mensagem..." autocomplete="off" />
        <button type="submit" class="atendeflow-send-btn" id="atendeflow-submit-btn" aria-label="Enviar mensagem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
      <div class="atendeflow-watermark">Atendimento Omnichannel • AtendeFlow</div>
    </div>

    <button id="atendeflow-trigger-btn" aria-label="Abrir atendimento ao cliente">
      <div id="atendeflow-online-dot"></div>
      <svg id="atendeflow-open-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </button>
  `;

  document.body.appendChild(rootEl);

  // Referências DOM
  const chatWindow = document.getElementById('atendeflow-chat-window');
  const triggerBtn = document.getElementById('atendeflow-trigger-btn');
  const closeBtn = document.getElementById('atendeflow-close-trigger');
  const msgsContainer = document.getElementById('atendeflow-msgs-container');
  const form = document.getElementById('atendeflow-form');
  const input = document.getElementById('atendeflow-text-input');

  let isOpen = false;
  let pollInterval = null;

  function renderMessages() {
    msgsContainer.innerHTML = '';
    sessionData.messages.forEach(msg => {
      const bubble = document.createElement('div');
      const isAgent = msg.sender === 'agent' || msg.sender === 'system';
      bubble.className = `atendeflow-msg-bubble ${isAgent ? 'atendeflow-msg-agent' : 'atendeflow-msg-client'}`;
      
      const content = document.createElement('div');
      content.textContent = msg.content;
      bubble.appendChild(content);

      const time = document.createElement('div');
      time.className = 'atendeflow-msg-time';
      time.textContent = msg.timestamp || '';
      bubble.appendChild(time);

      msgsContainer.appendChild(bubble);
    });

    msgsContainer.scrollTop = msgsContainer.scrollHeight;
  }

  function toggleWidget(forceOpen) {
    isOpen = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
    if (isOpen) {
      chatWindow.style.display = 'flex';
      triggerBtn.style.display = 'none';
      renderMessages();
      input.focus();
      startPolling();
    } else {
      chatWindow.style.display = 'none';
      triggerBtn.style.display = 'flex';
      stopPolling();
    }
  }

  triggerBtn.addEventListener('click', () => toggleWidget(true));
  closeBtn.addEventListener('click', () => toggleWidget(false));

  // Envio de mensagem
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    const newMsg = {
      id: 'local-' + Date.now(),
      sender: 'client',
      senderName: sessionData.clientName,
      content: text,
      timestamp: getFormattedTime(),
    };

    sessionData.messages.push(newMsg);
    saveSession();
    renderMessages();

    try {
      const response = await fetch(`${baseUrl}/api/webhooks/widget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sessionData.clientName,
          email: `${sessionData.clientName.toLowerCase().replace(/\s+/g, '')}@cliente.web`,
          message: text,
          conversationId: sessionData.conversationId,
          channel: 'webchat'
        }),
      });

      const data = await response.json();
      if (data && data.result && data.result.conversationId) {
        sessionData.conversationId = data.result.conversationId;
        saveSession();
      }
    } catch (err) {
      console.warn('Erro ao sincronizar mensagem com AtendeFlow:', err);
    }
  });

  // Polling para sincronizar respostas do operador quando a janela estiver aberta
  async function pollUpdates() {
    if (!isOpen || !sessionData.conversationId) return;

    try {
      const res = await fetch(`${baseUrl}/api/conversations/${sessionData.conversationId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.messages)) {
        // Filtrar apenas mensagens públicas (ignorar notas internas)
        const publicMsgs = json.data.messages.filter(m => !m.isInternalNote);
        if (publicMsgs.length > 0) {
          sessionData.messages = publicMsgs.map(m => ({
            id: m.id,
            sender: m.sender,
            senderName: m.senderName,
            content: m.content,
            timestamp: m.timestamp,
          }));
          saveSession();
          renderMessages();
        }
      }
    } catch {}
  }

  function startPolling() {
    stopPolling();
    pollInterval = setInterval(pollUpdates, 3500);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Render inicial
  renderMessages();
})();
