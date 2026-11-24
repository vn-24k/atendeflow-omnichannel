import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Clock, 
  GitFork, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  ArrowRight, 
  MessageSquare, 
  UserCheck,
  ShieldAlert,
  Send
} from 'lucide-react';
import { AutomationRule } from '../types';

export const AutomationsManager: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      title: 'Triagem Automática de Primeiro Contato',
      description: 'Envia menu interativo com departamentos assim que um novo cliente manda mensagem no WhatsApp ou Webchat.',
      trigger: 'ticket_created',
      isActive: true,
      actionType: 'send_menu',
      config: {
        menuOptions: [
          { key: '1', label: 'Comercial & Planos', department: 'Vendas' },
          { key: '2', label: 'Suporte Técnico & Dúvidas', department: 'Suporte N2' },
          { key: '3', label: 'Financeiro & 2ª Via de Fatura', department: 'Financeiro' },
          { key: '4', label: 'Falar com Atendente Humano', department: 'Geral' },
        ]
      }
    },
    {
      id: 'rule-2',
      title: 'Resposta Automática Fora do Expediente',
      description: 'Dispara aviso de horário de atendimento se a mensagem chegar após as 18h ou aos finais de semana.',
      trigger: 'after_hours',
      isActive: true,
      actionType: 'auto_reply',
      config: {
        autoReplyText: 'Olá! Nosso horário de atendimento é de segunda a sexta, das 08h às 18h. Sua mensagem já está salva e será priorizada pela nossa equipe amanhã cedo!'
      }
    },
    {
      id: 'rule-3',
      title: 'Distribuição Balanceada (Round-Robin)',
      description: 'Distribui conversas automaticamente entre operadores com status "Disponível" para evitar sobrecarga.',
      trigger: 'ticket_created',
      isActive: true,
      actionType: 'assign_round_robin',
      config: {}
    },
    {
      id: 'rule-4',
      title: 'Alerta de SLA Estourado (Sem Resposta > 10 min)',
      description: 'Altera a prioridade do ticket para Urgente e notifica o supervisor caso o tempo de espera exceda 10 minutos.',
      trigger: 'unassigned_sla',
      isActive: false,
      actionType: 'tag_vip',
      config: {
        slaMinutes: 10
      }
    }
  ]);

  const [testInput, setTestInput] = useState('');
  const [testChat, setTestChat] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: '🤖 Olá! Bem-vindo ao AtendeFlow. Como podemos ajudar você hoje?\n\n1️⃣ Comercial & Planos\n2️⃣ Suporte Técnico\n3️⃣ Financeiro & Boletos\n4️⃣ Falar com Operador Humano' }
  ]);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleTestBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userInput = testInput.trim();
    setTestChat(prev => [...prev, { sender: 'user', text: userInput }]);
    setTestInput('');

    setTimeout(() => {
      let botReply = 'Entendi! Estamos transferindo você para a nossa equipe.';
      if (userInput === '1') {
        botReply = '💼 Perfeito! Um de nossos consultores comerciais já está assumindo o seu atendimento em instantes.';
      } else if (userInput === '2') {
        botReply = '🛠️ Excelente! Qual erro ou dificuldade técnica você está enfrentando? Pode nos mandar prints ou áudio!';
      } else if (userInput === '3') {
        botReply = '📄 Setor Financeiro acionado! Por favor, informe seu CNPJ ou CPF para localizarmos sua fatura.';
      } else if (userInput === '4') {
        botReply = '👤 Conectando com Vinícius Caetano (Supervisor de Atendimento). Aguarde um instante!';
      }

      setTestChat(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">Robô de Triagem & Automações</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              3 Ativas
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Configure menus interativos, respostas 24/7 e regras de SLA inteligentes</p>
        </div>
      </div>

      {/* Grid: Regras na Esquerda + Simulador do Bot na Direita */}
      <div className="p-6 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Regras (2 Colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-black text-sm text-slate-900 uppercase tracking-wider">Regras Operacionais</h3>
            <span className="text-xs text-slate-500 font-medium">Gatilhos automáticos configuráveis</span>
          </div>

          {rules.map(rule => (
            <div 
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all ${
                rule.isActive 
                  ? 'bg-white border-slate-200/90 shadow-xs' 
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${rule.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                      <Bot className="w-4 h-4" />
                    </span>
                    <h4 className="font-heading font-bold text-sm text-slate-900">{rule.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-8">
                    {rule.description}
                  </p>
                </div>

                {/* Switch de Ativação */}
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    rule.isActive ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  title={rule.isActive ? 'Desativar Regra' : 'Ativar Regra'}
                >
                  <span 
                    className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      rule.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`} 
                  />
                </button>
              </div>

              {/* Detalhe da Configuração (se houver menu) */}
              {rule.config.menuOptions && rule.isActive && (
                <div className="mt-4 pt-3 border-t border-slate-100 pl-8">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Opções do Menu do Cliente:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rule.config.menuOptions.map(opt => (
                      <div key={opt.key} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {opt.key}
                        </span>
                        <span className="truncate font-medium">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Simulador Interativo do Chatbot (1 Coluna) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[520px] overflow-hidden">
          <div className="p-3.5 bg-slate-900 text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xs">Simulador do Robô</h4>
              <p className="text-[10px] text-emerald-400 font-mono">fluxo ativo em tempo real</p>
            </div>
          </div>

          {/* Histórico do Teste */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50">
            {testChat.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none font-medium'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input de Teste */}
          <form onSubmit={handleTestBot} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Digite 1, 2, 3 ou sua mensagem..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
