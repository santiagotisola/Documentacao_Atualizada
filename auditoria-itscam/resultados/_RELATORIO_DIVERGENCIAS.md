# Relatório de Divergências - Auditoria ITScam 450

**Data:** 2026-06-02T21:30:52.624Z
**Referência:** GOEC6O058 - Faixa 1
**Total equipamentos:** 70
**Coletados com sucesso:** 64
**Falhas de conexão:** 6

## Resumo por Menu

| Menu | Divergências | Endpoints com diferença |
|------|-------------|------------------------|
| 01-ESTADO-ATUAL | 252 | 4 |
| 05-SISTEMA/05a-GERAL | 125 | 2 |
| 05-SISTEMA/05b-REDE | 70 | 2 |
| 02-IMAGEM | 66 | 2 |
| 05-SISTEMA/05c-MANUTENCAO | 65 | 2 |
| 04-EQUIPAMENTO/04a-OCR | 63 | 1 |
| 05-SISTEMA/05e-LICENCAS | 63 | 1 |
| 05-SISTEMA/05f-USUARIOS | 63 | 1 |
| 04-EQUIPAMENTO/04i-DIVERSOS | 58 | 1 |
| 04-EQUIPAMENTO/04c-FAIXAS | 40 | 1 |
| 04-EQUIPAMENTO/04b-CLASSIFICADOR | 31 | 1 |
| 03-VIDEO | 9 | 1 |
| 04-EQUIPAMENTO/04f-SERVIDORES | 2 | 1 |
| 04-EQUIPAMENTO/04h-PORTAS-IO | 2 | 1 |
| 05-SISTEMA/05d-MONITORAMENTO | 2 | 1 |
| 04-EQUIPAMENTO/04d-ANALYTICS | 0 | 0 |
| 04-EQUIPAMENTO/04e-INDICADOR-VEICULO | 0 | 0 |
| 04-EQUIPAMENTO/04g-ASSINATURA-IMAGEM | 0 | 0 |

## Top 20 Equipamentos com Mais Divergências

| Equipamento | Total Divergências | Menus Afetados |
|-------------|-------------------|----------------|
| GOEC6O008 - Faixa 1 | 117 | 10 |
| GOEC6O009 - Faixa 2 | 96 | 12 |
| GOEC6O011 - Faixa 2 | 95 | 12 |
| GOEC6O028 - Faixa 1 | 94 | 11 |
| GOEC6O009 - Faixa 1 | 91 | 12 |
| GOEC6O055 - Faixa 2 | 89 | 12 |
| GOEC6O046 - Faixa 2 | 85 | 10 |
| GOEC6O013 - Faixa 2 | 82 | 10 |
| GOEC6O006 - Faixa 2 | 81 | 11 |
| GOEC6O018 - Faixa 2 | 81 | 11 |
| GOEC6O033 - Faixa 2 | 80 | 11 |
| GOEC6O053 - Faixa 1 | 79 | 10 |
| GOEC6O053 - Faixa 2 | 79 | 10 |
| GOEC6O054 - Faixa 2 | 79 | 12 |
| GOEC6O058 - Faixa 2 | 79 | 11 |
| GOEC6O010 - Faixa 2 | 77 | 11 |
| GOEC6O057 - Faixa 2 | 77 | 10 |
| GOEC6O046 - Faixa 1 | 75 | 11 |
| GOEC6O056 - Faixa 2 | 75 | 12 |
| GOEC6O020 - Faixa 2 | 74 | 10 |

## Detalhamento por Menu

### 01-ESTADO-ATUAL

#### Info Equipamento (`/api/equipment/info`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.macAddress` | valor_diferente | 63 | `"F8:D4:62:01:B3:5B"` | GOEC6O002 - Faixa 1: `"F8:D4:62:01:BF:F6"`, GOEC6O002 - Faixa 2: `"F8:D4:62:01:BE:53"`, GOEC6O003 - Faixa 1: `"F8:D4:62:01:BE:56"` |

