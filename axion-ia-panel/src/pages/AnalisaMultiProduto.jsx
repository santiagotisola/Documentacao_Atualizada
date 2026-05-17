/**
 * AnalisaMultiProduto.jsx
 * Página para exibir análise de edital contra 3 produtos (AxHub, AxTon, AxCross)
 * Separado por tipo de requisito e com comparação visual
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import "./AnalisaMultiProduto.css";

export default function AnalisaMultiProduto() {
  const [analise, setAnalise] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [abas, setAbas] = useState("resumo");
  const [uploadando, setUploadando] = useState(false);
  const [erroUpload, setErroUpload] = useState(null);
  const [fontes, setFontes] = useState([]);
  const [carregandoFontes, setCarregandoFontes] = useState(false);
  const [fontesSelecionada, setFontesSelecionada] = useState(null);

  // Buscar editais cadastrados em Fontes de Pesquisa
  useEffect(() => {
    setCarregandoFontes(true);
    api.get("/fontes")
      .then(res => setFontes(res.data.fontes || []))
      .catch(() => setFontes([]))
      .finally(() => setCarregandoFontes(false));
  }, []);

  // Quando seleciona uma fonte, buscar conteúdo completo
  const handleSelecionarFonte = async (fonteId) => {
    setFontesSelecionada(fonteId);
    setErroUpload(null);
    try {
      const res = await api.get(`/fontes/${fonteId}`);
      const fonte = res.data;
      
      // Preencher o formulário
      const form = document.querySelector("form");
      if (form) {
        form.querySelector('input[name="titulo"]').value = fonte.titulo;
        form.querySelector('textarea[name="texto"]').value = fonte.conteudo;
      }
    } catch (err) {
      setErroUpload(`Erro ao carregar fonte: ${err.message}`);
    }
  };

  // Gerar nova análise
  const handleGerarAnalise = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tituloEdital = formData.get("titulo") || "Análise de Edital";
    const textoEdital = formData.get("texto") || "";
    const arquivo = e.currentTarget.querySelector('input[name="arquivo"]')?.files[0];

    setCarregando(true);
    setErroUpload(null);

    try {
      let texto = textoEdital;
      
      // Se tiver arquivo, fazer upload primeiro
      if (arquivo) {
        setUploadando(true);
        const upload = new FormData();
        upload.append("arquivo", arquivo);
        
        const respUpload = await api.post("/doc/upload-contexto", upload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        texto = respUpload.data.texto;
        setUploadando(false);
      }

      if (!texto || texto.length < 50) {
        setErroUpload("Texto do edital vazio ou muito curto");
        setCarregando(false);
        return;
      }

      const respAnalise = await api.post("/conformidade/multi/gerar", {
        tituloEdital,
        textoEdital: texto,
        comJustificativas: true,
      });

      setAnalise(respAnalise.data.analise);
      if (e.currentTarget) {
        e.currentTarget.reset();
      }
      setAbas("resumo");
    } catch (erro) {
      setErroUpload(`Erro: ${erro.response?.data?.erro || erro.message}`);
    } finally {
      setCarregando(false);
      setUploadando(false);
    }
  };

  if (!analise) {
    return (
      <div className="analisa-multi-container">
        <div className="formulario-analise">
          <h2>📊 Análise de Conformidade Multi-Produto</h2>
          <p>Compare seu edital/requisitos contra AxHub, AxTon e AxCross simultaneamente</p>

          {/* Seletor de Editais Cadastrados */}
          <div className="fontes-section">
            <h3>🔍 Editais Cadastrados em Fontes de Pesquisa</h3>
            {carregandoFontes ? (
              <p style={{ color: "var(--text-muted)" }}>Carregando editais...</p>
            ) : fontes.length > 0 ? (
              <div className="fontes-grid">
                {fontes.map(fonte => (
                  <button
                    key={fonte._id}
                    className={`fonte-card ${fontesSelecionada === fonte._id ? "selecionada" : ""}`}
                    onClick={() => handleSelecionarFonte(fonte._id)}
                  >
                    <div className="fonte-titulo">{fonte.titulo}</div>
                    <div className="fonte-tipo">{fonte.tipo}</div>
                    <div className="fonte-produto">{fonte.produto.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>Nenhum edital cadastrado. Use a aba "Fontes de Pesquisa" para adicionar.</p>
            )}
          </div>

          <div className="divider">OU</div>

          <form onSubmit={handleGerarAnalise}>
            <div className="form-group">
              <label>Título do Edital / TR (opcional)</label>
              <input
                type="text"
                name="titulo"
                placeholder="Ex: Pregão Eletrônico nº 032/2026 — DETRAN"
              />
            </div>

            <div className="form-group">
              <label>📎 Upload do Edital (PDF/DOCX/TXT)</label>
              <input
                type="file"
                name="arquivo"
                accept=".pdf,.docx,.txt,.doc"
                disabled={uploadando}
              />
            </div>

            <div className="form-group">
              <label>Ou cole o texto do edital aqui</label>
              <textarea
                name="texto"
                placeholder="Requisitos do edital, especificações técnicas, funcionalidades solicitadas..."
                rows={10}
              />
            </div>

            <button type="submit" disabled={carregando || uploadando}>
              {uploadando ? "⏳ Extraindo arquivo..." : carregando ? "⏳ Analisando..." : "🔍 Gerar Análise"}
            </button>

            {erroUpload && <div className="erro">{erroUpload}</div>}
          </form>
        </div>
      </div>
    );
  }

  const tipos = Object.keys(analise.comparacao || {}).sort();
  const tiposUnicos = ["TODOS", ...tipos];

  return (
    <div className="analisa-multi-container resultado">
      <div className="cabecalho-resultado">
        <h2>📊 {analise.resumo.tituloEdital}</h2>
        <p>Análise comparativa de conformidade entre 3 produtos</p>
        <button onClick={() => setAnalise(null)} className="btn-nova">
          ➕ Nova Análise
        </button>
      </div>

      {/* Abas */}
      <div className="abas">
        <button 
          className={`aba ${abas === "resumo" ? "ativa" : ""}`}
          onClick={() => setAbas("resumo")}
        >
          📋 Resumo Geral
        </button>
        <button 
          className={`aba ${abas === "tipos" ? "ativa" : ""}`}
          onClick={() => setAbas("tipos")}
        >
          🏷️ Por Tipo
        </button>
        <button 
          className={`aba ${abas === "lacunas" ? "ativa" : ""}`}
          onClick={() => setAbas("lacunas")}
        >
          ⚠️ Lacunas
        </button>
        <button 
          className={`aba ${abas === "recomendacoes" ? "ativa" : ""}`}
          onClick={() => setAbas("recomendacoes")}
        >
          💡 Recomendações
        </button>
      </div>

      {/* ABA 1: Resumo Geral */}
      {abas === "resumo" && (
        <div className="aba-conteudo">
          <h3>Resumo Geral — Conformidade dos 3 Produtos</h3>
          
          <div className="cards-produtos">
            {analise.resumo.produtosAnalisados.map((prod, idx) => (
              <div key={idx} className={`card-produto veredicto-${prod.veredicto.toLowerCase()}`}>
                <h4>{prod.nome}</h4>
                <div className="status-badge">{prod.veredicto}</div>
                <div className="atendimento">
                  <div className="percentual">{prod.atendimento}%</div>
                  <div className="barra-progresso">
                    <div className="barra-preenchida" style={{ width: `${prod.atendimento}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tabela-resumo">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Status</th>
                  <th>Atendimento</th>
                  <th>Atendidos</th>
                  <th>Parciais</th>
                  <th>Não Atendidos</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analise.resumo.resumoPorProduto).map(([chave, dados]) => (
                  <tr key={chave} className={`veredicto-${dados.veredicto.toLowerCase()}`}>
                    <td><strong>{dados.nome}</strong></td>
                    <td>{dados.veredicto}</td>
                    <td>{dados.atendimento}</td>
                    <td className="ok">✅ {dados.atendidos}</td>
                    <td className="parcial">⚠️ {dados.parciais}</td>
                    <td className="nao">❌ {dados.naoAtendidos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: Análise por Tipo */}
      {abas === "tipos" && (
        <div className="aba-conteudo">
          <h3>Análise Detalhada por Tipo de Requisito</h3>
          
          <div className="filtros">
            <label>Filtrar por Tipo:</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              {tiposUnicos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="tipos-grid">
            {tipos
              .filter(t => filtroTipo === "TODOS" || t === filtroTipo)
              .map(tipo => {
                const dados = analise.comparacao[tipo];
                if (!dados) return null;

                return (
                  <div key={tipo} className="tipo-card">
                    <h4>{dados.emoji} {dados.descricao}</h4>
                    <p className="subtitulo">{dados.totalRequisitos} requisitos</p>

                    <div className="ranking-produtos">
                      {dados.produtosRanking.map((prod, idx) => (
                        <div key={idx} className="ranking-item">
                          <div className="posicao">#{idx + 1}</div>
                          <div className="produto-info">
                            <div className="nome">{prod.produto}</div>
                            <div className="estatisticas">
                              ✅ {prod.atendidos} | ⚠️ {prod.parciais} | ❌ {prod.naoAtendidos}
                            </div>
                          </div>
                          <div className={`taxa taxa-${Math.round(prod.taxa / 25)}`}>
                            {prod.taxa}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ABA 3: Lacunas */}
      {abas === "lacunas" && (
        <div className="aba-conteudo">
          <h3>⚠️ O Que Falta — Lacunas por Produto</h3>
          
          <div className="lacunas-grid">
            {Object.entries(analise.lacunas).map(([chave, dados]) => (
              <div key={chave} className="lacuna-card">
                <h4>{dados.nome}</h4>
                <p className="descricao">{dados.descricao}</p>

                {dados.naoAtendidos.length > 0 && (
                  <div className="secao-lacuna">
                    <h5>❌ Não Atendidos ({dados.naoAtendidos.length})</h5>
                    <ul>
                      {dados.naoAtendidos.slice(0, 5).map((req, idx) => (
                        <li key={idx}>
                          <span className="tipo">[{req.tipo}]</span>
                          {req.requisito}
                        </li>
                      ))}
                    </ul>
                    {dados.naoAtendidos.length > 5 && (
                      <p className="mais">+ {dados.naoAtendidos.length - 5} mais</p>
                    )}
                  </div>
                )}

                {dados.parciais.length > 0 && (
                  <div className="secao-lacuna parcial">
                    <h5>⚠️ Parciais ({dados.parciais.length})</h5>
                    <ul>
                      {dados.parciais.slice(0, 3).map((req, idx) => (
                        <li key={idx}>
                          <span className="tipo">[{req.tipo}]</span>
                          {req.requisito}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: Recomendações */}
      {abas === "recomendacoes" && (
        <div className="aba-conteudo">
          <h3>💡 Recomendações de Melhoria</h3>
          
          <div className="recomendacoes-lista">
            {analise.recomendacoes.map((rec, idx) => (
              <div key={idx} className={`recomendacao prioridade-${rec.prioridade.toLowerCase()}`}>
                <div className="cabecalho-rec">
                  <h4>{rec.produto}</h4>
                  <span className="prioridade">{rec.prioridade}</span>
                </div>
                <p className="acao">🎯 {rec.acao}</p>
                <p className="detalhes">{rec.tipo} • {rec.quantidade} itens</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
