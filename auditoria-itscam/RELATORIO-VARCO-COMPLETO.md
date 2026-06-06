# RELATÓRIO COMPLETO — Configuração VARCO / ITScam 450 SETRANS-GO

**Data:** 2026-06-05
**Total dispositivos:** 72
**Online/coletados:** 72
**Offline:** 0
**Referência:** GOEC6O045 - Faixa 1

---

## 1. RESUMO EXECUTIVO

| Categoria | Qtd | % |
|---|---|---|
| ✅ 100% Conformes (idênticos à referência) | 23 | 32% |
| ⚠️ Com divergências | 49 | 68% |
| ❌ Offline | 0 | — |
| 📊 Grupos de configuração distintos | 22 | — |

## 2. CONFIGURAÇÃO REFERÊNCIA (GOEC6O045 - Faixa 1)

Todos os valores abaixo são os **corretos**. Qualquer dispositivo com valor diferente precisa ser avaliado.

| Seção | Parâmetro | Valor Correto |
|---|---|---|
| VARCO | `VARCO.enabled` | `true` |
| VARCO | `VARCO.edgeServer` | `edge.varco.io` |
| Diurno | `Diurno.lower.startTime` | `00:00:00` |
| Diurno | `Diurno.lower.endTime` | `00:00:00` |
| Diurno | `Diurno.lower.level` | `10` |
| Diurno | `Diurno.lower.holdTime` | `60000` |
| Diurno | `Diurno.upper.startTime` | `00:00:00` |
| Diurno | `Diurno.upper.endTime` | `00:00:00` |
| Diurno | `Diurno.upper.level` | `35` |
| Diurno | `Diurno.upper.holdTime` | `60000` |
| Diurno | `Diurno.upper.profile` | `0` |
| Noturno | `Noturno.lower.startTime` | `00:00:00` |
| Noturno | `Noturno.lower.endTime` | `00:00:00` |
| Noturno | `Noturno.lower.level` | `10` |
| Noturno | `Noturno.lower.holdTime` | `60000` |
| Noturno | `Noturno.upper.startTime` | `00:00:00` |
| Noturno | `Noturno.upper.endTime` | `00:00:00` |
| Noturno | `Noturno.upper.level` | `35` |
| Noturno | `Noturno.upper.holdTime` | `60000` |
| Noturno | `Noturno.upper.profile` | `0` |
| OCR | `OCR.enabled` | `true` |
| OCR | `OCR.countryCode` | `76` |
| OCR | `OCR.maxPlates` | `2` |
| OCR | `OCR.lowProbChar` | `45` |
| OCR | `OCR.maxLowProbChars` | `0` |
| OCR | `OCR.processingQueue` | `4` |
| OCR | `OCR.processingThreads` | `4` |
| OCR | `OCR.processingMode` | `3` |
| OCR | `OCR.vehicleType` | `3` |
| Classificador | `Classificador.enabled` | `true` |
| Classificador | `Classificador.processingQueue` | `1` |
| Classificador | `Classificador.processingThreads` | `1` |
| Classificador | `Classificador.sceneType` | `0` |
| Classificador | `Classificador.minProbability` | `20` |
| SnapshotCrop | `SnapshotCrop.enable` | `false` |
| SnapshotCrop | `SnapshotCrop.mode` | `static` |
| FTP | `FTP.enable` | `false` |
| IO | `IO.port1.earlyUs` | `7` |
| IO | `IO.port1.isReserved` | `true` |
| IO | `IO.port3.earlyUs` | `7` |
| IO | `IO.port3.isReserved` | `true` |
| SNMP | `SNMP.enabled` | `false` |
| Reboot | `Reboot.scheduled.enabled` | `false` |
| Reboot | `Reboot.periodic.enabled` | `false` |
| NTP | `NTP.server` | `time.google.com` |
| Timezone | `Timezone` | `America/Sao_Paulo` |
| Video | `Video.framerate` | `12` |
| Video | `Video.quality` | `85` |
| Video | `Video.useTriggerFrames` | `true` |
| Firmware | `Firmware.version` | `v1.7.8` |

## 3. DISPOSITIVOS 100% CONFORMES

23 equipamentos com **ZERO divergências** — configuração idêntica à referência:

