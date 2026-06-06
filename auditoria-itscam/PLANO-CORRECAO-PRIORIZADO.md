# Plano de Correção Priorizado - Auditoria ITScam 450

**Data:** 02/06/2026  
**Referência:** GOEC6O058 - Faixa 1  
**Total coletados:** 64/70 (6 com falha AUTH)  
**Equipamentos com divergências:** 63/64  

---

## Prioridade 1 — CRÍTICA (Impacto direto no funcionamento)

### 1.1 Classificador - processingQueue incorreta (30 equipamentos)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `classifier.processingQueue` | 4 | **1** | Sobrecarga de processamento, atraso na classificação |

**Equipamentos afetados:**
GOEC6O003-F2, GOEC6O004-F1/F2, GOEC6O006-F1/F2, GOEC6O007-F1/F2, GOEC6O008-F2, GOEC6O013-F1/F2, GOEC6O018-F1/F2, GOEC6O020-F1/F2, GOEC6O021-F1, GOEC6O022-F1/F2, GOEC6O029-F1/F2, GOEC6O033-F1/F2, GOEC6O036-F1, GOEC6O040-F1/F2, GOEC6O041-F1/F2, GOEC6O043-F1/F2, GOEC6O045-F1/F2, GOEC6O046-F1/F2, GOEC6O048-F1/F2, GOEC6O050-F1/F2, GOEC6O051-F1/F2, GOEC6O053-F1/F2, GOEC6O054-F1/F2, GOEC6O055-F1, GOEC6O056-F1/F2, GOEC6O057-F1/F2, GOEC6O059-F1/F2

**API:** `PUT /api/equipment/classifier`
```json
{"classifier": {"processingQueue": 1, "processingThreads": 1}}
```

---

### 1.2 Vídeo - useTriggerFrames desabilitado (7 equipamentos)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `mjpeg.main.useTriggerFrames` | false | **true** | Stream não usa frames do trigger, perda de evento |
| `mjpeg.main.framerate` | 1 | **12** | Fluidez do vídeo comprometida |
| `mjpeg.main.quality` | 60/10 | **85** | Qualidade de imagem degradada |

**Equipamentos afetados (useTriggerFrames=false):**
GOEC6O008-F1, GOEC6O020-F1, GOEC6O028-F1, GOEC6O041-F1, GOEC6O045-F1, GOEC6O050-F1, GOEC6O051-F1

**Equipamentos com framerate=1:**
GOEC6O008-F1, GOEC6O011-F2, GOEC6O028-F1, GOEC6O054-F1

**API:** `PUT /api/video/streams`
```json
{"mjpeg": {"main": {"framerate": 12, "quality": 85, "useTriggerFrames": true}}}
```

---

### 1.3 OCR - processingThreads reduzido (5 equipamentos)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `ocr.processingThreads` | 2 | **4** | Reconhecimento lento, perda de placas |
| `ocr.processingQueue` | 2 | **4** | Fila insuficiente |
| `ocr.processingMode` | 2 | **3** | Modo de processamento inferior |
| `ocr.processingTimeout` | 700 | **1000** | Timeout prematuro |

**Equipamentos afetados (threads=2):**
GOEC6O008-F1, GOEC6O010-F1, GOEC6O011-F2, GOEC6O028-F1, GOEC6O055-F2

**Equipamentos com processingMode=2:**
GOEC6O011-F2, GOEC6O028-F1

**API:** `PUT /api/equipment/ocr`
```json
{"ocr": {"processingThreads": 4, "processingQueue": 4, "processingMode": 3, "processingTimeout": 1000}}
```

---

### 1.4 OCR - vehicleType e maxPlates incorretos

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `ocr.vehicleType` | 1 | **3** | Não reconhece todos os tipos de veículo |
| `ocr.maxPlates` | 1 | **2** | Perda de placas em veículos com 2 placas |

