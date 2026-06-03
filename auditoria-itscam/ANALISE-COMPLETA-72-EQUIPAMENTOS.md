# ANÁLISE COMPLETA — 72 EQUIPAMENTOS ITSCAM 450 (GRUPO LABOR)

**Data:** 03/06/2026  
**Fonte:** Configurações coletadas via VARCO tunnel + Relatório Heartbeat VARCO  
**Total analisados:** 70 equipamentos  

---

## 1. CONFIGURAÇÃO PADRÃO (Maioria dos equipamentos)

| Parâmetro | Valor Padrão | Equipamentos em conformidade |
|-----------|-------------|------------------------------|
| Integração VARCO → `varcoEnabled` | true | 64/70 (91%) |
| Integração VARCO → `varcoEdge` | "edge.varco.io" | 64/70 (91%) |
| Integração VARCO → `varcoKey` | "yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=" | 64/70 (91%) |
| REST Pumatronix → `pumaEnabled` | true | 64/70 (91%) |
| REST Pumatronix → `pumaHost` | "" | 70/70 (100%) |
| REST Pumatronix → `pumaScheme` | "http" | 64/70 (91%) |
| REST PumatronixCompat → `compatEnabled` | true | 64/70 (91%) |
| REST PumatronixCompat → `compatHost` | "" | 70/70 (100%) |
| REST Helios (PM-MG) → `heliosEnabled` | true | 64/70 (91%) |
| REST Helios (PM-MG) → `heliosHost` | "helios.policiamilitar.mg.gov.br" | 64/70 (91%) |
| REST Helios (PM-MG) → `heliosPath` | "/v3/api/_track/register" | 64/70 (91%) |
| REST RFB → `rfbEnabled` | true | 64/70 (91%) |
| REST RFB → `rfbHost` | "sivana.rfb.gov.br" | 64/70 (91%) |
| FTP → `ftpEnabled` | false | 70/70 (100%) |
| ITScam Pro → `itscamProEnabled` | false | 70/70 (100%) |
| Lince → `linceEnabled` | false | 70/70 (100%) |
| Protocolos → `blockAPI` | false | 64/70 (91%) |
| Protocolos → `cougarAuth` | false | 64/70 (91%) |
| OCR → `ocrEnabled` | true | 64/70 (91%) |
| OCR → `ocrCountry` | 76 | 64/70 (91%) |
| OCR → `ocrMaxPlates` | 2 | 62/70 (89%) |
| OCR → `ocrMinProb` | null | 70/70 (100%) |
| OCR → `ocrLowProbChar` | 45 | 64/70 (91%) |
| OCR → `ocrMaxLowProb` | 0 | 64/70 (91%) |
| Classificador → `classifEnabled` | true | 64/70 (91%) |
| Classificador → `classifQueue` | 1 | 34/70 (49%) |
| Classificador → `classifThreads` | 1 | 58/70 (83%) |
| Perfil Diurno (Expo) → `diurnoGainMax` | null | 70/70 (100%) |
| Perfil Diurno (Expo) → `diurnoShutterMax` | null | 70/70 (100%) |
| Perfil Noturno (Expo) → `noturnoGainMax` | null | 70/70 (100%) |
| Perfil Noturno (Expo) → `noturnoShutterMax` | null | 70/70 (100%) |
| Flash → `diurnoFlashEnabled` | null | 70/70 (100%) |
| Flash → `noturnoFlashEnabled` | null | 70/70 (100%) |
| Transições (Níveis) → `diurnoLowerLevel` | 10 | 62/70 (89%) |
| Transições (Níveis) → `diurnoUpperLevel` | 35 | 60/70 (86%) |
| Transições (Níveis) → `noturnoLowerLevel` | 10 | 63/70 (90%) |
| Transições (Níveis) → `noturnoUpperLevel` | 35 | 60/70 (86%) |
| Transições (Horários) → `diurnoLowerStart` | "00:00:00" | 61/70 (87%) |
| Transições (Horários) → `diurnoLowerEnd` | "00:00:00" | 60/70 (86%) |
| Transições (Horários) → `noturnoUpperStart` | "00:00:00" | 58/70 (83%) |
| Transições (Horários) → `noturnoUpperEnd` | "00:00:00" | 63/70 (90%) |
| Noturno→Diurno Profile → `noturnoUpperProfile` | 0 | 63/70 (90%) |
| Snapshot Crop → `snapshotCrop` | false | 61/70 (87%) |
| Snapshot Crop → `snapshotMode` | "static" | 59/70 (84%) |
| Data/Hora → `timezone` | ["America","Sao_Paulo"] | 64/70 (91%) |
| Data/Hora → `ntpEnabled` | null | 70/70 (100%) |
| Data/Hora → `ntpServer` | "" | 70/70 (100%) |
| Data/Hora → `gpsSync` | null | 70/70 (100%) |
| Rede → `gateway` | "192.168.0.1" | 62/70 (89%) |
| Rede → `dns` | "8.8.8.8" | 64/70 (91%) |
| Faixas → `lanesEnabled` | false | 51/70 (73%) |

---

## 2. EQUIPAMENTOS COM CONFIGURAÇÃO DIFERENTE DO PADRÃO

### Resumo de desvios por equipamento