1. GOEC6O002 - Faixa 1
2. GOEC6O002 - Faixa 2
3. GOEC6O005 - Faixa 1
4. GOEC6O005 - Faixa 2
5. GOEC6O007 - Faixa 1
6. GOEC6O007 - Faixa 2
7. GOEC6O008 - Faixa 2
8. GOEC6O018 - Faixa 1
9. GOEC6O020 - Faixa 2
10. GOEC6O021 - Faixa 1
11. GOEC6O022 - Faixa 1
12. GOEC6O022 - Faixa 2
13. GOEC6O041 - Faixa 1
14. GOEC6O041 - Faixa 2
15. GOEC6O045 - Faixa 1
16. GOEC6O045 - Faixa 2
17. GOEC6O048 - Faixa 1
18. GOEC6O048 - Faixa 2
19. GOEC6O051 - Faixa 1
20. GOEC6O051 - Faixa 2
21. GOEC6O057 - Faixa 2
22. GOEC6O058 - Faixa 1
23. GOEC6O059 - Faixa 1

## 4. GRUPOS DE CONFIGURAÇÃO (dispositivos com mesmas divergências)

Dispositivos agrupados por **padrão idêntico de configuração**. Cada grupo tem exatamente os mesmos campos divergentes com os mesmos valores.

### Grupo 1 — 15 equipamento(s) | 1 divergência(s)

**Equipamentos:**
- GOEC6O004 - Faixa 1
- GOEC6O004 - Faixa 2
- GOEC6O006 - Faixa 1
- GOEC6O006 - Faixa 2
- GOEC6O011 - Faixa 1
- GOEC6O018 - Faixa 2
- GOEC6O029 - Faixa 1
- GOEC6O029 - Faixa 2
- GOEC6O033 - Faixa 1
- GOEC6O043 - Faixa 1
- GOEC6O043 - Faixa 2
- GOEC6O050 - Faixa 1
- GOEC6O054 - Faixa 1
- GOEC6O054 - Faixa 2
- GOEC6O056 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |

### Grupo 2 — 6 equipamento(s) | 48 divergência(s)

**Equipamentos:**
- GOEC6O019 - Faixa 1
- GOEC6O019 - Faixa 2
- GOEC6O023 - Faixa 1
- GOEC6O049 - Faixa 1
- GOEC6O049 - Faixa 2
- GOEC6O052 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `VARCO.enabled` | **null** | true | → Alterar p/ true |
| `VARCO.edgeServer` | **null** | edge.varco.io | → Alterar p/ edge.varco.io |
| `Diurno.lower.startTime` | **null** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.lower.endTime` | **null** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.lower.level` | **null** | 10 | → Alterar p/ 10 |
| `Diurno.lower.holdTime` | **null** | 60000 | → Alterar p/ 60000 |
| `Diurno.upper.startTime` | **null** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.upper.endTime` | **null** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.upper.level` | **null** | 35 | → Alterar p/ 35 |
| `Diurno.upper.holdTime` | **null** | 60000 | → Alterar p/ 60000 |
| `Noturno.lower.startTime` | **null** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.lower.endTime` | **null** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.lower.level` | **null** | 10 | → Alterar p/ 10 |
| `Noturno.lower.holdTime` | **null** | 60000 | → Alterar p/ 60000 |
| `Noturno.upper.startTime` | **null** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.upper.endTime` | **null** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.upper.level` | **null** | 35 | → Alterar p/ 35 |
| `Noturno.upper.holdTime` | **null** | 60000 | → Alterar p/ 60000 |
| `Noturno.upper.profile` | **null** | 0 | → Alterar p/ 0 |
| `OCR.enabled` | **null** | true | → Alterar p/ true |
| `OCR.countryCode` | **null** | 76 | → Alterar p/ 76 |
| `OCR.maxPlates` | **null** | 2 | → Alterar p/ 2 |
| `OCR.lowProbChar` | **null** | 45 | → Alterar p/ 45 |
| `OCR.maxLowProbChars` | **null** | 0 | → Alterar p/ 0 |
| `OCR.processingQueue` | **null** | 4 | → Alterar p/ 4 |
| `OCR.processingThreads` | **null** | 4 | → Alterar p/ 4 |
| `OCR.processingMode` | **null** | 3 | → Alterar p/ 3 |
| `OCR.vehicleType` | **null** | 3 | → Alterar p/ 3 |
| `Classificador.enabled` | **null** | true | → Alterar p/ true |
| `Classificador.processingQueue` | **null** | 1 | → Alterar p/ 1 |
| `Classificador.processingThreads` | **null** | 1 | → Alterar p/ 1 |
| `Classificador.sceneType` | **null** | 0 | → Alterar p/ 0 |
| `Classificador.minProbability` | **null** | 20 | → Alterar p/ 20 |
| `SnapshotCrop.enable` | **null** | false | → Alterar p/ false |
| `SnapshotCrop.mode` | **null** | static | → Alterar p/ static |
| `FTP.enable` | **null** | false | → Alterar p/ false |
| `IO.port1.earlyUs` | **undefined** | 7 | → Alterar p/ 7 |
| `IO.port1.isReserved` | **undefined** | true | → Alterar p/ true |
| `IO.port3.earlyUs` | **undefined** | 7 | → Alterar p/ 7 |
| `IO.port3.isReserved` | **undefined** | true | → Alterar p/ true |
| `SNMP.enabled` | **null** | false | → Alterar p/ false |
| `Reboot.scheduled.enabled` | **null** | false | → Alterar p/ false |
| `Reboot.periodic.enabled` | **null** | false | → Alterar p/ false |
| `NTP.server` | **null** | time.google.com | → Alterar p/ time.google.com |
| `Timezone` | **null** | America/Sao_Paulo | → Alterar p/ America/Sao_Paulo |
| `Video.framerate` | **null** | 12 | → Alterar p/ 12 |
| `Video.quality` | **null** | 85 | → Alterar p/ 85 |
| `Video.useTriggerFrames` | **null** | true | → Alterar p/ true |