#### Placas/Hardware (`/api/equipment/boards`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `[1].serialNumber` | valor_diferente | 63 | `"92501903"` | GOEC6O002 - Faixa 1: `"510141"`, GOEC6O002 - Faixa 2: `"92501431"`, GOEC6O003 - Faixa 1: `"92501718"` |
| `[2].serialNumber` | valor_diferente | 63 | `"510108"` | GOEC6O002 - Faixa 1: `"92501808"`, GOEC6O002 - Faixa 2: `"510129"`, GOEC6O003 - Faixa 1: `"510143"` |
| `[3].serialNumber` | valor_diferente | 63 | `"92501748"` | GOEC6O002 - Faixa 1: `"0"`, GOEC6O002 - Faixa 2: `"0"`, GOEC6O003 - Faixa 1: `"0"` |
| `[4].serialNumber` | valor_diferente | 63 | `"122501988"` | GOEC6O002 - Faixa 1: `"122502084"`, GOEC6O002 - Faixa 2: `"122501849"`, GOEC6O003 - Faixa 1: `"122501979"` |
| `[0].model` | valor_diferente | 57 | `"L8-5-50-PERCHERON"` | GOEC6O002 - Faixa 1: `"LM450-CTRL-YTOT"`, GOEC6O002 - Faixa 2: `"S450-23M-PECCARY"`, GOEC6O003 - Faixa 1: `"LM450-CTRL-YTOT"` |
| `[0].serialNumber` | valor_diferente | 57 | `"0"` | GOEC6O002 - Faixa 1: `"92501735"`, GOEC6O002 - Faixa 2: `"92501659"`, GOEC6O003 - Faixa 1: `"92501371"` |
| `[3].model` | valor_diferente | 55 | `"LM450-CTRL-YTOT"` | GOEC6O002 - Faixa 1: `"L8-5-50-PERCHERON"`, GOEC6O002 - Faixa 2: `"L8-5-50-PERCHERON"`, GOEC6O003 - Faixa 1: `"L8-5-50-PERCHERON"` |
| `[0].version` | valor_diferente | 49 | `"1"` | GOEC6O002 - Faixa 1: `"2"`, GOEC6O002 - Faixa 2: `"2"`, GOEC6O003 - Faixa 1: `"2"` |
| `[3].version` | valor_diferente | 49 | `"2"` | GOEC6O002 - Faixa 1: `"1"`, GOEC6O002 - Faixa 2: `"1"`, GOEC6O003 - Faixa 1: `"1"` |
| `[1].model` | valor_diferente | 38 | `"S450-23M-PECCARY"` | GOEC6O002 - Faixa 1: `"CPU450"`, GOEC6O002 - Faixa 2: `"LM450-CTRL-YTOT"`, GOEC6O003 - Faixa 2: `"LM450-CTRL-YTOT"` |
| `[2].model` | valor_diferente | 37 | `"CPU450"` | GOEC6O002 - Faixa 1: `"S450-23M-PECCARY"`, GOEC6O003 - Faixa 2: `"S450-23M-PECCARY"`, GOEC6O006 - Faixa 1: `"S450-23M-PECCARY"` |
| `[2].version` | valor_diferente | 32 | `"1"` | GOEC6O002 - Faixa 1: `"2"`, GOEC6O002 - Faixa 2: `"2"`, GOEC6O003 - Faixa 2: `"2"` |
| `[1].version` | valor_diferente | 20 | `"2"` | GOEC6O006 - Faixa 1: `"1"`, GOEC6O008 - Faixa 1: `"1"`, GOEC6O009 - Faixa 2: `"1"` |

#### Storage (`/api/system/maintenance/storage/usage`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.disk.used` | valor_diferente | 63 | `326717440` | GOEC6O002 - Faixa 1: `785838080`, GOEC6O002 - Faixa 2: `835993600`, GOEC6O003 - Faixa 1: `720977920` |