| # | Equipamento | Qtd Desvios | Campos com problema |
|---|-------------|-------------|--------------------|
| 1 | GOEC6O019 - Faixa 1 | 36 | varcoEnabled, varcoEdge, varcoKey, pumaEnabled, pumaScheme, compatEnabled, heliosEnabled, heliosHost, heliosPath, rfbEnabled, rfbHost, blockAPI, cougarAuth, ocrEnabled, ocrCountry, ocrMaxPlates, ocrLowProbChar, ocrMaxLowProb, classifEnabled, classifQueue, classifThreads, diurnoLowerLevel, diurnoUpperLevel, noturnoLowerLevel, noturnoUpperLevel, noturnoUpperProfile, diurnoLowerStart, diurnoLowerEnd, noturnoUpperStart, noturnoUpperEnd, snapshotCrop, snapshotMode, timezone, gateway, dns, lanesEnabled |
| 2 | GOEC6O019 - Faixa 2 | 36 | varcoEnabled, varcoEdge, varcoKey, pumaEnabled, pumaScheme, compatEnabled, heliosEnabled, heliosHost, heliosPath, rfbEnabled, rfbHost, blockAPI, cougarAuth, ocrEnabled, ocrCountry, ocrMaxPlates, ocrLowProbChar, ocrMaxLowProb, classifEnabled, classifQueue, classifThreads, diurnoLowerLevel, diurnoUpperLevel, noturnoLowerLevel, noturnoUpperLevel, noturnoUpperProfile, diurnoLowerStart, diurnoLowerEnd, noturnoUpperStart, noturnoUpperEnd, snapshotCrop, snapshotMode, timezone, gateway, dns, lanesEnabled |
| 3 | GOEC6O023 - Faixa 1 | 36 | varcoEnabled, varcoEdge, varcoKey, pumaEnabled, pumaScheme, compatEnabled, heliosEnabled, heliosHost, heliosPath, rfbEnabled, rfbHost, blockAPI, cougarAuth, ocrEnabled, ocrCountry, ocrMaxPlates, ocrLowProbChar, ocrMaxLowProb, classifEnabled, classifQueue, classifThreads, diurnoLowerLevel, diurnoUpperLevel, noturnoLowerLevel, noturnoUpperLevel, noturnoUpperProfile, diurnoLowerStart, diurnoLowerEnd, noturnoUpperStart, noturnoUpperEnd, snapshotCrop, snapshotMode, timezone, gateway, dns, lanesEnabled |
| 4 | GOEC6O049 - Faixa 1 | 36 | varcoEnabled, varcoEdge, varcoKey, pumaEnabled, pumaScheme, compatEnabled, heliosEnabled, heliosHost, heliosPath, rfbEnabled, rfbHost, blockAPI, cougarAuth, ocrEnabled, ocrCountry, ocrMaxPlates, ocrLowProbChar, ocrMaxLowProb, classifEnabled, classifQueue, classifThreads, diurnoLowerLevel, diurnoUpperLevel, noturnoLowerLevel, noturnoUpperLevel, noturnoUpperProfile, diurnoLowerStart, diurnoLowerEnd, noturnoUpperStart, noturnoUpperEnd, snapshotCrop, snapshotMode, timezone, gateway, dns, lanesEnabled |
| 5 | GOEC6O049 - Faixa 2 | 36 | varcoEnabled, varcoEdge, varcoKey, pumaEnabled, pumaScheme, compatEnabled, heliosEnabled, heliosHost, heliosPath, rfbEnabled, rfbHost, blockAPI, cougarAuth, ocrEnabled, ocrCountry, ocrMaxPlates, ocrLowProbChar, ocrMaxLowProb, classifEnabled, classifQueue, classifThreads, diurnoLowerLevel, diurnoUpperLevel, noturnoLowerLevel, noturnoUpperLevel, noturnoUpperProfile, diurnoLowerStart, diurnoLowerEnd, noturnoUpperStart, noturnoUpperEnd, snapshotCrop, snapshotMode, timezone, gateway, dns, lanesEnabled |
| 6 | GOEC6O052 - Faixa 1 | 36 | varcoEnabled, varcoEdge, varcoKey, pumaEnabled, pumaScheme, compatEnabled, heliosEnabled, heliosHost, heliosPath, rfbEnabled, rfbHost, blockAPI, cougarAuth, ocrEnabled, ocrCountry, ocrMaxPlates, ocrLowProbChar, ocrMaxLowProb, classifEnabled, classifQueue, classifThreads, diurnoLowerLevel, diurnoUpperLevel, noturnoLowerLevel, noturnoUpperLevel, noturnoUpperProfile, diurnoLowerStart, diurnoLowerEnd, noturnoUpperStart, noturnoUpperEnd, snapshotCrop, snapshotMode, timezone, gateway, dns, lanesEnabled |
| 7 | GOEC6O033 - Faixa 2 | 6 | diurnoLowerLevel, noturnoLowerLevel, diurnoLowerStart, diurnoLowerEnd, noturnoUpperStart, noturnoUpperEnd |
| 8 | GOEC6O008 - Faixa 1 | 6 | diurnoUpperLevel, noturnoUpperLevel, noturnoUpperProfile, diurnoLowerEnd, noturnoUpperStart, snapshotCrop |
| 9 | GOEC6O009 - Faixa 2 | 4 | ocrMaxPlates, classifQueue, diurnoUpperLevel, noturnoUpperLevel |
| 10 | GOEC6O055 - Faixa 2 | 4 | ocrMaxPlates, classifQueue, diurnoLowerStart, noturnoUpperStart |
| 11 | GOEC6O046 - Faixa 1 | 4 | classifQueue, snapshotMode, gateway, lanesEnabled |
| 12 | GOEC6O013 - Faixa 2 | 4 | diurnoLowerLevel, diurnoUpperLevel, noturnoUpperLevel, lanesEnabled |
| 13 | GOEC6O009 - Faixa 1 | 3 | classifQueue, diurnoUpperLevel, noturnoUpperLevel |
| 14 | GOEC6O013 - Faixa 1 | 3 | classifQueue, snapshotCrop, lanesEnabled |
| 15 | GOEC6O046 - Faixa 2 | 3 | snapshotMode, gateway, lanesEnabled |
| 16 | GOEC6O003 - Faixa 2 | 2 | classifQueue, snapshotCrop |
| 17 | GOEC6O010 - Faixa 1 | 2 | classifQueue, classifThreads |
| 18 | GOEC6O011 - Faixa 2 | 2 | classifQueue, classifThreads |
| 19 | GOEC6O028 - Faixa 1 | 2 | classifQueue, classifThreads |
| 20 | GOEC6O052 - Faixa 2 | 2 | classifQueue, classifThreads |
| 21 | GOEC6O054 - Faixa 2 | 2 | classifQueue, lanesEnabled |
| 22 | GOEC6O057 - Faixa 1 | 2 | classifQueue, lanesEnabled |
| 23 | GOEC6O058 - Faixa 2 | 2 | classifQueue, classifThreads |
| 24 | GOEC6O040 - Faixa 1 | 2 | diurnoLowerStart, noturnoUpperStart |
| 25 | GOEC6O040 - Faixa 2 | 2 | diurnoLowerEnd, noturnoUpperStart |
| 26 | GOEC6O055 - Faixa 1 | 2 | diurnoLowerEnd, noturnoUpperStart |
| 27 | GOEC6O053 - Faixa 1 | 2 | snapshotMode, lanesEnabled |
| 28 | GOEC6O053 - Faixa 2 | 2 | snapshotMode, lanesEnabled |
| 29 | GOEC6O004 - Faixa 1 | 1 | classifQueue |
| 30 | GOEC6O004 - Faixa 2 | 1 | classifQueue |
| 31 | GOEC6O006 - Faixa 1 | 1 | classifQueue |
| 32 | GOEC6O006 - Faixa 2 | 1 | classifQueue |
| 33 | GOEC6O011 - Faixa 1 | 1 | classifQueue |
| 34 | GOEC6O018 - Faixa 2 | 1 | classifQueue |
| 35 | GOEC6O020 - Faixa 1 | 1 | classifQueue |
| 36 | GOEC6O029 - Faixa 1 | 1 | classifQueue |
| 37 | GOEC6O029 - Faixa 2 | 1 | classifQueue |
| 38 | GOEC6O033 - Faixa 1 | 1 | classifQueue |
| 39 | GOEC6O043 - Faixa 1 | 1 | classifQueue |
| 40 | GOEC6O043 - Faixa 2 | 1 | classifQueue |
| 41 | GOEC6O050 - Faixa 1 | 1 | classifQueue |
| 42 | GOEC6O054 - Faixa 1 | 1 | classifQueue |
| 43 | GOEC6O056 - Faixa 1 | 1 | classifQueue |
| 44 | GOEC6O056 - Faixa 2 | 1 | classifQueue |
| 45 | GOEC6O059 - Faixa 2 | 1 | classifQueue |
| 46 | GOEC6O010 - Faixa 2 | 1 | classifThreads |
| 47 | GOEC6O003 - Faixa 1 | 1 | snapshotMode |
| 48 | GOEC6O036 - Faixa 1 | 1 | lanesEnabled |
| 49 | GOEC6O041 - Faixa 2 | 1 | lanesEnabled |
| 50 | GOEC6O051 - Faixa 1 | 1 | lanesEnabled |
| 51 | GOEC6O051 - Faixa 2 | 1 | lanesEnabled |
| 52 | GOEC6O057 - Faixa 2 | 1 | lanesEnabled |