### Grupo 3 — 4 equipamento(s) | 1 divergência(s)

**Equipamentos:**
- GOEC6O003 - Faixa 1
- GOEC6O046 - Faixa 2
- GOEC6O053 - Faixa 1
- GOEC6O053 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `SnapshotCrop.mode` | **ocr** | static | → Alterar p/ static |

### Grupo 4 — 3 equipamento(s) | 2 divergência(s)

**Equipamentos:**
- GOEC6O020 - Faixa 1
- GOEC6O056 - Faixa 2
- GOEC6O057 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |
| `Video.useTriggerFrames` | **false** | true | → Alterar p/ true |

### Grupo 5 — 2 equipamento(s) | 2 divergência(s)

**Equipamentos:**
- GOEC6O003 - Faixa 2
- GOEC6O013 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |
| `SnapshotCrop.enable` | **true** | false | → Alterar p/ false |

### Grupo 6 — 2 equipamento(s) | 1 divergência(s)

**Equipamentos:**
- GOEC6O036 - Faixa 1
- GOEC6O050 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Video.useTriggerFrames` | **false** | true | → Alterar p/ true |

### Grupo 7 — 2 equipamento(s) | 4 divergência(s)

**Equipamentos:**
- GOEC6O040 - Faixa 2
- GOEC6O055 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Diurno.lower.endTime` | **18:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.upper.startTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.lower.endTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.upper.startTime` | **18:01:00** | 00:00:00 | → Alterar p/ 00:00:00 |

### Grupo 8 — 2 equipamento(s) | 2 divergência(s)

**Equipamentos:**
- GOEC6O052 - Faixa 2
- GOEC6O058 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |
| `Classificador.processingThreads` | **4** | 1 | → Alterar p/ 1 |

### Grupo 9 — 1 equipamento(s) | 15 divergência(s)

**Equipamentos:**
- GOEC6O008 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Diurno.lower.endTime` | **18:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.upper.startTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.upper.level` | **30** | 35 | → Alterar p/ 35 |
| `Noturno.lower.endTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.upper.startTime` | **18:01:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.upper.level` | **30** | 35 | → Alterar p/ 35 |
| `Noturno.upper.profile` | **23483** | 0 | → Alterar p/ 0 |
| `OCR.processingQueue` | **2** | 4 | → Alterar p/ 4 |
| `OCR.processingThreads` | **2** | 4 | → Alterar p/ 4 |
| `SnapshotCrop.enable` | **true** | false | → Alterar p/ false |
| `IO.port1.earlyUs` | **0** | 7 | → Alterar p/ 7 |
| `IO.port3.earlyUs` | **0** | 7 | → Alterar p/ 7 |
| `Video.framerate` | **1** | 12 | → Alterar p/ 12 |
| `Video.quality` | **60** | 85 | → Alterar p/ 85 |
| `Video.useTriggerFrames` | **false** | true | → Alterar p/ true |