#### Dados Voláteis (CPU, Temp) (`/api/equipment/misc/readonly/volatile`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.ae.lastRun` | valor_diferente | 63 | `443874625` | GOEC6O002 - Faixa 1: `38226117`, GOEC6O002 - Faixa 2: `37831709`, GOEC6O003 - Faixa 1: `563295702` |
| `.lens.focus` | valor_diferente | 63 | `1129` | GOEC6O002 - Faixa 1: `970`, GOEC6O002 - Faixa 2: `866`, GOEC6O003 - Faixa 1: `1097` |
| `.lens.zoom` | valor_diferente | 63 | `2115` | GOEC6O002 - Faixa 1: `2879`, GOEC6O002 - Faixa 2: `2844`, GOEC6O003 - Faixa 1: `2162` |
| `.gps.time` | valor_diferente | 62 | `1780370339` | GOEC6O002 - Faixa 1: `1780371656`, GOEC6O002 - Faixa 2: `1780371262`, GOEC6O003 - Faixa 1: `1780403327` |
| `.fps.mjpeg` | valor_diferente | 51 | `2.200000047683716` | GOEC6O002 - Faixa 2: `2.4000000953674316`, GOEC6O003 - Faixa 2: `2.4000000953674316`, GOEC6O004 - Faixa 1: `2.5999999046325684` |
| `.isp.freeBuffers` | valor_diferente | 38 | `13` | GOEC6O002 - Faixa 1: `14`, GOEC6O002 - Faixa 2: `15`, GOEC6O003 - Faixa 2: `15` |
| `.ae.level` | valor_diferente | 15 | `0` | GOEC6O004 - Faixa 1: `0.05699719861149788`, GOEC6O011 - Faixa 1: `0.0016177162760868669`, GOEC6O013 - Faixa 1: `0.05539632961153984` |
| `.isp.shutter` | valor_diferente | 10 | `800` | GOEC6O003 - Faixa 2: `897`, GOEC6O008 - Faixa 1: `2000`, GOEC6O009 - Faixa 1: `2155` |
| `.isp.gain` | valor_diferente | 5 | `4000` | GOEC6O003 - Faixa 2: `4999`, GOEC6O008 - Faixa 1: `2400`, GOEC6O011 - Faixa 2: `1400` |
| `.profile.id` | valor_diferente | 1 | `27839` | GOEC6O008 - Faixa 1: `23483` |

### 05-SISTEMA/05a-GERAL

#### Config Geral (`/api/equipment/general`)
Equipamentos divergentes: **62**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.equipmentName` | valor_diferente | 62 | `"GOEC6O058"` | GOEC6O002 - Faixa 1: `"GOEC6O002"`, GOEC6O002 - Faixa 2: `"GOEC6O002"`, GOEC6O003 - Faixa 1: `"GOEC6O003"` |

#### Data e Hora (`/api/equipment/dateAndTime`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.currentDateAndTime` | valor_diferente | 63 | `"2026-06-02T21:23:48.000Z"` | GOEC6O002 - Faixa 1: `"2026-06-02T21:11:05.000Z"`, GOEC6O002 - Faixa 2: `"2026-06-02T21:11:04.000Z"`, GOEC6O003 - Faixa 1: `"2026-06-02T21:11:07.000Z"` |
| `.ntpServerAddress[0]` | valor_diferente | 2 | `"time.google.com"` | GOEC6O011 - Faixa 2: `"200.160.0.8"`, GOEC6O028 - Faixa 1: `"200.160.0.8"` |

### 05-SISTEMA/05b-REDE

#### Rede Completa (`/api/equipment/network`)
Equipamentos divergentes: **35**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.ethernet.hostname` | valor_diferente | 34 | `"Faixa01"` | GOEC6O002 - Faixa 2: `"FAIXA02"`, GOEC6O003 - Faixa 2: `"FAIXA02"`, GOEC6O004 - Faixa 2: `"FAIXA02"` |
| `.ethernet.ipv4Primary.address` | valor_diferente | 32 | `"192.168.0.201"` | GOEC6O002 - Faixa 2: `"192.168.0.202"`, GOEC6O003 - Faixa 2: `"192.168.0.202"`, GOEC6O004 - Faixa 2: `"192.168.0.202"` |
| `.ethernet.ipv4Primary.gateway` | valor_diferente | 2 | `"192.168.0.1"` | GOEC6O046 - Faixa 1: `"192.168.1.1"`, GOEC6O046 - Faixa 2: `"192.168.1.1"` |

#### Ethernet (`/api/equipment/network/ethernet`)
Equipamentos divergentes: **35**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.ethernet.hostname` | valor_diferente | 34 | `"Faixa01"` | GOEC6O002 - Faixa 2: `"FAIXA02"`, GOEC6O003 - Faixa 2: `"FAIXA02"`, GOEC6O004 - Faixa 2: `"FAIXA02"` |
| `.ethernet.ipv4Primary.address` | valor_diferente | 32 | `"192.168.0.201"` | GOEC6O002 - Faixa 2: `"192.168.0.202"`, GOEC6O003 - Faixa 2: `"192.168.0.202"`, GOEC6O004 - Faixa 2: `"192.168.0.202"` |
| `.ethernet.ipv4Primary.gateway` | valor_diferente | 2 | `"192.168.0.1"` | GOEC6O046 - Faixa 1: `"192.168.1.1"`, GOEC6O046 - Faixa 2: `"192.168.1.1"` |