---

## 3. DETALHES DOS DESVIOS CRÍTICOS

### 3.1 VARCO Desabilitado (6 equipamentos)

| Equipamento | VARCO | IP Público | Impacto |
|-------------|-------|------------|--------|
| GOEC6O019 - Faixa 1 | ❌ Desabilitado | 45.70.144.143 | SEM CONECTIVIDADE REMOTA |
| GOEC6O019 - Faixa 2 | ❌ Desabilitado | 45.70.144.143 | SEM CONECTIVIDADE REMOTA |
| GOEC6O023 - Faixa 1 | ❌ Desabilitado | 177.25.228.3 | SEM CONECTIVIDADE REMOTA |
| GOEC6O049 - Faixa 1 | ❌ Desabilitado | 191.58.159.123 | SEM CONECTIVIDADE REMOTA |
| GOEC6O049 - Faixa 2 | ❌ Desabilitado | 191.58.159.123 | SEM CONECTIVIDADE REMOTA |
| GOEC6O052 - Faixa 1 | ❌ Desabilitado | 187.68.165.85 | SEM CONECTIVIDADE REMOTA |

### 3.2 Transições com Horário (risco de travar em P&B) — 12 equipamentos

| Equipamento | Diurno Lower Start→End | Noturno Upper Start→End | Noturno→Profile |
|-------------|----------------------|------------------------|-----------------|
| GOEC6O019 - Faixa 1 | null→null | null→null | null |
| GOEC6O019 - Faixa 2 | null→null | null→null | null |
| GOEC6O023 - Faixa 1 | null→null | null→null | null |
| GOEC6O033 - Faixa 2 | 06:00:00→18:00:00 | 18:00:00→06:00:00 | 0 |
| GOEC6O040 - Faixa 1 | 18:00:00→00:00:00 | 18:00:00→00:00:00 | 0 |
| GOEC6O049 - Faixa 1 | null→null | null→null | null |
| GOEC6O049 - Faixa 2 | null→null | null→null | null |
| GOEC6O052 - Faixa 1 | null→null | null→null | null |
| GOEC6O055 - Faixa 2 | 18:00:00→00:00:00 | 18:01:00→00:00:00 | 0 |
| GOEC6O008 - Faixa 1 | 00:00:00→18:00:00 | 18:01:00→00:00:00 | 23483 |
| GOEC6O040 - Faixa 2 | 00:00:00→18:00:00 | 18:01:00→00:00:00 | 0 |
| GOEC6O055 - Faixa 1 | 00:00:00→18:00:00 | 18:01:00→00:00:00 | 0 |