### Grupo 10 — 1 equipamento(s) | 8 divergência(s)

**Equipamentos:**
- GOEC6O009 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Diurno.upper.level` | **40** | 35 | → Alterar p/ 35 |
| `Noturno.upper.level` | **40** | 35 | → Alterar p/ 35 |
| `OCR.vehicleType` | **1** | 3 | → Alterar p/ 3 |
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |
| `Classificador.sceneType` | **1** | 0 | → Alterar p/ 0 |
| `Classificador.minProbability` | **60** | 20 | → Alterar p/ 20 |
| `SNMP.enabled` | **true** | false | → Alterar p/ false |
| `Reboot.scheduled.enabled` | **true** | false | → Alterar p/ false |

### Grupo 11 — 1 equipamento(s) | 8 divergência(s)

**Equipamentos:**
- GOEC6O009 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Diurno.upper.level` | **40** | 35 | → Alterar p/ 35 |
| `Noturno.upper.level` | **40** | 35 | → Alterar p/ 35 |
| `OCR.maxPlates` | **1** | 2 | → Alterar p/ 2 |
| `OCR.vehicleType` | **1** | 3 | → Alterar p/ 3 |
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |
| `Classificador.minProbability` | **50** | 20 | → Alterar p/ 20 |
| `SNMP.enabled` | **true** | false | → Alterar p/ false |
| `Reboot.scheduled.enabled` | **true** | false | → Alterar p/ false |

### Grupo 12 — 1 equipamento(s) | 3 divergência(s)

**Equipamentos:**
- GOEC6O010 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `OCR.processingThreads` | **2** | 4 | → Alterar p/ 4 |
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |
| `Classificador.processingThreads` | **4** | 1 | → Alterar p/ 1 |

### Grupo 13 — 1 equipamento(s) | 1 divergência(s)

**Equipamentos:**
- GOEC6O010 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Classificador.processingThreads` | **2** | 1 | → Alterar p/ 1 |

### Grupo 14 — 1 equipamento(s) | 8 divergência(s)

**Equipamentos:**
- GOEC6O011 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `OCR.processingQueue` | **2** | 4 | → Alterar p/ 4 |
| `OCR.processingThreads` | **2** | 4 | → Alterar p/ 4 |
| `OCR.processingMode` | **2** | 3 | → Alterar p/ 3 |
| `Classificador.processingQueue` | **2** | 1 | → Alterar p/ 1 |
| `Classificador.processingThreads` | **2** | 1 | → Alterar p/ 1 |
| `Classificador.sceneType` | **1** | 0 | → Alterar p/ 0 |
| `NTP.server` | **200.160.0.8** | time.google.com | → Alterar p/ time.google.com |
| `Video.framerate` | **1** | 12 | → Alterar p/ 12 |

### Grupo 15 — 1 equipamento(s) | 3 divergência(s)

**Equipamentos:**
- GOEC6O013 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Diurno.lower.level` | **30** | 10 | → Alterar p/ 10 |
| `Diurno.upper.level` | **30** | 35 | → Alterar p/ 35 |
| `Noturno.upper.level` | **30** | 35 | → Alterar p/ 35 |

### Grupo 16 — 1 equipamento(s) | 10 divergência(s)

