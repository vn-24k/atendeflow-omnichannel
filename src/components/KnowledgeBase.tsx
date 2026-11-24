import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  ThumbsUp, 
  Clock, 
  Eye, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { KnowledgeArticle } from '../types';

interface KnowledgeBaseProps {
  articles: KnowledgeArticle[];
  onOpenWidget: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  articles,
  onOpenWidget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  const categories = ['Todas', 'Primeiros Passos', 'Faturamento & Planos', 'Integrações', 'Segurança'];

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 bg-[#F8FAFC] h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* If viewing a single article */}
        {activeArticle ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
            <button
              onClick={() => setActiveArticle(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para todos os artigos</span>
            </button>

            <div className="space-y-3 pb-6 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200/60">
                {activeArticle.category}
              </span>
              <h1 className="font-heading font-black text-2xl md:text-3xl text-slate-900 leading-tight">
                {activeArticle.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Leitura: {activeArticle.readTime}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {activeArticle.views.toLocaleString()} visualizações</span>
                <span>•</span>
                <span>Atualizado em {activeArticle.updatedAt}</span>
              </div>
            </div>

            {/* Markdown rendered body */}
            <div className="prose prose-slate max-w-none text-xs md:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap">
              {activeArticle.content}
            </div>

            {/* Helpful Feedback Box */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="font-bold text-xs text-slate-800">Este artigo tirou sua dúvida?</p>
                <p className="text-[11px] text-slate-500">{activeArticle.helpfulCount} pessoas acharam este conteúdo útil</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-xs">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Sim, ajudou</span>
                </button>
                <button 
                  onClick={onOpenWidget}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
                >
                  Falar com Atendente
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Banner */}
            <div className="text-center space-y-3 py-4">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full text-indigo-700 text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Base de Conhecimento & Central de Ajuda</span>
              </div>
              <h1 className="font-heading font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
                Como podemos te apoiar hoje?
              </h1>
              <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                Pesquise em nossos manuais oficiais, tutoriais de configuração de WhatsApp e guias de integração em tempo real.
              </p>

              {/* Big Search Bar */}
              <div className="max-w-xl mx-auto relative pt-2">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
                <input
                  type="text"
                  placeholder="Ex: Como conectar WhatsApp, criar respostas rápidas, SLA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Article Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 space-y-3 group"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                  </div>

                  <h3 className="font-heading font-bold text-sm md:text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
                    <span>Ler tutorial completo</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* Need More Help Banner */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-950/20">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-heading font-bold text-base md:text-lg">Não encontrou o que precisava?</h4>
                <p className="text-xs text-indigo-200">Nosso time de especialistas está online para te atender em tempo real.</p>
              </div>
              <button
                onClick={onOpenWidget}
                className="bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shrink-0 shadow-md"
              >
                Abrir Atendimento Agora
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
