import React, { useState } from "react";
import {
  Package, Factory, ShoppingCart, Truck, BarChart3, AlertTriangle,
  CheckCircle, ArrowRight, Info, Download, ExternalLink,
  Layers, Tag, Hash, Boxes, ClipboardList, Settings, BookOpen
} from "lucide-react";
import "./OdooAnalisador.css";

const TABS = [
  { id: "mapa",   label: "🗺️ Mapa Completo"      },
  { id: "org",    label: "🏢 Organograma"         },
  { id: "fluxo",   label: "🔄 Fluxo Completo"    },
  { id: "guia",    label: "📖 Guia Operador"      },
  { id: "hipoteses", label: "🔁 Cenários & Trocas" },
  { id: "serial",  label: "🏷️ Números Seriais"    },
  { id: "bom",     label: "📋 Listas, Kits e BOM" },
  { id: "prod",    label: "🏭 Produção"            },
  { id: "chao",    label: "🏗️ Chão de Fábrica & Combo" },
  { id: "cenario", label: "⭐ Melhor Cenário"      },
  { id: "bizagi",  label: "📐 Modelo Bizagi"       },
];

const BASE_ODOO = "https://santiago-sola-neto.odoo.com";

const FLUXO_ETAPAS = [
  { id:1, ator:"Comprador", cor:"blue", icone:ShoppingCart,
    titulo:"Cadastro do Produto",
    odoo:"Inventário → Produtos → Novo Produto",
    link:`${BASE_ODOO}/odoo/inventory/products`,
    linkLabel:"Abrir Produtos no Odoo",
    descricao:"Crie o produto com tipo 'Armazenável', defina unidade de medida, categoria e ative rastreamento por Número de Série para controle rigoroso por unidade.",
    campos:["Nome","Tipo: Armazenável","Unidade de Medida","Rastreamento: Nº de Série","Categoria: Mercadorias / PRODUTOS ACABADOS"],
    serial:false },
  { id:2, ator:"Comprador", cor:"blue", icone:ShoppingCart,
    titulo:"Pedido de Compra",
    odoo:"Compras → Pedidos → Novo Pedido",
    link:`${BASE_ODOO}/odoo/purchase`,
    linkLabel:"Abrir Compras no Odoo",
    descricao:"Gere o pedido de compra para os insumos. Ao confirmar o pedido, o Odoo cria automaticamente a entrada de recebimento no módulo de Inventário.",
    campos:["Fornecedor","Produtos e Quantidades","Data de entrega prevista","Condição de pagamento"],
    serial:false },
  { id:3, ator:"Comprador", cor:"blue", icone:Truck,
    titulo:"Recebimento de Mercadoria",
    odoo:"Inventário → Recebimentos → Validar",
    link:`${BASE_ODOO}/odoo/inventory/receipts`,
    linkLabel:"Abrir Recebimentos no Odoo",
    descricao:"★ PONTO 1 DE GERAÇÃO DE SERIAL ★ — Ao validar o recebimento, o Odoo solicita o número de série para cada unidade recebida. Cada item entra no estoque com seu serial único vinculado ao fornecedor e NF.",
    campos:["Número de Série por unidade (ex: CAM-HIK-001)","Lote (para múltiplas unidades)","Local de destino (B&B/ESTOQUE)","Quantidade validada"],
    serial:true, serialNote:"Serial do insumo gerado na entrada do estoque" },
  { id:4, ator:"Operador", cor:"purple", icone:ClipboardList,
    titulo:"Lista de Materiais (BOM)",
    odoo:"Fabricação → Configuração → Listas de Materiais",
    link:`${BASE_ODOO}/odoo/manufacturing/bom`,
    linkLabel:"Abrir Listas de Materiais no Odoo",
    descricao:"Defina a receita do produto final: quais insumos e quantidades são necessários para produzir 1 unidade do produto acabado. O tipo deve ser 'Fabricar'. Esta lista será usada em todas as Ordens de Produção desse modelo.",
    campos:["Produto Final (ex: AXOCR 2 Faixas 4G)","Tipo: Fabricar","Componentes + Quantidades","Operações (opcional)","Versão (v1, v2...)"],
    serial:false },
  { id:5, ator:"Operador", cor:"purple", icone:Factory,
    titulo:"Ordem de Produção",
    odoo:"Fabricação → Ordens de Produção → Novo",
    link:`${BASE_ODOO}/odoo/manufacturing`,
    linkLabel:"Abrir Fabricação no Odoo",
    descricao:"Crie a Ordem de Produção selecionando o produto final. O sistema puxa automaticamente a BOM e reserva os componentes do estoque. Confirme para reservar os materiais.",
    campos:["Produto Final","Quantidade a produzir","BOM selecionada automaticamente","Data prevista","Local de fabricação"],
    serial:false },
  { id:6, ator:"Produção", cor:"green", icone:Factory,
    titulo:"Execução da Produção",
    odoo:"Fabricação → Ordens de Produção → Confirmar → Produzir",
    link:`${BASE_ODOO}/odoo/manufacturing`,
    linkLabel:"Abrir Ordens de Produção no Odoo",
    descricao:"A equipe de produção executa a montagem, consumindo os insumos do estoque. Os números de série dos componentes são registrados no consumo, criando a rastreabilidade insumo → produto.",
    campos:["Confirmar disponibilidade dos materiais","Registrar consumo real de componentes","Seriais dos insumos consumidos (ex: CAM-HIK-001)"],
    serial:false },
  { id:7, ator:"Produção", cor:"green", icone:Package,
    titulo:"Conclusão da Produção",
    odoo:"Fabricação → Ordem de Produção → Marcar como Feito",
    link:`${BASE_ODOO}/odoo/manufacturing`,
    linkLabel:"Abrir Produção no Odoo",
    descricao:"★ PONTO 2 DE GERAÇÃO DE SERIAL ★ — Ao concluir a produção, o Odoo solicita o número de série do PRODUTO FINAL. Este serial identifica o equipamento acabado no estoque e fica vinculado a todos os seriais dos componentes usados.",
    campos:["Número de Série do produto final (ex: AXOCR-001)","Quantidade produzida","Local de destino no estoque"],
    serial:true, serialNote:"Serial do produto acabado gerado ao concluir a OP" },
  { id:8, ator:"Comprador", cor:"blue", icone:ShoppingCart,
    titulo:"Pedido de Venda",
    odoo:"Vendas → Pedidos → Novo → Confirmar",
    link:`${BASE_ODOO}/odoo/sales`,
    linkLabel:"Abrir Vendas no Odoo",
    descricao:"Crie o pedido de venda com o produto final. Ao confirmar, o sistema gera automaticamente a Ordem de Entrega no módulo de Inventário.",
    campos:["Cliente","Produto final + Quantidade","Confirmação gera Entrega automática"],
    serial:false },
  { id:9, ator:"Comprador", cor:"blue", icone:Truck,
    titulo:"Validação da Entrega",
    odoo:"Inventário → Entregas → Validar",
    link:`${BASE_ODOO}/odoo/inventory/delivery-orders`,
    linkLabel:"Abrir Entregas no Odoo",
    descricao:"★ PONTO 3 — CONTROLE DE SAÍDA ★ — O operador seleciona qual número de série específico será enviado ao cliente. O sistema registra o par Serial ↔ Cliente, fechando o ciclo completo de rastreabilidade.",
    campos:["Seleção do serial específico a ser entregue","Confirmação de entrega","Histórico: serial → cliente → pedido"],
    serial:true, serialNote:"Serial saindo do estoque vinculado ao cliente e pedido" },
];

function Badge({ label }) {
  return <span className={"oa-badge oa-badge-" + label}>{label}</span>;
}