**Equipamentos:**
- GOEC6O028 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `OCR.processingQueue` | **2** | 4 | → Alterar p/ 4 |
| `OCR.processingThreads` | **2** | 4 | → Alterar p/ 4 |
| `OCR.processingMode` | **2** | 3 | → Alterar p/ 3 |
| `Classificador.processingQueue` | **2** | 1 | → Alterar p/ 1 |
| `Classificador.processingThreads` | **2** | 1 | → Alterar p/ 1 |
| `Classificador.sceneType` | **1** | 0 | → Alterar p/ 0 |
| `NTP.server` | **200.160.0.8** | time.google.com | → Alterar p/ time.google.com |
| `Video.framerate` | **1** | 12 | → Alterar p/ 12 |
| `Video.quality` | **10** | 85 | → Alterar p/ 85 |
| `Video.useTriggerFrames` | **false** | true | → Alterar p/ true |

### Grupo 17 — 1 equipamento(s) | 12 divergência(s)

**Equipamentos:**
- GOEC6O033 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Diurno.lower.startTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.lower.endTime` | **18:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.lower.level` | **35** | 10 | → Alterar p/ 10 |
| `Diurno.upper.startTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.upper.endTime` | **17:58:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.lower.startTime` | **18:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.lower.endTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.lower.level` | **35** | 10 | → Alterar p/ 10 |
| `Noturno.upper.startTime` | **18:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.upper.endTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `IO.port1.isReserved` | **false** | true | → Alterar p/ true |
| `IO.port3.isReserved` | **false** | true | → Alterar p/ true |

### Grupo 18 — 1 equipamento(s) | 4 divergência(s)

**Equipamentos:**
- GOEC6O040 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Diurno.lower.startTime` | **18:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.upper.startTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.lower.startTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.upper.startTime` | **18:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |

### Grupo 19 — 1 equipamento(s) | 2 divergência(s)

**Equipamentos:**
- GOEC6O046 - Faixa 1

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |
| `SnapshotCrop.mode` | **ocr** | static | → Alterar p/ static |

### Grupo 20 — 1 equipamento(s) | 9 divergência(s)

**Equipamentos:**
- GOEC6O055 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `Diurno.lower.startTime` | **18:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Diurno.upper.startTime` | **06:00:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.lower.startTime` | **05:59:59** | 00:00:00 | → Alterar p/ 00:00:00 |
| `Noturno.upper.startTime` | **18:01:00** | 00:00:00 | → Alterar p/ 00:00:00 |
| `OCR.maxPlates` | **1** | 2 | → Alterar p/ 2 |
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |
| `Classificador.sceneType` | **1** | 0 | → Alterar p/ 0 |
| `Classificador.minProbability` | **60** | 20 | → Alterar p/ 20 |
| `Video.framerate` | **5** | 12 | → Alterar p/ 12 |

### Grupo 21 — 1 equipamento(s) | 2 divergência(s)

**Equipamentos:**
- GOEC6O059 - Faixa 2

**Divergências vs Referência:**

| Parâmetro | Valor ATUAL (errado) | Valor CORRETO (referência) | Ação |
|---|---|---|---|
| `OCR.processingThreads` | **1** | 4 | → Alterar p/ 4 |
| `Classificador.processingQueue` | **4** | 1 | → Alterar p/ 1 |

## 6. TABELA COMPLETA — Status de Cada Equipamento