**Padrão correto:** Todos os horários = `0` (00:00:00), noturnoUpperProfile = `0`

### 3.3 Noturno Upper Profile INCORRETO (câmera trava em P&B)

| Equipamento | Valor | Deveria ser | Status |
|-------------|-------|-------------|--------|
| GOEC6O008 - Faixa 1 | 23483 | 0 | 🔴 CRÍTICO (aponta pra si) |
| GOEC6O019 - Faixa 1 | null | 0 | ⚠️ Verificar |
| GOEC6O019 - Faixa 2 | null | 0 | ⚠️ Verificar |
| GOEC6O023 - Faixa 1 | null | 0 | ⚠️ Verificar |
| GOEC6O049 - Faixa 1 | null | 0 | ⚠️ Verificar |
| GOEC6O049 - Faixa 2 | null | 0 | ⚠️ Verificar |
| GOEC6O052 - Faixa 1 | null | 0 | ⚠️ Verificar |

### 3.4 Classificador com config diferente — 37 equipamentos

| Equipamento | Queue | Threads | Padrão Queue | Padrão Threads |
|-------------|-------|---------|--------------|----------------|
| GOEC6O003 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O004 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O004 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O006 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O006 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O009 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O009 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O010 - Faixa 1 | 4 | 4 | 1 | 1 |
| GOEC6O011 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O011 - Faixa 2 | 2 | 2 | 1 | 1 |
| GOEC6O013 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O018 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O019 - Faixa 1 | null | null | 1 | 1 |
| GOEC6O019 - Faixa 2 | null | null | 1 | 1 |
| GOEC6O020 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O023 - Faixa 1 | null | null | 1 | 1 |
| GOEC6O028 - Faixa 1 | 2 | 2 | 1 | 1 |
| GOEC6O029 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O029 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O033 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O043 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O043 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O046 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O049 - Faixa 1 | null | null | 1 | 1 |
| GOEC6O049 - Faixa 2 | null | null | 1 | 1 |
| GOEC6O050 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O052 - Faixa 1 | null | null | 1 | 1 |
| GOEC6O052 - Faixa 2 | 4 | 4 | 1 | 1 |
| GOEC6O054 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O054 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O055 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O056 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O056 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O057 - Faixa 1 | 4 | 1 | 1 | 1 |
| GOEC6O058 - Faixa 2 | 4 | 4 | 1 | 1 |
| GOEC6O059 - Faixa 2 | 4 | 1 | 1 | 1 |
| GOEC6O010 - Faixa 2 | 1 | 2 | 1 | 1 |

### 3.7 OCR com parâmetros diferentes — 8 equipamentos

| Equipamento | minProb | maxPlates | lowProbChar | maxLowProb |
|-------------|---------|-----------|-------------|------------|
| GOEC6O009 - Faixa 2 | null | **1** | 45 | 0 |
| GOEC6O019 - Faixa 1 | null | **null** | **null** | **null** |
| GOEC6O019 - Faixa 2 | null | **null** | **null** | **null** |
| GOEC6O023 - Faixa 1 | null | **null** | **null** | **null** |
| GOEC6O049 - Faixa 1 | null | **null** | **null** | **null** |
| GOEC6O049 - Faixa 2 | null | **null** | **null** | **null** |
| GOEC6O052 - Faixa 1 | null | **null** | **null** | **null** |
| GOEC6O055 - Faixa 2 | null | **1** | 45 | 0 |

---

## 4. STATUS OPERACIONAL (Conectividade e Uptime)

| Status | Qtd | % |
|--------|-----|---|
| ✅ Operacional (VARCO + uptime >12h + storage <1GB) | 22 | 31% |
| 🔄 Reboot Recente (<12h) | 10 | 14% |
| ⚠️ Clock Instável (uptime negativo) | 22 | 31% |
| 📦 Fila Acumulada (>1GB storage) | 25 | 36% |
| ❌ Offline (VARCO desabilitado) | 6 | 9% |