### 02-IMAGEM

#### Perfis de Imagem (Diurno/Noturno) (`/api/image/profiles`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `[0].lens.focus` | valor_diferente | 63 | `1129` | GOEC6O002 - Faixa 1: `970`, GOEC6O002 - Faixa 2: `866`, GOEC6O003 - Faixa 1: `1097` |
| `[0].lens.zoom` | valor_diferente | 63 | `2115` | GOEC6O002 - Faixa 1: `2879`, GOEC6O002 - Faixa 2: `2844`, GOEC6O003 - Faixa 1: `2162` |
| `[1].lens.focus` | valor_diferente | 63 | `1129` | GOEC6O002 - Faixa 1: `970`, GOEC6O002 - Faixa 2: `866`, GOEC6O003 - Faixa 1: `1097` |
| `[1].lens.zoom` | valor_diferente | 63 | `2115` | GOEC6O002 - Faixa 1: `2879`, GOEC6O002 - Faixa 2: `2844`, GOEC6O003 - Faixa 1: `2162` |
| `[1].multipleExposures.settings[1].flash.power[0].percent` | valor_diferente | 39 | `20` | GOEC6O002 - Faixa 2: `7`, GOEC6O003 - Faixa 2: `100`, GOEC6O004 - Faixa 2: `7` |
| `[1].multipleExposures.settings[0].flash.power[0].percent` | valor_diferente | 38 | `65` | GOEC6O002 - Faixa 2: `100`, GOEC6O003 - Faixa 2: `100`, GOEC6O004 - Faixa 2: `100` |
| `[1].multipleExposures.settings[1].flash.power[1].percent` | valor_diferente | 38 | `20` | GOEC6O002 - Faixa 2: `7`, GOEC6O003 - Faixa 2: `100`, GOEC6O004 - Faixa 2: `7` |
| `[0].exposure.level.targetValue` | valor_diferente | 37 | `38` | GOEC6O002 - Faixa 2: `35`, GOEC6O003 - Faixa 2: `35`, GOEC6O004 - Faixa 2: `35` |
| `[0].filter.sharpnessLevel` | valor_diferente | 37 | `30` | GOEC6O002 - Faixa 2: `40`, GOEC6O003 - Faixa 2: `40`, GOEC6O004 - Faixa 2: `40` |
| `[1].multipleExposures.settings[0].flash.power[1].percent` | valor_diferente | 37 | `65` | GOEC6O002 - Faixa 2: `100`, GOEC6O003 - Faixa 2: `100`, GOEC6O004 - Faixa 2: `100` |
| `[0].exposure.shutter.maxValue` | valor_diferente | 36 | `500` | GOEC6O002 - Faixa 2: `1500`, GOEC6O003 - Faixa 2: `1500`, GOEC6O004 - Faixa 2: `1500` |
| `[1].multipleExposures.settings[0].shutter.value` | valor_diferente | 36 | `50` | GOEC6O002 - Faixa 2: `100`, GOEC6O003 - Faixa 2: `100`, GOEC6O004 - Faixa 2: `100` |
| `[1].multipleExposures.settings[1].shutter.value` | valor_diferente | 36 | `50` | GOEC6O002 - Faixa 2: `100`, GOEC6O003 - Faixa 2: `100`, GOEC6O004 - Faixa 2: `100` |
| `[0].exposure.gain.maxValue` | valor_diferente | 35 | `1500` | GOEC6O002 - Faixa 2: `1000`, GOEC6O003 - Faixa 2: `1000`, GOEC6O004 - Faixa 2: `1000` |
| `[0].overlay.text` | valor_diferente | 35 | `"SEQUENCIAL: {rid} DATA PASSAGEM: {day}/` | GOEC6O002 - Faixa 2: `"SEQUENCIAL: {rid} DATA PASSAGEM: {day}/`, GOEC6O003 - Faixa 2: `"SEQUENCIAL: {rid} DATA PASSAGEM: {day}/`, GOEC6O004 - Faixa 2: `"SEQUENCIAL: {rid} DATA PASSAGEM: {day}/` |
| ... | ... | ... | ... | +68 campos |