| # | Equipamento | Status | Divergências | Grupo |
|---|---|---|---|---|
| 1 | GOEC6O002 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 2 | GOEC6O002 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 3 | GOEC6O003 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 3 |
| 4 | GOEC6O003 - Faixa 2 | ⚠️ Divergente | 2 | Grupo 5 |
| 5 | GOEC6O004 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 6 | GOEC6O004 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 1 |
| 7 | GOEC6O005 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 8 | GOEC6O005 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 9 | GOEC6O006 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 10 | GOEC6O006 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 1 |
| 11 | GOEC6O007 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 12 | GOEC6O007 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 13 | GOEC6O008 - Faixa 1 | ⚠️ Divergente | 15 | Grupo 9 |
| 14 | GOEC6O008 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 15 | GOEC6O009 - Faixa 1 | ⚠️ Divergente | 8 | Grupo 10 |
| 16 | GOEC6O009 - Faixa 2 | ⚠️ Divergente | 8 | Grupo 11 |
| 17 | GOEC6O010 - Faixa 1 | ⚠️ Divergente | 3 | Grupo 12 |
| 18 | GOEC6O010 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 13 |
| 19 | GOEC6O011 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 20 | GOEC6O011 - Faixa 2 | ⚠️ Divergente | 8 | Grupo 14 |
| 21 | GOEC6O013 - Faixa 1 | ⚠️ Divergente | 2 | Grupo 5 |
| 22 | GOEC6O013 - Faixa 2 | ⚠️ Divergente | 3 | Grupo 15 |
| 23 | GOEC6O018 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 24 | GOEC6O018 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 1 |
| 25 | GOEC6O019 - Faixa 1 | ⚠️ Divergente | 48 | Grupo 2 |
| 26 | GOEC6O019 - Faixa 2 | ⚠️ Divergente | 48 | Grupo 2 |
| 27 | GOEC6O020 - Faixa 1 | ⚠️ Divergente | 2 | Grupo 4 |
| 28 | GOEC6O020 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 29 | GOEC6O021 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 30 | GOEC6O022 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 31 | GOEC6O022 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 32 | GOEC6O023 - Faixa 1 | ⚠️ Divergente | 48 | Grupo 2 |
| 33 | GOEC6O028 - Faixa 1 | ⚠️ Divergente | 10 | Grupo 16 |
| 34 | GOEC6O029 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 35 | GOEC6O029 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 1 |
| 36 | GOEC6O033 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 37 | GOEC6O033 - Faixa 2 | ⚠️ Divergente | 12 | Grupo 17 |
| 38 | GOEC6O036 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 6 |
| 39 | GOEC6O040 - Faixa 1 | ⚠️ Divergente | 4 | Grupo 18 |
| 40 | GOEC6O040 - Faixa 2 | ⚠️ Divergente | 4 | Grupo 7 |
| 41 | GOEC6O041 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 42 | GOEC6O041 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 43 | GOEC6O043 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 44 | GOEC6O043 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 1 |
| 45 | GOEC6O045 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 46 | GOEC6O045 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 47 | GOEC6O046 - Faixa 1 | ⚠️ Divergente | 2 | Grupo 19 |
| 48 | GOEC6O046 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 3 |
| 49 | GOEC6O048 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 50 | GOEC6O048 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 51 | GOEC6O049 - Faixa 1 | ⚠️ Divergente | 48 | Grupo 2 |
| 52 | GOEC6O049 - Faixa 2 | ⚠️ Divergente | 48 | Grupo 2 |
| 53 | GOEC6O050 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 54 | GOEC6O050 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 6 |
| 55 | GOEC6O051 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 56 | GOEC6O051 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 57 | GOEC6O052 - Faixa 1 | ⚠️ Divergente | 48 | Grupo 2 |
| 58 | GOEC6O052 - Faixa 2 | ⚠️ Divergente | 2 | Grupo 8 |
| 59 | GOEC6O053 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 3 |
| 60 | GOEC6O053 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 3 |
| 61 | GOEC6O054 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 62 | GOEC6O054 - Faixa 2 | ⚠️ Divergente | 1 | Grupo 1 |
| 63 | GOEC6O055 - Faixa 1 | ⚠️ Divergente | 4 | Grupo 7 |
| 64 | GOEC6O055 - Faixa 2 | ⚠️ Divergente | 9 | Grupo 20 |
| 65 | GOEC6O056 - Faixa 1 | ⚠️ Divergente | 1 | Grupo 1 |
| 66 | GOEC6O056 - Faixa 2 | ⚠️ Divergente | 2 | Grupo 4 |
| 67 | GOEC6O057 - Faixa 1 | ⚠️ Divergente | 2 | Grupo 4 |
| 68 | GOEC6O057 - Faixa 2 | ✅ Conforme | 0 | Referência |
| 69 | GOEC6O058 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 70 | GOEC6O058 - Faixa 2 | ⚠️ Divergente | 2 | Grupo 8 |
| 71 | GOEC6O059 - Faixa 1 | ✅ Conforme | 0 | Referência |
| 72 | GOEC6O059 - Faixa 2 | ⚠️ Divergente | 2 | Grupo 21 |

## 7. ANÁLISE POR PARÂMETRO — Distribuição de Valores

Para cada parâmetro, mostra quantos dispositivos usam cada valor:

