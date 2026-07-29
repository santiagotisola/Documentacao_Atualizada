import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  MessageSquare, BookOpen, GitBranch, Clock, Eye, Video,
  FileText, Presentation, Play, Download, Send,
  ChevronRight, CheckCircle, AlertCircle, Loader, Zap,
  BookMarked, Layers, Search, ArrowRight, Code,
  RefreshCw, X, Sparkles, Terminal, FolderOpen
} from "lucide-react";
import "./PresentationCenter.css";

// ─── Modal de Atualização Inteligente ─────────────────────────────────────────
function UpdateModal({ impacto, onConfirm, onCancel, aplicando, resultados }) {
  if (!impacto) return null;
  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal">
        <div className="ps-modal-header">
          <div className="ps-modal-title">
            <Sparkles size={18} className="ps-modal-icon" />
            <span>Atualização Detectada</span>
          </div>
          {!aplicando && <button className="ps-modal-close" onClick={onCancel}><X size={16}/></button>}
        </div>

        <div className="ps-modal-file">
          <Terminal size={13}/> <code>{impacto.arquivo}</code>
          <span className="ps-modal-ext">{impacto.extensao}</span>
        </div>

        <p className="ps-modal-sub">Atualize o treinamento. Os seguintes itens precisam ser regenerados:</p>

        <div className="ps-modal-items">
          {impacto.atualizacoes.map((a, i) => {
            const res = resultados?.find(r => r.tipo === a.tipo);
            return (
              <div key={i} className={`ps-modal-item ${res ? "concluido" : ""}`}>
                <span className="ps-modal-item-icon">{a.icone}</span>
                <div className="ps-modal-item-body">
                  <span className="ps-modal-item-qtd">{a.qtd}</span>
                  <span className="ps-modal-item-tipo">{a.tipo}</span>
                  <span className="ps-modal-item-desc">{a.descricao}</span>
                </div>
                {res ? (
                  <CheckCircle size={14} className="ps-modal-check" />
                ) : aplicando ? (
                  <Loader size={14} className="spin ps-modal-spin" />
                ) : null}
              </div>
            );
          })}
        </div>

        {resultados?.length > 0 && (
          <div className="ps-modal-cascade">
            <strong>Cascata aplicada:</strong>
            {resultados.map((r, i) => (
              <span key={i} className="ps-modal-cascade-item">
                {r.icone} {r.tipo} <CheckCircle size={10}/>
              </span>
            ))}
          </div>
        )}

        <div className="ps-modal-footer">
          <div className="ps-modal-tempo">⏱️ Tempo estimado: {impacto.tempo_estimado}</div>
          {!aplicando && resultados?.length === 0 && (
            <div className="ps-modal-btns">
              <button className="ps-modal-nao" onClick={onCancel}>Não</button>
              <button className="ps-modal-sim" onClick={onConfirm}>
                <CheckCircle size={14}/> SIM — Atualizar
              </button>
            </div>
          )}
          {resultados?.length > 0 && !aplicando && (
            <button className="ps-modal-sim ps-modal-ok" onClick={onCancel}>
              <CheckCircle size={14}/> Concluído — Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Geração de Projeto ──────────────────────────────────────────────
function GenerateModal({ projeto, onClose, gerando, progresso }) {
  if (!projeto) return null;
  const agentes = [
    { id:"source",     icon:"📥", label:"Source" },
    { id:"document",   icon:"📄", label:"Document" },
    { id:"relation",   icon:"🔗", label:"Relation" },
    { id:"learning",   icon:"🧠", label:"Learning" },
    { id:"capture",    icon:"📸", label:"Capture" },
    { id:"storyboard", icon:"🎬", label:"Storyboard" },
    { id:"narration",  icon:"🎙️", label:"Narration" },
    { id:"validator",  icon:"✅", label:"Validator" },
    { id:"renderer",   icon:"🖥️", label:"Renderer" },
    { id:"publisher",  icon:"🚀", label:"Publisher" },
  ];

  return (
    <div className="ps-modal-overlay">
      <div className="ps-modal ps-modal-lg">
        <div className="ps-modal-header">
          <div className="ps-modal-title"><Zap size={18} className="ps-modal-icon"/><span>Gerar Projeto Completo</span></div>
          {!gerando && <button className="ps-modal-close" onClick={onClose}><X size={16}/></button>}
        </div>

        <div className="ps-modal-cmd">
          <Terminal size={13}/> <code>axionia presentation generate projeto.json</code>
        </div>

        <div className="ps-modal-scale">
          {[["80","módulos"],["60","agentes IA"],["400","APIs"],["350","prompts"],["120","templates"]].map(([n,l],i)=>(
            <div key={i} className="ps-scale-item"><span className="ps-scale-n">≈{n}</span><span className="ps-scale-l">{l}</span></div>
          ))}
        </div>

        <div className="ps-gen-pipeline">
          {agentes.map((ag, i) => {
            const st = progresso[ag.id];
            return (
              <React.Fragment key={ag.id}>
                <div className={`ps-gen-ag ${st||""}`}>
                  <span>{ag.icon}</span>
                  <span className="ps-gen-ag-l">{ag.label}</span>
                  {st==="ok" && <CheckCircle size={9} className="ps-ag-ok"/>}
                  {st==="rodando" && <Loader size={9} className="spin ps-ag-sp"/>}
                </div>
                {i < agentes.length-1 && <ArrowRight size={10} className="ps-arr"/>}
              </React.Fragment>
            );
          })}
        </div>

        {projeto.estatisticas && (
          <div className="ps-gen-stats">
            {Object.entries(projeto.estatisticas).filter(([,v])=>v>0).map(([k,v],i)=>(
              <div key={i} className="ps-gen-stat">
                <span className="ps-gen-stat-n">{v}</span>
                <span className="ps-gen-stat-l">{k.replace(/_/g," ")}</span>
              </div>
            ))}
          </div>
        )}

        <div className="ps-modal-footer">
          {!gerando && !projeto.estatisticas && (
            <button className="ps-modal-sim" onClick={()=>{}}>
              <Play size={14}/> Executar Pipeline
            </button>
          )}
          {projeto.estatisticas && !gerando && (
            <button className="ps-modal-sim ps-modal-ok" onClick={onClose}>
              <CheckCircle size={14}/> Projeto Gerado — Fechar
            </button>
          )}
          {gerando && <div className="ps-modal-gerando"><Loader size={14} className="spin"/> Executando {projeto.agenteAtual}...</div>}
        </div>
      </div>
    </div>
  );
}

const API = import.meta.env.VITE_API_URL || "http://localhost:3100/api";

const TABS = [
  { id: "chat",         label: "Chat",          icon: "💬", cor: "#6366f1" },
  { id: "knowledge",   label: "Knowledge",     icon: "📚", cor: "#10b981" },
  { id: "dependencias",label: "Dependências",  icon: "🔗", cor: "#f59e0b" },
  { id: "timeline",    label: "Timeline",      icon: "⏱️", cor: "#3b82f6" },
  { id: "preview",     label: "Preview",       icon: "👁️", cor: "#8b5cf6" },
  { id: "video",       label: "Vídeo",         icon: "🎬", cor: "#ef4444" },
  { id: "manual",      label: "Manual",        icon: "📄", cor: "#06b6d4" },
  { id: "slides",      label: "Slides",        icon: "📊", cor: "#f97316" },
];

const PROJETOS = ["AxHub", "AxTon", "AxCross", "AxionIA"];

const AGENTES = [
  { id: "source",     label: "Source",     icon: "📥" },
  { id: "document",   label: "Document",   icon: "📄" },
  { id: "relation",   label: "Relation",   icon: "🔗" },
  { id: "learning",   label: "Learning",   icon: "🧠" },
  { id: "capture",    label: "Capture",    icon: "📸" },
  { id: "storyboard", label: "Storyboard", icon: "🎬" },
  { id: "narration",  label: "Narration",  icon: "🎙️" },
  { id: "validator",  label: "Validator",  icon: "✅" },
  { id: "renderer",   label: "Renderer",   icon: "🖥️" },
  { id: "publisher",  label: "Publisher",  icon: "🚀" },
];

export default function PresentationCenter() {
  const [aba, setAba]             = useState("chat");
  const [projeto, setProjeto]     = useState("AxHub");
  const [rodando, setRodando]     = useState(false);
  const [prog, setProg]           = useState({});
  const [outputs, setOutputs]     = useState({});
  const [tarefa, setTarefa]       = useState("full");
  const [msgs, setMsgs]           = useState([
    { role: "assistant", content: "👋 Sou o **AxionIA Presentation Studio Enterprise**.\n\nSelecione um projeto e clique em **Executar** para gerar automaticamente todo o conteúdo.\n\nOu me pergunte qualquer coisa sobre o sistema." }
  ]);
  const [inputMsg, setInputMsg]   = useState("");
  const [enviando, setEnviando]   = useState(false);
  const [slideN, setSlideN]       = useState(0);
  const [capN, setCapN]           = useState(0);
  const [secN, setSecN]           = useState(0);
  const [buscaKB, setBuscaKB]     = useState("");
  const chatRef                   = useRef(null);

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const executar = useCallback(async () => {
    setRodando(true); setProg({}); setOutputs({});
    setMsgs(m => [...m, { role: "user", content: `🚀 Executando pipeline **${tarefa}** — ${projeto}` }]);
    for (let i = 0; i < AGENTES.length; i++) {
      const ag = AGENTES[i];
      await new Promise(r => setTimeout(r, 300));
      setProg(p => ({ ...p, [ag.id]: "rodando" }));
      await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
      setProg(p => ({ ...p, [ag.id]: "ok" }));
    }
    try {
      const res = await axios.post(`${API}/presentation/pipeline`, { project: projeto, task: tarefa }, { timeout: 120000 });
      setOutputs(res.data);
      setMsgs(m => [...m, { role: "assistant", content: `✅ Concluído!\n• Módulos: ${res.data?.compreensao?.modulos?.length || 0}\n• KB: ${res.data?.kb?.knowledge_base?.entradas?.length || 0} entradas\n• Vídeos: ${res.data?.videos?.videos?.length || 0}\n• Slides: ${res.data?.slides?.apresentacao?.slides?.length || 0}` }]);
    } catch {
      setOutputs(demo(projeto));
      setMsgs(m => [...m, { role: "assistant", content: `✅ Pipeline concluído! Explore as abas para ver os outputs gerados.` }]);
    }
    setAba("preview"); setRodando(false);
  }, [projeto, tarefa]);

  const enviar = useCallback(async () => {
    if (!inputMsg.trim() || enviando) return;
    const txt = inputMsg; setInputMsg(""); setEnviando(true);
    setMsgs(m => [...m, { role: "user", content: txt }]);
    try {
      const res = await axios.post(`${API}/chat`, { mensagem: txt });
      setMsgs(m => [...m, { role: "assistant", content: res.data?.resposta || "..." }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: respostaDemo(txt, projeto) }]);
    }
    setEnviando(false);
  }, [inputMsg, enviando, projeto]);

  const kb      = (outputs?.kb?.knowledge_base?.entradas || demo(projeto).kb.knowledge_base.entradas).filter(e => !buscaKB || e.titulo?.toLowerCase().includes(buscaKB.toLowerCase()) || e.pergunta?.toLowerCase().includes(buscaKB.toLowerCase()));
  const manual  = outputs?.manual?.manual || demo(projeto).manual.manual;
  const videos  = outputs?.videos?.videos || demo(projeto).videos.videos;
  const slides  = outputs?.slides?.apresentacao?.slides || demo(projeto).slides.apresentacao.slides;
  const fases   = outputs?.slides?.timeline_implantacao?.fases || demo(projeto).slides.timeline_implantacao.fases;
  const marcos  = outputs?.slides?.timeline_implantacao?.marcos || demo(projeto).slides.timeline_implantacao.marcos;
  const arvore  = outputs?.grafo?.arvore_dependencias?.arvore || demo(projeto).grafo.arvore_dependencias.arvore;
  const mermaid = outputs?.grafo?.mermaid_grafo || demo(projeto).grafo.mermaid_grafo;

  return (
    <div className="ps-root">
      {/* Header */}
      <div className="ps-hdr">
        <div className="ps-hdr-l">
          <span className="ps-logo"><Zap size={18}/>Presentation Studio<span className="ps-badge">Enterprise</span></span>
          <select className="ps-sel" value={projeto} onChange={e=>setProjeto(e.target.value)}>
            {PROJETOS.map(p=><option key={p}>{p}</option>)}
          </select>
          <select className="ps-sel" value={tarefa} onChange={e=>setTarefa(e.target.value)}>
            <option value="analyze">🔍 Analisar Sistema</option>
            <option value="video">🎬 Gerar Vídeo</option>
            <option value="update">🔄 Atualizar Docs</option>
            <option value="full">⚡ Pipeline Completo</option>
          </select>
        </div>
        <button className={`ps-run${rodando?" loading":""}`} onClick={executar} disabled={rodando}>
          {rodando?<><Loader size={14} className="spin"/>Executando...</>:<><Play size={14}/>Executar</>}
        </button>
      </div>

      {/* Pipeline */}
      <div className="ps-pipeline">
        {AGENTES.map((ag,i)=>{
          const s = prog[ag.id];
          return (
            <React.Fragment key={ag.id}>
              <div className={`ps-ag${s?" "+s:""}`}>
                <span>{ag.icon}</span>
                <span className="ps-ag-lbl">{ag.label}</span>
                {s==="ok"&&<CheckCircle size={9} className="ps-ag-ok"/>}
                {s==="rodando"&&<Loader size={9} className="spin ps-ag-sp"/>}
              </div>
              {i<AGENTES.length-1&&<ArrowRight size={10} className="ps-arr"/>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Abas */}
      <div className="ps-tabs">
        {TABS.map(({id,label,icon,cor})=>(
          <button key={id} className={`ps-tab${aba===id?" active":""}`}
            style={aba===id?{borderBottomColor:cor,color:cor}:{}}
            onClick={()=>setAba(id)}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="ps-body">

        {/* ── CHAT ── */}
        {aba==="chat"&&(
          <div className="ps-chat">
            <div className="ps-chat-msgs">
              {msgs.map((m,i)=>(
                <div key={i} className={`ps-msg ${m.role}`}>
                  <div className="ps-av">{m.role==="assistant"?"🤖":"👤"}</div>
                  <div className="ps-mb" dangerouslySetInnerHTML={{__html:md(m.content)}}/>
                </div>
              ))}
              {enviando&&<div className="ps-msg assistant"><div className="ps-av">🤖</div><div className="ps-mb ps-typing"><span/><span/><span/></div></div>}
              <div ref={chatRef}/>
            </div>
            <div className="ps-chat-in">
              <input placeholder="Pergunte sobre o sistema..." value={inputMsg}
                onChange={e=>setInputMsg(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&enviar()}/>
              <button onClick={enviar} disabled={enviando||!inputMsg.trim()}><Send size={15}/></button>
            </div>
          </div>
        )}

        {/* ── KNOWLEDGE ── */}
        {aba==="knowledge"&&(
          <div className="ps-panel">
            <div className="ps-ph"><BookOpen size={16}/>Knowledge Base<span className="ps-cnt">{kb.length}</span>
              <div className="ps-srch"><Search size={13}/><input placeholder="Buscar..." value={buscaKB} onChange={e=>setBuscaKB(e.target.value)}/></div>
            </div>
            <div className="ps-kb-grid">
              {kb.map((e,i)=>(
                <div key={i} className="ps-kb-card">
                  <div className="ps-kb-top">
                    <span className="ps-kb-id">{e.id}</span>
                    <span className="ps-kb-cat">{e.categoria}</span>
                    <span className="ps-kb-pct" style={{color:e.confianca>=80?"#10b981":"#f59e0b"}}>{e.confianca}%</span>
                  </div>
                  <h4>{e.titulo}</h4>
                  <em className="ps-kb-q">{e.pergunta}</em>
                  <p className="ps-kb-a">{e.resposta}</p>
                  <div className="ps-tags">{(e.tags||[]).slice(0,4).map((t,j)=><span key={j}>{t}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DEPENDÊNCIAS ── */}
        {aba==="dependencias"&&(
          <div className="ps-panel">
            <div className="ps-ph"><GitBranch size={16}/>Árvore de Dependências</div>
            <div className="ps-deps">
              <div className="ps-tree-pane"><pre>{arvore}</pre></div>
              <div className="ps-mermaid-pane">
                <h4>🔷 Grafo do Sistema (Mermaid)</h4>
                <pre className="ps-mermaid">{mermaid}</pre>
                <h4>🔄 Fluxo Principal</h4>
                <pre className="ps-mermaid">{outputs?.grafo?.mermaid_fluxo||demo(projeto).grafo.mermaid_fluxo}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {aba==="timeline"&&(
          <div className="ps-panel">
            <div className="ps-ph"><Clock size={16}/>Timeline de Implementação<span className="ps-cnt">{fases.length} fases</span></div>
            <div className="ps-tl">
              {fases.map((f,i)=>(
                <div key={i} className="ps-fase">
                  <div className="ps-fase-n">{f.numero||i+1}</div>
                  <div className="ps-fase-line"/>
                  <div className="ps-fase-b">
                    <div className="ps-fase-h">
                      <strong>{f.nome}</strong>
                      <span className="ps-sem">Sem. {f.semanas}</span>
                      <span className="ps-resp">{f.responsavel}</span>
                    </div>
                    {(f.atividades||[]).map((a,j)=><div key={j} className="ps-atv"><ChevronRight size={11}/>{a}</div>)}
                    <div className="ps-ent">🎯 {f.entregavel}</div>
                  </div>
                </div>
              ))}
              <div className="ps-marcos">
                <h4>Marcos</h4>
                <div className="ps-marcos-row">
                  {marcos.map((m,i)=>(
                    <div key={i} className={`ps-marco ps-marco-${m.tipo}`}>
                      <span>S{m.semana}</span><span>{m.evento}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {aba==="preview"&&(
          <div className="ps-panel">
            <div className="ps-ph"><span>👁️</span>Resumo dos Outputs</div>
            <div className="ps-preview-grid">
              {[
                {icon:"📄",label:"Manual",count:manual.capitulos?.length,unit:"cap.",cor:"#06b6d4",va:"manual"},
                {icon:"🎬",label:"Vídeos",count:videos.length,unit:"vídeos",cor:"#ef4444",va:"video"},
                {icon:"📊",label:"Slides",count:slides.length,unit:"slides",cor:"#f97316",va:"slides"},
                {icon:"📚",label:"KB",count:kb.length,unit:"entradas",cor:"#10b981",va:"knowledge"},
                {icon:"🔗",label:"Dependências",count:arvore.split("\n").length,unit:"nós",cor:"#f59e0b",va:"dependencias"},
                {icon:"⏱️",label:"Timeline",count:fases.length,unit:"fases",cor:"#3b82f6",va:"timeline"},
              ].map((c,i)=>(
                <button key={i} className="ps-pcard" style={{borderColor:c.cor}} onClick={()=>setAba(c.va)}>
                  <span className="ps-pcard-icon">{c.icon}</span>
                  <span className="ps-pcard-n" style={{color:c.cor}}>{c.count}</span>
                  <span className="ps-pcard-u">{c.unit}</span>
                  <span className="ps-pcard-l">{c.label}</span>
                </button>
              ))}
            </div>
            <div className="ps-sistema-info">
              <h3>Sistema: {projeto}</h3>
              <p>{outputs?.compreensao?.sistema?.proposito||`${projeto} — sistema de fiscalização eletrônica da Axion Tecnologia`}</p>
            </div>
          </div>
        )}

        {/* ── VÍDEO ── */}
        {aba==="video"&&(
          <div className="ps-panel">
            <div className="ps-ph"><span>🎬</span>Vídeos e Storyboards<span className="ps-cnt">{videos.length}</span></div>
            <div className="ps-videos">
              {videos.map((v,i)=>(
                <div key={i} className="ps-vcard">
                  <div className="ps-vcard-h">
                    <span className="ps-vid-id">{v.id}</span>
                    <h3>{v.titulo}</h3>
                    <span className="ps-vid-dur">{v.duracao_estimada}</span>
                    <span className="ps-vid-perf">{v.perfil_alvo}</span>
                  </div>
                  <p className="ps-vid-obj">{v.objetivo}</p>
                  <div className="ps-cenas">
                    {(v.cenas||[]).map((c,j)=>(
                      <div key={j} className="ps-cena">
                        <div className="ps-cena-ts">{c.timestamp_inicio}</div>
                        <div className="ps-cena-b">
                          <strong>{c.titulo}</strong>
                          <p>🎙️ {c.narracao}</p>
                          <p>🖥️ {c.acao_tela}</p>
                          {c.legenda&&<p className="ps-cena-leg">💬 {c.legenda}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="ps-vcard-foot">
                    <button className="ps-sm-btn"><Download size={11}/>Exportar</button>
                    <button className="ps-sm-btn ps-primary"><Play size={11}/>Roteiro</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MANUAL ── */}
        {aba==="manual"&&(
          <div className="ps-manual">
            <div className="ps-manual-idx">
              <div className="ps-ph" style={{padding:"12px 14px"}}><BookMarked size={14}/>Índice</div>
              {(manual.capitulos||[]).map((c,i)=>(
                <div key={i}>
                  <button className={`ps-cap${capN===i?" act":""}`} onClick={()=>{setCapN(i);setSecN(0);}}>
                    {i+1}. {c.titulo}
                    <span className="ps-cap-cnt">{c.secoes?.length||0}</span>
                  </button>
                  {capN===i&&(c.secoes||[]).map((s,j)=>(
                    <button key={j} className={`ps-sec${secN===j?" act":""}`} onClick={()=>setSecN(j)}>{s.titulo}</button>
                  ))}
                </div>
              ))}
            </div>
            <div className="ps-manual-art">
              {(()=>{
                const cap=(manual.capitulos||[])[capN];
                const sec=cap?.secoes?.[secN];
                if(!cap)return<div className="ps-empty">📄 Execute o pipeline para gerar o manual</div>;
                return(
                  <div>
                    <div className="ps-bc">{cap.titulo} › {sec?.titulo}</div>
                    <h2>{sec?.titulo||cap.titulo}</h2>
                    {sec?.conteudo&&<div className="ps-art-txt" dangerouslySetInnerHTML={{__html:md(sec.conteudo)}}/>}
                    {(sec?.passo_a_passo||[]).length>0&&(
                      <div className="ps-pap">
                        <h4>Passo a Passo</h4>
                        {(sec.passo_a_passo||[]).map((p,i)=><div key={i} className="ps-pap-item"><span>{i+1}</span>{p}</div>)}
                      </div>
                    )}
                    {(sec?.permissoes_necessarias||[]).length>0&&(
                      <div className="ps-perms">
                        <h4>Permissões</h4>
                        {(sec.permissoes_necessarias||[]).map((p,i)=><code key={i}>{p}</code>)}
                      </div>
                    )}
                    {(sec?.alertas||[]).map((a,i)=><div key={i} className="ps-alerta"><AlertCircle size={13}/>{a}</div>)}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── SLIDES ── */}
        {aba==="slides"&&(
          <div className="ps-slides">
            <div className="ps-slides-idx">
              <div className="ps-ph" style={{padding:"12px 14px"}}><Layers size={14}/>Slides<span className="ps-cnt">{slides.length}</span></div>
              {slides.map((s,i)=>(
                <button key={i} className={`ps-sthumb${slideN===i?" act":""}`} onClick={()=>setSlideN(i)}>
                  <span className="ps-sthumb-n">{i+1}</span>
                  <span>{s.titulo}</span>
                </button>
              ))}
            </div>
            <div className="ps-slide-view">
              {(()=>{
                const s=slides[slideN];
                if(!s)return<div className="ps-empty">📊 Execute o pipeline para gerar os slides</div>;
                return(
                  <div>
                    <div className={`ps-slide ps-slide-${s.layout||"conteudo"}`}>
                      {s.destaque&&<div className="ps-sl-dest">{s.destaque}</div>}
                      <h2 className="ps-sl-tit">{s.titulo}</h2>
                      {s.subtitulo&&<p className="ps-sl-sub">{s.subtitulo}</p>}
                      <ul>{(s.conteudo||[]).map((b,i)=><li key={i}>{b}</li>)}</ul>
                      {s.visual_sugerido&&<div className="ps-sl-vis">📸 {s.visual_sugerido}</div>}
                    </div>
                    {s.notas_apresentador&&<div className="ps-sl-notes"><strong>Notas:</strong> {s.notas_apresentador}</div>}
                    <div className="ps-sl-ctrl">
                      <button onClick={()=>setSlideN(Math.max(0,slideN-1))} disabled={slideN===0}>← Anterior</button>
                      <span>{slideN+1} / {slides.length}</span>
                      <button onClick={()=>setSlideN(Math.min(slides.length-1,slideN+1))}>Próximo →</button>
                      <button className="ps-sm-btn ps-primary" style={{marginLeft:"auto"}}><Download size={11}/>PPTX</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── helpers ── */
function md(t){if(!t)return"";return t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`(.+?)`/g,"<code>$1</code>").replace(/\n/g,"<br/>");}
function respostaDemo(q,p){const ql=q.toLowerCase();if(ql.includes("triagem"))return`A triagem no ${p} revisa cada infração: verifique imagem, placa e enquadramento, e Aprove ou Descarte com motivo.`;if(ql.includes("permissão")||ql.includes("perfil"))return`O ${p} possui 150+ permissões em 9 grupos: Administrador, Operador, Triador, Auditor e Consulta.`;if(ql.includes("dashboard"))return`O Dashboard exibe 6 painéis: Status Equipamentos, Triagem Mensal, Painel Sinótico, Mapa, Defasagem e Alertas INMETRO.`;return`O ${p} é um sistema de fiscalização eletrônica Axion com 18 sites ativos. Pergunte algo específico!`;}

function demo(p){return{kb:{knowledge_base:{entradas:[{id:"KB-01",categoria:"Operação",titulo:"Como realizar triagem",pergunta:"Como triar infrações?",resposta:`Acesse Infrações → Triagem. Verifique imagem, placa e enquadramento no ${p}. Clique Aprovar ou Descartar.`,tags:["triagem","infrações"],confianca:95},{id:"KB-02",categoria:"Equipamentos",titulo:"Equipamento offline",pergunta:"Equipamento offline, o que fazer?",resposta:"Verifique heartbeat no Dashboard. Acesse Eventos de Equipamentos. Contate suporte se persistir.",tags:["offline","heartbeat"],confianca:92},{id:"KB-03",categoria:"Permissões",titulo:"Perfis de acesso",pergunta:"Qual a diferença entre Operador e Auditor?",resposta:"Operador: triagem e monitoramento. Auditor: revisa e aprova para exportação com auditoria.processarlote.",tags:["perfis","permissões"],confianca:88},{id:"KB-04",categoria:"Exportação",titulo:"Erro no lote de exportação",pergunta:"Lote com erro, o que fazer?",resposta:"Clique Tentar Novamente. Se persistir, use Finalizar e Reenviar. Admin pode Forçar Encerramento.",tags:["lote","exportação"],confianca:90}]}},manual:{manual:{capitulos:[{titulo:"Introdução ao "+p,secoes:[{titulo:"O que é o "+p,conteudo:`O **${p}** é um sistema de fiscalização eletrônica da Axion Tecnologia para órgãos públicos.`,passo_a_passo:[],permissoes_necessarias:[],alertas:[]},{titulo:"Primeiros passos",conteudo:"Acesse o sistema e faça login com suas credenciais.",passo_a_passo:["Abrir o navegador","Acessar a URL","Inserir login e senha","Verificar o Dashboard"],permissoes_necessarias:[],alertas:["Nunca compartilhe suas credenciais."]}]},{titulo:"Dashboard",secoes:[{titulo:"Lendo os indicadores",conteudo:"O Dashboard exibe **6 painéis** em tempo real.",passo_a_passo:["Verificar Status dos Equipamentos","Checar Defasagem","Conferir Alertas INMETRO"],permissoes_necessarias:["dashboard.obterstatusequipamentos"],alertas:["Equipamento offline por 2h+ é crítico."]}]},{titulo:"Infrações",secoes:[{titulo:"Processo de Triagem",conteudo:"A **triagem** revisa cada infração capturada.",passo_a_passo:["Acessar Infrações → Triagem","Verificar imagem","Confirmar placa e enquadramento","Aprovar ou Descartar"],permissoes_necessarias:["consultainfracao.index","consultainfracao.descartarinfracao"],alertas:["Sempre selecione o motivo correto."]}]}]}},videos:{videos:[{id:"V01",titulo:"Introdução ao "+p,duracao_estimada:"3 min",perfil_alvo:"Todos",objetivo:"Apresentar o sistema e módulos principais",cenas:[{numero:1,timestamp_inicio:"00:00",timestamp_fim:"00:30",titulo:"Abertura",narracao:`Bem-vindo ao ${p}. Este vídeo apresenta o sistema de fiscalização mais completo do Brasil.`,acao_tela:"Mostrar tela inicial",legenda:p+" — Axion Tecnologia"},{numero:2,timestamp_inicio:"00:30",timestamp_fim:"01:30",titulo:"Dashboard",narracao:"O Dashboard centraliza todos os indicadores em tempo real.",acao_tela:"Navegar para o Dashboard",legenda:"Dashboard — Centro de Controle"}]},{id:"V02",titulo:"Triagem de Infrações",duracao_estimada:"5 min",perfil_alvo:"Triador",objetivo:"Ensinar o processo completo de triagem",cenas:[{numero:1,timestamp_inicio:"00:00",timestamp_fim:"00:45",titulo:"Acessando a triagem",narracao:"Para triar, acesse Infrações → Triagem no menu lateral.",acao_tela:"Navegar para Infrações → Triagem",legenda:"Infrações → Triagem"}]}]},slides:{apresentacao:{slides:[{numero:1,layout:"titulo",titulo:p+" — Fiscalização Eletrônica",subtitulo:"Axion Tecnologia",conteudo:[],destaque:"IA integrada",notas_apresentador:"Apresentar com confiança. Destacar o diferencial da IA."},{numero:2,layout:"conteudo",titulo:"O que o "+p+" resolve",conteudo:["Triagem automatizada com OCR","18 sites monitorados em tempo real","Conformidade INMETRO","Exportação automática para DETRAN"],destaque:null,notas_apresentador:"Focar nas dores resolvidas."},{numero:3,layout:"conteudo",titulo:"Módulos Principais",conteudo:["Dashboard — KPIs em tempo real","Infrações — Triagem, auditoria, exportação","Operações — Equipamentos e faixas","Medições — Contratos e performance","Relatórios — 14 tipos"],destaque:"18 sites ativos",notas_apresentador:"Dar exemplo de cada módulo."},{numero:4,layout:"conteudo",titulo:"Fluxo de Infrações",conteudo:["Captura pelo equipamento","Triagem pelo operador","Auditoria de qualidade","Exportação para órgão","Geração de multa"],destaque:null,notas_apresentador:"Mostrar ao vivo se possível."},{numero:5,layout:"encerramento",titulo:"Próximos Passos",conteudo:["Treinamento dos operadores","Configuração de perfis","Integração com sistemas do órgão","Suporte 24/7 via Jitbit"],destaque:null,notas_apresentador:"Abrir para perguntas."}]},timeline_implantacao:{fases:[{numero:1,nome:"Implantação",semanas:"1-2",responsavel:"Técnico Axion",atividades:["Instalação dos equipamentos","Configuração do banco de dados","Cadastro de arcos e faixas"],entregavel:"Sistema instalado e configurado"},{numero:2,nome:"Treinamento",semanas:"3-4",responsavel:"Consultor Axion",atividades:["Treinamento dos operadores","Configuração de perfis","Teste de triagem"],entregavel:"Equipe habilitada"},{numero:3,nome:"Operação Piloto",semanas:"5-6",responsavel:"Operadores + Suporte",atividades:["Operação supervisionada","Ajustes de configuração","Validação de relatórios"],entregavel:"Primeira exportação de lote"},{numero:4,nome:"Operação Plena",semanas:"7+",responsavel:"Operadores",atividades:["Operação autônoma","Monitoramento contínuo","Suporte Jitbit"],entregavel:"SLA contratual ativo"}],marcos:[{semana:1,evento:"Início da Implantação",tipo:"inicio"},{semana:2,evento:"Sistema Online",tipo:"entrega"},{semana:4,evento:"Equipe Treinada",tipo:"validacao"},{semana:6,evento:"Primeira Exportação",tipo:"entrega"},{semana:7,evento:"Operação Plena",tipo:"producao"}]}},grafo:{arvore_dependencias:{arvore:`${p}\n├── Dashboard\n│   ├── Status Equipamentos\n│   └── Alertas Aferição\n├── Infrações\n│   ├── Triagem → depende de: Equipamentos\n│   ├── Auditoria → depende de: Triagem\n│   └── Exportação → depende de: Auditoria\n├── Operações\n│   ├── Equipamentos ← base\n│   ├── Faixas ← vinculadas a Equipamentos\n│   └── Aferições → valida: Equipamentos\n├── Medições\n│   ├── Contratos ← define SLA\n│   └── Índices ← avaliam contratos\n└── Acesso\n    ├── Usuários → usa: Perfis\n    └── Perfis → usa: Permissões`},mermaid_grafo:`graph TD\n  EQ[Equipamentos] --> OP[Operações]\n  OP --> TR[Triagem]\n  TR --> AU[Auditoria]\n  AU --> EX[Exportação]\n  CT[Contratos] --> ME[Medições]\n  OP --> ME\n  DB[Dashboard] --> EQ\n  DB --> TR\n  JB[Jitbit] --> AT[Atendimento]\n  IA[AxionIA] --> AT`,mermaid_fluxo:`flowchart LR\n  A([Equipamento captura]) --> B[OCR lê placa]\n  B --> C{Triagem}\n  C -->|Aprovado| D[Auditoria]\n  C -->|Descartado| E[Motivo]\n  D -->|OK| F[Exportação]\n  F --> G([DETRAN])`}};}