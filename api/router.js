import * as db from './db.js';

// Utilitário para parsear body JSON de uma stream de requisição Node.js
export async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

// Utilitário para enviar respostas JSON
export function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.end(JSON.stringify(data));
}

// Router principal para as APIs
export async function handleApiRequest(req, res) {
  // Configurar CORS pre-flight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.end();
    return;
  }

  const host = req.headers.host || 'localhost';
  const urlObj = new URL(req.url, `http://${host}`);
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;
  const method = req.method.toUpperCase();

  try {
    // 1. GET /api/conversations
    if (method === 'GET' && pathname === '/api/conversations') {
      const status = searchParams.get('status') || 'all';
      const channel = searchParams.get('channel') || 'all';
      const search = searchParams.get('search') || '';
      const agentId = searchParams.get('agentId') || null;

      const convs = db.getConversations({ status, channel, search, agentId });
      return sendJson(res, 200, { success: true, count: convs.length, data: convs });
    }

    // 2. GET /api/conversations/:id
    const convIdMatch = pathname.match(/^\/api\/conversations\/([A-Za-z0-9_-]+)$/);
    if (method === 'GET' && convIdMatch) {
      const convId = convIdMatch[1];
      const conversation = db.getConversationById(convId);
      if (!conversation) {
        return sendJson(res, 404, { success: false, error: 'Conversa não encontrada.' });
      }
      return sendJson(res, 200, { success: true, data: conversation });
    }

    // 3. POST /api/conversations/:id/messages
    const msgMatch = pathname.match(/^\/api\/conversations\/([A-Za-z0-9_-]+)\/messages$/);
    if (method === 'POST' && msgMatch) {
      const convId = msgMatch[1];
      const body = await parseBody(req);
      if (!body.content || !body.content.trim()) {
        return sendJson(res, 400, { success: false, error: 'Conteúdo da mensagem é obrigatório.' });
      }

      try {
        const newMsg = db.addMessage({
          conversationId: convId,
          sender: body.sender || 'agent',
          senderName: body.senderName || 'Operador AtendeFlow',
          content: body.content.trim(),
          timestamp: body.timestamp,
          isInternalNote: false,
          attachment: body.attachment || null,
          status: body.status || 'delivered',
        });

        return sendJson(res, 201, { success: true, data: newMsg });
      } catch (err) {
        if (err.code === 'CONVERSATION_NOT_FOUND') {
          return sendJson(res, 404, { success: false, error: 'Conversa não encontrada.' });
        }
        throw err;
      }
    }

    // 4. POST /api/conversations/:id/notes
    const noteMatch = pathname.match(/^\/api\/conversations\/([A-Za-z0-9_-]+)\/notes$/);
    if (method === 'POST' && noteMatch) {
      const convId = noteMatch[1];
      const body = await parseBody(req);
      if (!body.content || !body.content.trim()) {
        return sendJson(res, 400, { success: false, error: 'Conteúdo da nota interna é obrigatório.' });
      }

      try {
        const newNote = db.addMessage({
          conversationId: convId,
          sender: 'agent',
          senderName: body.senderName || 'Operador AtendeFlow',
          content: body.content.trim(),
          timestamp: body.timestamp,
          isInternalNote: true,
          attachment: null,
          status: 'delivered',
        });

        return sendJson(res, 201, { success: true, data: newNote });
      } catch (err) {
        if (err.code === 'CONVERSATION_NOT_FOUND') {
          return sendJson(res, 404, { success: false, error: 'Conversa não encontrada.' });
        }
        throw err;
      }
    }

    // 5. PATCH /api/conversations/:id/status
    const statusMatch = pathname.match(/^\/api\/conversations\/([A-Za-z0-9_-]+)\/status$/);
    if (method === 'PATCH' && statusMatch) {
      const convId = statusMatch[1];
      const body = await parseBody(req);
      if (!body.status) {
        return sendJson(res, 400, { success: false, error: 'Status é obrigatório.' });
      }

      try {
        const updated = db.updateConversationStatus(convId, body.status);
        if (!updated) {
          return sendJson(res, 404, { success: false, error: 'Conversa não encontrada.' });
        }
        return sendJson(res, 200, { success: true, data: updated });
      } catch (err) {
        if (err.code === 'INVALID_STATUS') {
          return sendJson(res, 400, { success: false, error: err.message });
        }
        throw err;
      }
    }

    // 6. PATCH /api/conversations/:id/assign
    const assignMatch = pathname.match(/^\/api\/conversations\/([A-Za-z0-9_-]+)\/assign$/);
    if (method === 'PATCH' && assignMatch) {
      const convId = assignMatch[1];
      const body = await parseBody(req);
      if (!body.agentId) {
        return sendJson(res, 400, { success: false, error: 'agentId é obrigatório.' });
      }

      try {
        const updated = db.updateConversationAssignee(convId, body.agentId);
        if (!updated) {
          return sendJson(res, 404, { success: false, error: 'Conversa não encontrada.' });
        }
        return sendJson(res, 200, { success: true, data: updated });
      } catch (err) {
        if (err.code === 'AGENT_NOT_FOUND') {
          return sendJson(res, 404, { success: false, error: err.message });
        }
        throw err;
      }
    }

    // 7. POST /api/webhooks/whatsapp
    if (method === 'POST' && pathname === '/api/webhooks/whatsapp') {
      const body = await parseBody(req);
      try {
        const result = db.handleWhatsAppWebhook(body);
        return sendJson(res, 200, { success: true, result });
      } catch (err) {
        return sendJson(res, 400, { success: false, error: err.message });
      }
    }

    // 8. POST /api/webhooks/widget
    if (method === 'POST' && pathname === '/api/webhooks/widget') {
      const body = await parseBody(req);
      try {
        const result = db.handleWidgetWebhook(body);
        return sendJson(res, 201, { success: true, result });
      } catch (err) {
        return sendJson(res, 400, { success: false, error: err.message });
      }
    }

    // 9. GET /api/reports/analytics
    if (method === 'GET' && pathname === '/api/reports/analytics') {
      const metrics = db.getAnalytics();
      return sendJson(res, 200, { success: true, data: metrics });
    }

    // 10. GET & POST /api/canned-responses
    if (pathname === '/api/canned-responses') {
      if (method === 'GET') {
        const list = db.getCannedResponses();
        return sendJson(res, 200, { success: true, data: list });
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.shortcut || !body.title || !body.content || !body.category) {
          return sendJson(res, 400, { success: false, error: 'Campos shortcut, title, content e category são obrigatórios.' });
        }
        const created = db.createCannedResponse(body);
        return sendJson(res, 201, { success: true, data: created });
      }
    }

    // 11. GET /api/knowledge-articles
    if (method === 'GET' && pathname === '/api/knowledge-articles') {
      const articles = db.getKnowledgeArticles();
      return sendJson(res, 200, { success: true, data: articles });
    }

    // 12. POST /api/knowledge-articles/:id/helpful
    const articleHelpfulMatch = pathname.match(/^\/api\/knowledge-articles\/([A-Za-z0-9_-]+)\/helpful$/);
    if (method === 'POST' && articleHelpfulMatch) {
      const artId = articleHelpfulMatch[1];
      const updated = db.markArticleHelpful(artId);
      return sendJson(res, 200, { success: true, data: updated });
    }

    // 13. GET /api/contacts & PATCH /api/contacts/:id
    if (method === 'GET' && pathname === '/api/contacts') {
      const contacts = db.getContacts();
      return sendJson(res, 200, { success: true, data: contacts });
    }
    const contactPatchMatch = pathname.match(/^\/api\/contacts\/([A-Za-z0-9_-]+)$/);
    if (method === 'PATCH' && contactPatchMatch) {
      const contactId = contactPatchMatch[1];
      const body = await parseBody(req);
      const updated = db.updateContact(contactId, body);
      return sendJson(res, 200, { success: true, data: updated });
    }

    // 14. GET /api/agents & PATCH /api/agents/:id/status
    if (method === 'GET' && pathname === '/api/agents') {
      const agents = db.getAgents();
      return sendJson(res, 200, { success: true, data: agents });
    }
    const agentStatusMatch = pathname.match(/^\/api\/agents\/([A-Za-z0-9_-]+)\/status$/);
    if (method === 'PATCH' && agentStatusMatch) {
      const agentId = agentStatusMatch[1];
      const body = await parseBody(req);
      if (!body.status) {
        return sendJson(res, 400, { success: false, error: 'Status do agente é obrigatório.' });
      }
      const updated = db.updateAgentStatus(agentId, body.status);
      return sendJson(res, 200, { success: true, data: updated });
    }

    // 15. GET /api/health
    if (pathname === '/api/health') {
      return sendJson(res, 200, { status: 'healthy', timestamp: new Date().toISOString(), database: 'SQLite relacional ativo' });
    }

    // Rota não encontrada
    return sendJson(res, 404, { success: false, error: `Endpoint não encontrado: ${method} ${pathname}` });
  } catch (error) {
    console.error('API Error:', error);
    return sendJson(res, 500, { success: false, error: error.message || 'Erro interno no servidor.' });
  }
}
