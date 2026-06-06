# Estratégia de Auditoria Completa — ITScam 450 via Varco Tunnels

**Versão:** 1.0  
**Data:** 02/06/2026  
**Escopo:** 70 equipamentos ITScam 450 LM (Pumatronix)  
**Plataforma:** Varco.io (v1.12.3) — Organização "Labor"  

---

## 1. Arquitetura da Auditoria

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE AUDITORIA AUTOMATIZADA                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐       │
│  │   Varco.io   │    │   Túneis     │    │   ITScam 450 API     │       │
│  │   (Manager)  │───►│   mTLS       │───►│   REST /api/*        │       │
│  └──────────────┘    └──────────────┘    └──────────────────────┘       │
│         │                    │                       │                    │
│         ▼                    ▼                       ▼                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐       │
│  │  Inventário  │    │  Auth JWT    │    │  Coleta 35 endpoints │       │
│  │  70 devices  │    │  por device  │    │  por equipamento     │       │
│  └──────────────┘    └──────────────┘    └──────────────────────┘       │
│                                                     │                    │
│                              ┌───────────────────────┘                   │
│                              ▼                                            │
│                    ┌──────────────────────┐                              │
│                    │  ANÁLISE COMPARATIVA │                              │
│                    │  • Referência: O058  │                              │
│                    │  • Regras por menu   │                              │
│                    │  • Deep-diff config  │                              │
│                    └──────────────────────┘                              │
│                              │                                            │
│                              ▼                                            │
│         ┌────────────────────┼────────────────────┐                     │
│         ▼                    ▼                    ▼                      │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐            │
│  │  Relatório  │   │   Lista de   │   │  Mapa Visual de  │            │
│  │  por Menu   │   │   Correções  │   │  Divergências    │            │
│  └─────────────┘   └──────────────┘   └──────────────────┘            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mapeamento Completo de Menus e Endpoints

### 2.1 Estrutura de Menus da Interface ITScam 450

```
📱 ITScam 450 Web Interface
│
├── 📊 Estado Atual (/status)
│   ├── Equipamento (nome, IP, MAC, modelo, resolução, lente, uptime)
│   ├── Versões (firmware, boards, seriais)
│   ├── Desempenho (CPU temp, uso, cores)
│   ├── Memória (RAM, storage)
│   └── Imagem ao vivo (FPS, perfil ativo, gain, shutter)
│
├── 🖼️ Imagem
│   ├── Perfis (/api/image/profiles) ⭐ CRÍTICO
│   │   ├── Perfil Diurno
│   │   │   ├── Cor (brightness, contrast, gamma, saturation, blacklevel)
│   │   │   ├── Exposição (gain, iris, shutter, ROI, targetValue)
│   │   │   ├── Lente (exchanger/IR-cut, focus, zoom)
│   │   │   ├── Filtros (sharpness, timedomain)
│   │   │   ├── HDR (enable)
│   │   │   ├── Trigger (event, interval, port)
│   │   │   ├── Múltiplas Exposições (flash, gain%, shutter%)
│   │   │   ├── Overlay (enable, text)
│   │   │   ├── Filtro de Movimento (enabled, ROI, threshold)
│   │   │   ├── White Balance (automatic, RGB weights)
│   │   │   └── Transições ⭐⭐ MAIS CRÍTICO
│   │   │       ├── Lower (startTime, endTime, holdTime, level, profile)
│   │   │       └── Upper (startTime, endTime, holdTime, level, profile)
│   │   └── Perfil Noturno (mesma estrutura)
│   │
│   ├── Transicionador (/api/equipment/transitioner)
│   │   └── Modo (luminosity/time/manual)
│   │
│   └── Autofoco (/api/equipment/autofocus)
│       └── Configurações de foco automático
│
├── 📹 Vídeo
│   └── Streams (/api/video/streams)
│       ├── Stream 1 (resolução, codec, bitrate, fps)
│       └── Stream 2 (resolução, codec, bitrate, fps)
│
├── ⚙️ Equipamento
│   ├── OCR (/api/equipment/ocr) ⭐ CRÍTICO
│   │   ├── enabled
│   │   ├── model (AX-OCR)
│   │   ├── minConfidence
│   │   └── ROI de leitura
│   │
│   ├── Classificador (/api/equipment/classifier)
│   │   ├── enabled
│   │   └── categorias
│   │
│   ├── Faixas (/api/equipment/lanes) ⭐ CRÍTICO
│   │   ├── lanes[] (número, direção, posição)
│   │   └── detectionZones
│   │
│   ├── Analytics (/api/equipment/analytics)
│   │   └── Contagem, velocidade, etc.
│   │
│   ├── Indicador de Veículo (/api/equipment/vehicleIndicator)
│   │   └── Configuração de indicação
│   │
│   ├── Servidores
│   │   ├── FTP (/api/equipment/servers/ftp) ⭐
│   │   │   ├── enabled, host, port, user
│   │   │   └── path, passive, ssl
│   │   │
│   │   ├── Lince (/api/equipment/servers/lince) ⭐
│   │   │   ├── enabled, serverAddress, port
│   │   │   └── status (/api/equipment/servers/lince/status)
│   │   │
│   │   ├── ITScam Pro (/api/equipment/servers/itscampro)
│   │   │   ├── enabled, config
│   │   │   └── status (/api/equipment/servers/itscampro/status)
│   │   │
│   │   ├── Protocolos (/api/equipment/servers/protocols)
│   │   │   └── Protocolos habilitados
│   │   │
│   │   └── REST API Client (/api/equipment/servers/restapiclient/presets)
│   │       └── Presets de envio
│   │
│   ├── Assinatura de Imagem (/api/equipment/imageSign)
│   │   └── Chave de assinatura digital
│   │
│   ├── Portas IO (/api/equipment/ioPorts, /api/equipment/ioBasic)
│   │   └── Configuração de entradas/saídas
│   │
│   └── Diversos (/api/equipment/misc)
│       └── Configurações variadas
│
├── 🔧 Sistema
│   ├── Geral (/api/equipment/general)
│   │   ├── hostname
│   │   └── description
│   │
│   ├── Data e Hora (/api/equipment/dateAndTime) ⭐
│   │   ├── timezone
│   │   ├── ntp (enabled, servers)
│   │   └── dateTime
│   │
│   ├── Rede
│   │   ├── Completa (/api/equipment/network)
│   │   ├── Ethernet (/api/equipment/network/ethernet)
│   │   ├── Firewall (/api/equipment/network/firewall)
│   │   └── Rotas (/api/equipment/network/routes)
│   │
│   ├── Manutenção
│   │   ├── Backup (/api/system/maintenance/backup)
│   │   ├── Reboot Auto (/api/system/maintenance/automaticreboot)
│   │   ├── Acesso Remoto (/api/system/maintenance/remoteaccess)
│   │   ├── SDCard (/api/system/maintenance/sdcard)
│   │   └── Storage (/api/system/maintenance/storage/usage)
│   │
│   ├── Monitoramento
│   │   └── SNMP (/api/system/monitoring/snmp)
│   │
│   ├── Firmware (/api/system/firmware)
│   │
│   ├── Licenças (/api/system/licenses)
│   │
│   └── Usuários (/api/system/users)
│
└── 📖 Documentação da API (/docs/itscam.yaml)
```

---

## 3. De-Para: Configuração Padrão vs Divergências Conhecidas

### 3.1 Menu IMAGEM > PERFIS (Mais Crítico)

#### Perfil Diurno — Valores Padrão (Referência: GOEC6O058)

| Submenu | Parâmetro | Valor Padrão | Impacto se Diferente | Equipamentos com Problema |
|---|---|---|---|---|
| **Cor** | saturation | 0 | Imagem dessaturada | Verificar todos |
| **Cor** | gamma | 130 | Imagem escura/clara demais | Verificar todos |
| **Cor** | contrast | 0 | Contraste excessivo | Verificar todos |
| **Cor** | brightness | 0 | Brilho incorreto | Verificar todos |
| **Lente** | exchanger (IR-cut) | `true` | ⚠️ Imagem P&B se false! | GOEC6O008, GOEC6O040 |
| **Exposição** | gain.automatic | `true` | Ganho fixo inadequado | Verificar todos |
| **Exposição** | gain.maxValue | 1500 | Ruído excessivo se muito alto | Verificar todos |
| **Exposição** | shutter.automatic | `true` | Shutter fixo pode borrar | Verificar todos |
| **Exposição** | shutter.maxValue | 500 | Borrado em movimento | Verificar todos |
| **Exposição** | iris.automatic | `true` | Sobre/sub-exposição | Verificar todos |
| **Exposição** | level.roi.enabled | `true` | Exposição instável | GOEC6O008 |
| **Exposição** | level.targetValue | 38 | Imagem escura/clara | Verificar todos |
| **Filtros** | sharpnessLevel | 30 | Nitidez insuficiente | Verificar todos |
| **Trigger** | event | "constant" | Captura incorreta | Verificar todos |
| **Trigger** | minimumInterval | 100 | Dupla captura | Verificar todos |
| **WB** | automatic | `true` | Cores incorretas | Verificar todos |
| **Overlay** | CODIGO EQUIPAMENTO | (correto p/ câmera) | Código errado na imagem | GOEC6O058, O007, O004, O013, O040 |

#### Perfil Noturno — Valores Padrão

| Submenu | Parâmetro | Valor Padrão | Impacto se Diferente |
|---|---|---|---|
| **Cor** | saturation | -100 | Normal para noturno |
| **Cor** | gamma | 12 | Exposição noturna |
| **Cor** | contrast | 30 | Contraste noturno |
| **Lente** | exchanger (IR-cut) | `false` | Permite luz IR |
| **Exposição** | gain.maxValue | 4000 | Sensibilidade noturna |
| **Exposição** | shutter.maxValue | 800 | Captura noturna |
| **Exposição** | iris.automatic | `false` | Iris fixa à noite |
| **Flash** | out 1 percent | 65 | Iluminação IR |
| **Flash** | out 3 percent | 65 | Iluminação IR |
| **WB** | automatic | `false` | Não precisa à noite |

#### Transições — Valores OBRIGATÓRIOS ⭐⭐

| Parâmetro | Valor CORRETO | Valor ERRADO (exemplos) | Resultado do Erro |
|---|---|---|---|
| `transitions.lower.startTime` | `"00:00:00"` | "00:00", "18:00" | Dead-zone temporal |
| `transitions.lower.endTime` | `"00:00:00"` | "06:00", "18:00" | Janela restritiva |
| `transitions.upper.startTime` | `"00:00:00"` | "06:00", "18:01" | Impede retorno ao diurno |
| `transitions.upper.endTime` | `"00:00:00"` | "00:00", "06:00" | Dead-zone de retorno |
| `transitions.lower.level` | `10` | 5, 15 | Transição prematura/tardia |
| `transitions.upper.level` | `35` | 30, 40 | Retorno prematuro/tardio |
| `transitions.*.holdTime` | `60000` | 0, ausente | Oscilação rápida |
| `transitions.lower.profile` | ID do perfil NOTURNO | ID do próprio perfil | TRAVAMENTO! |
| `transitions.upper.profile` | ID do perfil DIURNO (0) | - | Não retorna |

---

### 3.2 Menu EQUIPAMENTO > SERVIDORES

| Submenu | Parâmetro | Padrão Esperado | Impacto |
|---|---|---|---|
| FTP | enabled | Conforme site | Sem envio de imagens |
| FTP | host | Servidor padrão Labor | Imagens perdidas |
| Lince | enabled | `true` | Sem comunicação com servidor |
| Lince | serverAddress | IP do servidor Labor | Dados perdidos |
| Protocolos | - | Consistente entre equips | Incompatibilidade |

### 3.3 Menu SISTEMA > DATA E HORA

| Parâmetro | Padrão | Impacto se Errado |
|---|---|---|
| timezone | America/Sao_Paulo | Timestamp incorreto nas passagens |
| ntp.enabled | `true` | Relógio dessincronizado |
| ntp.servers | pool.ntp.br | Servidores inacessíveis |

### 3.4 Menu SISTEMA > REDE

| Parâmetro | Verificação | Impacto |
|---|---|---|
| IP | Deve corresponder à planta | Conflito de IP |
| Gateway | Deve estar correto para o site | Sem comunicação |
| DNS | Deve resolver nomes | Falha NTP/upload |

---

## 4. Mapa Visual de Acesso às Configurações

### 4.1 Como acessar cada configuração no ITScam 450

```
┌─────────────────────────────────────────────────────────────────┐
│ ACESSO VIA VARCO TUNNEL                                          │
│                                                                   │
│ 1. https://varco.io/devices → Buscar equipamento                │
│ 2. Clicar no device → Aba "Tunnels" → Copiar link porta 80     │
│ 3. URL: https://{UUID}-80.tunnel.varco.cloud                     │
│ 4. Login: admin / #econocr@                                      │
│                                                                   │
│ OU via script automatizado (coletar-configuracoes.mjs)           │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Navegação para Correção de Transições (Problema Mais Comum)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────┐                                                    │
│  │ Menu    │                                                    │
│  │ Lateral │   ┌────────────────────────────────────────────┐  │
│  │         │   │                                            │  │
│  │ ○ Estado│   │  PERFIS DE IMAGEM                          │  │
│  │ ● Imagem│──►│                                            │  │
│  │ ○ Vídeo │   │  ┌──────────┐  ┌──────────┐               │  │
│  │ ○ Equip.│   │  │  Diurno  │  │ Noturno  │  ← Abas      │  │
│  │ ○ Sistema│  │  └──────────┘  └──────────┘               │  │
│  │ ○ API   │   │                                            │  │
│  │ ○ Sair  │   │  Seção: TRANSIÇÕES                        │  │
│  │         │   │  ┌────────────────────────────────────┐    │  │
│  └─────────┘   │  │ Lower Transition                   │    │  │
│                 │  │  Start Time: [00:00:00] ← AQUI    │    │  │
│                 │  │  End Time:   [00:00:00] ← AQUI    │    │  │
│                 │  │  Hold Time:  [60000]              │    │  │
│                 │  │  Level:      [10]                  │    │  │
│                 │  │  Profile:    [Noturno ▼]           │    │  │
│                 │  ├────────────────────────────────────┤    │  │
│                 │  │ Upper Transition                   │    │  │
│                 │  │  Start Time: [00:00:00] ← AQUI    │    │  │
│                 │  │  End Time:   [00:00:00] ← AQUI    │    │  │
│                 │  │  Hold Time:  [60000]              │    │  │
│                 │  │  Level:      [35]                  │    │  │
│                 │  │  Profile:    [Diurno ▼]            │    │  │
│                 │  └────────────────────────────────────┘    │  │
│                 │                                            │  │
│                 │  [Salvar Configuração]                      │  │
│                 └────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 Navegação para Overlay (Código do Equipamento)

```
┌────────────────────────────────────────────────────────────────┐
│  Menu: Imagem → Perfis → [Diurno/Noturno] → Overlay           │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ OVERLAY                                                 │    │
│  │                                                         │    │
│  │  ☐ Habilitar overlay                                    │    │
│  │                                                         │    │
│  │  Texto:                                                 │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ SEQUENCIAL: {rid}                                │  │    │
│  │  │ DATA PASSAGEM: {day}/{month}/{year}              │  │    │
│  │  │ HORA PASSAGEM: {hour}:{minute}:{second}:{msec}   │  │    │
│  │  │ PLACA: {plates}                                  │  │    │
│  │  │ CODIGO EQUIPAMENTO: GOEC6OXXXX  ← VERIFICAR     │  │    │
│  │  │ MODELO OCR: AX-OCR                              │  │    │
│  │  │ LOCAL: [cidade]-GO                               │  │    │
│  │  │ NOME DA VIA: [rodovia], Km [XX]                  │  │    │
│  │  │ SENTIDO: [sentido]                               │  │    │
│  │  │ FAIXA: [01/02]                                   │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ⚠️ CÓDIGO DEVE CORRESPONDER ao equipamento real!              │
│  ⚠️ Muitos equipamentos têm "GOEC6O009" ERRADO!               │
└────────────────────────────────────────────────────────────────┘
```

### 4.4 Navegação para Servidores (FTP/Lince)

```
┌────────────────────────────────────────────────────────────────┐
│  Menu: Equipamento → Servidores → FTP/Lince                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   FTP    │  │  Lince   │  │ ITScamPro│  │Protocolos│      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ SERVIDOR FTP                                            │    │
│  │                                                         │    │
│  │  ☑ Habilitado                                           │    │
│  │  Host: [_________]  ← Deve ser consistente              │    │
│  │  Porta: [21]                                            │    │
│  │  Usuário: [_________]                                   │    │
│  │  Senha: [_________]                                     │    │
│  │  Caminho: [/equip/GOEC6OXXXX/]                          │    │
│  │  ☑ Modo passivo                                         │    │
│  │  ☐ SSL/TLS                                              │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Equipamentos Referência e Padrão-Ouro

### Equipamento de Referência Principal

| Campo | Valor |
|---|---|
| **Equipamento** | GOEC6O058 - Faixa 1 |
| **UUID Varco** | b5a0f157-e8d4-478c-bf2b-91ebbfcf2a29 |
| **Tunnel** | https://b5a0f157-e8d4-478c-bf2b-91ebbfcf2a29-80.tunnel.varco.cloud |
| **Status** | Operacional, Diurno ativo corretamente |
| **Justificativa** | Transições luminosity-based (00:00:00), ROI habilitado, thresholds padrão |

### Equipamentos de Validação Cruzada

| Equipamento | UUID | Status | Notas |
|---|---|---|---|
| GOEC6O007 - Faixa 1 | 2c1ab0be-d0a3-4742-98ed-a916cb12fa22 | ✅ Config correta | Transições ok |
| GOEC6O004 - Faixa 1 | fe1f2f2d-327c-4e87-b865-0b9d32cca00b | ✅ Config correta | Transições ok |
| GOEC6O013 - Faixa 1 | 7d9bf2eb-0f9a-4691-bffd-e003fc3781ed | ✅ Config correta | Referência anterior |

### Equipamentos com Problemas Confirmados

| Equipamento | UUID | Problema | Causa |
|---|---|---|---|
| GOEC6O008 - Faixa 1 | 5d6880f0-e8f2-4ff0-be25-00c3b31d6522 | Travado em Noturno | Transições time-based com gap |
| GOEC6O040 - Faixa 1 | 9b5328e3-104b-4afc-b3ce-8880066ca995 | Travado em Noturno | Transição lower auto-referencia |
| GOEC6O040 - Faixa 2 | 416aff7e-4c34-4356-bbac-aa66d34ffead | A verificar | Mesmo site do O040 F1 |

---

## 6. Execução da Auditoria

### Fase 1: Coleta Automatizada (Script)

```powershell
# Na raiz do workspace
cd c:\Users\Santiago\Axiondocs\Axion.Docs
node auditoria-itscam/coletar-configuracoes.mjs
```

**Tempo estimado:** ~45-60 min (70 devices × ~35 endpoints × 0.5s delay)  
**Saída:** `auditoria-itscam/resultados/` com 70+ arquivos JSON

### Fase 2: Análise de Divergências

```powershell
node auditoria-itscam/analisar-divergencias.mjs
```

**Saída:** `auditoria-itscam/relatorios/AUDITORIA-COMPLETA-POR-MENU.md`

### Fase 3: Correção Manual (por prioridade)

1. **CRÍTICO** — Equipamentos com transição travada (P&B permanente)
2. **ALTO** — Equipamentos com configuração que pode travar
3. **MÉDIO** — Inconsistências de padronização
4. **BAIXO** — Melhorias e otimizações

---

## 7. Checklist de Verificação por Menu

### ☐ Menu Estado Atual
- [ ] Firmware v1.7.8 em todos os equipamentos
- [ ] Uptime razoável (>24h sugere estabilidade)
- [ ] Temperatura CPU < 85°C
- [ ] Storage não cheio (< 90%)

### ☐ Menu Imagem > Perfis
- [ ] 2 perfis configurados (Diurno + Noturno)
- [ ] Perfil Diurno com saturation=0, exchanger=true
- [ ] Perfil Noturno com saturation=-100, exchanger=false
- [ ] Transições: startTime/endTime = "00:00:00" em AMBOS os perfis
- [ ] Lower level = 10, Upper level = 35
- [ ] holdTime = 60000 em ambas transições
- [ ] Lower.profile aponta para ID do Noturno (NÃO para si mesmo!)
- [ ] Upper.profile aponta para ID do Diurno (0)
- [ ] ROI de exposição habilitado no Diurno
- [ ] Flash configurado no Noturno (65% saídas 1 e 3)
- [ ] Overlay com CODIGO EQUIPAMENTO correto

### ☐ Menu Vídeo
- [ ] Streams configurados para resolução desejada
- [ ] FPS adequado

### ☐ Menu Equipamento > OCR
- [ ] OCR habilitado
- [ ] Modelo correto (AX-OCR)
- [ ] Confidence adequada

### ☐ Menu Equipamento > Faixas
- [ ] Número de faixas correto
- [ ] Direção correta
- [ ] Zona de detecção calibrada

### ☐ Menu Equipamento > Servidores
- [ ] FTP habilitado e apontando para servidor correto
- [ ] Lince habilitado e conectado
- [ ] Caminho FTP com código do equipamento correto

### ☐ Menu Sistema > Data/Hora
- [ ] Timezone = America/Sao_Paulo
- [ ] NTP habilitado
- [ ] Hora sincronizada (±5s do real)

### ☐ Menu Sistema > Rede
- [ ] IP corresponde ao inventário
- [ ] Gateway acessível
- [ ] DNS funcional

### ☐ Menu Sistema > Manutenção
- [ ] Acesso remoto seguro
- [ ] Reboot automático (opcional mas recomendado)
- [ ] SDCard operacional

---

## 8. Critérios de Classificação de Divergências

| Nível | Critério | Ação |
|---|---|---|
| 🔴 **CRÍTICO** | Causa perda de funcionalidade (P&B, sem OCR, sem envio) | Correção IMEDIATA |
| 🟠 **ALTO** | Pode causar falha em condição específica | Correção em 24h |
| 🟡 **MÉDIO** | Inconsistência que pode gerar problemas futuros | Correção planejada |
| 🟢 **BAIXO** | Melhoria de padronização/performance | Próxima manutenção |
| ⚪ **INFO** | Diferença aceitável por contexto (IP, hostname) | Apenas documentar |

---

## 9. Estrutura de Arquivos da Auditoria

```
auditoria-itscam/
├── devices-inventory.json          ← Inventário dos 70 equipamentos
├── coletar-configuracoes.mjs       ← Script de coleta automatizada
├── analisar-divergencias.mjs       ← Script de análise e comparação
├── ESTRATEGIA-AUDITORIA.md         ← Este documento
├── resultados/                     ← Dados brutos (gerado pelo script)
│   ├── _ALL_DEVICES.json
│   ├── _RELATORIO_COMPARACAO.json
│   ├── _progress.json
│   └── [70 arquivos por equipamento]
└── relatorios/                     ← Relatórios finais (gerado pelo script)
    ├── AUDITORIA-COMPLETA-POR-MENU.md
    └── analises-raw.json
```

---

## 10. Endpoints Coletados por Equipamento (35 total)

| # | Endpoint | Menu na UI | Criticidade |
|---|---|---|---|
| 1 | `/api/equipment/info` | Estado Atual | INFO |
| 2 | `/api/equipment/boards` | Estado Atual > Versões | INFO |
| 3 | `/api/system/firmware` | Estado Atual > Firmware | INFO |
| 4 | `/api/system/maintenance/storage/usage` | Estado Atual > Storage | BAIXO |
| 5 | `/api/equipment/misc/readonly/volatile` | Estado Atual > Performance | INFO |
| 6 | `/api/equipment/misc/readonly/constants` | Estado Atual > Constantes | INFO |
| 7 | `/api/image/profiles` | **Imagem > Perfis** | 🔴 CRÍTICO |
| 8 | `/api/equipment/transitioner` | Imagem > Transicionador | 🔴 CRÍTICO |
| 9 | `/api/equipment/autofocus` | Imagem > Autofoco | MÉDIO |
| 10 | `/api/video/streams` | Vídeo > Streams | MÉDIO |
| 11 | `/api/equipment/ocr` | **Equipamento > OCR** | 🔴 CRÍTICO |
| 12 | `/api/equipment/classifier` | Equipamento > Classificador | MÉDIO |
| 13 | `/api/equipment/lanes` | **Equipamento > Faixas** | 🔴 CRÍTICO |
| 14 | `/api/equipment/analytics` | Equipamento > Analytics | BAIXO |
| 15 | `/api/equipment/vehicleIndicator` | Equipamento > Indicador | BAIXO |
| 16 | `/api/equipment/servers/ftp` | **Equip > Servidores > FTP** | 🟠 ALTO |
| 17 | `/api/equipment/servers/lince` | **Equip > Servidores > Lince** | 🟠 ALTO |
| 18 | `/api/equipment/servers/lince/status` | Equip > Servidores > Lince Status | INFO |
| 19 | `/api/equipment/servers/itscampro` | Equip > Servidores > ITScamPro | MÉDIO |
| 20 | `/api/equipment/servers/itscampro/status` | Equip > Servidores > ITP Status | INFO |
| 21 | `/api/equipment/servers/protocols` | Equip > Servidores > Protocolos | MÉDIO |
| 22 | `/api/equipment/servers/restapiclient/presets` | Equip > Servidores > REST | BAIXO |
| 23 | `/api/equipment/imageSign` | Equipamento > Assinatura | BAIXO |
| 24 | `/api/equipment/ioPorts` | Equipamento > Portas IO | BAIXO |
| 25 | `/api/equipment/ioBasic` | Equipamento > IO Básico | BAIXO |
| 26 | `/api/equipment/misc` | Equipamento > Diversos | BAIXO |
| 27 | `/api/equipment/general` | Sistema > Geral | MÉDIO |
| 28 | `/api/equipment/dateAndTime` | **Sistema > Data/Hora** | 🟠 ALTO |
| 29 | `/api/equipment/network` | Sistema > Rede | MÉDIO |
| 30 | `/api/equipment/network/ethernet` | Sistema > Rede > Ethernet | MÉDIO |
| 31 | `/api/equipment/network/firewall` | Sistema > Rede > Firewall | BAIXO |
| 32 | `/api/equipment/network/routes` | Sistema > Rede > Rotas | BAIXO |
| 33 | `/api/system/maintenance/automaticreboot` | Sistema > Manutenção | BAIXO |
| 34 | `/api/system/maintenance/remoteaccess` | Sistema > Acesso Remoto | SEGURANÇA |
| 35 | `/api/system/monitoring/snmp` | Sistema > Monitoramento | BAIXO |

---

## 11. Próximos Passos

1. **Executar coleta** — Rodar `coletar-configuracoes.mjs` para dump completo
2. **Analisar resultados** — Rodar `analisar-divergencias.mjs` para relatório
3. **Priorizar correções** — Tratar CRÍTICOS primeiro (transições, OCR, faixas)
4. **Corrigir em lote** — Criar script de aplicação de correções via API PUT
5. **Validar correções** — Re-executar coleta e confirmar padronização
6. **Documentar baseline** — Salvar configuração padrão como "golden config"
