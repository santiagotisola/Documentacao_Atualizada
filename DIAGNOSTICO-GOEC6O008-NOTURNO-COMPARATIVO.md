# Diagnóstico: GOEC6O008 em Status Noturno — Análise Comparativa

**Data da análise:** 02/06/2026 às 17:22 (horário local Goiás)  
**Condição:** Fim de tarde / pré-crepúsculo (~30 min antes do pôr do sol)

---

## 1. Resumo Executivo

| Equipamento | Perfil Ativo | Config Transições | Status | Diagnóstico |
|---|---|---|---|---|
| **GOEC6O008** | ❌ Noturno | ⚠️ Time-based com gap | TRAVADO | Bug de configuração - transições impedem retorno ao Diurno |
| **GOEC6O058** | ✅ Diurno | ✅ Luminosity-based (00:00:00) | CORRETO | Referência padrão |
| **GOEC6O007** | ⚠️ Noturno | ✅ Luminosity-based (00:00:00) | NORMAL | Luminosidade local abaixo do threshold (crepúsculo) |
| **GOEC6O004** | ⚠️ Noturno | ✅ Luminosity-based (00:00:00) | NORMAL | Luminosidade local abaixo do threshold (crepúsculo) |

---

## 2. Por que a GOEC6O008 está com Status Noturno?

### Causa Raiz: Dead-Lock de Transição por Janela de Tempo

A GOEC6O008 utiliza **transições baseadas em horário** com uma falha lógica que cria um "ponto morto" onde a câmera NÃO CONSEGUE retornar ao perfil diurno:

