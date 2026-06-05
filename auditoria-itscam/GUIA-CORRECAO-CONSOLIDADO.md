# GUIA DE CORREÇÃO CONSOLIDADO — ITScam 450 SETRANS-GO

**Data:** 05/06/2026  
**Projeto:** Auditoria de Frota ITScam 450 — Grupo Labor (VARCO)  
**Total de equipamentos:** 70 câmeras (35 pontos × 2 faixas)  
**Equipamentos referência:** GOEC6O045-F1, GOEC6O022-F1, GOEC6O058-F1 (3 equipamentos 100% conformes, validados idênticos)  
**Status geral:** 18 em conformidade total (26%), 52 com desvios, 6 offline

---

## ÍNDICE

1. [Visão Geral do Cenário](#visao-geral)
2. [Como Acessar os Equipamentos](#como-acessar)
3. [CASO 01 — VARCO Desabilitado (6 equip.)](#caso-01)
4. [CASO 02 — Câmera Travada em P&B (1 equip.)](#caso-02)
5. [CASO 03 — Transições com Horário (5 equip.)](#caso-03)
6. [CASO 04 — Classificador CPU Alta (6 equip. críticos + 28 queue=4)](#caso-04)
7. [CASO 05 — Níveis de Transição Errados (4 equip.)](#caso-05)
8. [CASO 06 — OCR maxPlates Reduzido (2 equip.)](#caso-06)
9. [CASO 07 — Snapshot Crop Habilitado (3 equip.)](#caso-07)
10. [CASO 08 — Gateway Diferente (2 equip.)](#caso-08)
11. [Status Operacional — Clock e Storage](#status-operacional)
12. [Tabela Completa — 70 Equipamentos](#tabela-completa)
13. [Ordem de Execução Recomendada](#ordem-execucao)

---

<a name="visao-geral"></a>
## 1. VISÃO GERAL DO CENÁRIO

### Resumo dos Problemas

| Severidade | Caso | Problema | Qtd | Impacto |
|---|---|---|---|---|
| 🔴 CRÍTICA | 01 | VARCO desabilitado (sem acesso remoto) | 6 | Não gerenciáveis |
| 🔴 CRÍTICA | 02 | Câmera travada em P&B (profile errado) | 1 | Imagens inválidas |
| 🟠 ALTA | 03 | Transições com janela de horário | 5 | Risco de travar P&B |
| 🟡 MÉDIA | 05 | Níveis de transição diferentes | 4 | Troca prematura/atrasada |
| 🔵 BAIXA | 04 | Classificador queue/threads alto | 6+28 | CPU elevada |
| 🔵 BAIXA | 06 | OCR maxPlates=1 | 2 | Perde 2ª placa |
| 🔵 BAIXA | 07 | Snapshot Crop ligado | 3 | Imagem recortada |
| ⚪ INFO | 08 | Gateway 192.168.1.1 | 2 | Pode ser intencional |

### Conformidade da Frota

```
[██████░░░░░░░░░░░░░░] 26% em conformidade total (18/70)

✅ Conformes:     18 equipamentos (zero desvios)
⚠️ Com desvios:   46 equipamentos (configuração divergente)
❌ Offline:         6 equipamentos (VARCO desabilitado)
```

### Equipamentos Referência (3 unidades validadas — valores idênticos entre si)

Foram selecionados **3 equipamentos** com zero desvios e funcionamento estável para servir como referência tripla. Todos possuem **configurações 100% idênticas** entre si, confirmando que os valores são o padrão correto da frota.

| # | Equipamento | UUID | IP | Uptime | Storage | Status |
|---|---|---|---|---|---|---|
| 1 | **GOEC6O045 - Faixa 1** | `0ce96fed-4b52-4737-9e95-f6dd2c969d58` | 179.242.177.86 | 136.9h | 967MB | ✅ Estável |
| 2 | **GOEC6O022 - Faixa 1** | `29c1d243-f44f-4a40-b62d-06c9cce958c9` | 143.105.141.193 | 122.2h | 296MB | ✅ Estável |
| 3 | **GOEC6O058 - Faixa 1** | `b5a0f157-e8d4-478c-bf2b-91ebbfcf2a29` | 187.68.160.38 | 123.3h | 312MB | ✅ Estável |

**Por que esses 3:**
- Todos com zero desvios de configuração (nenhum campo diferente do padrão)
- Uptime acima de 100h (sem reboot recente, sem clock dessincronizado)
- Storage saudável (sem fila acumulada)
- VARCO ativo e funcionando
- Distribuídos em IPs/pontos diferentes (descarta coincidência)

Todos os valores "corretos" neste documento foram extraídos destes 3 equipamentos e confirmados como idênticos.

---

<a name="como-acessar"></a>
## 2. COMO ACESSAR OS EQUIPAMENTOS

### Via VARCO (acesso remoto — 64 equipamentos)

```
1. Abrir https://varco.io
2. Login: suporte@axiontecnologia.com.br / Axiontecnologia@2026
3. Organização: Labor
4. Navegar em Devices → Localizar o equipamento
5. Clicar em "Tunnels" → Copiar link da porta 80
   Formato: https://{UUID}-80.tunnel.varco.cloud
6. Abrir o link → Login na câmera: admin / #econocr@
```

### Via IP Público (para os 6 offline)

```
1. Abrir http://{IP_PUBLICO} no navegador
   (IPs listados na tabela de cada caso)
2. Login: admin / #econocr@
3. Se não funcionar: necessário visita técnica local
```

### Via API REST (para correções automatizadas)

```
1. POST /api/auth → body: {"username":"admin","password":"#econocr@"}
   → Retorna token JWT
2. Usar token em Header: Authorization: Bearer {token}
3. GET endpoints para ler, PUT endpoints para gravar
```

---

<a name="caso-01"></a>
## 3. CASO 01 — VARCO Tunnel Desabilitado

### Severidade: 🔴 CRÍTICA

### O que é
Estes 6 equipamentos estão com o módulo VARCO desabilitado. Isso significa que **não têm conectividade remota** — não enviam heartbeat, não aparecem no portal VARCO, e não podem ser gerenciados a distância.

A coleta de configuração retornou dados nulos/zerados, indicando equipamento inacessível ou em estado de fábrica.

### Impacto
- Sem monitoramento de saúde (heartbeat)
- Sem imagens de teste no portal
- Sem acesso remoto para manutenção
- Sem envio de dados para Helios/RFB (integrações inativas)

### Equipamentos Afetados

| Equipamento | UUID | IP Público | Device Name Esperado |
|---|---|---|---|
| GOEC6O019 - Faixa 1 | `6f6eddc7-f900-4d4f-8040-f7d1775d1d1d` | 45.70.144.143 | GOEC6O019 - FAIXA 1 |
| GOEC6O019 - Faixa 2 | `b8925732-54cf-4f01-b4ec-c8bcb1b3bd2e` | 45.70.144.143 | GOEC6O019 - FAIXA 2 |
| GOEC6O023 - Faixa 1 | `64e60ba4-79b7-4447-b726-a3f032327907` | 177.25.228.3 | GOEC6O023 - FAIXA 1 |
| GOEC6O049 - Faixa 1 | `ad0db63e-bb6e-4cb1-99eb-960f486cb692` | 191.58.159.123 | GOEC6O049 - FAIXA 1 |
| GOEC6O049 - Faixa 2 | `3a8b23c7-edf3-43d3-b9be-9211674777e3` | 191.58.159.123 | GOEC6O049 - FAIXA 2 |
| GOEC6O052 - Faixa 1 | `49cbc26f-7a42-47d6-9d32-bc66f740e886` | 187.68.165.85 | GOEC6O052 - FAIXA 1 |

### Onde Corrigir

```
SISTEMA → Manutenção → Acesso Remoto
```

### Comparação: Valores CORRETOS (referência) vs Valores ERRADOS (cada equipamento)

Todos os 6 equipamentos afetados possuem os **mesmos campos zerados/nulos**. A tabela compara com as 3 referências.

#### Todos os afetados (019-F1, 019-F2, 023-F1, 049-F1, 049-F2, 052-F1) vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **Afetados** ❌ | Ação |
|---|---|---|---|---|---|---|
| SISTEMA → Manutenção → Acesso Remoto | varco.enabled | true | true | true | **false/null** | → Alterar p/ true |
| SISTEMA → Manutenção → Acesso Remoto | varco.edgeServer | edge.varco.io | edge.varco.io | edge.varco.io | **(vazio/null)** | → Alterar p/ edge.varco.io |
| SISTEMA → Manutenção → Acesso Remoto | varco.provisionKey | yk-pzGz...l_c= | yk-pzGz...l_c= | yk-pzGz...l_c= | **(vazio/null)** | → Alterar p/ yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c= |
| SISTEMA → Manutenção → Acesso Remoto | varco.deviceName | GOEC6O045... | GOEC6O022... | GOEC6O058... | **(não definido)** | → Alterar p/ nome do equip. (ex: GOEC6O019 - FAIXA 1) |

### Resumo Visual — O que alterar em cada equipamento

| Equipamento | IP Público | Campos a corrigir | Total alterações |
|---|---|---|---|
| **GOEC6O019-F1** | 45.70.144.143 | enabled, edgeServer, provisionKey, deviceName | **4 campos** |
| **GOEC6O019-F2** | 45.70.144.143 | enabled, edgeServer, provisionKey, deviceName | **4 campos** |
| **GOEC6O023-F1** | 177.25.228.3 | enabled, edgeServer, provisionKey, deviceName | **4 campos** |
| **GOEC6O049-F1** | 191.58.159.123 | enabled, edgeServer, provisionKey, deviceName | **4 campos** |
| **GOEC6O049-F2** | 191.58.159.123 | enabled, edgeServer, provisionKey, deviceName | **4 campos** |
| **GOEC6O052-F1** | 187.68.165.85 | enabled, edgeServer, provisionKey, deviceName | **4 campos** |

> **Nota:** Os 6 afetados retornaram TODOS os campos como `null` ou `false` — o módulo VARCO nunca foi provisionado ou perdeu a configuração. Necessário acesso local via IP público ou visita técnica.

### Configuração Correta

| Campo | Valor |
|---|---|
| Enabled | **true** |
| Edge Server | **edge.varco.io** |
| Provision Key | **yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=** |
| Device Name | **[Nome do equipamento]** (ex: GOEC6O019 - FAIXA 1) |

### Como Resolver

```
OPÇÃO A — Via IP Público (se acessível):
1. Abrir http://{IP_PUBLICO} (ver tabela acima)
2. Login: admin / #econocr@
3. Menu: SISTEMA → Manutenção → Acesso Remoto
4. Preencher: Enabled=true, Edge Server=edge.varco.io, Provision Key=(acima)
5. Device Name = nome do equipamento (GOEC6O019 - FAIXA 1, etc.)
6. Salvar → Aguardar ~30s para reconexão
7. Verificar no portal varco.io se aparece Online

OPÇÃO B — Visita técnica (se IP não responder):
1. Ir fisicamente ao local
2. Conectar notebook na mesma rede (ou diretamente na câmera)
3. Acessar IP local da câmera (tipicamente 192.168.0.x)
4. Seguir passos 2-7 da Opção A

APÓS VARCO ATIVO:
→ Aplicar todas as demais correções via tunnel remoto
```

### API REST (para script automatizado)

```json
PUT /api/system/maintenance/remoteaccess
{
  "remoteAccess": {
    "varco": {
      "enabled": true,
      "edgeServer": "edge.varco.io",
      "provisionKey": "yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=",
      "deviceName": "GOEC6O019 - FAIXA 1"
    }
  }
}
```

---

<a name="caso-02"></a>
## 4. CASO 02 — Câmera Travada em P&B (Perfil Noturno aponta para si)

### Severidade: 🔴 CRÍTICA

### O que é
O GOEC6O008 - Faixa 1 tem o campo `transitions.upper.profile` do perfil noturno apontando para **o próprio ID** (23483) ao invés de apontar para o perfil Diurno (0). 

**Resultado:** Quando a luminosidade sobe (dia), a câmera tenta "voltar" mas vai para si mesma → fica presa no P&B indefinidamente.

### Diagrama do Problema

```
FUNCIONAMENTO CORRETO:
  DIA (colorido) ←──── upper.profile = 0 ──── NOITE (P&B)
       ↓                                            ↑
  lower.level=10 → vai para noturno ────────────────┘
  
PROBLEMA NO 008-F1:
  DIA (colorido)                   NOITE (P&B)
       ↓                              ↑  │
  lower → vai para noturno ──────────┘  │
                                         │
  upper.profile = 23483 ─── VOLTA PRA SI MESMO! ←──┘
  (deveria ser 0)            NUNCA sai do P&B
```

### Impacto
- Imagens diurnas em preto e branco
- OCR degradado (contraste prejudicado)
- Classificação veicular incorreta
- Autuações podem ser invalidadas

### Equipamento Afetado

| Equipamento | UUID | IP | Tunnel |
|---|---|---|---|
| GOEC6O008 - Faixa 1 | `5d6880f0-e8f2-4ff0-be25-00c3b31d6522` | 191.58.135.61 | [Tunnel](https://5d6880f0-e8f2-4ff0-be25-00c3b31d6522-80.tunnel.varco.cloud) |

### Comparação: Equipamentos CORRETOS vs GOEC6O008-F1

**Perfil DIURNO — Transições:**

| Campo | GOEC6O045-F1 ✅ | GOEC6O022-F1 ✅ | GOEC6O058-F1 ✅ | GOEC6O008-F1 ❌ |
|---|---|---|---|---|
| Lower → startTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ |
| Lower → endTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** ❌ |
| Lower → level | 10 | 10 | 10 | 10 ✅ |
| Lower → holdTime | 60000 | 60000 | 60000 | 60000 ✅ |
| Upper → startTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** ❌ |
| Upper → endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ |
| Upper → level | 35 | 35 | 35 | **30** ❌ |
| Upper → holdTime | 60000 | 60000 | 60000 | 60000 ✅ |
| Upper → profile | 0 | 0 | 0 | 0 ✅ |

**Perfil NOTURNO — Transições:**

| Campo | GOEC6O045-F1 ✅ | GOEC6O022-F1 ✅ | GOEC6O058-F1 ✅ | GOEC6O008-F1 ❌ |
|---|---|---|---|---|
| Lower → startTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ |
| Lower → endTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** ❌ |
| Lower → level | 10 | 10 | 10 | 10 ✅ |
| Lower → holdTime | 60000 | 60000 | 60000 | 60000 ✅ |
| Upper → startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:01:00** ❌ |
| Upper → endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ |
| Upper → level | 35 | 35 | 35 | **30** ❌ |
| Upper → holdTime | 60000 | 60000 | 60000 | 60000 ✅ |
| Upper → profile | **0** (Diurno) | **0** (Diurno) | **0** (Diurno) | **23483** 🔴 (aponta p/ si) |

**Outros campos divergentes:**

| Campo | Referências (045/022/058) ✅ | GOEC6O008-F1 ❌ |
|---|---|---|
| Snapshot Crop | false | **true** |

### Configuração Atual vs Correta

| Campo | Valor ATUAL (errado) | Valor CORRETO |
|---|---|---|
| Noturno → Upper → Profile | **23483** (aponta pra si) | **0** (perfil Diurno) |
| Noturno → Upper → Start Time | 18:01:00 | 00:00:00 |
| Noturno → Upper → End Time | 00:00:00 | 00:00:00 |
| Noturno → Upper → Level | 30 | 35 |
| Noturno → Lower → Start Time | 00:00:00 | 00:00:00 |
| Noturno → Lower → End Time | 06:00:00 | 00:00:00 |
| Diurno → Lower → End Time | 18:00:00 | 00:00:00 |
| Diurno → Upper → Start Time | 06:00:00 | 00:00:00 |
| Diurno → Upper → Level | 30 | 35 |
| Snapshot Crop | true | false |

### Onde Corrigir

```
IMAGEM → Perfis de Imagem → Perfil Noturno (2º) → Aba "Transições"
  → Seção "Superior" (Upper) → Campo "Profile"
```

### Como Resolver (passo a passo)

```
1. Acessar: https://5d6880f0-e8f2-4ff0-be25-00c3b31d6522-80.tunnel.varco.cloud
2. Login: admin / #econocr@
3. Menu: IMAGEM → Perfis de Imagem

4. Selecionar PERFIL DIURNO (1º perfil):
   → Transições → Inferior (Lower):
     • Start Time = 00:00:00
     • End Time = 00:00:00
     • Level = 10
     • Hold Time = 60000
   → Transições → Superior (Upper):
     • Start Time = 00:00:00
     • End Time = 00:00:00
     • Level = 35
     • Hold Time = 60000
     • Profile = 0
   → Salvar

5. Selecionar PERFIL NOTURNO (2º perfil):
   → Transições → Inferior (Lower):
     • Start Time = 00:00:00
     • End Time = 00:00:00
     • Level = 10
     • Hold Time = 60000
   → Transições → Superior (Upper):
     • Start Time = 00:00:00
     • End Time = 00:00:00
     • Level = 35
     • Hold Time = 60000
     • Profile = 0  ← CAMPO CRÍTICO (estava 23483)
   → Salvar

6. Menu: EQUIPAMENTO → Diversos
   → Snapshot Crop = Desabilitado
   → Salvar

7. TESTE: Cobrir o sensor de luz para forçar modo noturno,
   depois descobrir → câmera deve voltar para colorido em ~60s
```

### API REST

```json
// Perfil Noturno (index 1) - transições corrigidas:
PUT /api/image/profiles/1
// Enviar perfil completo com transitions.upper.profile = 0
// e todos startTime/endTime = "00:00:00"
```

---

<a name="caso-03"></a>
## 5. CASO 03 — Transições com Janelas de Horário

### Severidade: 🟠 ALTA

### O que é
5 equipamentos têm campos `startTime` e `endTime` nas transições com **horários específicos** (ex: 06:00, 18:00) ao invés de "00:00:00". 

Quando há horário definido, a transição **só funciona dentro daquela janela**. Fora dela, a câmera fica travada no perfil atual — se estiver no noturno às 05:59, pode não conseguir voltar ao diurno até às 06:00.

### Regra Correta
> **TODOS os campos startTime e endTime devem ser "00:00:00"**
> Isso faz a transição funcionar 24h baseada APENAS no sensor de luminosidade.

### Equipamentos Afetados

| # | Equipamento | UUID | Tunnel | Problema |
|---|---|---|---|---|
| 1 | GOEC6O033 - Faixa 2 | `34ebe844-ba8e-49f4-bc6f-45d5724ee381` | [Link](https://34ebe844-ba8e-49f4-bc6f-45d5724ee381-80.tunnel.varco.cloud) | Horários 06:00-18:00 |
| 2 | GOEC6O040 - Faixa 1 | `9b5328e3-104b-4afc-b3ce-8880066ca995` | [Link](https://9b5328e3-104b-4afc-b3ce-8880066ca995-80.tunnel.varco.cloud) | Horários 06:00-18:00 |
| 3 | GOEC6O040 - Faixa 2 | `416aff7e-4c34-4356-bbac-aa66d34ffead` | [Link](https://416aff7e-4c34-4356-bbac-aa66d34ffead-80.tunnel.varco.cloud) | Horários 06:00-18:01 |
| 4 | GOEC6O055 - Faixa 1 | `1d0b2132-a825-4823-ab8f-8ce4aa829138` | [Link](https://1d0b2132-a825-4823-ab8f-8ce4aa829138-80.tunnel.varco.cloud) | Horários 06:00-18:01 |
| 5 | GOEC6O055 - Faixa 2 | `fe5f7cf3-a8dd-41e8-b975-72921dbddeac` | [Link](https://fe5f7cf3-a8dd-41e8-b975-72921dbddeac-80.tunnel.varco.cloud) | Horários 05:59-18:01 |

**Nota:** GOEC6O008-F1 também tem este problema mas já está coberto no CASO 02.

### Comparação: Valores CORRETOS (referência) vs Valores ERRADOS (cada equipamento)

A tabela abaixo mostra **todos os 8 campos de horário** de cada equipamento lado a lado com o valor correto.  
**Regra simples:** Qualquer valor diferente de `00:00:00` está ERRADO e precisa ser zerado.

#### GOEC6O033 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **033-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | **17:58:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.profile | 0 | 0 | 0 | 0 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | lower.level | 10 | 10 | 10 | **35** | → Alterar p/ 10 |
| IMAGEM → Perfis → Diurno/Noturno → Transições | upper.level | 35 | 35 | 35 | **35** | OK |

#### GOEC6O040 - Faixa 1 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **040-F1** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.profile | 0 | 0 | 0 | 0 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | upper.level | 35 | 35 | 35 | 35 ✅ | OK |

#### GOEC6O040 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **040-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:01:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.profile | 0 | 0 | 0 | 0 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | upper.level | 35 | 35 | 35 | 35 ✅ | OK |

#### GOEC6O055 - Faixa 1 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **055-F1** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:01:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.profile | 0 | 0 | 0 | 0 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | upper.level | 35 | 35 | 35 | 35 ✅ | OK |

#### GOEC6O055 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **055-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **06:00:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **05:59:59** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.startTime | 00:00:00 | 00:00:00 | 00:00:00 | **18:01:00** | → Alterar p/ 00:00:00 |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.endTime | 00:00:00 | 00:00:00 | 00:00:00 | 00:00:00 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.profile | 0 | 0 | 0 | 0 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Diurno/Noturno → Transições | upper.level | 35 | 35 | 35 | 35 ✅ | OK |

### Resumo Visual — O que alterar em cada equipamento

| Equipamento | Campos a zerar | Total alterações |
|---|---|---|
| **GOEC6O033-F2** | D.Low.start, D.Low.end, D.Up.start, D.Up.end, N.Low.start, N.Low.end, N.Up.start, N.Up.end + lower.level→10 | **9 campos** |
| **GOEC6O040-F1** | D.Low.start, D.Up.start, N.Low.start, N.Up.start | **4 campos** |
| **GOEC6O040-F2** | D.Low.end, D.Up.start, N.Low.end, N.Up.start | **4 campos** |
| **GOEC6O055-F1** | D.Low.end, D.Up.start, N.Low.end, N.Up.start | **4 campos** |
| **GOEC6O055-F2** | D.Low.start, D.Up.start, N.Low.start, N.Up.start | **4 campos** |

### Onde Corrigir

```
IMAGEM → Perfis de Imagem → [Perfil Diurno] → Transições
  → Lower: Start Time = 00:00:00, End Time = 00:00:00
  → Upper: Start Time = 00:00:00, End Time = 00:00:00

IMAGEM → Perfis de Imagem → [Perfil Noturno] → Transições
  → Lower: Start Time = 00:00:00, End Time = 00:00:00
  → Upper: Start Time = 00:00:00, End Time = 00:00:00
  → Upper → Profile = 0
```

### Como Resolver

```
Para CADA equipamento da lista:
1. Acessar via tunnel (link na tabela acima)
2. Login: admin / #econocr@
3. IMAGEM → Perfis de Imagem

4. Perfil DIURNO → Transições:
   - Lower: Start=00:00:00, End=00:00:00, Level=10, Hold=60000
   - Upper: Start=00:00:00, End=00:00:00, Level=35, Hold=60000, Profile=0

5. Perfil NOTURNO → Transições:
   - Lower: Start=00:00:00, End=00:00:00, Level=10, Hold=60000
   - Upper: Start=00:00:00, End=00:00:00, Level=35, Hold=60000, Profile=0

6. Salvar ambos os perfis
```

### API REST

```json
PUT /api/image/profiles/0
// Perfil Diurno completo com transitions.lower/upper.startTime/endTime = "00:00:00"

PUT /api/image/profiles/1
// Perfil Noturno completo com transitions.lower/upper.startTime/endTime = "00:00:00"
// transitions.upper.profile = 0
```

---

<a name="caso-04"></a>
## 6. CASO 04 — Classificador com processingQueue/Threads Alto

### Severidade: 🔵 BAIXA (com ressalva)

### O que é
O classificador veicular (identifica carro/moto/caminhão) está com `processingQueue` e/ou `processingThreads` acima do padrão em vários equipamentos. O padrão é **queue=1, threads=1**.

**ATENÇÃO:** 34 dos 70 equipamentos (49%) têm `queue=4`. Isso pode ter sido **configuração intencional em lote**. Antes de corrigir todos, validar com a equipe de campo se foi proposital.

### Comparação: Valores CORRETOS (referência) vs Valores ERRADOS (cada equipamento)

A tabela abaixo mostra os campos do classificador de cada equipamento lado a lado com a referência.  
**Regra simples:** Queue e Threads devem ser **1**. Qualquer valor maior está ERRADO.

#### GOEC6O010 - Faixa 1 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **010-F1** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Classificador | classifier.enabled | true | true | true | true ✅ | OK |
| EQUIPAMENTO → Classificador → Processing Queue | classifier.processingQueue | 1 | 1 | 1 | **4** | → Alterar p/ 1 |
| EQUIPAMENTO → Classificador → Processing Threads | classifier.processingThreads | 1 | 1 | 1 | **4** | → Alterar p/ 1 |

#### GOEC6O052 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **052-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Classificador | classifier.enabled | true | true | true | true ✅ | OK |
| EQUIPAMENTO → Classificador → Processing Queue | classifier.processingQueue | 1 | 1 | 1 | **4** | → Alterar p/ 1 |
| EQUIPAMENTO → Classificador → Processing Threads | classifier.processingThreads | 1 | 1 | 1 | **4** | → Alterar p/ 1 |

#### GOEC6O058 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **058-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Classificador | classifier.enabled | true | true | true | true ✅ | OK |
| EQUIPAMENTO → Classificador → Processing Queue | classifier.processingQueue | 1 | 1 | 1 | **4** | → Alterar p/ 1 |
| EQUIPAMENTO → Classificador → Processing Threads | classifier.processingThreads | 1 | 1 | 1 | **4** | → Alterar p/ 1 |

#### GOEC6O010 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **010-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Classificador | classifier.enabled | true | true | true | true ✅ | OK |
| EQUIPAMENTO → Classificador → Processing Queue | classifier.processingQueue | 1 | 1 | 1 | 1 ✅ | OK |
| EQUIPAMENTO → Classificador → Processing Threads | classifier.processingThreads | 1 | 1 | 1 | **2** | → Alterar p/ 1 |

#### GOEC6O011 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **011-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Classificador | classifier.enabled | true | true | true | true ✅ | OK |
| EQUIPAMENTO → Classificador → Processing Queue | classifier.processingQueue | 1 | 1 | 1 | **2** | → Alterar p/ 1 |
| EQUIPAMENTO → Classificador → Processing Threads | classifier.processingThreads | 1 | 1 | 1 | **2** | → Alterar p/ 1 |

#### GOEC6O028 - Faixa 1 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **028-F1** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Classificador | classifier.enabled | true | true | true | true ✅ | OK |
| EQUIPAMENTO → Classificador → Processing Queue | classifier.processingQueue | 1 | 1 | 1 | **2** | → Alterar p/ 1 |
| EQUIPAMENTO → Classificador → Processing Threads | classifier.processingThreads | 1 | 1 | 1 | **2** | → Alterar p/ 1 |

### Resumo Visual — O que alterar em cada equipamento

| Equipamento | Queue atual | Threads atual | Ação Queue | Ação Threads | Total alterações |
|---|---|---|---|---|---|
| **GOEC6O010-F1** | 4 | 4 | → 1 | → 1 | **2 campos** |
| **GOEC6O052-F2** | 4 | 4 | → 1 | → 1 | **2 campos** |
| **GOEC6O058-F2** | 4 | 4 | → 1 | → 1 | **2 campos** |
| **GOEC6O010-F2** | 1 ✅ | 2 | OK | → 1 | **1 campo** |
| **GOEC6O011-F2** | 2 | 2 | → 1 | → 1 | **2 campos** |
| **GOEC6O028-F1** | 2 | 2 | → 1 | → 1 | **2 campos** |

### Equipamentos com queue=4, threads=1 (28 total)

GOEC6O003-F2, 004-F1, 004-F2, 006-F1, 006-F2, 009-F1, 009-F2, 011-F1, 013-F1, 018-F2, 020-F1, 029-F1, 029-F2, 033-F1, 043-F1, 043-F2, 046-F1, 050-F1, 054-F1, 054-F2, 055-F2, 056-F1, 056-F2, 057-F1, 059-F2

### Onde Corrigir

```
EQUIPAMENTO → Classificador
  → Processing Queue = 1
  → Processing Threads = 1
```

### Decisão Necessária

| Opção | Ação | Risco |
|---|---|---|
| A) Corrigir só os 6 com threads>1 | Reduz CPU dos piores | Baixo risco |
| B) Padronizar TODOS para 1/1 | Uniformiza frota | Pode afetar classificação |
| C) Manter queue=4, só corrigir threads | Mantém fila rápida | Intermediário |

**Recomendação:** Opção A inicialmente, depois avaliar necessidade de B.

### API REST

```json
PUT /api/equipment/classifier
{
  "classifier": {
    "processingQueue": 1,
    "processingThreads": 1
  }
}
```

---

<a name="caso-05"></a>
## 7. CASO 05 — Níveis de Transição (Level) Diferentes

### Severidade: 🟡 MÉDIA

### O que é
Os níveis `lower.level` e `upper.level` controlam em qual luminosidade a câmera troca de perfil:
- **Lower = 10:** Quando a luz cai para nível 10, vai para o noturno
- **Upper = 35:** Quando a luz sobe para nível 35, volta para o diurno

Valores diferentes podem causar transições prematuras ou atrasadas.

### Comparação: Valores CORRETOS (referência) vs Valores ERRADOS (cada equipamento)

A tabela abaixo mostra os **4 campos de level** de cada equipamento lado a lado com a referência.  
**Regra simples:** Lower deve ser **10**, Upper deve ser **35**. Qualquer valor diferente está ERRADO.

#### GOEC6O009 - Faixa 1 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **009-F1** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.level | 35 | 35 | 35 | **40** | → Alterar p/ 35 |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.level | 35 | 35 | 35 | **40** | → Alterar p/ 35 |

#### GOEC6O009 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **009-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.level | 35 | 35 | 35 | **40** | → Alterar p/ 35 |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.level | 35 | 35 | 35 | **40** | → Alterar p/ 35 |

#### GOEC6O013 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **013-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.level | 10 | 10 | 10 | **30** | → Alterar p/ 10 |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.level | 35 | 35 | 35 | **30** | → Alterar p/ 35 |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.level | 35 | 35 | 35 | **30** | → Alterar p/ 35 |

#### GOEC6O008 - Faixa 1 vs Referências (já coberto no CASO 02)

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **008-F1** ❌ | Ação |
|---|---|---|---|---|---|---|
| IMAGEM → Perfis → Diurno → Transições → Inferior | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Diurno → Transições → Superior | upper.level | 35 | 35 | 35 | **30** | → Alterar p/ 35 |
| IMAGEM → Perfis → Noturno → Transições → Inferior | lower.level | 10 | 10 | 10 | 10 ✅ | OK |
| IMAGEM → Perfis → Noturno → Transições → Superior | upper.level | 35 | 35 | 35 | **30** | → Alterar p/ 35 |

### Resumo Visual — O que alterar em cada equipamento

| Equipamento | D.Lower | D.Upper | N.Lower | N.Upper | Total alterações |
|---|---|---|---|---|---|
| **GOEC6O009-F1** | 10 ✅ | 40 → **35** | 10 ✅ | 40 → **35** | **2 campos** |
| **GOEC6O009-F2** | 10 ✅ | 40 → **35** | 10 ✅ | 40 → **35** | **2 campos** |
| **GOEC6O013-F2** | 30 → **10** | 30 → **35** | 10 ✅ | 30 → **35** | **3 campos** |
| **GOEC6O008-F1** | 10 ✅ | 30 → **35** | 10 ✅ | 30 → **35** | **2 campos** (já no CASO 02) |

### Onde Corrigir

```
IMAGEM → Perfis de Imagem → [Perfil] → Transições
  → Lower → Level = 10
  → Upper → Level = 35
```

### Como Resolver

```
Para cada equipamento:
1. Acessar via tunnel
2. IMAGEM → Perfis de Imagem → Perfil Diurno → Transições
   - Lower Level = 10
   - Upper Level = 35
3. Perfil Noturno → Transições
   - Lower Level = 10
   - Upper Level = 35
4. Salvar
```

---

<a name="caso-06"></a>
## 8. CASO 06 — OCR maxPlates Reduzido

### Severidade: 🔵 BAIXA

### O que é
`maxPlates=2` permite detectar até 2 placas por frame. Com `maxPlates=1`, se dois veículos passarem simultaneamente, o segundo é ignorado.

### Comparação: Valores CORRETOS (referência) vs Valores ERRADOS (cada equipamento)

A tabela abaixo mostra os campos OCR de cada equipamento lado a lado com a referência.  
**Regra simples:** maxPlates deve ser **2**. Se estiver 1, está ERRADO.

#### GOEC6O009 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **009-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → OCR | ocr.enabled | true | true | true | true ✅ | OK |
| EQUIPAMENTO → OCR → Country Code | ocr.countryCode | 76 | 76 | 76 | 76 ✅ | OK |
| EQUIPAMENTO → OCR → Max Plates | ocr.maxPlates | 2 | 2 | 2 | **1** | → Alterar p/ 2 |
| EQUIPAMENTO → OCR → Low Prob Char | ocr.lowProbChar | 45 | 45 | 45 | 45 ✅ | OK |
| EQUIPAMENTO → OCR → Max Low Prob Chars | ocr.maxLowProbChars | 0 | 0 | 0 | 0 ✅ | OK |

#### GOEC6O055 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **055-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → OCR | ocr.enabled | true | true | true | true ✅ | OK |
| EQUIPAMENTO → OCR → Country Code | ocr.countryCode | 76 | 76 | 76 | 76 ✅ | OK |
| EQUIPAMENTO → OCR → Max Plates | ocr.maxPlates | 2 | 2 | 2 | **1** | → Alterar p/ 2 |
| EQUIPAMENTO → OCR → Low Prob Char | ocr.lowProbChar | 45 | 45 | 45 | 45 ✅ | OK |
| EQUIPAMENTO → OCR → Max Low Prob Chars | ocr.maxLowProbChars | 0 | 0 | 0 | 0 ✅ | OK |

### Resumo Visual — O que alterar em cada equipamento

| Equipamento | maxPlates atual | Ação | Total alterações |
|---|---|---|---|
| **GOEC6O009-F2** | 1 | → Alterar p/ 2 | **1 campo** |
| **GOEC6O055-F2** | 1 | → Alterar p/ 2 | **1 campo** |

### Equipamentos Afetados

| Equipamento | UUID | Tunnel | maxPlates Atual | Correto |
|---|---|---|---|---|
| GOEC6O009 - Faixa 2 | `ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f` | [Link](https://ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f-80.tunnel.varco.cloud) | **1** | 2 |
| GOEC6O055 - Faixa 2 | `fe5f7cf3-a8dd-41e8-b975-72921dbddeac` | [Link](https://fe5f7cf3-a8dd-41e8-b975-72921dbddeac-80.tunnel.varco.cloud) | **1** | 2 |

### Onde Corrigir

```
EQUIPAMENTO → OCR
  → Max Plates = 2
```

### API REST

```json
PUT /api/equipment/ocr
// Campo: ocr.maxPlates = 2
```

---

<a name="caso-07"></a>
## 9. CASO 07 — Snapshot Crop Habilitado

### Severidade: 🔵 BAIXA

### O que é
Com `snapshotCrop=true`, a imagem capturada é **recortada** antes de ser enviada/armazenada. Se não intencional, pode estar cortando parte da cena e prejudicando o contexto das autuações.

### Comparação: Valores CORRETOS (referência) vs Valores ERRADOS (cada equipamento)

A tabela abaixo mostra os campos de snapshotCrop de cada equipamento lado a lado com a referência.  
**Regra simples:** enable deve ser **false** e mode **static**.

#### GOEC6O003 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **003-F2** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Diversos → Snapshot Crop | snapshotCrop.enable | false | false | false | **true** | → Alterar p/ false (Desabilitado) |
| EQUIPAMENTO → Diversos → Snapshot Crop → Mode | snapshotCrop.mode | static | static | static | static ✅ | OK |

#### GOEC6O008 - Faixa 1 vs Referências (já coberto no CASO 02)

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **008-F1** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Diversos → Snapshot Crop | snapshotCrop.enable | false | false | false | **true** | → Alterar p/ false (Desabilitado) |
| EQUIPAMENTO → Diversos → Snapshot Crop → Mode | snapshotCrop.mode | static | static | static | static ✅ | OK |

#### GOEC6O013 - Faixa 1 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **013-F1** ❌ | Ação |
|---|---|---|---|---|---|---|
| EQUIPAMENTO → Diversos → Snapshot Crop | snapshotCrop.enable | false | false | false | **true** | → Alterar p/ false (Desabilitado) |
| EQUIPAMENTO → Diversos → Snapshot Crop → Mode | snapshotCrop.mode | static | static | static | static ✅ | OK |

### Resumo Visual — O que alterar em cada equipamento

| Equipamento | Crop atual | Ação | Total alterações |
|---|---|---|---|
| **GOEC6O003-F2** | true (habilitado) | → Desabilitar (false) | **1 campo** |
| **GOEC6O008-F1** | true (habilitado) | → Desabilitar (false) | **1 campo** (já no CASO 02) |
| **GOEC6O013-F1** | true (habilitado) | → Desabilitar (false) | **1 campo** |

### Equipamentos Afetados

| Equipamento | UUID | Crop Atual | Mode | Correto |
|---|---|---|---|---|
| GOEC6O003 - Faixa 2 | `ea779324-56d4-4ea5-bfb6-63b4cf751621` | **true** | static | false/static |
| GOEC6O008 - Faixa 1 | `5d6880f0-e8f2-4ff0-be25-00c3b31d6522` | **true** | static | false/static |
| GOEC6O013 - Faixa 1 | `7d9bf2eb-0f9a-4691-bffd-e003fc3781ed` | **true** | static | false/static |

### Onde Corrigir

```
EQUIPAMENTO → Diversos
  → Snapshot Crop → Desabilitado (false)
  → Mode → static
```

---

<a name="caso-08"></a>
## 10. CASO 08 — Gateway Diferente do Padrão

### Severidade: ⚪ INFORMATIVA

### O que é
O gateway padrão da rede é `192.168.0.1`. Estes 2 equipamentos usam `192.168.1.1`. Pode ser correto se a infraestrutura local do ponto usar essa sub-rede.

### ⚠️ ATENÇÃO: Alterar gateway pode desconectar o equipamento!

### Comparação: Valores CORRETOS (referência) vs Valores DIFERENTES (cada equipamento)

A tabela abaixo mostra os campos de rede de cada equipamento lado a lado com a referência.  
**⚠️ ATENÇÃO:** Este caso pode ser intencional — confirmar com equipe de campo antes de alterar!

#### GOEC6O046 - Faixa 1 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **046-F1** ⚠️ | Ação |
|---|---|---|---|---|---|---|
| SISTEMA → Rede → Ethernet → IPv4 Primary | ethernet.ipv4Primary.gateway | 192.168.0.1 | 192.168.0.1 | 192.168.0.1 | **192.168.1.1** | ⚠️ Confirmar com equipe se rede local é .1.x |
| SISTEMA → Rede → Ethernet → IPv4 Primary | ethernet.ipv4Primary.dns | 8.8.8.8 | 8.8.8.8 | 8.8.8.8 | 8.8.8.8 ✅ | OK |

#### GOEC6O046 - Faixa 2 vs Referências

| Tela no Sistema | Campo API | 045-F1 ✅ | 022-F1 ✅ | 058-F1 ✅ | **046-F2** ⚠️ | Ação |
|---|---|---|---|---|---|---|
| SISTEMA → Rede → Ethernet → IPv4 Primary | ethernet.ipv4Primary.gateway | 192.168.0.1 | 192.168.0.1 | 192.168.0.1 | **192.168.1.1** | ⚠️ Confirmar com equipe se rede local é .1.x |
| SISTEMA → Rede → Ethernet → IPv4 Primary | ethernet.ipv4Primary.dns | 8.8.8.8 | 8.8.8.8 | 8.8.8.8 | 8.8.8.8 ✅ | OK |

### Resumo Visual — Decisão necessária

| Equipamento | Gateway atual | Gateway padrão | Ação |
|---|---|---|---|
| **GOEC6O046-F1** | 192.168.1.1 | 192.168.0.1 | ⚠️ SÓ alterar se rede local for .0.x |
| **GOEC6O046-F2** | 192.168.1.1 | 192.168.0.1 | ⚠️ SÓ alterar se rede local for .0.x |

> **RISCO:** Alterar o gateway para 192.168.0.1 num ponto que usa rede 192.168.1.x vai **DESCONECTAR** o equipamento permanentemente até visita técnica!

### Equipamentos Afetados

| Equipamento | UUID | IP Público | Gateway Atual | Padrão |
|---|---|---|---|---|
| GOEC6O046 - Faixa 1 | `1e26be92-70e4-468f-a582-4e015282a4fe` | 170.81.67.214 | 192.168.1.1 | 192.168.0.1 |
| GOEC6O046 - Faixa 2 | `4d68163e-8462-4dce-adad-df3b0d7c76af` | 170.81.67.214 | 192.168.1.1 | 192.168.0.1 |

### Decisão

```
→ NÃO alterar sem confirmar com equipe de campo!
→ Se o ponto GOEC6O046 usa rede 192.168.1.x, o gateway está CORRETO.
→ Se usar 192.168.0.x, então precisa corrigir.
```

### Onde Corrigir (se necessário)

```
SISTEMA → Rede → Ethernet → IPv4 Primary
  → Gateway = 192.168.0.1
```

---

<a name="status-operacional"></a>
## 11. STATUS OPERACIONAL — Clock e Storage

### Clock Dessincronizado (22 equipamentos com uptime negativo)

Uptime negativo indica que o relógio interno está no futuro em relação ao servidor. Geralmente causado por perda de sincronização NTP.

| Equipamento | IP | Uptime (h) | Storage (MB) |
|---|---|---|---|
| GOEC6O046-F2 | 170.81.67.214 | -583.6 | 632 |
| GOEC6O011-F2 | 187.61.123.9 | -583.4 | 1009 |
| GOEC6O052-F2 | 187.68.165.85 | -578.8 | 1028 |
| GOEC6O043-F2 | 186.237.219.7 | -565.3 | 654 |
| GOEC6O043-F1 | 186.237.219.7 | -565.2 | 1023 |
| GOEC6O013-F1 | 191.58.151.247 | -560.3 | 1183 |
| GOEC6O020-F2 | 179.249.69.61 | -538.1 | 728 |
| GOEC6O048-F1 | 179.249.74.187 | -440.4 | 773 |
| GOEC6O048-F2 | 179.249.74.187 | -440.1 | 772 |
| GOEC6O021-F1 | 177.25.230.156 | -373.6 | 632 |
| GOEC6O055-F1 | 191.37.226.77 | -372.5 | 1791 |
| GOEC6O055-F2 | 191.37.226.77 | -372.5 | 976 |
| GOEC6O059-F1 | 170.81.93.198 | -368.6 | 616 |
| GOEC6O059-F2 | 170.81.93.198 | -368.6 | 998 |
| GOEC6O056-F1 | 170.81.93.157 | -351.3 | 650 |
| GOEC6O056-F2 | 170.81.93.157 | -350.6 | 650 |
| GOEC6O010-F1 | 138.97.25.44 | -295.1 | 1393 |
| GOEC6O010-F2 | 138.97.25.44 | -295.1 | 1435 |
| GOEC6O046-F1 | 170.81.67.214 | -228.5 | 767 |
| GOEC6O008-F2 | 191.58.135.61 | -201.1 | 1020 |
| GOEC6O054-F1 | 187.43.168.205 | -36.7 | 1235 |
| GOEC6O054-F2 | 187.43.168.205 | -36.7 | 655 |

**Possível resolução:** Verificar configuração NTP em:
```
SISTEMA → Geral → Data e Hora → NTP Server
  Valor recomendado: time.google.com
```

### Storage Acumulado (>1GB = fila de envio)

25 equipamentos com fila acumulada. Isso indica que imagens/dados não estão sendo enviados para os servidores (Helios, RFB, ITScamPro). Possíveis causas:
- Servidor destino fora do ar
- Rede local instável
- Configuração de envio incorreta

**Top 5 mais críticos:**

| Equipamento | Storage | % Disco | Risco |
|---|---|---|---|
| GOEC6O009-F1 | 2567 MB | 45.7% | 🟠 Alto |
| GOEC6O055-F1 | 1791 MB | 31.9% | 🟡 Médio |
| GOEC6O013-F2 | 1538 MB | 27.4% | 🟡 Médio |
| GOEC6O058-F2 | 1524 MB | 27.2% | 🟡 Médio |
| GOEC6O041-F1 | 1474 MB | 26.3% | 🟡 Médio |

---

<a name="tabela-completa"></a>
## 12. TABELA COMPLETA — 70 EQUIPAMENTOS

| # | Equipamento | IP | VARCO | Uptime(h) | Storage(MB) | Desvios | Status |
|---|---|---|---|---|---|---|---|
| 1 | GOEC6O002-F1 | 191.247.147.85 | ✅ | 10.9 | 749 | 0 | 🔄 REBOOT |
| 2 | GOEC6O002-F2 | 191.247.147.85 | ✅ | 10.7 | 797 | 0 | 🔄 REBOOT |
| 3 | GOEC6O003-F1 | 177.25.238.161 | ✅ | 156.7 | 688 | 1 | ✅ OK |
| 4 | GOEC6O003-F2 | 177.25.238.161 | ✅ | 156.7 | 704 | 2 | ✅ OK |
| 5 | GOEC6O004-F1 | 186.211.161.242 | ✅ | 315.7 | 1406 | 1 | 📦 FILA |
| 6 | GOEC6O004-F2 | 186.211.161.242 | ✅ | 315.7 | 923 | 1 | ✅ OK |
| 7 | GOEC6O006-F1 | 191.56.242.228 | ✅ | 103.1 | 769 | 1 | ✅ OK |
| 8 | GOEC6O006-F2 | 191.56.242.228 | ✅ | 82 | 752 | 1 | ✅ OK |
| 9 | GOEC6O007-F1 | 187.43.163.114 | ✅ | 4.2 | 106 | 0 | 🔄 REBOOT |
| 10 | GOEC6O007-F2 | 187.43.163.114 | ✅ | 3.8 | 818 | 0 | 🔄 REBOOT |
| 11 | GOEC6O008-F1 | 191.58.135.61 | ✅ | 141.8 | 470 | **6** | 🔴 TRAVADO |
| 12 | GOEC6O008-F2 | 191.58.135.61 | ✅ | -201.1 | 1020 | 0 | ⚠️ CLOCK |
| 13 | GOEC6O009-F1 | 191.58.150.37 | ✅ | 42.5 | 2567 | 3 | 📦 FILA |
| 14 | GOEC6O009-F2 | 191.58.150.37 | ✅ | 42.4 | 1259 | 4 | 📦 FILA |
| 15 | GOEC6O010-F1 | 138.97.25.44 | ✅ | -295.1 | 1393 | 2 | ⚠️ CLOCK |
| 16 | GOEC6O010-F2 | 138.97.25.44 | ✅ | -295.1 | 1435 | 1 | ⚠️ CLOCK |
| 17 | GOEC6O011-F1 | 187.61.123.9 | ✅ | 84.4 | 768 | 1 | ✅ OK |
| 18 | GOEC6O011-F2 | 187.61.123.9 | ✅ | -583.4 | 1009 | 2 | ⚠️ CLOCK |
| 19 | GOEC6O013-F1 | 191.58.151.247 | ✅ | -560.3 | 1183 | 3 | ⚠️ CLOCK |
| 20 | GOEC6O013-F2 | 191.58.151.247 | ✅ | 571.4 | 1538 | 4 | 📦 FILA |
| 21 | GOEC6O018-F1 | 177.200.42.236 | ✅ | 9.8 | 1367 | 0 | 🔄 REBOOT |
| 22 | GOEC6O018-F2 | 177.200.42.236 | ✅ | 9.8 | 1030 | 1 | 🔄 REBOOT |
| 23 | GOEC6O019-F1 | 45.70.144.143 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 24 | GOEC6O019-F2 | 45.70.144.143 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 25 | GOEC6O020-F1 | 179.249.69.61 | ✅ | 178.4 | 1381 | 1 | 📦 FILA |
| 26 | GOEC6O020-F2 | 179.249.69.61 | ✅ | -538.1 | 728 | 0 | ⚠️ CLOCK |
| 27 | GOEC6O021-F1 | 177.25.230.156 | ✅ | -373.6 | 632 | 0 | ⚠️ CLOCK |
| 28 | GOEC6O022-F1 | 143.105.141.193 | ✅ | 122.2 | 296 | 0 | ✅ OK |
| 29 | GOEC6O022-F2 | 143.105.141.193 | ✅ | 121.1 | 490 | 0 | ✅ OK |
| 30 | GOEC6O023-F1 | 177.25.228.3 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 31 | GOEC6O028-F1 | 177.25.234.226 | ✅ | 295.6 | 862 | 2 | ✅ OK |
| 32 | GOEC6O029-F1 | 177.79.18.234 | ✅ | 10.8 | 1339 | 1 | 🔄 REBOOT |
| 33 | GOEC6O029-F2 | 177.79.18.234 | ✅ | 10.8 | 1340 | 1 | 🔄 REBOOT |
| 34 | GOEC6O033-F1 | 45.168.254.127 | ✅ | 484.8 | 649 | 1 | ✅ OK |
| 35 | GOEC6O033-F2 | 45.168.254.127 | ✅ | 484.8 | 971 | **6** | 🟠 HORÁRIO |
| 36 | GOEC6O036-F1 | 191.58.154.28 | ✅ | 440.9 | 620 | 1 | ✅ OK |
| 37 | GOEC6O040-F1 | 201.71.213.219 | ✅ | 17.5 | 407 | 2 | 🟠 HORÁRIO |
| 38 | GOEC6O040-F2 | 201.71.213.219 | ✅ | 17.5 | 718 | 2 | 🟠 HORÁRIO |
| 39 | GOEC6O041-F1 | 191.58.133.244 | ✅ | 10.9 | 1474 | 0 | 🔄 REBOOT |
| 40 | GOEC6O041-F2 | 191.58.133.244 | ✅ | 10.9 | 1270 | 1 | 🔄 REBOOT |
| 41 | GOEC6O043-F1 | 186.237.219.7 | ✅ | -565.2 | 1023 | 1 | ⚠️ CLOCK |
| 42 | GOEC6O043-F2 | 186.237.219.7 | ✅ | -565.3 | 654 | 1 | ⚠️ CLOCK |
| 43 | GOEC6O045-F1 | 179.242.177.86 | ✅ | 136.9 | 967 | 0 | ✅ REFERÊNCIA |
| 44 | GOEC6O045-F2 | 179.242.177.86 | ✅ | 101.7 | 1437 | 0 | 📦 FILA |
| 45 | GOEC6O046-F1 | 170.81.67.214 | ✅ | -228.5 | 767 | 4 | ⚠️ CLOCK |
| 46 | GOEC6O046-F2 | 170.81.67.214 | ✅ | -583.6 | 632 | 3 | ⚠️ CLOCK |
| 47 | GOEC6O048-F1 | 179.249.74.187 | ✅ | -440.4 | 773 | 0 | ⚠️ CLOCK |
| 48 | GOEC6O048-F2 | 179.249.74.187 | ✅ | -440.1 | 772 | 0 | ⚠️ CLOCK |
| 49 | GOEC6O049-F1 | 191.58.159.123 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 50 | GOEC6O049-F2 | 191.58.159.123 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 51 | GOEC6O050-F1 | 177.223.44.84 | ✅ | 51.7 | 1129 | 1 | 📦 FILA |
| 52 | GOEC6O050-F2 | 177.223.44.84 | ✅ | 51.7 | 977 | 0 | ✅ OK |
| 53 | GOEC6O051-F1 | 177.79.27.27 | ✅ | 457.7 | 654 | 1 | ✅ OK |
| 54 | GOEC6O051-F2 | 177.79.27.27 | ✅ | 458.1 | 881 | 1 | ✅ OK |
| 55 | GOEC6O052-F1 | 187.68.165.85 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 56 | GOEC6O052-F2 | 187.68.165.85 | ✅ | -578.8 | 1028 | 2 | ⚠️ CLOCK |
| 57 | GOEC6O053-F1 | 179.249.73.108 | ✅ | 450 | 733 | 2 | ✅ OK |
| 58 | GOEC6O053-F2 | 179.249.73.108 | ✅ | 450 | 999 | 2 | ✅ OK |
| 59 | GOEC6O054-F1 | 187.43.168.205 | ✅ | -36.7 | 1235 | 1 | ⚠️ CLOCK |
| 60 | GOEC6O054-F2 | 187.43.168.205 | ✅ | -36.7 | 655 | 2 | ⚠️ CLOCK |
| 61 | GOEC6O055-F1 | 191.37.226.77 | ✅ | -372.5 | 1791 | 2 | 🟠 HORÁRIO |
| 62 | GOEC6O055-F2 | 191.37.226.77 | ✅ | -372.5 | 976 | 4 | 🟠 HORÁRIO |
| 63 | GOEC6O056-F1 | 170.81.93.157 | ✅ | -351.3 | 650 | 1 | ⚠️ CLOCK |
| 64 | GOEC6O056-F2 | 170.81.93.157 | ✅ | -350.6 | 650 | 1 | ⚠️ CLOCK |
| 65 | GOEC6O057-F1 | 138.97.25.51 | ✅ | 490.3 | 1270 | 2 | 📦 FILA |
| 66 | GOEC6O057-F2 | 138.97.25.51 | ✅ | 177 | 1454 | 1 | 📦 FILA |
| 67 | GOEC6O058-F1 | 187.68.160.38 | ✅ | 123.3 | 312 | 0 | ✅ OK |
| 68 | GOEC6O058-F2 | 187.68.160.38 | ✅ | 123.3 | 1524 | 2 | 📦 FILA |
| 69 | GOEC6O059-F1 | 170.81.93.198 | ✅ | -368.6 | 616 | 0 | ⚠️ CLOCK |
| 70 | GOEC6O059-F2 | 170.81.93.198 | ✅ | -368.6 | 998 | 1 | ⚠️ CLOCK |

---

<a name="ordem-execucao"></a>
## 13. ORDEM DE EXECUÇÃO RECOMENDADA

### Fase 1 — IMEDIATO (impacto direto na operação)

| Passo | Caso | Equipamento(s) | Ação | Tempo Estimado |
|---|---|---|---|---|
| 1.1 | 02 | GOEC6O008-F1 | Corrigir profile + transições + crop | 5 min |
| 1.2 | 03 | GOEC6O033-F2 | Zerar horários das transições | 3 min |
| 1.3 | 03 | GOEC6O040-F1 | Zerar horários das transições | 3 min |
| 1.4 | 03 | GOEC6O040-F2 | Zerar horários das transições | 3 min |
| 1.5 | 03 | GOEC6O055-F1 | Zerar horários das transições | 3 min |
| 1.6 | 03 | GOEC6O055-F2 | Zerar horários das transições | 3 min |

### Fase 2 — ALTA (requer acesso local/físico)

| Passo | Caso | Equipamento(s) | Ação | Tempo Estimado |
|---|---|---|---|---|
| 2.1 | 01 | GOEC6O019-F1 (IP: 45.70.144.143) | Habilitar VARCO via IP público | 10 min |
| 2.2 | 01 | GOEC6O019-F2 (IP: 45.70.144.143) | Habilitar VARCO via IP público | 10 min |
| 2.3 | 01 | GOEC6O023-F1 (IP: 177.25.228.3) | Habilitar VARCO via IP público | 10 min |
| 2.4 | 01 | GOEC6O049-F1 (IP: 191.58.159.123) | Habilitar VARCO via IP público | 10 min |
| 2.5 | 01 | GOEC6O049-F2 (IP: 191.58.159.123) | Habilitar VARCO via IP público | 10 min |
| 2.6 | 01 | GOEC6O052-F1 (IP: 187.68.165.85) | Habilitar VARCO via IP público | 10 min |

### Fase 3 — MÉDIA (melhoria de qualidade)

| Passo | Caso | Equipamento(s) | Ação |
|---|---|---|---|
| 3.1 | 05 | GOEC6O009-F1/F2 | Corrigir upper level 40→35 |
| 3.2 | 05 | GOEC6O013-F2 | Corrigir lower=30→10, upper=30→35 |
| 3.3 | 05 | GOEC6O008-F1 | Corrigir upper level 30→35 (já feito na Fase 1?) |
| 3.4 | 06 | GOEC6O009-F2, 055-F2 | maxPlates 1→2 |
| 3.5 | 07 | GOEC6O003-F2, 008-F1, 013-F1 | snapshotCrop false |

### Fase 4 — BAIXA (otimização)

| Passo | Caso | Equipamento(s) | Ação |
|---|---|---|---|
| 4.1 | 04 | GOEC6O010-F1, 052-F2, 058-F2 | Classificador queue=4/threads=4 → 1/1 |
| 4.2 | 04 | GOEC6O010-F2, 011-F2, 028-F1 | Classificador threads=2 → 1 |
| 4.3 | 04 | (28 equipamentos) | Avaliar se queue=4→1 (decisão pendente) |

### Fase 5 — INVESTIGAR (antes de agir)

| Item | Equipamento(s) | Questão |
|---|---|---|
| Gateway | GOEC6O046-F1/F2 | Confirmar se rede local é 192.168.1.x ou 0.x |
| Clock | 22 equipamentos | Verificar NTP e considerar reboot programado |
| Storage | 25 equipamentos | Investigar por que fila não está escoando |
| Queue=4 | 28 equipamentos | Validar se foi intencional com equipe |

---

## CONFIGURAÇÃO REFERÊNCIA COMPLETA

Valores exatos do equipamento de referência (GOEC6O045-F1) para aplicar em qualquer equipamento que precise ser restaurado ao padrão:

### Integrações/Servidores

```json
{
  "varco": { "enabled": true, "edgeServer": "edge.varco.io", "provisionKey": "yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=" },
  "restPresets": {
    "pumatronix": { "enabled": true, "scheme": "http", "host": "", "path": "" },
    "pumatronixCompat_v1_7_6": { "enabled": true, "scheme": "http", "host": "", "path": "" },
    "helios": { "enabled": true, "scheme": "https", "host": "helios.policiamilitar.mg.gov.br", "path": "/v3/api/_track/register" },
    "RFB": { "enabled": true, "scheme": "https", "host": "sivana.rfb.gov.br", "path": "/prod/sivana/rest/upload" }
  },
  "ftp": { "enable": false },
  "itscampro": { "enable": false },
  "lince": { "enabled": false },
  "protocols": { "blockAPI": false, "cougarAuth": false }
}
```

### OCR e Classificador

```json
{
  "ocr": { "enabled": true, "countryCode": 76, "maxPlates": 2, "lowProbChar": 45, "maxLowProbChars": 0 },
  "classifier": { "enabled": true, "processingQueue": 1, "processingThreads": 1 }
}
```

### Perfil Diurno — Transições

```json
{
  "transitions": {
    "lower": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 10, "holdTime": 60000, "profile": 27839 },
    "upper": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 35, "holdTime": 60000, "profile": 0 }
  },
  "multipleExposures": {
    "enabled": true,
    "settings": [{ "flash": { "power": [] }, "gain": { "percentageOfCurrent": true, "value": 100 }, "shutter": { "percentageOfCurrent": true, "value": 100 } }]
  }
}
```

### Perfil Noturno — Transições e Flash

```json
{
  "transitions": {
    "lower": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 10, "holdTime": 60000, "profile": 27839 },
    "upper": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 35, "holdTime": 60000, "profile": 0 }
  },
  "multipleExposures": {
    "enabled": true,
    "settings": [
      { "flash": { "power": [{ "out": 1, "percent": 65 }, { "out": 3, "percent": 65 }] }, "gain": { "percentageOfCurrent": true, "value": 100 }, "shutter": { "percentageOfCurrent": true, "value": 50 } },
      { "flash": { "power": [{ "out": 1, "percent": 20 }, { "out": 3, "percent": 20 }] }, "gain": { "percentageOfCurrent": true, "value": 100 }, "shutter": { "percentageOfCurrent": true, "value": 50 } }
    ]
  }
}
```

### Rede e Sistema

```json
{
  "rede": { "gateway": "192.168.0.1", "dns": "8.8.8.8" },
  "dateTime": { "timezone": ["America", "Sao_Paulo"] },
  "misc": { "snapshotCrop": { "enable": false, "mode": "static" } }
}
```

---

## ARQUIVOS DE APOIO NO REPOSITÓRIO

| Arquivo | Descrição |
|---|---|
| `ESTRATEGIA-CORRECAO-DE-PARA.json` | Dados estruturados de todos os casos (JSON) |
| `ANALISE-COMPLETA-72-EQUIPAMENTOS.md` | Relatório detalhado de conformidade |
| `resultados/AUDITORIA-COMPLETA-DE-PARA.md` | De-Para com dados coletados da API |
| `resultados/PLANILHA-TRANSICOES.csv` | Todas as transições (Excel) |
| `resultados/PLANILHA-EXPOSICAO-FLASH.csv` | Exposição e flash (Excel) |
| `resultados/PLANILHA-OCR-SISTEMA.csv` | OCR, classificador, sistema (Excel) |
| `resultados/_ALL_DEVICES.json` | Dados brutos completos da coleta |
| `resultados/_DIAGNOSTICO_TRANSICOES.json` | Diagnóstico automático |
| `aplicar-correcoes.mjs` | Script de correção automatizada (--dry-run para testar) |

---

*Gerado em 03/06/2026 — Axion Intelligence Hub*
