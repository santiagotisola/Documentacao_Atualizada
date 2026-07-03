/**
 * CUTI — Central Unificada de Testes Inteligentes
 * Versão 6: modo duplo
 *  · Aba "Processos" — mapa multi-produto AxHub | AxCross | AxTon
 *  · Aba "Ferramentas" — gravação de cenários, biblioteca, scripts dos manuais, builder
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play, CheckCircle, XCircle, RefreshCw, Clock,
  ChevronDown, ChevronRight, Video, Library,
  FileText, Wrench, Circle, Square, BookOpen, KeyRound, Eye, EyeOff, Save,
  ArrowRight, Link2, Download, Upload,
} from 'lucide-react';
import { useSiteContext } from '../../context/SiteContext.jsx';
import { apiFetch } from '../../services/api.js';
import { AXHUB_SITES, AXCROSS_SITES } from '../../data/sitesData';
import DataInputForm        from './components/DataInputForm';
import ExecutionProgress    from './components/ExecutionProgress';
import ManualScriptSelector from './components/ManualScriptSelector';
import ScriptBuilder        from './components/ScriptBuilder';
import './CUTI.css';

// ═══════════════════════════════════════════════════════════════
// SCHEMAS — ciclos Puppeteer já implementados
// ═══════════════════════════════════════════════════════════════
const SCHEMAS = {
  'equipment-cycle': {
    id: 'equipment-cycle',
    name: 'Ciclo Completo — Cadastro de Equipamentos',
    steps: 8,
    endpoint: '/api/manual-scripts/execute/equipment-cycle',
    dataSchema: {
      fields: [
        { name: 'fabricante_nome',     label: 'Nome do Fabricante',      type: 'text',   required: true,  group: 'Fabricante',  defaultValue: '', placeholder: 'Ex: AXION TECNOLOGIA' },
        { name: 'fabricante_slug',     label: 'Slug (ID único)',         type: 'text',   required: false, group: 'Fabricante',  defaultValue: '', placeholder: 'Ex: axion-tec' },
        { name: 'tipo_nome',           label: 'Tipo de Equipamento',     type: 'text',   required: true,  group: 'Tipo',        defaultValue: '', placeholder: 'Ex: RADAR FIXO' },
        { name: 'modelo_marca',        label: 'Marca do Modelo',         type: 'text',   required: true,  group: 'Modelo',      defaultValue: '', placeholder: 'Ex: VELSIS' },
        { name: 'modelo_nome',         label: 'Nome/Código do Modelo',   type: 'text',   required: true,  group: 'Modelo',      defaultValue: '', placeholder: 'Ex: VSIS-OCR-2026' },
        { name: 'modelo_portaria_num', label: 'Nº da Portaria INMETRO',  type: 'text',   required: true,  group: 'Modelo',      defaultValue: '', placeholder: 'Ex: 245/2022' },
        { name: 'modelo_portaria',     label: 'Descrição da Portaria',   type: 'text',   required: true,  group: 'Modelo',      defaultValue: '', placeholder: 'Ex: PORTARIA INMETRO/DIMEL No 245/2022' },
        { name: 'grupo_nome',          label: 'Nome do Grupo',           type: 'text',   required: true,  group: 'Grupo',       defaultValue: '', placeholder: 'Ex: GRUPO TESTE 2026' },
        { name: 'equip_serie',         label: 'Número de Série',         type: 'text',   required: true,  group: 'Equipamento', defaultValue: '', placeholder: 'Ex: SN-20260001' },
        { name: 'equip_codigo',        label: 'Código do Equipamento',   type: 'text',   required: true,  group: 'Equipamento', defaultValue: '', placeholder: 'Ex: AXT-2026-001' },
        { name: 'equip_cert_inmetro',  label: 'Certificado INMETRO',     type: 'text',   required: true,  group: 'Equipamento', defaultValue: '', placeholder: 'Ex: CERT-2026-001' },
        { name: 'faixa_codigo',        label: 'Código da Faixa',         type: 'text',   required: false, group: 'Faixa',       defaultValue: '', placeholder: 'Ex: FX-AXT001-01' },
        { name: 'faixa_sentido',       label: 'Sentido',                 type: 'select', required: false, group: 'Faixa',       defaultValue: 'CRESCENTE', options: ['CRESCENTE', 'DECRESCENTE'] },
        { name: 'faixa_logradouro',    label: 'Logradouro',              type: 'text',   required: false, group: 'Faixa',       defaultValue: '', placeholder: 'Ex: AV. PAULISTA' },
        { name: 'faixa_bairro',        label: 'Bairro',                  type: 'text',   required: false, group: 'Faixa',       defaultValue: '', placeholder: 'Ex: CENTRO' },
        { name: 'faixa_municipio',     label: 'Município',               type: 'text',   required: false, group: 'Faixa',       defaultValue: '', placeholder: 'Ex: GOIÂNIA' },
        { name: 'faixa_uf',            label: 'UF',                      type: 'text',   required: false, group: 'Faixa',       defaultValue: '', placeholder: 'Ex: GO' },
      ],
    },
  },
  'admin-cycle': {
    id: 'admin-cycle',
    name: 'Ciclo Admin — Arco e Motivo de Descarte',
    steps: 4,
    endpoint: '/api/manual-scripts/execute/admin-cycle',
    dataSchema: {
      fields: [
        { name: 'arco_nome',        label: 'Nome do Arco',        type: 'text', required: true,  group: 'Arco',               defaultValue: '', placeholder: 'Ex: ARCO TESTE 2026' },
        { name: 'arco_localizacao', label: 'Localização do Arco', type: 'text', required: false, group: 'Arco',               defaultValue: '', placeholder: 'Ex: AV. PAULISTA, KM 10' },
        { name: 'motivo_codigo',    label: 'Código do Motivo',    type: 'text', required: true,  group: 'Motivo de Descarte', defaultValue: '', placeholder: 'Ex: MOT-TEST-001' },
        { name: 'motivo_descricao', label: 'Descrição do Motivo', type: 'text', required: true,  group: 'Motivo de Descarte', defaultValue: '', placeholder: 'Ex: Imagem ilegível (teste)' },
      ],
    },
  },
  'axcross-cycle': {
    id: 'axcross-cycle',
    name: 'Ciclo AxCross — Área, Grupo, Equipamento, Veículo',
    steps: 6,
    endpoint: '/api/manual-scripts/execute/axcross-cycle',
    dataSchema: {
      fields: [
        { name: 'area_nome',    label: 'Área — Nome',             type: 'text', required: true,  group: 'Área',            defaultValue: '', placeholder: 'Ex: CRUZAMENTO TESTE 01' },
        { name: 'area_codigo',  label: 'Área — Código',           type: 'text', required: true,  group: 'Área',            defaultValue: '', placeholder: 'Ex: CRZ-001' },
        { name: 'area_cor',     label: 'Área — Cor (hex)',         type: 'text', required: false, group: 'Área',            defaultValue: '', placeholder: 'Ex: #3498DB' },
        { name: 'grupo_nome',   label: 'Grupo — Nome',            type: 'text', required: true,  group: 'Grupo',           defaultValue: '', placeholder: 'Ex: GRUPO CÂMERAS TESTE' },
        { name: 'equip_codigo', label: 'Equipamento — Código',    type: 'text', required: true,  group: 'Equipamento',     defaultValue: '', placeholder: 'Ex: EQ-AXC-2026-001' },
        { name: 'equip_serie',  label: 'Equipamento — Série',     type: 'text', required: true,  group: 'Equipamento',     defaultValue: '', placeholder: 'Ex: SN-AXC-2026-001' },
        { name: 'equip_codext', label: 'Equipamento — Cód. Ext.', type: 'text', required: false, group: 'Equipamento',     defaultValue: '', placeholder: 'Ex: EXT-001' },
        { name: 'equip_lat',    label: 'Latitude',                type: 'text', required: false, group: 'Equipamento',     defaultValue: '', placeholder: 'Ex: -23.5505' },
        { name: 'equip_lng',    label: 'Longitude',               type: 'text', required: false, group: 'Equipamento',     defaultValue: '', placeholder: 'Ex: -46.6333' },
        { name: 'veiculo_placa',    label: 'Veículo — Placa',     type: 'text', required: true,  group: 'Veículo Monitorado', defaultValue: '', placeholder: 'Ex: ABC1D23' },
        { name: 'veiculo_validade', label: 'Veículo — Validade',  type: 'text', required: false, group: 'Veículo Monitorado', defaultValue: '', placeholder: 'Ex: 2026-12-31' },
      ],
    },
  },
  'operacoes-cycle': {
    id: 'operacoes-cycle',
    name: 'Ciclo Operações — Aferição e Operação',
    steps: 4,
    endpoint: '/api/manual-scripts/execute/operacoes-cycle',
    dataSchema: {
      fields: [
        { name: 'afer_num_inmetro',   label: 'Aferição — N° INMETRO',      type: 'text', required: true,  group: 'Aferição', defaultValue: '', placeholder: 'Ex: INMETRO-2026-001' },
        { name: 'afer_num_lacre',     label: 'Aferição — N° Lacre',        type: 'text', required: false, group: 'Aferição', defaultValue: '', placeholder: 'Ex: LACRE-001' },
        { name: 'afer_num_laudo',     label: 'Aferição — N° Laudo',        type: 'text', required: false, group: 'Aferição', defaultValue: '', placeholder: 'Ex: LAUDO-2026-001' },
        { name: 'afer_data',          label: 'Aferição — Data',            type: 'text', required: true,  group: 'Aferição', defaultValue: '', placeholder: 'Ex: 01/01/2026' },
        { name: 'afer_data_validade', label: 'Aferição — Data Validade',   type: 'text', required: false, group: 'Aferição', defaultValue: '', placeholder: 'Ex: 01/01/2027' },
        { name: 'oper_codigo',        label: 'Operação — Código',          type: 'text', required: true,  group: 'Operação', defaultValue: '', placeholder: 'Ex: OP-2026-001' },
        { name: 'oper_data_inicio',   label: 'Operação — Data Início',     type: 'text', required: true,  group: 'Operação', defaultValue: '', placeholder: 'Ex: 01/01/2026' },
        { name: 'oper_data_fim',      label: 'Operação — Data Fim',        type: 'text', required: false, group: 'Operação', defaultValue: '', placeholder: 'Ex: 31/12/2026' },
        { name: 'oper_data_instal',   label: 'Operação — Data Instalação', type: 'text', required: true,  group: 'Operação', defaultValue: '', placeholder: 'Ex: 01/01/2026' },
        { name: 'oper_data_aceite',   label: 'Operação — Data Aceite',     type: 'text', required: false, group: 'Operação', defaultValue: '', placeholder: 'Ex: 15/01/2026' },
      ],
    },
  },
  'admin-full-cycle': {
    id: 'admin-full-cycle',
    name: 'Ciclo Admin Completo — Tipo Aferição, Tarja, Enquadramento, Região, Forma Autuação, Sequencial',
    steps: 8,
    endpoint: '/api/manual-scripts/execute/admin-full-cycle',
    dataSchema: {
      fields: [
        { name: 'tafer_codigo',    label: 'Tipo Aferição — Código',          type: 'text', required: true,  group: 'Tipo de Aferição', defaultValue: '', placeholder: 'Ex: TA-TEST-001' },
        { name: 'tafer_descricao', label: 'Tipo Aferição — Descrição',       type: 'text', required: true,  group: 'Tipo de Aferição', defaultValue: '', placeholder: 'Ex: AFERIÇÃO PERIÓDICA TESTE' },
        { name: 'tafer_validade',  label: 'Tipo Aferição — Validade (meses)',type: 'text', required: false, group: 'Tipo de Aferição', defaultValue: '', placeholder: 'Ex: 12' },
        { name: 'tarja_nome',      label: 'Tarja — Nome',                    type: 'text', required: true,  group: 'Tarja',            defaultValue: '', placeholder: 'Ex: TARJA PADRÃO TESTE' },
        { name: 'tarja_codigo',    label: 'Tarja — Código',                  type: 'text', required: false, group: 'Tarja',            defaultValue: '', placeholder: 'Ex: TRJ-TEST-001' },
        { name: 'enq_codigo',      label: 'Enquadramento — Código',          type: 'text', required: true,  group: 'Enquadramento',    defaultValue: '', placeholder: 'Ex: 218I-TESTE' },
        { name: 'enq_descricao',   label: 'Enquadramento — Descrição',       type: 'text', required: true,  group: 'Enquadramento',    defaultValue: '', placeholder: 'Ex: Excesso de velocidade (teste)' },
        { name: 'enq_velocidade',  label: 'Enquadramento — Velocidade (km/h)',type: 'text', required: false, group: 'Enquadramento',   defaultValue: '', placeholder: 'Ex: 80' },
        { name: 'reg_nome',        label: 'Região — Nome',                   type: 'text', required: true,  group: 'Região',           defaultValue: '', placeholder: 'Ex: REGIÃO TESTE' },
        { name: 'reg_uf',          label: 'Região — UF',                     type: 'text', required: false, group: 'Região',           defaultValue: '', placeholder: 'Ex: GO' },
        { name: 'reg_descricao',   label: 'Região — Descrição',              type: 'text', required: false, group: 'Região',           defaultValue: '', placeholder: 'Ex: Estado de Goiás (teste)' },
        { name: 'forma_nome',      label: 'Forma Autuação — Nome',           type: 'text', required: true,  group: 'Forma de Autuação',defaultValue: '', placeholder: 'Ex: ELETRÔNICA TESTE' },
        { name: 'forma_descricao', label: 'Forma Autuação — Descrição',      type: 'text', required: false, group: 'Forma de Autuação',defaultValue: '', placeholder: 'Ex: Auto de infração eletrônico' },
        { name: 'seq_codigo',      label: 'Sequencial — Código',             type: 'text', required: true,  group: 'Sequencial',       defaultValue: '', placeholder: 'Ex: SEQ-TEST-001' },
        { name: 'seq_prefixo',     label: 'Sequencial — Prefixo',            type: 'text', required: false, group: 'Sequencial',       defaultValue: '', placeholder: 'Ex: AUT' },
        { name: 'seq_num_inicial', label: 'Sequencial — Número Inicial',     type: 'text', required: false, group: 'Sequencial',       defaultValue: '', placeholder: 'Ex: 1' },
      ],
    },
  },

  // ── Ciclos de Correção de Diferenças ───────────────────────
  'reativar-monitoramento-cycle': {
    id: 'reativar-monitoramento-cycle',
    name: 'Reativar Monitoramento',
    steps: 4,
    endpoint: '/api/manual-scripts/execute/reativar-monitoramento',
    dataSchema: {
      fields: [
        { name: 'site_url',      label: 'URL do Site AxHub',          type: 'text',   required: true,  group: 'Site',        defaultValue: '', placeholder: 'https://site.axhub.axion.ws' },
        { name: 'equip_codigo',  label: 'Código do Equipamento',      type: 'text',   required: true,  group: 'Equipamento', defaultValue: '', placeholder: 'Ex: T1021' },
      ],
    },
  },
  'renovar-operacao-cycle': {
    id: 'renovar-operacao-cycle',
    name: 'Renovar Operação Expirada',
    steps: 5,
    endpoint: '/api/manual-scripts/execute/renovar-operacao',
    dataSchema: {
      fields: [
        { name: 'site_url',      label: 'URL do Site AxHub',          type: 'text',   required: true,  group: 'Site',        defaultValue: '', placeholder: 'https://site.axhub.axion.ws' },
        { name: 'equip_codigo',  label: 'Código do Equipamento',      type: 'text',   required: true,  group: 'Equipamento', defaultValue: '', placeholder: 'Ex: BA010C' },
        { name: 'nova_data_fim', label: 'Nova Data Final (DD/MM/AAAA)',type: 'text',   required: true,  group: 'Operação',    defaultValue: '', placeholder: 'Ex: 31/12/2027' },
      ],
    },
  },
  'completar-homologacao-cycle': {
    id: 'completar-homologacao-cycle',
    name: 'Completar Homologação INMETRO',
    steps: 3,
    endpoint: '/api/manual-scripts/execute/completar-homologacao',
    dataSchema: {
      fields: [
        { name: 'site_url',           label: 'URL do Site AxHub',              type: 'text', required: true,  group: 'Site',        defaultValue: '', placeholder: 'https://site.axhub.axion.ws' },
        { name: 'equip_codigo',       label: 'Código do Equipamento',          type: 'text', required: true,  group: 'Equipamento', defaultValue: '', placeholder: 'Ex: CE022C' },
        { name: 'data_homologacao',   label: 'Data de Homologação (DD/MM/AAAA)', type: 'text', required: true, group: 'Homologação', defaultValue: '', placeholder: 'Ex: 15/01/2026' },
        { name: 'cert_inmetro',       label: 'Nº Certificado INMETRO',         type: 'text', required: false, group: 'Homologação', defaultValue: '', placeholder: 'Ex: 245/2022' },
      ],
    },
  },
  'cadastrar-faixa-equip-cycle': {
    id: 'cadastrar-faixa-equip-cycle',
    name: 'Cadastrar Faixa no Equipamento',
    steps: 3,
    endpoint: '/api/manual-scripts/execute/cadastrar-faixa-equip',
    dataSchema: {
      fields: [
        { name: 'site_url',        label: 'URL do Site AxHub',         type: 'text',   required: true,  group: 'Site',        defaultValue: '', placeholder: 'https://site.axhub.axion.ws' },
        { name: 'equip_codigo',    label: 'Código do Equipamento',     type: 'text',   required: true,  group: 'Equipamento', defaultValue: '', placeholder: 'Ex: GYN2L513' },
        { name: 'faixa_codigo',    label: 'Código da Faixa',           type: 'text',   required: true,  group: 'Faixa',       defaultValue: '', placeholder: 'Ex: FX-GYN2L513-01' },
        { name: 'faixa_sentido',   label: 'Sentido',                   type: 'select', required: true,  group: 'Faixa',       defaultValue: 'CRESCENTE', options: ['CRESCENTE', 'DECRESCENTE'] },
        { name: 'faixa_logradouro',label: 'Logradouro',                type: 'text',   required: false, group: 'Faixa',       defaultValue: '', placeholder: 'Ex: AV. GOIÁS' },
        { name: 'faixa_municipio', label: 'Município',                 type: 'text',   required: false, group: 'Faixa',       defaultValue: '', placeholder: 'Ex: GOIÂNIA' },
        { name: 'faixa_uf',        label: 'UF',                        type: 'text',   required: false, group: 'Faixa',       defaultValue: '', placeholder: 'Ex: GO' },
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// CATÁLOGO — todos os processos documentados nos 3 manuais
// ═══════════════════════════════════════════════════════════════
const CATALOGO = {
  axhub: {
    label: 'AxHub', icon: '🚦', cor: '#6366f1',
    descricao: 'Gestão de infrações e fiscalização eletrônica',
    url: 'https://homologacao.axhub.axion.ws',
    modules: [
      {
        id: 'cadastros', label: 'Cadastros Básicos', icon: '🏗️',
        processos: [
          { id: 'fabricante',  label: 'Fabricante',       icon: '🏭', dep: [],                        status: 'automatizado', desc: 'Empresa fabricante do equipamento' },
          { id: 'tipo',        label: 'Tipo Equipamento', icon: '📋', dep: [],                        status: 'automatizado', desc: 'Tipo (radar fixo, lombada, etc.)' },
          { id: 'grupo',       label: 'Grupo',            icon: '🗂️', dep: [],                        status: 'automatizado', desc: 'Agrupamento de equipamentos' },
          { id: 'modelo',      label: 'Modelo',           icon: '🔧', dep: ['Fabricante'],            status: 'automatizado', desc: 'Modelo com portaria INMETRO' },
          { id: 'equipamento', label: 'Equipamento',      icon: '⚙️', dep: ['Modelo','Tipo','Grupo'], status: 'automatizado', desc: 'Unidade física de equipamento' },
          { id: 'faixa',       label: 'Faixa',            icon: '🛣️', dep: ['Equipamento'],           status: 'automatizado', desc: 'Faixa de aferição vinculada' },
        ],
        ciclos: [
          { id: 'equipment-cycle', label: 'Ciclo Completo de Equipamentos', processos: ['Fabricante','Tipo','Grupo','Modelo','Equipamento','Faixa'] },
        ],
      },
      {
        id: 'admin', label: 'Administração', icon: '⚙️',
        processos: [
          { id: 'arco',       label: 'Arco',               icon: '🌐', dep: [], status: 'automatizado', desc: 'Ponto de fiscalização para operações' },
          { id: 'motivo',     label: 'Motivo de Descarte', icon: '🗑️', dep: [], status: 'automatizado', desc: 'Justificativa para descarte de infrações' },
          { id: 'tip-afer',   label: 'Tipo de Aferição',   icon: '📐', dep: [], status: 'automatizado', desc: 'Classificação dos tipos de aferição' },
          { id: 'tarja',      label: 'Tarja',              icon: '🏷️', dep: [], status: 'automatizado', desc: 'Template de tarja nas imagens de infração' },
          { id: 'enquad',     label: 'Enquadramento',      icon: '📜', dep: [], status: 'automatizado', desc: 'Tabela de enquadramentos do CTB' },
          { id: 'regiao',     label: 'Região',             icon: '🗺️', dep: [], status: 'automatizado', desc: 'Regiões geográficas do sistema' },
          { id: 'forma-aut',  label: 'Forma de Autuação',  icon: '📑', dep: [], status: 'automatizado', desc: 'Forma legal de lavrar o auto' },
          { id: 'layout',     label: 'Layout de Arquivo',  icon: '📂', dep: [], status: 'documentado',  desc: 'Template de exportação de lotes (requer upload)' },
          { id: 'sequencial', label: 'Sequenciais',        icon: '🔢', dep: [], status: 'automatizado', desc: 'Numeração sequencial de infrações' },
          { id: 'webhook',    label: 'Webhook',            icon: '🔗', dep: [], status: 'documentado',  desc: 'Integração via eventos HTTP (requer URL externa)' },
        ],
        ciclos: [
          { id: 'admin-cycle',      label: 'Ciclo Admin (Arco + Motivo de Descarte)', processos: ['Arco','Motivo de Descarte'] },
          { id: 'admin-full-cycle', label: 'Ciclo Admin Completo (Tipo Aferição, Tarja, Enquadramento, Região, Forma Autuação, Sequencial)', processos: ['Tipo Aferição','Tarja','Enquadramento','Região','Forma Autuação','Sequencial'] },
        ],
      },
      {
        id: 'operacoes', label: 'Operações', icon: '🔄',
        processos: [
          { id: 'afericao',       label: 'Aferição',             icon: '📐', dep: ['Equipamento'],        status: 'automatizado', desc: 'Certificado INMETRO do equipamento' },
          { id: 'operacao',       label: 'Operação',             icon: '🎯', dep: ['Equipamento','Arco'], status: 'automatizado', desc: 'Operação de fiscalização ativa' },
          { id: 'consulta-placa', label: 'Consulta de Placas',   icon: '🔍', dep: [],                     status: 'documentado',  desc: 'Consulta de veículos por placa' },
          { id: 'monitoring',     label: 'Monitoramento Online', icon: '🖥️', dep: [],                     status: 'documentado',  desc: 'Status em tempo real dos equipamentos' },
        ],
        ciclos: [
          { id: 'operacoes-cycle', label: 'Ciclo Operações (Aferição + Operação)', processos: ['Aferição','Operação'] },
        ],
      },
      {
        id: 'infracoes', label: 'Infrações', icon: '🚨',
        processos: [
          { id: 'triagem',    label: 'Triagem',    icon: '✅', dep: [], status: 'documentado', desc: 'Revisão e validação de infrações pendentes' },
          { id: 'auditoria',  label: 'Auditoria',  icon: '🔍', dep: [], status: 'documentado', desc: 'Auditoria das triagens realizadas' },
          { id: 'consulta',   label: 'Consulta',   icon: '🔎', dep: [], status: 'documentado', desc: 'Consulta geral de infrações' },
          { id: 'exportacao', label: 'Exportação', icon: '📤', dep: [], status: 'documentado', desc: 'Exportação de lotes para órgão autuador' },
          { id: 'excecoes',   label: 'Exceções',   icon: '⚠️', dep: [], status: 'documentado', desc: 'Exceções ao processamento padrão' },
        ],
        ciclos: [],
      },
      {
        id: 'correcao-diferenca',
        label: 'Dashboard × Operação',
        icon: '🔧',
        tipo: 'diferenca',
        processos: [
          { id: 'reativar-mon',    label: 'Reativar Monitoramento',    icon: '✅', dep: ['Operação'],    status: 'automatizado', desc: 'Desmarca flag "Desabilitar Monitoramento" na operação do equipamento' },
          { id: 'renovar-op',     label: 'Renovar Operação Expirada', icon: '📅', dep: ['Operação'],    status: 'automatizado', desc: 'Atualiza Data Final da operação para reativar o monitoramento' },
          { id: 'completar-hom',  label: 'Completar Homologação',     icon: '📋', dep: ['Equipamento'], status: 'automatizado', desc: 'Preenche Data de Homologação INMETRO para liberar no dashboard' },
          { id: 'add-faixa-equip',label: 'Cadastrar Faixa',           icon: '🛣️', dep: ['Equipamento'], status: 'automatizado', desc: 'Cria faixa vinculada ao equipamento sem monitoramento' },
        ],
        ciclos: [
          { id: 'reativar-monitoramento-cycle', label: 'Reativar Monitoramento',        processos: ['Desabilitar Monitoramento → desmarcar'] },
          { id: 'renovar-operacao-cycle',       label: 'Renovar Operação Expirada',     processos: ['DataFinal → nova data'] },
          { id: 'completar-homologacao-cycle',  label: 'Completar Homologação INMETRO', processos: ['DataHomologação → preencher'] },
          { id: 'cadastrar-faixa-equip-cycle',  label: 'Cadastrar Faixa no Equipamento',processos: ['Faixa → criar e vincular'] },
        ],
      },
    ],
  },

  axcross: {
    label: 'AxCross', icon: '📡', cor: '#10b981',
    descricao: 'Monitoramento de cruzamentos viários',
    url: 'https://homologacao.axcross.axion.ws',
    modules: [
      {
        id: 'cadastros', label: 'Cadastros', icon: '🏗️',
        processos: [
          { id: 'local',       label: 'Área (Local/Cruzamento)', icon: '📍', dep: [],              status: 'automatizado', desc: 'Cruzamento ou ponto monitorado' },
          { id: 'grupo-equip', label: 'Grupo Equipamento',       icon: '🗂️', dep: [],              status: 'automatizado', desc: 'Agrupamento de equipamentos' },
          { id: 'equipamento', label: 'Equipamento',             icon: '📷', dep: ['Local'],       status: 'automatizado', desc: 'Câmera/sensor instalado no cruzamento' },
          { id: 'faixa',       label: 'Faixa',                   icon: '🛣️', dep: ['Equipamento'], status: 'automatizado', desc: 'Faixa monitorada no cruzamento' },
        ],
        ciclos: [
          { id: 'axcross-cycle', label: 'Ciclo AxCross (Área + Grupo + Equipamento + Faixa + Veículo)', processos: ['Área','Grupo','Equipamento','Faixa','Veículo Monitorado'] },
        ],
      },
      {
        id: 'operacoes', label: 'Operações', icon: '🔄',
        processos: [
          { id: 'operacao',   label: 'Operação',             icon: '🎯', dep: ['Local'],              status: 'planejado',   desc: 'Operação de fiscalização no cruzamento' },
          { id: 'veiculo-m',  label: 'Veículo Monitorado',   icon: '🚗', dep: [],                     status: 'automatizado', desc: 'Veículos em lista de monitoramento ativo' },
          { id: 'alerta',     label: 'Alerta',               icon: '🔔', dep: ['Veículo Monitorado'], status: 'planejado',   desc: 'Alerta gerado por detecção de veículo' },
          { id: 'monitoring', label: 'Monitoramento Online', icon: '🖥️', dep: [],                     status: 'documentado', desc: 'Acompanhamento em tempo real' },
        ],
        ciclos: [],
      },
      {
        id: 'relatorios', label: 'Relatórios', icon: '📊',
        processos: [
          { id: 'passagens',      label: 'Relatório de Passagens', icon: '📋', dep: [], status: 'documentado', desc: 'Passagens detectadas pelos equipamentos' },
          { id: 'rastreio-placa', label: 'Rastreio de Placa',      icon: '🔍', dep: [], status: 'documentado', desc: 'Histórico de passagens por placa' },
        ],
        ciclos: [],
      },
    ],
  },

  axton: {
    label: 'AxTon', icon: '⚖️', cor: '#f59e0b',
    descricao: 'Pesagem veicular em rodovias',
    url: null,
    modules: [
      {
        id: 'cadastros-basicos', label: 'Cadastros Básicos', icon: '🏗️',
        processos: [
          { id: 'fabricante',  label: 'Fabricante',       icon: '🏭', dep: [],                        status: 'planejado', desc: 'Fabricante de equipamento de pesagem' },
          { id: 'tipo',        label: 'Tipo Equipamento', icon: '📋', dep: [],                        status: 'planejado', desc: 'Balança, sensor, câmera' },
          { id: 'modelo',      label: 'Modelo',           icon: '🔧', dep: ['Fabricante'],            status: 'planejado', desc: 'Modelo homologado INMETRO' },
          { id: 'grupo',       label: 'Grupo',            icon: '🗂️', dep: [],                        status: 'planejado', desc: 'Agrupamento de equipamentos' },
          { id: 'equipamento', label: 'Equipamento',      icon: '⚖️', dep: ['Modelo','Tipo','Grupo'], status: 'planejado', desc: 'Balança instalada no posto' },
        ],
        ciclos: [],
      },
      {
        id: 'cadastros', label: 'Cadastros', icon: '📋',
        processos: [
          { id: 'local',        label: 'Local (Posto)',         icon: '📍', dep: [], status: 'planejado',   desc: 'Posto de pesagem na rodovia' },
          { id: 'classif-veic', label: 'Classificação Veículo', icon: '🚛', dep: [], status: 'planejado',   desc: 'Classes de veículos para cálculo de PBT' },
          { id: 'seq-exp',      label: 'Sequencial Exportação', icon: '🔢', dep: [], status: 'documentado', desc: 'Numeração de lotes exportados' },
          { id: 'seq-inf',      label: 'Sequencial Infração',   icon: '🔢', dep: [], status: 'documentado', desc: 'Numeração de autos de infração' },
        ],
        ciclos: [],
      },
      {
        id: 'operacoes', label: 'Operações e Pesagem', icon: '🔄',
        processos: [
          { id: 'operacao', label: 'Operação',          icon: '🎯', dep: ['Local'],    status: 'planejado',   desc: 'Operação de fiscalização de pesagem' },
          { id: 'pesagem',  label: 'Pesagem',           icon: '⚖️', dep: ['Operação'], status: 'documentado', desc: 'Fluxo de pesagem com balança HAENNI' },
          { id: 'ticket',   label: 'Ticket de Pesagem', icon: '🎟️', dep: [],           status: 'documentado', desc: 'Registro de cada pesagem realizada' },
        ],
        ciclos: [],
      },
      {
        id: 'infracoes', label: 'Infrações', icon: '🚨',
        processos: [
          { id: 'infracao-peso', label: 'Infração por Peso', icon: '⚠️', dep: ['Pesagem'], status: 'documentado', desc: 'Geração automática por excesso de PBT' },
          { id: 'exportacao',    label: 'Exportação',         icon: '📤', dep: [],          status: 'documentado', desc: 'Envio ao órgão autuador' },
        ],
        ciclos: [],
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
const STATUS_META = {
  automatizado: { label: 'Automatizado', cor: '#10b981', bg: '#d1fae5' },
  documentado:  { label: 'Documentado',  cor: '#6366f1', bg: '#ede9fe' },
  planejado:    { label: 'Planejado',    cor: '#9ca3af', bg: '#f3f4f6' },
};

const calcCoverage = (produto) => {
  const all = produto.modules.flatMap(m => m.processos);
  return {
    total:        all.length,
    automatizado: all.filter(p => p.status === 'automatizado').length,
    documentado:  all.filter(p => p.status === 'documentado').length,
    planejado:    all.filter(p => p.status === 'planejado').length,
    ciclos:       produto.modules.flatMap(m => m.ciclos).length,
  };
};

// ═══════════════════════════════════════════════════════════════
// Sub-componente: GravacaoCenario
// ═══════════════════════════════════════════════════════════════
const GravacaoCenario = ({ onHistorico }) => {
  const [gravando, setGravando] = useState(false);
  const [scenarioId, setScenarioId] = useState(null);
  const [form, setForm] = useState({
    url: 'https://homologacao.axhub.axion.ws',
    sistema: 'AxHub',
    ambiente: 'homologacao',
    contrato: '',
    nome: '',
    categoria: '',
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const atualizar = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const iniciarGravacao = async () => {
    setLoading(true); setMsg(null);
    try {
      const r = await fetch('/api/scenarios/record/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url:         form.url,
          system:      form.sistema,
          environment: form.ambiente,
          contract:    form.contrato,
          name:        form.nome || `${form.sistema} — ${new Date().toLocaleTimeString('pt-BR')}`,
          category:    form.categoria || form.sistema,
        }),
      });
      const data = await r.json();
      if (r.ok) {
        setGravando(true);
        setScenarioId(data.scenarioId);
        setMsg({ tipo: 'info', texto: `Gravação iniciada (ID: ${data.scenarioId}). Execute o fluxo no navegador aberto.` });
      } else {
        setMsg({ tipo: 'erro', texto: data.error || 'Erro ao iniciar gravação' });
      }
    } catch (e) {
      setMsg({ tipo: 'erro', texto: e.message });
    } finally {
      setLoading(false);
    }
  };

  const pararGravacao = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/scenarios/record/stop', { method: 'POST' });
      const data = await r.json();
      if (r.ok) {
        setGravando(false);
        setMsg({ tipo: 'sucesso', texto: `Cenário "${data.scenarioId}" salvo com sucesso!` });
        onHistorico?.({ id: Date.now(), tipo: 'gravacao', ciclo: data.scenarioId, produto: form.sistema, status: 'success', ts: new Date().toLocaleTimeString('pt-BR') });
        setScenarioId(null);
      } else {
        setMsg({ tipo: 'erro', texto: data.error || 'Erro ao parar gravação' });
      }
    } catch (e) {
      setMsg({ tipo: 'erro', texto: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cuti-tool-panel">
      <div className="cuti-tool-header">
        <Video size={18} />
        <div>
          <h3>Gravar Cenário de Teste</h3>
          <p>Abre o navegador e grava cada ação que você executar — o cenário pode ser reexecutado automaticamente depois.</p>
        </div>
      </div>

      {msg && (
        <div className={`cuti-msg cuti-msg-${msg.tipo}`}>{msg.texto}</div>
      )}

      {!gravando ? (
        <div className="cuti-tool-form">
          <div className="cuti-tool-form-grid">
            <label>URL do Sistema *
              <input value={form.url} onChange={e => atualizar('url', e.target.value)} placeholder="https://..." />
            </label>
            <label>Sistema
              <select value={form.sistema} onChange={e => atualizar('sistema', e.target.value)}>
                <option>AxHub</option>
                <option>AxCross</option>
                <option>AxTon</option>
              </select>
            </label>
            <label>Ambiente
              <select value={form.ambiente} onChange={e => atualizar('ambiente', e.target.value)}>
                <option value="homologacao">Homologação</option>
                <option value="producao">Produção</option>
              </select>
            </label>
            <label>Contrato / Órgão
              <input value={form.contrato} onChange={e => atualizar('contrato', e.target.value)} placeholder="Ex: DETRAN-GO" />
            </label>
            <label>Nome do Cenário
              <input value={form.nome} onChange={e => atualizar('nome', e.target.value)} placeholder="Ex: Cadastrar Usuário Operador" />
            </label>
            <label>Categoria
              <input value={form.categoria} onChange={e => atualizar('categoria', e.target.value)} placeholder="Ex: Controle de Acesso" />
            </label>
          </div>
          <button className="cuti-v5-btn-primary" onClick={iniciarGravacao} disabled={loading || !form.url}>
            <Circle size={14} />
            {loading ? 'Iniciando…' : 'Iniciar Gravação'}
          </button>
        </div>
      ) : (
        <div className="cuti-gravando">
          <div className="cuti-gravando-badge">
            <span className="cuti-gravando-dot" />
            GRAVANDO — {scenarioId}
          </div>
          <p>Execute o fluxo desejado no navegador que foi aberto. Quando terminar, clique em &quot;Parar&quot;.</p>
          <button className="cuti-v5-btn-stop" onClick={pararGravacao} disabled={loading}>
            <Square size={14} />
            {loading ? 'Encerrando…' : 'Parar Gravação'}
          </button>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Sub-componente: BibliotecaCenarios
// ═══════════════════════════════════════════════════════════════
const BibliotecaCenarios = () => {
  const [cenarios, setCenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executando, setExecutando] = useState(null);
  const [resultados, setResultados] = useState({});
  const [filtro, setFiltro] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/scenarios');
      const data = await r.json();
      setCenarios(Array.isArray(data) ? data : []);
    } catch {
      setCenarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const executar = async (cenario) => {
    setExecutando(cenario.scenarioId);
    setResultados(p => ({ ...p, [cenario.scenarioId]: { status: 'executando' } }));
    try {
      const r = await fetch('/api/scenarios/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: cenario.scenarioId }),
      });
      const data = await r.json();
      setResultados(p => ({
        ...p,
        [cenario.scenarioId]: {
          status: data.success ? 'sucesso' : 'erro',
          passou: data.passed ?? 0,
          falhou: data.failed ?? 0,
          msg:    data.message ?? '',
        },
      }));
    } catch (e) {
      setResultados(p => ({ ...p, [cenario.scenarioId]: { status: 'erro', msg: e.message } }));
    } finally {
      setExecutando(null);
    }
  };

  const filtrados = cenarios.filter(c =>
    !filtro || c.name?.toLowerCase().includes(filtro.toLowerCase()) || c.category?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="cuti-tool-panel">
      <div className="cuti-tool-header">
        <Library size={18} />
        <div>
          <h3>Biblioteca de Cenários</h3>
          <p>Cenários gravados e prontos para reexecução automática.</p>
        </div>
        <button className="cuti-v5-btn-ghost cuti-ml-auto" onClick={carregar} disabled={loading}>
          <RefreshCw size={14} /> {loading ? 'Carregando…' : 'Atualizar'}
        </button>
      </div>

      <input
        className="cuti-filtro-input"
        placeholder="Filtrar por nome ou categoria…"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
      />

      {filtrados.length === 0 && !loading && (
        <div className="cuti-empty">
          {cenarios.length === 0
            ? 'Nenhum cenário gravado ainda. Use "Gravar Cenário" para criar o primeiro.'
            : 'Nenhum cenário corresponde ao filtro.'}
        </div>
      )}

      <div className="cuti-cenarios-list">
        {filtrados.map(c => {
          const res = resultados[c.scenarioId];
          return (
            <div key={c.scenarioId} className="cuti-cenario-card">
              <div className="cuti-cenario-info">
                <strong>{c.name || c.scenarioId}</strong>
                {c.category && <span className="cuti-cenario-cat">{c.category}</span>}
                <span className="cuti-cenario-meta">
                  {c.steps} passos
                  {c.duration > 0 && ` · ${(c.duration / 1000).toFixed(0)}s`}
                  {c.createdAt && ` · ${new Date(c.createdAt).toLocaleDateString('pt-BR')}`}
                </span>
              </div>
              <div className="cuti-cenario-actions">
                {res && (
                  <span className={`cuti-cenario-res cuti-cenario-res-${res.status}`}>
                    {res.status === 'executando' ? '⏳' : res.status === 'sucesso' ? '✅' : '❌'}
                    {res.status !== 'executando' && ` ${res.passou ?? ''}✓ ${res.falhou ?? ''}✗`}
                  </span>
                )}
                <button
                  className="cuti-v5-btn-executar"
                  onClick={() => executar(c)}
                  disabled={executando === c.scenarioId}
                >
                  <Play size={13} />
                  {executando === c.scenarioId ? 'Executando…' : 'Executar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Sub-componente: ScriptsDosManuais
// ═══════════════════════════════════════════════════════════════
const ScriptsDosManuais = ({ onExecutar }) => {
  const [selectedScript, setSelectedScript] = useState(null);
  const [customScripts, setCustomScripts] = useState([]);

  const handleBuilderSave = (built) => {
    setCustomScripts(p => [...p.filter(s => s.id !== built.id), built]);
    setSelectedScript(null);
  };

  if (selectedScript?._new || (selectedScript && !selectedScript.dataSchema)) {
    return (
      <div className="cuti-tool-panel">
        <ScriptBuilder
          script={selectedScript?._new ? null : selectedScript}
          onSave={handleBuilderSave}
          onCancel={() => setSelectedScript(null)}
        />
      </div>
    );
  }

  if (selectedScript?.dataSchema) {
    return (
      <div className="cuti-tool-panel">
        <div className="cuti-tool-header">
          <FileText size={18} />
          <div>
            <h3>{selectedScript.name}</h3>
            <p>{selectedScript.description || 'Preencha os dados para executar este script.'}</p>
          </div>
          <button className="cuti-v5-btn-ghost cuti-ml-auto" onClick={() => setSelectedScript(null)}>
            ← Voltar
          </button>
        </div>
        <DataInputForm
          script={selectedScript}
          onSubmit={(formData) => onExecutar(selectedScript, formData)}
          onCancel={() => setSelectedScript(null)}
        />
      </div>
    );
  }

  return (
    <div className="cuti-tool-panel">
      <div className="cuti-tool-header">
        <BookOpen size={18} />
        <div>
          <h3>Scripts dos Manuais</h3>
          <p>Scripts extraídos automaticamente da documentação dos produtos.</p>
        </div>
      </div>
      <ManualScriptSelector
        onScriptSelect={(s) => setSelectedScript(s)}
        selectedScript={selectedScript}
        onCreateScript={() => setSelectedScript({ _new: true })}
        customScripts={customScripts}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Componente: Integração entre Sistemas (Extração → Cadastro)
// ═══════════════════════════════════════════════════════════════
const IntegracaoSites = () => {
  const { setSite } = useSiteContext();
  const [sites, setSites]               = useState([]);
  const [sourceId, setSourceId]               = useState('');
  const [destId, setDestId]                   = useState('');
  const [sourceUrlDirect, setSourceUrlDirect] = useState('');
  const [destUrlDirect, setDestUrlDirect]     = useState('');
  const [showSourceDrop, setShowSourceDrop]   = useState(false);
  const [showDestDrop, setShowDestDrop]       = useState(false);
  const [entities, setEntities]         = useState([]);
  const [selEntities, setSelEntities]   = useState([]);
  const [extractedData, setExtractedData] = useState({});
  const [selectedRows, setSelectedRows] = useState({});
  const [activeEntity, setActiveEntity] = useState(null);
  const [extraData, setExtraData]       = useState({});
  const [phase, setPhase]               = useState('idle');
  const [log, setLog]                   = useState([]);
  const [summary, setSummary]           = useState(null);

  // Credenciais para sites de produção (não pré-configurados)
  const [srcCreds, setSrcCreds] = useState({ login: '', senha: '', showSenha: false });
  const [dstCreds, setDstCreds] = useState({ login: '', senha: '', showSenha: false });

  // Comparação: contagens do destino + estratégia por entidade
  const [destCounts, setDestCounts]       = useState(null);   // { [entityId]: { count, sample, label } }
  const [isPeeking, setIsPeeking]         = useState(false);
  const [entityStrategies, setEntityStrategies] = useState({}); // { [entityId]: 'replace' | 'skip' }
  const [regResults, setRegResults]       = useState([]);   // resultados detalhados do cadastro
  const [showErrPanel, setShowErrPanel]   = useState(false);
  const [openGroups, setOpenGroups]       = useState({ equip: true, veiculo: false, operacao: false, medicao: false, acesso: false, admin: true, outros: false });
  const errPanelRef = useRef(null);

  // Scroll automático ao painel de erros quando aparecer
  useEffect(() => {
    if (regResults.length > 0 && regResults.some(r => r.status === 'error') && errPanelRef.current) {
      setTimeout(() => errPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [regResults]);

  // Carrega lista de sites
  useEffect(() => {
    // Lista canônica do sitesData.js (~30 sites de produção)
    const canonical = [
      ...AXHUB_SITES.map(s => ({
        id: s.id, nome: s.nome, url: s.url,
        produto: 'axhub', perfil: s.estado || 'Produção',
        ambiente: 'producao', estado: s.estado, orgao: s.orgao || '',
      })),
      ...AXCROSS_SITES.map(s => ({
        id: s.id, nome: s.nome, url: s.url,
        produto: 'axcross', perfil: s.estado || 'Produção',
        ambiente: 'producao', estado: s.estado, orgao: s.orgao || '',
      })),
    ];

    apiFetch('/manual-scripts/special/sites')
      .then(r => r.json())
      .then(apiSites => {
        const lista = Array.isArray(apiSites) ? apiSites : [];
        // Adiciona sites canônicos que não estão duplicados por URL na lista da API
        const apiUrls = new Set(lista.map(s => s.url).filter(Boolean));
        const extras = canonical.filter(s => s.url && !apiUrls.has(s.url));
        setSites([...lista, ...extras]);
      })
      .catch(() => setSites(canonical));
  }, []);

  // Quando muda o site de origem (ou sites carregam), recarrega entidades
  useEffect(() => {
    if (!sourceId || sites.length === 0) { setEntities([]); setSelEntities([]); return; }
    const sourceSite = sites.find(s => s.id === sourceId);
    const isProd = sourceSite?.ambiente === 'producao';

    // Para sites de produção, passa produto e url como query params
    const params = isProd
      ? `?produto=${encodeURIComponent(sourceSite.produto)}&url=${encodeURIComponent(sourceSite.url || sourceUrlDirect)}`
      : '';

    apiFetch(`/manual-scripts/sync/entities/${sourceId}${params}`)
      .then(r => r.json())
      .then(d => {
        setEntities(d.entities || []);
        setSelEntities([]); // usuário seleciona manualmente o que quer enviar
        setActiveEntity(null);
      })
      .catch(() => {});
  }, [sourceId, sites]);

  const produtoInfo = {
    axhub:   { icon: '🚦', cor: '#ef4444', label: 'AxHub' },
    axcross: { icon: '📡', cor: '#10b981', label: 'AxCross' },
    axton:   { icon: '⚖️', cor: '#f59e0b', label: 'AxTon' },
  };

  const addLog = (msg, status = 'info') => setLog(p => [...p, { msg, status, t: new Date().toLocaleTimeString() }]);

  const toggleEntity = (id) => {
    setSelEntities(p => {
      const next = p.includes(id) ? p.filter(x => x !== id) : [...p, id];
      // Define aba ativa na primeira seleção
      if (!activeEntity && !p.includes(id)) setActiveEntity(id);
      return next;
    });
  };

  const toggleRow = (entityId, idx) => {
    setSelectedRows(p => {
      const s = new Set(p[entityId] || []);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return { ...p, [entityId]: s };
    });
  };

  const toggleAllRows = (entityId) => {
    const ent = extractedData[entityId];
    if (!ent) return;
    const current = selectedRows[entityId] || new Set();
    const allIdxs = ent.rows.map((_, i) => i);
    if (current.size === allIdxs.length) {
      setSelectedRows(p => ({ ...p, [entityId]: new Set() }));
    } else {
      setSelectedRows(p => ({ ...p, [entityId]: new Set(allIdxs) }));
    }
  };

  // Conta total de linhas selecionadas em todas as entidades
  const totalSelected = Object.values(selectedRows).reduce((acc, s) => acc + (s?.size || 0), 0);

  // ── Extração via SSE ─────────────────────────────────────────
  const handleExtract = () => {
    if (!canExtract) return;
    setPhase('extracting');
    setLog([]);
    setExtractedData({});
    setSelectedRows({});
    setSummary(null);

    const sourceCredentials = buildSourceCredentials();

    const body = sourceCredentials
      ? { sourceCredentials, entityIds: selEntities.length ? selEntities : null }
      : { sourceId, entityIds: selEntities.length ? selEntities : null };

    // Usa fetch com streaming manual
    apiFetch('/manual-scripts/sync/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let currentEventType = '';
      let extractComplete = false;

      const processChunk = (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (currentEventType === 'error') {
                addLog(`❌ Erro: ${payload.message}`, 'error');
                setPhase('idle');
              } else {
                if (payload.step !== undefined && payload.label) {
                  addLog(`${payload.label}: ${payload.message}`, payload.status);
                }
                if (payload.entityId !== undefined) {
                  setExtractedData(p => ({ ...p, [payload.entityId]: { headers: payload.headers, rows: payload.rows, count: payload.count } }));
                  setSelectedRows(p => ({ ...p, [payload.entityId]: new Set(payload.rows.map((_, i) => i)) }));
                }
                if (currentEventType === 'complete' || payload.result) {
                  addLog(`Extração concluída`, 'success');
                  extractComplete = true;
                  setPhase('extracted');
                }
              }
            } catch { /* ignore parse errors */ }
          } else if (line === '') {
            currentEventType = '';
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        processChunk(decoder.decode(value, { stream: true }));
      }
      if (extractComplete) setPhase('extracted');
    }).catch(err => {
      addLog(`Erro: ${err.message}`, 'error');
      setPhase('idle');
    });
  };

  // ── Peek: busca contagens do destino ────────────────────────
  const handlePeek = async () => {
    if (!destId && !buildDestCredentials()) return;
    setIsPeeking(true);
    setDestCounts(null);
    const entityIds = Object.keys(extractedData);
    const destCredentials = buildDestCredentials();
    const body = destCredentials
      ? { destCredentials, entityIds }
      : { destId, entityIds };
    try {
      const res = await apiFetch('/manual-scripts/sync/peek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao consultar destino');
      setDestCounts(data.counts || {});
      // Inicializa estratégias: 'replace' para todas
      const strats = {};
      entityIds.forEach(id => { strats[id] = 'replace'; });
      setEntityStrategies(strats);
    } catch (e) {
      addLog(`❌ Peek falhou: ${e.message}`, 'error');
    } finally {
      setIsPeeking(false);
    }
  };

  // ── Registro via SSE ─────────────────────────────────────────
  const handleRegister = () => {
    if (!destId) return;
    // Coleta registros selecionados, filtrando entidades marcadas como 'skip'
    const records = [];
    for (const [entityId, idxSet] of Object.entries(selectedRows)) {
      if (entityStrategies[entityId] === 'skip') continue; // pular entidades marcadas
      const ent = extractedData[entityId];
      if (!ent) continue;
      for (const idx of idxSet) {
        const row = ent.rows[idx];
        if (!row) continue;
        // Monta objeto { header: valor }
        const rec = { _entityId: entityId };
        ent.headers.forEach((h, i) => { rec[h] = row[i] || ''; });
        records.push(rec);
      }
    }
    if (!records.length) return;

    setPhase('registering');
    addLog(`Iniciando cadastro de ${records.length} registro(s) em "${destId || destSite?.nome}"...`, 'info');
    setSummary(null);
    setRegResults([]); setShowErrPanel(false);

    const destCredentials = buildDestCredentials();
    const registerBody = destCredentials
      ? { destCredentials, sourceId, records, extraData }
      : { destId, sourceId, records, extraData };

    apiFetch('/manual-scripts/sync/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerBody),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        addLog(`❌ Erro: ${err.error}`, 'error');
        setPhase('extracted');
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let regEventType = '';
      let regComplete = false;

      const processLines = (lines) => {
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            regEventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const p = JSON.parse(line.slice(6));
              if (regEventType === 'error') {
                addLog(`❌ Erro: ${p.message}`, 'error');
                setPhase('extracted');
              } else if (regEventType === 'complete' || p.summary) {
                setSummary(p.summary);
                addLog(p.summary, 'success');
                if (p.results) {
                  setRegResults(p.results);
                  const hasErrors = p.results.some(r => r.status === 'error');
                  if (hasErrors) setShowErrPanel(true);
                }
                regComplete = true;
                setPhase('done');
              } else if (p.label) {
                addLog(`${p.label}: ${p.message}`, p.status || 'info');
              }
            } catch { /* ignore */ }
          } else if (line === '') {
            regEventType = '';
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush buffer restante (garante processar último evento)
          if (buffer) { processLines(buffer.split('\n')); buffer = ''; }
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        processLines(lines);
      }
      if (regComplete) setPhase('done');
    }).catch(err => {
      addLog(`Erro: ${err.message}`, 'error');
      setPhase('extracted');
    });
  };

  const sourceSite = sites.find(s => s.id === sourceId);
  const destSite   = sites.find(s => s.id === destId);
  const srcIsProd  = sourceSite?.ambiente === 'producao';
  const dstIsProd  = destSite?.ambiente   === 'producao';

  // Credenciais inline para sites de produção
  const buildSourceCredentials = () => {
    if (!srcIsProd) return null;
    const { login, senha } = srcCreds;
    if (!login || !senha) return null;
    return { produto: sourceSite.produto, url: sourceSite.url || sourceUrlDirect, login, senha };
  };
  const buildDestCredentials = () => {
    if (!dstIsProd) return null;
    const { login, senha } = dstCreds;
    if (!login || !senha) return null;
    return { produto: destSite.produto, url: destSite.url || destUrlDirect, login, senha };
  };

  // Verifica se pode extrair: site selecionado + (pré-configurado OU credenciais preenchidas)
  const canExtract = sourceId && selEntities.length > 0 && (!srcIsProd || (srcCreds.login && srcCreds.senha));
  const canRegister = destId && (!dstIsProd || (dstCreds.login && dstCreds.senha));

  // Helpers de lista — sem busca mostra produção; com busca mostra todos (inclui homologação)
  const filteredSourceSites = sites.filter(s => {
    const q = sourceUrlDirect.startsWith('http') ? '' : sourceUrlDirect.toLowerCase();
    if (!q) return s.ambiente !== 'homologacao';
    return s.nome?.toLowerCase().includes(q)
        || s.url?.toLowerCase().includes(q)
        || s.perfil?.toLowerCase().includes(q)
        || s.estado?.toLowerCase().includes(q)
        || s.orgao?.toLowerCase().includes(q);
  });
  const filteredDestSites = sites.filter(s => {
    if (s.id === sourceId) return false;
    const q = destUrlDirect.startsWith('http') ? '' : destUrlDirect.toLowerCase();
    if (!q) return s.ambiente !== 'homologacao';
    return s.nome?.toLowerCase().includes(q)
        || s.url?.toLowerCase().includes(q)
        || s.perfil?.toLowerCase().includes(q)
        || s.estado?.toLowerCase().includes(q)
        || s.orgao?.toLowerCase().includes(q);
  });

  // Agrupamento por produto (igual ao Credenciais)
  const groupByProduct = (list) => {
    const order = ['axhub', 'axcross', 'axton'];
    const grouped = list.reduce((acc, s) => {
      const p = s.produto || 'outros';
      if (!acc[p]) acc[p] = [];
      acc[p].push(s);
      return acc;
    }, {});
    return order.filter(p => grouped[p]).map(p => [p, grouped[p]])
      .concat(Object.entries(grouped).filter(([p]) => !order.includes(p)));
  };

  const selectSource = (site) => {
    setSourceId(site.id);
    setSourceUrlDirect(site.url || '');
    setShowSourceDrop(false);
    setExtractedData({}); setLog([]); setPhase('idle');
    setSrcCreds({ login: '', senha: '', showSenha: false });
    setDestCounts(null); setEntityStrategies({});
    setSite(site, 'cuti');
  };
  const clearSource = () => {
    setSourceId(''); setSourceUrlDirect(''); setShowSourceDrop(false);
    setEntities([]); setSelEntities([]);
    setExtractedData({}); setLog([]); setPhase('idle');
    setSrcCreds({ login: '', senha: '', showSenha: false });
    setDestCounts(null); setEntityStrategies({});
  };
  const selectDest = (site) => {
    setDestId(site.id); setDestUrlDirect(site.url || ''); setShowDestDrop(false);
    setDstCreds({ login: '', senha: '', showSenha: false });
    setDestCounts(null); setEntityStrategies({});
  };
  const clearDest  = () => {
    setDestId(''); setDestUrlDirect(''); setShowDestDrop(false);
    setDstCreds({ login: '', senha: '', showSenha: false });
    setDestCounts(null); setEntityStrategies({});
  };

  const siteCardStyle = (cor) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
    border: `1.5px solid ${cor}30`, borderRadius: 8, background: `${cor}08`,
    marginTop: 6,
  });
  const dropItemStyle = (hover) => ({
    padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
    background: hover ? '#f8fafc' : 'white', display: 'flex', flexDirection: 'column', gap: 2,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link2 size={20} color="#6366f1" />
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Integração entre Sistemas</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Extrai dados de um sistema de origem e cadastra automaticamente em outro.
          </p>
        </div>
      </div>

      {/* ── SELEÇÃO DE ORIGEM / DESTINO ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>

        {/* ── ORIGEM ─────────────────────────────────────────── */}
        <div style={{ flex: '1 1 260px', minWidth: 240, position: 'relative' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
            <Download size={11} style={{ display: 'inline', marginRight: 4 }} />Site de Origem
          </label>

          {/* Combobox único */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={sourceUrlDirect}
              onChange={e => { setSourceUrlDirect(e.target.value); setSourceId(''); setShowSourceDrop(true); }}
              onFocus={() => setShowSourceDrop(true)}
              onBlur={() => setTimeout(() => setShowSourceDrop(false), 150)}
              placeholder="🔍 Digitar URL ou buscar site..."
              style={{
                width: '100%', padding: '8px 34px 8px 10px',
                border: `1.5px solid ${sourceId ? '#6366f1' : '#d1d5db'}`,
                borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box',
                color: '#374151', background: sourceId ? '#eef2ff' : 'white',
              }}
            />
            {sourceUrlDirect && (
              <button onMouseDown={clearSource} title="Limpar"
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}>×</button>
            )}

            {/* Dropdown */}
            {showSourceDrop && filteredSourceSites.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999, maxHeight: 280, overflowY: 'auto', border: '1.5px solid #6366f1', borderRadius: 8, background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,.12)', marginTop: 3 }}>
                {groupByProduct(filteredSourceSites).map(([produto, sitesList]) => {
                  const info = produtoInfo[produto] || { icon: '🌐', cor: '#6b7280', label: produto };
                  return (
                    <div key={produto}>
                      <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 700, color: info.cor, background: `${info.cor}10`, borderBottom: `1px solid ${info.cor}20`, textTransform: 'uppercase', letterSpacing: .5 }}>
                        {info.icon} {info.label}
                      </div>
                      {sitesList.map((s, idx) => {
                        const selected = sourceId === s.id;
                        return (
                          <div key={s.id} onMouseDown={() => selectSource(s)}
                            style={{ padding: '8px 12px', cursor: 'pointer', borderTop: idx > 0 ? `1px solid ${info.cor}15` : 'none', background: selected ? `${info.cor}12` : 'white', borderLeft: selected ? `3px solid ${info.cor}` : '3px solid transparent' }}
                            onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = selected ? `${info.cor}12` : 'white'; }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: selected ? 700 : 500, color: selected ? info.cor : '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {s.nome}<span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>{s.perfil}</span>
                                </div>
                                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.url}</div>
                              </div>
                              {selected && <span style={{ color: info.cor, fontSize: 14, flexShrink: 0 }}>✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Site selecionado */}
          {sourceSite && (
            <div style={{ marginTop: 6, padding: '5px 10px', background: '#eef2ff', borderRadius: 7, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700, color: '#4f46e5' }}>{sourceSite.nome}</span>
              {sourceSite.perfil && <><span style={{ color: '#9ca3af' }}>·</span><span style={{ color: '#6b7280' }}>{sourceSite.perfil}</span></>}
              <a href={sourceSite.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', marginLeft: 'auto', fontSize: 10 }}>↗ abrir</a>
            </div>
          )}

          {/* Credenciais para site de produção */}
          {srcIsProd && sourceId && (
            <div style={{ marginTop: 8, padding: '10px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#c2410c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
                🔐 Credenciais da Origem (produção)
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Login"
                  value={srcCreds.login}
                  onChange={e => setSrcCreds(p => ({ ...p, login: e.target.value }))}
                  style={{ flex: 1, padding: '6px 8px', border: '1px solid #fed7aa', borderRadius: 6, fontSize: 11, outline: 'none' }}
                />
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={srcCreds.showSenha ? 'text' : 'password'}
                    placeholder="Senha"
                    value={srcCreds.senha}
                    onChange={e => setSrcCreds(p => ({ ...p, senha: e.target.value }))}
                    style={{ width: '100%', padding: '6px 28px 6px 8px', border: '1px solid #fed7aa', borderRadius: 6, fontSize: 11, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button onClick={() => setSrcCreds(p => ({ ...p, showSenha: !p.showSenha }))}
                    style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    {srcCreds.showSenha ? <EyeOff size={12} color="#c2410c" /> : <Eye size={12} color="#c2410c" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SETA ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 80 }}>
          <ArrowRight size={22} color={sourceSite && destSite ? '#6366f1' : '#d1d5db'} />
        </div>

        {/* ── DESTINO ────────────────────────────────────────── */}
        <div style={{ flex: '1 1 260px', minWidth: 240, position: 'relative' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
            <Upload size={11} style={{ display: 'inline', marginRight: 4 }} />Site de Destino
          </label>

          {/* Combobox único */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={destUrlDirect}
              onChange={e => { setDestUrlDirect(e.target.value); setDestId(''); setShowDestDrop(true); }}
              onFocus={() => setShowDestDrop(true)}
              onBlur={() => setTimeout(() => setShowDestDrop(false), 150)}
              placeholder="🔍 Digitar URL ou buscar site..."
              style={{
                width: '100%', padding: '8px 34px 8px 10px',
                border: `1.5px solid ${destId ? '#10b981' : '#d1d5db'}`,
                borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box',
                color: '#374151', background: destId ? '#f0fdf4' : 'white',
              }}
            />
            {destUrlDirect && (
              <button onMouseDown={clearDest} title="Limpar"
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}>×</button>
            )}

            {/* Dropdown */}
            {showDestDrop && filteredDestSites.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999, maxHeight: 280, overflowY: 'auto', border: `1.5px solid ${sourceId ? '#10b981' : '#d1d5db'}`, borderRadius: 8, background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,.12)', marginTop: 3 }}>
                {groupByProduct(filteredDestSites).map(([produto, sitesList]) => {
                  const info = produtoInfo[produto] || { icon: '🌐', cor: '#6b7280', label: produto };
                  return (
                    <div key={produto}>
                      <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 700, color: info.cor, background: `${info.cor}10`, borderBottom: `1px solid ${info.cor}20`, textTransform: 'uppercase', letterSpacing: .5 }}>
                        {info.icon} {info.label}
                      </div>
                      {sitesList.map((s, idx) => {
                        const selected = destId === s.id;
                        return (
                          <div key={s.id} onMouseDown={() => selectDest(s)}
                            style={{ padding: '8px 12px', cursor: 'pointer', borderTop: idx > 0 ? `1px solid ${info.cor}15` : 'none', background: selected ? `${info.cor}12` : 'white', borderLeft: selected ? `3px solid ${info.cor}` : '3px solid transparent' }}
                            onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = selected ? `${info.cor}12` : 'white'; }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: selected ? 700 : 500, color: selected ? info.cor : '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {s.nome}<span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>{s.perfil}</span>
                                </div>
                                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.url}</div>
                              </div>
                              {selected && <span style={{ color: info.cor, fontSize: 14, flexShrink: 0 }}>✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Site selecionado */}
          {destSite && (
            <div style={{ marginTop: 6, padding: '5px 10px', background: '#f0fdf4', borderRadius: 7, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700, color: '#059669' }}>{destSite.nome}</span>
              {destSite.perfil && <><span style={{ color: '#9ca3af' }}>·</span><span style={{ color: '#6b7280' }}>{destSite.perfil}</span></>}
              <a href={destSite.url} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', marginLeft: 'auto', fontSize: 10 }}>↗ abrir</a>
            </div>
          )}

          {/* Credenciais para site de destino de produção */}
          {dstIsProd && destId && (
            <div style={{ marginTop: 8, padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#065f46', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
                🔐 Credenciais do Destino (produção)
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Login"
                  value={dstCreds.login}
                  onChange={e => setDstCreds(p => ({ ...p, login: e.target.value }))}
                  style={{ flex: 1, padding: '6px 8px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 11, outline: 'none' }}
                />
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={dstCreds.showSenha ? 'text' : 'password'}
                    placeholder="Senha"
                    value={dstCreds.senha}
                    onChange={e => setDstCreds(p => ({ ...p, senha: e.target.value }))}
                    style={{ width: '100%', padding: '6px 28px 6px 8px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 11, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button onClick={() => setDstCreds(p => ({ ...p, showSenha: !p.showSenha }))}
                    style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    {dstCreds.showSenha ? <EyeOff size={12} color="#065f46" /> : <Eye size={12} color="#065f46" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SELEÇÃO DE ENTIDADES ─────────────────────────────── */}
      {entities.length > 0 && (() => {
        const groups = entities.reduce((acc, e) => {
          const g = e.group || 'outros';
          if (!acc[g]) acc[g] = [];
          acc[g].push(e);
          return acc;
        }, {});
        const groupMeta = {
          equip:   { label: 'Equipamentos',       cor: '#6366f1', icon: '📡' },
          veiculo: { label: 'Veículos',            cor: '#8b5cf6', icon: '🚗' },
          operacao:{ label: 'Operações',           cor: '#06b6d4', icon: '🚦' },
          medicao: { label: 'Medição',             cor: '#10b981', icon: '📊' },
          acesso:  { label: 'Controle de Acesso',  cor: '#ef4444', icon: '🔐' },
          admin:   { label: 'Configurações',       cor: '#f59e0b', icon: '⚙️' },
          outros:  { label: 'Outros',              cor: '#6b7280', icon: '📋' },
        };
        const groupOrder = ['equip', 'veiculo', 'operacao', 'medicao', 'acesso', 'admin', 'outros'];
        const totalSel = selEntities.length;
        const totalAll = entities.length;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 1 }}>
                O que extrair da origem
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {totalSel > 0 && <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>{totalSel}/{totalAll} selecionados</span>}
                <button
                  onClick={() => setSelEntities(totalSel === totalAll ? [] : entities.map(e => e.id))}
                  style={{ fontSize: 10, padding: '2px 8px', border: '1px solid #6366f1', borderRadius: 10, background: 'white', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}
                >{totalSel === totalAll ? 'Desmarcar todos' : 'Marcar todos'}</button>
              </div>
            </div>
            {groupOrder.filter(g => groups[g]).map(g => {
              const meta = groupMeta[g] || { label: g, cor: '#6b7280', icon: '📋' };
              const gEntities = groups[g];
              const allSelected = gEntities.every(e => selEntities.includes(e.id));
              const isOpen = openGroups[g] !== false;
              const selectedCount = gEntities.filter(e => selEntities.includes(e.id)).length;
              return (
                <div key={g} style={{ marginBottom: 4, border: `1px solid ${isOpen ? meta.cor + '50' : '#e5e7eb'}`, borderRadius: 8, overflow: 'hidden' }}>
                  <div
                    onClick={() => setOpenGroups(p => ({ ...p, [g]: !isOpen }))}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', background: isOpen ? `${meta.cor}10` : '#f9fafb', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{meta.icon}</span>
                      <span style={{ fontWeight: 700, color: meta.cor, fontSize: 12 }}>{meta.label}</span>
                      {selectedCount > 0 && (
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: meta.cor, color: 'white', fontWeight: 700 }}>
                          {selectedCount}/{gEntities.length}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        onClick={ev => {
                          ev.stopPropagation();
                          const ids = gEntities.map(e => e.id);
                          setSelEntities(prev => {
                            const next = allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])];
                            if (!allSelected && !activeEntity) setActiveEntity(ids[0]);
                            return next;
                          });
                        }}
                        style={{ fontSize: 10, padding: '2px 8px', border: `1px solid ${meta.cor}`, borderRadius: 10, background: 'white', color: meta.cor, cursor: 'pointer', fontWeight: 600 }}
                      >{allSelected ? 'Desmarcar' : 'Marcar todos'}</button>
                      <span style={{ color: meta.cor, fontSize: 11 }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', background: 'white', borderTop: `1px solid ${meta.cor}20` }}>
                      {gEntities.map(e => {
                        const isSelected = selEntities.includes(e.id);
                        const hasDeps = e.dep && e.dep.length > 0;
                        return (
                          <label key={e.id} title={e.desc || (hasDeps ? `Depende de: ${e.dep.join(', ')}` : undefined)} style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                            border: `1.5px solid ${isSelected ? meta.cor : '#d1d5db'}`,
                            borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                            background: isSelected ? `${meta.cor}14` : 'white',
                            color: isSelected ? meta.cor : '#6b7280',
                          }}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleEntity(e.id)} style={{ display: 'none' }} />
                            {e.label}
                            {hasDeps && <span style={{ fontSize: 9, color: '#9ca3af' }} title={`Requer: ${e.dep.join(', ')}`}>*</span>}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── BOTÃO EXTRAIR ────────────────────────────────────── */}
      {sourceId && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleExtract}
            disabled={phase === 'extracting' || phase === 'registering' || !canExtract}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px',
              background: canExtract ? '#6366f1' : '#9ca3af', color: 'white', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: canExtract ? 'pointer' : 'not-allowed',
              opacity: (phase === 'extracting' || phase === 'registering') ? 0.6 : 1,
            }}
          >
            <Download size={15} />
            {phase === 'extracting' ? 'Extraindo...' : 'Extrair Dados da Origem'}
          </button>
          {srcIsProd && !canExtract && (
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
              ⚠️ Informe login e senha da origem para extrair
            </span>
          )}
          {phase === 'extracted' && (
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
              ✅ Extração concluída — selecione os registros e cadastre no destino
            </span>
          )}
        </div>
      )}

      {/* ── DADOS EXTRAÍDOS ──────────────────────────────────── */}
      {Object.keys(extractedData).length > 0 && (
        <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          {/* Tabs por entidade */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', overflowX: 'auto' }}>
            {entities.filter(e => extractedData[e.id]).map(e => {
              const ent = extractedData[e.id];
              const sel = selectedRows[e.id]?.size || 0;
              return (
                <button key={e.id} onClick={() => setActiveEntity(e.id)} style={{
                  padding: '8px 16px', border: 'none', borderBottom: `2px solid ${activeEntity === e.id ? '#6366f1' : 'transparent'}`,
                  background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: activeEntity === e.id ? 700 : 500,
                  color: activeEntity === e.id ? '#4f46e5' : '#6b7280', whiteSpace: 'nowrap',
                }}>
                  {e.label}
                  <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 10, fontSize: 10,
                    background: sel > 0 ? '#4f46e5' : '#e5e7eb', color: sel > 0 ? 'white' : '#6b7280' }}>
                    {sel}/{ent.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tabela da entidade ativa */}
          {activeEntity && extractedData[activeEntity] && (() => {
            const ent = extractedData[activeEntity];
            const selSet = selectedRows[activeEntity] || new Set();
            return (
              <div style={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto' }}>
                {ent.count === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    Nenhum registro encontrado nesta entidade.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', position: 'sticky', top: 0 }}>
                        <th style={{ width: 36, padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                          <input type="checkbox"
                            checked={selSet.size === ent.rows.length && ent.rows.length > 0}
                            onChange={() => toggleAllRows(activeEntity)} />
                        </th>
                        {ent.headers.map((h, i) => (
                          <th key={i} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ent.rows.map((row, idx) => (
                        <tr key={idx}
                          onClick={() => toggleRow(activeEntity, idx)}
                          style={{ cursor: 'pointer', background: selSet.has(idx) ? '#eef2ff' : idx % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                            <input type="checkbox" checked={selSet.has(idx)} readOnly />
                          </td>
                          {row.map((cell, ci) => (
                            <td key={ci} style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6', color: '#374151' }}>{cell || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── PAINEL DE COMPARAÇÃO ────────────────────────────── */}
      {Object.keys(extractedData).length > 0 && destId && (
        <div style={{ border: '1.5px solid #e0e7ff', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: '#eef2ff', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#3730a3' }}>🔍 Comparação: Origem vs Destino</span>
              {destCounts && <span style={{ fontSize: 11, color: '#6366f1' }}>Dados carregados — revise e confirme a estratégia por entidade</span>}
            </div>
            {!destCounts && (
              <button
                onClick={handlePeek}
                disabled={isPeeking || !canRegister}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                  background: canRegister ? '#6366f1' : '#9ca3af', color: 'white',
                  border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  cursor: canRegister ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                }}
              >
                {isPeeking ? '⏳ Consultando destino...' : '📊 Verificar dados no destino'}
              </button>
            )}
            {destCounts && (
              <button
                onClick={() => { setDestCounts(null); setEntityStrategies({}); }}
                style={{ padding: '5px 12px', background: 'none', border: '1px solid #6366f1', borderRadius: 6, fontSize: 11, color: '#6366f1', cursor: 'pointer' }}
              >
                ↺ Reconsultar
              </button>
            )}
          </div>

          {isPeeking && (
            <div style={{ padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              ⏳ Abrindo browser e consultando {destSite?.nome || 'destino'}... Aguarde.
            </div>
          )}

          {destCounts && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f5f3ff' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e0e7ff' }}>Entidade</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#3b82f6', borderBottom: '2px solid #e0e7ff', whiteSpace: 'nowrap' }}>
                      📤 Origem ({sourceSite?.nome})
                    </th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#10b981', borderBottom: '2px solid #e0e7ff', whiteSpace: 'nowrap' }}>
                      📥 Destino ({destSite?.nome})
                    </th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e0e7ff' }}>Diferença</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e0e7ff' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.filter(e => extractedData[e.id]).map((e, idx) => {
                    const src = extractedData[e.id];
                    const dst = destCounts[e.id] || { count: 0, sample: [] };
                    const diff = src.count - dst.count;
                    const strat = entityStrategies[e.id] || 'replace';
                    const diffColor = diff > 0 ? '#f59e0b' : diff < 0 ? '#ef4444' : '#10b981';
                    const diffLabel = diff > 0 ? `+${diff} novos` : diff < 0 ? `${diff} a menos` : '=== igual';
                    return (
                      <tr key={e.id} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa', opacity: strat === 'skip' ? 0.5 : 1 }}>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151' }}>
                          {e.label}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', color: '#3b82f6', fontWeight: 700 }}>
                          {src.count}
                        </td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 700 }}>{dst.count}</div>
                          {dst.sample?.length > 0 && (
                            <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 2 }} title={dst.sample.join(', ')}>
                              {dst.sample.slice(0, 2).join(', ')}{dst.sample.length > 2 ? '...' : ''}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                          <span style={{ fontWeight: 700, color: diffColor, fontSize: 11 }}>{diffLabel}</span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                          <select
                            value={strat}
                            onChange={ev => setEntityStrategies(p => ({ ...p, [e.id]: ev.target.value }))}
                            style={{
                              padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                              border: `1.5px solid ${strat === 'skip' ? '#d1d5db' : strat === 'replace' ? '#6366f1' : '#10b981'}`,
                              background: strat === 'skip' ? '#f9fafb' : strat === 'replace' ? '#eef2ff' : '#f0fdf4',
                              color: strat === 'skip' ? '#9ca3af' : strat === 'replace' ? '#4f46e5' : '#10b981',
                              fontWeight: 600,
                            }}
                          >
                            <option value="replace">↻ Substituir todos</option>
                            <option value="skip">⊘ Pular esta entidade</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: '10px 16px', background: '#f5f3ff', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {Object.values(entityStrategies).filter(s => s === 'skip').length} entidade(s) puladas
                  · {Object.values(entityStrategies).filter(s => s === 'replace').length} serão substituídas
                </span>
                <button
                  onClick={() => {
                    const all = {};
                    Object.keys(entityStrategies).forEach(k => { all[k] = 'replace'; });
                    setEntityStrategies(all);
                  }}
                  style={{ padding: '4px 10px', fontSize: 11, borderRadius: 5, border: '1px solid #6366f1', background: 'none', color: '#6366f1', cursor: 'pointer' }}
                >
                  Marcar todas como Substituir
                </button>
                <button
                  onClick={() => {
                    const all = {};
                    Object.keys(entityStrategies).forEach(k => { all[k] = 'skip'; });
                    setEntityStrategies(all);
                  }}
                  style={{ padding: '4px 10px', fontSize: 11, borderRadius: 5, border: '1px solid #d1d5db', background: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  Pular todas
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BOTÃO REGISTRAR ──────────────────────────────────── */}
      {totalSelected > 0 && destId && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleRegister}
            disabled={phase === 'extracting' || phase === 'registering' || !canRegister}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px',
              background: canRegister ? '#10b981' : '#9ca3af', color: 'white', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: canRegister ? 'pointer' : 'not-allowed',
              opacity: phase === 'registering' ? 0.6 : 1,
            }}
          >
            <Upload size={15} />
            {phase === 'registering'
              ? 'Cadastrando...'
              : `Cadastrar ${totalSelected} registro(s) em "${destSite?.nome || destId}"`}
          </button>
          {dstIsProd && !canRegister && (
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
              ⚠️ Informe login e senha do destino para cadastrar
            </span>
          )}
          {summary && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✅ {summary}</span>}
        </div>
      )}

      {/* ── PAINEL DE RESULTADOS ─────────────────────────────── */}
      {regResults.length > 0 && (() => {
        const hasErrors = regResults.some(r => r.status === 'error');
        const created   = regResults.filter(r => r.status === 'created').length;
        const skipped   = regResults.filter(r => r.status === 'skipped').length;
        const errors    = regResults.filter(r => r.status === 'error').length;
        return (
          <div ref={errPanelRef} style={{ border: `1px solid ${hasErrors ? '#ef4444' : '#10b981'}`, borderRadius: 8, overflow: 'hidden' }}>
            {/* Banner de resultado */}
            <div
              onClick={() => hasErrors && setShowErrPanel(v => !v)}
              style={{
                background: hasErrors ? '#1f1315' : '#0a2010',
                padding: '10px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: hasErrors ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: hasErrors ? '#f87171' : '#4ade80', fontWeight: 700, fontSize: 13 }}>
                  {hasErrors ? `❌ ${errors} erro(s) de cadastro` : '✅ Cadastramento concluído sem erros'}
                </span>
                <span style={{ color: '#9ca3af', fontSize: 11 }}>
                  {created} criado(s) · {skipped} já existia(m) · {errors} erro(s)
                </span>
              </div>
              {hasErrors && (
                <span style={{ color: '#9ca3af', fontSize: 11 }}>{showErrPanel ? '▲ ocultar' : '▼ ver erros'}</span>
              )}
            </div>
            {/* Tabela de erros (expandível) */}
            {hasErrors && showErrPanel && (
              <div style={{ background: '#0f172a', padding: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151' }}>
                      <th style={{ color: '#94a3b8', textAlign: 'left', padding: '4px 8px', width: 40 }}>#</th>
                      <th style={{ color: '#94a3b8', textAlign: 'left', padding: '4px 8px', width: 140 }}>Entidade</th>
                      <th style={{ color: '#94a3b8', textAlign: 'left', padding: '4px 8px' }}>Motivo do Erro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regResults.filter(r => r.status === 'error').map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ color: '#94a3b8', padding: '5px 8px' }}>{r.item}</td>
                      <td style={{ color: '#fbbf24', padding: '5px 8px', fontWeight: 600 }}>{r.entityId}</td>
                      <td style={{ color: '#f87171', padding: '5px 8px' }}>{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    const erros = regResults.filter(r => r.status === 'error');
                    navigator.clipboard.writeText(JSON.stringify(erros, null, 2));
                  }}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, border: '1px solid #374151', background: '#1e293b', color: '#94a3b8', cursor: 'pointer' }}
                >
                  📋 Copiar JSON
                </button>
              </div>
            </div>
          )}
          </div>
        );
      })()}

      {/* ── LOG ──────────────────────────────────────────────── */}
      {log.length > 0 && (
        <div style={{ background: '#111827', borderRadius: 8, padding: '12px 14px', maxHeight: 200, overflowY: 'auto' }}>
          {log.map((entry, i) => (
            <div key={i} style={{
              fontSize: 11, fontFamily: 'monospace', marginBottom: 2,
              color: entry.status === 'error' ? '#f87171' : entry.status === 'success' ? '#4ade80' : entry.status === 'warning' ? '#facc15' : '#94a3b8',
            }}>
              <span style={{ color: '#4b5563', marginRight: 8 }}>{entry.t}</span>
              {entry.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Componente: Configuração de Credenciais
// ═══════════════════════════════════════════════════════════════
const CredenciaisConfig = () => {
  const [sites, setSites]   = useState([]);
  const [siteAtivo, setSiteAtivo] = useState(null); // id do site ativo por produto
  const [siteStatus, setSiteStatus] = useState({}); // { [siteId]: 'applying'|'ok'|'erro' }
  const [creds, setCreds]   = useState({
    axhub_admin_login: '', axhub_admin_senha: '',
    axhub_suporte_login: '', axhub_suporte_senha: '',
    axcross_login: '', axcross_senha: '',
    axton_login: '', axton_senha: '',
  });
  const [senhasSite, setSenhasSite] = useState({}); // senhas digitadas por site
  const [urlsSite, setUrlsSite]     = useState({}); // URLs editadas por site
  const [visible, setVisible]   = useState({});
  const [status, setStatus]     = useState(null);
  const [ativos, setAtivos]     = useState({}); // { produto: siteId }

  useEffect(() => {
    Promise.all([
      apiFetch('/manual-scripts/special/sites').then(r => r.json()).catch(() => []),
      apiFetch('/manual-scripts/special/credentials').then(r => r.json()).catch(() => ({})),
    ]).then(([sitesData, credsData]) => {
      setSites(Array.isArray(sitesData) ? sitesData : []);
      // pré-preenche URLs editáveis com as URLs atuais
      const initialUrls = {};
      sitesData.forEach(s => { initialUrls[s.id] = s.url || ''; });
      setUrlsSite(initialUrls);
      setCreds(prev => ({
        ...prev,
        axhub_admin_login:   credsData.axhub_admin_login   || '',
        axhub_suporte_login: credsData.axhub_suporte_login || '',
        axcross_login:       credsData.axcross_login        || '',
        axton_login:         credsData.axton_login          || '',
      }));
    });
  }, []);

  const toggleVis = (k) => setVisible(p => ({ ...p, [k]: !p[k] }));
  const set = (k, v) => setCreds(p => ({ ...p, [k]: v }));

  const produtoInfo = {
    axhub:   { icon: '🚦', cor: '#ef4444', label: 'AxHub' },
    axcross: { icon: '📡', cor: '#10b981', label: 'AxCross' },
    axton:   { icon: '⚖️', cor: '#f59e0b', label: 'AxTon' },
  };

  const aplicarSite = async (site) => {
    setSiteStatus(p => ({ ...p, [site.id]: 'applying' }));
    const senha = senhasSite[site.id] || '';
    const url   = urlsSite[site.id]   || site.url;
    try {
      const r = await apiFetch('/manual-scripts/special/sites/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: site.id, url, login: site.login, ...(senha ? { senha } : {}) }),
      });
      const d = await r.json();
      if (d.success) {
        setSiteStatus(p => ({ ...p, [site.id]: 'ok' }));
        setAtivos(p => ({ ...p, [site.produto]: site.id }));
        setTimeout(() => setSiteStatus(p => ({ ...p, [site.id]: null })), 3000);
      } else {
        setSiteStatus(p => ({ ...p, [site.id]: 'erro' }));
      }
    } catch { setSiteStatus(p => ({ ...p, [site.id]: 'erro' })); }
  };

  const salvarManual = async () => {
    setStatus('saving');
    try {
      const r = await apiFetch('/manual-scripts/special/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const d = await r.json();
      setStatus(d.success ? 'ok' : 'erro');
    } catch { setStatus('erro'); }
    setTimeout(() => setStatus(null), 4000);
  };

  const produtosPorSite = sites.reduce((acc, s) => {
    if (!acc[s.produto]) acc[s.produto] = [];
    acc[s.produto].push(s);
    return acc;
  }, {});

  const ambienteBadge = (amb) => ({
    homologacao: { label: 'Homologação', bg: '#dbeafe', color: '#1d4ed8' },
    producao:    { label: 'Produção',    bg: '#dcfce7', color: '#15803d' },
  }[amb] || { label: amb, bg: '#f3f4f6', color: '#374151' });

  // Grupos do form manual
  const grupos = [
    {
      titulo: '🚦 AxHub — Admin',
      desc: 'Usado nos ciclos: Admin Cycle, Admin Full, Operações',
      cor: '#ef4444',
      campos: [
        { k: 'axhub_admin_login', label: 'Usuário / E-mail', type: 'text' },
        { k: 'axhub_admin_senha', label: 'Senha',            type: 'password' },
      ],
    },
    {
      titulo: '🚦 AxHub — Suporte',
      desc: 'Usado no ciclo: Equipment Cycle',
      cor: '#6366f1',
      campos: [
        { k: 'axhub_suporte_login', label: 'Usuário / E-mail', type: 'text' },
        { k: 'axhub_suporte_senha', label: 'Senha',            type: 'password' },
      ],
    },
    {
      titulo: '📡 AxCross',
      desc: 'Usado no ciclo: AxCross Completo',
      cor: '#10b981',
      campos: [
        { k: 'axcross_login', label: 'E-mail', type: 'text' },
        { k: 'axcross_senha', label: 'Senha',  type: 'password' },
      ],
    },
    {
      titulo: '⚖️ AxTon',
      desc: 'Para uso futuro (URL ainda não configurada)',
      cor: '#f59e0b',
      campos: [
        { k: 'axton_login', label: 'E-mail', type: 'text' },
        { k: 'axton_senha', label: 'Senha',  type: 'password' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 780 }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <KeyRound size={20} color="#6366f1" />
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Sites e Credenciais</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Selecione um site para aplicar URL + credenciais automaticamente, ou configure manualmente abaixo.</p>
        </div>
      </div>

      {/* ── LISTA DE SITES ── */}
      {Object.keys(produtosPorSite).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 1 }}>Sites Configurados</div>
          {Object.entries(produtosPorSite).map(([produto, sitesList]) => {
            const info = produtoInfo[produto] || { icon: '🌐', cor: '#6b7280', label: produto };
            return (
              <div key={produto} style={{ border: `1.5px solid ${info.cor}33`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: `${info.cor}11`, padding: '8px 14px', borderBottom: `1px solid ${info.cor}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{info.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{info.label}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {sitesList.map((site, idx) => {
                    const badge = ambienteBadge(site.ambiente);
                    const st = siteStatus[site.id];
                    const isAtivo = ativos[site.produto] === site.id;
                    return (
                      <div key={site.id} style={{
                        display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 14px',
                        borderTop: idx > 0 ? `1px solid ${info.cor}18` : 'none',
                        background: isAtivo ? `${info.cor}08` : 'white',
                      }}>
                        {/* Linha superior: badges + botão */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, whiteSpace: 'nowrap' }}>{badge.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{site.perfil}</span>
                          <span style={{ fontSize: 11, color: '#6b7280' }}>{site.login}</span>
                          {isAtivo && <span style={{ fontSize: 10, color: info.cor, fontWeight: 700, marginLeft: 'auto' }}>● ATIVO</span>}
                        </div>
                        {/* Linha de URL + senha + botão */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {/* URL editável */}
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', flex: '2 1 220px', background: 'white' }}>
                            <span style={{ padding: '5px 8px', fontSize: 10, color: '#9ca3af', background: '#f9fafb', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>URL</span>
                            <input
                              value={urlsSite[site.id] ?? site.url ?? ''}
                              onChange={e => setUrlsSite(p => ({ ...p, [site.id]: e.target.value }))}
                              type="text"
                              placeholder="https://..."
                              style={{ flex: 1, padding: '5px 8px', fontSize: 12, border: 'none', outline: 'none', background: 'white', minWidth: 0 }}
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </div>
                          {/* Senha */}
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', flex: '1 1 130px', background: 'white' }}>
                            <span style={{ padding: '5px 8px', fontSize: 10, color: '#9ca3af', background: '#f9fafb', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>Senha</span>
                            <input
                              value={senhasSite[site.id] || ''}
                              onChange={e => setSenhasSite(p => ({ ...p, [site.id]: e.target.value }))}
                              type={visible[site.id] ? 'text' : 'password'}
                              placeholder={site.temSenha ? '(salva)' : 'Senha...'}
                              style={{ flex: 1, padding: '5px 8px', fontSize: 12, border: 'none', outline: 'none', background: 'white', width: 80 }}
                              autoComplete="off"
                            />
                            <button onClick={() => toggleVis(site.id)} style={{ padding: '0 6px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                              {visible[site.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>
                          {/* Botão aplicar */}
                          <button
                            onClick={() => aplicarSite(site)}
                            disabled={st === 'applying'}
                            style={{
                              padding: '5px 14px', background: isAtivo ? info.cor : '#f1f5f9',
                              color: isAtivo ? 'white' : '#374151',
                              border: `1px solid ${isAtivo ? info.cor : '#d1d5db'}`,
                              borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                          >
                            {st === 'applying' ? '⏳' : st === 'ok' ? '✅ Ativo' : isAtivo ? '✅ Ativo' : 'Usar →'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DIVISOR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>ou configure manualmente</span>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      </div>

      {/* ── FORM MANUAL ── */}
      {grupos.map(g => (
        <div key={g.titulo} style={{ border: `1.5px solid ${g.cor}33`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: `${g.cor}11`, padding: '10px 16px', borderBottom: `1px solid ${g.cor}22` }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{g.titulo}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{g.desc}</div>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {g.campos.map(({ k, label, type }) => (
              <div key={k} style={{ flex: '1 1 240px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#374151' }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', background: 'white' }}>
                  <input
                    value={creds[k] || ''}
                    onChange={e => set(k, e.target.value)}
                    type={type === 'password' && !visible[k] ? 'password' : 'text'}
                    placeholder={type === 'password' ? '••••••••' : 'usuario@empresa.com.br'}
                    style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: 'none', outline: 'none', background: 'transparent' }}
                    autoComplete="off"
                  />
                  {type === 'password' && (
                    <button onClick={() => toggleVis(k)} style={{ padding: '0 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                      {visible[k] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={salvarManual}
          disabled={status === 'saving'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px',
            background: '#6366f1', color: 'white', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: status === 'saving' ? 'not-allowed' : 'pointer',
            opacity: status === 'saving' ? 0.7 : 1,
          }}
        >
          <Save size={14} />
          {status === 'saving' ? 'Aplicando...' : 'Aplicar Credenciais Manuais'}
        </button>
        {status === 'ok'   && <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>✅ Credenciais aplicadas!</span>}
        {status === 'erro' && <span style={{ color: '#ef4444', fontSize: 13 }}>❌ Erro ao salvar.</span>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAPA: motivo → ciclo de correção
// ═══════════════════════════════════════════════════════════════
const MOTIVO_CICLO_MAP = {
  DESABILITAR_MONITORAMENTO: 'reativar-monitoramento-cycle',
  'OPERAÇÃO_EXPIRADA':        'renovar-operacao-cycle',
  'HOMOLOGAÇÃO_PENDENTE':     'completar-homologacao-cycle',
  OUTRO:                      'cadastrar-faixa-equip-cycle',
};
const MOTIVO_META_CUT = {
  DESABILITAR_MONITORAMENTO: { label: 'Desabilitado',   cor: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'OPERAÇÃO_EXPIRADA':        { label: 'Op. Expirada',   cor: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  TIPO_PESAGEM_ESTATÍSTICA:   { label: 'Pesagem Est.',   cor: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  'HOMOLOGAÇÃO_PENDENTE':     { label: 'Homolog. Pend.', cor: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  TIPO_OCR:                   { label: 'Tipo OCR',       cor: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  OUTRO:                      { label: 'Outro',          cor: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

// ═══════════════════════════════════════════════════════════════
// Sub-componente: PainelDiferencas
// Lê diferenca_equipamentos do sitesData.js e lista issues
// ═══════════════════════════════════════════════════════════════
const CICLO_LABEL = {
  'reativar-monitoramento-cycle':    'Reativar Monitoramento',
  'renovar-operacao-cycle':          'Renovar Operação Expirada',
  'completar-homologacao-cycle':     'Completar Homologação INMETRO',
  'cadastrar-faixa-equip-cycle':     'Cadastrar Faixa no Equipamento',
};

const PainelDiferencas = ({ onCorrigir }) => {
  const [aberto, setAberto]       = useState({});
  // pendente: { siteId, idx, cicloId, siteUrl, equipCod, siteName, e }
  const [pendente, setPendente]   = useState(null);

  const sitesComIssues = AXHUB_SITES.filter(s =>
    s.equipamentos?.diferenca_equipamentos?.length > 0
  );
  const totalIssues = sitesComIssues.reduce(
    (sum, s) => sum + (s.equipamentos.diferenca_equipamentos?.length || 0), 0
  );
  const totalCorrigiveis = sitesComIssues.reduce(
    (sum, s) => sum + (s.equipamentos.diferenca_equipamentos?.filter(e => MOTIVO_CICLO_MAP[e.motivo]).length || 0), 0
  );

  const toggle = (id) => setAberto(p => ({ ...p, [id]: !p[id] }));
  const isOpen = (id) => aberto[id] !== false;

  const solicitarCorrecao = (cicloId, siteUrl, equipCod, siteName, e) => {
    setPendente({ cicloId, siteUrl, equipCod, siteName, e });
  };

  const confirmarCorrecao = () => {
    if (!pendente) return;
    onCorrigir(pendente.cicloId, pendente.siteUrl, pendente.equipCod);
    setPendente(null);
  };

  if (sitesComIssues.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
        ✅ Nenhuma diferença encontrada nos dados de auditoria
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── Caixa de confirmação (aparece quando pendente) ── */}
      {pendente && (() => {
        const meta = MOTIVO_META_CUT[pendente.e.motivo] || { label: pendente.e.motivo, cor: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        return (
          <div style={{
            border: '2px solid #f59e0b', borderRadius: 10, background: '#fffbeb',
            padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <strong style={{ fontSize: 13, color: '#92400e' }}>Confirmar Abertura de Processo de Correção</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#78350f', fontWeight: 600, width: 90 }}>Site:</span>
                <span style={{ color: '#374151' }}>{pendente.siteName} — <code style={{ fontSize: 11 }}>{pendente.siteUrl}</code></span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#78350f', fontWeight: 600, width: 90 }}>Equipamento:</span>
                <code style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>{pendente.equipCod}</code>
                <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 12, fontWeight: 600, color: meta.cor, background: meta.bg }}>{meta.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#78350f', fontWeight: 600, width: 90 }}>Problema:</span>
                <span style={{ color: '#374151' }}>{pendente.e.correcao}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#78350f', fontWeight: 600, width: 90 }}>Processo:</span>
                <span style={{ color: '#374151' }}>{CICLO_LABEL[pendente.cicloId]}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', borderRadius: 6, padding: '7px 10px' }}>
              Ao confirmar, você será levado ao formulário de correção. A execução no AxHub só ocorrerá ao clicar em <strong>"Executar Agora"</strong> no formulário.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={confirmarCorrecao}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 18px', background: '#6366f1', color: 'white',
                  border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <CheckCircle size={13} /> Confirmar e Abrir Formulário
              </button>
              <button
                onClick={() => setPendente(null)}
                style={{
                  padding: '7px 14px', background: 'white', color: '#6b7280',
                  border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        );
      })()}

      {/* Summary */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
        <div style={{ padding: '7px 14px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, fontSize: 12 }}>
          <strong style={{ color: '#92400e' }}>⚠️ {totalIssues} equipamentos</strong>
          <span style={{ color: '#78350f' }}> fora do dashboard em {sitesComIssues.length} sites</span>
        </div>
        <div style={{ padding: '7px 14px', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, fontSize: 12 }}>
          <strong style={{ color: '#065f46' }}>✅ {totalCorrigiveis} corrigíveis</strong>
          <span style={{ color: '#047857' }}> automaticamente pelo CUTI</span>
        </div>
        <div style={{ padding: '7px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#6b7280' }}>
          {totalIssues - totalCorrigiveis} intencionais / requerem ação manual
        </div>
      </div>

      {/* Sites */}
      {sitesComIssues.map(site => {
        const equips = site.equipamentos.diferenca_equipamentos;
        const corrigiveisNSite = equips.filter(e => MOTIVO_CICLO_MAP[e.motivo]).length;
        const open = isOpen(site.id);
        return (
          <div key={site.id} style={{ border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            <button
              onClick={() => toggle(site.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 14px', background: open ? '#f8fafc' : 'white',
                border: 'none', borderBottom: open ? '1px solid #e5e7eb' : 'none', cursor: 'pointer',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{site.nome}</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{site.estado} · {site.tipo}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#ef4444' }}>
                {equips.length} issue{equips.length > 1 ? 's' : ''}
              </span>
              {corrigiveisNSite > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>
                  &nbsp;· {corrigiveisNSite} corrigível{corrigiveisNSite > 1 ? 'is' : ''}
                </span>
              )}
              {open ? <ChevronDown size={13} color="#9ca3af" /> : <ChevronRight size={13} color="#9ca3af" />}
            </button>
            {open && (
              <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {equips.map((e, idx) => {
                  const meta = MOTIVO_META_CUT[e.motivo] || { label: e.motivo, cor: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
                  const cicloId = MOTIVO_CICLO_MAP[e.motivo];
                  const isPendente = pendente?.equipCod === e.cod && pendente?.siteUrl === site.url;
                  return (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px', borderRadius: 8, flexWrap: 'wrap',
                      background: isPendente ? '#fffbeb' : '#fafafa',
                      border: isPendente ? '1.5px solid #f59e0b' : '1px solid #f0f0f0',
                    }}>
                      <code style={{
                        fontSize: 11, fontWeight: 700, color: '#1e293b',
                        background: '#f1f5f9', padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap',
                      }}>{e.cod}</code>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
                        color: meta.cor, background: meta.bg, whiteSpace: 'nowrap',
                      }}>{meta.label}</span>
                      <span style={{ fontSize: 11, color: '#64748b', flex: 1, minWidth: 120 }}>{e.correcao}</span>
                      {cicloId ? (
                        <button
                          onClick={() => solicitarCorrecao(cicloId, site.url, e.cod, site.nome, e)}
                          disabled={isPendente}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 11px',
                            background: isPendente ? '#e0e7ff' : 'white',
                            color: isPendente ? '#6366f1' : '#374151',
                            border: isPendente ? '1.5px solid #6366f1' : '1.5px solid #d1d5db',
                            borderRadius: 6, fontSize: 11, fontWeight: 600,
                            cursor: isPendente ? 'default' : 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          {isPendente ? <><CheckCircle size={10} /> Aguardando confirmação</> : 'Ver Correção →'}
                        </button>
                      ) : (
                        <span style={{
                          fontSize: 10, color: '#9ca3af', padding: '4px 10px',
                          background: '#f9fafb', border: '1px solid #e5e7eb',
                          borderRadius: 6, whiteSpace: 'nowrap',
                        }}>Intencional / Manual</span>
                      )}
                    </div>
                  );
                })}
                {site.equipamentos.dataVerificacao && (
                  <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right', paddingRight: 4, marginTop: 2 }}>
                    Última auditoria: {site.equipamentos.dataVerificacao}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Componente principal CUTI
// ═══════════════════════════════════════════════════════════════
const CUTI = () => {
  const [abaMain, setAbaMain] = useState('processos'); // 'processos' | 'ferramentas'
  const [abaFerr, setAbaFerr] = useState('gravar');

  // Modo Processos
  const [produto, setProduto]               = useState('axhub');
  const [modulosAbertos, setModulosAbertos] = useState(new Set(['cadastros', 'cadastros-basicos']));
  const [cicloAtivo, setCicloAtivo]         = useState(null);
  const [fase, setFase]                     = useState('mapa');
  const [executionSteps, setExecutionSteps] = useState([]);
  const [executionFinalStatus, setExecutionFinalStatus] = useState('running');
  const [sseResults, setSseResults]         = useState(null);
  const [historico, setHistorico]           = useState([]);

  const produtoAtual = CATALOGO[produto];
  const coverage = useMemo(() => calcCoverage(produtoAtual), [produtoAtual]);

  const toggleModulo = (id) => setModulosAbertos(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const [prefillData, setPrefillData] = useState({});

  const iniciarCiclo = (cicloId, prefill = {}) => { setCicloAtivo(cicloId); setPrefillData(prefill); setFase('form'); };

  const executarCiclo = async (formData) => {
    const schema = SCHEMAS[cicloAtivo];
    setFase('executando');
    setExecutionSteps([]);
    setExecutionFinalStatus('running');
    setSseResults(null);

    try {
      const response = await fetch(schema.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let eventType = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (eventType === 'progress') {
                setExecutionSteps(prev => {
                  const idx = prev.findIndex(s => s.label === payload.label);
                  if (idx >= 0) { const u = [...prev]; u[idx] = payload; return u; }
                  return [...prev, payload];
                });
              } else if (eventType === 'complete') {
                const status = payload.success ? 'success' : 'error';
                setExecutionFinalStatus(status);
                setSseResults(payload.results);
                setHistorico(prev => [{
                  id: Date.now(), ciclo: schema.name, produto: produtoAtual.label, status,
                  ts: new Date().toLocaleTimeString('pt-BR'),
                }, ...prev].slice(0, 10));
                setFase('resultado');
              } else if (eventType === 'error') {
                setExecutionFinalStatus('error');
                setFase('resultado');
              }
            } catch { /* linha incompleta */ }
            eventType = null;
          }
        }
      }
    } catch (err) {
      console.error('Erro no ciclo:', err);
      setExecutionFinalStatus('error');
      setFase('resultado');
    }
  };

  const executarScript = async (_script, _formData) => {
    alert('Execução via scripts dos manuais em desenvolvimento para este módulo.');
  };

  return (
    <div className="cuti-v6">

      {/* ══ Header ══════════════════════════════════════════ */}
      <div className="cuti-v6-header">
        <div className="cuti-v6-header-info">
          <h1>🧪 Central de Qualidade — CUTI</h1>
          <p>Processos automatizados + ferramentas de gravação para AxHub, AxCross e AxTon</p>
        </div>
        <div className="cuti-v6-main-tabs">
          <button
            className={`cuti-v6-main-tab ${abaMain === 'processos' ? 'active' : ''}`}
            onClick={() => { setAbaMain('processos'); setFase('mapa'); }}
          >
            <Wrench size={15} /> Processos
          </button>
          <button
            className={`cuti-v6-main-tab ${abaMain === 'ferramentas' ? 'active' : ''}`}
            onClick={() => setAbaMain('ferramentas')}
          >
            <Video size={15} /> Ferramentas
          </button>
        </div>
      </div>

      {/* ══ ABA: PROCESSOS ══════════════════════════════════ */}
      {abaMain === 'processos' && (
        <>
          {fase === 'mapa' && (
            <div className="cuti-v5-tabs">
              {Object.entries(CATALOGO).map(([key, p]) => (
                <button
                  key={key}
                  className={`cuti-v5-tab ${produto === key ? 'cuti-v5-tab--active' : ''}`}
                  style={{ '--tab-cor': p.cor }}
                  onClick={() => { setProduto(key); setModulosAbertos(new Set(['cadastros', 'cadastros-basicos'])); }}
                >
                  <span>{p.icon}</span><span>{p.label}</span>
                </button>
              ))}
            </div>
          )}

          {fase === 'mapa' && (
            <div className="cuti-v5-body">
              <div className="cuti-v5-coverage">
                {[
                  { val: coverage.automatizado, label: 'Automatizados', cls: 'auto' },
                  { val: coverage.documentado,  label: 'Documentados',  cls: 'doc' },
                  { val: coverage.planejado,    label: 'Planejados',    cls: 'plan' },
                  { val: coverage.ciclos,       label: 'Ciclos prontos',cls: 'ciclos' },
                  { val: coverage.total,        label: 'Total',         cls: 'total' },
                ].map(({ val, label, cls }) => (
                  <div key={cls} className={`cuti-v5-coverage-item cuti-v5-coverage-${cls}`}>
                    <span className="cuti-v5-coverage-num">{val}</span>
                    <span className="cuti-v5-coverage-label">{label}</span>
                  </div>
                ))}
              </div>

              {produtoAtual.url && (
                <div className="cuti-v5-produto-url">
                  <span>🌐</span>
                  <a href={produtoAtual.url} target="_blank" rel="noreferrer">{produtoAtual.url}</a>
                </div>
              )}

              {produtoAtual.modules.map(modulo => (
                <div key={modulo.id} className="cuti-v5-module">
                  <button className="cuti-v5-module-header" onClick={() => toggleModulo(modulo.id)}>
                    <span className="cuti-v5-module-icon">{modulo.icon}</span>
                    <span className="cuti-v5-module-label">{modulo.label}</span>
                    <span className="cuti-v5-module-count">
                      {modulo.processos.length} processos
                      {modulo.ciclos.length > 0 && ` · ${modulo.ciclos.length} ciclo${modulo.ciclos.length > 1 ? 's' : ''}`}
                    </span>
                    <span className="cuti-v5-module-chevron">
                      {modulosAbertos.has(modulo.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  </button>

                  {modulosAbertos.has(modulo.id) && (
                    <div className="cuti-v5-module-body">
                      {modulo.tipo === 'diferenca' ? (
                        <PainelDiferencas
                          onCorrigir={(cicloId, siteUrl, equipCod) =>
                            iniciarCiclo(cicloId, { site_url: siteUrl, equip_codigo: equipCod })
                          }
                        />
                      ) : (
                      <div className="cuti-v5-processos-grid">
                        {modulo.processos.map(proc => {
                          const meta = STATUS_META[proc.status];
                          return (
                            <div key={proc.id} className="cuti-v5-process-card">
                              <div className="cuti-v5-process-top">
                                <span className="cuti-v5-process-icon">{proc.icon}</span>
                                <span className="cuti-v5-process-name">{proc.label}</span>
                                <span className="cuti-v5-process-badge" style={{ color: meta.cor, background: meta.bg }}>
                                  {meta.label}
                                </span>
                              </div>
                              <p className="cuti-v5-process-desc">{proc.desc}</p>
                              {proc.dep.length > 0 && (
                                <div className="cuti-v5-process-deps">
                                  {proc.dep.map(d => <span key={d} className="cuti-v5-dep-pill">↳ {d}</span>)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      )}

                      {modulo.ciclos.length > 0 && (
                        <div className="cuti-v5-ciclos">
                          {modulo.ciclos.map(ciclo => {
                            const schema = SCHEMAS[ciclo.id];
                            return (
                              <div key={ciclo.id} className="cuti-v5-ciclo-card">
                                <div className="cuti-v5-ciclo-info">
                                  <span className="cuti-v5-ciclo-badge">🔄 Ciclo</span>
                                  <strong className="cuti-v5-ciclo-label">{ciclo.label}</strong>
                                  <div className="cuti-v5-ciclo-procs">
                                    {ciclo.processos.map(p => <span key={p} className="cuti-v5-ciclo-proc-pill">{p}</span>)}
                                  </div>
                                  {schema && (
                                    <span className="cuti-v5-ciclo-meta">
                                      {schema.steps} passos · {schema.dataSchema.fields.filter(f => f.required).length} campos obrigatórios
                                    </span>
                                  )}
                                </div>
                                <button
                                  className={`cuti-v5-btn-executar ${!schema ? 'cuti-v5-btn-breve' : ''}`}
                                  disabled={!schema}
                                  onClick={() => iniciarCiclo(ciclo.id)}
                                >
                                  {schema ? <><Play size={14} /> Executar</> : 'Em breve'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {historico.length > 0 && (
                <div className="cuti-v5-historico">
                  <h3 className="cuti-v5-historico-title">Execuções Recentes</h3>
                  {historico.map(h => (
                    <div key={h.id} className={`cuti-v5-hist-item cuti-v5-hist-${h.status}`}>
                      {h.status === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      <span className="cuti-v5-hist-produto">{h.produto}</span>
                      <span className="cuti-v5-hist-ciclo">{h.ciclo}</span>
                      <span className="cuti-v5-hist-ts"><Clock size={11} /> {h.ts}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {fase === 'form' && cicloAtivo && (
            <div className="cuti-v5-body">
              <div className="cuti-v5-form-header">
                <button className="cuti-v5-btn-ghost" onClick={() => setFase('mapa')}>← Cancelar</button>
                <span className="cuti-v5-form-badge">{produtoAtual.icon} {produtoAtual.label}</span>
                <h2>{SCHEMAS[cicloAtivo].name}</h2>
              </div>
              <DataInputForm
                script={SCHEMAS[cicloAtivo]}
                onSubmit={executarCiclo}
                onCancel={() => setFase('mapa')}
                initialData={prefillData}
              />
            </div>
          )}

          {(fase === 'executando' || fase === 'resultado') && (
            <div className="cuti-v5-body">
              <div className="cuti-v5-form-header">
                <button className="cuti-v5-btn-ghost" onClick={() => setFase('mapa')}>← Voltar ao Mapa</button>
              </div>
              <ExecutionProgress
                steps={executionSteps}
                finalStatus={executionFinalStatus}
                results={sseResults}
                totalSteps={SCHEMAS[cicloAtivo]?.steps ?? 8}
              />
              {fase === 'resultado' && (
                <div className="cuti-v5-result-actions">
                  <button className="cuti-v5-btn-primary" onClick={() => setFase('form')}>
                    <RefreshCw size={15} /> Novo Teste
                  </button>
                  <button className="cuti-v5-btn-ghost" onClick={() => setFase('mapa')}>
                    ← Voltar ao Mapa
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ══ ABA: FERRAMENTAS ════════════════════════════════ */}
      {abaMain === 'ferramentas' && (
        <div className="cuti-v6-ferr">
          <div className="cuti-v6-ferr-tabs">
            {[
              { id: 'gravar',       icon: <Video size={15} />,      label: 'Gravar Cenário' },
              { id: 'biblioteca',   icon: <Library size={15} />,    label: 'Biblioteca' },
              { id: 'manuais',      icon: <BookOpen size={15} />,   label: 'Scripts dos Manuais' },
              { id: 'builder',      icon: <Wrench size={15} />,     label: 'Criar Script' },
              { id: 'integracao',   icon: <Link2 size={15} />,      label: 'Integração' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`cuti-v6-ferr-tab ${abaFerr === tab.id ? 'active' : ''}`}
                onClick={() => setAbaFerr(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="cuti-v6-ferr-body">
            {abaFerr === 'gravar' && (
              <GravacaoCenario onHistorico={(h) => setHistorico(prev => [h, ...prev].slice(0, 10))} />
            )}
            {abaFerr === 'biblioteca' && <BibliotecaCenarios />}
            {abaFerr === 'manuais'      && <ScriptsDosManuais onExecutar={executarScript} />}
            {abaFerr === 'integracao'   && <IntegracaoSites />}
            {abaFerr === 'builder'    && (
              <div className="cuti-tool-panel">
                <div className="cuti-tool-header">
                  <Wrench size={18} />
                  <div>
                    <h3>Criar Script Manualmente</h3>
                    <p>Monte um script de teste definindo os campos do formulário a serem preenchidos.</p>
                  </div>
                </div>
                <ScriptBuilder
                  script={null}
                  onSave={(built) => {
                    alert(`Script "${built.name}" criado! Acesse "Scripts dos Manuais" para executá-lo.`);
                    setAbaFerr('manuais');
                  }}
                  onCancel={() => setAbaFerr('gravar')}
                />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CUTI;