#### Autofoco (`/api/equipment/autofocus`)
Equipamentos divergentes: **3**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.roi.centerX` | valor_diferente | 3 | `960` | GOEC6O008 - Faixa 1: `512`, GOEC6O009 - Faixa 2: `929`, GOEC6O040 - Faixa 1: `687` |
| `.roi.centerY` | valor_diferente | 3 | `600` | GOEC6O008 - Faixa 1: `920`, GOEC6O009 - Faixa 2: `637`, GOEC6O040 - Faixa 1: `630` |
| `.roi.height` | valor_diferente | 2 | `600` | GOEC6O008 - Faixa 1: `317`, GOEC6O009 - Faixa 2: `650` |
| `.roi.width` | valor_diferente | 2 | `960` | GOEC6O008 - Faixa 1: `409`, GOEC6O009 - Faixa 2: `1061` |

### 05-SISTEMA/05c-MANUTENCAO

#### Reboot Automático (`/api/system/maintenance/automaticreboot`)
Equipamentos divergentes: **2**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.scheduled.enabled` | valor_diferente | 2 | `false` | GOEC6O009 - Faixa 1: `true`, GOEC6O009 - Faixa 2: `true` |
| `.scheduled.weekdays` | tamanho_array | 2 | `1` | GOEC6O009 - Faixa 1: `4`, GOEC6O009 - Faixa 2: `4` |

#### Acesso Remoto (`/api/system/maintenance/remoteaccess`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.remoteAccess.varco.deviceName` | valor_diferente | 63 | `"GOEC6O058 - Faixa 1"` | GOEC6O002 - Faixa 1: `"GOEC6O002 - FAIXA 1"`, GOEC6O002 - Faixa 2: `"GOEC6O002 - FAIXA 2"`, GOEC6O003 - Faixa 1: `"GOEC6O003 - FAIXA 1"` |

### 04-EQUIPAMENTO/04a-OCR

#### Config OCR (`/api/equipment/ocr`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.ocr.roi.x0` | valor_diferente | 63 | `176` | GOEC6O002 - Faixa 1: `611`, GOEC6O002 - Faixa 2: `226`, GOEC6O003 - Faixa 1: `326` |
| `.ocr.roi.x1` | valor_diferente | 63 | `878` | GOEC6O002 - Faixa 1: `1628`, GOEC6O002 - Faixa 2: `1186`, GOEC6O003 - Faixa 1: `941` |
| `.ocr.roi.x2` | valor_diferente | 63 | `494` | GOEC6O002 - Faixa 1: `75`, GOEC6O002 - Faixa 2: `644`, GOEC6O003 - Faixa 1: `1120` |
| `.ocr.roi.x3` | valor_diferente | 63 | `1701` | GOEC6O002 - Faixa 1: `1423`, GOEC6O002 - Faixa 2: `1890`, GOEC6O003 - Faixa 1: `1885` |
| `.ocr.roi.y0` | valor_diferente | 63 | `770` | GOEC6O002 - Faixa 1: `370`, GOEC6O002 - Faixa 2: `676`, GOEC6O003 - Faixa 1: `658` |
| `.ocr.roi.y1` | valor_diferente | 63 | `655` | GOEC6O002 - Faixa 1: `531`, GOEC6O002 - Faixa 2: `434`, GOEC6O003 - Faixa 1: `422` |
| `.ocr.roi.y3` | valor_diferente | 63 | `1154` | GOEC6O002 - Faixa 1: `1164`, GOEC6O002 - Faixa 2: `846`, GOEC6O003 - Faixa 1: `884` |
| `.ocr.roi.y2` | valor_diferente | 62 | `1191` | GOEC6O002 - Faixa 1: `812`, GOEC6O002 - Faixa 2: `1197`, GOEC6O003 - Faixa 1: `1199` |
| `.ocr.processingThreads` | valor_diferente | 5 | `4` | GOEC6O008 - Faixa 1: `2`, GOEC6O010 - Faixa 1: `2`, GOEC6O011 - Faixa 2: `2` |
| `.ocr.processingQueue` | valor_diferente | 3 | `4` | GOEC6O008 - Faixa 1: `2`, GOEC6O011 - Faixa 2: `2`, GOEC6O028 - Faixa 1: `2` |
| `.ocr.vehicleType` | valor_diferente | 2 | `3` | GOEC6O009 - Faixa 1: `1`, GOEC6O009 - Faixa 2: `1` |
| `.ocr.maxPlates` | valor_diferente | 2 | `2` | GOEC6O009 - Faixa 2: `1`, GOEC6O055 - Faixa 2: `1` |
| `.ocr.processingMode` | valor_diferente | 2 | `3` | GOEC6O011 - Faixa 2: `2`, GOEC6O028 - Faixa 1: `2` |
| `.ocr.processingTimeout` | valor_diferente | 2 | `1000` | GOEC6O011 - Faixa 2: `700`, GOEC6O028 - Faixa 1: `700` |

