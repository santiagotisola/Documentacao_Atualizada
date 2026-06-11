import { useState, useRef, useEffect } from "react";
import { api } from "../services/api.js";

const SISTEMAS = [
  { value: "axhub",   label: "AxHub — Infrações / Fiscalização" },
  { value: "axton",   label: "AxTon — Pesagem Veicular" },
  { value: "axcross", label: "AxCross — Cruzamento de Placas" },
  { value: "axionia", label: "AxionIA — Interface / Debug" },
];

const PASTAS_SUGERIDAS = [
  { label: "uploads/analise/axhub",            value: "axhub" },
  { label: "uploads/analise/axton",            value: "axton" },
  { label: "uploads/analise/axcross",          value: "axcross" },
  { label: "uploads/analise/axionia",          value: "axionia" },
  { label: "AxHub/docs-portal/docs/img",       value: "AxHub/docs-portal/docs/img" },
  { label: "AxTon/docs-portal/docs/img",       value: "AxTon/docs-portal/docs/img" },
  { label: "AxCross/docs-portal/docs/img",     value: "AxCross/docs-portal/docs/img" },
];

export default function AnaliseImagens() {
  const [sistema, setSistema]         = useState("axhub");
  const [contexto, setContexto]       = useState("");
  const [salvar, setSalvar]           = useState(false);
  const [preview, setPreview]         = useState(null);
  const [arquivo, setArquivo]         = useState(null);
  const [carregando, setCarregando]   = useState(false);
  const [resultado, setResultado]     = useState(null);
  const [erro, setErro]               = useState(null);
  const [galeria, setGaleria]         = useState({});
  const [abaAtiva, setAbaAtiva]       = useState("analisar"); // "analisar" | "galeria" | "comparar" | "lote"
  const fileRef = useRef();

  // ── Estado do Lote ──────────────────────────────────────────────────────────
  const [loteJobs, setLoteJobs]             = useState([]);
  const [loteJobAtivo, setLoteJobAtivo]     = useState(null); // job sendo monitorado
  const [loteCarregando, setLoteCarregando] = useState(false);
  const [lotePasta, setLotePasta]           = useState("");
  const [loteModo, setLoteModo]             = useState("local");
  const [loteMaxImagens, setLoteMaxImagens] = useState(500);
  const [loteArquivo, setLoteArquivo]       = useState(null);
  const [lotePreview, setLotePreview]       = useState(null);
  const [loteErro, setLoteErro]             = useState(null);
  const loteFileRef = useRef();
  const pollingRef = useRef(null);

  // ── Estado do comparador ────────────────────────────────────────────────────
  const [cmpPasta, setCmpPasta]                 = useState("");
  const [cmpSistema, setCmpSistema]             = useState("axhub");
  const [cmpContexto, setCmpContexto]           = useState("");
  const [cmpCaracteristicas, setCmpCaracteristicas] = useState("");
  const [cmpMaxImagens, setCmpMaxImagens]       = useState(500);
  const [cmpModo, setCmpModo]                   = useState("local"); // "local" | "ia"
  const [cmpArquivo, setCmpArquivo]             = useState(null);
  const [cmpPreview, setCmpPreview]             = useState(null);
  const [cmpCarregando, setCmpCarregando]       = useState(false);
  const [cmpResultados, setCmpResultados]       = useState([]); // acumulativo
  const [cmpMeta, setCmpMeta]                   = useState(null); // {total, processadas, temMais, ...}
  const [cmpOffset, setCmpOffset]               = useState(0);
  const [cmpThreshold, setCmpThreshold]         = useState(0); // filtro mínimo de score
  const [cmpErro, setCmpErro]                   = useState(null);
  const [cmpListaPasta, setCmpListaPasta]        = useState(null);
  const [cmpOcupacaoMap, setCmpOcupacaoMap]             = useState({});
  const [cmpOcupacaoFiltros, setCmpOcupacaoFiltros]     = useState(new Set());
  const [cmpTipoRodaMap, setCmpTipoRodaMap]             = useState({});
  const [cmpTipoRodaFiltros, setCmpTipoRodaFiltros]     = useState(new Set());
  const [cmpCorCamisaMap, setCmpCorCamisaMap]           = useState({});
  const [cmpCorCamisaFiltros, setCmpCorCamisaFiltros]   = useState(new Set());
  const [cmpMochilaMap, setCmpMochilaMap]               = useState({});
  const [cmpMochilaFiltros, setCmpMochilaFiltros]       = useState(new Set());
  const [cmpCalcaMap, setCmpCalcaMap]                   = useState({});
  const [cmpCalcaFiltros, setCmpCalcaFiltros]           = useState(new Set());
  const [cmpPlacaMap, setCmpPlacaMap]                   = useState({}); // { nome: {placa,confianca,parcial} | "lendo" | "erro" }
  const [cmpPlacaFiltro, setCmpPlacaFiltro]             = useState("");  // texto livre para filtrar por placa
  const [cmpClassificandoPlaca, setCmpClassificandoPlaca] = useState(false);
  const [cmpFaixaFiltros, setCmpFaixaFiltros]           = useState(new Set());
  const [cmpOrdem, setCmpOrdem]                         = useState("score");
  const [cmpClassificando, setCmpClassificando]         = useState(false);
  const [cmpClassificandoRoda, setCmpClassificandoRoda] = useState(false);
  const [cmpClassificandoCamisa, setCmpClassificandoCamisa] = useState(false);
  const [cmpClassificandoMochila, setCmpClassificandoMochila] = useState(false);
  const [cmpClassificandoCalca, setCmpClassificandoCalca] = useState(false);
  const [cmpGerandoCaract, setCmpGerandoCaract]         = useState(false);
  const [cmpPresetsAberto, setCmpPresetsAberto]         = useState(false);
  const cmpFileRef = useRef();

  // ── Carrega galeria ao abrir a aba ──────────────────────────────────────────
  useEffect(() => {
    if (abaAtiva === "galeria") carregarGaleria();
  }, [abaAtiva]);

  async function carregarGaleria() {
    try {
      const { data } = await api.get("/analise-imagem/listar");
      setGaleria(data.imagens ?? {});
    } catch {
      setGaleria({});
    }
  }

  // ── Seleciona imagem ────────────────────────────────────────────────────────
  function onFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setArquivo(f);
    setResultado(null);
    setErro(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  }

  // ── Envia para análise ──────────────────────────────────────────────────────
  async function analisar(e) {
    e.preventDefault();
    if (!arquivo) { setErro("Selecione uma imagem."); return; }

    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      const form = new FormData();
      form.append("imagem", arquivo);
      form.append("sistema", sistema);
      form.append("contexto", contexto);

      const endpoint = salvar ? "/analise-imagem/salvar-e-analisar" : "/analise-imagem/analisar";
      const { data } = await api.post(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultado(data);
    } catch (err) {
      setErro(err.response?.data?.erro ?? err.message);
    } finally {
      setCarregando(false);
    }
  }

  // ── Remove imagem da galeria ────────────────────────────────────────────────
  async function remover(sis, nome) {
    if (!confirm(`Remover ${nome}?`)) return;
    try {
      await api.delete(`/analise-imagem/${sis}/${nome}`);
      carregarGaleria();
    } catch (err) {
      alert(err.response?.data?.erro ?? err.message);
    }
  }

  // ── Reutiliza imagem da galeria ─────────────────────────────────────────────
  function reanalisarDaGaleria(sis, img) {
    setSistema(sis);
    setPreview(`http://localhost:3100/uploads/analise/${sis}/${img.nome}`);
    setArquivo(null);
    setAbaAtiva("analisar");
    setResultado(null);
  }

  // ── Lote: selecionar imagem de referência ──────────────────────────────────
  function onLoteFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setLoteArquivo(f);
    setLoteErro(null);
    const reader = new FileReader();
    reader.onload = (ev) => setLotePreview(ev.target.result);
    reader.readAsDataURL(f);
  }

  // ── Lote: iniciar polling de um job ───────────────────────────────────────
  function iniciarPolling(jobId) {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}`);
        setLoteJobAtivo(data);
        if (data.status === "concluido" || data.status === "erro") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          carregarListaJobs();
        }
      } catch (_) {}
    }, 1500); // atualiza a cada 1,5s
  }

  // ── Lote: carregar lista de jobs ──────────────────────────────────────────
  async function carregarListaJobs() {
    try {
      const { data } = await api.get("/jobs");
      setLoteJobs(data.jobs ?? []);
    } catch (_) {}
  }

  // ── Lote: submeter novo job ───────────────────────────────────────────────
  async function submeterLote(e) {
    e.preventDefault();
    if (!loteArquivo) { setLoteErro("Selecione a imagem de referência."); return; }
    if (!lotePasta)   { setLoteErro("Informe o caminho da pasta."); return; }

    setLoteCarregando(true);
    setLoteErro(null);

    try {
      const form = new FormData();
      form.append("imagem", loteArquivo);
      form.append("pasta", lotePasta);
      form.append("modo", loteModo);
      form.append("maxImagens", loteMaxImagens);

      const { data } = await api.post("/jobs/comparar-pasta", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLoteJobAtivo({ _id: data.jobId, status: "pendente", processadas: 0, totalEncontradas: 0, progresso: 0 });
      iniciarPolling(data.jobId);
      carregarListaJobs();
    } catch (err) {
      setLoteErro(err.response?.data?.erro ?? err.message);
    } finally {
      setLoteCarregando(false);
    }
  }

  // ── Lote: carregar lista ao abrir aba ─────────────────────────────────────
  useEffect(() => {
    if (abaAtiva === "lote") carregarListaJobs();
    return () => {
      if (abaAtiva !== "lote" && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [abaAtiva]);

  // ── Comparador: selecionar imagem referência ────────────────────────────────
  function onCmpFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setCmpArquivo(f);
    setCmpResultados([]);
    setCmpMeta(null);
    setCmpErro(null);
    const reader = new FileReader();
    reader.onload = (ev) => setCmpPreview(ev.target.result);
    reader.readAsDataURL(f);
  }
  // ── Helper: monta URL para thumbnail (uploads locais ou caminho absoluto externo) ─────
  function imgUrl(r) {
    if (r.url) return `http://localhost:3100${r.url}`;
    if (r.caminhoAbsoluto) {
      const encoded = btoa(unescape(encodeURIComponent(r.caminhoAbsoluto)));
      return `http://localhost:3100/api/analise-imagem/imagem-externa?p=${encoded}`;
    }
    return null;
  }
  // ── Comparador: pré-visualizar conteúdo da pasta ────────────────────────────
  async function verificarPasta() {
    if (!cmpPasta) return;
    try {
      const { data } = await api.get("/analise-imagem/listar-pasta", { params: { pasta: cmpPasta } });
      setCmpListaPasta(data);
      setCmpErro(null);
    } catch (err) {
      setCmpListaPasta(null);
      setCmpErro(err.response?.data?.erro ?? err.message);
    }
  }

  // ── Comparador: executar comparação (nova ou próxima página) ────────────────
  async function executarComparacao(e, offsetOverride = 0) {
    if (e) e.preventDefault();
    if (!cmpArquivo) { setCmpErro("Selecione a imagem de referência."); return; }
    if (!cmpPasta)   { setCmpErro("Informe a pasta."); return; }

    const maxVal = Number(cmpMaxImagens) || 500;

    setCmpCarregando(true);
    setCmpErro(null);

    // Nova busca: zera resultados acumulados
    if (offsetOverride === 0) {
      setCmpResultados([]);
      setCmpMeta(null);
      setCmpOffset(0);
      setCmpOcupacaoMap({});
      setCmpOcupacaoFiltros(new Set());
      setCmpTipoRodaMap({});
      setCmpTipoRodaFiltros(new Set());
      setCmpCorCamisaMap({});
      setCmpCorCamisaFiltros(new Set());
      setCmpMochilaMap({});
      setCmpMochilaFiltros(new Set());
      setCmpCalcaMap({});
      setCmpCalcaFiltros(new Set());
      setCmpPlacaMap({});
      setCmpPlacaFiltro("");
      setCmpFaixaFiltros(new Set());
      setCmpOrdem("score");
    }

    try {
      const form = new FormData();
      form.append("imagem", cmpArquivo);
      form.append("pasta", cmpPasta);
      form.append("maxImagens", maxVal);
      form.append("offset", offsetOverride);
      form.append("caracteristicas", cmpCaracteristicas);

      if (cmpModo === "ia") {
        form.append("sistema", cmpSistema);
        form.append("contexto", cmpContexto);
      }

      const endpoint = cmpModo === "local"
        ? "/analise-imagem/comparar-pasta-local"
        : "/analise-imagem/comparar-pasta";

      const { data } = await api.post(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Acumula resultados das páginas
      setCmpResultados((prev) => offsetOverride === 0 ? data.resultados : [...prev, ...data.resultados]);
      setCmpMeta(data);
      setCmpOffset(data.proximoOffset ?? offsetOverride + maxVal);
    } catch (err) {
      setCmpErro(err.response?.data?.erro ?? err.message);
    } finally {
      setCmpCarregando(false);
    }
  }

  // ── Comparador: carregar próxima página ────────────────────────────────────
  async function carregarProximas() {
    await executarComparacao(null, cmpOffset);
  }

  // ── Comparador: gerar características automaticamente da imagem de referência ──
  async function gerarCaracteristicasAuto() {
    if (!cmpArquivo) { setCmpErro("Selecione a imagem de referência primeiro."); return; }
    setCmpGerandoCaract(true);
    setCmpErro(null);
    try {
      const form = new FormData();
      form.append("imagem", cmpArquivo);
      const { data } = await api.post("/analise-imagem/gerar-caracteristicas", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCmpCaracteristicas(data.caracteristicas ?? "");
      // Se detectou ocupação, aplica filtro automaticamente
      if (data.ocupacao === "solo" || data.ocupacao === "garupa") {
        setCmpOcupacaoFiltros(new Set([data.ocupacao]));
      }
    } catch (err) {
      const msg = err.response?.data?.erro ?? err.message ?? "";
      if (msg.includes("429") || msg.includes("quota") || msg.includes("exceeded")) {
        setCmpErro("⚠️ Cota OpenAI esgotada. Use os presets manuais → clique na seta ao lado de \"\ud83e\udd16 Auto\".");
      } else {
        setCmpErro(msg);
      }
    } finally {
      setCmpGerandoCaract(false);
    }
  }

  // ── Comparador: detectar ocupação (piloto solo vs. garupa) via GPT-4o-mini ──
  async function detectarCorCamisa() {
    const paraClassificar = cmpResultados
      .filter(r => r.caminhoAbsoluto && !cmpCorCamisaMap[r.nome]);
    if (paraClassificar.length === 0) return;
    const lote = paraClassificar.slice(0, 50);
    setCmpCorCamisaMap(prev => { const novo = { ...prev }; lote.forEach(r => { novo[r.nome] = "classificando"; }); return novo; });
    setCmpClassificandoCamisa(true);
    try {
      const { data } = await api.post("/analise-imagem/classificar-cor-camisa", {
        caminhos: lote.map(r => r.caminhoAbsoluto),
        referenciaBase64: cmpPreview ?? null,
      });
      setCmpCorCamisaMap(prev => {
        const novo = { ...prev };
        data.resultados.forEach(res => {
          const match = lote.find(r => r.caminhoAbsoluto === res.caminho);
          if (match) novo[match.nome] = res.cor_camisa;
        });
        return novo;
      });
    } catch (err) {
      setCmpErro(err.response?.data?.erro ?? err.message);
    } finally {
      setCmpClassificandoCamisa(false);
    }
  }

  async function detectarTipoRoda() {
    const paraClassificar = cmpResultados
      .filter(r => r.caminhoAbsoluto && !cmpTipoRodaMap[r.nome]);
    if (paraClassificar.length === 0) return;

    const lote = paraClassificar.slice(0, 50);

    setCmpTipoRodaMap(prev => {
      const novo = { ...prev };
      lote.forEach(r => { novo[r.nome] = "classificando"; });
      return novo;
    });
    setCmpClassificandoRoda(true);

    try {
      const { data } = await api.post("/analise-imagem/classificar-roda", {
        caminhos: lote.map(r => r.caminhoAbsoluto),
        referenciaBase64: cmpPreview ?? null,
      });
      setCmpTipoRodaMap(prev => {
        const novo = { ...prev };
        data.resultados.forEach(res => {
          const match = lote.find(r => r.caminhoAbsoluto === res.caminho);
          if (match) novo[match.nome] = res.tipo_roda;
        });
        return novo;
      });
    } catch (err) {
      setCmpErro(err.response?.data?.erro ?? err.message);
    } finally {
      setCmpClassificandoRoda(false);
    }
  }

  async function detectarOcupacao() {
    const paraClassificar = cmpResultados
      .filter(r => r.caminhoAbsoluto && (!cmpOcupacaoMap[r.nome] || cmpOcupacaoMap[r.nome] === "erro"));
    if (paraClassificar.length === 0) return;

    const lote = paraClassificar.slice(0, 50);

    setCmpOcupacaoMap(prev => {
      const novo = { ...prev };
      lote.forEach(r => { novo[r.nome] = "classificando"; });
      return novo;
    });
    setCmpClassificando(true);

    try {
      const { data } = await api.post("/analise-imagem/classificar-ocupacao", {
        caminhos: lote.map(r => r.caminhoAbsoluto),
        referenciaBase64: cmpPreview ?? null,
      });
      setCmpOcupacaoMap(prev => {
        const novo = { ...prev };
        data.resultados.forEach(res => {
          const match = lote.find(r => r.caminhoAbsoluto === res.caminho);
          if (match) novo[match.nome] = res.ocupacao;
        });
        return novo;
      });
      const erros = data.resultados.filter(r => r.erro).length;
      if (erros > 0) setCmpErro(`⚠️ ${erros} imagem(ns) não classificada(s) por erro de API (quota/rate-limit). Aguarde e tente reclassificar.`);
    } catch (err) {
      setCmpErro(err.response?.data?.erro ?? err.message);
    } finally {
      setCmpClassificando(false);
    }
  }

  async function detectarMochila() {
    const paraClassificar = cmpResultados
      .filter(r => r.caminhoAbsoluto && (!cmpMochilaMap[r.nome] || cmpMochilaMap[r.nome] === "erro"));
    if (paraClassificar.length === 0) return;
    const lote = paraClassificar.slice(0, 50);
    setCmpMochilaMap(prev => { const novo = { ...prev }; lote.forEach(r => { novo[r.nome] = "classificando"; }); return novo; });
    setCmpClassificandoMochila(true);
    try {
      const { data } = await api.post("/analise-imagem/classificar-mochila", {
        caminhos: lote.map(r => r.caminhoAbsoluto),
        referenciaBase64: cmpPreview ?? null,
      });
      setCmpMochilaMap(prev => {
        const novo = { ...prev };
        data.resultados.forEach(res => {
          const match = lote.find(r => r.caminhoAbsoluto === res.caminho);
          if (match) novo[match.nome] = res.mochila;
        });
        return novo;
      });
      const erros = data.resultados.filter(r => r.erro).length;
      if (erros > 0) setCmpErro(`⚠️ ${erros} imagem(ns) não classificada(s) por erro de API (quota/rate-limit). Aguarde e tente reclassificar.`);
    } catch (err) {
      setCmpErro(err.response?.data?.erro ?? err.message);
    } finally {
      setCmpClassificandoMochila(false);
    }
  }

  async function detectarCalca() {
    const paraClassificar = cmpResultados
      .filter(r => r.caminhoAbsoluto && (!cmpCalcaMap[r.nome] || cmpCalcaMap[r.nome] === "erro"));
    if (paraClassificar.length === 0) return;
    const lote = paraClassificar.slice(0, 50);
    setCmpCalcaMap(prev => { const novo = { ...prev }; lote.forEach(r => { novo[r.nome] = "classificando"; }); return novo; });
    setCmpClassificandoCalca(true);
    try {
      const { data } = await api.post("/analise-imagem/classificar-calca", {
        caminhos: lote.map(r => r.caminhoAbsoluto),
        referenciaBase64: cmpPreview ?? null,
      });
      setCmpCalcaMap(prev => {
        const novo = { ...prev };
        data.resultados.forEach(res => {
          const match = lote.find(r => r.caminhoAbsoluto === res.caminho);
          if (match) novo[match.nome] = res.calca;
        });
        return novo;
      });
      const erros = data.resultados.filter(r => r.erro).length;
      if (erros > 0) setCmpErro(`⚠️ ${erros} imagem(ns) não classificada(s) por erro de API. Aguarde e tente reclassificar.`);
    } catch (err) {
      setCmpErro(err.response?.data?.erro ?? err.message);
    } finally {
      setCmpClassificandoCalca(false);
    }
  }

  // ── Ler placa (GPT-4o + sharp upscale) ────────────────────────────────────
  async function detectarPlaca() {
    const paraLer = cmpResultados
      .filter(r => r.caminhoAbsoluto && (!cmpPlacaMap[r.nome] || cmpPlacaMap[r.nome] === "erro"));
    if (paraLer.length === 0) return;
    const lote = paraLer.slice(0, 30);
    setCmpPlacaMap(prev => { const novo = { ...prev }; lote.forEach(r => { novo[r.nome] = "lendo"; }); return novo; });
    setCmpClassificandoPlaca(true);
    try {
      const { data } = await api.post("/analise-imagem/ler-placa", {
        caminhos: lote.map(r => r.caminhoAbsoluto),
        aprimorar: true,
      });
      setCmpPlacaMap(prev => {
        const novo = { ...prev };
        data.resultados.forEach(res => {
          const match = lote.find(r => r.caminhoAbsoluto === res.caminho);
          if (match) novo[match.nome] = res.placa
            ? { placa: res.placa, confianca: res.confianca, parcial: res.parcial, observacoes: res.observacoes }
            : null;
        });
        return novo;
      });
      const erros = data.resultados.filter(r => r.erro).length;
      const naoEncontradas = data.resultados.filter(r => !r.erro && !r.placa).length;
      if (erros > 0) setCmpErro(`⚠️ ${erros} imagem(ns) com erro de API. ${naoEncontradas} sem placa visível.`);
    } catch (err) {
      setCmpErro(err.response?.data?.erro ?? err.message);
    } finally {
      setCmpClassificandoPlaca(false);
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "4px" }}>Análise de Imagens Operacionais</h2>
      <p style={{ color: "#888", marginBottom: "20px", fontSize: "14px" }}>
        Análise contextual via IA (gpt-4o Vision) por sistema: AxHub · AxTon · AxCross · AxionIA
      </p>

      {/* Abas */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "2px solid rgba(255,255,255,0.15)" }}>
        {["analisar", "comparar", "lote", "galeria"].map((aba) => (
          <button
            key={aba}
            onClick={() => setAbaAtiva(aba)}
            style={{
              padding: "8px 20px",
              border: "none",
              borderBottom: abaAtiva === aba ? "3px solid #2563eb" : "3px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: abaAtiva === aba ? "700" : "400",
              color: abaAtiva === aba ? "#60a5fa" : "#94a3b8",
              fontSize: "14px",
              textTransform: "capitalize",
            }}
          >
            {aba === "analisar" ? "🔍 Analisar" : aba === "comparar" ? "⚖️ Comparar Pasta" : aba === "lote" ? "📦 Lote" : "🖼️ Galeria"}
          </button>
        ))}
      </div>

      {/* ── ABA ANALISAR ── */}
      {abaAtiva === "analisar" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Formulário */}
          <form onSubmit={analisar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            <div>
              <label style={labelStyle}>Sistema</label>
              <select value={sistema} onChange={(e) => setSistema(e.target.value)} style={inputStyle}>
                {SISTEMAS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Imagem</label>
              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border: "2px dashed rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.04)",
                  color: "#9d9d9d",
                  fontSize: "13px",
                }}
              >
                {arquivo ? arquivo.name : "Clique para selecionar (JPG, PNG, WEBP — máx. 20MB)"}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                style={{ display: "none" }}
                onChange={onFileChange}
              />
            </div>

            <div>
              <label style={labelStyle}>Contexto adicional (opcional)</label>
              <textarea
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Ex: Infração registrada às 14h, equipamento DIP-0496 faixa 1..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={salvar}
                onChange={(e) => setSalvar(e.target.checked)}
              />
              Salvar imagem em <code>uploads/analise/{sistema}/</code>
            </label>

            <button
              type="submit"
              disabled={carregando || !arquivo}
              style={{
                padding: "10px 20px",
                background: carregando ? "#94a3b8" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: carregando ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {carregando ? "Analisando..." : "Analisar Imagem"}
            </button>

            {erro && (
              <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", padding: "10px", borderRadius: "6px", color: "#f87171", fontSize: "13px" }}>
                {erro}
              </div>
            )}
          </form>

          {/* Preview + Resultado */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{ width: "100%", maxHeight: "280px", objectFit: "contain", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", background: "rgba(255,255,255,0.04)" }}
              />
            )}

            {resultado && (
              <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "8px", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <strong style={{ fontSize: "13px", color: "#6ccb5f" }}>
                    {resultado.salvo ? "✅ Salvo + Analisado" : "✅ Analisado"}
                  </strong>
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    {resultado.analise?.tokens_usados ? `${resultado.analise.tokens_usados} tokens` : ""}
                  </span>
                </div>

                {resultado.salvo && resultado.arquivo && (
                  <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
                    Arquivo: <code>{resultado.arquivo.relativo}</code>
                  </p>
                )}

                <pre style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  borderRadius: "6px",
                  padding: "10px",
                  fontSize: "12px",
                  overflow: "auto",
                  maxHeight: "300px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {JSON.stringify(resultado.analise?.resultado ?? resultado.analise, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ABA COMPARAR PASTA ── */}
      {abaAtiva === "comparar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ══ PAINEL DE FILTROS (topo, horizontal) ══ */}
          <form onSubmit={(e) => executarComparacao(e, 0)}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Linha 1: modo + imagem de referência + pasta + botão */}
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>

              {/* Toggle modo */}
              <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", height: "36px", flexShrink: 0 }}>
                {[
                  { value: "local", label: "⚡ Local", desc: "aHash 16×16 — sem tokens, instantâneo" },
                  { value: "ia",    label: "🤖 GPT-4o", desc: "OpenAI Vision — lê texto e contexto, usa tokens" },
                ].map((m) => (
                  <button key={m.value} type="button" title={m.desc}
                    onClick={() => { setCmpModo(m.value); setCmpResultados([]); setCmpMeta(null); }}
                    style={{ padding: "0 14px", border: "none", cursor: "pointer", fontWeight: cmpModo === m.value ? "700" : "400", fontSize: "12px",
                      background: cmpModo === m.value ? (m.value === "local" ? "#16a34a" : "#7c3aed") : "rgba(255,255,255,0.06)",
                      color: cmpModo === m.value ? "#fff" : "#c5c5c5", transition: "all .15s", whiteSpace: "nowrap" }}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Imagem de referência */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <div onClick={() => cmpFileRef.current.click()}
                  style={{ border: "2px dashed #2563eb", borderRadius: "8px", padding: "4px 12px", cursor: "pointer",
                    background: "rgba(96,205,255,0.08)", color: "#60cdff", fontSize: "12px", height: "36px", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
                  📷 {cmpArquivo ? cmpArquivo.name.substring(0, 28) + (cmpArquivo.name.length > 28 ? "…" : "") : "Selecionar imagem de referência"}
                </div>
                <input ref={cmpFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onCmpFileChange} />
                {cmpPreview && (
                  <img src={cmpPreview} alt="ref" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px", border: "2px solid #2563eb", flexShrink: 0 }} />
                )}
              </div>

              {/* Pasta */}
              <div style={{ flex: 1, minWidth: "220px" }}>
                <input type="text" value={cmpPasta} onChange={(e) => setCmpPasta(e.target.value)}
                  placeholder="Pasta: C:\fotos  ou  axhub  ou  caminho relativo"
                  style={{ ...inputStyle, height: "36px", margin: 0, padding: "0 10px" }} />
              </div>

              {/* Botão comparar */}
              <button type="submit" disabled={cmpCarregando || !cmpArquivo}
                style={{ padding: "0 20px", height: "36px", background: cmpCarregando ? "#94a3b8" : (cmpModo === "local" ? "#16a34a" : "#7c3aed"),
                  color: "#fff", border: "none", borderRadius: "8px", cursor: cmpCarregando ? "not-allowed" : "pointer",
                  fontWeight: "700", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0 }}>
                {cmpCarregando ? "Comparando…" : cmpModo === "local" ? "⚡ Comparar" : "⚖️ Comparar com IA"}
              </button>
            </div>

            {/* Linha 2: características + threshold + por página + verificar pasta */}
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>

              {/* Características */}
              <div style={{ flex: 2, minWidth: "200px" }}>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "3px" }}>
                  🎯 Características <span style={{ color: "#94a3b8" }}>(bônus +0.5 por termo no nome do arquivo)</span>
                </label>
                <div style={{ display: "flex", gap: "6px", position: "relative" }}>
                  <input type="text" value={cmpCaracteristicas} onChange={(e) => setCmpCaracteristicas(e.target.value)}
                    placeholder="Ex: moto preta, capacete, placa ABC-1234"
                    style={{ ...inputStyle, height: "34px", margin: 0, padding: "0 10px", fontSize: "12px", flex: 1 }} />

                  {/* Botão Auto (GPT-4o) */}
                  <button type="button" onClick={gerarCaracteristicasAuto}
                    disabled={cmpGerandoCaract || !cmpArquivo}
                    title={cmpArquivo ? "Analisar imagem de referência com GPT-4o e sugerir características" : "Selecione a imagem de referência primeiro"}
                    style={{ height: "34px", padding: "0 10px", background: cmpGerandoCaract ? "#94a3b8" : "#7c3aed", color: "#fff",
                      border: "none", borderRadius: "6px", cursor: (cmpGerandoCaract || !cmpArquivo) ? "not-allowed" : "pointer",
                      fontWeight: "700", fontSize: "11px", whiteSpace: "nowrap", flexShrink: 0,
                      opacity: !cmpArquivo ? 0.4 : 1 }}>
                    {cmpGerandoCaract ? "⏳" : "🤖 Auto"}
                  </button>

                  {/* Botão Presets (sem OpenAI) */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button type="button" onClick={() => setCmpPresetsAberto(p => !p)}
                      title="Presets de características sem precisar de IA"
                      style={{ height: "34px", padding: "0 8px", background: "rgba(255,255,255,0.06)", color: "#c5c5c5",
                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", cursor: "pointer",
                        fontWeight: "700", fontSize: "12px" }}>
                      📝 Presets
                    </button>
                    {cmpPresetsAberto && (
                      <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 100, width: "300px",
                        background: "#2d2d2d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
                        boxShadow: "0 8px 24px rgba(0,0,0,.4)", padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#ffffff", marginBottom: "4px" }}>
                          📝 Selecione um preset (sem IA)
                        </div>
                        {[
                          { label: "🏍️ Moto preta — piloto solo",           v: "moto preta, capacete, piloto solo, moto naked" },
                          { label: "👥 Moto — com garupa (2 pessoas)",        v: "moto, garupa, dois ocupantes, passageiro" },
                          { label: "🏍️ Moto clara — piloto solo",           v: "moto branca, moto prata, capacete, piloto solo" },
                          { label: "👌 Moto pequena (CG/Fan/Titan)",          v: "moto cg, moto fan, moto titan, moto populares" },
                          { label: "🔴 Capacete vermelho",                       v: "capacete vermelho, moto" },
                          { label: "🛡️ Capacete escuro",                        v: "capacete preto, capacete escuro" },
                          { label: "👕 Piloto roupa escura",                     v: "roupa escura, camiseta preta, moletom" },
                          { label: "👕 Piloto roupa clara",                      v: "roupa clara, camiseta branca, camiseta cinza" },
                          { label: "🚙 Carro escuro",                            v: "carro preto, carro escuro" },
                          { label: "🚙 Carro claro / branco",                  v: "carro branco, carro prata, carro claro" },
                          { label: "🚚 Caminhão / veículo pesado",              v: "caminhao, veiculo pesado, bitruck, carreta" },
                        ].map(p => (
                          <button key={p.v} type="button"
                            onClick={() => { setCmpCaracteristicas(p.v); setCmpPresetsAberto(false); }}
                            style={{ padding: "6px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                              borderRadius: "6px", cursor: "pointer", fontSize: "11px", textAlign: "left",
                              color: "#e0e0e0", transition: "background .1s" }}
                            onMouseEnter={e => e.target.style.background = "rgba(96,205,255,0.08)"}
                            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.04)"}>
                            {p.label}
                          </button>
                        ))}
                        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "6px", fontSize: "10px", color: "#94a3b8" }}>
                          Ou edite manualmente o campo acima.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filtro threshold */}
              <div style={{ flexShrink: 0 }}>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "3px" }}>Score mín.</label>
                <input type="number" min={0} max={10} step={0.5} value={cmpThreshold}
                  onChange={(e) => setCmpThreshold(parseFloat(e.target.value) || 0)}
                  style={{ ...inputStyle, width: "64px", height: "34px", margin: 0, padding: "0 8px", textAlign: "center" }} />
              </div>

              {/* Por página */}
              <div style={{ flexShrink: 0 }}>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "3px" }}>Por página</label>
                <input type="number" min={1} max={cmpModo === "local" ? 2000 : 50} value={cmpMaxImagens}
                  onChange={(e) => { const v = parseInt(e.target.value, 10); setCmpMaxImagens(isNaN(v) || v < 1 ? 1 : v); }}
                  style={{ ...inputStyle, width: "72px", height: "34px", margin: 0, padding: "0 8px", textAlign: "center" }} />
              </div>

              {/* Verificar pasta */}
              <button type="button" onClick={verificarPasta}
                style={{ height: "34px", padding: "0 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px",
                  cursor: "pointer", fontSize: "11px", color: "#c5c5c5", flexShrink: 0 }}>
                🔎 Verificar pasta
              </button>

              {/* Info pasta */}
              {cmpListaPasta && (
                <div style={{ fontSize: "11px", color: "#6ccb5f", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
                  borderRadius: "6px", padding: "4px 10px", height: "34px", display: "flex", alignItems: "center" }}>
                  ✓ {cmpListaPasta.total} imagens encontradas
                </div>
              )}

              {/* Campos extras modo IA */}
              {cmpModo === "ia" && (
                <>
                  <div style={{ flexShrink: 0 }}>
                    <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "3px" }}>Sistema</label>
                    <select value={cmpSistema} onChange={(e) => setCmpSistema(e.target.value)}
                      style={{ ...inputStyle, height: "34px", margin: 0, padding: "0 8px", fontSize: "12px" }}>
                      {SISTEMAS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "3px" }}>Contexto (prompt)</label>
                    <input type="text" value={cmpContexto} onChange={(e) => setCmpContexto(e.target.value)}
                      placeholder="Ex: Foco em veículos de duas rodas"
                      style={{ ...inputStyle, height: "34px", margin: 0, padding: "0 10px", fontSize: "12px" }} />
                  </div>
                </>
              )}
            </div>

            {cmpErro && (
              <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", padding: "8px 12px", borderRadius: "6px", color: "#f87171", fontSize: "12px" }}>
                ⚠ {cmpErro}
              </div>
            )}
          </form>

          {/* ══ ÁREA DE RESULTADOS (largura total) ══ */}
          <div>

            {/* Loading */}
            {cmpCarregando && (
              <div style={{ padding: "40px", textAlign: "center", color: cmpModo === "local" ? "#16a34a" : "#7c3aed", fontSize: "14px" }}>
                {cmpModo === "local" ? "⚡ Calculando hashes…" : "🤖 Consultando GPT-4o Vision…"}
              </div>
            )}

            {/* ── Barra de status + imagem referência + legenda ── */}
            {cmpMeta && !cmpCarregando && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>

                {/* Thumb referência */}
                {cmpPreview && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(96,205,255,0.06)", border: "2px solid rgba(96,205,255,0.2)",
                    borderRadius: "8px", padding: "6px 10px", flexShrink: 0 }}>
                    <img src={cmpPreview} alt="ref" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "5px", border: "2px solid #2563eb" }} />
                    <div style={{ fontSize: "11px" }}>
                      <div style={{ fontWeight: "700", color: "#60cdff" }}>Referência</div>
                      <div style={{ color: "#9d9d9d" }}>{cmpArquivo?.name?.substring(0, 20)}…</div>
                    </div>
                  </div>
                )}

                {/* Contadores */}
                <div style={{ fontSize: "12px", color: "#94a3b8", flexGrow: 1 }}>
                  <strong style={{ color: "#e2e8f0" }}>{cmpResultados.filter(r => r.similaridade >= cmpThreshold).length}</strong> exibidas
                  {cmpThreshold > 0 && <span style={{ color: "#6366f1" }}> (filtro ≥ {cmpThreshold})</span>}
                  <span style={{ color: "#94a3b8" }}> · </span>
                  <span>{cmpMeta.processadas}/{cmpMeta.totalEncontradas} processadas</span>
                  {cmpMeta.temMais && <span style={{ color: "#f59e0b" }}> · {cmpMeta.totalEncontradas - cmpMeta.proximoOffset} restantes</span>}
                  {cmpMeta.criterio && (
                    <span style={{ marginLeft: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", padding: "1px 7px", borderRadius: "99px", fontSize: "10px", color: "#9d9d9d" }}>
                      {cmpMeta.criterio.algoritmo}
                    </span>
                  )}
                </div>

                {/* Legenda compacta — badges de score */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                  {[
                    { cor: "#16a34a", bg: "#dcfce7", label: "≥7 Alta" },
                    { cor: "#d97706", bg: "#fef9c3", label: "4–6 Média" },
                    { cor: "#94a3b8", bg: "#f1f5f9", label: "<4 Baixa" },
                  ].map(b => (
                    <span key={b.label} style={{ background: b.bg, color: b.cor, border: `1px solid ${b.cor}`, padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                      {b.label}
                    </span>
                  ))}
                  <details style={{ position: "relative" }}>
                    <summary style={{ listStyle: "none", cursor: "pointer", fontSize: "11px", color: "#60cdff", padding: "2px 8px",
                      border: "1px solid rgba(96,205,255,0.2)", borderRadius: "6px", background: "rgba(96,205,255,0.06)", userSelect: "none" }}>
                      📖 Legenda
                    </summary>
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 50, width: "380px",
                      background: "#2d2d2d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,.4)", padding: "14px" }}>
                      <div style={{ fontWeight: "700", fontSize: "12px", color: "#ffffff", marginBottom: "10px" }}>📖 Como interpretar os resultados</div>

                      <div style={{ fontSize: "11px", color: "#c5c5c5", marginBottom: "10px", lineHeight: "1.5" }}>
                        <strong>Score (0–10):</strong> Quanto maior, mais parecida é a imagem com a referência.<br/>
                        Calculado por <strong>Average Hash (aHash)</strong>: reduz cada imagem para 16×16 px em escala de cinza e compara bit a bit.
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                        {[
                          { faixa: "≥ 7.0", label: "Alta similaridade", cor: "#16a34a", bg: "#dcfce7", desc: "Muito parecidas — alta chance de ser o mesmo veículo ou cena." },
                          { faixa: "4–6.9", label: "Similaridade média", cor: "#d97706", bg: "#fef9c3", desc: "Semelhanças parciais — mesmo tipo, ângulo ou iluminação diferentes." },
                          { faixa: "< 4.0", label: "Baixa similaridade", cor: "#94a3b8", bg: "#f1f5f9", desc: "Imagens muito diferentes — provavelmente não é o mesmo sujeito." },
                        ].map(s => (
                          <div key={s.faixa} style={{ display: "flex", gap: "8px", alignItems: "flex-start", background: s.bg,
                            border: `1px solid ${s.cor}`, borderRadius: "6px", padding: "6px 8px" }}>
                            <span style={{ background: s.cor, color: "#fff", fontWeight: "800", fontSize: "11px", padding: "1px 6px", borderRadius: "5px", flexShrink: 0 }}>{s.faixa}</span>
                            <div>
                              <div style={{ fontWeight: "700", fontSize: "11px", color: s.cor }}>{s.label}</div>
                              <div style={{ fontSize: "10px", color: "#c5c5c5" }}>{s.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: "11px", color: "#c5c5c5", marginBottom: "8px" }}>
                        <strong>Hamming N bits:</strong> número de bits do hash que diferem. 0 = idêntica · ~20 = muito semelhante · ≥100 = diferente · 128 = aleatória.
                      </div>
                      <div style={{ fontSize: "11px", color: "#c5c5c5", marginBottom: "8px" }}>
                        <strong>#N</strong> = posição no ranking · <strong>score no canto</strong> = nota de similaridade · <strong>faixa colorida</strong> = nível de correspondência
                      </div>
                      <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "6px", padding: "8px", fontSize: "10px", color: "#fbbf24" }}>
                        💡 <strong>Dica:</strong> Câmeras de monitoramento raramente atingem score 9+ mesmo sendo o mesmo veículo — ângulo, luz e movimento alteram o hash. Use <strong>score 5–8</strong> como faixa de investigação principal.
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* ── Painel de Filtros Combinados ── */}
            {cmpResultados.length > 0 && !cmpCarregando && (() => {
              const totalSemFiltro = cmpResultados.filter(r => (r.similaridade ?? 0) >= cmpThreshold).length;
              const ocupacaoDetectada = Object.keys(cmpOcupacaoMap).length > 0;

              // ─── Calcula quantidade visível com todos os filtros ativos ──────
              let _calc = cmpResultados.filter(r => (r.similaridade ?? 0) >= cmpThreshold);
              if (cmpFaixaFiltros.size > 0) _calc = _calc.filter(r => { const s = r.similaridade ?? 0; return (cmpFaixaFiltros.has("alta") && s >= 7) || (cmpFaixaFiltros.has("media") && s >= 4 && s < 7) || (cmpFaixaFiltros.has("baixa") && s < 4); });
              if (cmpOcupacaoFiltros.size > 0 && ocupacaoDetectada) _calc = _calc.filter(r => cmpOcupacaoFiltros.has(cmpOcupacaoMap[r.nome]));
              if (cmpTipoRodaFiltros.size > 0 && Object.keys(cmpTipoRodaMap).length > 0) _calc = _calc.filter(r => cmpTipoRodaFiltros.has(cmpTipoRodaMap[r.nome]));
              if (cmpCorCamisaFiltros.size > 0 && Object.keys(cmpCorCamisaMap).length > 0) _calc = _calc.filter(r => cmpCorCamisaFiltros.has(cmpCorCamisaMap[r.nome]));
              if (cmpMochilaFiltros.size > 0 && Object.keys(cmpMochilaMap).length > 0) _calc = _calc.filter(r => cmpMochilaFiltros.has(cmpMochilaMap[r.nome]));
              if (cmpCalcaFiltros.size > 0 && Object.keys(cmpCalcaMap).length > 0) _calc = _calc.filter(r => cmpCalcaFiltros.has(cmpCalcaMap[r.nome]));
              if (cmpPlacaFiltro.trim()) {
                const termo = cmpPlacaFiltro.trim().toUpperCase();
                _calc = _calc.filter(r => {
                  const dados = cmpPlacaMap[r.nome];
                  if (!dados || dados === "lendo" || dados === "erro") return false;
                  return dados.placa && dados.placa.toUpperCase().includes(termo);
                });
              }
              const visiveisCount = _calc.length;
              const temFiltroAtivo = (cmpFaixaFiltros.size + cmpOcupacaoFiltros.size + cmpTipoRodaFiltros.size + cmpCorCamisaFiltros.size + cmpMochilaFiltros.size + cmpCalcaFiltros.size) > 0 || cmpPlacaFiltro.trim() !== "";

              function toggleSet(set, setter, val) {
                const novo = new Set(set);
                novo.has(val) ? novo.delete(val) : novo.add(val);
                setter(novo);
              }

              return (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>

                  {/* Linha 1: Faixa de similaridade */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", flexShrink: 0, minWidth: "90px" }}>🎯 Similaridade:</span>
                    {[
                      { v: "alta",   label: "Alta (≥7)",   cor: "#16a34a", bg: "#dcfce7" },
                      { v: "media",  label: "Média (4–6)", cor: "#d97706", bg: "#fef9c3" },
                      { v: "baixa",  label: "Baixa (<4)",  cor: "#94a3b8", bg: "#f1f5f9" },
                    ].map(f => {
                      const isAtivo = cmpFaixaFiltros.has(f.v);
                      const count = cmpResultados.filter(r => {
                        const s = r.similaridade ?? 0;
                        if (s < cmpThreshold) return false;
                        return f.v === "alta" ? s >= 7 : f.v === "media" ? s >= 4 && s < 7 : s < 4;
                      }).length;
                      return (
                        <button key={f.v} type="button"
                          onClick={() => toggleSet(cmpFaixaFiltros, setCmpFaixaFiltros, f.v)}
                          style={{ padding: "3px 10px", border: `2px solid ${isAtivo ? f.cor : "#e2e8f0"}`,
                            borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: isAtivo ? "700" : "400",
                            background: isAtivo ? f.bg : "#fff", color: isAtivo ? f.cor : "#64748b", transition: "all .12s" }}>
                          {isAtivo ? "✓ " : ""}{f.label} {count > 0 ? `(${count})` : ""}
                        </button>
                      );
                    })}
                    {cmpFaixaFiltros.size > 0 && (
                      <button type="button" onClick={() => setCmpFaixaFiltros(new Set())}
                        style={{ fontSize: "10px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                        limpar
                      </button>
                    )}
                    <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: temFiltroAtivo ? "700" : "400",
                      color: temFiltroAtivo ? "#2563eb" : "#94a3b8" }}>
                      {temFiltroAtivo
                        ? <>{visiveisCount} visível{visiveisCount !== 1 ? "is" : ""} <span style={{ fontWeight: "400", color: "#94a3b8" }}>de {totalSemFiltro}</span></>
                        : <>{totalSemFiltro} resultado{totalSemFiltro !== 1 ? "s" : ""} no total</>
                      }
                    </span>
                  </div>

                  {/* Linha 2: Ocupação */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", flexShrink: 0, minWidth: "90px" }}>👥 Ocupação:</span>

                    {!ocupacaoDetectada ? (
                      <span style={{ fontSize: "11px", color: "#f59e0b", fontStyle: "italic" }}>
                        ⚠️ Execute "Detectar ocupação" para habilitar este filtro
                      </span>
                    ) : (
                      <>
                        {[
                          { v: "solo",      label: "Solo (1 pessoa)",    icon: "🏍️", cor: "#2563eb", bg: "#eff6ff" },
                          { v: "garupa",    label: "Garupa (2 pessoas)", icon: "👥", cor: "#d97706", bg: "#fef3c7" },
                          { v: "indefinido",label: "Indefinido",          icon: "?",  cor: "#94a3b8", bg: "#f1f5f9" },
                        ].map(f => {
                          const isAtivo = cmpOcupacaoFiltros.has(f.v);
                          const count = Object.entries(cmpOcupacaoMap)
                            .filter(([, v]) => v === f.v)
                            .filter(([nome]) => {
                              const r = cmpResultados.find(x => x.nome === nome);
                              return r && (r.similaridade ?? 0) >= cmpThreshold;
                            }).length;
                          return (
                            <button key={f.v} type="button"
                              onClick={() => toggleSet(cmpOcupacaoFiltros, setCmpOcupacaoFiltros, f.v)}
                              style={{ padding: "3px 10px", border: `2px solid ${isAtivo ? f.cor : "#e2e8f0"}`,
                                borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: isAtivo ? "700" : "400",
                                background: isAtivo ? f.bg : "#fff", color: isAtivo ? f.cor : "#64748b",
                                transition: "all .12s" }}>
                              {isAtivo ? "✓ " : ""}{f.icon} {f.label} ({count})
                            </button>
                          );
                        })}
                        {cmpOcupacaoFiltros.size > 0 && (
                          <button type="button" onClick={() => setCmpOcupacaoFiltros(new Set())}
                            style={{ fontSize: "10px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                            limpar
                          </button>
                        )}
                      </>
                    )}

                    {/* Detectar ocupação */}
                    <div style={{ marginLeft: "auto" }}>
                      {cmpClassificando
                        ? <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: "600" }}>⏳ Classificando…</span>
                        : (
                          <button type="button" onClick={detectarOcupacao}
                            disabled={!cmpResultados.some(r => r.caminhoAbsoluto && !cmpOcupacaoMap[r.nome])}
                            style={{ padding: "3px 12px",
                              background: !ocupacaoDetectada ? "#7c3aed" : "#e2e8f0",
                              color: !ocupacaoDetectada ? "#fff" : "#64748b",
                              border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                              cursor: cmpResultados.some(r => r.caminhoAbsoluto && !cmpOcupacaoMap[r.nome]) ? "pointer" : "not-allowed",
                              opacity: cmpResultados.some(r => r.caminhoAbsoluto && !cmpOcupacaoMap[r.nome]) ? 1 : 0.4 }}>
                            🔍 {!ocupacaoDetectada ? "Detectar ocupação (IA)" : "Reclassificar"}
                          </button>
                        )
                      }
                    </div>
                  </div>

                  {/* Linha 3: Tipo de roda */}
                  {(() => {
                    const rodaDetectada = Object.keys(cmpTipoRodaMap).length > 0;
                    return (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", flexShrink: 0, minWidth: "90px" }}>🛞 Tipo de roda:</span>

                        {!rodaDetectada ? (
                          <span style={{ fontSize: "11px", color: "#f59e0b", fontStyle: "italic" }}>
                            ⚠️ Execute "Detectar tipo de roda" para habilitar este filtro
                          </span>
                        ) : (
                          <>
                            {[
                              { v: "raio",      label: "Roda de raio",      icon: "🛞", cor: "#92400e", bg: "#fef3c7" },
                              { v: "liga_leve", label: "Liga leve",          icon: "⚪", cor: "#1d4ed8", bg: "#eff6ff" },
                              { v: "indefinido",label: "Indefinido",         icon: "?",   cor: "#94a3b8", bg: "#f1f5f9" },
                            ].map(f => {
                              const isAtivo = cmpTipoRodaFiltros.has(f.v);
                              const count = Object.entries(cmpTipoRodaMap)
                                .filter(([, v]) => v === f.v)
                                .filter(([nome]) => {
                                  const r = cmpResultados.find(x => x.nome === nome);
                                  return r && (r.similaridade ?? 0) >= cmpThreshold;
                                }).length;
                              return (
                                <button key={f.v} type="button"
                                  onClick={() => toggleSet(cmpTipoRodaFiltros, setCmpTipoRodaFiltros, f.v)}
                                  style={{ padding: "3px 10px", border: `2px solid ${isAtivo ? f.cor : "#e2e8f0"}`,
                                    borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: isAtivo ? "700" : "400",
                                    background: isAtivo ? f.bg : "#fff", color: isAtivo ? f.cor : "#64748b",
                                    transition: "all .12s" }}>
                                  {isAtivo ? "✓ " : ""}{f.icon} {f.label} ({count})
                                </button>
                              );
                            })}
                            {cmpTipoRodaFiltros.size > 0 && (
                              <button type="button" onClick={() => setCmpTipoRodaFiltros(new Set())}
                                style={{ fontSize: "10px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                                limpar
                              </button>
                            )}
                          </>
                        )}

                        <div style={{ marginLeft: "auto" }}>
                          {cmpClassificandoRoda
                            ? <span style={{ fontSize: "11px", color: "#0891b2", fontWeight: "600" }}>⏳ Detectando rodas…</span>
                            : (
                              <button type="button" onClick={detectarTipoRoda}
                                disabled={!cmpResultados.some(r => r.caminhoAbsoluto && !cmpTipoRodaMap[r.nome])}
                                style={{ padding: "3px 12px",
                                  background: !rodaDetectada ? "#0891b2" : "#e2e8f0",
                                  color: !rodaDetectada ? "#fff" : "#64748b",
                                  border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                                  cursor: cmpResultados.some(r => r.caminhoAbsoluto && !cmpTipoRodaMap[r.nome]) ? "pointer" : "not-allowed",
                                  opacity: cmpResultados.some(r => r.caminhoAbsoluto && !cmpTipoRodaMap[r.nome]) ? 1 : 0.4 }}>
                                🛞 {!rodaDetectada ? "Detectar tipo de roda (IA)" : "Reclassificar rodas"}
                              </button>
                            )
                          }
                        </div>
                      </div>
                    );
                  })()}

                  {/* Linha 5: Cor da camisa */}
                  {(() => {
                    const camisaDetectada = Object.keys(cmpCorCamisaMap).length > 0;
                    const CORES = [
                      { v: "vermelha", label: "Vermelha",  hex: "#dc2626", bg: "#fee2e2" },
                      { v: "marrom",   label: "Marrom",    hex: "#92400e", bg: "#fef3c7" },
                      { v: "preta",    label: "Preta",     hex: "#1e293b", bg: "#f1f5f9" },
                      { v: "branca",   label: "Branca",    hex: "#64748b", bg: "#f8fafc" },
                      { v: "azul",     label: "Azul",      hex: "#2563eb", bg: "#eff6ff" },
                      { v: "verde",    label: "Verde",     hex: "#16a34a", bg: "#dcfce7" },
                      { v: "amarela",  label: "Amarela",   hex: "#d97706", bg: "#fef9c3" },
                      { v: "outra",    label: "Outra",     hex: "#7c3aed", bg: "#f5f3ff" },
                      { v: "indefinido",label: "?",        hex: "#94a3b8", bg: "#f1f5f9" },
                    ];
                    return (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", flexShrink: 0, minWidth: "90px" }}>👕 Cor camisa:</span>

                        {!camisaDetectada ? (
                          <span style={{ fontSize: "11px", color: "#f59e0b", fontStyle: "italic" }}>
                            ⚠️ Execute "Detectar cor da camisa" para habilitar este filtro
                          </span>
                        ) : (
                          <>
                            {CORES.map(f => {
                              const isAtivo = cmpCorCamisaFiltros.has(f.v);
                              const count = Object.entries(cmpCorCamisaMap)
                                .filter(([, v]) => v === f.v)
                                .filter(([nome]) => {
                                  const r = cmpResultados.find(x => x.nome === nome);
                                  return r && (r.similaridade ?? 0) >= cmpThreshold;
                                }).length;
                              if (!isAtivo && count === 0) return null; // oculta cores sem resultado
                              return (
                                <button key={f.v} type="button"
                                  onClick={() => toggleSet(cmpCorCamisaFiltros, setCmpCorCamisaFiltros, f.v)}
                                  style={{ padding: "3px 10px",
                                    border: `2px solid ${isAtivo ? f.hex : "#e2e8f0"}`,
                                    borderRadius: "6px", cursor: "pointer", fontSize: "11px",
                                    fontWeight: isAtivo ? "700" : "400",
                                    background: isAtivo ? f.bg : "#fff",
                                    color: isAtivo ? f.hex : "#64748b",
                                    transition: "all .12s" }}>
                                  {isAtivo ? "✓ " : ""}{f.label} ({count})
                                </button>
                              );
                            })}
                            {cmpCorCamisaFiltros.size > 0 && (
                              <button type="button" onClick={() => setCmpCorCamisaFiltros(new Set())}
                                style={{ fontSize: "10px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                                limpar
                              </button>
                            )}
                          </>
                        )}

                        <div style={{ marginLeft: "auto" }}>
                          {cmpClassificandoCamisa
                            ? <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "600" }}>⏳ Detectando cores…</span>
                            : (
                              <button type="button" onClick={detectarCorCamisa}
                                disabled={!cmpResultados.some(r => r.caminhoAbsoluto && !cmpCorCamisaMap[r.nome])}
                                style={{ padding: "3px 12px",
                                  background: !camisaDetectada ? "#dc2626" : "#e2e8f0",
                                  color: !camisaDetectada ? "#fff" : "#64748b",
                                  border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                                  cursor: cmpResultados.some(r => r.caminhoAbsoluto && !cmpCorCamisaMap[r.nome]) ? "pointer" : "not-allowed",
                                  opacity: cmpResultados.some(r => r.caminhoAbsoluto && !cmpCorCamisaMap[r.nome]) ? 1 : 0.4 }}>
                                👕 {!camisaDetectada ? "Detectar cor da camisa (IA)" : "Reclassificar"}
                              </button>
                            )
                          }
                        </div>
                      </div>
                    );
                  })()}

                  {/* Linha 6: Mochila */}
                  {(() => {
                    const mochilaDetect = Object.keys(cmpMochilaMap).length > 0;
                    return (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", flexShrink: 0, minWidth: "90px" }}>🎒 Objetos:</span>
                        {!mochilaDetect ? (
                          <span style={{ fontSize: "11px", color: "#f59e0b", fontStyle: "italic" }}>
                            ⚠️ Execute "Detectar objetos" para habilitar este filtro
                          </span>
                        ) : (
                          <>
                            {[
                              { v: "com_mochila", label: "Com objeto/volume",  cor: "#059669", bg: "#d1fae5" },
                              { v: "sem_mochila", label: "Sem objeto",         cor: "#64748b", bg: "#f1f5f9" },
                              { v: "indefinido",  label: "Indefinido",         cor: "#94a3b8", bg: "#f8fafc" },
                            ].map(f => {
                              const isAtivo = cmpMochilaFiltros.has(f.v);
                              const count = Object.entries(cmpMochilaMap)
                                .filter(([, v]) => v === f.v)
                                .filter(([nome]) => {
                                  const rr = cmpResultados.find(x => x.nome === nome);
                                  return rr && (rr.similaridade ?? 0) >= cmpThreshold;
                                }).length;
                              return (
                                <button key={f.v} type="button"
                                  onClick={() => toggleSet(cmpMochilaFiltros, setCmpMochilaFiltros, f.v)}
                                  style={{ padding: "3px 10px", border: `2px solid ${isAtivo ? f.cor : "#e2e8f0"}`,
                                    borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: isAtivo ? "700" : "400",
                                    background: isAtivo ? f.bg : "#fff", color: isAtivo ? f.cor : "#64748b", transition: "all .12s" }}>
                                  {isAtivo ? "✓ " : ""}{f.label} ({count})
                                </button>
                              );
                            })}
                            {cmpMochilaFiltros.size > 0 && (
                              <button type="button" onClick={() => setCmpMochilaFiltros(new Set())}
                                style={{ fontSize: "10px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                                limpar
                              </button>
                            )}
                          </>
                        )}
                        <div style={{ marginLeft: "auto" }}>
                          {cmpClassificandoMochila
                            ? <span style={{ fontSize: "11px", color: "#059669", fontWeight: "600" }}>⏳ Detectando objetos…</span>
                            : (
                              <button type="button" onClick={detectarMochila}
                                disabled={!cmpResultados.some(rr => rr.caminhoAbsoluto && !cmpMochilaMap[rr.nome])}
                                style={{ padding: "3px 12px",
                                  background: !mochilaDetect ? "#059669" : "#e2e8f0",
                                  color: !mochilaDetect ? "#fff" : "#64748b",
                                  border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                                  cursor: cmpResultados.some(rr => rr.caminhoAbsoluto && !cmpMochilaMap[rr.nome]) ? "pointer" : "not-allowed",
                                  opacity: cmpResultados.some(rr => rr.caminhoAbsoluto && !cmpMochilaMap[rr.nome]) ? 1 : 0.4 }}>
                                🎒 {!mochilaDetect ? "Detectar objetos (IA)" : "Reclassificar"}
                              </button>
                            )
                          }
                        </div>
                      </div>
                    );
                  })()}

                  {/* Linha 7: Calça */}
                  {(() => {
                    const calcaDetect = Object.keys(cmpCalcaMap).length > 0;
                    return (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", flexShrink: 0, minWidth: "90px" }}>👖 Calça:</span>
                        {!calcaDetect ? (
                          <span style={{ fontSize: "11px", color: "#f59e0b", fontStyle: "italic" }}>
                            ⚠️ Execute "Detectar calça" para habilitar este filtro
                          </span>
                        ) : (
                          <>
                            {[
                              { v: "escura", label: "Escura (preta/azul)",  cor: "#1e293b", bg: "#f1f5f9" },
                              { v: "clara",  label: "Clara (bege/branca)",  cor: "#7c3aed", bg: "#f5f3ff" },
                              { v: "indefinido", label: "Indefinido",        cor: "#94a3b8", bg: "#f8fafc" },
                            ].map(f => {
                              const isAtivo = cmpCalcaFiltros.has(f.v);
                              const count = Object.entries(cmpCalcaMap)
                                .filter(([, v]) => v === f.v)
                                .filter(([nome]) => {
                                  const rr = cmpResultados.find(x => x.nome === nome);
                                  return rr && (rr.similaridade ?? 0) >= cmpThreshold;
                                }).length;
                              return (
                                <button key={f.v} type="button"
                                  onClick={() => toggleSet(cmpCalcaFiltros, setCmpCalcaFiltros, f.v)}
                                  style={{ padding: "3px 10px", border: `2px solid ${isAtivo ? f.cor : "#e2e8f0"}`,
                                    borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: isAtivo ? "700" : "400",
                                    background: isAtivo ? f.bg : "#fff", color: isAtivo ? f.cor : "#64748b", transition: "all .12s" }}>
                                  {isAtivo ? "✓ " : ""}{f.label} ({count})
                                </button>
                              );
                            })}
                            {cmpCalcaFiltros.size > 0 && (
                              <button type="button" onClick={() => setCmpCalcaFiltros(new Set())}
                                style={{ fontSize: "10px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                                limpar
                              </button>
                            )}
                          </>
                        )}
                        <div style={{ marginLeft: "auto" }}>
                          {cmpClassificandoCalca
                            ? <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: "600" }}>⏳ Detectando calça…</span>
                            : (
                              <button type="button" onClick={detectarCalca}
                                disabled={!cmpResultados.some(rr => rr.caminhoAbsoluto && !cmpCalcaMap[rr.nome])}
                                style={{ padding: "3px 12px",
                                  background: !calcaDetect ? "#7c3aed" : "#e2e8f0",
                                  color: !calcaDetect ? "#fff" : "#64748b",
                                  border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                                  cursor: cmpResultados.some(rr => rr.caminhoAbsoluto && !cmpCalcaMap[rr.nome]) ? "pointer" : "not-allowed",
                                  opacity: cmpResultados.some(rr => rr.caminhoAbsoluto && !cmpCalcaMap[rr.nome]) ? 1 : 0.4 }}>
                                👖 {!calcaDetect ? "Detectar calça (IA)" : "Reclassificar"}
                              </button>
                            )
                          }
                        </div>
                      </div>
                    );
                  })()}

                  {/* Linha 8: Ordenação */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", flexShrink: 0, minWidth: "90px" }}>🔄 Ordenar por:</span>
                    {[
                      { v: "score",   label: "Score (maior primeiro)" },
                      { v: "hamming", label: "Hamming (menor primeiro)" },
                      { v: "nome",    label: "Nome (A–Z)" },
                    ].map(o => (
                      <button key={o.v} type="button" onClick={() => setCmpOrdem(o.v)}
                        style={{ padding: "3px 10px", border: `2px solid ${cmpOrdem === o.v ? "#2563eb" : "#e2e8f0"}`,
                          borderRadius: "6px", cursor: "pointer", fontSize: "11px",
                          fontWeight: cmpOrdem === o.v ? "700" : "400",
                          background: cmpOrdem === o.v ? "#eff6ff" : "#fff",
                          color: cmpOrdem === o.v ? "#1d4ed8" : "#64748b" }}>
                        {cmpOrdem === o.v ? "✓ " : ""}{o.label}
                      </button>
                    ))}
                  </div>

                  {/* Linha 9: Leitura de Placa */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", flexShrink: 0, minWidth: "90px" }}>🔢 Placa (OCR):</span>
                    <input
                      type="text"
                      value={cmpPlacaFiltro}
                      onChange={e => setCmpPlacaFiltro(e.target.value.toUpperCase())}
                      placeholder="Filtrar ex: ABC-1234 ou ABC1D"
                      style={{ padding: "3px 8px", border: "2px solid #e2e8f0", borderRadius: "6px",
                        fontSize: "11px", width: "180px", fontFamily: "monospace", letterSpacing: "1px",
                        background: cmpPlacaFiltro ? "#eff6ff" : "#fff",
                        borderColor: cmpPlacaFiltro ? "#2563eb" : "#e2e8f0" }}
                    />
                    {cmpPlacaFiltro && (
                      <button type="button" onClick={() => setCmpPlacaFiltro("")}
                        style={{ padding: "3px 8px", background: "rgba(248,113,113,0.12)", color: "#f87171",
                          border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>✕ limpar</button>
                    )}
                    <button type="button"
                      onClick={detectarPlaca}
                      disabled={cmpClassificandoPlaca || cmpResultados.length === 0}
                      style={{ padding: "3px 12px",
                        background: Object.keys(cmpPlacaMap).length === 0 ? "#0f172a" : "#334155",
                        color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                        cursor: cmpClassificandoPlaca || cmpResultados.length === 0 ? "not-allowed" : "pointer",
                        opacity: cmpClassificandoPlaca || cmpResultados.length === 0 ? 0.5 : 1 }}>
                      {cmpClassificandoPlaca ? "⏳ Lendo placas…" : Object.keys(cmpPlacaMap).length === 0 ? "🔢 Ler placas (GPT-4o)" : "🔢 Reler placas"}
                    </button>
                    {Object.keys(cmpPlacaMap).length > 0 && (() => {
                      const total = Object.keys(cmpPlacaMap).length;
                      const comPlaca = Object.values(cmpPlacaMap).filter(v => v && v !== "lendo" && v !== "erro" && v.placa).length;
                      const semPlaca = Object.values(cmpPlacaMap).filter(v => v === null).length;
                      return <span style={{ fontSize: "10px", color: "#64748b" }}>
                        {comPlaca} lida{comPlaca !== 1 ? "s" : ""} · {semPlaca} sem placa · {total - comPlaca - semPlaca} pendente{(total - comPlaca - semPlaca) !== 1 ? "s" : ""}
                      </span>;
                    })()}
                  </div>
                </div>
              );
            })()}

            {/* Grid de resultados — largura total */}
            {cmpResultados.length > 0 && (() => {
              const ocupacaoDetectada = Object.keys(cmpOcupacaoMap).length > 0;
              let visiveis = cmpResultados.filter(r => (r.similaridade ?? 0) >= cmpThreshold);

              // Filtro por faixa (multi-select)
              if (cmpFaixaFiltros.size > 0) {
                visiveis = visiveis.filter(r => {
                  const s = r.similaridade ?? 0;
                  return (cmpFaixaFiltros.has("alta")  && s >= 7)
                      || (cmpFaixaFiltros.has("media") && s >= 4 && s < 7)
                      || (cmpFaixaFiltros.has("baixa") && s < 4);
                });
              }

              // Filtro por ocupação (multi-select) — só aplica se detecção foi rodada
              if (cmpOcupacaoFiltros.size > 0 && ocupacaoDetectada) {
                visiveis = visiveis.filter(r => cmpOcupacaoFiltros.has(cmpOcupacaoMap[r.nome]));
              }

              // Filtro por tipo de roda (multi-select) — só aplica se detecção foi rodada
              const rodaDetectada = Object.keys(cmpTipoRodaMap).length > 0;
              if (cmpTipoRodaFiltros.size > 0 && rodaDetectada) {
                visiveis = visiveis.filter(r => cmpTipoRodaFiltros.has(cmpTipoRodaMap[r.nome]));
              }

              // Filtro por cor de camisa (multi-select) — só aplica se detecção foi rodada
              const camisaDetectada = Object.keys(cmpCorCamisaMap).length > 0;
              if (cmpCorCamisaFiltros.size > 0 && camisaDetectada) {
                visiveis = visiveis.filter(r => cmpCorCamisaFiltros.has(cmpCorCamisaMap[r.nome]));
              }

              // Filtro por mochila (multi-select) — só aplica se detecção foi rodada
              const mochilaDetectada = Object.keys(cmpMochilaMap).length > 0;
              if (cmpMochilaFiltros.size > 0 && mochilaDetectada) {
                visiveis = visiveis.filter(r => cmpMochilaFiltros.has(cmpMochilaMap[r.nome]));
              }

              // Filtro por calça (multi-select) — só aplica se detecção foi rodada
              const calcaDetectada = Object.keys(cmpCalcaMap).length > 0;
              if (cmpCalcaFiltros.size > 0 && calcaDetectada) {
                visiveis = visiveis.filter(r => cmpCalcaFiltros.has(cmpCalcaMap[r.nome]));
              }

              // Filtro por placa (texto livre)
              const placaDetectada = Object.keys(cmpPlacaMap).length > 0;
              if (cmpPlacaFiltro.trim() && placaDetectada) {
                const termo = cmpPlacaFiltro.trim().toUpperCase();
                visiveis = visiveis.filter(r => {
                  const dados = cmpPlacaMap[r.nome];
                  return dados && dados !== "lendo" && dados !== "erro" && dados.placa && dados.placa.toUpperCase().includes(termo);
                });
              }

              // Ordenação
              visiveis = [...visiveis].sort((a, b) => {
                if (cmpOrdem === "nome")    return a.nome.localeCompare(b.nome);
                if (cmpOrdem === "hamming") return (a.distanciaHamming ?? 999) - (b.distanciaHamming ?? 999);
                return (b.similaridade ?? 0) - (a.similaridade ?? 0); // score desc (default)
              });

              if (visiveis.length === 0) {
                const motivos = [];
                const totalScore = cmpResultados.filter(r => (r.similaridade ?? 0) >= cmpThreshold).length;
                if (totalScore === 0) motivos.push(`score < ${cmpThreshold} — reduza o "Score mín."`);
                if (cmpFaixaFiltros.size > 0 && totalScore > 0) motivos.push(`nenhuma imagem na faixa selecionada — clique "limpar" em Similaridade`);
                if (cmpOcupacaoFiltros.size > 0 && !ocupacaoDetectada) motivos.push(`ocupação não detectada ainda — clique "🔍 Detectar ocupação"`);
                if (cmpOcupacaoFiltros.size > 0 && ocupacaoDetectada) motivos.push(`nenhuma imagem com ocupação “${[...cmpOcupacaoFiltros].join(" ou ")}” — clique "limpar" em Ocupação`);
                if (cmpTipoRodaFiltros.size > 0 && !rodaDetectada) motivos.push(`tipo de roda não detectado — clique "Detectar tipo de roda"`);
                if (cmpTipoRodaFiltros.size > 0 && rodaDetectada) motivos.push(`nenhuma imagem com roda "${[...cmpTipoRodaFiltros].join(" ou ")}" — limpe o filtro Tipo de roda`);
                if (cmpCorCamisaFiltros.size > 0 && !camisaDetectada) motivos.push(`cor da camisa não detectada — clique "Detectar cor da camisa"`);
                if (cmpCorCamisaFiltros.size > 0 && camisaDetectada) motivos.push(`nenhuma imagem com camisa "${[...cmpCorCamisaFiltros].join(" ou ")}" — limpe o filtro Cor camisa`);
                if (cmpMochilaFiltros.size > 0 && !mochilaDetectada) motivos.push(`objetos não detectados — clique "Detectar objetos"`);
                if (cmpMochilaFiltros.size > 0 && mochilaDetectada) motivos.push(`nenhuma imagem com objeto "${[...cmpMochilaFiltros].join(" ou ")}" — limpe o filtro Objetos`);
                if (cmpCalcaFiltros.size > 0 && !calcaDetectada) motivos.push(`calça não detectada — clique "Detectar calça"`);
                if (cmpCalcaFiltros.size > 0 && calcaDetectada) motivos.push(`nenhuma imagem com calça "${[...cmpCalcaFiltros].join(" ou ")}" — limpe o filtro Calça`);
                if (cmpPlacaFiltro.trim() && !placaDetectada) motivos.push(`placas não lidas ainda — clique "🔢 Ler placas (GPT-4o)"`);
                if (cmpPlacaFiltro.trim() && placaDetectada) motivos.push(`nenhuma placa contendo "${cmpPlacaFiltro}" — limpe o filtro Placa`);
                return (
                  <div style={{ padding: "32px", textAlign: "center", color: "#9d9d9d", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>Nenhuma imagem visível com os filtros atuais.</div>
                    {motivos.map((m, i) => <div key={i} style={{ fontSize: "12px", color: "#f59e0b", marginTop: "4px" }}>⚠️ {m}</div>)}
                  </div>
                );
              }
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                  {visiveis.map((r, i) => {
                    const score = r.similaridade ?? 0;
                    const cor = score >= 7 ? "#16a34a" : score >= 4 ? "#d97706" : "#94a3b8";
                    const bg  = score >= 7 ? "#f0fdf4" : score >= 4 ? "#fffbeb" : "#1e293b";
                    const label = score >= 7 ? "Alta" : score >= 4 ? "Média" : "Baixa";
                    const thumb = imgUrl(r);
                    return (
                      <div key={`${r.nome}-${i}`}
                        style={{ border: `2px solid ${cor}`, borderRadius: "8px", overflow: "hidden", cursor: "pointer", background: "#1a2332" }}
                        onClick={() => thumb && window.open(thumb, "_blank")}
                        title={r.nome}>
                        {/* Thumbnail */}
                        <div style={{ position: "relative", height: "120px", background: "#334155", overflow: "hidden" }}>
                          {thumb
                            ? <img src={thumb} alt={r.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => { e.target.style.display = "none"; }} />
                            : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "10px" }}>sem preview</div>
                          }
                          {/* Ranking */}
                          <div style={{ position: "absolute", top: "4px", left: "4px", background: "rgba(0,0,0,.75)", color: "#fff",
                            fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>
                            #{i + 1}
                          </div>
                          {/* Badge ocupação */}
                          {cmpOcupacaoMap[r.nome] && cmpOcupacaoMap[r.nome] !== "indefinido" && (
                            <div style={{ position: "absolute", top: "24px", left: "4px",
                              background: cmpOcupacaoMap[r.nome] === "classificando" ? "#7c3aed"
                                : cmpOcupacaoMap[r.nome] === "solo" ? "#1d4ed8"
                                : cmpOcupacaoMap[r.nome] === "garupa" ? "#d97706"
                                : cmpOcupacaoMap[r.nome] === "erro" ? "#7f1d1d"
                                : "rgba(0,0,0,.5)",
                              color: "#fff", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>
                              {cmpOcupacaoMap[r.nome] === "classificando" ? "⏳"
                                : cmpOcupacaoMap[r.nome] === "solo" ? "🏍️ 1"
                                : cmpOcupacaoMap[r.nome] === "garupa" ? "👥 2"
                                : cmpOcupacaoMap[r.nome] === "erro" ? "⚠️"
                                : ""}
                            </div>
                          )}
                          {/* Badge roda */}
                          {cmpTipoRodaMap[r.nome] && cmpTipoRodaMap[r.nome] !== "classificando" && cmpTipoRodaMap[r.nome] !== "indefinido" && (
                            <div style={{ position: "absolute", top: "44px", left: "4px",
                              background: cmpTipoRodaMap[r.nome] === "raio" ? "#92400e" : "#1d4ed8",
                              color: "#fff", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>
                              {cmpTipoRodaMap[r.nome] === "raio" ? "🛞 raio" : "⚪ liga"}
                            </div>
                          )}
                          {cmpTipoRodaMap[r.nome] === "classificando" && (
                            <div style={{ position: "absolute", top: "44px", left: "4px",
                              background: "#0891b2", color: "#fff", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>
                              ⏳
                            </div>
                          )}
                          {/* Badge cor camisa */}
                          {(() => {
                            const cor_c = cmpCorCamisaMap[r.nome];
                            if (!cor_c || cor_c === "indefinido") return null;
                            if (cor_c === "classificando") return (
                              <div style={{ position: "absolute", top: "64px", left: "4px",
                                background: "#dc2626", color: "#fff", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>⏳</div>
                            );
                            const hexMap = { vermelha:"#dc2626", marrom:"#92400e", preta:"#1e293b", branca:"#64748b", azul:"#2563eb", verde:"#16a34a", amarela:"#d97706", outra:"#7c3aed" };
                            return (
                              <div style={{ position: "absolute", top: "64px", left: "4px",
                                background: hexMap[cor_c] ?? "#64748b",
                                color: "#fff", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>
                                👕 {cor_c}
                              </div>
                            );
                          })()}
                          {/* Badge mochila */}
                          {(() => {
                            const m = cmpMochilaMap[r.nome];
                            if (!m || m === "indefinido") return null;
                            if (m === "classificando") return (
                              <div style={{ position: "absolute", top: "84px", left: "4px",
                                background: "#059669", color: "#fff", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>⏳</div>
                            );
                            return (
                              <div style={{ position: "absolute", top: "84px", left: "4px",
                                background: m === "com_mochila" ? "#059669" : "#64748b",
                                color: "#fff", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>
                                {m === "com_mochila" ? "🎒 obj" : "sem obj"}
                              </div>
                            );
                          })()}
                          {/* Badge calça */}
                          {(() => {
                            const c = cmpCalcaMap[r.nome];
                            if (!c || c === "indefinido") return null;
                            if (c === "classificando") return (
                              <div style={{ position: "absolute", top: "104px", left: "4px",
                                background: "#7c3aed", color: "#fff", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>⏳</div>
                            );
                            return (
                              <div style={{ position: "absolute", top: "104px", left: "4px",
                                background: c === "escura" ? "#1e293b" : "#e2e8f0",
                                color: c === "escura" ? "#fff" : "#1e293b",
                                fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>
                                👖 {c}
                              </div>
                            );
                          })()}
                          {/* Badge placa */}
                          {(() => {
                            const p = cmpPlacaMap[r.nome];
                            if (!p) return null;
                            if (p === "lendo") return (
                              <div style={{ position: "absolute", top: "124px", left: "4px",
                                background: "#0f172a", color: "#94a3b8", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>🔢⏳</div>
                            );
                            if (p === "erro") return (
                              <div style={{ position: "absolute", top: "124px", left: "4px",
                                background: "#7f1d1d", color: "#fca5a5", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>🔢 erro</div>
                            );
                            if (!p.placa) return (
                              <div style={{ position: "absolute", top: "124px", left: "4px",
                                background: "#374151", color: "#9ca3af", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "5px" }}>🔢 —</div>
                            );
                            const bgConf = p.confianca === "alta" ? "#166534" : p.confianca === "media" ? "#854d0e" : "#374151";
                            const fgConf = p.confianca === "alta" ? "#bbf7d0" : p.confianca === "media" ? "#fef08a" : "#d1d5db";
                            return (
                              <div title={`Confiança: ${p.confianca}${p.parcial ? " (parcial)" : ""}${p.observacoes ? " — " + p.observacoes : ""}`}
                                style={{ position: "absolute", top: "124px", left: "4px",
                                  background: bgConf, color: fgConf,
                                  fontSize: "9px", fontWeight: "800", padding: "1px 5px", borderRadius: "5px",
                                  fontFamily: "monospace", letterSpacing: "0.5px", cursor: "help" }}>
                                {p.parcial ? "~" : ""}{p.placa}
                              </div>
                            );
                          })()}
                          {/* Badge score */}
                          <div style={{ position: "absolute", top: "4px", right: "4px", background: cor, color: "#fff",
                            fontWeight: "800", fontSize: "14px", padding: "1px 6px", borderRadius: "7px", boxShadow: "0 1px 4px rgba(0,0,0,.4)" }}>
                            {score.toFixed(1)}
                          </div>
                          {/* Faixa label */}
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `${cor}dd`,
                            color: "#fff", fontSize: "10px", fontWeight: "700", padding: "2px 6px", textAlign: "center" }}>
                            {label}
                          </div>
                        </div>

                        {/* Detalhe compacto */}
                        <div style={{ padding: "5px 7px" }}>
                          <div style={{ fontSize: "10px", fontWeight: "600", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.nome}
                          </div>
                          <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>
                            {r.distanciaHamming != null && <span>⚡ {r.distanciaHamming} bits</span>}
                            {r.matchCaracteristicas?.length > 0 && <span style={{ color: "#a78bfa", marginLeft: "4px" }}>🎯 {r.matchCaracteristicas.join(" ")}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Carregar próximas */}
            {cmpMeta?.temMais && !cmpCarregando && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
                  {cmpMeta.offset}–{cmpMeta.proximoOffset} de {cmpMeta.totalEncontradas} imagens carregadas
                </div>
                <button type="button" onClick={carregarProximas}
                  style={{ padding: "10px 28px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px",
                    cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                  ▶ Carregar próximas {Math.min(cmpMaxImagens, cmpMeta.totalEncontradas - cmpMeta.proximoOffset)} imagens
                </button>
              </div>
            )}

            {/* Todos processados */}
            {cmpMeta && !cmpMeta.temMais && !cmpCarregando && cmpResultados.length > 0 && (
              <div style={{ marginTop: "14px", textAlign: "center", fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>
                ✓ Todas as {cmpMeta.totalEncontradas} imagens foram processadas
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ABA LOTE ── */}
      {abaAtiva === "lote" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px" }}>

          {/* Formulário */}
          <form onSubmit={submeterLote} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "8px", padding: "10px", fontSize: "12px", color: "#6ccb5f" }}>
              <strong>⚡ Processamento em lote</strong><br/>
              Enfileira o job no servidor e processa em background. Feche a tela — os resultados ficam salvos no MongoDB.
            </div>

            {/* Modo */}
            <div style={{ display: "flex", gap: "0", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[{ value: "local", label: "⚡ Local (gratuito)" }, { value: "ia", label: "🤖 IA (GPT-4o)" }].map((m) => (
                <button key={m.value} type="button" onClick={() => setLoteModo(m.value)}
                  style={{ flex: 1, padding: "8px 10px", border: "none", cursor: "pointer", fontWeight: loteModo === m.value ? "700" : "400", fontSize: "12px",
                    background: loteModo === m.value ? (m.value === "local" ? "#16a34a" : "#7c3aed") : "rgba(255,255,255,0.04)",
                    color: loteModo === m.value ? "#fff" : "#c5c5c5" }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Imagem de referência */}
            <div>
              <label style={labelStyle}>Imagem de Referência</label>
              <div onClick={() => loteFileRef.current.click()} style={{ border: "2px dashed #2563eb", borderRadius: "8px", padding: "12px", textAlign: "center", cursor: "pointer", background: "rgba(96,205,255,0.06)", color: "#60cdff", fontSize: "12px" }}>
                {loteArquivo ? loteArquivo.name : "Clique para selecionar"}
              </div>
              <input ref={loteFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onLoteFileChange} />
              {lotePreview && <img src={lotePreview} alt="ref" style={{ width: "100%", maxHeight: "120px", objectFit: "contain", marginTop: "6px", borderRadius: "6px", border: "1px solid #bfdbfe" }} />}
            </div>

            {/* Pasta */}
            <div>
              <label style={labelStyle}>Pasta (absoluta ou relativa)</label>
              <input type="text" value={lotePasta} onChange={(e) => setLotePasta(e.target.value)}
                placeholder="Ex: C:\Downloads\fotos  ou  axhub" style={inputStyle} />
            </div>

            {/* Máx imagens */}
            <div>
              <label style={labelStyle}>Máx. imagens</label>
              <input type="number" min={1} max={5000} value={loteMaxImagens}
                onChange={(e) => { const v = parseInt(e.target.value, 10); setLoteMaxImagens(isNaN(v) || v < 1 ? 1 : v); }}
                style={{ ...inputStyle, width: "100px" }} />
              <span style={{ fontSize: "11px", color: "#888", marginLeft: "8px" }}>
                {loteModo === "local" ? "sem limite prático — local" : "cuidado com custos OpenAI"}
              </span>
            </div>

            <button type="submit" disabled={loteCarregando || !loteArquivo}
              style={{ padding: "10px 20px", background: loteCarregando ? "#94a3b8" : (loteModo === "local" ? "#16a34a" : "#7c3aed"), color: "#fff", border: "none", borderRadius: "6px", cursor: loteCarregando ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "14px" }}>
              {loteCarregando ? "Enfileirando..." : "📦 Enfileirar Job"}
            </button>

            {loteErro && <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", padding: "10px", borderRadius: "6px", color: "#f87171", fontSize: "13px" }}>{loteErro}</div>}
          </form>

          {/* Painel de status */}
          <div>
            {/* Job ativo — progresso em tempo real */}
            {loteJobAtivo && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "13px" }}>Job em andamento</strong>
                  <span style={{
                    fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px",
                    background: loteJobAtivo.status === "concluido" ? "#dcfce7" : loteJobAtivo.status === "erro" ? "#fee2e2" : "#fef9c3",
                    color: loteJobAtivo.status === "concluido" ? "#166534" : loteJobAtivo.status === "erro" ? "#dc2626" : "#92400e",
                  }}>
                    {loteJobAtivo.status}
                  </span>
                </div>

                {/* Barra de progresso */}
                <div style={{ background: "#e2e8f0", borderRadius: "99px", height: "10px", marginBottom: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: loteJobAtivo.status === "concluido" ? "#22c55e" : "#3b82f6", width: `${loteJobAtivo.progresso ?? 0}%`, transition: "width .4s ease", borderRadius: "99px" }} />
                </div>
                <div style={{ fontSize: "12px", color: "#555", display: "flex", justifyContent: "space-between" }}>
                  <span>{loteJobAtivo.processadas ?? 0} / {loteJobAtivo.totalEncontradas ?? "?"} imagens</span>
                  <span>{loteJobAtivo.progresso ?? 0}%</span>
                </div>

                {loteJobAtivo.erroMensagem && (
                  <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>{loteJobAtivo.erroMensagem}</div>
                )}

                {/* Resultados top-10 ao concluir */}
                {loteJobAtivo.status === "concluido" && loteJobAtivo.resultados?.length > 0 && (
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px", color: "#374151" }}>
                      Top resultados ({loteJobAtivo.resultados.length} total)
                    </div>
                    {loteJobAtivo.resultados.slice(0, 10).map((r, i) => (
                      <div key={r.nome} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0", borderBottom: "1px solid #f1f5f9", fontSize: "12px" }}>
                        <span style={{ fontWeight: "700", minWidth: "24px", color: r.similaridade >= 7 ? "#16a34a" : r.similaridade >= 4 ? "#d97706" : "#94a3b8" }}>
                          {r.similaridade?.toFixed(1) ?? "—"}
                        </span>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#374151" }}>#{i+1} {r.nome}</span>
                        {r.distanciaHamming != null && <span style={{ color: "#888", fontSize: "10px" }}>Δ{r.distanciaHamming}</span>}
                      </div>
                    ))}
                    {loteJobAtivo.resultados.length > 10 && (
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>...e mais {loteJobAtivo.resultados.length - 10} resultados</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Lista de jobs salvos */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <strong style={{ fontSize: "13px" }}>Jobs Recentes</strong>
              <button type="button" onClick={carregarListaJobs} style={{ ...btnSecStyle, fontSize: "11px" }}>↻ Atualizar</button>
            </div>
            {loteJobs.length === 0 && <div style={{ fontSize: "13px", color: "#888" }}>Nenhum job encontrado.</div>}
            {loteJobs.map((j) => (
              <div key={j._id} onClick={() => { setLoteJobAtivo(j); if (j.status === "processando") iniciarPolling(j._id); }}
                style={{ padding: "10px 12px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", marginBottom: "8px", cursor: "pointer",
                  background: loteJobAtivo?._id === j._id ? "rgba(96,205,255,0.08)" : "rgba(255,255,255,0.03)",
                  borderLeft: `4px solid ${j.status === "concluido" ? "#22c55e" : j.status === "erro" ? "#ef4444" : j.status === "processando" ? "#3b82f6" : "rgba(255,255,255,0.08)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                    {j.refImageNome ?? "imagem"} → {j.pasta}
                  </span>
                  <span style={{ color: j.status === "concluido" ? "#16a34a" : j.status === "erro" ? "#dc2626" : "#6366f1", fontWeight: "700", marginLeft: "8px" }}>
                    {j.status}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                  {j.modo} · {j.processadas}/{j.totalEncontradas} imagens · {new Date(j.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABA GALERIA ── */}
      {abaAtiva === "galeria" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>
              Imagens salvas em <code>uploads/analise/</code>
            </span>
            <button onClick={carregarGaleria} style={{ ...btnSecStyle }}>
              ↻ Atualizar
            </button>
          </div>

          {SISTEMAS.map(({ value: sis, label }) => {
            const imgs = galeria[sis] ?? [];
            return (
              <div key={sis} style={{ marginBottom: "28px" }}>
                <h4 style={{ marginBottom: "10px", fontSize: "14px", color: "#e0e0e0" }}>
                  {label} ({imgs.length})
                </h4>

                {imgs.length === 0 ? (
                  <p style={{ color: "#aaa", fontSize: "13px" }}>Nenhuma imagem salva.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                    {imgs.map((img) => (
                      <div key={img.nome} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
                        <img
                          src={`http://localhost:3100${img.url}`}
                          alt={img.nome}
                          style={{ width: "100%", height: "120px", objectFit: "cover", display: "block", cursor: "pointer" }}
                          onClick={() => reanalisarDaGaleria(sis, img)}
                          title="Clique para reanalisar"
                        />
                        <div style={{ padding: "6px 8px" }}>
                          <p style={{ fontSize: "11px", color: "#c5c5c5", margin: 0, wordBreak: "break-all" }}>{img.nome.slice(14)}</p>
                          <p style={{ fontSize: "10px", color: "#aaa", margin: "2px 0 6px" }}>{img.tamanhoKB} KB</p>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => reanalisarDaGaleria(sis, img)} style={{ ...btnSecStyle, fontSize: "11px", padding: "3px 7px" }}>
                              Analisar
                            </button>
                            <button onClick={() => remover(sis, img.nome)} style={{ ...btnDangerStyle, fontSize: "11px", padding: "3px 7px" }}>
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Estilos inline ──────────────────────────────────────────────────────────

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "4px",
  color: "#cbd5e1",
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "6px",
  fontSize: "13px",
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.1)",
  color: "#e2e8f0",
};

const btnSecStyle = {
  padding: "5px 12px",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "12px",
  color: "#cbd5e1",
};

const btnDangerStyle = {
  padding: "5px 12px",
  background: "rgba(248,113,113,0.1)",
  border: "1px solid rgba(248,113,113,0.3)",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "12px",
  color: "#f87171",
};
