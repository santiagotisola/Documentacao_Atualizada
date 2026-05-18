/**
 * BuscaEditaisGov.jsx — Busca e Análise Automática de Editais
 * Integra busca em gov.br + importação + análise multi-produto em uma tela
 */

import React, { useState } from "react";
import { api } from "../services/api";
import "./BuscaEditaisGov.css";

export default function BuscaEditaisGov({ embedded = false }) {
  const [etapa, setEtapa] = useState("buscar"); // buscar | resultados | importar | analisando
  const [termo, setTermo] = useState("");
  const [editaisBuscados, setEditaisBuscados] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [analises, setAnalises] = useState([]);
  const [progresso, setProgresso] = useState(0);

  // 1. Buscar editais em gov.br
  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!termo.trim()) {
      setMensagem("❌ Digite um termo de busca (ex: 90.021)");
      return;
    }

    setCarregando(true);
    setMensagem("🔍 Buscando editais...");

    try {
      const response = await api.get("/edital/buscar", {
        params: { q: termo },
      });

      if (response.data.editais.length === 0) {
        setMensagem("⚠️ Nenhum edital encontrado");
        setEditaisBuscados([]);
      } else {
        setEditaisBuscados(response.data.editais);
        setMensagem(`✅ ${response.data.editais.length} edital(is) encontrado(s)`);
        setEtapa("resultados");
      }
    } catch (erro) {
      setMensagem(`❌ Erro ao buscar: ${erro.response?.data?.erro || erro.message}`);
    } finally {
      setCarregando(false);
    }
  };

  // 2. Selecionar/desselecionar editais
  const toggleSelecao = (editalId) => {
    setSelecionados((prev) =>
      prev.includes(editalId)
        ? prev.filter((id) => id !== editalId)
        : [...prev, editalId]
    );
  };

  // 3. Importar e analisar editais selecionados
  const handleImportarEAnalisar = async () => {
    if (selecionados.length === 0) {
      setMensagem("⚠️ Selecione pelo menos um edital");
      return;
    }

    setEtapa("analisando");
    setCarregando(true);
    setProgresso(0);
    const novasAnalises = [];
    const incrementoProgresso = 100 / selecionados.length;

    for (const editalId of selecionados) {
      const edital = editaisBuscados.find((e) => e.id === editalId);

      try {
        setMensagem(`📊 Analisando: "${edital.titulo}"...`);

        // Chamar endpoint de análise rápida
        const response = await api.post("/edital/analisar-rapido", {
          numero: edital.numero,
          titulo: edital.titulo,
          conteudo: edital.descricao || edital.titulo,
          produtos: ["axhub", "axton", "axcross"],
          comConfianca: true,
          comTabelas: true,
        });

        novasAnalises.push({
          id: response.data.analiseId,
          titulo: edital.titulo,
          status: "✅ Concluída",
          resumo: response.data.resumo,
          stats: response.data.stats,
        });

        setProgresso((prev) => Math.min(prev + incrementoProgresso, 99));
      } catch (erro) {
        novasAnalises.push({
          titulo: edital.titulo,
          status: `❌ Erro: ${erro.response?.data?.erro || erro.message}`,
        });
      }
    }

    setAnalises(novasAnalises);
    setProgresso(100);
    setMensagem(`✅ Análise concluída! ${novasAnalises.length} edital(is) processado(s)`);
    setCarregando(false);
  };

  // 4. Nova busca
  const handleNovaBusca = () => {
    setEtapa("buscar");
    setTermo("");
    setEditaisBuscados([]);
    setSelecionados([]);
    setAnalises([]);
    setProgresso(0);
    setMensagem("");
  };

  return (
    <div className="busca-editais-container" style={embedded ? { padding: 0 } : {}}>
      {!embedded && (
        <div className="cabecalho">
          <h2>🏛️ Busca de Editais no Gov.br</h2>
          <p>Busque editais de licitações públicas e gere análise de conformidade automaticamente</p>
        </div>
      )}

      {/* ETAPA 1: BUSCA */}
      {etapa === "buscar" && (
        <form onSubmit={handleBuscar} className="formulario-busca">
          <div className="grupo-input">
            <input
              type="text"
              placeholder="Ex: 90.021, CONAB, DETRAN..."
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              disabled={carregando}
            />
            <button type="submit" disabled={carregando}>
              {carregando ? "🔍 Buscando..." : "🔍 Buscar"}
            </button>
          </div>
          {mensagem && <div className="mensagem">{mensagem}</div>}
        </form>
      )}

      {/* ETAPA 2: RESULTADOS */}
      {etapa === "resultados" && (
        <div className="secao-resultados">
          <div className="controles">
            <button onClick={() => setSelecionados(editaisBuscados.map((e) => e.id))} className="btn-secundario">
              ✅ Selecionar Todos
            </button>
            <button onClick={() => setSelecionados([])} className="btn-secundario">
              ❌ Desselecionar Todos
            </button>
            <button onClick={handleNovaBusca} className="btn-secundario">
              🔄 Nova Busca
            </button>
          </div>

          <div className="lista-editais">
            {editaisBuscados.map((edital) => (
              <div key={edital.id} className="card-edital">
                <input
                  type="checkbox"
                  checked={selecionados.includes(edital.id)}
                  onChange={() => toggleSelecao(edital.id)}
                />
                <div className="info-edital">
                  <h4>{edital.titulo}</h4>
                  <p className="meta">
                    <strong>Número:</strong> {edital.numero} | <strong>Órgão:</strong> {edital.orgao}
                  </p>
                  <p className="descricao">{edital.descricao}</p>
                  <p className="data">📅 {new Date(edital.data).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rodape-selecao">
            <p>{selecionados.length} edital(is) selecionado(s)</p>
            <button
              onClick={handleImportarEAnalisar}
              disabled={selecionados.length === 0 || carregando}
              className="btn-principal"
            >
              {carregando ? "⏳ Processando..." : `📊 Analisar ${selecionados.length > 0 ? selecionados.length : ""}`}
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: ANALISANDO */}
      {etapa === "analisando" && (
        <div className="secao-analisando">
          <div className="barra-progresso">
            <div className="barra-preenchida" style={{ width: `${progresso}%` }}></div>
            <span className="percentual">{Math.round(progresso)}%</span>
          </div>

          {mensagem && <div className="mensagem info">{mensagem}</div>}

          <div className="lista-resultados">
            {analises.map((analise, idx) => (
              <div key={idx} className={`resultado ${analise.status.includes("✅") ? "sucesso" : "erro"}`}>
                <h4>{analise.titulo}</h4>
                <p>{analise.status}</p>

                {analise.resumo && (
                  <div className="resumo-analise">
                    <p>
                      <strong>Status Geral:</strong> {analise.resumo.veredicto}
                    </p>
                    <p>
                      <strong>Conformidade:</strong> {analise.stats?.percentual?.toFixed(1)}%
                    </p>
                    <p>
                      <strong>Requisitos:</strong> ✅ {analise.stats?.atendidos} | ⚠️{" "}
                      {analise.stats?.parciais} | ❌ {analise.stats?.naoAtendidos}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {progresso === 100 && (
            <div className="acoes-finais">
              <button onClick={handleNovaBusca} className="btn-principal">
                🏠 Voltar ao Início
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