### 05-SISTEMA/05e-LICENCAS

#### Licenças (`/api/system/licenses`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.analytics.classifier.serial` | valor_diferente | 63 | `"0xebdc0673af6b2f5e"` | GOEC6O002 - Faixa 1: `"0x622f273e14211424"`, GOEC6O002 - Faixa 2: `"0x52e7314d355eec50"`, GOEC6O003 - Faixa 1: `"0xf3123615dc3af9f3"` |
| `.analytics.ocr.serial` | valor_diferente | 63 | `"0xebdc0673af6b2f5e"` | GOEC6O002 - Faixa 1: `"0x622f273e14211424"`, GOEC6O002 - Faixa 2: `"0x52e7314d355eec50"`, GOEC6O003 - Faixa 1: `"0xf3123615dc3af9f3"` |
| `.deviceId.serial` | valor_diferente | 63 | `"0xebdc0673af6b2f5e"` | GOEC6O002 - Faixa 1: `"0x622f273e14211424"`, GOEC6O002 - Faixa 2: `"0x52e7314d355eec50"`, GOEC6O003 - Faixa 1: `"0xf3123615dc3af9f3"` |

### 05-SISTEMA/05f-USUARIOS

#### Usuários (`/api/system/users`)
Equipamentos divergentes: **63**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `[0].lastLoggedIn` | valor_diferente | 63 | `1780435405700` | GOEC6O002 - Faixa 1: `1780434643445`, GOEC6O002 - Faixa 2: `1780434643457`, GOEC6O003 - Faixa 1: `1780434643585` |

### 04-EQUIPAMENTO/04i-DIVERSOS