**vehicleType=1:** GOEC6O009-F1, GOEC6O009-F2  
**maxPlates=1:** GOEC6O009-F2, GOEC6O055-F2

**API:** `PUT /api/equipment/ocr`
```json
{"ocr": {"vehicleType": 3, "maxPlates": 2}}
```

---

## Prioridade 2 — ALTA (Impacto na qualidade/comunicação)

### 2.1 NTP - Servidor incorreto (2 equipamentos)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `ntpServerAddress[0]` | "200.160.0.8" | **"time.google.com"** | Relógio desincronizado |

**Equipamentos:** GOEC6O011-F2, GOEC6O028-F1

**API:** `PUT /api/equipment/dateAndTime`
```json
{"ntpServerAddress": ["time.google.com"]}
```

---

### 2.2 Rede - Gateway incorreto (2 equipamentos)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `ethernet.ipv4Primary.gateway` | "192.168.1.1" | **"192.168.0.1"** | Sem comunicação com servidor |

**Equipamentos:** GOEC6O046-F1, GOEC6O046-F2

**API:** `PUT /api/equipment/network/ethernet`
```json
{"ethernet": {"ipv4Primary": {"gateway": "192.168.0.1"}}}
```

⚠️ **ATENÇÃO:** Alterar gateway pode desconectar o equipamento do túnel! Verificar com equipe de campo antes.

---

### 2.3 IO Ports - earlyUs incorreto (1 equipamento)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `[0].earlyUs` (out 1) | 0 | **7** | Timing de flash incorreto |
| `[2].earlyUs` (out 2) | 0 | **7** | Timing de flash incorreto |

**Equipamento:** GOEC6O008-F1

**API:** `PUT /api/equipment/ioPorts`
```json
[{"port": 1, "earlyUs": 7}, {"port": 3, "earlyUs": 7}]
```

---

### 2.4 IO Ports - isReserved incorreto (1 equipamento)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `[0].isReserved` (out 1) | false | **true** | Porta de flash não protegida |
| `[2].isReserved` (out 2) | false | **true** | Porta de flash não protegida |

**Equipamento:** GOEC6O033-F2

---

### 2.5 Classificador - parâmetros avançados

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `classifier.sceneType` | 1 | **0** | Cena incorreta para o local |
| `classifier.minProbability` | 50/60 | **20** | Rejeita classificações válidas |
| `classifier.processingThreads` | 2/4 | **1** | Sobrecarga |

**sceneType=1:** GOEC6O009-F1, GOEC6O011-F2, GOEC6O028-F1, GOEC6O054-F1  
**minProbability>20:** GOEC6O009-F1 (60), GOEC6O009-F2 (50), GOEC6O055-F2 (60)

---

## Prioridade 3 — MÉDIA (Impacto operacional parcial)

### 3.1 SNMP habilitado indevidamente (2 equipamentos)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `enabled` | true | **false** | Serviço desnecessário, risco segurança |
| `v2.enabled` | true | **false** | Protocolo inseguro ativo |

**Equipamentos:** GOEC6O009-F1, GOEC6O009-F2

**API:** `PUT /api/system/monitoring/snmp`
```json
{"enabled": false, "v2": {"enabled": false, "community": ""}}
```

---

### 3.2 Reboot automático habilitado indevidamente (2 equipamentos)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `scheduled.enabled` | true | **false** | Reboots inesperados |

**Equipamentos:** GOEC6O009-F1, GOEC6O009-F2

**API:** `PUT /api/system/maintenance/automaticreboot`
```json
{"scheduled": {"enabled": false, "weekdays": [0], "hour": 0}}
```

---

### 3.3 FTP - Credenciais configuradas (2 equipamentos)

| Campo | Valor Incorreto | Valor Correto | Impacto |
|-------|----------------|---------------|---------|
| `ftp.username` | "admin" | **""** | FTP client não deveria ter creds |
| `ftp.password` | "#econocr@" | **""** | Credencial exposta |

