import http from 'node:http';
import { handleApiRequest } from '../api/router.js';

// Servidor de teste em porta dedicada
const PORT = 5188;

const server = http.createServer((req, res) => {
  handleApiRequest(req, res);
});

async function runTests() {
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`[TEST SUITE] Servidor de integração rodando na porta ${PORT}`);

  async function fetchApi(path, options = {}) {
    const res = await fetch(`http://127.0.0.1:${PORT}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, data: json };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const rHealth = await fetchApi('/api/health');
    assert(rHealth.status === 200 && rHealth.data.status === 'healthy', 'GET /api/health');

    // 2. GET /api/conversations
    const rConvs = await fetchApi('/api/conversations');
    assert(rConvs.status === 200 && Array.isArray(rConvs.data.data) && rConvs.data.data.length > 0, 'GET /api/conversations');

    // 3. GET /api/conversations with filter
    const rFilter = await fetchApi('/api/conversations?channel=whatsapp');
    assert(rFilter.status === 200 && rFilter.data.data.every(c => c.channel === 'whatsapp'), 'GET /api/conversations?channel=whatsapp');

    // 4. GET /api/conversations/:id
    const rSingle = await fetchApi('/api/conversations/TCK-1042');
    assert(rSingle.status === 200 && rSingle.data.data.id === 'TCK-1042' && Array.isArray(rSingle.data.data.messages), 'GET /api/conversations/TCK-1042');
    const prevMsgCount = rSingle.data.data.messages.length;

    // 5. POST /api/conversations/:id/messages
    const rNewMsg = await fetchApi('/api/conversations/TCK-1042/messages', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Teste automatizado de mensagem pública sênior!',
        senderName: 'Vinícius Caetano',
      }),
    });
    assert(rNewMsg.status === 201 && rNewMsg.data.data.content.includes('sênior'), 'POST /api/conversations/:id/messages');

    // 6. POST /api/conversations/:id/notes
    const rNewNote = await fetchApi('/api/conversations/TCK-1042/notes', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Nota interna confidencial persistida no SQLite.',
        senderName: 'Supervisor',
      }),
    });
    assert(rNewNote.status === 201 && rNewNote.data.data.isInternalNote === true, 'POST /api/conversations/:id/notes');

    // 7. Validar persistência no SQLite
    const rVerifyPersist = await fetchApi('/api/conversations/TCK-1042');
    assert(rVerifyPersist.data.data.messages.length === prevMsgCount + 2, 'Verificação de persistência relacional SQLite');

    // 8. PATCH /api/conversations/:id/status
    const rStatus = await fetchApi('/api/conversations/TCK-1042/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'pending' }),
    });
    assert(rStatus.status === 200 && rStatus.data.data.status === 'pending', 'PATCH /api/conversations/:id/status');

    // 9. PATCH /api/conversations/:id/assign
    const rAssign = await fetchApi('/api/conversations/TCK-1042/assign', {
      method: 'PATCH',
      body: JSON.stringify({ agentId: 'agent-2' }),
    });
    assert(rAssign.status === 200 && rAssign.data.data.assignedAgent.id === 'agent-2', 'PATCH /api/conversations/:id/assign');

    // 10. POST /api/webhooks/whatsapp (WhatsApp Bridge local)
    const rWaHook = await fetchApi('/api/webhooks/whatsapp', {
      method: 'POST',
      body: JSON.stringify({
        sender: '5511999887766',
        pushName: 'Cliente Teste WhatsApp',
        text: 'Olá, preciso de suporte via WhatsApp Bridge!',
      }),
    });
    assert(rWaHook.status === 200 && rWaHook.data.result.success === true, 'POST /api/webhooks/whatsapp');

    // 11. POST /api/webhooks/widget (Widget Embeddable)
    const rWidgetHook = await fetchApi('/api/webhooks/widget', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Mariana Visitante',
        email: 'mariana.visitante@teste.com',
        message: 'Mensagem enviada do Widget Embeddable externo.',
        channel: 'webchat',
      }),
    });
    assert(rWidgetHook.status === 201 && rWidgetHook.data.result.success === true, 'POST /api/webhooks/widget');

    // 12. GET /api/reports/analytics
    const rAnalytics = await fetchApi('/api/reports/analytics');
    assert(rAnalytics.status === 200 && rAnalytics.data.data.totalTickets >= 5 && rAnalytics.data.data.channelBreakdown.whatsapp >= 1, 'GET /api/reports/analytics');

    // 13. GET /api/canned-responses
    const rCR = await fetchApi('/api/canned-responses');
    assert(rCR.status === 200 && Array.isArray(rCR.data.data) && rCR.data.data.length >= 5, 'GET /api/canned-responses');

    // 14. GET /api/knowledge-articles
    const rKA = await fetchApi('/api/knowledge-articles');
    assert(rKA.status === 200 && Array.isArray(rKA.data.data) && rKA.data.data.length >= 4, 'GET /api/knowledge-articles');

    console.log(`\n========================================`);
    console.log(`RESULTADO FINAL DOS TESTES: ${passed} passaram, ${failed} falharam.`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Erro fatal na suíte de testes:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