#### Configurações Diversas (`/api/equipment/misc`)
Equipamentos divergentes: **58**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.scenario1Crop.y0` | valor_diferente | 45 | `171` | GOEC6O004 - Faixa 1: `341`, GOEC6O004 - Faixa 2: `241`, GOEC6O006 - Faixa 1: `397` |
| `.scenario1Crop.y1` | valor_diferente | 45 | `890` | GOEC6O004 - Faixa 1: `1060`, GOEC6O004 - Faixa 2: `960`, GOEC6O006 - Faixa 1: `1116` |
| `.scenario1Crop.x0` | valor_diferente | 44 | `398` | GOEC6O004 - Faixa 1: `86`, GOEC6O004 - Faixa 2: `157`, GOEC6O006 - Faixa 1: `472` |
| `.scenario1Crop.x1` | valor_diferente | 44 | `1677` | GOEC6O004 - Faixa 1: `1365`, GOEC6O004 - Faixa 2: `1436`, GOEC6O006 - Faixa 1: `1751` |
| `.snapshotCrop.x0` | valor_diferente | 42 | `8` | GOEC6O002 - Faixa 1: `328`, GOEC6O002 - Faixa 2: `40`, GOEC6O003 - Faixa 1: `3` |
| `.snapshotCrop.x1` | valor_diferente | 42 | `1343` | GOEC6O002 - Faixa 1: `1539`, GOEC6O002 - Faixa 2: `1403`, GOEC6O003 - Faixa 1: `1798` |
| `.snapshotCrop.y0` | valor_diferente | 42 | `82` | GOEC6O002 - Faixa 1: `125`, GOEC6O002 - Faixa 2: `280`, GOEC6O003 - Faixa 1: `7` |
| `.snapshotCrop.y1` | valor_diferente | 42 | `901` | GOEC6O002 - Faixa 1: `1040`, GOEC6O002 - Faixa 2: `1099`, GOEC6O003 - Faixa 1: `1122` |
| `.snapshotCrop.mode` | valor_diferente | 5 | `"static"` | GOEC6O003 - Faixa 1: `"ocr"`, GOEC6O046 - Faixa 1: `"ocr"`, GOEC6O046 - Faixa 2: `"ocr"` |
| `.snapshotCrop.enable` | valor_diferente | 3 | `false` | GOEC6O003 - Faixa 2: `true`, GOEC6O008 - Faixa 1: `true`, GOEC6O013 - Faixa 1: `true` |
| `.scenario1OverlayTextSize` | valor_diferente | 1 | `24` | GOEC6O008 - Faixa 1: `32` |
| `.scenarioOverlayPos` | valor_diferente | 1 | `"overlaidBottom"` | GOEC6O008 - Faixa 1: `"overlaidTop"` |
| `.scenario2OverlayTextSize` | valor_diferente | 1 | `32` | GOEC6O018 - Faixa 1: `24` |

### 04-EQUIPAMENTO/04c-FAIXAS

#### Faixas de Trânsito (`/api/equipment/lanes`)
Equipamentos divergentes: **40**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.lanes.region0.x1` | valor_diferente | 40 | `278` | GOEC6O002 - Faixa 2: `449`, GOEC6O003 - Faixa 2: `449`, GOEC6O004 - Faixa 2: `449` |
| `.lanes.region0.x2` | valor_diferente | 40 | `266` | GOEC6O002 - Faixa 2: `171`, GOEC6O003 - Faixa 2: `171`, GOEC6O004 - Faixa 2: `171` |
| `.lanes.region0.x3` | valor_diferente | 40 | `1825` | GOEC6O002 - Faixa 2: `1816`, GOEC6O003 - Faixa 2: `1816`, GOEC6O004 - Faixa 2: `1816` |
| `.lanes.region0.y0` | valor_diferente | 40 | `736` | GOEC6O002 - Faixa 2: `583`, GOEC6O003 - Faixa 2: `583`, GOEC6O004 - Faixa 2: `583` |
| `.lanes.region0.y1` | valor_diferente | 40 | `19` | GOEC6O002 - Faixa 2: `164`, GOEC6O003 - Faixa 2: `164`, GOEC6O004 - Faixa 2: `164` |
| `.lanes.region0.y3` | valor_diferente | 40 | `973` | GOEC6O002 - Faixa 2: `1079`, GOEC6O003 - Faixa 2: `1079`, GOEC6O004 - Faixa 2: `1079` |
| `.lanes.region0.y2` | valor_diferente | 37 | `1199` | GOEC6O002 - Faixa 2: `1195`, GOEC6O003 - Faixa 2: `1195`, GOEC6O004 - Faixa 2: `1195` |
| `.lanes.region0.x0` | valor_diferente | 20 | `0` | GOEC6O009 - Faixa 1: `404`, GOEC6O009 - Faixa 2: `404`, GOEC6O011 - Faixa 2: `20` |
| `.lanes.enabled` | valor_diferente | 13 | `false` | GOEC6O013 - Faixa 1: `true`, GOEC6O013 - Faixa 2: `true`, GOEC6O036 - Faixa 1: `true` |
| `.lanes.region1.enabled` | valor_diferente | 4 | `false` | GOEC6O046 - Faixa 1: `true`, GOEC6O046 - Faixa 2: `true`, GOEC6O053 - Faixa 1: `true` |
| `.lanes.region1.x0` | valor_diferente | 4 | `843` | GOEC6O046 - Faixa 1: `269`, GOEC6O046 - Faixa 2: `1890`, GOEC6O053 - Faixa 1: `552` |
| `.lanes.region1.x1` | valor_diferente | 4 | `1228` | GOEC6O046 - Faixa 1: `1255`, GOEC6O046 - Faixa 2: `1027`, GOEC6O053 - Faixa 1: `1768` |
| `.lanes.region1.x2` | valor_diferente | 4 | `1392` | GOEC6O046 - Faixa 1: `1680`, GOEC6O046 - Faixa 2: `519`, GOEC6O053 - Faixa 1: `1810` |
| `.lanes.region1.x3` | valor_diferente | 4 | `1913` | GOEC6O046 - Faixa 1: `1863`, GOEC6O046 - Faixa 2: `1709`, GOEC6O053 - Faixa 1: `1908` |
| `.lanes.region1.y0` | valor_diferente | 4 | `309` | GOEC6O046 - Faixa 1: `1199`, GOEC6O046 - Faixa 2: `449`, GOEC6O053 - Faixa 1: `990` |
| ... | ... | ... | ... | +9 campos |