**Equipamentos:** GOEC6O036-F1, GOEC6O054-F2

**API:** `PUT /api/equipment/servers/ftp`
```json
{"ftp": {"username": "", "password": ""}}
```

---

## Prioridade 4 — BAIXA (Diferenças esperadas por localização)

### 4.1 Campos que VARIAM por equipamento (NÃO corrigir)

Estes campos diferem legitimamente entre equipamentos:

| Menu | Campo | Motivo |
|------|-------|--------|
| OCR | `ocr.roi.*` | ROI de placa é única por instalação |
| Imagem | `lens.focus`, `lens.zoom` | Foco/zoom calibrado por local |
| Imagem | `exposure.level.roi.*` | ROI de exposição por local |
| Faixas | `lanes.region0.*` | Coordenadas da faixa por local |
| Diversos | `scenario1Crop.*`, `snapshotCrop.*` | Crop calibrado por local |
| Rede | `hostname`, `ipv4Primary.address` | IP/hostname únicos |
| Geral | `equipmentName` | Nome do equipamento |
| Estado | `macAddress`, `serialNumber` | Hardware único |
| Licenças | `serial` | Serial de licença único |

---

## Prioridade 5 — INVESTIGAÇÃO (Diferenças Faixa 1 vs Faixa 2)

### 5.1 Perfil Noturno - Flash e Exposição diferentes entre faixas

Muitos equipamentos Faixa 2 têm parâmetros de flash diferentes do referência:

| Campo | Referência (F1) | Faixa 2 típico | Equipamentos |
|-------|----------------|----------------|-------------|
| `multipleExposures.settings[0].flash.power[0].percent` | 65 | 100 | ~38 |
| `multipleExposures.settings[1].flash.power[0].percent` | 20 | 7 | ~39 |
| `multipleExposures.settings[0].shutter.value` | 50 | 100 | ~36 |
| `exposure.shutter.maxValue` (diurno) | 500 | 1500 | ~36 |
| `exposure.gain.maxValue` (diurno) | 1500 | 1000 | ~35 |
| `exposure.level.targetValue` (diurno) | 38 | 35 | ~37 |
| `filter.sharpnessLevel` (diurno) | 30 | 40 | ~37 |

⚠️ **DECISÃO NECESSÁRIA:** Esses valores podem ser intencionalmente diferentes para Faixa 2 (compensação de ângulo/distância). Recomendo **validar com a equipe técnica** antes de uniformizar.

---

## Equipamentos com Falha de Autenticação (Requerem ação manual)

| Equipamento | Problema | Ação |
|---|---|---|
| GOEC6O019 - Faixa 1 | AUTH_FAILED | Verificar credenciais/firmware |
| GOEC6O019 - Faixa 2 | AUTH_FAILED | Verificar credenciais/firmware |
| GOEC6O023 - Faixa 1 | AUTH_FAILED | Verificar credenciais/firmware |
| GOEC6O049 - Faixa 1 | AUTH_FAILED | Verificar credenciais/firmware |
| GOEC6O049 - Faixa 2 | AUTH_FAILED | Verificar credenciais/firmware |
| GOEC6O052 - Faixa 1 | AUTH_FAILED | Verificar credenciais/firmware |

---

## Resumo de Correções

| Prioridade | Correções | Equipamentos | Risco |
|---|---|---|---|
| 1-CRÍTICA | Classificador, Vídeo, OCR | 35+ | Baixo (parâmetros lógicos) |
| 2-ALTA | NTP, Gateway, IO Ports | 6 | Médio (gateway pode desconectar) |
| 3-MÉDIA | SNMP, Reboot, FTP | 6 | Baixo |
| 4-BAIXA | Não corrigir | - | - |
| 5-INVESTIGAR | Flash/Exposição F2 | 38 | Alto (requer validação técnica) |

**Script de aplicação:** `auditoria-itscam/aplicar-correcoes.mjs`