function TabFluxo() {
  const [expandido, setExpandido] = useState(null);
  return (
    <div className="oa-fluxo">
      <div className="oa-atores">
        <div className="oa-ator-pill oa-ator-pill-blue"><ShoppingCart size={13}/> Comprador</div>
        <div className="oa-ator-pill oa-ator-pill-purple"><ClipboardList size={13}/> Operador</div>
        <div className="oa-ator-pill oa-ator-pill-green"><Factory size={13}/> Produção</div>
        <span style={{fontSize:12,color:"var(--text-muted)",alignSelf:"center"}}>Clique em uma etapa para ver os detalhes</span>
      </div>
      {FLUXO_ETAPAS.map((etapa,idx) => {
        const Icone = etapa.icone;
        const aberto = expandido === etapa.id;
        return (
          <div key={etapa.id} className="oa-etapa-wrap">
            <div
              className={`oa-etapa oa-etapa-${etapa.cor} ${aberto ? "oa-etapa--aberta" : ""}`}
              onClick={() => setExpandido(aberto ? null : etapa.id)}
            >
              <div className={`oa-etapa-num oa-num-${etapa.cor}`}>{etapa.id}</div>
              <div className={`oa-etapa-icon oa-icon-${etapa.cor}`}><Icone size={18}/></div>
              <div className="oa-etapa-body">
                <div className="oa-etapa-header">
                  <span className="oa-etapa-titulo">{etapa.titulo}</span>
                  <Badge label={etapa.ator}/>
                  {etapa.serial && <span className="oa-serial-badge">🏷️ SERIAL</span>}
                </div>
                <div className="oa-etapa-odoo">{etapa.odoo}</div>
                {aberto && (
                  <div className="oa-etapa-detail">
                    <p>{etapa.descricao}</p>
                    <div className="oa-campos">
                      {etapa.campos.map(c => <span key={c} className="oa-campo">{c}</span>)}
                    </div>
                    {etapa.serial && (
                      <div className="oa-serial-note"><Hash size={13}/>{etapa.serialNote}</div>
                    )}
                    <a
                      href={etapa.link}
                      target="_blank"
                      rel="noreferrer"
                      className="oa-etapa-link"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={13}/> {etapa.linkLabel}
                    </a>
                  </div>
                )}
              </div>
              <div className="oa-etapa-arrow">{aberto ? "▲" : "▼"}</div>
            </div>
            {idx < FLUXO_ETAPAS.length - 1 && (
              <div className="oa-conector"><ArrowRight size={14}/></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const ODOO_LINKS = [
  { label:"📦 Produtos",             url:`${BASE_ODOO}/odoo/inventory/products`,       desc:"Cadastro de produtos" },
  { label:"🛒 Compras",              url:`${BASE_ODOO}/odoo/purchase`,                 desc:"Pedidos de compra" },
  { label:"📥 Recebimentos",         url:`${BASE_ODOO}/odoo/inventory/receipts`,       desc:"Entrada de mercadoria" },
  { label:"📋 Listas de Materiais",  url:`${BASE_ODOO}/odoo/manufacturing/bom`,        desc:"BOM - Receitas de produção" },
  { label:"🏭 Fabricação",           url:`${BASE_ODOO}/odoo/manufacturing`,            desc:"Ordens de produção" },
  { label:"🏷️ Rastreabilidade",      url:`${BASE_ODOO}/odoo/inventory/traceability`,   desc:"Histórico de seriais" },
  { label:"💼 Vendas",               url:`${BASE_ODOO}/odoo/sales`,                    desc:"Pedidos de venda" },
  { label:"📤 Entregas",             url:`${BASE_ODOO}/odoo/inventory/delivery-orders`,desc:"Saídas do estoque" },
  { label:"📊 Inventário",           url:`${BASE_ODOO}/odoo/inventory`,                desc:"Visão geral do estoque" },
  { label:"⚙️ Configurações",        url:`${BASE_ODOO}/odoo/settings`,                 desc:"Módulos e definições" },
];

function OdooLinkBar() {
  return (
    <div className="oa-link-bar">
      <span className="oa-link-bar-label">🔗 Acesso rápido ao Odoo:</span>
      <div className="oa-link-bar-items">
        {ODOO_LINKS.map(l => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="oa-quick-link" title={l.desc}>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function TabSerial() {
  return (
    <div className="oa-content">
      <OdooLinkBar/>
      <div className="oa-info-box oa-info-blue">
        <Info size={16}/><div>O Odoo suporta dois tipos: <strong>Número de Série</strong> (1 serial por unidade — ideal para equipamentos) e <strong>Lote</strong> (1 lote para várias unidades — ideal para insumos em quantidade). Para os equipamentos AXOCR, use <strong>Número de Série</strong>.</div>
      </div>
      <div className="oa-cards-grid">
        <div className="oa-card oa-card-blue">
          <h3>🏷️ Ponto 1 — Entrada de Insumo</h3>
          <div className="oa-card-path">Inventário → Recebimentos → Validar</div>
          <p>Ao confirmar o recebimento, o Odoo solicita o serial de cada unidade. Cria um registro <code>stock.lot</code> vinculado ao produto.</p>
          <ul>
            <li>Serial inserido manualmente ou por scanner</li>
            <li>Pode ser gerado automaticamente com sequência configurável</li>
            <li>Vinculado ao fornecedor e NF de compra</li>
            <li>Rastreável no histórico de movimentações</li>
          </ul>
        </div>
        <div className="oa-card oa-card-purple">
          <h3>🏭 Ponto 2 — Produto Final Produzido</h3>
          <div className="oa-card-path">Fabricação → Ordem de Produção → Marcar como Feito</div>
          <p>Ao concluir a produção, o Odoo solicita o serial do produto ACABADO. Ocorre a <strong>amarração</strong>: serial final ↔ seriais dos componentes consumidos.</p>
          <ul>
            <li>Serial do produto acabado (ex: AXOCR-2FX-001)</li>
            <li>Rastreabilidade completa: quais componentes estão no produto</li>
            <li>Histórico de produção completo</li>
            <li>Vinculado à BOM e à Ordem de Produção</li>
          </ul>
        </div>
        <div className="oa-card oa-card-green">
          <h3>📦 Ponto 3 — Saída para o Cliente</h3>
          <div className="oa-card-path">Inventário → Entregas → Validar</div>
          <p>Na entrega, o operador seleciona o serial específico enviado. O sistema registra o par <strong>Serial ↔ Cliente</strong>.</p>
          <ul>
            <li>Seleção manual do serial na entrega</li>
            <li>Histórico: quando saiu, para quem, por qual pedido</li>
            <li>Rastreabilidade inversa: cliente → serial → componentes</li>
            <li>NF vinculada ao serial</li>
          </ul>
        </div>
      </div>
      <div className="oa-section">
        <h3>⚙️ Como Ativar Rastreamento por Serial no Produto</h3>
        <div className="oa-steps">
          <div className="oa-step">1. Abra o produto em <code>Inventário → Produtos</code></div>
          <div className="oa-step">2. Clique na aba <strong>Inventário</strong></div>
          <div className="oa-step">3. Campo <strong>Rastreamento</strong> → selecione <em>"Por número de série"</em></div>
          <div className="oa-step">4. Salve — a partir desse momento toda movimentação exigirá serial</div>
        </div>
      </div>
      <div className="oa-section">
        <h3>🔗 Tabela de Amarração Serial × Momento × Local</h3>
        <div className="oa-table-wrap">
          <table className="oa-table">
            <thead><tr><th>Momento</th><th>Onde no Odoo</th><th>O que é registrado</th></tr></thead>
            <tbody>
              <tr><td>Recebimento do insumo</td><td>Inventário → Recebimentos</td><td>Serial do componente (ex: CAM-HIK-001)</td></tr>
              <tr><td>Consumo na produção</td><td>Fabricação → OP → Componentes</td><td>Serial do insumo consumido na OP</td></tr>
              <tr><td>Produto acabado</td><td>Fabricação → OP → Produtos Acabados</td><td>Serial do produto final (ex: AXOCR-001)</td></tr>
              <tr><td>Saída na entrega</td><td>Inventário → Entregas</td><td>Serial que saiu + cliente + pedido</td></tr>
              <tr><td>Relatório de rastreabilidade</td><td>Inventário → Rastreabilidade</td><td>Histórico completo de todos os movimentos</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TabBOM() {
  return (
    <div className="oa-content">
      <OdooLinkBar/>
      <div className="oa-cards-grid">
        <div className="oa-card oa-card-blue">
          <h3>📋 BOM — Lista de Materiais (Fabricar)</h3>
          <div className="oa-card-path">Tipo: "Fabricar"</div>
          <p>É a <strong>receita de produção</strong>. Define quais componentes e quantidades são necessários para produzir 1 unidade do produto final.</p>
          <ul>
            <li>Usada nas Ordens de Produção</li>
            <li>Cria movimentos: consumo dos componentes + entrada do produto final</li>
            <li>Pode ter múltiplas versões (v1, v2...)</li>
            <li>Suporta operações de trabalho (roteiros)</li>
          </ul>
          <div className="oa-exemplo">
            <strong>Ex: AXOCR 2 Faixas 4G 1.0</strong><br/>
            → 1× Camera Hikvision TCM403<br/>
            → 1× Iluminador IR Axion Websocket<br/>
            → 1× Mini PC Intel N100<br/>
            → 1× Roteador Intelbras W5-1200GS<br/>
            → 1× Painel Solar 160W
          </div>
        </div>
        <div className="oa-card oa-card-purple">
          <h3>🎁 Kit (BOM tipo "Kit")</h3>
          <div className="oa-card-path">Tipo: "Kit"</div>
          <p>O Kit <strong>NÃO gera Ordem de Produção</strong>. Quando vendido, o Odoo explode automaticamente na entrega, enviando os componentes individualmente. Não há produto físico montado.</p>
          <ul>
            <li>Usado para venda de conjuntos sem montagem</li>
            <li>Entrega as peças separadas diretamente</li>
            <li>Aparece como produto único no pedido de venda</li>
            <li>Não rastreia serial de produto final (não existe produto final montado)</li>
          </ul>
          <div className="oa-exemplo">
            <strong>Diferença chave:</strong><br/>
            Kit → entrega as peças separadas<br/>
            BOM Fabricar → produz e entrega o produto montado
          </div>
        </div>
        <div className="oa-card oa-card-green">
          <h3>🔀 BOM tipo "Subcontratação"</h3>
          <div className="oa-card-path">Tipo: "Subcontratação"</div>
          <p>Quando a montagem é feita por um <strong>terceiro</strong>. O Odoo envia componentes ao subcontratado e recebe o produto acabado.</p>
          <ul>
            <li>Cria pedido de compra ao subcontratado automaticamente</li>
            <li>Rastreia envio de componentes e recebimento do produto</li>
            <li>Ideal quando a fábrica é externa (Base Cardoso)</li>
          </ul>
        </div>
      </div>
      <div className="oa-section">
        <h3>📊 Comparativo: Lista × Kit × Produção</h3>
        <div className="oa-table-wrap">
          <table className="oa-table">
            <thead>
              <tr><th>Critério</th><th>BOM "Fabricar"</th><th>Kit</th><th>BOM "Subcontratação"</th></tr>
            </thead>
            <tbody>
              <tr><td>Cria Ordem de Produção?</td><td>✅ Sim</td><td>❌ Não</td><td>✅ Sim (via compra)</td></tr>
              <tr><td>Produto final no estoque?</td><td>✅ Sim</td><td>❌ Não (componentes)</td><td>✅ Sim</td></tr>
              <tr><td>Serial no produto final?</td><td>✅ Sim</td><td>❌ Não se aplica</td><td>✅ Sim</td></tr>
              <tr><td>Controla montagem?</td><td>✅ Sim</td><td>❌ Não</td><td>⚡ Parcialmente</td></tr>
              <tr><td>Caso de uso Axion</td><td><strong>AXOCR montado</strong></td><td>Peças avulsas</td><td>Montagem BASE CARDOSO</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TabProducao() {
  return (
    <div className="oa-content">
      <OdooLinkBar/>
      <div className="oa-info-box oa-info-yellow">
        <AlertTriangle size={16}/>
        <div><strong>Produzir sem estoque:</strong> Por padrão o Odoo bloqueia a produção sem estoque dos componentes. Veja as 3 opções abaixo.</div>
      </div>
      <div className="oa-section">
        <h3>🚦 Estados de uma Ordem de Produção</h3>
        <div className="oa-estados">
          {[
            {e:"Rascunho",    cls:"cinza",  d:"Criada, não confirmada"},
            {e:"Confirmada",  cls:"azul",   d:"Aguardando materiais"},
            {e:"Em Progresso",cls:"amarelo",d:"Produção iniciada"},
            {e:"Concluída",   cls:"verde",  d:"Produto no estoque"},
          ].map(({e,cls,d}) => (
            <div key={e} className={`oa-estado oa-estado-${cls}`}>
              <span className="oa-estado-dot"/>
              <div><strong>{e}</strong><span>{d}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="oa-section">
        <h3>⚡ Como Produzir sem Estoque Disponível</h3>
        <div className="oa-cards-grid">
          <div className="oa-card oa-card-yellow">
            <h4>Opção 1 — Disponibilidade Imediata</h4>
            <p>Na Ordem de Produção, clique em <strong>"Disponibilidade imediata"</strong>. O Odoo reserva o que tem e permite iniciar mesmo sem estoque completo.</p>
            <ul>
              <li>Componentes faltantes ficam como "não disponíveis"</li>
              <li>Produção inicia com estoque parcial</li>
              <li>Risco: precisará adicionar o componente faltante manualmente depois</li>
            </ul>
          </div>
          <div className="oa-card oa-card-blue">
            <h4>Opção 2 — Estoque Negativo</h4>
            <p>Em <strong>Inventário → Configuração → Definições</strong>, habilite <em>"Permitir quantidades negativas"</em>.</p>
            <ul>
              <li>Permite produzir mesmo sem estoque</li>
              <li>Gera saldo negativo (pendência a regularizar)</li>
              <li>Regularizado quando o material chega</li>
            </ul>
          </div>
          <div className="oa-card oa-card-green">
            <h4>Opção 3 — Substituir Componente na OP</h4>
            <p>Dentro da OP, aba <strong>Componentes</strong>, é possível <strong>substituir ou remover</strong> um componente para aquela OP específica.</p>
            <ul>
              <li>Não altera a BOM original</li>
              <li>Útil para substituições pontuais</li>
              <li>Registra a variação no histórico da OP</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="oa-section">
        <h3>🔗 Relação: Produção × BOM × Kit × Serial</h3>
        <div className="oa-table-wrap">
          <table className="oa-table">
            <thead><tr><th>Objeto</th><th>O que é</th><th>Relação com a produção</th></tr></thead>
            <tbody>
              <tr><td><strong>BOM</strong></td><td>Receita: ingredientes + quantidades</td><td>Base obrigatória da Ordem de Produção</td></tr>
              <tr><td><strong>Ordem de Produção</strong></td><td>Execução: quando e quanto produzir</td><td>Usa a BOM, gera movimentos de estoque</td></tr>
              <tr><td><strong>Kit</strong></td><td>BOM especial para entrega direta</td><td>Não gera OP, explode na entrega</td></tr>
              <tr><td><strong>Serial (insumo)</strong></td><td>ID único do componente</td><td>Capturado no recebimento, consumido na OP</td></tr>
              <tr><td><strong>Serial (produto final)</strong></td><td>ID único do produto acabado</td><td>Gerado na conclusão da OP</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TabCenario() {
  return (
    <div className="oa-content">
      <OdooLinkBar/>
      <div className="oa-info-box oa-info-green">
        <CheckCircle size={16}/>
        <div><strong>Cenário recomendado para a Axion:</strong> Controle completo com rastreabilidade serial-a-serial do insumo ao cliente final.</div>
      </div>
      <div className="oa-section">
        <h3>⚙️ Configurações Necessárias no Odoo</h3>
        <div className="oa-config-list">
          {[
            {m:"Inventário → Configuração → Rastreabilidade", c:"Ativar Lotes e Números de Série"},
            {m:"Fabricação → Configuração",                   c:"Confirmar módulo de Fabricação ativo"},
            {m:"Inventário → Configuração → Armazéns",        c:"Criar AXION TECNOLOGIA + BASE CARDOSO"},
            {m:"Produto → Aba Inventário",                    c:"Definir Rastreamento: Número de Série (produtos principais)"},
            {m:"Fabricação → Listas de Materiais",            c:"Criar BOM para cada modelo de equipamento"},
          ].map(({m,c}) => (
            <div key={m} className="oa-config-item">
              <Settings size={14}/>
              <div><code>{m}</code><span>{c}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="oa-section">
        <h3>🗺️ Fluxo Ideal — Os 3 Braços</h3>
        <div className="oa-bracos">
          <div className="oa-braco oa-braco-blue">
            <div className="oa-braco-header"><ShoppingCart size={16}/> Comprador</div>
            <div className="oa-braco-steps">
              <div className="oa-bs">1. Pedido de Compra → Fornecedor</div>
              <div className="oa-bs oa-bs-serial">2. Recebimento → <strong>Serial do insumo</strong></div>
              <div className="oa-bs">3. Insumo disponível no estoque</div>
              <div className="oa-bs">8. Pedido de Venda → Cliente</div>
              <div className="oa-bs oa-bs-serial">9. Entrega → <strong>Serial do produto saindo</strong></div>
            </div>
          </div>
          <div className="oa-braco oa-braco-purple">
            <div className="oa-braco-header"><ClipboardList size={16}/> Operador</div>
            <div className="oa-braco-steps">
              <div className="oa-bs">4. Criação / Revisão da BOM</div>
              <div className="oa-bs">5. Criar Ordem de Produção</div>
              <div className="oa-bs">5. Reservar componentes do estoque</div>
              <div className="oa-bs">6. Monitorar disponibilidade</div>
            </div>
          </div>
          <div className="oa-braco oa-braco-green">
            <div className="oa-braco-header"><Factory size={16}/> Produção</div>
            <div className="oa-braco-steps">
              <div className="oa-bs">6. Executar a Ordem de Produção</div>
              <div className="oa-bs">6. Consumir componentes (com seriais)</div>
              <div className="oa-bs oa-bs-serial">7. Concluir → <strong>Serial do produto final</strong></div>
              <div className="oa-bs">7. Produto entra no estoque</div>
            </div>
          </div>
        </div>
      </div>
      <div className="oa-section">
        <h3>📋 Controle da Lista vs Controle da Produção</h3>
        <div className="oa-cards-grid">
          <div className="oa-card oa-card-purple">
            <h4>Controle da Lista (BOM)</h4>
            <p>Controlada pelo <strong>Operador / Engenharia</strong>:</p>
            <ul>
              <li>Versiona a receita (v1, v2, v3...)</li>
              <li>Define o que é necessário por modelo</li>
              <li>Pode ter variantes por configuração (AC vs Solar)</li>
              <li>Acesso: <code>Fabricação → Listas de Materiais</code></li>
            </ul>
          </div>
          <div className="oa-card oa-card-green">
            <h4>Controle da Produção (OP)</h4>
            <p>Controlada pela <strong>Fábrica / Produção</strong>:</p>
            <ul>
              <li>Mostra o que produzir e quando</li>
              <li>Registra consumo real vs planejado</li>
              <li>Captura seriais dos insumos utilizados</li>
              <li>Gera o serial do produto acabado</li>
              <li>Acesso: <code>Fabricação → Ordens de Produção</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBizagi() {
  const handleDownload = () => {
    const bpmnContent = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             targetNamespace="http://axion.tecnologia.br/odoo-flow"
             id="axion-odoo-flow">
  <process id="proc_odoo_axion" name="Fluxo Odoo Axion — Comprador, Operador e Producao" isExecutable="false">
    <laneSet id="ls1">
      <lane id="lane_comprador" name="Comprador">
        <flowNodeRef>start1</flowNodeRef>
        <flowNodeRef>task_cadastro_produto</flowNodeRef>
        <flowNodeRef>task_pedido_compra</flowNodeRef>
        <flowNodeRef>task_recebimento</flowNodeRef>
        <flowNodeRef>task_pedido_venda</flowNodeRef>
        <flowNodeRef>task_entrega</flowNodeRef>
        <flowNodeRef>end1</flowNodeRef>
      </lane>
      <lane id="lane_operador" name="Operador (Patrimonio)">
        <flowNodeRef>task_bom</flowNodeRef>
        <flowNodeRef>task_criar_op</flowNodeRef>
      </lane>
      <lane id="lane_producao" name="Producao (Fabrica)">
        <flowNodeRef>task_executar</flowNodeRef>
        <flowNodeRef>task_concluir</flowNodeRef>
      </lane>
    </laneSet>
    <startEvent id="start1" name="Necessidade de Produto"/>
    <task id="task_cadastro_produto" name="Cadastrar Produto&#xa;(Armazenavel + Serial)"/>
    <task id="task_pedido_compra" name="Criar Pedido de Compra"/>
    <task id="task_recebimento" name="Receber Mercadoria&#xa;SERIAL: gerar serial do insumo"/>
    <task id="task_bom" name="Criar/Revisar&#xa;Lista de Materiais (BOM)"/>
    <task id="task_criar_op" name="Criar Ordem de Producao&#xa;(Reservar componentes)"/>
    <task id="task_executar" name="Executar Producao&#xa;(Consumir insumos + registrar seriais)"/>
    <task id="task_concluir" name="Concluir Producao&#xa;SERIAL: gerar serial produto final"/>
    <task id="task_pedido_venda" name="Criar Pedido de Venda"/>
    <task id="task_entrega" name="Validar Entrega&#xa;SERIAL: serial sai com o cliente"/>
    <endEvent id="end1" name="Produto Entregue&#xa;Rastreabilidade Completa"/>
    <sequenceFlow id="sf1"  sourceRef="start1"               targetRef="task_cadastro_produto"/>
    <sequenceFlow id="sf2"  sourceRef="task_cadastro_produto" targetRef="task_pedido_compra"/>
    <sequenceFlow id="sf3"  sourceRef="task_pedido_compra"   targetRef="task_recebimento"/>
    <sequenceFlow id="sf4"  sourceRef="task_recebimento"     targetRef="task_bom"/>
    <sequenceFlow id="sf5"  sourceRef="task_bom"             targetRef="task_criar_op"/>
    <sequenceFlow id="sf6"  sourceRef="task_criar_op"        targetRef="task_executar"/>
    <sequenceFlow id="sf7"  sourceRef="task_executar"        targetRef="task_concluir"/>
    <sequenceFlow id="sf8"  sourceRef="task_concluir"        targetRef="task_pedido_venda"/>
    <sequenceFlow id="sf9"  sourceRef="task_pedido_venda"    targetRef="task_entrega"/>
    <sequenceFlow id="sf10" sourceRef="task_entrega"         targetRef="end1"/>
  </process>
  <BPMNDiagram id="diagram1">
    <BPMNPlane id="plane1" bpmnElement="proc_odoo_axion">
      <BPMNShape id="s_start"  bpmnElement="start1"><Bounds x="60" y="120" width="36" height="36"/></BPMNShape>
      <BPMNShape id="s_cad"    bpmnElement="task_cadastro_produto"><Bounds x="130" y="200" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_pc"     bpmnElement="task_pedido_compra"><Bounds x="130" y="100" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_rec"    bpmnElement="task_recebimento"><Bounds x="290" y="100" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_bom"    bpmnElement="task_bom"><Bounds x="290" y="200" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_op"     bpmnElement="task_criar_op"><Bounds x="450" y="200" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_exec"   bpmnElement="task_executar"><Bounds x="450" y="310" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_conc"   bpmnElement="task_concluir"><Bounds x="610" y="310" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_pv"     bpmnElement="task_pedido_venda"><Bounds x="610" y="100" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_entr"   bpmnElement="task_entrega"><Bounds x="770" y="100" width="120" height="60"/></BPMNShape>
      <BPMNShape id="s_end"    bpmnElement="end1"><Bounds x="930" y="118" width="36" height="36"/></BPMNShape>
    </BPMNPlane>
  </BPMNDiagram>
</definitions>`;
    const blob = new Blob([bpmnContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Axion_Odoo_Fluxo_Completo.bpmn";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="oa-content">
      <div className="oa-info-box oa-info-blue">
        <BookOpen size={16}/>
        <div>O arquivo <code>.bpmn</code> gerado é compatível com <strong>Bizagi Modeler</strong> e outros editores BPMN 2.0 (Camunda, Activiti). Contém 3 pistas (lanes) e os 3 pontos de serial marcados.</div>
      </div>
      <div className="oa-section">
        <h3>📐 Preview do Modelo — 3 Pistas</h3>
        <div className="oa-bizagi-preview">
          <div className="oa-lane-preview">
            <div className="oa-lane oa-lane-blue">
              <div className="oa-lane-title"><ShoppingCart size={12}/> Comprador</div>
              <div className="oa-lane-tasks">
                <div className="oa-ltask">Cadastrar Produto</div><ArrowRight size={11}/>
                <div className="oa-ltask">Pedido de Compra</div><ArrowRight size={11}/>
                <div className="oa-ltask oa-ltask-serial">★ Receber + Serial Insumo</div>
                <ArrowRight size={11} style={{marginLeft:"auto"}}/>
                <div className="oa-ltask">Pedido de Venda</div><ArrowRight size={11}/>
                <div className="oa-ltask oa-ltask-serial">★ Entrega + Serial Saída</div>
              </div>
            </div>
            <div className="oa-lane oa-lane-purple">
              <div className="oa-lane-title"><ClipboardList size={12}/> Operador (Patrimônio)</div>
              <div className="oa-lane-tasks">
                <div className="oa-ltask">Criar / Revisar BOM</div><ArrowRight size={11}/>
                <div className="oa-ltask">Criar Ordem de Produção</div><ArrowRight size={11}/>
                <div className="oa-ltask">Reservar Componentes</div>
              </div>
            </div>
            <div className="oa-lane oa-lane-green">
              <div className="oa-lane-title"><Factory size={12}/> Produção (Fábrica)</div>
              <div className="oa-lane-tasks">
                <div className="oa-ltask">Executar OP</div><ArrowRight size={11}/>
                <div className="oa-ltask">Consumir Insumos</div><ArrowRight size={11}/>
                <div className="oa-ltask oa-ltask-serial">★ Concluir + Serial Produto Final</div>
              </div>
            </div>
          </div>
        </div>
        <button className="oa-btn-download" onClick={handleDownload}>
          <Download size={16}/> Baixar Axion_Odoo_Fluxo_Completo.bpmn
        </button>
        <div className="oa-steps" style={{marginTop:16}}>
          <div className="oa-step">1. Clique em "Baixar" para salvar o arquivo <code>.bpmn</code></div>
          <div className="oa-step">2. Abra o <strong>Bizagi Modeler</strong></div>
          <div className="oa-step">3. <code>Arquivo → Abrir → Selecione o .bpmn</code></div>
          <div className="oa-step">4. O diagrama abrirá com as 3 pistas e o fluxo completo</div>
          <div className="oa-step">5. Edite e enriqueça conforme necessário</div>
        </div>
      </div>
      <div className="oa-section">
        <h3>🔗 Links do Sistema Odoo</h3>
        <div className="oa-links">
          <a className="oa-link" href="https://santiago-sola-neto.odoo.com/odoo/manufacturing" target="_blank" rel="noreferrer">
            <Factory size={13}/> Odoo → Fabricação
          </a>
          <a className="oa-link" href="https://santiago-sola-neto.odoo.com/odoo/inventory" target="_blank" rel="noreferrer">
            <Boxes size={13}/> Odoo → Inventário
          </a>
          <a className="oa-link" href="https://santiago-sola-neto.odoo.com/odoo/inventory/products" target="_blank" rel="noreferrer">
            <Package size={13}/> Odoo → Produtos (83 cadastrados)
          </a>
          <a className="oa-link" href="https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing/management/bill_configuration.html" target="_blank" rel="noreferrer">
            <BookOpen size={13}/> Docs Odoo — Listas de Materiais
          </a>
          <a className="oa-link" href="https://www.bizagi.com/pt/produtos/bpm-suite/modeler" target="_blank" rel="noreferrer">
            <Download size={13}/> Download Bizagi Modeler
          </a>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GUIA OPERADOR — Passo a passo detalhado com serial
   ══════════════════════════════════════════════════════════════ */
const GUIA_PASSOS = [
  {
    id:1, ator:"Operador TI / Compras", cor:"blue",
    titulo:"Cadastrar Produto com Rastreamento por Serial",
    tela:"Inventário → Produtos → Novo",
    link:`${BASE_ODOO}/odoo/inventory/products`,
    serial:false,
    passos:[
      "Acesse Inventário → Produtos → clique em Novo",
      "Preencha o Nome do produto (ex: CAMERA ALPR HIKVISION TCM403)",
      "Referência Interna: use o código padrão (ex: CAM-HIK-TCM403BI-G)",
      "Tipo de Produto: selecione Armazenável",
      "Clique na aba Inventário",
      "Campo Rastreamento: selecione Por número de série",
      "Categoria: escolha a categoria correta (ex: Mercadorias / INSUMOS / CFTV)",
      "Salve o produto",
    ],
    obs:"A partir deste momento qualquer movimentação do produto exigirá informar o número de série.",
  },
  {
    id:2, ator:"Comprador", cor:"blue",
    titulo:"Criar Pedido de Compra dos Insumos",
    tela:"Compras → Pedidos → Novo",
    link:`${BASE_ODOO}/odoo/purchase`,
    serial:false,
    passos:[
      "Acesse Compras → Pedidos → Novo",
      "Selecione o Fornecedor",
      "Na aba Produtos, adicione cada insumo com a quantidade necessária",
      "Verifique a Data de entrega prevista",
      "Clique em Confirmar Pedido",
      "O sistema cria automaticamente um Recebimento em Inventário",
    ],
    obs:"Após confirmar, vá em Inventário → Recebimentos para registrar a entrada física.",
  },
  {
    id:3, ator:"Almoxarifado / Comprador", cor:"blue",
    titulo:"Receber Mercadoria e Registrar Serial do Insumo",
    tela:"Inventário → Recebimentos → selecionar → Validar",
    link:`${BASE_ODOO}/odoo/inventory/receipts`,
    serial:true,
    serialDetalhe:"🏷️ SERIAL GERADO AQUI — Serial do insumo que entra no estoque",
    passos:[
      "Acesse Inventário → Recebimentos",
      "Clique no recebimento pendente vinculado ao pedido de compra",
      "Verifique os produtos e quantidades listados",
      "Para cada unidade, clique no ícone de detalhe (ícone de lista) ao lado da linha",
      "Insira o Número de Série de cada unidade física (ex: CAM-HIK-001, CAM-HIK-002...)",
      "Você pode usar o leitor de código de barras se o fabricante imprimiu o serial",
      "Defina o Local de destino (ex: B&B/ESTOQUE)",
      "Clique em Validar — cada unidade agora tem seu serial registrado no sistema",
    ],
    obs:"Audite conferindo a etiqueta física do equipamento com o serial digitado. Se chegou danificado, NÃO valide — siga o Cenário 1 nos Cenários & Trocas.",
  },
  {
    id:4, ator:"Operador / Engenharia", cor:"purple",
    titulo:"Criar ou Revisar a Lista de Materiais (BOM)",
    tela:"Fabricação → Configuração → Listas de Materiais → Novo",
    link:`${BASE_ODOO}/odoo/manufacturing/bom`,
    serial:false,
    passos:[
      "Acesse Fabricação → Configuração → Listas de Materiais",
      "Clique em Novo (ou edite uma BOM existente)",
      "Produto: selecione o produto final (ex: AXOCR 2 Faixas 4G 1.0)",
      "Tipo de BOM: selecione Fabricar",
      "Na aba Componentes, adicione cada insumo necessário com a quantidade:",
      "  → Camera Hikvision TCM403: 1 unidade",
      "  → Iluminador IR Axion Websocket: 1 unidade",
      "  → Mini PC Intel N100: 1 unidade",
      "  → Roteador Intelbras W5-1200GS: 1 unidade",
      "  → Painel Solar 160W: 1 unidade (para versão solar)",
      "Salve a BOM — ela será usada automaticamente nas Ordens de Produção",
    ],
    obs:"Se a BOM mudar (novo componente), crie uma nova versão. A versão anterior fica arquivada para auditoria.",
  },
  {
    id:5, ator:"Operador / PCP", cor:"purple",
    titulo:"Criar Ordem de Produção e Reservar Materiais",
    tela:"Fabricação → Ordens de Produção → Novo",
    link:`${BASE_ODOO}/odoo/manufacturing`,
    serial:false,
    passos:[
      "Acesse Fabricação → Ordens de Produção → Novo",
      "Produto: selecione o produto final a ser produzido",
      "Quantidade: informe quantas unidades serão produzidas",
      "A BOM é preenchida automaticamente — verifique se é a versão correta",
      "Data Programada: defina quando iniciar a produção",
      "Clique em Confirmar — os materiais são reservados no estoque",
      "Verifique a aba Disponibilidade: todos os itens devem estar em verde",
      "Se algum item estiver em vermelho, siga o Cenário 5 (item faltando)",
    ],
    obs:"Cada Ordem de Produção tem um número único (ex: WH/MO/00001) que é o código de rastreamento da produção.",
  },
  {
    id:6, ator:"Produção / Fábrica", cor:"green",
    titulo:"Executar a Produção e Registrar Consumo com Seriais",
    tela:"Fabricação → Ordens de Produção → selecionar → Produzir",
    link:`${BASE_ODOO}/odoo/manufacturing`,
    serial:false,
    passos:[
      "Acesse Fabricação → Ordens de Produção e abra a OP confirmada",
      "Clique em Verificar disponibilidade (se necessário)",
      "Clique em Produzir para iniciar a execução",
      "Na aba Componentes, para cada item com serial:",
      "  → Clique no ícone de detalhe da linha do componente",
      "  → Selecione qual serial específico está sendo consumido (ex: CAM-HIK-001)",
      "Execute fisicamente a montagem do equipamento",
      "Registre qualquer variação (componente substituído, quantidade diferente)",
    ],
    obs:"Os seriais dos insumos consumidos ficam registrados para rastreabilidade. Guarde a embalagem do componente até o final da produção.",
  },
  {
    id:7, ator:"Produção / Fábrica", cor:"green",
    titulo:"Concluir Produção e Gerar Serial do Produto Final",
    tela:"Fabricação → Ordens de Produção → Marcar como Feito",
    link:`${BASE_ODOO}/odoo/manufacturing`,
    serial:true,
    serialDetalhe:"🏷️ SERIAL GERADO AQUI — Serial do produto acabado (equipamento montado)",
    passos:[
      "Com a montagem física concluída, acesse a Ordem de Produção",
      "Clique em Marcar como Feito",
      "O sistema solicita o Número de Série do produto final produzido",
      "Informe o serial do equipamento (ex: AXOCR-2FX-001) — esse é o serial definitivo",
      "Afixe ou grave fisicamente esse serial no equipamento (etiqueta, placa ou gravação)",
      "O Odoo registra automaticamente:",
      "  → Serial AXOCR-2FX-001 foi produzido usando CAM-HIK-001, ILU-IR-001, MPC-001...",
      "Confirme — o produto entra no estoque com o serial e a rastreabilidade completa",
    ],
    obs:"Este serial é o DNA do produto. Com ele é possível saber: quais componentes foram usados, quando foi produzido, qual BOM foi aplicada, qual operador fez a montagem.",
  },
  {
    id:8, ator:"Comercial / Comprador", cor:"blue",
    titulo:"Criar Pedido de Venda e Gerar Entrega",
    tela:"Vendas → Pedidos → Novo → Confirmar",
    link:`${BASE_ODOO}/odoo/sales`,
    serial:false,
    passos:[
      "Acesse Vendas → Pedidos → Novo",
      "Selecione o Cliente",
      "Adicione o produto final (ex: AXOCR 2 Faixas 4G 1.0) com a quantidade",
      "Verifique preço e condições",
      "Clique em Confirmar Pedido",
      "O sistema cria automaticamente uma Ordem de Entrega em Inventário",
      "Vá em Inventário → Entregas para verificar a entrega pendente",
    ],
    obs:"Nunca entregue fisicamente antes de validar no sistema — o serial precisa ser registrado na saída.",
  },
  {
    id:9, ator:"Almoxarifado / Comprador", cor:"blue",
    titulo:"Validar Entrega e Registrar Serial na Saída",
    tela:"Inventário → Entregas → selecionar → Validar",
    link:`${BASE_ODOO}/odoo/inventory/delivery-orders`,
    serial:true,
    serialDetalhe:"🏷️ SERIAL REGISTRADO NA SAÍDA — Serial vinculado ao cliente e ao pedido",
    passos:[
      "Acesse Inventário → Entregas",
      "Abra a entrega pendente vinculada ao pedido de venda",
      "Verifique o cliente e o produto",
      "Clique no ícone de detalhe da linha do produto",
      "Selecione o Número de Série específico do equipamento que será entregue (ex: AXOCR-2FX-001)",
      "Confira fisicamente: o serial no equipamento deve ser igual ao selecionado no sistema",
      "Clique em Validar",
      "O sistema registra: AXOCR-2FX-001 saiu em [data] para [cliente] por [pedido X]",
      "Gere a Nota Fiscal vinculada à entrega",
    ],
    obs:"Para auditar qualquer produto entregue: Inventário → Rastreabilidade → busque pelo serial → histórico completo aparece.",
  },
];

function StepCard({passo, idx}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className={`oa-guia-step oa-guia-step-${passo.cor} ${aberto ? 'oa-guia-step--open' : ''}`}
         onClick={() => setAberto(!aberto)}>
      <div className="oa-guia-step-header">
        <div className={`oa-etapa-num oa-num-${passo.cor}`}>{passo.id}</div>
        <div style={{flex:1}}>
          <div className="oa-guia-step-titulo">{passo.titulo}</div>
          <div className="oa-guia-step-ator">
            <span className={`oa-badge oa-badge-${passo.ator.includes('Comprador') || passo.ator.includes('Almoxarifado') || passo.ator.includes('Comercial') ? 'Comprador' : passo.ator.includes('Operador') || passo.ator.includes('Engenharia') || passo.ator.includes('PCP') ? 'Operador' : 'Produção'}`}>{passo.ator}</span>
            {passo.serial && <span className="oa-serial-badge">🏷️ GERA SERIAL</span>}
          </div>
          <code style={{fontSize:11,color:'var(--text-muted)'}}>{passo.tela}</code>
        </div>
        <a href={passo.link} target="_blank" rel="noreferrer" className="oa-etapa-link"
           onClick={e=>e.stopPropagation()} style={{marginTop:0,padding:'5px 10px',fontSize:11}}>
          <ExternalLink size={11}/> Abrir no Odoo
        </a>
        <div className="oa-etapa-arrow" style={{marginTop:0}}>{aberto ? "▲" : "▼"}</div>
      </div>
      {aberto && (
        <div className="oa-guia-step-body">
          {passo.serial && (
            <div className="oa-serial-note" style={{marginBottom:12}}>
              <Hash size={13}/>{passo.serialDetalhe}
            </div>
          )}
          <div className="oa-guia-passo-list">
            {passo.passos.map((p,i) => (
              <div key={i} className="oa-guia-passo">
                <span className="oa-guia-passo-num">{i+1}</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          {passo.obs && (
            <div className="oa-info-box oa-info-blue" style={{marginTop:12}}>
              <Info size={14}/><div><strong>Atenção:</strong> {passo.obs}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabGuia() {
  return (
    <div className="oa-content">
      <OdooLinkBar/>
      <div className="oa-info-box oa-info-green">
        <CheckCircle size={16}/>
        <div>Guia operacional completo — cada passo com responsável, tela exata do Odoo e ação de serial. Clique em cada etapa para expandir as instruções detalhadas.</div>
      </div>
      <div className="oa-guia-audit-box">
        <h3>🔍 Como Auditar pelo Número de Serial (do insumo à entrega)</h3>
        <div className="oa-guia-audit-steps">
          <div className="oa-guia-audit-item">
            <span className="oa-guia-audit-num">1</span>
            <div><strong>Buscar o serial</strong><br/>Inventário → Rastreabilidade → busque o número de série (ex: AXOCR-2FX-001)</div>
          </div>
          <ArrowRight size={14} color="var(--text-muted)"/>
          <div className="oa-guia-audit-item">
            <span className="oa-guia-audit-num">2</span>
            <div><strong>Ver movimentos</strong><br/>O sistema mostra: quando entrou, onde ficou, quando saiu, para qual cliente</div>
          </div>
          <ArrowRight size={14} color="var(--text-muted)"/>
          <div className="oa-guia-audit-item">
            <span className="oa-guia-audit-num">3</span>
            <div><strong>Rastrear componentes</strong><br/>Na OP vinculada, veja quais seriais de insumos foram consumidos naquele produto</div>
          </div>
          <ArrowRight size={14} color="var(--text-muted)"/>
          <div className="oa-guia-audit-item">
            <span className="oa-guia-audit-num">4</span>
            <div><strong>Confirmar entrega</strong><br/>Na entrega, veja para qual cliente e quando o serial saiu do estoque</div>
          </div>
        </div>
        <a href={`${BASE_ODOO}/odoo/inventory/traceability`} target="_blank" rel="noreferrer" className="oa-etapa-link" style={{marginTop:12, display:'inline-flex'}}>
          <ExternalLink size={13}/> Abrir Rastreabilidade no Odoo
        </a>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {GUIA_PASSOS.map((p,i) => <StepCard key={p.id} passo={p} idx={i}/>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CENÁRIOS & TROCAS — 6 hipóteses de operação
   ══════════════════════════════════════════════════════════════ */
const HIPOTESES = [
  {
    id:1, icon:"📦", cor:"yellow",
    titulo:"Trocar Mercadoria Danificada (Insumo no Recebimento)",
    quem:"Almoxarifado + Comprador",
    quando:"No momento do recebimento — insumo chegou danificado do fornecedor",
    passos:[
      "NÃO valide o recebimento — mantenha o item como pendente",
      "Acesse Inventário → Recebimentos e abra o recebimento",
      "Na linha do produto danificado, reduza a quantidade recebida (ex: se vieram 5 e 1 está danificado, informe 4)",
      "Clique em Validar — somente os 4 itens bons entram no estoque com seus seriais",
      "Fotografe o item danificado e abra uma devolução: Compras → Pedido → Devolver",
      "Crie uma Devolution: registre o item danificado com o motivo 'Avaria no transporte'",
      "Aguarde o fornecedor enviar o substituto — repita o processo de recebimento para o item novo",
      "O serial do item novo é registrado na nova entrada",
    ],
    resultado:"O estoque reflete apenas itens em bom estado. O item danificado é devolvido ao fornecedor sem entrar no sistema.",
    odooLink:`${BASE_ODOO}/odoo/inventory/receipts`,
    odooLabel:"Inventário → Recebimentos",
  },
  {
    id:2, icon:"🔧", cor:"purple",
    titulo:"Trocar Produto Acabado Entregue ao Cliente (Garantia — após 1 ano)",
    quem:"Comercial + Comprador + Produção",
    quando:"Cliente solicita troca por defeito — produto já entregue há 1 ano",
    passos:[
      "Localize o serial original: Inventário → Rastreabilidade → busque o serial (ex: AXOCR-2FX-001)",
      "Confirme que o serial saiu para o cliente X na data Y",
      "Crie um Pedido de Devolução de Venda: Vendas → Pedido original → Devolver",
      "O cliente retorna o produto — crie um Recebimento de retorno",
      "No recebimento de retorno, o serial AXOCR-2FX-001 volta ao estoque com status 'A inspecionar'",
      "A equipe técnica inspeciona: reparável ou sucata?",
      "Se sucata: Inventário → Descartes → registre o descarte do serial AXOCR-2FX-001",
      "Produza um novo produto: crie nova Ordem de Produção com nova BOM",
      "Gere um novo serial (ex: AXOCR-2FX-047) para o produto substituto",
      "Crie nova Entrega para o cliente com o serial novo e nova NF",
    ],
    resultado:"Rastreabilidade completa: o serial antigo tem histórico de retorno e descarte. O novo serial vai para o cliente.",
    odooLink:`${BASE_ODOO}/odoo/inventory/traceability`,
    odooLabel:"Inventário → Rastreabilidade",
  },
  {
    id:3, icon:"🔄", cor:"blue",
    titulo:"Trocar Componente por Versão Melhor na Produção",
    quem:"Operador / Engenharia",
    quando:"Durante a produção ou revisão da BOM — melhor componente disponível",
    passos:[
      "Se a OP ainda não foi executada: acesse a Ordem de Produção",
      "Na aba Componentes, localize o componente a ser substituído",
      "Clique no componente e altere para o novo produto (ex: Camera v2 substituindo Camera v1)",
      "O serial do componente substituído permanece no estoque — não foi consumido",
      "O serial do novo componente é registrado no consumo da OP",
      "Se for mudança permanente: acesse a BOM e atualize a receita (crie nova versão da BOM)",
      "Arquive a versão anterior da BOM para manter o histórico",
      "Documente o motivo da substituição nos comentários da OP",
    ],
    resultado:"A OP registra o componente novo. A BOM nova versão garante que as próximas produções já usem o componente melhorado.",
    odooLink:`${BASE_ODOO}/odoo/manufacturing/bom`,
    odooLabel:"Fabricação → Listas de Materiais",
  },
  {
    id:4, icon:"⚠️", cor:"yellow",
    titulo:"Trocar Produto Acabado Danificado (no Estoque ou em Campo)",
    quem:"Comprador + Produção + Operador",
    quando:"Produto acabado foi danificado antes ou depois da entrega",
    passos:[
      "CASO A — Danificado no estoque (antes da entrega):",
      "  → Inventário → Descartes → Novo descarte",
      "  → Selecione o produto e o serial do danificado (ex: AXOCR-2FX-003)",
      "  → Motivo: Dano físico / queda / umidade (descreva)",
      "  → O serial AXOCR-2FX-003 é baixado do estoque como sucata",
      "  → Crie nova Ordem de Produção para repor o item",
      "  → Novo serial é gerado (ex: AXOCR-2FX-048)",
      "CASO B — Danificado em campo (após entrega):",
      "  → Localize o serial via Inventário → Rastreabilidade",
      "  → Crie pedido de retorno (Vendas → Devolver)",
      "  → Receba o produto de volta, registre como 'Avariado'",
      "  → Descarte ou reparo — se reparo, crie OP de reparo com nova BOM específica",
      "  → Entregue o produto reparado ou substituto com novo pedido",
    ],
    resultado:"O serial danificado fica com histórico de descarte. O estoque e as entregas ficam auditáveis.",
    odooLink:`${BASE_ODOO}/odoo/inventory`,
    odooLabel:"Inventário → Ajustes",
  },
  {
    id:5, icon:"🚧", cor:"green",
    titulo:"Produzir Item Faltando um Componente no Estoque",
    quem:"Operador / Produção",
    quando:"Ordem de Produção criada mas um componente está em falta",
    passos:[
      "Acesse a Ordem de Produção — na aba Componentes, o item em falta aparece em VERMELHO",
      "OPÇÃO 1 — Aguardar o estoque:",
      "  → Não inicie a produção; faça um Pedido de Compra urgente do item faltante",
      "  → Quando chegar, receba com serial e volte à OP para iniciar",
      "OPÇÃO 2 — Substituir o componente nesta OP:",
      "  → Na aba Componentes da OP, clique no item faltante",
      "  → Altere para um componente equivalente disponível em estoque",
      "  → Selecione o serial do substituto que será consumido",
      "  → Documente no campo Notas da OP o motivo da substituição",
      "OPÇÃO 3 — Usar Disponibilidade Imediata:",
      "  → Clique em Disponibilidade Imediata na OP",
      "  → Inicie a produção mesmo sem o item — o Odoo marcará o componente como pendente",
      "  → Adicione o componente fisicamente e registre no sistema quando chegar",
    ],
    resultado:"A produção não é bloqueada completamente. O histórico da OP registra a substituição ou pendência para auditoria.",
    odooLink:`${BASE_ODOO}/odoo/manufacturing`,
    odooLabel:"Fabricação → Ordens de Produção",
  },
  {
    id:6, icon:"📊", cor:"blue",
    titulo:"Análise Comparativa — Todos os Cenários",
    quem:"Gestão / Auditoria",
    quando:"Referência rápida para decisão em cada situação",
    isTabela:true,
    linhas:[
      {sit:"Insumo chegou danificado",   resp:"Almoxarifado",    acao:"Não validar recebimento → Devolver fornecedor",           serial:"Serial nunca entra no sistema",               prazo:"Imediato"},
      {sit:"Produto acabado — garantia 1 ano", resp:"Comercial", acao:"Devolução de venda → Retorno → Descarte → Nova OP",       serial:"Serial antigo descartado, novo serial emitido", prazo:"3-5 dias"},
      {sit:"Substituir componente (melhor)", resp:"Operador",    acao:"Alterar componente na OP → Atualizar BOM → Nova versão",  serial:"Serial do componente novo registrado",           prazo:"Imediato na OP"},
      {sit:"Produto danificado no estoque", resp:"Comprador",    acao:"Descarte do serial → Nova OP → Novo serial",              serial:"Serial baixado como sucata",                    prazo:"1-2 dias"},
      {sit:"Falta componente na produção",  resp:"Produção",     acao:"Compra urgente OU Substituição OU Disp. Imediata",        serial:"Serial do substituto ou pendência registrada",  prazo:"Depende da opção"},
    ],
  },
];

function HipoteseCard({h}) {
  const [aberto, setAberto] = useState(false);
  const corMap = {yellow:"oa-card-yellow", purple:"oa-card-purple", blue:"oa-card-blue", green:"oa-card-green"};
  const corBorder = {yellow:"#d97706", purple:"#7c3aed", blue:"#2563eb", green:"#059669"};
  return (
    <div className={`oa-card ${corMap[h.cor]}`} style={{cursor:'pointer',marginBottom:0}} onClick={()=>setAberto(!aberto)}>
      <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
        <span style={{fontSize:28,lineHeight:1}}>{h.icon}</span>
        <div style={{flex:1}}>
          <h3 style={{marginBottom:4}}>{h.titulo}</h3>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
            <span style={{fontSize:11,background:'var(--table-row-hover)',padding:'2px 8px',borderRadius:12,color:'var(--text-muted)'}}>👤 {h.quem}</span>
            <span style={{fontSize:11,background:'var(--table-row-hover)',padding:'2px 8px',borderRadius:12,color:'var(--text-muted)'}}>⏰ {h.quando}</span>
          </div>
        </div>
        <span style={{color:'var(--text-muted)',fontSize:12}}>{aberto ? "▲" : "▼"}</span>
      </div>
      {aberto && !h.isTabela && (
        <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
          <div className="oa-guia-passo-list">
            {h.passos.map((p,i) => (
              <div key={i} className={`oa-guia-passo ${p.startsWith('  →') ? 'oa-guia-passo-sub' : ''}`}>
                {!p.startsWith('  →') && <span className="oa-guia-passo-num">{i+1}</span>}
                <span>{p.startsWith('  →') ? p : p}</span>
              </div>
            ))}
          </div>
          <div className="oa-info-box oa-info-green" style={{marginTop:12}}>
            <CheckCircle size={14}/><div><strong>Resultado esperado:</strong> {h.resultado}</div>
          </div>
          <a href={h.odooLink} target="_blank" rel="noreferrer" className="oa-etapa-link"
             onClick={e=>e.stopPropagation()} style={{marginTop:12,display:'inline-flex'}}>
            <ExternalLink size={13}/> {h.odooLabel}
          </a>
        </div>
      )}
      {aberto && h.isTabela && (
        <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
          <div className="oa-table-wrap">
            <table className="oa-table">
              <thead>
                <tr><th>Situação</th><th>Responsável</th><th>Ação no Odoo</th><th>Serial</th><th>Prazo</th></tr>
              </thead>
              <tbody>
                {h.linhas.map((l,i)=>(
                  <tr key={i}>
                    <td><strong>{l.sit}</strong></td>
                    <td>{l.resp}</td>
                    <td>{l.acao}</td>
                    <td><span style={{fontSize:11,color:'#9a3412',background:'#fed7aa',padding:'2px 8px',borderRadius:12}}>{l.serial}</span></td>
                    <td>{l.prazo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TabHipoteses() {
  return (
    <div className="oa-content">
      <OdooLinkBar/>
      <div className="oa-info-box oa-info-yellow">
        <AlertTriangle size={16}/>
        <div>Clique em cada cenário para ver o passo a passo completo com as telas do Odoo e o que acontece com o número de serial em cada situação.</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {HIPOTESES.map(h => <HipoteseCard key={h.id} h={h}/>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CHÃO DE FÁBRICA & COMBO
   ══════════════════════════════════════════════════════════════ */
function TabChaoFabrica() {
  const [secao, setSecao] = useState("chao");
  const BASE = BASE_ODOO;

  const DECISAO = [
    {
      situacao: "Vender um conjunto de peças SEM montar",
      usar: "COMBO (Kit)",
      cor: "purple",
      exemplo: "Vender: 1 Camera + 1 Iluminador + 1 Roteador como 'Kit Campo'",
      serial: "❌ Sem serial de produto final — cada peça pode ter seu serial individual",
      producao: "❌ Não entra no Chão de Fábrica",
      regra: "Use Kit quando o cliente recebe as peças separadas e monta em campo"
    },
    {
      situacao: "Vender um equipamento montado/fabricado",
      usar: "PRODUZIR (BOM Fabricar)",
      cor: "green",
      exemplo: "Fabricar: AXOCR 2 Faixas 4G (1 equipamento montado com serial próprio)",
      serial: "✅ Serial do produto final gerado na conclusão da OP",
      producao: "✅ Passa pelo Chão de Fábrica (montagem, testes, QC)",
      regra: "Use Produção quando o resultado é um produto físico único e rastreável"
    },
    {
      situacao: "Vender serviço ou produto simples sem transformação",
      usar: "PRODUTO ARMAZENÁVEL + SERIAL",
      cor: "blue",
      exemplo: "Vender: Camera Hikvision TCM403 avulsa com serial do fabricante",
      serial: "✅ Serial do fabricante registrado no recebimento",
      producao: "❌ Não precisa de produção — vai direto do estoque para entrega",
      regra: "Use serial simples para produtos que chegam prontos do fornecedor"
    },
  ];

  return (
    <div className="oa-content">
      <OdooLinkBar/>

      {/* Seletor de seção */}
      <div className="oa-chao-nav">
        {[
          {id:"chao", label:"🏗️ Chão de Fábrica"},
          {id:"combo", label:"🎁 Combo & Kit"},
          {id:"decisao", label:"🧭 Quando Usar Cada Um"},
        ].map(s => (
          <button key={s.id}
            className={`oa-chao-btn ${secao===s.id ? "oa-chao-btn--ativo" : ""}`}
            onClick={()=>setSecao(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ═══ CHÃO DE FÁBRICA ═══ */}
      {secao === "chao" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-blue">
            <Info size={16}/>
            <div>O <strong>Chão de Fábrica</strong> (Shop Floor) é a interface do Odoo usada pelos <strong>operadores da produção</strong> para executar e registrar o trabalho físico de montagem. É diferente do painel do PCP/Operador — é para quem está na bancada.</div>
          </div>

          <div className="oa-section">
            <h3>🏗️ O que é o Chão de Fábrica no Odoo</h3>
            <div className="oa-cards-grid">
              <div className="oa-card oa-card-blue">
                <h4>Como Acessar</h4>
                <div className="oa-card-path">Fabricação → Chão de Fábrica</div>
                <p>Interface simplificada para o operador físico. Mostra somente o que ele precisa executar. Otimizada para tablets e telas touch na linha de produção.</p>
                <ul>
                  <li>Não requer treinamento avançado</li>
                  <li>Suporte a leitor de código de barras</li>
                  <li>Interface tablet-friendly</li>
                  <li>Modo offline disponível</li>
                </ul>
                <a href={`${BASE}/odoo/manufacturing`} target="_blank" rel="noreferrer" className="oa-etapa-link" style={{marginTop:10,display:"inline-flex"}}>
                  <ExternalLink size={12}/> Abrir Fabricação
                </a>
              </div>
              <div className="oa-card oa-card-purple">
                <h4>O que o Operador Vê</h4>
                <div className="oa-card-path">Shop Floor — Visão do Operador</div>
                <p>Cada operador vê somente as ordens de trabalho atribuídas ao seu <strong>Centro de Trabalho</strong>:</p>
                <ul>
                  <li>Nome do produto a montar</li>
                  <li>Etapas de trabalho (operações)</li>
                  <li>Componentes necessários e seus seriais</li>
                  <li>Instruções de montagem (se configuradas)</li>
                  <li>Checklist de qualidade (QC)</li>
                  <li>Botão para marcar como concluído</li>
                </ul>
              </div>
              <div className="oa-card oa-card-green">
                <h4>Centros de Trabalho</h4>
                <div className="oa-card-path">Fabricação → Config → Centros de Trabalho</div>
                <p>Cada etapa da produção é atribuída a um <strong>Centro de Trabalho</strong>:</p>
                <ul>
                  <li><strong>Ex: MONTAGEM</strong> — bancada de montagem dos equipamentos</li>
                  <li><strong>Ex: TESTES</strong> — bancada de testes e configuração</li>
                  <li><strong>Ex: EMBALAGEM</strong> — finalização e empacotamento</li>
                  <li>Cada centro tem capacidade, tempo padrão e operadores responsáveis</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="oa-section">
            <h3>📋 Fluxo do Chão de Fábrica — Passo a Passo do Operador</h3>
            <div className="oa-guia-passo-list">
              {[
                ["Acesse o Chão de Fábrica no tablet/computador: Fabricação → Chão de Fábrica"],
                ["Selecione seu Centro de Trabalho (ex: MONTAGEM)"],
                ["A lista de Ordens de Trabalho pendentes aparece — clique em Iniciar"],
                ["O sistema registra o horário de início automaticamente"],
                ["Siga as instruções na tela para cada etapa de montagem"],
                ["Para cada componente com serial, escaneie o código de barras ou digite manualmente"],
                ["Se houver checklist de qualidade, responda cada item (Aprovado/Reprovado)"],
                ["Se uma etapa falhar na qualidade, registre o defeito — o sistema cria um alerta"],
                ["Ao finalizar a montagem, clique em Concluir"],
                ["Informe o Número de Série do produto final produzido (SERIAL 2)"],
                ["O sistema move automaticamente a OP para o próximo Centro de Trabalho (ex: TESTES)"],
                ["Repita o processo no centro de TESTES até a OP ser totalmente concluída"],
              ].map((p,i) => (
                <div key={i} className="oa-guia-passo">
                  <span className="oa-guia-passo-num">{i+1}</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="oa-section">
            <h3>📊 Diferença: Chão de Fábrica vs Ordem de Produção (Back-Office)</h3>
            <div className="oa-table-wrap">
              <table className="oa-table">
                <thead>
                  <tr><th>Aspecto</th><th>Chão de Fábrica (Shop Floor)</th><th>Ordem de Produção (Back-Office)</th></tr>
                </thead>
                <tbody>
                  <tr><td>Quem usa</td><td>Operador físico na bancada</td><td>PCP / Operador administrativo</td></tr>
                  <tr><td>Objetivo</td><td>Executar e registrar a produção física</td><td>Planejar, criar e monitorar OPs</td></tr>
                  <tr><td>Interface</td><td>Simplificada, touch-friendly</td><td>Completa, com todos os campos</td></tr>
                  <tr><td>Seriais</td><td>Escaneados em tempo real durante montagem</td><td>Visualizados e gerenciados pelo PCP</td></tr>
                  <tr><td>Acesso</td><td>Fabricação → Chão de Fábrica</td><td>Fabricação → Ordens de Produção</td></tr>
                  <tr><td>Bloqueio de produção</td><td>Pode bloquear se QC reprovado</td><td>Pode bloquear se falta estoque</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="oa-section">
            <h3>⚙️ Como Configurar o Chão de Fábrica para Axion</h3>
            <div className="oa-config-list">
              {[
                {m:"Fabricação → Configuração → Definições", c:"Ativar 'Ordens de Trabalho' e 'Chão de Fábrica'"},
                {m:"Fabricação → Config → Centros de Trabalho → Novo", c:"Criar: MONTAGEM, TESTES, EMBALAGEM"},
                {m:"BOM → Aba Operações → Nova Operação", c:"Adicionar: Montar Equipamento (30min) → Centro: MONTAGEM"},
                {m:"BOM → Aba Operações → Nova Operação", c:"Adicionar: Testar e Configurar (20min) → Centro: TESTES"},
                {m:"BOM → Aba Operações → Nova Operação", c:"Adicionar: Embalar e Etiquetar (10min) → Centro: EMBALAGEM"},
                {m:"Fabricação → Chão de Fábrica", c:"Acesso do operador — apenas vê suas OTs pendentes"},
              ].map(({m,c}) => (
                <div key={m} className="oa-config-item">
                  <Settings size={14}/>
                  <div><code>{m}</code><span>{c}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ COMBO & KIT ═══ */}
      {secao === "combo" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-blue">
            <Info size={16}/>
            <div>No Odoo, o <strong>Combo</strong> (ou <strong>Kit</strong>) é uma BOM do tipo "Kit" — você vende um conjunto de produtos mas entrega as peças separadas, <strong>sem fabricar um produto novo</strong>. É diferente da produção.</div>
          </div>

          <div className="oa-section">
            <h3>🎁 O que é um Combo/Kit no Odoo</h3>
            <div className="oa-cards-grid">
              <div className="oa-card oa-card-purple">
                <h4>Definição</h4>
                <div className="oa-card-path">Fabricação → Listas de Materiais → Tipo: Kit</div>
                <p>Um Kit é um produto "virtual" formado por componentes. Quando vendido, o sistema <strong>explode automaticamente</strong> na entrega — entregando cada componente separado.</p>
                <ul>
                  <li>Aparece como 1 item no pedido de venda</li>
                  <li>Na entrega, vira N itens (os componentes)</li>
                  <li>Não cria Ordem de Produção</li>
                  <li>Não gera serial de produto final</li>
                  <li>Preço = soma dos componentes (configurável)</li>
                </ul>
              </div>
              <div className="oa-card oa-card-blue">
                <h4>Como Criar um Combo/Kit</h4>
                <div className="oa-card-path">Fabricação → Listas de Materiais → Novo</div>
                <div className="oa-guia-passo-list" style={{marginTop:8}}>
                  {[
                    "Crie um produto chamado 'KIT CAMPO AXION'",
                    "Tipo do produto: Armazenável ou Serviço",
                    "Em Fabricação → Listas de Materiais → Novo",
                    "Produto: KIT CAMPO AXION",
                    "Tipo de BOM: Kit",
                    "Adicione os componentes: Camera + Iluminador + Roteador",
                    "Salve — ao vender e entregar, o kit vira as 3 peças",
                  ].map((p,i) => (
                    <div key={i} className="oa-guia-passo" style={{padding:"5px 10px"}}>
                      <span className="oa-guia-passo-num">{i+1}</span><span style={{fontSize:12}}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="oa-card oa-card-yellow">
                <h4>⚠️ Atenção ao usar Kit</h4>
                <div className="oa-card-path">Diferenças importantes</div>
                <ul>
                  <li><strong>Serial:</strong> Cada componente mantém seu próprio serial, mas não há serial "do kit"</li>
                  <li><strong>Estoque:</strong> O kit não existe fisicamente — os componentes estão no estoque separados</li>
                  <li><strong>Relatório:</strong> O kit aparece nas vendas, mas o movimento de estoque é das peças</li>
                  <li><strong>NF:</strong> A NF pode ser emitida pelo kit ou pelos componentes (verificar regra fiscal)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="oa-section">
            <h3>🔄 Exemplo Prático: Kit vs Produção</h3>
            <div className="oa-table-wrap">
              <table className="oa-table">
                <thead>
                  <tr><th></th><th>Kit "Kit Campo Axion"</th><th>Produção "AXOCR 2 Faixas"</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>O que o cliente recebe</strong></td><td>Camera + Iluminador + Roteador separados</td><td>1 equipamento AXOCR montado e testado</td></tr>
                  <tr><td><strong>Serial</strong></td><td>Serial da Camera + Serial do Iluminador + Serial do Roteador</td><td>1 serial único do AXOCR (ex: AXOCR-001)</td></tr>
                  <tr><td><strong>Montagem</strong></td><td>❌ O cliente monta em campo</td><td>✅ Axion monta e testa antes de enviar</td></tr>
                  <tr><td><strong>Chão de Fábrica</strong></td><td>❌ Não passa pelo chão de fábrica</td><td>✅ Passa por Montagem → Testes → Embalagem</td></tr>
                  <tr><td><strong>Garantia</strong></td><td>Garantia individual de cada peça</td><td>Garantia do produto AXOCR completo</td></tr>
                  <tr><td><strong>Quando usar</strong></td><td>Fornecimento de peças para o cliente instalar</td><td>Entrega de equipamento pronto e homologado</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ QUANDO USAR CADA UM ═══ */}
      {secao === "decisao" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-green">
            <CheckCircle size={16}/>
            <div>Use este guia de decisão para saber <strong>exatamente quando</strong> usar Combo (Kit), Serial simples ou Produção completa com Chão de Fábrica.</div>
          </div>

          <div className="oa-section">
            <h3>🧭 Guia de Decisão Rápida</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {DECISAO.map((d,i) => (
                <div key={i} className={`oa-card oa-card-${d.cor}`} style={{borderLeft:`4px solid ${d.cor==="purple"?"#7c3aed":d.cor==="green"?"#059669":"#2563eb"}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                    <div style={{
                      minWidth:36,height:36,borderRadius:"50%",
                      background:d.cor==="purple"?"#7c3aed":d.cor==="green"?"#059669":"#2563eb",
                      color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
                      fontWeight:800,fontSize:16,flexShrink:0
                    }}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:6}}>{d.situacao}</div>
                      <div style={{
                        display:"inline-block",padding:"3px 12px",borderRadius:20,
                        background:d.cor==="purple"?"#ede9fe":d.cor==="green"?"#d1fae5":"#dbeafe",
                        color:d.cor==="purple"?"#6d28d9":d.cor==="green"?"#047857":"#1d4ed8",
                        fontWeight:700,fontSize:13,marginBottom:10
                      }}>→ USAR: {d.usar}</div>
                      <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:6,fontStyle:"italic"}}>{d.exemplo}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        <div style={{fontSize:12,background:"var(--table-row-hover)",padding:"5px 10px",borderRadius:6}}>
                          🏷️ <strong>Serial:</strong> {d.serial}
                        </div>
                        <div style={{fontSize:12,background:"var(--table-row-hover)",padding:"5px 10px",borderRadius:6}}>
                          🏗️ <strong>Chão de Fábrica:</strong> {d.producao}
                        </div>
                        <div style={{fontSize:12,background:d.cor==="purple"?"#ede9fe":d.cor==="green"?"#d1fae5":"#dbeafe",padding:"6px 10px",borderRadius:6,fontWeight:600,
                          color:d.cor==="purple"?"#6d28d9":d.cor==="green"?"#047857":"#1d4ed8"}}>
                          💡 Regra: {d.regra}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="oa-section">
            <h3>📊 Tabela Comparativa Completa</h3>
            <div className="oa-table-wrap">
              <table className="oa-table">
                <thead>
                  <tr><th>Critério</th><th>🎁 Combo/Kit</th><th>🏷️ Serial Simples</th><th>🏭 Produção + Chão</th></tr>
                </thead>
                <tbody>
                  <tr><td>Precisa montar?</td><td>❌ Não</td><td>❌ Não</td><td>✅ Sim</td></tr>
                  <tr><td>Cria serial único?</td><td>❌ Não (peças têm serial)</td><td>✅ Serial do fornecedor</td><td>✅ Serial da produção</td></tr>
                  <tr><td>Passa pelo Chão de Fábrica?</td><td>❌ Não</td><td>❌ Não</td><td>✅ Sim</td></tr>
                  <tr><td>Usa BOM?</td><td>✅ BOM tipo Kit</td><td>❌ Sem BOM</td><td>✅ BOM tipo Fabricar</td></tr>
                  <tr><td>Origem do estoque</td><td>Componentes separados</td><td>Recebimento do fornecedor</td><td>Produção interna</td></tr>
                  <tr><td>Rastreabilidade</td><td>Por componente</td><td>Por unidade recebida</td><td>Por produto acabado + componentes</td></tr>
                  <tr><td>Caso Axion</td><td>Kit de peças para manutenção</td><td>Camera avulsa p/ revenda</td><td>AXOCR equipamento completo</td></tr>
                  <tr><td>Custo</td><td>Soma das peças</td><td>Custo do fornecedor</td><td>Custo de insumos + MO + overhead</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="oa-section">
            <h3>🔑 Regras de Ouro — Decisão Rápida</h3>
            <div className="oa-guia-passo-list">
              {[
                "Se o cliente vai receber peças SEPARADAS para montar em campo → use KIT/COMBO",
                "Se o produto chega PRONTO do fornecedor (sem montagem sua) → use PRODUTO SIMPLES + SERIAL do fabricante",
                "Se você vai MONTAR/FABRICAR o produto internamente → use PRODUÇÃO + CHÃO DE FÁBRICA",
                "Se precisa de rastreabilidade completa (serial → componentes) → sempre use PRODUÇÃO",
                "Se é um conjunto de reposição (peça + parafuso + cabo) → use KIT",
                "Se é o equipamento principal entregue ao cliente (AXOCR) → use PRODUÇÃO sempre",
                "Dúvida: o produto tem número de série PRÓPRIO da Axion? → PRODUÇÃO. Tem serial do fabricante? → SERIAL SIMPLES. Não tem serial único? → KIT",
              ].map((p,i) => (
                <div key={i} className="oa-guia-passo">
                  <span className="oa-guia-passo-num">{i+1}</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAPA COMPLETO DE PROCESSOS
   ══════════════════════════════════════════════════════════════ */
const SEGMENTOS = [
  {
    id:"entrada", icon:"📥", titulo:"Entrada de Mercadoria",
    cor:"blue", corHex:"#2563eb",
    responsavel:"Almoxarifado + Comprador",
    odooTela:"Inventário → Recebimentos",
    odooLink:`${BASE_ODOO}/odoo/inventory/receipts`,
    descricao:"Recebimento físico e registro no sistema de todos os insumos comprados. Ponto 1 de geração de serial.",
    subetapas:[
      {n:"1.1", quem:"Comprador", acao:"Confirmar Pedido de Compra", tela:"Compras → Pedido → Confirmar", serial:false, dep:[]},
      {n:"1.2", quem:"Almoxarifado", acao:"Receber fisicamente a mercadoria e conferir NF", tela:"Físico + NF", serial:false, dep:["1.1"]},
      {n:"1.3", quem:"Almoxarifado", acao:"Abrir Recebimento no Odoo e validar quantidades", tela:"Inventário → Recebimentos", serial:false, dep:["1.2"]},
      {n:"1.4", quem:"Almoxarifado", acao:"Registrar serial de cada unidade recebida 🏷️", tela:"Recebimento → detalhe da linha", serial:true, dep:["1.3"]},
      {n:"1.5", quem:"Almoxarifado", acao:"Validar recebimento → insumo entra no estoque", tela:"Recebimento → Validar", serial:false, dep:["1.4"]},
      {n:"1.6", quem:"Almoxarifado", acao:"Guardar no local correto (ex: B&B/ESTOQUE)", tela:"Físico", serial:false, dep:["1.5"]},
    ],
    alertas:["Se chegar danificado: NÃO validar. Devolver ao fornecedor sem entrar no sistema","Verificar se o serial físico bate com a etiqueta antes de confirmar"],
  },
  {
    id:"separacao", icon:"📦", titulo:"Separação de Mercadorias",
    cor:"purple", corHex:"#7c3aed",
    responsavel:"Almoxarifado + Operador PCP",
    odooTela:"Inventário → Transferências internas",
    odooLink:`${BASE_ODOO}/odoo/inventory`,
    descricao:"Separação dos componentes necessários para a produção. Reserva e movimentação interna dos materiais.",
    subetapas:[
      {n:"2.1", quem:"PCP / Operador", acao:"Criar Ordem de Produção e verificar disponibilidade", tela:"Fabricação → Nova OP", serial:false, dep:["1.5"]},
      {n:"2.2", quem:"Sistema Odoo", acao:"Reservar automaticamente os componentes do estoque", tela:"OP → Confirmar", serial:false, dep:["2.1"]},
      {n:"2.3", quem:"Almoxarifado", acao:"Separar fisicamente os itens reservados (picking)", tela:"Inventário → Transferências / OP → Componentes", serial:false, dep:["2.2"]},
      {n:"2.4", quem:"Almoxarifado", acao:"Conferir seriais dos componentes a serem usados", tela:"OP → aba Componentes → detalhe", serial:true, dep:["2.3"]},
      {n:"2.5", quem:"Almoxarifado", acao:"Entregar os itens separados para o Chão de Fábrica", tela:"Físico", serial:false, dep:["2.4"]},
    ],
    alertas:["Se faltar algum item: verificar Cenário 5 (item faltando) antes de iniciar produção","Registrar serial de cada componente separado para rastreabilidade"],
  },
  {
    id:"producao", icon:"🏭", titulo:"Produção (Chão de Fábrica)",
    cor:"green", corHex:"#059669",
    responsavel:"Produção + Chão de Fábrica",
    odooTela:"Fabricação → Ordens de Produção → Chão de Fábrica",
    odooLink:`${BASE_ODOO}/odoo/manufacturing`,
    descricao:"Execução física da montagem do equipamento. Registro de consumo de componentes com seriais e controle de qualidade.",
    subetapas:[
      {n:"3.1", quem:"Operador Fábrica", acao:"Acessar Chão de Fábrica e iniciar Ordem de Trabalho", tela:"Fabricação → Chão de Fábrica", serial:false, dep:["2.5"]},
      {n:"3.2", quem:"Operador Fábrica", acao:"Montar equipamento conforme instruções da BOM", tela:"Chão de Fábrica → Operação MONTAGEM", serial:false, dep:["3.1"]},
      {n:"3.3", quem:"Operador Fábrica", acao:"Registrar serial de cada componente consumido na montagem 🏷️", tela:"OP → Componentes → detalhe do serial", serial:true, dep:["3.2"]},
      {n:"3.4", quem:"Operador Fábrica", acao:"Executar testes e configurar o equipamento", tela:"Chão de Fábrica → Operação TESTES", serial:false, dep:["3.2"]},
      {n:"3.5", quem:"Qualidade / Operador", acao:"Checklist de qualidade (QC) — aprovar ou reprovar", tela:"Fabricação → Qualidade / Chão de Fábrica", serial:false, dep:["3.4"]},
      {n:"3.6", quem:"Operador Fábrica", acao:"Marcar OP como Feita e registrar serial do produto final 🏷️", tela:"Fabricação → OP → Marcar como Feito", serial:true, dep:["3.5"]},
      {n:"3.7", quem:"Sistema Odoo", acao:"Produto final entra no estoque com serial vinculado", tela:"Automático", serial:false, dep:["3.6"]},
    ],
    alertas:["SERIAL 2 gerado aqui: serial do produto acabado vincula todos os componentes usados","Se QC reprovar: não fechar a OP — registrar defeito e corrigir antes de concluir"],
  },
  {
    id:"combo", icon:"🎁", titulo:"Combo / Kit (Venda sem Fabricação)",
    cor:"yellow", corHex:"#d97706",
    responsavel:"Comercial + Almoxarifado",
    odooTela:"Vendas → Pedido → Confirmar → Inventário → Entregas",
    odooLink:`${BASE_ODOO}/odoo/sales`,
    descricao:"Processo alternativo à produção. Venda de um conjunto de peças que são entregues separadas, sem montagem interna.",
    subetapas:[
      {n:"4.1", quem:"Comercial", acao:"Criar Pedido de Venda com produto Kit/Combo", tela:"Vendas → Pedido → Novo", serial:false, dep:[]},
      {n:"4.2", quem:"Sistema Odoo", acao:"Ao confirmar, explodir o Kit nas peças componentes", tela:"Automático — BOM tipo Kit", serial:false, dep:["4.1"]},
      {n:"4.3", quem:"Almoxarifado", acao:"Separar fisicamente cada componente do kit", tela:"Inventário → Entregas", serial:false, dep:["4.2"]},
      {n:"4.4", quem:"Almoxarifado", acao:"Registrar serial de cada peça separada (se aplicável) 🏷️", tela:"Entrega → detalhe da linha", serial:true, dep:["4.3"]},
      {n:"4.5", quem:"Almoxarifado", acao:"Validar Entrega — peças saem do estoque", tela:"Inventário → Entregas → Validar", serial:false, dep:["4.4"]},
    ],
    alertas:["Kit NÃO gera serial próprio — cada componente mantém seu serial individual","Não confundir Kit com Produção: Kit entrega peças, Produção entrega produto montado"],
  },
  {
    id:"finalizacao", icon:"✅", titulo:"Finalização do Produto Final",
    cor:"blue", corHex:"#2563eb",
    responsavel:"Almoxarifado + Comercial + Comprador",
    odooTela:"Inventário → Entregas → Validar",
    odooLink:`${BASE_ODOO}/odoo/inventory/delivery-orders`,
    descricao:"Preparação final, embalagem, geração de documentos e entrega ao cliente. Ponto 3 do serial — saída do estoque.",
    subetapas:[
      {n:"5.1", quem:"Comercial", acao:"Confirmar Pedido de Venda com produto acabado", tela:"Vendas → Pedido → Confirmar", serial:false, dep:["3.7"]},
      {n:"5.2", quem:"Sistema Odoo", acao:"Criar Ordem de Entrega automaticamente", tela:"Automático → Inventário → Entregas", serial:false, dep:["5.1"]},
      {n:"5.3", quem:"Almoxarifado", acao:"Empacotar o equipamento e afixar etiqueta com serial", tela:"Físico + Chão de Fábrica (EMBALAGEM)", serial:false, dep:["5.2"]},
      {n:"5.4", quem:"Almoxarifado", acao:"Abrir Entrega e selecionar serial específico para envio 🏷️", tela:"Inventário → Entregas → detalhe da linha", serial:true, dep:["5.3"]},
      {n:"5.5", quem:"Almoxarifado", acao:"Validar Entrega — serial vinculado ao cliente e pedido", tela:"Inventário → Entregas → Validar", serial:false, dep:["5.4"]},
      {n:"5.6", quem:"Comercial / Comprador", acao:"Emitir Nota Fiscal vinculada à entrega", tela:"Inventário → Entrega → Criar NF", serial:false, dep:["5.5"]},
      {n:"5.7", quem:"Comprador", acao:"Registrar Rastreabilidade final para auditoria", tela:"Inventário → Rastreabilidade → buscar serial", serial:false, dep:["5.5"]},
    ],
    alertas:["SERIAL 3 registrado aqui: serial do produto vinculado ao cliente e pedido de venda","Jamais validar entrega sem selecionar o serial — impossível rastrear depois"],
  },
  {
    id:"locacao", icon:"🔑", titulo:"Locação (Aluguel de Equipamento)",
    cor:"purple", corHex:"#7c3aed",
    responsavel:"Comercial + Almoxarifado + Comprador",
    odooTela:"Vendas → Pedido de Locação (módulo Rental) → Inventário",
    odooLink:`${BASE_ODOO}/odoo/rental`,
    descricao:"Empréstimo ou locação de equipamento ao cliente com data de retorno definida. O serial sai do estoque, vai ao cliente e VOLTA ao estoque após o período contratado.",
    subetapas:[
      {n:"6.1", quem:"Comercial", acao:"Criar Pedido de Locação no Odoo (módulo Rental)", tela:"Vendas → Locações → Novo", serial:false, dep:[]},
      {n:"6.2", quem:"Comercial", acao:"Definir produto locado, período (data início/fim) e valor", tela:"Locação → campos principais", serial:false, dep:["6.1"]},
      {n:"6.3", quem:"Sistema Odoo", acao:"Reservar o equipamento no estoque para a data de início", tela:"Automático — verificar disponibilidade", serial:false, dep:["6.2"]},
      {n:"6.4", quem:"Almoxarifado", acao:"Preparar e verificar o equipamento antes de enviar", tela:"Físico + laudo de vistoria", serial:false, dep:["6.3"]},
      {n:"6.5", quem:"Almoxarifado", acao:"Confirmar saída — selecionar serial do equipamento 🏷️", tela:"Locação → Confirmar Retirada → serial", serial:true, dep:["6.4"]},
      {n:"6.6", quem:"Sistema Odoo", acao:"Serial sai do estoque vinculado ao contrato de locação", tela:"Automático → movimentação de estoque", serial:false, dep:["6.5"]},
      {n:"6.7", quem:"Comercial", acao:"Monitorar data de retorno — alertas automáticos do Odoo", tela:"Locações → Painel de controle", serial:false, dep:["6.6"]},
      {n:"6.8", quem:"Almoxarifado", acao:"Receber o equipamento de volta do cliente", tela:"Locação → Confirmar Devolução", serial:false, dep:["6.7"]},
      {n:"6.9", quem:"Almoxarifado", acao:"Inspecionar o equipamento — registrar condição de retorno 🏷️", tela:"Físico + laudo + rastreabilidade do serial", serial:true, dep:["6.8"]},
      {n:"6.10", quem:"Sistema Odoo", acao:"Serial volta ao estoque com histórico de locação completo", tela:"Automático → estoque restaurado", serial:false, dep:["6.9"]},
      {n:"6.11", quem:"Comercial", acao:"Faturar: aluguel + multas por danos (se houver)", tela:"Locação → Gerar Fatura", serial:false, dep:["6.10"]},
    ],
    alertas:[
      "SERIAL rastreado durante toda a locação: saída → uso cliente → retorno",
      "Se equipamento retornar danificado: registrar no laudo + abrir OS de reparo ANTES de recolocar no estoque",
      "Configurar alertas de vencimento de contrato (Odoo envia e-mail automático)",
      "Diferença de venda: na locação o serial VOLTA para o estoque; na venda não volta",
    ],
  },
];

const BOM_DINAMICA = [
  {
    metodo:"Versão de BOM (Permanente)",
    quando:"A matéria-prima mudou definitivamente para todas as produções futuras",
    como:[
      "Acesse Fabricação → Listas de Materiais → abra a BOM atual",
      "Clique em Novo (criar nova versão) OU duplique a BOM",
      "Altere o componente: remova 'Cabo Paralelo 2x1,5mm' e adicione 'Cabo PP 2x2,5mm'",
      "Salve a nova versão",
      "Archive a versão anterior (botão Arquivar na BOM antiga)",
      "Todas as novas Ordens de Produção usarão automaticamente a nova BOM",
    ],
    resultado:"Histórico preservado: OPs antigas referem a BOM v1, OPs novas referem BOM v2",
    pros:["Histórico completo de versões","Rastreabilidade qual BOM foi usada em cada OP","Produção futura já usa o componente novo automaticamente"],
    contras:["Requer criar nova versão formalmente","OPs já criadas com BOM antiga não atualizam automaticamente"],
    icone:"📋",
  },
  {
    metodo:"Substituição Pontual na OP (Temporária)",
    quando:"Somente ESTA produção específica usará o componente diferente — próxima volta ao normal",
    como:[
      "Abra a Ordem de Produção específica",
      "Clique na aba Componentes",
      "Localize o item a substituir (ex: Cabo Paralelo 2x1,5mm)",
      "Clique na linha → altere o Produto para o substituto (ex: Cabo PP 2x2,5mm)",
      "Defina a quantidade necessária do substituto",
      "Adicione uma nota no campo Notas da OP: 'Substituído por falta do padrão — ref. NF XXX'",
      "Prossiga com a produção normalmente",
    ],
    resultado:"A BOM original NÃO é alterada. Somente esta OP usa o componente diferente",
    pros:["BOM principal não é alterada","Flexível para mudanças pontuais","Rápido de executar"],
    contras:["Cada OP deve ser alterada manualmente","Histórico fica na OP (não na BOM)","Requires disciplina nas notas de justificativa"],
    icone:"🔄",
  },
  {
    metodo:"Componente Alternativo (Configuração Avançada)",
    quando:"O componente tem substituto aceito e ambos podem ser usados indistintamente",
    como:[
      "Acesse Fabricação → Config → Definições → Ativar 'Roteiros e Rotas'",
      "Na BOM, clique no componente (ex: Cabo Paralelo 2x1,5mm)",
      "Clique em Adicionar alternativa → selecione o substituto (Cabo PP 2x2,5mm)",
      "Define se o substituto é aceito quando o principal faltar",
      "Na OP, se o componente principal não estiver disponível, o Odoo sugere o alternativo automaticamente",
    ],
    resultado:"Sistema oferece automaticamente o substituto quando o principal está em falta",
    pros:["Automático — Odoo sugere o substituto","Sem necessidade de editar a OP manualmente","Ideal para insumos com vários equivalentes aceitos"],
    contras:["Requer configuração prévia na BOM","Disponível em versões mais recentes do Odoo"],
    icone:"⚙️",
  },
  {
    metodo:"Variantes de Produto (Configuração de Produto)",
    quando:"O produto final tem versões diferentes que usam materiais diferentes",
    como:[
      "Acesse Inventário → Produtos → Produto → Aba Atributos e Variantes",
      "Adicione atributo: CABO_ELETRICO com valores: PARALELO_25 e PP_25",
      "Crie uma BOM por variante do produto",
      "BOM variante PARALELO_25: usa Cabo Paralelo 2x1,5mm",
      "BOM variante PP_25: usa Cabo PP 2x2,5mm",
      "Na OP, selecione qual variante está sendo produzida",
    ],
    resultado:"Cada variante tem sua BOM específica — rastreabilidade por configuração do produto",
    pros:["Rastreabilidade por variante do produto","Histórico por configuração","Ideal para produtos com múltiplas especificações"],
    contras:["Configuração mais complexa","Multiplica as BOMs e produtos no sistema"],
    icone:"🔀",
  },
];

function SegCard({seg}) {
  const [aberto, setAberto] = useState(false);
  const corBg = {blue:"#eff6ff", purple:"#f5f3ff", green:"#f0fdf4", yellow:"#fffbeb"};
  const corBorder = {blue:"#bfdbfe", purple:"#ddd6fe", green:"#a7f3d0", yellow:"#fde68a"};
  const corText  = {blue:"#1d4ed8", purple:"#6d28d9", green:"#047857", yellow:"#b45309"};
  return (
    <div style={{border:`2px solid ${corBorder[seg.cor]}`,borderRadius:12,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
      {/* Header */}
      <div style={{
        background:`linear-gradient(135deg, ${corBg[seg.cor]}, #fff)`,
        borderBottom:`1px solid ${corBorder[seg.cor]}`,
        padding:"16px 20px",cursor:"pointer",
        display:"flex",alignItems:"flex-start",gap:14
      }} onClick={()=>setAberto(!aberto)}>
        <span style={{fontSize:28,lineHeight:1}}>{seg.icon}</span>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
            <span style={{fontSize:15,fontWeight:800,color:"var(--text)"}}>{seg.titulo}</span>
            <span style={{fontSize:11,background:corBg[seg.cor],color:corText[seg.cor],border:`1px solid ${corBorder[seg.cor]}`,padding:"2px 10px",borderRadius:20,fontWeight:700}}>
              👤 {seg.responsavel}
            </span>
          </div>
          <p style={{fontSize:13,color:"var(--text-muted)",margin:0,lineHeight:1.5}}>{seg.descricao}</p>
          <code style={{fontSize:11,color:"var(--text-muted)",marginTop:4,display:"block"}}>{seg.odooTela}</code>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
          <a href={seg.odooLink} target="_blank" rel="noreferrer" className="oa-etapa-link"
             onClick={e=>e.stopPropagation()} style={{marginTop:0,padding:"5px 10px",fontSize:11}}>
            <ExternalLink size={11}/> Odoo
          </a>
          <span style={{color:"var(--text-muted)",fontSize:12}}>{aberto ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Subetapas */}
      {aberto && (
        <div style={{padding:"16px 20px"}}>
          <div style={{marginBottom:14}}>
            <strong style={{fontSize:13,color:"var(--text)"}}>📋 Subetapas:</strong>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
              {seg.subetapas.map(s => (
                <div key={s.n} style={{
                  display:"flex",gap:10,padding:"8px 12px",
                  background:s.serial ? "#fffbeb" : "var(--surface-raised)",
                  border:`1px solid ${s.serial ? "#fde68a" : "var(--border)"}`,
                  borderRadius:8,alignItems:"flex-start"
                }}>
                  <span style={{
                    minWidth:36,padding:"2px 6px",borderRadius:6,
                    background:corBg[seg.cor],color:corText[seg.cor],
                    fontSize:11,fontWeight:800,textAlign:"center",flexShrink:0
                  }}>{s.n}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:2}}>
                      <span style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{s.acao}</span>
                      {s.serial && <span className="oa-serial-badge">🏷️ SERIAL</span>}
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"var(--text-muted)"}}>👤 {s.quem}</span>
                      <span style={{fontSize:11,color:"var(--text-muted)"}}>📱 {s.tela}</span>
                      {s.dep.length > 0 && <span style={{fontSize:11,color:"var(--accent)"}}>🔗 depende de: {s.dep.join(", ")}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {seg.alertas.length > 0 && (
            <div>
              <strong style={{fontSize:13,color:"var(--text)"}}>⚠️ Alertas:</strong>
              <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:6}}>
                {seg.alertas.map((a,i) => (
                  <div key={i} style={{
                    padding:"7px 12px",background:"#fffbeb",
                    border:"1px solid #fde68a",borderRadius:8,
                    fontSize:12,color:"#92400e"
                  }}>⚠️ {a}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BomDinamicaCard({m}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div style={{border:"1px solid var(--border)",borderRadius:12,background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 18px",cursor:"pointer",background:"var(--surface)"}}
           onClick={()=>setAberto(!aberto)}>
        <span style={{fontSize:24,lineHeight:1}}>{m.icone}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:3}}>{m.metodo}</div>
          <div style={{fontSize:12,color:"var(--accent)",fontStyle:"italic"}}>{m.quando}</div>
        </div>
        <span style={{color:"var(--text-muted)",fontSize:12,flexShrink:0}}>{aberto ? "▲" : "▼"}</span>
      </div>
      {aberto && (
        <div style={{padding:"14px 18px",borderTop:"1px solid var(--border)",background:"var(--surface-raised)"}}>
          <div style={{marginBottom:14}}>
            <strong style={{fontSize:13}}>📋 Como fazer:</strong>
            <div className="oa-guia-passo-list" style={{marginTop:8}}>
              {m.como.map((p,i) => (
                <div key={i} className="oa-guia-passo">
                  <span className="oa-guia-passo-num">{i+1}</span><span>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="oa-info-box oa-info-green" style={{marginBottom:12}}>
            <CheckCircle size={14}/><div><strong>Resultado:</strong> {m.resultado}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{padding:"10px 14px",background:"#f0fdf4",border:"1px solid #a7f3d0",borderRadius:8}}>
              <strong style={{fontSize:12,color:"#047857",display:"block",marginBottom:6}}>✅ Vantagens</strong>
              {m.pros.map((p,i) => <div key={i} style={{fontSize:12,color:"var(--text-secondary)",marginBottom:3}}>• {p}</div>)}
            </div>
            <div style={{padding:"10px 14px",background:"#fef9c3",border:"1px solid #fde68a",borderRadius:8}}>
              <strong style={{fontSize:12,color:"#b45309",display:"block",marginBottom:6}}>⚠️ Atenção</strong>
              {m.contras.map((c,i) => <div key={i} style={{fontSize:12,color:"var(--text-secondary)",marginBottom:3}}>• {c}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabMapa() {
  const [visao, setVisao] = useState("mapa");
  return (
    <div className="oa-content">
      <OdooLinkBar/>

      {/* Sub-navegação */}
      <div className="oa-chao-nav">
        {[
          {id:"mapa",       label:"🗺️ Mapa de Processos"},
          {id:"locacao",    label:"🔑 Locação"},
          {id:"arvore",     label:"🧭 Árvore de Decisão"},
          {id:"dependencias", label:"🔗 Interdependências"},
          {id:"bom_dinamica", label:"🔧 BOM Dinâmica"},
        ].map(v => (
          <button key={v.id}
            className={`oa-chao-btn ${visao===v.id ? "oa-chao-btn--ativo" : ""}`}
            onClick={()=>setVisao(v.id)}>{v.label}</button>
        ))}
      </div>

      {/* ═══ MAPA DE PROCESSOS ═══ */}
      {visao === "mapa" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div className="oa-info-box oa-info-blue">
            <Info size={16}/>
            <div>Todos os 5 segmentos do processo completo. Clique em cada um para expandir as subetapas, responsáveis e tela do Odoo.</div>
          </div>

          {/* Fluxo visual simplificado */}
          <div style={{
            background:"var(--surface)",border:"1px solid var(--border)",
            borderRadius:12,padding:"16px 20px",boxShadow:"var(--card-shadow)"
          }}>
            <strong style={{fontSize:13,display:"block",marginBottom:12}}>📊 Visão Linear do Processo Completo</strong>
            <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:6}}>
              {SEGMENTOS.map((seg,i) => (
                <React.Fragment key={seg.id}>
                  <div style={{
                    padding:"8px 14px",borderRadius:8,
                    background:seg.cor==="blue"?"#eff6ff":seg.cor==="purple"?"#f5f3ff":seg.cor==="green"?"#f0fdf4":"#fffbeb",
                    border:`1px solid ${seg.cor==="blue"?"#bfdbfe":seg.cor==="purple"?"#ddd6fe":seg.cor==="green"?"#a7f3d0":"#fde68a"}`,
                    color:seg.cor==="blue"?"#1d4ed8":seg.cor==="purple"?"#6d28d9":seg.cor==="green"?"#047857":"#b45309",
                    fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6
                  }}>
                    <span>{seg.icon}</span> {seg.titulo.split("(")[0].trim()}
                  </div>
                  {i < SEGMENTOS.length-1 && <ArrowRight size={14} color="var(--border-hover)"/>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {SEGMENTOS.map(seg => <SegCard key={seg.id} seg={seg}/>)}
        </div>
      )}

      {/* ═══ LOCAÇÃO ═══ */}
      {visao === "locacao" && (() => {
        const locacao = SEGMENTOS.find(s => s.id === "locacao");
        return (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="oa-info-box oa-info-blue">
              <Info size={16}/>
              <div><strong>Locação</strong> é diferente de venda: o equipamento vai ao cliente com serial, fica em uso por um período e <strong>retorna ao estoque</strong>. O Odoo rastreia todo o ciclo de vida com o número de série.</div>
            </div>

            {/* Comparativo Venda vs Locação */}
            <div className="oa-section">
              <h3>📊 Venda vs Locação — Diferenças fundamentais</h3>
              <div className="oa-table-wrap">
                <table className="oa-table">
                  <thead><tr><th>Critério</th><th>💼 Venda</th><th>🔑 Locação</th></tr></thead>
                  <tbody>
                    <tr><td>Serial retorna ao estoque?</td><td>❌ Não — serial sai definitivamente</td><td>✅ Sim — serial volta após o período</td></tr>
                    <tr><td>Propriedade do equipamento</td><td>Transferida ao cliente</td><td>Permanece com a Axion</td></tr>
                    <tr><td>Faturamento</td><td>NF de venda (definitiva)</td><td>NF de aluguel (recorrente)</td></tr>
                    <tr><td>Rastreabilidade serial</td><td>Saída → cliente → fim</td><td>Saída → cliente → retorno → estoque → próxima locação</td></tr>
                    <tr><td>Módulo Odoo</td><td>Vendas + Inventário</td><td>Locações (Rental) + Inventário</td></tr>
                    <tr><td>Inspeção</td><td>Pré-entrega apenas</td><td>Pré-entrega + pós-retorno (obrigatória)</td></tr>
                    <tr><td>Contrato</td><td>Pedido de Venda</td><td>Contrato de Locação com datas definidas</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Segcard da locação */}
            {locacao && <SegCard seg={locacao}/>}

            <div className="oa-section">
              <h3>🔑 Ciclo de Vida do Serial na Locação</h3>
              <div style={{display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap",padding:"16px 0"}}>
                {[
                  {icon:"🏭", label:"Produção", desc:"Serial criado na OP"},
                  {icon:"📦", label:"Estoque disponível", desc:"Aguarda locação ou venda"},
                  {icon:"📤", label:"Saída para cliente", desc:"Serial registrado na saída"},
                  {icon:"🔑", label:"Em uso — cliente", desc:"Rastreado no contrato de locação"},
                  {icon:"📥", label:"Retorno", desc:"Serial volta ao estoque"},
                  {icon:"🔍", label:"Inspeção", desc:"Verificar estado do equipamento"},
                  {icon:"📦", label:"Disponível novamente", desc:"Pronto para nova locação"},
                ].map((s,i) => (
                  <React.Fragment key={i}>
                    <div style={{
                      padding:"10px 14px",textAlign:"center",minWidth:110,
                      background:"var(--surface)",border:"1px solid var(--border)",
                      borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
                    }}>
                      <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
                      <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{s.label}</div>
                      <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{s.desc}</div>
                    </div>
                    {i < 6 && <ArrowRight size={14} color="var(--border-hover)" style={{marginTop:24,flexShrink:0}}/>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="oa-section">
              <h3>⚙️ Configurar Locação no Odoo</h3>
              <div className="oa-config-list">
                {[
                  {m:"Vendas → Configuração → Definições", c:"Ativar módulo 'Locações' (Rental)"},
                  {m:"Inventário → Produtos → produto", c:"Tipo: Armazenável + Rastreamento: Número de Série + Pode ser Alugado: ✅"},
                  {m:"Vendas → Locações → Novo", c:"Criar contrato de locação com cliente, produto, período e valor"},
                  {m:"Locação → Confirmar Retirada", c:"Selecionar serial específico na saída"},
                  {m:"Locação → Configuração", c:"Ativar alertas de vencimento (e-mail automático)"},
                  {m:"Locação → Confirmar Devolução", c:"Registrar retorno do equipamento com inspeção"},
                ].map(({m,c}) => (
                  <div key={m} className="oa-config-item">
                    <Settings size={14}/>
                    <div><code>{m}</code><span>{c}</span></div>
                  </div>
                ))}
              </div>
              <a href={`${BASE_ODOO}/odoo/rental`} target="_blank" rel="noreferrer" className="oa-etapa-link" style={{marginTop:14,display:"inline-flex"}}>
                <ExternalLink size={13}/> Abrir Módulo de Locações no Odoo
              </a>
            </div>
          </div>
        );
      })()}

      {/* ═══ ÁRVORE DE DECISÃO ═══ */}
      {visao === "arvore" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-green">
            <CheckCircle size={16}/>
            <div>Use este guia para decidir <strong>qual processo usar</strong> para cada situação da Axion. Responda as perguntas de cima para baixo.</div>
          </div>

          {/* Árvore visual */}
          <div className="oa-section">
            <h3>🧭 Árvore de Decisão — Qual processo usar?</h3>
            <div className="oa-arvore">

              {/* Nó raiz */}
              <div className="oa-arvore-no oa-arvore-raiz">
                <span>🔑 Qual é a necessidade?</span>
              </div>
              <div className="oa-arvore-linha"/>

              {/* Nível 1 */}
              <div className="oa-arvore-nivel">
                <div className="oa-arvore-branch">
                  <div className="oa-arvore-no oa-arvore-pergunta">Comprar insumos do fornecedor?</div>
                  <div className="oa-arvore-linha"/>
                  <a href={`${BASE_ODOO}/odoo/purchase`} target="_blank" rel="noreferrer"
                     className="oa-arvore-no oa-arvore-resp oa-arvore-blue oa-arvore-link">
                    ✅ <strong>Pedido de Compra</strong><br/>
                    <span>Compras → Pedidos</span><br/>
                    <small>Serial gerado no recebimento</small>
                    <span className="oa-arvore-link-btn">↗ Abrir</span>
                  </a>
                </div>
                <div className="oa-arvore-branch">
                  <div className="oa-arvore-no oa-arvore-pergunta">Vender peças separadas sem montar?</div>
                  <div className="oa-arvore-linha"/>
                  <a href={`${BASE_ODOO}/odoo/manufacturing/bom`} target="_blank" rel="noreferrer"
                     className="oa-arvore-no oa-arvore-resp oa-arvore-yellow oa-arvore-link">
                    🎁 <strong>Combo / Kit</strong><br/>
                    <span>BOM tipo Kit</span><br/>
                    <small>Sem serial de produto final</small>
                    <span className="oa-arvore-link-btn">↗ Abrir BOM</span>
                  </a>
                </div>
                <div className="oa-arvore-branch">
                  <div className="oa-arvore-no oa-arvore-pergunta">Fabricar equipamento montado?</div>
                  <div className="oa-arvore-linha"/>
                  <a href={`${BASE_ODOO}/odoo/manufacturing`} target="_blank" rel="noreferrer"
                     className="oa-arvore-no oa-arvore-resp oa-arvore-green oa-arvore-link">
                    🏭 <strong>Produção + Chão de Fábrica</strong><br/>
                    <span>BOM Fabricar → OP → Chão</span><br/>
                    <small>Serial 2: produto final</small>
                    <span className="oa-arvore-link-btn">↗ Abrir Fabricação</span>
                  </a>
                </div>
                <div className="oa-arvore-branch">
                  <div className="oa-arvore-no oa-arvore-pergunta">Enviar equipamento com retorno?</div>
                  <div className="oa-arvore-linha"/>
                  <a href={`${BASE_ODOO}/odoo/rental`} target="_blank" rel="noreferrer"
                     className="oa-arvore-no oa-arvore-resp oa-arvore-purple oa-arvore-link">
                    🔑 <strong>Locação</strong><br/>
                    <span>Módulo Rental</span><br/>
                    <small>Serial sai e volta ao estoque</small>
                    <span className="oa-arvore-link-btn">↗ Abrir Locações</span>
                  </a>
                </div>
                <div className="oa-arvore-branch">
                  <div className="oa-arvore-no oa-arvore-pergunta">Vender equipamento produzido?</div>
                  <div className="oa-arvore-linha"/>
                  <a href={`${BASE_ODOO}/odoo/sales`} target="_blank" rel="noreferrer"
                     className="oa-arvore-no oa-arvore-resp oa-arvore-blue oa-arvore-link">
                    💼 <strong>Pedido de Venda + Entrega</strong><br/>
                    <span>Vendas → Inventário → Entrega</span><br/>
                    <small>Serial 3: saída para cliente</small>
                    <span className="oa-arvore-link-btn">↗ Abrir Vendas</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Fluxos visuais completos de cada processo */}
          <div className="oa-section">
            <h3>📋 Fluxo Resumido de Cada Processo</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* Processo 1: Compra + Produção + Venda */}
              <div className="oa-fluxo-card oa-fluxo-card-green">
                <div className="oa-fluxo-card-titulo">🏭 Processo Completo: Compra → Produção → Venda</div>
                <div className="oa-fluxo-card-desc">Equipamento fabricado internamente e vendido ao cliente. Ciclo completo com 3 seriais.</div>
                <div className="oa-fluxo-mini">
                  {[
                    {e:"🛒",   t:"Pedido de Compra",       q:"Comprador",    s:false, l:`${BASE_ODOO}/odoo/purchase`},
                    {e:"📥",   t:"Receber + SERIAL 1",     q:"Almoxarifado", s:true,  l:`${BASE_ODOO}/odoo/inventory/receipts`},
                    {e:"📋",   t:"Lista de Materiais",     q:"Operador",     s:false, l:`${BASE_ODOO}/odoo/manufacturing/bom`},
                    {e:"⚙️",   t:"Ordem de Produção",      q:"PCP",          s:false, l:`${BASE_ODOO}/odoo/manufacturing`},
                    {e:"🏗️",   t:"Chão de Fábrica",        q:"Produção",     s:false, l:`${BASE_ODOO}/odoo/manufacturing`},
                    {e:"✅",   t:"Concluir + SERIAL 2",    q:"Produção",     s:true,  l:`${BASE_ODOO}/odoo/manufacturing`},
                    {e:"💼",   t:"Pedido de Venda",        q:"Comercial",    s:false, l:`${BASE_ODOO}/odoo/sales`},
                    {e:"📤",   t:"Entrega + SERIAL 3",     q:"Almoxarifado", s:true,  l:`${BASE_ODOO}/odoo/inventory/delivery-orders`},
                  ].map((p,i,arr) => (
                    <React.Fragment key={i}>
                      <a href={p.l} target="_blank" rel="noreferrer"
                         className={`oa-fm-item oa-fm-link ${p.s ? "oa-fm-serial" : ""}`}>
                        <span className="oa-fm-icon">{p.e}</span>
                        <span className="oa-fm-titulo">{p.t}</span>
                        <span className="oa-fm-quem">{p.q}</span>
                        <span className="oa-fm-abrir">↗</span>
                      </a>
                      {i < arr.length-1 && <ArrowRight size={12} color="#9ca3af" style={{flexShrink:0,marginTop:14}}/>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Processo 2: Locação */}
              <div className="oa-fluxo-card oa-fluxo-card-purple">
                <div className="oa-fluxo-card-titulo">🔑 Processo de Locação: Equipamento sai e volta</div>
                <div className="oa-fluxo-card-desc">Equipamento já produzido vai ao cliente por período contratado e retorna ao estoque.</div>
                <div className="oa-fluxo-mini">
                  {[
                    {e:"📦", t:"Equipamento em estoque",         q:"Almoxarifado", s:false, l:`${BASE_ODOO}/odoo/inventory`},
                    {e:"📋", t:"Contrato de Locação",            q:"Comercial",    s:false, l:`${BASE_ODOO}/odoo/rental`},
                    {e:"📤", t:"Saída + SERIAL registrado",      q:"Almoxarifado", s:true,  l:`${BASE_ODOO}/odoo/rental`},
                    {e:"🔑", t:"Uso pelo cliente (período)",     q:"Cliente",      s:false, l:`${BASE_ODOO}/odoo/rental`},
                    {e:"📥", t:"Retorno + Inspeção + SERIAL volta", q:"Almoxarifado", s:true, l:`${BASE_ODOO}/odoo/rental`},
                    {e:"💰", t:"Faturamento final",              q:"Comercial",    s:false, l:`${BASE_ODOO}/odoo/accounting`},
                  ].map((p,i,arr) => (
                    <React.Fragment key={i}>
                      <a href={p.l} target="_blank" rel="noreferrer"
                         className={`oa-fm-item oa-fm-link ${p.s ? "oa-fm-serial" : ""}`}>
                        <span className="oa-fm-icon">{p.e}</span>
                        <span className="oa-fm-titulo">{p.t}</span>
                        <span className="oa-fm-quem">{p.q}</span>
                        <span className="oa-fm-abrir">↗</span>
                      </a>
                      {i < arr.length-1 && <ArrowRight size={12} color="#9ca3af" style={{flexShrink:0,marginTop:14}}/>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Processo 3: Kit/Combo */}
              <div className="oa-fluxo-card oa-fluxo-card-yellow">
                <div className="oa-fluxo-card-titulo">🎁 Processo de Combo/Kit: Peças separadas para o cliente</div>
                <div className="oa-fluxo-card-desc">Conjunto de peças vendidas juntas mas entregues individualmente. Sem fabricação.</div>
                <div className="oa-fluxo-mini">
                  {[
                    {e:"📦", t:"Componentes em estoque",         q:"Almoxarifado", s:false, l:`${BASE_ODOO}/odoo/inventory/products`},
                    {e:"💼", t:"Pedido de Venda com Kit",        q:"Comercial",    s:false, l:`${BASE_ODOO}/odoo/sales`},
                    {e:"⚡", t:"Odoo explode o Kit",             q:"Sistema",      s:false, l:`${BASE_ODOO}/odoo/manufacturing/bom`},
                    {e:"📤", t:"Entrega das peças + seriais",    q:"Almoxarifado", s:true,  l:`${BASE_ODOO}/odoo/inventory/delivery-orders`},
                  ].map((p,i,arr) => (
                    <React.Fragment key={i}>
                      <a href={p.l} target="_blank" rel="noreferrer"
                         className={`oa-fm-item oa-fm-link ${p.s ? "oa-fm-serial" : ""}`}>
                        <span className="oa-fm-icon">{p.e}</span>
                        <span className="oa-fm-titulo">{p.t}</span>
                        <span className="oa-fm-quem">{p.q}</span>
                        <span className="oa-fm-abrir">↗</span>
                      </a>
                      {i < arr.length-1 && <ArrowRight size={12} color="#9ca3af" style={{flexShrink:0,marginTop:14}}/>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Tabela decisão completa */}
          <div className="oa-section">
            <h3>📊 Tabela Completa — Todos os Processos</h3>
            <div className="oa-table-wrap">
              <table className="oa-table">
                <thead>
                  <tr><th>Processo</th><th>Quando usar</th><th>Serial</th><th>Estoque final</th><th>Retorna?</th><th>Módulo Odoo</th></tr>
                </thead>
                <tbody>
                  <tr style={{background:"#eff6ff"}}>
                    <td><a href={`${BASE_ODOO}/odoo/purchase`} target="_blank" rel="noreferrer" style={{color:"#1d4ed8",fontWeight:700}}>📥 Compra + Recebimento ↗</a></td>
                    <td>Adquirir insumos do fornecedor</td>
                    <td>🏷️ Serial 1 gerado</td>
                    <td>Entra no estoque</td>
                    <td>—</td>
                    <td><a href={`${BASE_ODOO}/odoo/purchase`} target="_blank" rel="noreferrer" className="oa-quick-link" style={{fontSize:11}}>Compras ↗</a></td>
                  </tr>
                  <tr style={{background:"#f5f3ff"}}>
                    <td><a href={`${BASE_ODOO}/odoo/manufacturing`} target="_blank" rel="noreferrer" style={{color:"#6d28d9",fontWeight:700}}>🏭 Produção ↗</a></td>
                    <td>Fabricar equipamento montado</td>
                    <td>🏷️ Serial 2 gerado na OP</td>
                    <td>Entra no estoque</td>
                    <td>—</td>
                    <td><a href={`${BASE_ODOO}/odoo/manufacturing`} target="_blank" rel="noreferrer" className="oa-quick-link" style={{fontSize:11}}>Fabricação ↗</a></td>
                  </tr>
                  <tr style={{background:"#fffbeb"}}>
                    <td><a href={`${BASE_ODOO}/odoo/manufacturing/bom`} target="_blank" rel="noreferrer" style={{color:"#b45309",fontWeight:700}}>🎁 Combo/Kit ↗</a></td>
                    <td>Vender conjunto de peças</td>
                    <td>Serial por componente</td>
                    <td>Sai do estoque</td>
                    <td>❌ Não</td>
                    <td><a href={`${BASE_ODOO}/odoo/manufacturing/bom`} target="_blank" rel="noreferrer" className="oa-quick-link" style={{fontSize:11}}>BOM / Kit ↗</a></td>
                  </tr>
                  <tr style={{background:"#f0fdf4"}}>
                    <td><a href={`${BASE_ODOO}/odoo/sales`} target="_blank" rel="noreferrer" style={{color:"#047857",fontWeight:700}}>💼 Venda ↗</a></td>
                    <td>Vender equipamento fabricado</td>
                    <td>🏷️ Serial 3 na entrega</td>
                    <td>Sai do estoque</td>
                    <td>❌ Não</td>
                    <td><a href={`${BASE_ODOO}/odoo/sales`} target="_blank" rel="noreferrer" className="oa-quick-link" style={{fontSize:11}}>Vendas ↗</a></td>
                  </tr>
                  <tr style={{background:"#fdf4ff"}}>
                    <td><a href={`${BASE_ODOO}/odoo/rental`} target="_blank" rel="noreferrer" style={{color:"#6d28d9",fontWeight:700}}>🔑 Locação ↗</a></td>
                    <td>Alugar equipamento com retorno</td>
                    <td>🏷️ Serial rastreado ida/volta</td>
                    <td>Sai e volta ao estoque</td>
                    <td>✅ Sim</td>
                    <td><a href={`${BASE_ODOO}/odoo/rental`} target="_blank" rel="noreferrer" className="oa-quick-link" style={{fontSize:11}}>Locações ↗</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ INTERDEPENDÊNCIAS ═══ */}
      {visao === "dependencias" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-yellow">
            <AlertTriangle size={16}/>
            <div>As etapas têm <strong>dependências obrigatórias</strong>. Não é possível pular etapas sem consequências no rastreamento e no estoque.</div>
          </div>
          <div className="oa-section">
            <h3>🔗 Mapa de Dependências — O que bloqueia o quê</h3>
            <div className="oa-table-wrap">
              <table className="oa-table">
                <thead>
                  <tr><th>Etapa</th><th>Depende de</th><th>Se pulada, o que acontece</th><th>Bloqueio</th></tr>
                </thead>
                <tbody>
                  <tr><td>1.3 Validar Recebimento</td><td>1.2 Recebimento físico + NF</td><td>Estoque errado — produto no sistema sem estar no almoxarifado</td><td>🔴 Crítico</td></tr>
                  <tr><td>1.4 Registrar Serial</td><td>1.3 Validação</td><td>Produto entra sem serial — rastreabilidade perdida</td><td>🔴 Crítico</td></tr>
                  <tr><td>2.1 Criar OP</td><td>1.5 Estoque disponível</td><td>OP criada sem material — produção paralisada</td><td>🟡 Alerta</td></tr>
                  <tr><td>3.3 Registrar serial componente</td><td>3.2 Montagem</td><td>Sem rastreabilidade insumo→produto</td><td>🟡 Recomendado</td></tr>
                  <tr><td>3.6 Concluir OP + serial final</td><td>3.5 QC aprovado</td><td>Produto com defeito vai para o estoque</td><td>🔴 Crítico</td></tr>
                  <tr><td>5.4 Selecionar serial na entrega</td><td>5.3 Embalagem</td><td>Entrega sem vincular serial ao cliente — irrastreável</td><td>🔴 Crítico</td></tr>
                  <tr><td>5.6 Emitir NF</td><td>5.5 Validar entrega</td><td>Produto saiu sem documento fiscal</td><td>🔴 Legal</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="oa-section">
            <h3>👥 Responsáveis por Processo — Quem faz o quê</h3>
            <div className="oa-cards-grid">
              {[
                {ator:"Comprador", cor:"blue", etapas:["Confirmar PO (1.1)","Conferir NF (1.2)","Criar Pedido de Venda (5.1)","Emitir NF (5.6)","Auditoria serial (5.7)"]},
                {ator:"Almoxarifado", cor:"blue", etapas:["Receber fisicamente (1.2)","Validar no Odoo (1.3)","Registrar serial entrada (1.4)","Separação física (2.3)","Conferir seriais (2.4)","Embalar (5.3)","Selecionar serial entrega (5.4)","Validar entrega (5.5)"]},
                {ator:"PCP / Operador", cor:"purple", etapas:["Criar OP (2.1)","Verificar disponibilidade (2.2)","Monitorar produção","Criar/revisar BOM (quando muda material)"]},
                {ator:"Chão de Fábrica", cor:"green", etapas:["Executar montagem (3.2)","Registrar seriais insumos (3.3)","Testes e config (3.4)","Concluir OP + serial final (3.6)"]},
                {ator:"Qualidade", cor:"green", etapas:["Checklist QC (3.5)","Aprovar/reprovar OP","Registrar defeitos","Validar produto para estoque"]},
                {ator:"Comercial", cor:"blue", etapas:["Criar Pedido Venda (4.1 / 5.1)","Confirmar Pedido","Acompanhar entrega"]},
              ].map(({ator,cor,etapas}) => (
                <div key={ator} className={`oa-card oa-card-${cor}`}>
                  <h4>👤 {ator}</h4>
                  <ul>{etapas.map(e=><li key={e}>{e}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BOM DINÂMICA ═══ */}
      {visao === "bom_dinamica" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-yellow">
            <AlertTriangle size={16}/>
            <div>
              <strong>Situação real da Axion:</strong> Hoje usa <em>Cabo Paralelo 2x1,5mm</em>. Na próxima produção pode ser <em>Cabo PP 2x2,5mm</em>. O Odoo permite controlar isso de <strong>4 formas</strong> — escolha a mais adequada para cada caso.
            </div>
          </div>

          <div style={{
            background:"#fff7ed",border:"2px solid #fed7aa",borderRadius:12,padding:"16px 20px"
          }}>
            <strong style={{fontSize:14,color:"#9a3412",display:"block",marginBottom:10}}>
              🔑 Regra de decisão — Qual método usar?
            </strong>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {pergunta:"O material mudou definitivamente para sempre?", resposta:"→ Use Versão de BOM (método 1)"},
                {pergunta:"É uma troca só nesta produção específica?", resposta:"→ Substitua na OP (método 2)"},
                {pergunta:"O produto aceita 2+ materiais equivalentes sempre?", resposta:"→ Configure Componente Alternativo (método 3)"},
                {pergunta:"O produto tem versões com materiais diferentes?", resposta:"→ Use Variantes (método 4)"},
              ].map(({pergunta,resposta},i) => (
                <div key={i} style={{display:"flex",gap:12,padding:"8px 12px",background:"#fff",border:"1px solid #fde68a",borderRadius:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,color:"var(--text-secondary)",flex:1}}>{pergunta}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#9a3412",flexShrink:0}}>{resposta}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {BOM_DINAMICA.map(m => <BomDinamicaCard key={m.metodo} m={m}/>)}
          </div>

          <div className="oa-section">
            <h3>📊 Comparativo dos 4 Métodos</h3>
            <div className="oa-table-wrap">
              <table className="oa-table">
                <thead>
                  <tr><th>Método</th><th>Complexidade</th><th>Rastreabilidade</th><th>Flexibilidade</th><th>Caso Axion</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>1. Nova versão BOM</strong></td>
                    <td>⚡ Baixa</td>
                    <td>✅ Alta</td>
                    <td>🔄 Permanente</td>
                    <td>Fio vermelho → Fio azul definitivamente</td>
                  </tr>
                  <tr>
                    <td><strong>2. Substituição na OP</strong></td>
                    <td>⚡ Muito Baixa</td>
                    <td>⚡ Média</td>
                    <td>✅ Pontual</td>
                    <td>Falta fio paralelo hoje → usa PP agora</td>
                  </tr>
                  <tr>
                    <td><strong>3. Componente Alternativo</strong></td>
                    <td>⚙️ Média</td>
                    <td>✅ Alta</td>
                    <td>✅ Automático</td>
                    <td>Fio paralelo OU PP aceitos indistintamente</td>
                  </tr>
                  <tr>
                    <td><strong>4. Variantes</strong></td>
                    <td>⚙️ Alta</td>
                    <td>✅ Máxima</td>
                    <td>✅ Por versão</td>
                    <td>AXOCR-AC usa PP; AXOCR-Solar usa paralelo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="oa-section">
            <h3>📋 Passo a passo — Trocar Cabo Paralelo por Cabo PP nesta OP</h3>
            <div className="oa-info-box oa-info-blue" style={{marginBottom:12}}>
              <Info size={14}/><div>Cenário real: Produção do AXOCR hoje, mas o <strong>Cabo Paralelo Cristal 2x1,5mm</strong> está em falta. Temos <strong>Cabo PP 2x2,5mm</strong> em estoque.</div>
            </div>
            <div className="oa-guia-passo-list">
              {[
                "Abra a Ordem de Produção do AXOCR em Fabricação → Ordens de Produção",
                "Clique na aba Componentes",
                "Localize 'CABO PARALELO CRISTAL POLARIZADO 2 X 1,5MM' na lista",
                "Clique na linha do componente para editar",
                "Troque o produto por 'CABO PP FLEXÍVEL 2X2,5MM 1KV'",
                "Ajuste a quantidade se necessário (verificar especificação técnica)",
                "No campo Notas da OP, registre: 'Cabo paralelo em falta — substituído por Cabo PP 2x2,5mm conforme OK técnico [nome]'",
                "Continue a produção normalmente — o serial do Cabo PP será registrado no consumo",
                "Após a produção, informe o PCP para avaliar se é necessário versionar a BOM",
              ].map((p,i) => (
                <div key={i} className="oa-guia-passo">
                  <span className="oa-guia-passo-num">{i+1}</span><span>{p}</span>
                </div>
              ))}
            </div>
            <a href={`${BASE_ODOO}/odoo/manufacturing`} target="_blank" rel="noreferrer" className="oa-etapa-link" style={{marginTop:14,display:"inline-flex"}}>
              <ExternalLink size={13}/> Abrir Fabricação no Odoo
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ORGANOGRAMA COMPLETO DE PROCESSOS
   ══════════════════════════════════════════════════════════════ */
const DEPARTAMENTOS = [
  {
    id:"comercial", nome:"Comercial", cor:"#2563eb", bg:"#eff6ff", border:"#bfdbfe",
    icon:"💼",
    responsabilidades:[
      "Criar Pedido de Venda",
      "Criar Contrato de Locação",
      "Confirmar Pedidos e Locações",
      "Monitorar vencimento de contratos",
      "Faturamento de Locações",
      "Acompanhar entregas ao cliente",
    ],
    processos:["Venda","Locação","Kit/Combo"],
    odooTelas:[
      {t:"Vendas → Pedidos", l:`${BASE_ODOO}/odoo/sales`},
      {t:"Locações", l:`${BASE_ODOO}/odoo/rental`},
    ],
  },
  {
    id:"comprador", nome:"Compras", cor:"#0284c7", bg:"#e0f2fe", border:"#7dd3fc",
    icon:"🛒",
    responsabilidades:[
      "Criar Pedido de Compra de insumos",
      "Negociar com fornecedores",
      "Confirmar Pedidos de Compra",
      "Acompanhar recebimento de NFs",
      "Emitir NF de Venda / Entrega",
      "Auditar rastreabilidade pelo serial",
    ],
    processos:["Compra","Recebimento","Entrega"],
    odooTelas:[
      {t:"Compras → Pedidos", l:`${BASE_ODOO}/odoo/purchase`},
      {t:"Inventário → Entregas", l:`${BASE_ODOO}/odoo/inventory/delivery-orders`},
    ],
  },
  {
    id:"almoxarifado", nome:"Almoxarifado", cor:"#0891b2", bg:"#cffafe", border:"#67e8f9",
    icon:"📦",
    responsabilidades:[
      "Receber fisicamente as mercadorias",
      "Registrar seriais dos insumos (SERIAL 1)",
      "Validar recebimento no Odoo",
      "Guardar no local correto (ESTOQUE)",
      "Separar componentes para produção",
      "Conferir seriais na separação",
      "Embalar produto final",
      "Selecionar serial na saída (SERIAL 3)",
      "Validar entrega ao cliente",
      "Receber e inspecionar retorno de locação",
    ],
    processos:["Recebimento","Separação","Entrega","Locação"],
    odooTelas:[
      {t:"Inventário → Recebimentos", l:`${BASE_ODOO}/odoo/inventory/receipts`},
      {t:"Inventário → Entregas", l:`${BASE_ODOO}/odoo/inventory/delivery-orders`},
      {t:"Inventário → Rastreabilidade", l:`${BASE_ODOO}/odoo/inventory/traceability`},
    ],
  },
  {
    id:"pcp", nome:"PCP / Operador", cor:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe",
    icon:"📋",
    responsabilidades:[
      "Criar e revisar BOM (Lista de Materiais)",
      "Criar Ordens de Produção",
      "Reservar componentes do estoque",
      "Monitorar disponibilidade de materiais",
      "Ajustar BOM quando materiais mudam",
      "Versionar BOM para auditoria",
      "Monitorar produção e prazos",
    ],
    processos:["BOM","Ordem de Produção","Controle de BOM Dinâmica"],
    odooTelas:[
      {t:"Fabricação → Listas de Materiais", l:`${BASE_ODOO}/odoo/manufacturing/bom`},
      {t:"Fabricação → Ordens de Produção", l:`${BASE_ODOO}/odoo/manufacturing`},
    ],
  },
  {
    id:"producao", nome:"Produção / Fábrica", cor:"#059669", bg:"#f0fdf4", border:"#a7f3d0",
    icon:"🏭",
    responsabilidades:[
      "Executar montagem no Chão de Fábrica",
      "Registrar seriais dos componentes consumidos",
      "Executar testes e configurações",
      "Responder checklist de qualidade (QC)",
      "Concluir OP e registrar SERIAL 2 do produto final",
      "Afixar etiqueta serial no equipamento",
      "Reportar substituições de componentes",
    ],
    processos:["Montagem","Testes","Conclusão OP"],
    odooTelas:[
      {t:"Fabricação → Chão de Fábrica", l:`${BASE_ODOO}/odoo/manufacturing`},
      {t:"Fabricação → Ordens de Produção", l:`${BASE_ODOO}/odoo/manufacturing`},
    ],
  },
  {
    id:"qualidade", nome:"Qualidade", cor:"#d97706", bg:"#fffbeb", border:"#fde68a",
    icon:"🔍",
    responsabilidades:[
      "Inspecionar equipamentos antes da entrega",
      "Aprovar/reprovar checklist de qualidade na OP",
      "Inspecionar retorno de locação",
      "Documentar defeitos e não conformidades",
      "Validar produto para entrada no estoque",
      "Aprovar BOM para produção",
    ],
    processos:["QC na Produção","Inspeção de Retorno","Auditoria de Serial"],
    odooTelas:[
      {t:"Fabricação → Qualidade", l:`${BASE_ODOO}/odoo/quality`},
      {t:"Inventário → Rastreabilidade", l:`${BASE_ODOO}/odoo/inventory/traceability`},
    ],
  },
];

const MATRIZ_PROCESSOS = [
  {
    proc:"📥 Compra + Recebimento",
    etapas:[
      {dep:"Compras",        acao:"Criar e confirmar Pedido de Compra"},
      {dep:"Almoxarifado",   acao:"Receber fisicamente + registrar Serial 1"},
      {dep:"Almoxarifado",   acao:"Validar recebimento no Odoo"},
    ]
  },
  {
    proc:"🏭 Produção Completa",
    etapas:[
      {dep:"PCP / Operador", acao:"Criar/revisar BOM"},
      {dep:"PCP / Operador", acao:"Criar Ordem de Produção"},
      {dep:"Almoxarifado",   acao:"Separar componentes (seriais)"},
      {dep:"Produção",       acao:"Montar no Chão de Fábrica"},
      {dep:"Qualidade",      acao:"Checklist de qualidade (QC)"},
      {dep:"Produção",       acao:"Concluir OP + gerar Serial 2"},
    ]
  },
  {
    proc:"💼 Venda + Entrega",
    etapas:[
      {dep:"Comercial",      acao:"Criar Pedido de Venda"},
      {dep:"Almoxarifado",   acao:"Selecionar serial + embalar"},
      {dep:"Almoxarifado",   acao:"Validar entrega (Serial 3 vinculado)"},
      {dep:"Compras",        acao:"Emitir NF de saída"},
    ]
  },
  {
    proc:"🎁 Combo / Kit",
    etapas:[
      {dep:"Comercial",      acao:"Criar pedido com Kit/Combo"},
      {dep:"Sistema Odoo",   acao:"Explodir Kit nas peças automaticamente"},
      {dep:"Almoxarifado",   acao:"Separar peças + registrar seriais"},
      {dep:"Almoxarifado",   acao:"Validar entrega das peças separadas"},
    ]
  },
  {
    proc:"🔑 Locação",
    etapas:[
      {dep:"Comercial",      acao:"Criar Contrato de Locação + período"},
      {dep:"Qualidade",      acao:"Inspecionar equipamento antes da saída"},
      {dep:"Almoxarifado",   acao:"Registrar saída + Serial vinculado"},
      {dep:"Almoxarifado",   acao:"Receber retorno + inspecionar"},
      {dep:"Qualidade",      acao:"Aprovar estado do equipamento"},
      {dep:"Comercial",      acao:"Faturar locação + eventuais danos"},
    ]
  },
];

function DepCard({dep}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div style={{
      border:`2px solid ${dep.border}`,borderRadius:12,
      background:dep.bg,overflow:"hidden",
      boxShadow:"0 2px 8px rgba(0,0,0,0.07)",
      transition:"all 0.15s",cursor:"pointer"
    }} onClick={()=>setAberto(!aberto)}>
      {/* Header do departamento */}
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${dep.border}`,
        display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:26}}>{dep.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:800,color:dep.cor}}>{dep.nome}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
            {dep.processos.map(p=>(
              <span key={p} style={{fontSize:10,background:"rgba(0,0,0,0.08)",
                padding:"1px 8px",borderRadius:20,color:dep.cor,fontWeight:600}}>{p}</span>
            ))}
          </div>
        </div>
        <span style={{fontSize:11,color:dep.cor,fontWeight:700}}>{aberto?"▲":"▼"}</span>
      </div>
      {/* Responsabilidades */}
      {aberto && (
        <div style={{padding:"12px 16px"}}>
          <strong style={{fontSize:12,display:"block",marginBottom:8,color:dep.cor}}>
            📋 Responsabilidades:
          </strong>
          <ul style={{margin:0,paddingLeft:18}}>
            {dep.responsabilidades.map((r,i)=>(
              <li key={i} style={{fontSize:12,color:"var(--text-secondary)",marginBottom:4,lineHeight:1.5}}>{r}</li>
            ))}
          </ul>
          <strong style={{fontSize:12,display:"block",margin:"12px 0 6px",color:dep.cor}}>
            🔗 Telas no Odoo:
          </strong>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {dep.odooTelas.map(t=>(
              <a key={t.l} href={t.l} target="_blank" rel="noreferrer"
                 className="oa-etapa-link" onClick={e=>e.stopPropagation()}
                 style={{marginTop:0,padding:"5px 12px",fontSize:11,display:"inline-flex",width:"fit-content"}}>
                <ExternalLink size={11}/>{t.t}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TabOrganograma() {
  const [visao, setVisao] = useState("org");

  const handleDownloadDrawio = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1800" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1654" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <!-- TITULO -->
    <mxCell id="tit" value="Organograma de Processos — Axion Tecnologia" style="text;html=1;fontSize=20;fontStyle=1;fillColor=none;strokeColor=none;align=center;" vertex="1" parent="1"><mxGeometry x="100" y="20" width="1400" height="40" as="geometry"/></mxCell>
    <!-- LINHA CENTRAL -->
    <mxCell id="centro" value="AXION TECNOLOGIA&#xa;ERP Odoo" style="ellipse;whiteSpace=wrap;html=1;fillColor=#1e40af;fontColor=#ffffff;strokeColor=#1e3a8a;fontSize=14;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="750" y="100" width="150" height="80" as="geometry"/></mxCell>
    <!-- DEPARTAMENTOS -->
    <mxCell id="d1" value="💼 COMERCIAL&#xa;&#xa;• Criar Pedido de Venda&#xa;• Contratos de Locação&#xa;• Faturamento&#xa;Tela: Vendas / Locações" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=11;" vertex="1" parent="1"><mxGeometry x="100" y="80" width="200" height="120" as="geometry"/></mxCell>
    <mxCell id="d2" value="🛒 COMPRAS&#xa;&#xa;• Pedidos de Compra&#xa;• NF de Venda/Entrega&#xa;• Auditoria serial&#xa;Tela: Compras" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e0f2fe;strokeColor=#0284c7;fontSize=11;" vertex="1" parent="1"><mxGeometry x="350" y="80" width="200" height="120" as="geometry"/></mxCell>
    <mxCell id="d3" value="📦 ALMOXARIFADO&#xa;&#xa;• Receber + Serial 1&#xa;• Separar componentes&#xa;• Entregar + Serial 3&#xa;Tela: Inventário" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#cffafe;strokeColor=#0891b2;fontSize=11;" vertex="1" parent="1"><mxGeometry x="600" y="250" width="200" height="120" as="geometry"/></mxCell>
    <mxCell id="d4" value="📋 PCP / OPERADOR&#xa;&#xa;• Criar BOM / Versionar&#xa;• Criar Ordens de Produção&#xa;• Controle de materiais&#xa;Tela: Fabricação" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f3ff;strokeColor=#7c3aed;fontSize=11;" vertex="1" parent="1"><mxGeometry x="850" y="80" width="200" height="120" as="geometry"/></mxCell>
    <mxCell id="d5" value="🏭 PRODUÇÃO&#xa;&#xa;• Chão de Fábrica&#xa;• Montar + Serial 2&#xa;• Testes e configuração&#xa;Tela: Chão de Fábrica" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f0fdf4;strokeColor=#059669;fontSize=11;" vertex="1" parent="1"><mxGeometry x="1100" y="80" width="200" height="120" as="geometry"/></mxCell>
    <mxCell id="d6" value="🔍 QUALIDADE&#xa;&#xa;• Checklist QC na OP&#xa;• Inspecionar retorno&#xa;• Aprovar produto&#xa;Tela: Qualidade" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fffbeb;strokeColor=#d97706;fontSize=11;" vertex="1" parent="1"><mxGeometry x="1350" y="80" width="200" height="120" as="geometry"/></mxCell>
    <!-- PROCESSOS HORIZONTAIS -->
    <mxCell id="p1h" value="PROCESSO 1: COMPRA + RECEBIMENTO" style="text;html=1;fontStyle=1;fontSize=12;fillColor=#dbeafe;strokeColor=#2563eb;" vertex="1" parent="1"><mxGeometry x="100" y="280" width="350" height="30" as="geometry"/></mxCell>
    <mxCell id="p1a" value="Compras: PO" style="rounded=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=10;" vertex="1" parent="1"><mxGeometry x="100" y="320" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p1b" value="Almox: Receber&#xa;+ Serial 1" style="rounded=1;fillColor=#cffafe;strokeColor=#0891b2;fontSize=10;" vertex="1" parent="1"><mxGeometry x="220" y="320" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p1c" value="Almox: Validar&#xa;Recebimento" style="rounded=1;fillColor=#cffafe;strokeColor=#0891b2;fontSize=10;" vertex="1" parent="1"><mxGeometry x="340" y="320" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p1e1" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p1a" target="p1b" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p1e2" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p1b" target="p1c" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p2h" value="PROCESSO 2: PRODUÇÃO COMPLETA" style="text;html=1;fontStyle=1;fontSize=12;fillColor=#f5f3ff;strokeColor=#7c3aed;" vertex="1" parent="1"><mxGeometry x="100" y="390" width="1000" height="30" as="geometry"/></mxCell>
    <mxCell id="p2a" value="PCP: BOM" style="rounded=1;fillColor=#f5f3ff;strokeColor=#7c3aed;fontSize=10;" vertex="1" parent="1"><mxGeometry x="100" y="430" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p2b" value="PCP: Criar OP" style="rounded=1;fillColor=#f5f3ff;strokeColor=#7c3aed;fontSize=10;" vertex="1" parent="1"><mxGeometry x="220" y="430" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p2c" value="Almox: Separar&#xa;Componentes" style="rounded=1;fillColor=#cffafe;strokeColor=#0891b2;fontSize=10;" vertex="1" parent="1"><mxGeometry x="340" y="430" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p2d" value="Prod: Montar&#xa;(Chão Fábrica)" style="rounded=1;fillColor=#f0fdf4;strokeColor=#059669;fontSize=10;" vertex="1" parent="1"><mxGeometry x="460" y="430" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p2e" value="QC: Checklist" style="rounded=1;fillColor=#fffbeb;strokeColor=#d97706;fontSize=10;" vertex="1" parent="1"><mxGeometry x="580" y="430" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p2f" value="Prod: Concluir&#xa;+ Serial 2" style="rounded=1;fillColor=#ffe6cc;strokeColor=#d6b656;fontStyle=1;fontSize=10;" vertex="1" parent="1"><mxGeometry x="700" y="430" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p2e1" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p2a" target="p2b" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p2e2" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p2b" target="p2c" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p2e3" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p2c" target="p2d" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p2e4" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p2d" target="p2e" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p2e5" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p2e" target="p2f" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p3h" value="PROCESSO 3: VENDA + ENTREGA" style="text;html=1;fontStyle=1;fontSize=12;fillColor=#dbeafe;strokeColor=#2563eb;" vertex="1" parent="1"><mxGeometry x="100" y="500" width="500" height="30" as="geometry"/></mxCell>
    <mxCell id="p3a" value="Comercial:&#xa;Pedido Venda" style="rounded=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=10;" vertex="1" parent="1"><mxGeometry x="100" y="540" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p3b" value="Almox: Selecionar&#xa;Serial" style="rounded=1;fillColor=#cffafe;strokeColor=#0891b2;fontSize=10;" vertex="1" parent="1"><mxGeometry x="220" y="540" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p3c" value="Almox: Validar&#xa;Entrega Serial 3" style="rounded=1;fillColor=#ffe6cc;strokeColor=#d6b656;fontStyle=1;fontSize=10;" vertex="1" parent="1"><mxGeometry x="340" y="540" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p3d" value="Compras: NF" style="rounded=1;fillColor=#e0f2fe;strokeColor=#0284c7;fontSize=10;" vertex="1" parent="1"><mxGeometry x="460" y="540" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="p3e1" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p3a" target="p3b" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p3e2" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p3b" target="p3c" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p3e3" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p3c" target="p3d" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p4h" value="PROCESSO 4: LOCAÇÃO" style="text;html=1;fontStyle=1;fontSize=12;fillColor=#f5f3ff;strokeColor=#7c3aed;" vertex="1" parent="1"><mxGeometry x="100" y="610" width="700" height="30" as="geometry"/></mxCell>
    <mxCell id="p4a" value="Comercial:&#xa;Contrato" style="rounded=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=10;" vertex="1" parent="1"><mxGeometry x="100" y="650" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p4b" value="QC: Inspecionar" style="rounded=1;fillColor=#fffbeb;strokeColor=#d97706;fontSize=10;" vertex="1" parent="1"><mxGeometry x="210" y="650" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p4c" value="Almox: Saída&#xa;+ Serial" style="rounded=1;fillColor=#ffe6cc;strokeColor=#d6b656;fontStyle=1;fontSize=10;" vertex="1" parent="1"><mxGeometry x="320" y="650" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p4d" value="Cliente: Uso" style="rounded=1;fillColor=#f3f4f6;strokeColor=#9ca3af;fontSize=10;" vertex="1" parent="1"><mxGeometry x="430" y="650" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p4e" value="Almox: Retorno&#xa;+ Inspeção" style="rounded=1;fillColor=#ffe6cc;strokeColor=#d6b656;fontStyle=1;fontSize=10;" vertex="1" parent="1"><mxGeometry x="540" y="650" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p4f" value="Comercial:&#xa;Faturar" style="rounded=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=10;" vertex="1" parent="1"><mxGeometry x="650" y="650" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p4e1" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p4a" target="p4b" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p4e2" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p4b" target="p4c" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p4e3" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p4c" target="p4d" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p4e4" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p4d" target="p4e" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p4e5" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p4e" target="p4f" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p5h" value="PROCESSO 5: COMBO / KIT" style="text;html=1;fontStyle=1;fontSize=12;fillColor=#fffbeb;strokeColor=#d97706;" vertex="1" parent="1"><mxGeometry x="100" y="720" width="400" height="30" as="geometry"/></mxCell>
    <mxCell id="p5a" value="Comercial:&#xa;Venda Kit" style="rounded=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=10;" vertex="1" parent="1"><mxGeometry x="100" y="760" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p5b" value="Odoo: Explode&#xa;Kit nas peças" style="rounded=1;fillColor=#e0f2fe;strokeColor=#0284c7;fontSize=10;" vertex="1" parent="1"><mxGeometry x="210" y="760" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p5c" value="Almox: Separar&#xa;+ Seriais" style="rounded=1;fillColor=#cffafe;strokeColor=#0891b2;fontSize=10;" vertex="1" parent="1"><mxGeometry x="320" y="760" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p5d" value="Almox: Entregar&#xa;peças" style="rounded=1;fillColor=#ffe6cc;strokeColor=#d6b656;fontStyle=1;fontSize=10;" vertex="1" parent="1"><mxGeometry x="430" y="760" width="90" height="40" as="geometry"/></mxCell>
    <mxCell id="p5e1" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p5a" target="p5b" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p5e2" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p5b" target="p5c" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p5e3" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="p5c" target="p5d" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- LEGENDA SERIAL -->
    <mxCell id="leg" value="★ Laranja = Ponto de geração/registro de SERIAL" style="text;html=1;fillColor=#ffe6cc;strokeColor=#d6b656;fontStyle=1;fontSize=11;" vertex="1" parent="1"><mxGeometry x="100" y="840" width="450" height="30" as="geometry"/></mxCell>
    <!-- CONEXOES DEP PARA CENTRO -->
    <mxCell id="ce1" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" source="d1" target="centro" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="ce2" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" source="d2" target="centro" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="ce3" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" source="d3" target="centro" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="ce4" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" source="d4" target="centro" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="ce5" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" source="d5" target="centro" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="ce6" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" source="d6" target="centro" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>`;
    const blob = new Blob([xml], {type:"text/xml"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Axion_Organograma_Processos.drawio";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="oa-content">
      <OdooLinkBar/>

      {/* Sub-navegação */}
      <div className="oa-chao-nav">
        {[
          {id:"org",     label:"🏢 Organograma por Departamento"},
          {id:"matriz",  label:"🔀 Matriz Processo × Departamento"},
          {id:"drawio",  label:"📐 Exportar Draw.io"},
        ].map(v=>(
          <button key={v.id} className={`oa-chao-btn ${visao===v.id?"oa-chao-btn--ativo":""}`}
            onClick={()=>setVisao(v.id)}>{v.label}</button>
        ))}
      </div>

      {/* ═══ ORGANOGRAMA POR DEPARTAMENTO ═══ */}
      {visao === "org" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-blue">
            <Info size={16}/>
            <div>Clique em cada departamento para ver as responsabilidades detalhadas e os links diretos para as telas do Odoo.</div>
          </div>

          {/* Hub central */}
          <div style={{
            background:"linear-gradient(135deg,#1e3a8a,#2563eb)",
            borderRadius:14,padding:"18px 24px",
            display:"flex",alignItems:"center",gap:16,
            boxShadow:"0 4px 20px rgba(37,99,235,0.3)"
          }}>
            <span style={{fontSize:36}}>🏭</span>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>AXION TECNOLOGIA</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>ERP Odoo — 5 processos | 6 departamentos | 3 pontos de serial</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
              {["Compra","Produção","Venda","Kit/Combo","Locação"].map(p=>(
                <span key={p} style={{fontSize:11,background:"rgba(255,255,255,0.15)",
                  padding:"3px 10px",borderRadius:20,color:"#fff",fontWeight:600}}>{p}</span>
              ))}
            </div>
          </div>

          {/* Grid de departamentos */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12}}>
            {DEPARTAMENTOS.map(dep => <DepCard key={dep.id} dep={dep}/>)}
          </div>
        </div>
      )}

      {/* ═══ MATRIZ PROCESSO × DEPARTAMENTO ═══ */}
      {visao === "matriz" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-green">
            <CheckCircle size={16}/>
            <div>Cada processo mostra as etapas em sequência com o departamento responsável. As cores representam os departamentos.</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {MATRIZ_PROCESSOS.map((proc,pi)=>(
              <div key={pi} style={{
                background:"var(--surface)",border:"1px solid var(--border)",
                borderRadius:12,overflow:"hidden",boxShadow:"var(--card-shadow)"
              }}>
                <div style={{
                  padding:"12px 18px",
                  background:"var(--surface-raised)",
                  borderBottom:"1px solid var(--border)",
                  fontSize:14,fontWeight:800,color:"var(--text)"
                }}>{proc.proc}</div>
                <div style={{padding:"12px 16px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  {proc.etapas.map((et,ei)=>{
                    const dep = DEPARTAMENTOS.find(d=>d.nome===et.dep||d.id===et.dep.toLowerCase().replace(" / ","").replace(" ",""));
                    const cor = dep?.cor||"#6b7280";
                    const bg  = dep?.bg||"#f3f4f6";
                    const border = dep?.border||"#d1d5db";
                    return (
                      <React.Fragment key={ei}>
                        <div style={{
                          padding:"8px 12px",borderRadius:8,textAlign:"center",
                          background:bg,border:`1px solid ${border}`,minWidth:100,maxWidth:150
                        }}>
                          <div style={{fontSize:10,fontWeight:700,color:cor,marginBottom:3}}>{et.dep}</div>
                          <div style={{fontSize:11,color:"var(--text-secondary)",lineHeight:1.4}}>{et.acao}</div>
                        </div>
                        {ei < proc.etapas.length-1 && <ArrowRight size={14} color="var(--border-hover)" style={{flexShrink:0}}/>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="oa-section">
            <h3>🎨 Legenda de Departamentos</h3>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {DEPARTAMENTOS.map(d=>(
                <span key={d.id} style={{
                  display:"flex",alignItems:"center",gap:6,
                  padding:"5px 12px",borderRadius:20,
                  background:d.bg,border:`1px solid ${d.border}`,
                  fontSize:12,fontWeight:600,color:d.cor
                }}>{d.icon} {d.nome}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ EXPORT DRAWIO ═══ */}
      {visao === "drawio" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="oa-info-box oa-info-blue">
            <BookOpen size={16}/>
            <div>O arquivo <strong>.drawio</strong> contém o organograma completo com os 6 departamentos e os 5 processos com suas etapas. Abra no Draw.io para editar.</div>
          </div>
          <div className="oa-section">
            <h3>📐 Organograma — Visão Prévia</h3>
            <div style={{background:"var(--surface-raised)",border:"1px solid var(--border)",borderRadius:10,padding:16,overflowX:"auto"}}>
              {/* Visualização simplificada */}
              <div style={{display:"flex",flexDirection:"column",gap:10,minWidth:700}}>
                {/* Centro */}
                <div style={{display:"flex",justifyContent:"center"}}>
                  <div style={{background:"#1e3a8a",color:"#fff",padding:"10px 24px",borderRadius:10,fontWeight:800,fontSize:14}}>
                    🏭 AXION TECNOLOGIA — ERP Odoo
                  </div>
                </div>
                {/* Departamentos */}
                <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                  {DEPARTAMENTOS.map(d=>(
                    <div key={d.id} style={{
                      padding:"8px 12px",borderRadius:8,textAlign:"center",
                      background:d.bg,border:`1.5px solid ${d.border}`,
                      fontSize:11,fontWeight:700,color:d.cor,minWidth:100
                    }}>{d.icon} {d.nome}</div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"center"}}>
                  <ArrowRight size={14} color="var(--border-hover)" style={{transform:"rotate(90deg)"}}/>
                </div>
                {/* Processos */}
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {MATRIZ_PROCESSOS.map((p,i)=>(
                    <div key={i} style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontSize:11,fontWeight:700,color:"var(--text)",minWidth:200}}>{p.proc}</span>
                      {p.etapas.map((e,j)=>(
                        <React.Fragment key={j}>
                          <span style={{fontSize:10,padding:"3px 8px",borderRadius:6,
                            background:"var(--table-row-hover)",color:"var(--text-secondary)",border:"1px solid var(--border)"}}>
                            {e.dep}: {e.acao.substring(0,20)}{e.acao.length>20?"...":""}
                          </span>
                          {j<p.etapas.length-1 && <ArrowRight size={10} color="#9ca3af"/>}
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:12,marginTop:16,flexWrap:"wrap"}}>
              <button className="oa-btn-download" onClick={handleDownloadDrawio}>
                <Download size={16}/> Baixar Axion_Organograma_Processos.drawio
              </button>
              <a href="https://app.diagrams.net/?splash=0" target="_blank" rel="noreferrer" className="oa-etapa-link" style={{marginTop:0}}>
                <ExternalLink size={14}/> Abrir Draw.io Online
              </a>
            </div>
            <div className="oa-steps" style={{marginTop:14}}>
              <div className="oa-step">1. Clique em "Baixar" para salvar o arquivo <code>.drawio</code></div>
              <div className="oa-step">2. Acesse <strong>app.diagrams.net</strong> ou abra o <strong>Draw.io Desktop</strong></div>
              <div className="oa-step">3. <code>Diagrama → Importar de → Aparelho</code> → selecione o arquivo</div>
              <div className="oa-step">4. O organograma com todos os 5 processos abre com cores por departamento</div>
              <div className="oa-step">5. Edite, adicione campos ou exporte como PDF/PNG para apresentações</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OdooAnalisador() {  const [tab, setTab] = useState("fluxo");
  const tabContent = {
    mapa:      <TabMapa/>,
    org:       <TabOrganograma/>,
    fluxo:     <TabFluxo/>,
    guia:      <TabGuia/>,
    hipoteses: <TabHipoteses/>,
    serial:    <TabSerial/>,
    bom:       <TabBOM/>,
    prod:      <TabProducao/>,
    chao:      <TabChaoFabrica/>,
    cenario:   <TabCenario/>,
    bizagi:    <TabBizagi/>,
  };
  return (
    <div className="oa-root">
      <div className="oa-hero">
        <div className="oa-hero-icon"><BarChart3 size={28}/></div>
        <div>
          <h1>Odoo Analisador</h1>
          <p>Análise completa — Produto → Compra → Produção → Entrega com rastreabilidade serial de ponta a ponta</p>
        </div>
        <a href="https://santiago-sola-neto.odoo.com/odoo" target="_blank" rel="noreferrer" className="oa-hero-link">
          <ExternalLink size={13}/> Abrir Odoo
        </a>
      </div>
      <div className="oa-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`oa-tab ${tab === t.id ? "oa-tab--ativo" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="oa-body">{tabContent[tab]}</div>
    </div>
  );
}