### 04-EQUIPAMENTO/04b-CLASSIFICADOR

#### Classificador Veicular (`/api/equipment/classifier`)
Equipamentos divergentes: **31**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.classifier.processingQueue` | valor_diferente | 30 | `1` | GOEC6O003 - Faixa 2: `4`, GOEC6O004 - Faixa 1: `4`, GOEC6O004 - Faixa 2: `4` |
| `.classifier.processingThreads` | valor_diferente | 6 | `1` | GOEC6O010 - Faixa 1: `4`, GOEC6O010 - Faixa 2: `2`, GOEC6O011 - Faixa 2: `2` |
| `.classifier.sceneType` | valor_diferente | 4 | `0` | GOEC6O009 - Faixa 1: `1`, GOEC6O011 - Faixa 2: `1`, GOEC6O028 - Faixa 1: `1` |
| `.classifier.minProbability` | valor_diferente | 3 | `20` | GOEC6O009 - Faixa 1: `60`, GOEC6O009 - Faixa 2: `50`, GOEC6O055 - Faixa 2: `60` |

### 03-VIDEO

#### Streams de Vídeo (`/api/video/streams`)
Equipamentos divergentes: **9**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.mjpeg.main.useTriggerFrames` | valor_diferente | 7 | `true` | GOEC6O008 - Faixa 1: `false`, GOEC6O020 - Faixa 1: `false`, GOEC6O028 - Faixa 1: `false` |
| `.mjpeg.main.framerate` | valor_diferente | 4 | `12` | GOEC6O008 - Faixa 1: `1`, GOEC6O011 - Faixa 2: `1`, GOEC6O028 - Faixa 1: `1` |
| `.mjpeg.main.quality` | valor_diferente | 2 | `85` | GOEC6O008 - Faixa 1: `60`, GOEC6O028 - Faixa 1: `10` |

### 04-EQUIPAMENTO/04f-SERVIDORES

#### Servidor FTP (`/api/equipment/servers/ftp`)
Equipamentos divergentes: **2**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.ftp.password` | valor_diferente | 2 | `""` | GOEC6O036 - Faixa 1: `"#econocr@"`, GOEC6O054 - Faixa 2: `"#econocr@"` |
| `.ftp.username` | valor_diferente | 2 | `""` | GOEC6O036 - Faixa 1: `"admin"`, GOEC6O054 - Faixa 2: `"admin"` |

### 04-EQUIPAMENTO/04h-PORTAS-IO

#### Portas IO (`/api/equipment/ioPorts`)
Equipamentos divergentes: **2**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `[0].earlyUs` | valor_diferente | 1 | `7` | GOEC6O008 - Faixa 1: `0` |
| `[2].earlyUs` | valor_diferente | 1 | `7` | GOEC6O008 - Faixa 1: `0` |
| `[0].isReserved` | valor_diferente | 1 | `true` | GOEC6O033 - Faixa 2: `false` |
| `[2].isReserved` | valor_diferente | 1 | `true` | GOEC6O033 - Faixa 2: `false` |

### 05-SISTEMA/05d-MONITORAMENTO

#### SNMP (`/api/system/monitoring/snmp`)
Equipamentos divergentes: **2**

| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |
|-------|------|-----------------|------------------|----------|
| `.enabled` | valor_diferente | 2 | `false` | GOEC6O009 - Faixa 1: `true`, GOEC6O009 - Faixa 2: `true` |
| `.v2.enabled` | valor_diferente | 2 | `false` | GOEC6O009 - Faixa 1: `true`, GOEC6O009 - Faixa 2: `true` |
| `.v2.community` | valor_diferente | 2 | `""` | GOEC6O009 - Faixa 1: `"{$SNMP_COMMUNITY}"`, GOEC6O009 - Faixa 2: `"{$SNMP_COMMUNITY}"` |

## Equipamentos com Falha de Conexão

- **GOEC6O019 - Faixa 1** — Erro: AUTH_FAILED
- **GOEC6O019 - Faixa 2** — Erro: AUTH_FAILED
- **GOEC6O023 - Faixa 1** — Erro: AUTH_FAILED
- **GOEC6O049 - Faixa 1** — Erro: AUTH_FAILED
- **GOEC6O049 - Faixa 2** — Erro: AUTH_FAILED
- **GOEC6O052 - Faixa 1** — Erro: AUTH_FAILED