### Equipamentos Instáveis (clock/uptime negativo)

| Equipamento | IP | Uptime (h) | Storage (MB) | Observação |
|-------------|-----|------------|-------------|------------|
| GOEC6O046 - Faixa 2 | 170.81.67.214 | -583.6 | 632 | Clock dessincronizado |
| GOEC6O011 - Faixa 2 | 187.61.123.9 | -583.4 | 1009 | Clock dessincronizado |
| GOEC6O052 - Faixa 2 | 187.68.165.85 | -578.8 | 1028 | Clock dessincronizado |
| GOEC6O043 - Faixa 2 | 186.237.219.7 | -565.3 | 654 | Clock dessincronizado |
| GOEC6O043 - Faixa 1 | 186.237.219.7 | -565.2 | 1023 | Clock dessincronizado |
| GOEC6O013 - Faixa 1 | 191.58.151.247 | -560.3 | 1183 | Clock dessincronizado |
| GOEC6O020 - Faixa 2 | 179.249.69.61 | -538.1 | 728 | Clock dessincronizado |
| GOEC6O048 - Faixa 1 | 179.249.74.187 | -440.4 | 773 | Clock dessincronizado |
| GOEC6O048 - Faixa 2 | 179.249.74.187 | -440.1 | 772 | Clock dessincronizado |
| GOEC6O021 - Faixa 1 | 177.25.230.156 | -373.6 | 632 | Clock dessincronizado |
| GOEC6O055 - Faixa 1 | 191.37.226.77 | -372.5 | 1791 | Clock dessincronizado |
| GOEC6O055 - Faixa 2 | 191.37.226.77 | -372.5 | 976 | Clock dessincronizado |
| GOEC6O059 - Faixa 1 | 170.81.93.198 | -368.6 | 616 | Clock dessincronizado |
| GOEC6O059 - Faixa 2 | 170.81.93.198 | -368.6 | 998 | Clock dessincronizado |
| GOEC6O056 - Faixa 1 | 170.81.93.157 | -351.3 | 650 | Clock dessincronizado |
| GOEC6O056 - Faixa 2 | 170.81.93.157 | -350.6 | 650 | Clock dessincronizado |
| GOEC6O010 - Faixa 1 | 138.97.25.44 | -295.1 | 1393 | Clock dessincronizado |
| GOEC6O010 - Faixa 2 | 138.97.25.44 | -295.1 | 1435 | Clock dessincronizado |
| GOEC6O046 - Faixa 1 | 170.81.67.214 | -228.5 | 767 | Clock dessincronizado |
| GOEC6O008 - Faixa 2 | 191.58.135.61 | -201.1 | 1020 | Clock dessincronizado |
| GOEC6O054 - Faixa 1 | 187.43.168.205 | -36.7 | 1235 | Clock dessincronizado |
| GOEC6O054 - Faixa 2 | 187.43.168.205 | -36.7 | 655 | Clock dessincronizado |

### Equipamentos com Fila Acumulada (storage > 1GB)

| Equipamento | IP | Storage Usado | % Disco | Uptime |
|-------------|-----|--------------|---------|--------|
| GOEC6O009 - Faixa 1 | 191.58.150.37 | 2567 MB | 45.7% | 42.5h |
| GOEC6O055 - Faixa 1 | 191.37.226.77 | 1791 MB | 31.9% | -372.5h |
| GOEC6O013 - Faixa 2 | 191.58.151.247 | 1538 MB | 27.4% | 571.4h |
| GOEC6O058 - Faixa 2 | 187.68.160.38 | 1524 MB | 27.2% | 123.3h |
| GOEC6O041 - Faixa 1 | 191.58.133.244 | 1474 MB | 26.3% | 10.9h |
| GOEC6O057 - Faixa 2 | 138.97.25.51 | 1454 MB | 25.9% | 177h |
| GOEC6O045 - Faixa 2 | 179.242.177.86 | 1437 MB | 25.6% | 101.7h |
| GOEC6O010 - Faixa 2 | 138.97.25.44 | 1435 MB | 25.6% | -295.1h |
| GOEC6O004 - Faixa 1 | 186.211.161.242 | 1406 MB | 25.1% | 315.7h |
| GOEC6O010 - Faixa 1 | 138.97.25.44 | 1393 MB | 24.8% | -295.1h |
| GOEC6O020 - Faixa 1 | 179.249.69.61 | 1381 MB | 24.6% | 178.4h |
| GOEC6O018 - Faixa 1 | 177.200.42.236 | 1367 MB | 24.4% | 9.8h |
| GOEC6O029 - Faixa 2 | 177.79.18.234 | 1340 MB | 23.9% | 10.8h |
| GOEC6O029 - Faixa 1 | 177.79.18.234 | 1339 MB | 23.9% | 10.8h |
| GOEC6O041 - Faixa 2 | 191.58.133.244 | 1270 MB | 22.6% | 10.9h |
| GOEC6O057 - Faixa 1 | 138.97.25.51 | 1270 MB | 22.6% | 490.3h |
| GOEC6O009 - Faixa 2 | 191.58.150.37 | 1259 MB | 22.4% | 42.4h |
| GOEC6O054 - Faixa 1 | 187.43.168.205 | 1235 MB | 22.0% | -36.7h |
| GOEC6O013 - Faixa 1 | 191.58.151.247 | 1183 MB | 21.1% | -560.3h |
| GOEC6O050 - Faixa 1 | 177.223.44.84 | 1129 MB | 20.1% | 51.7h |
| GOEC6O018 - Faixa 2 | 177.200.42.236 | 1030 MB | 18.4% | 9.8h |
| GOEC6O052 - Faixa 2 | 187.68.165.85 | 1028 MB | 18.3% | -578.8h |
| GOEC6O043 - Faixa 1 | 186.237.219.7 | 1023 MB | 18.2% | -565.2h |
| GOEC6O008 - Faixa 2 | 191.58.135.61 | 1020 MB | 18.2% | -201.1h |
| GOEC6O011 - Faixa 2 | 187.61.123.9 | 1009 MB | 18.0% | -583.4h |

