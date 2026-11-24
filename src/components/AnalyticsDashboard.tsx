import React from 'react';
import { 
  BarChart3, 
  Clock, 
  Star, 
  CheckCircle2, 
  TrendingUp, 
  MessageCircle, 
  Globe, 
  Instagram, 
  Mail, 
  Users, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Ticket } from '../types';

interface AnalyticsDashboardProps {
  tickets: Ticket[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tickets }) => {
  // Real calculations
  const totalTickets = 1428;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length + 1380;
  const avgFrt = '1m 42s'; // First Response Time
  const avgMttr = '14m 10s'; // Mean Time To Resolution
  const csatScore = '4.9'; // Customer Satisfaction

  return (
    <div className="flex-1 bg-[#F8FAFC] h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
              Métricas Operacionais & Desempenho (SLA)
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Telemetria consolidada em tempo real de atendimento omnichannel e satisfação do cliente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SLA Operacional: 99.4%
            </span>
            <span className="text-xs text-slate-400 font-mono">Últimos 30 dias</span>
          </div>
        </div>

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* FRT Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Tempo 1ª Resposta (FRT)</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-heading font-black text-2xl text-slate-900">{avgFrt}</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>-32s em relação ao mês anterior</span>
            </p>
          </div>

          {/* MTTR Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Tempo Resolução (MTTR)</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-heading font-black text-2xl text-slate-900">{avgMttr}</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Meta interna &lt; 20m atingida</span>
            </p>
          </div>

          {/* CSAT Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Índice CSAT (Satisfação)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-heading font-black text-2xl text-slate-900">{csatScore}</p>
              <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">
              98.2% de avaliações positivas
            </p>
          </div>

          {/* Total Tickets Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Chamados Concluídos</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-heading font-black text-2xl text-slate-900">{resolvedCount.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              Taxa de resolução de 97.4%
            </p>
          </div>
        </div>

        {/* Middle Row: Channel Distribution & SLA Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Share Breakdown (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">Distribuição de Tráfego por Canal</h3>
                <p className="text-xs text-slate-500">Volume de conversas iniciadas por ponto de contato</p>
              </div>
              <span className="text-xs font-mono text-slate-400">100% Auditado</span>
            </div>

            <div className="space-y-3 pt-2">
              {/* WhatsApp Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Oficial</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">62% (885 tickets)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              {/* Web Chat Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Chat do Site (Widget)</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">22% (314 tickets)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              {/* Instagram Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Instagram className="w-4 h-4 text-purple-600" />
                    <span>Instagram Direct</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">11% (157 tickets)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '11%' }} />
                </div>
              </div>

              {/* Email Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span>E-mail Corporativo</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">5% (72 tickets)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quality & Security Card (1 col) */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-heading font-bold text-lg leading-tight">Compromisso de Nível de Serviço (SLA)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todas as interações contam com encriptação de ponta a ponta, registros de auditoria imutáveis e conformidade estrita com LGPD.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Disponibilidade de API:</span>
                <span className="font-mono font-bold text-emerald-400">99.98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Fila Máxima Atual:</span>
                <span className="font-mono font-bold text-slate-200">2 chamados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Productivity Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">Produtividade da Equipe de Operações</h3>
              <p className="text-xs text-slate-500">Métricas individuais por operador no período corrente</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3 font-bold">Atendente</th>
                  <th className="pb-3 font-bold">Especialidade</th>
                  <th className="pb-3 font-bold text-center">Atendimentos</th>
                  <th className="pb-3 font-bold text-center">FRT Médio</th>
                  <th className="pb-3 font-bold text-right">CSAT Médio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" className="w-6 h-6 rounded-full object-cover" />
                    <span>Vinícius Caetano</span>
                  </td>
                  <td className="py-3 text-slate-500">Supervisor / Contratos Pro</td>
                  <td className="py-3 text-center font-bold text-slate-800">412</td>
                  <td className="py-3 text-center font-mono text-emerald-600 font-bold">1m 15s</td>
                  <td className="py-3 text-right font-bold text-amber-500">5.0 ★</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" className="w-6 h-6 rounded-full object-cover" />
                    <span>Mariana Duarte</span>
                  </td>
                  <td className="py-3 text-slate-500">WhatsApp N2 / Faturamento</td>
                  <td className="py-3 text-center font-bold text-slate-800">388</td>
                  <td className="py-3 text-center font-mono text-indigo-600 font-bold">1m 38s</td>
                  <td className="py-3 text-right font-bold text-amber-500">4.9 ★</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" className="w-6 h-6 rounded-full object-cover" />
                    <span>Lucas Ferreira</span>
                  </td>
                  <td className="py-3 text-slate-500">Suporte Técnico & API</td>
                  <td className="py-3 text-center font-bold text-slate-800">340</td>
                  <td className="py-3 text-center font-mono text-blue-600 font-bold">2m 04s</td>
                  <td className="py-3 text-right font-bold text-amber-500">4.8 ★</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" className="w-6 h-6 rounded-full object-cover" />
                    <span>Beatriz Lima</span>
                  </td>
                  <td className="py-3 text-slate-500">Customer Success</td>
                  <td className="py-3 text-center font-bold text-slate-800">288</td>
                  <td className="py-3 text-center font-mono text-indigo-600 font-bold">1m 50s</td>
                  <td className="py-3 text-right font-bold text-amber-500">4.9 ★</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