```
┌─────────────────────────────────────────────────────────────────────┐
│              GOEC6O008 - MAPA DE TRANSIÇÕES (BUG)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Perfil "Tarde" (id=0) - Diurno                                     │
│  ├─ upper: 06:00→00:00, level>30 → Perfil 0 (si mesmo)             │
│  └─ lower: 00:00→18:00, level<10 → Perfil 23483 (Noturno)          │
│                                                                      │
│  Perfil "Noturno" (id=23483)                                        │
│  ├─ lower: 00:00→06:00, level<10 → Perfil 23483 (si mesmo)         │
│  └─ upper: 18:01→00:00, level>30 → Perfil 0 (Tarde)                │
│                                                                      │
│  ⚠️  PROBLEMA: Quando em Noturno, a transição de RETORNO            │
│      para Diurno (upper) SÓ funciona entre 18:01 e 00:00            │
│      Entre 00:00 e 18:01 → NÃO HÁ TRANSIÇÃO para voltar!           │
│                                                                      │
│  TIMELINE DO BUG:                                                    │
│  00:00──────06:00──────12:00──────17:22──────18:01──────00:00       │
│  │  Noturno fica   │          DEAD ZONE           │ Pode  │         │
│  │  preso em si    │  Não há transição upper      │voltar!│         │
│  │  (lower→self)   │  definida neste período      │       │         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Sequência do Bug:
1. Câmera entra em **Noturno** durante a noite (luminosidade < 10)
2. Ao amanhecer (~06:00), luminosidade sobe acima de 30
3. **MAS** a transição `upper` do Noturno só está ativa entre `18:01→00:00`
4. Resultado: câmera **fica travada em Noturno o dia inteiro** até 18:01
5. Se a luminosidade ainda estiver > 30 às 18:01, finalmente retorna ao Diurno
6. Às 18:01 já é noite → luminosidade < 30 → **nunca retorna!**
7. **Ciclo perpétuo em Noturno** 🔴

---

## 3. Equipamentos Referência — Configuração Correta

### GOEC6O058 (Faixa 1) — ✅ REFERÊNCIA PRINCIPAL

**Status atual:** Perfil Diurno ATIVO (correto para 17:22)

```json
{
  "Perfil Diurno (id=0)": {
    "active": true,
    "saturation": 0,
    "gamma": 130,
    "exchanger": true,
    "iris.automatic": true,
    "roi.enabled": true,
    "targetValue": 38,
    "shutter.maxValue": 500,
    "gain.maxValue": 1500,
    "transitions": {
      "lower": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 10, "profile": 27839 },
      "upper": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 35, "profile": 0 }
    }
  },
  "Perfil Noturno (id=27839)": {
    "active": false,
    "saturation": -100,
    "gamma": 12,
    "contrast": 30,
    "exchanger": false,
    "iris.automatic": false,
    "roi.enabled": false,
    "targetValue": 35,
    "shutter.maxValue": 800,
    "gain.maxValue": 4000,
    "flash": [{"out": 1, "percent": 65}, {"out": 3, "percent": 65}],
    "transitions": {
      "lower": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 10, "profile": 27839 },
      "upper": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 35, "profile": 0 }
    }
  }
}
```

**Por que funciona:** `startTime=00:00:00 / endTime=00:00:00` = transição **sempre ativa**, controlada EXCLUSIVAMENTE pelo sensor de luminosidade. Assim que a luminosidade ultrapassa 35, retorna imediatamente ao Diurno independente do horário.

---

### GOEC6O007 (Faixa 1) — ✅ CONFIG CORRETA (Noturno Legítimo)

**Status atual:** Perfil Noturno ATIVO

```json
{
  "Perfil Diurno (id=0)": {
    "active": false,
    "saturation": 0,
    "gamma": 130,
    "exchanger": true,
    "transitions": {
      "lower": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 10, "profile": 27839 },
      "upper": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 35, "profile": 0 }
    }
  },
  "Perfil Noturno (id=27839)": {
    "active": true,
    "saturation": -100,
    "gamma": 12,
    "exchanger": false,
    "transitions": {
      "lower": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 10, "profile": 27839 },
      "upper": { "startTime": "00:00:00", "endTime": "00:00:00", "level": 35, "profile": 0 }
    }
  }
}
```

**Por que está em Noturno:** Às 17:22 em Goiás (junho = inverno), o sol está muito baixo. A luminosidade no local deste equipamento já caiu abaixo de 10 (threshold lower). Isso é **comportamento correto** — o sensor detectou escuridão e acionou o perfil Noturno. Quando a luminosidade subir acima de 35 amanhã de manhã, retornará automaticamente ao Diurno.

---

### GOEC6O004 (Faixa 1) — ✅ CONFIG CORRETA (Noturno Legítimo)

**Status atual:** Perfil Noturno ATIVO

Configuração **idêntica** ao GOEC6O007. Mesma estrutura de transições (00:00:00/00:00:00), mesmos thresholds (10/35).

**Por que está em Noturno:** Mesma razão — luminosidade local abaixo do threshold no crepúsculo. Retornará ao Diurno automaticamente ao amanhecer.

---

## 4. Comparação Direta: GOEC6O008 vs Referências

| Parâmetro | GOEC6O008 ❌ | GOEC6O058 ✅ | GOEC6O007 ✅ | GOEC6O004 ✅ |
|---|---|---|---|---|
| **Perfil Ativo** | Noturno (travado) | Diurno | Noturno (legítimo) | Noturno (legítimo) |
| **Nome Diurno** | "Tarde" | "Diurno" | "Diurno" | "Diurno" |
| **ID Noturno** | 23483 | 27839 | 27839 | 27839 |
| **Transições** | Time-based (GAP) | Luminosity-based | Luminosity-based | Luminosity-based |
| **startTime/endTime** | 06:00/18:00 variados | 00:00:00/00:00:00 | 00:00:00/00:00:00 | 00:00:00/00:00:00 |
| **Lower level** | 10 | 10 | 10 | 10 |
| **Upper level** | 30 | 35 | 35 | 35 |
| **holdTime** | Não informado | 60000ms (1min) | 60000ms (1min) | 60000ms (1min) |
| **ROI Exposição** | Não | Sim | Sim | Sim |
| **Gain Max (Diurno)** | 1500 | 1500 | 1500 | 1500 |
| **Gain Max (Noturno)** | Não informado | 4000 | 4000 | 4000 |
| **Flash (Noturno)** | Não informado | 65% (out 1,3) | 65% (out 1,3) | 65% (out 1,3) |

### Diferenças Críticas:

| # | Parâmetro | GOEC6O008 (Errado) | Padrão Correto |
|---|---|---|---|
| 1 | `transitions.startTime` | `"06:00"` / `"18:01"` / `"00:00"` | `"00:00:00"` |
| 2 | `transitions.endTime` | `"18:00"` / `"00:00"` / `"06:00"` | `"00:00:00"` |
| 3 | `transitions.upper.level` | 30 | 35 |
| 4 | Noturno `id` | 23483 (custom) | 27839 (padrão frota) |
| 5 | ROI exposição (Diurno) | disabled | enabled |

---

## 5. Explicação: Por que GOEC6O058 está Diurno e GOEC6O007/004 estão Noturno?

Isso é **comportamento esperado** e prova que o sistema funciona:

```
17:22 em Goiás (02/Jun) — Inverno, sol baixo