### `Classificador.enabled`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `true` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `Classificador.minProbability`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `20` | 63 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+60) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `60` | 2 | ❌ NÃO | GOEC6O009 - Faixa 1, GOEC6O055 - Faixa 2 |
| `50` | 1 | ❌ NÃO | GOEC6O009 - Faixa 2 |

### `Classificador.processingQueue`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `1` | 36 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+33) |
| `4` | 28 | ❌ NÃO | GOEC6O003 - Faixa 2, GOEC6O004 - Faixa 1, GOEC6O004 - Faixa 2 ... (+25) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `2` | 2 | ❌ NÃO | GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1 |

### `Classificador.processingThreads`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `1` | 60 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+57) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `2` | 3 | ❌ NÃO | GOEC6O010 - Faixa 2, GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1 |
| `4` | 3 | ❌ NÃO | GOEC6O010 - Faixa 1, GOEC6O052 - Faixa 2, GOEC6O058 - Faixa 2 |

### `Classificador.sceneType`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `0` | 62 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+59) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `1` | 4 | ❌ NÃO | GOEC6O009 - Faixa 1, GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1, GOEC6O055 - Faixa 2 |

### `Diurno.lower.endTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `00:00:00` | 62 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+59) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `18:00:00` | 4 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O033 - Faixa 2, GOEC6O040 - Faixa 2, GOEC6O055 - Faixa 1 |

### `Diurno.lower.holdTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `60000` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `Diurno.lower.level`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `10` | 64 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+61) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `30` | 1 | ❌ NÃO | GOEC6O013 - Faixa 2 |
| `35` | 1 | ❌ NÃO | GOEC6O033 - Faixa 2 |

### `Diurno.lower.startTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `00:00:00` | 63 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+60) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `18:00:00` | 2 | ❌ NÃO | GOEC6O040 - Faixa 1, GOEC6O055 - Faixa 2 |
| `06:00:00` | 1 | ❌ NÃO | GOEC6O033 - Faixa 2 |

### `Diurno.upper.endTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `00:00:00` | 65 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+62) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `17:58:00` | 1 | ❌ NÃO | GOEC6O033 - Faixa 2 |

### `Diurno.upper.holdTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `60000` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `Diurno.upper.level`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `35` | 62 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+59) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `30` | 2 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O013 - Faixa 2 |
| `40` | 2 | ❌ NÃO | GOEC6O009 - Faixa 1, GOEC6O009 - Faixa 2 |

### `Diurno.upper.startTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `00:00:00` | 60 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+57) |
| `06:00:00` | 6 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O033 - Faixa 2, GOEC6O040 - Faixa 1 ... (+3) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `Firmware.version`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `v1.7.8` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `FTP.enable`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `false` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `IO.port1.earlyUs`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `7` | 65 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+62) |
| `0` | 1 | ❌ NÃO | GOEC6O008 - Faixa 1 |

### `IO.port1.isReserved`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `true` | 65 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+62) |
| `false` | 1 | ❌ NÃO | GOEC6O033 - Faixa 2 |

### `IO.port3.earlyUs`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `7` | 65 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+62) |
| `0` | 1 | ❌ NÃO | GOEC6O008 - Faixa 1 |

### `IO.port3.isReserved`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `true` | 65 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+62) |
| `false` | 1 | ❌ NÃO | GOEC6O033 - Faixa 2 |

### `Noturno.lower.endTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `00:00:00` | 62 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+59) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `06:00:00` | 4 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O033 - Faixa 2, GOEC6O040 - Faixa 2, GOEC6O055 - Faixa 1 |

### `Noturno.lower.holdTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `60000` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `Noturno.lower.level`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `10` | 65 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+62) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `35` | 1 | ❌ NÃO | GOEC6O033 - Faixa 2 |

### `Noturno.lower.startTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `00:00:00` | 63 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+60) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `18:00:00` | 1 | ❌ NÃO | GOEC6O033 - Faixa 2 |
| `06:00:00` | 1 | ❌ NÃO | GOEC6O040 - Faixa 1 |
| `05:59:59` | 1 | ❌ NÃO | GOEC6O055 - Faixa 2 |

### `Noturno.upper.endTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `00:00:00` | 65 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+62) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `06:00:00` | 1 | ❌ NÃO | GOEC6O033 - Faixa 2 |