---

## 5. TABELA COMPLETA — TODOS OS 70 EQUIPAMENTOS

| # | Equipamento | IP | VARCO | Uptime(h) | Storage(MB) | Desvios | Status |
|---|-------------|-----|-------|-----------|-------------|---------|--------|
| 1 | GOEC6O002 - Faixa 1 | 191.247.147.85 | ✅ | 10.9 | 749 | 0 | 🔄 REBOOT |
| 2 | GOEC6O002 - Faixa 2 | 191.247.147.85 | ✅ | 10.7 | 797 | 0 | 🔄 REBOOT |
| 3 | GOEC6O003 - Faixa 1 | 177.25.238.161 | ✅ | 156.7 | 688 | 1 | ✅ OK |
| 4 | GOEC6O003 - Faixa 2 | 177.25.238.161 | ✅ | 156.7 | 704 | 2 | ✅ OK |
| 5 | GOEC6O004 - Faixa 1 | 186.211.161.242 | ✅ | 315.7 | 1406 | 1 | 📦 FILA |
| 6 | GOEC6O004 - Faixa 2 | 186.211.161.242 | ✅ | 315.7 | 923 | 1 | ✅ OK |
| 7 | GOEC6O006 - Faixa 1 | 191.56.242.228 | ✅ | 103.1 | 769 | 1 | ✅ OK |
| 8 | GOEC6O006 - Faixa 2 | 191.56.242.228 | ✅ | 82 | 752 | 1 | ✅ OK |
| 9 | GOEC6O007 - Faixa 1 | 187.43.163.114 | ✅ | 4.2 | 106 | 0 | 🔄 REBOOT |
| 10 | GOEC6O007 - Faixa 2 | 187.43.163.114 | ✅ | 3.8 | 818 | 0 | 🔄 REBOOT |
| 11 | GOEC6O008 - Faixa 1 | 191.58.135.61 | ✅ | 141.8 | 470 | **6** | ✅ OK |
| 12 | GOEC6O008 - Faixa 2 | 191.58.135.61 | ✅ | -201.1 | 1020 | 0 | ⚠️ INSTÁVEL |
| 13 | GOEC6O009 - Faixa 1 | 191.58.150.37 | ✅ | 42.5 | 2567 | 3 | 📦 FILA |
| 14 | GOEC6O009 - Faixa 2 | 191.58.150.37 | ✅ | 42.4 | 1259 | 4 | 📦 FILA |
| 15 | GOEC6O010 - Faixa 1 | 138.97.25.44 | ✅ | -295.1 | 1393 | 2 | ⚠️ INSTÁVEL |
| 16 | GOEC6O010 - Faixa 2 | 138.97.25.44 | ✅ | -295.1 | 1435 | 1 | ⚠️ INSTÁVEL |
| 17 | GOEC6O011 - Faixa 1 | 187.61.123.9 | ✅ | 84.4 | 768 | 1 | ✅ OK |
| 18 | GOEC6O011 - Faixa 2 | 187.61.123.9 | ✅ | -583.4 | 1009 | 2 | ⚠️ INSTÁVEL |
| 19 | GOEC6O013 - Faixa 1 | 191.58.151.247 | ✅ | -560.3 | 1183 | 3 | ⚠️ INSTÁVEL |
| 20 | GOEC6O013 - Faixa 2 | 191.58.151.247 | ✅ | 571.4 | 1538 | 4 | 📦 FILA |
| 21 | GOEC6O018 - Faixa 1 | 177.200.42.236 | ✅ | 9.8 | 1367 | 0 | 🔄 REBOOT |
| 22 | GOEC6O018 - Faixa 2 | 177.200.42.236 | ✅ | 9.8 | 1030 | 1 | 🔄 REBOOT |
| 23 | GOEC6O019 - Faixa 1 | 45.70.144.143 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 24 | GOEC6O019 - Faixa 2 | 45.70.144.143 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 25 | GOEC6O020 - Faixa 1 | 179.249.69.61 | ✅ | 178.4 | 1381 | 1 | 📦 FILA |
| 26 | GOEC6O020 - Faixa 2 | 179.249.69.61 | ✅ | -538.1 | 728 | 0 | ⚠️ INSTÁVEL |
| 27 | GOEC6O021 - Faixa 1 | 177.25.230.156 | ✅ | -373.6 | 632 | 0 | ⚠️ INSTÁVEL |
| 28 | GOEC6O022 - Faixa 1 | 143.105.141.193 | ✅ | 122.2 | 296 | 0 | ✅ OK |
| 29 | GOEC6O022 - Faixa 2 | 143.105.141.193 | ✅ | 121.1 | 490 | 0 | ✅ OK |
| 30 | GOEC6O023 - Faixa 1 | 177.25.228.3 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 31 | GOEC6O028 - Faixa 1 | 177.25.234.226 | ✅ | 295.6 | 862 | 2 | ✅ OK |
| 32 | GOEC6O029 - Faixa 1 | 177.79.18.234 | ✅ | 10.8 | 1339 | 1 | 🔄 REBOOT |
| 33 | GOEC6O029 - Faixa 2 | 177.79.18.234 | ✅ | 10.8 | 1340 | 1 | 🔄 REBOOT |
| 34 | GOEC6O033 - Faixa 1 | 45.168.254.127 | ✅ | 484.8 | 649 | 1 | ✅ OK |
| 35 | GOEC6O033 - Faixa 2 | 45.168.254.127 | ✅ | 484.8 | 971 | **6** | ✅ OK |
| 36 | GOEC6O036 - Faixa 1 | 191.58.154.28 | ✅ | 440.9 | 620 | 1 | ✅ OK |
| 37 | GOEC6O040 - Faixa 1 | 201.71.213.219 | ✅ | 17.5 | 407 | 2 | ✅ OK |
| 38 | GOEC6O040 - Faixa 2 | 201.71.213.219 | ✅ | 17.5 | 718 | 2 | ✅ OK |
| 39 | GOEC6O041 - Faixa 1 | 191.58.133.244 | ✅ | 10.9 | 1474 | 0 | 🔄 REBOOT |
| 40 | GOEC6O041 - Faixa 2 | 191.58.133.244 | ✅ | 10.9 | 1270 | 1 | 🔄 REBOOT |
| 41 | GOEC6O043 - Faixa 1 | 186.237.219.7 | ✅ | -565.2 | 1023 | 1 | ⚠️ INSTÁVEL |
| 42 | GOEC6O043 - Faixa 2 | 186.237.219.7 | ✅ | -565.3 | 654 | 1 | ⚠️ INSTÁVEL |
| 43 | GOEC6O045 - Faixa 1 | 179.242.177.86 | ✅ | 136.9 | 967 | 0 | ✅ OK |
| 44 | GOEC6O045 - Faixa 2 | 179.242.177.86 | ✅ | 101.7 | 1437 | 0 | 📦 FILA |
| 45 | GOEC6O046 - Faixa 1 | 170.81.67.214 | ✅ | -228.5 | 767 | 4 | ⚠️ INSTÁVEL |
| 46 | GOEC6O046 - Faixa 2 | 170.81.67.214 | ✅ | -583.6 | 632 | 3 | ⚠️ INSTÁVEL |
| 47 | GOEC6O048 - Faixa 1 | 179.249.74.187 | ✅ | -440.4 | 773 | 0 | ⚠️ INSTÁVEL |
| 48 | GOEC6O048 - Faixa 2 | 179.249.74.187 | ✅ | -440.1 | 772 | 0 | ⚠️ INSTÁVEL |
| 49 | GOEC6O049 - Faixa 1 | 191.58.159.123 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 50 | GOEC6O049 - Faixa 2 | 191.58.159.123 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 51 | GOEC6O050 - Faixa 1 | 177.223.44.84 | ✅ | 51.7 | 1129 | 1 | 📦 FILA |
| 52 | GOEC6O050 - Faixa 2 | 177.223.44.84 | ✅ | 51.7 | 977 | 0 | ✅ OK |
| 53 | GOEC6O051 - Faixa 1 | 177.79.27.27 | ✅ | 457.7 | 654 | 1 | ✅ OK |
| 54 | GOEC6O051 - Faixa 2 | 177.79.27.27 | ✅ | 458.1 | 881 | 1 | ✅ OK |
| 55 | GOEC6O052 - Faixa 1 | 187.68.165.85 | ❌ | 0 | 0 | **36** | ❌ OFFLINE |
| 56 | GOEC6O052 - Faixa 2 | 187.68.165.85 | ✅ | -578.8 | 1028 | 2 | ⚠️ INSTÁVEL |
| 57 | GOEC6O053 - Faixa 1 | 179.249.73.108 | ✅ | 450 | 733 | 2 | ✅ OK |
| 58 | GOEC6O053 - Faixa 2 | 179.249.73.108 | ✅ | 450 | 999 | 2 | ✅ OK |
| 59 | GOEC6O054 - Faixa 1 | 187.43.168.205 | ✅ | -36.7 | 1235 | 1 | ⚠️ INSTÁVEL |
| 60 | GOEC6O054 - Faixa 2 | 187.43.168.205 | ✅ | -36.7 | 655 | 2 | ⚠️ INSTÁVEL |
| 61 | GOEC6O055 - Faixa 1 | 191.37.226.77 | ✅ | -372.5 | 1791 | 2 | ⚠️ INSTÁVEL |
| 62 | GOEC6O055 - Faixa 2 | 191.37.226.77 | ✅ | -372.5 | 976 | 4 | ⚠️ INSTÁVEL |
| 63 | GOEC6O056 - Faixa 1 | 170.81.93.157 | ✅ | -351.3 | 650 | 1 | ⚠️ INSTÁVEL |
| 64 | GOEC6O056 - Faixa 2 | 170.81.93.157 | ✅ | -350.6 | 650 | 1 | ⚠️ INSTÁVEL |
| 65 | GOEC6O057 - Faixa 1 | 138.97.25.51 | ✅ | 490.3 | 1270 | 2 | 📦 FILA |
| 66 | GOEC6O057 - Faixa 2 | 138.97.25.51 | ✅ | 177 | 1454 | 1 | 📦 FILA |
| 67 | GOEC6O058 - Faixa 1 | 187.68.160.38 | ✅ | 123.3 | 312 | 0 | ✅ OK |
| 68 | GOEC6O058 - Faixa 2 | 187.68.160.38 | ✅ | 123.3 | 1524 | 2 | 📦 FILA |
| 69 | GOEC6O059 - Faixa 1 | 170.81.93.198 | ✅ | -368.6 | 616 | 0 | ⚠️ INSTÁVEL |
| 70 | GOEC6O059 - Faixa 2 | 170.81.93.198 | ✅ | -368.6 | 998 | 1 | ⚠️ INSTÁVEL |