GOEC6O058: Posição/orientação com mais incidência solar residual
  → Sensor lê luminosidade > 35 → Permanece em Diurno ✅

GOEC6O007: Local com menos luz (sombra, vegetação, orientação)
  → Sensor lê luminosidade < 10 → Transição legítima para Noturno ✅

GOEC6O004: Idem ao O007
  → Sensor lê luminosidade < 10 → Transição legítima para Noturno ✅

GOEC6O008: TRAVADO em Noturno desde a noite anterior!
  → NÃO é questão de luminosidade
  → É BUG de configuração que impede o retorno ❌
```

---

## 6. Correção Necessária para GOEC6O008

### Configuração atual (ERRADA):
```json
"transitions": {
  "lower": { "startTime": "00:00", "endTime": "18:00", "level": 10, "profile": 23483 },
  "upper": { "startTime": "06:00", "endTime": "00:00", "level": 30, "profile": 0 }
}
```

### Configuração correta (PADRÃO FROTA):
```json
"transitions": {
  "lower": { "startTime": "00:00:00", "endTime": "00:00:00", "holdTime": 60000, "level": 10, "profile": 27839 },
  "upper": { "startTime": "00:00:00", "endTime": "00:00:00", "holdTime": 60000, "level": 35, "profile": 0 }
}
```

### Passos para correção:
1. Acessar ITScam da GOEC6O008 via túnel Varco
2. Editar Perfil "Tarde" → renomear para "Diurno"
3. Alterar transições para `startTime=00:00:00 / endTime=00:00:00`
4. Alterar `upper.level` de 30 para 35
5. Habilitar ROI de exposição
6. Editar Perfil "Noturno" com mesmas transições
7. Salvar e aguardar a próxima transição automática por luminosidade

---

## 7. Resumo Visual da Lógica de Transição

```
┌─────────────────────────────────────────────────────────────┐
│         TRANSIÇÃO CORRETA (GOEC6O058/007/004)               │
│                                                              │
│  Luminosidade alta (>35)          Luminosidade baixa (<10)   │
│         ┌──────┐    cai abaixo de 10    ┌──────────┐        │
│         │DIURNO│ ──────────────────────► │ NOTURNO  │        │
│         │      │ ◄────────────────────── │          │        │
│         └──────┘    sobe acima de 35     └──────────┘        │
│                                                              │
│  ► Funciona 24h sem restrição de horário                     │
│  ► holdTime=60s evita oscilações rápidas                     │
│  ► Transição BIDIRECIONAL sem dead-zones                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         TRANSIÇÃO QUEBRADA (GOEC6O008)                       │
│                                                              │
│  "Tarde"                                    "Noturno"        │
│  ┌──────┐  lower: 00:00→18:00, <10  ┌──────────┐           │
│  │      │ ─────────────────────────► │          │           │
│  │      │                            │  TRAVADO │           │
│  │      │  upper: 18:01→00:00, >30   │          │           │
│  │      │ ◄─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │          │           │
│  └──────┘  (só funciona das 18:01+)  └──────────┘           │
│                                                              │
│  ⚠️ Entre 06:00 e 18:01 NÃO HÁ caminho de volta!           │
│  ⚠️ Às 18:01 já é noite → luminosidade < 30 → NUNCA volta  │
│  ► RESULTADO: Câmera em P&B permanentemente                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Outros Problemas Identificados (GOEC6O058, GOEC6O007, GOEC6O004)

⚠️ **Overlay com código errado:** Todos os 3 equipamentos referência possuem no overlay:
```
CODIGO EQUIPAMENTO: GOEC6O009
```
Isso está **incorreto** — cada câmera deveria ter seu próprio código no overlay. Como o overlay está `enable: false`, não impacta as imagens, mas se for habilitado no futuro, estampará o código errado.

---

## 9. Conclusão

| Aspecto | Resultado |
|---|---|
| **Causa do P&B na GOEC6O008** | Dead-lock de transição por janela de tempo restritiva |
| **Config padrão correta** | startTime/endTime = "00:00:00" (sempre ativo, sensor-driven) |
| **GOEC6O007 e GOEC6O004 em Noturno** | Comportamento CORRETO — é crepúsculo e o sensor detectou baixa luminosidade |
| **GOEC6O058 em Diurno** | Prova que o sistema funciona — local com mais luminosidade residual |
| **Ação necessária** | Reconfigurar transições da GOEC6O008 para padrão luminosity-based |
| **Prioridade** | ALTA — câmera produzindo imagens P&B 24h/dia |
