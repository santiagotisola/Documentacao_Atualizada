---
sidebar_position: 1
title: Banco de Dados
description: Referência técnica das principais tabelas SQL Server do AxHub
---

# Referência Técnica — Banco de Dados AxHub

O AxHub utiliza **SQL Server** com **120 tabelas**. Abaixo estão as principais tabelas agrupadas por domínio funcional.

---

## Domínios funcionais

| Domínio | Tabelas principais |
|---|---|
| **Equipamentos** | TBEquipamentos, TBTipoEquipamentos, TBModeloEquipamentos, TBFabricantes, TBFaixas, TBGrupoEquipamentos, TBHeartbeatEquipamentos |
| **Passagens** | TBPassagens, TBPassagensMonitoramentos, TBPassagensConjugadas, TBPassagensCronotacografos, TBImagemPassagens |
| **Infrações** | TBInfracoes, TBInfracoesEnquadramentos, TBEnquadramentos, TBSequencialInfracoes, TBMotivosDescartes |
| **Triagem/Auditoria** | TBTriagens, TBTriagensCronotacografos, TBHistoricoTriagens |
| **Operações** | TBOperacoes, TBOperacoesFaixas, TBPostos, TBPostoOperacoes, TBOperacoesRecursos |
| **Pesagens** | TBDadosPesagens, TBEixoPesagens, TBGrupoEixoPesagens, TBTicketPesagens, TBAfericoes |
| **Veículos Monitorados** | TBMonitoramentos, TBPassagensMonitoramentos, TBImagemPassagensMonitoramentos |
| **Contratos** | TBContratos, TBAjustesContratuais, TBContratosFaixas |
| **Exportação** | TBLoteExportacoes, TBLoteImportacoes, TBSequencialLoteExportacoes, TBLayoutArquivos |
| **Usuários/Acesso** | TBUsuarios, TBPerfilAcessos, TBPermissoesAcesso, TBLogsAcessos, TBUserSessions, TBAcessosBloqueadosPeriodo |
| **Veículos** | TBVeiculos, TBCategoriaVeiculos, TBClassificacoesVeiculos, TBTipoVeiculos, TBEspecieVeiculos |
| **Relatórios** | TBRelatoriosPowerBi, TBQuantitativos |

---

## Tabelas principais

### TBPassagens
Registro de cada veículo que passa pelos pontos monitorados.

| Campo | Descrição |
|---|---|
| `IdPassagem` | Identificador único |
| `DataHoraPassagem` | Data/hora da detecção |
| `Placa` | Placa lida pelo OCR |
| `Velocidade` | Velocidade medida |
| `IdEquipamento` | FK → TBEquipamentos |
| `IdLocal` | FK → TBLocais |
| `IdFaixa` | FK → TBFaixas |

---

### TBInfracoes
Infrações geradas após triagem e auditoria.

| Campo | Descrição |
|---|---|
| `IdInfracao` | Identificador único |
| `DataHoraInfracao` | Data/hora da infração |
| `Placa` | Placa autuada |
| `IdEquipamento` | FK → TBEquipamentos |
| `Status` | Pendente, Auditada, Exportada, Descartada |

**Relacionamentos importantes:**
- `TBInfracoesEnquadramentos` — liga infração ao enquadramento legal
- `TBInfracoesExcessoPeso` — dados específicos de excesso de peso

---

### TBTriagens
Controle do processo de triagem (validação das passagens/infrações).

| Campo | Descrição |
|---|---|
| `IdTriagem` | Identificador único |
| `Status` | Pendente, Aprovada, Descartada, Reaberta |
| `IdPassagem` | FK → TBPassagens |
| `IdUsuario` | Analista responsável |
| `DataHoraTriagem` | Data/hora da triagem |

---

### TBMonitoramentos
Veículos/placas em lista de monitoramento especial.

| Campo | Descrição |
|---|---|
| `IdMonitoramento` | Identificador único |
| `Placa` | Placa monitorada |
| `Ativo` | 1 = Ativo, 0 = Inativo |
| `Motivo` | Motivo do monitoramento |
| `IdClassificacao` | FK → TBClassificacoesVeiculos |

---

### TBLoteExportacoes
Controle dos lotes de exportação para órgãos autuadores.

| Campo | Descrição |
|---|---|
| `IdLoteExportacao` | Identificador único |
| `DataHoraGeracao` | Data/hora de geração |
| `Status` | Processando, Ok, Erro |
| `UrlArquivo` | Caminho do arquivo gerado |
| `TipoExportacao` | RENAINF, XML, TXT, CSV |

---

### TBSequencialInfracoes
Contador do número sequencial das AITs (Autos de Infração de Trânsito).

| Campo | Descrição |
|---|---|
| `IdSequencial` | Identificador único |
| `Sequential` | Valor atual do contador |
| `Prefix` | Prefixo do código da AIT |

:::warning Atenção
Nunca altere esta tabela manualmente sem autorização. O número sequencial incorreto pode gerar AITs inválidas ou duplicadas.
:::

---

### TBHeartbeatEquipamentos
Status de comunicação de cada equipamento.

| Campo | Descrição |
|---|---|
| `IdEquipamento` | FK → TBEquipamentos |
| `DataHora` | Data/hora do último sinal |

:::tip Diagnóstico
Equipamentos sem heartbeat nas últimas 2 horas devem ser verificados. Compare `DataHora` com `GETDATE()` para identificar offline.
:::

---

### TBUserSessions / TBAcessosBloqueadosPeriodo
Controle de sessões ativas e bloqueios de usuário.

| Tabela | Finalidade |
|---|---|
| `TBUserSessions` | Sessões abertas (tokens ativos) |
| `TBAcessosBloqueadosPeriodo` | Usuários bloqueados por tentativas excessivas |
| `TBLogsAcessos` | Histórico completo de acessos ao sistema |

---

## API — Endpoints disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/axhub/status` | Testa conexão com banco |
| GET | `/api/axhub/resumo` | Contagem geral de registros |
| GET | `/api/axhub/equipamentos` | Lista equipamentos |
| GET | `/api/axhub/operacoes` | Últimas 50 operações |
| GET | `/api/axhub/infracoes` | Estatísticas e últimas infrações |
| GET | `/api/axhub/heartbeat` | Status dos equipamentos |
| GET | `/api/axhub/monitoramentos` | Veículos monitorados e últimas detecções |
| GET | `/api/axhub/passagens` | Últimas 20 passagens |
| GET | `/api/axhub/triagens` | Contagem de triagens por status |
| GET | `/api/axhub/tabelas` | Todas as 120 tabelas com contagem |