---

## 6. EQUIPAMENTOS 100% NO PADRÃO (Zero desvios de configuração)

**18 equipamentos** com configuração idêntica ao padrão:

| # | Equipamento | IP | UUID | VARCO | Uptime | Status |
|---|-------------|-----|------|-------|--------|--------|
| 1 | GOEC6O002 - Faixa 1 | 191.247.147.85 | c5de0eb2... | ✅ | 10.9h | 🔄 REBOOT |
| 2 | GOEC6O002 - Faixa 2 | 191.247.147.85 | fb1a2de8... | ✅ | 10.7h | 🔄 REBOOT |
| 3 | GOEC6O007 - Faixa 1 | 187.43.163.114 | 2c1ab0be... | ✅ | 4.2h | 🔄 REBOOT |
| 4 | GOEC6O007 - Faixa 2 | 187.43.163.114 | 33e77a95... | ✅ | 3.8h | 🔄 REBOOT |
| 5 | GOEC6O008 - Faixa 2 | 191.58.135.61 | d741e55b... | ✅ | -201.1h | ⚠️ CLOCK |
| 6 | GOEC6O018 - Faixa 1 | 177.200.42.236 | 0e154d78... | ✅ | 9.8h | 🔄 REBOOT |
| 7 | GOEC6O020 - Faixa 2 | 179.249.69.61 | 21484385... | ✅ | -538.1h | ⚠️ CLOCK |
| 8 | GOEC6O021 - Faixa 1 | 177.25.230.156 | f07c775c... | ✅ | -373.6h | ⚠️ CLOCK |
| 9 | GOEC6O022 - Faixa 1 | 143.105.141.193 | 29c1d243... | ✅ | 122.2h | ✅ OK |
| 10 | GOEC6O022 - Faixa 2 | 143.105.141.193 | dfb678d9... | ✅ | 121.1h | ✅ OK |
| 11 | GOEC6O041 - Faixa 1 | 191.58.133.244 | b2faa440... | ✅ | 10.9h | 🔄 REBOOT |
| 12 | GOEC6O045 - Faixa 1 | 179.242.177.86 | 0ce96fed... | ✅ | 136.9h | ✅ OK |
| 13 | GOEC6O045 - Faixa 2 | 179.242.177.86 | 66ee7d2d... | ✅ | 101.7h | ✅ OK |
| 14 | GOEC6O048 - Faixa 1 | 179.249.74.187 | 43d7e92f... | ✅ | -440.4h | ⚠️ CLOCK |
| 15 | GOEC6O048 - Faixa 2 | 179.249.74.187 | d23fe240... | ✅ | -440.1h | ⚠️ CLOCK |
| 16 | GOEC6O050 - Faixa 2 | 177.223.44.84 | f435e113... | ✅ | 51.7h | ✅ OK |
| 17 | GOEC6O058 - Faixa 1 | 187.68.160.38 | b5a0f157... | ✅ | 123.3h | ✅ OK |
| 18 | GOEC6O059 - Faixa 1 | 170.81.93.198 | 97a97d01... | ✅ | -368.6h | ⚠️ CLOCK |

---

## 7. RESUMO EXECUTIVO

### Números gerais
- **70** equipamentos analisados
- **18** em total conformidade (26%)
- **52** com algum desvio de configuração
- **6** totalmente offline (VARCO desabilitado)
- **22** com clock dessincronizado
- **25** com fila de imagens acumulada (>1GB)

### Top problemas a resolver

| Prioridade | Problema | Qtd | Ação |
|-----------|---------|-----|------|
| 🔴 CRÍTICA | Noturno upper profile errado (trava P&B) | 7 | Corrigir para 0 |
| 🟠 ALTA | Transições com horário (risco P&B) | 12 | Zerar horários |
| 🟠 ALTA | VARCO desabilitado | 6 | Habilitar remotamente |
| 🟡 MÉDIA | Clock instável (NTP/GPS) | 22 | Reconfigurar NTP |
| 🟡 MÉDIA | Storage >1GB (fila) | 25 | Investigar envio |
| 🔵 BAIXA | OCR parametrizado diferente | 8 | Avaliar se intencional |

---
*Gerado automaticamente — Axion Intelligence Hub — 03/06/2026*