### `Noturno.upper.holdTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `60000` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `Noturno.upper.level`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `35` | 62 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+59) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `30` | 2 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O013 - Faixa 2 |
| `40` | 2 | ❌ NÃO | GOEC6O009 - Faixa 1, GOEC6O009 - Faixa 2 |

### `Noturno.upper.profile`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `0` | 65 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+62) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `23483` | 1 | ❌ NÃO | GOEC6O008 - Faixa 1 |

### `Noturno.upper.startTime`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `00:00:00` | 60 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+57) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `18:01:00` | 4 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O040 - Faixa 2, GOEC6O055 - Faixa 1, GOEC6O055 - Faixa 2 |
| `18:00:00` | 2 | ❌ NÃO | GOEC6O033 - Faixa 2, GOEC6O040 - Faixa 1 |

### `NTP.server`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `time.google.com` | 64 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+61) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `200.160.0.8` | 2 | ❌ NÃO | GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1 |

### `OCR.countryCode`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `76` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `OCR.enabled`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `true` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `OCR.lowProbChar`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `45` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `OCR.maxLowProbChars`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `0` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `OCR.maxPlates`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `2` | 64 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+61) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `1` | 2 | ❌ NÃO | GOEC6O009 - Faixa 2, GOEC6O055 - Faixa 2 |

### `OCR.processingMode`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `3` | 64 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+61) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `2` | 2 | ❌ NÃO | GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1 |

### `OCR.processingQueue`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `4` | 63 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+60) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `2` | 3 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1 |

### `OCR.processingThreads`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `4` | 61 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+58) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `2` | 4 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O010 - Faixa 1, GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1 |
| `1` | 1 | ❌ NÃO | GOEC6O059 - Faixa 2 |

### `OCR.vehicleType`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `3` | 64 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+61) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `1` | 2 | ❌ NÃO | GOEC6O009 - Faixa 1, GOEC6O009 - Faixa 2 |

### `Reboot.periodic.enabled`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `false` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `Reboot.scheduled.enabled`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `false` | 64 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+61) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `true` | 2 | ❌ NÃO | GOEC6O009 - Faixa 1, GOEC6O009 - Faixa 2 |

### `SnapshotCrop.enable`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `false` | 63 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+60) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `true` | 3 | ❌ NÃO | GOEC6O003 - Faixa 2, GOEC6O008 - Faixa 1, GOEC6O013 - Faixa 1 |

### `SnapshotCrop.mode`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `static` | 61 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 2 ... (+58) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `ocr` | 5 | ❌ NÃO | GOEC6O003 - Faixa 1, GOEC6O046 - Faixa 1, GOEC6O046 - Faixa 2, GOEC6O053 - Faixa 1, GOEC6O053 - Faixa 2 |

### `SNMP.enabled`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `false` | 64 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+61) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `true` | 2 | ❌ NÃO | GOEC6O009 - Faixa 1, GOEC6O009 - Faixa 2 |

### `Timezone`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `America/Sao_Paulo` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `VARCO.edgeServer`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `edge.varco.io` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `VARCO.enabled`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `true` | 66 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+63) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |

### `Video.framerate`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `12` | 62 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+59) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `1` | 3 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1 |
| `5` | 1 | ❌ NÃO | GOEC6O055 - Faixa 2 |

### `Video.quality`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `85` | 64 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+61) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
| `10` | 1 | ❌ NÃO | GOEC6O028 - Faixa 1 |
| `60` | 1 | ❌ NÃO | GOEC6O008 - Faixa 1 |

### `Video.useTriggerFrames`

| Valor | Qtd | Correto? | Equipamentos |
|---|---|---|---|
| `true` | 59 | ✅ SIM | GOEC6O002 - Faixa 1, GOEC6O002 - Faixa 2, GOEC6O003 - Faixa 1 ... (+56) |
| `false` | 7 | ❌ NÃO | GOEC6O008 - Faixa 1, GOEC6O020 - Faixa 1, GOEC6O028 - Faixa 1 ... (+4) |
| `null` | 6 | ❌ NÃO | GOEC6O019 - Faixa 1, GOEC6O019 - Faixa 2, GOEC6O023 - Faixa 1 ... (+3) |
