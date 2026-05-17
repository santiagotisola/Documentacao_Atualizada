# Arquitetura de Proteção de Imagens e Backup com Azure Blob Storage
## Análise Técnica — Fluxo Completo de Captura, Processamento e Armazenamento

---

## Resumo Executivo

O sistema AxHub/AxCross implementa uma arquitetura de proteção de imagens originais baseada em políticas WORM (Write Once, Read Many) com Azure Blob Storage. A solução garante **integridade probatória**, **conformidade LGPD** e **resiliência contra falhas operacionais e ransomware** através de versionamento automático, snapshots, e gerenciamento de ciclo de vida.

---

## 1. Fluxo de Captura e Armazenamento

### 1.1 Origem da Imagem — Equipamento (Ponto de Fiscalização)

**Momento 0 — Passagem do veículo:**
- Câmera OCR/LPR detecta o veículo
- Sensor captura frame fotográfico em resolução full HD (1920x1080 ou superior)
- Algoritmo de detecção por IA processa o frame para extração de placa
- Equipamento gera arquivo de imagem com extensão `.jpg` ou `.png`

**Metadados associados:**
- Timestamp de captura (data/hora exata com precisão de milissegundos)
- Identificador único do equipamento (serial ou IP)
- Faixa de pista monitorada
- Velocidade detectada (se disponível)
- Confiança da leitura OCR (0-100%)
- Hash criptográfico SHA-256 (para garantir integridade)

### 1.2 Transmissão para o servidor AxHub

**Fluxo de envio:**

```
Equipamento (Local)
    │
    ├─► Validação local: verifica integridade do arquivo
    │   (checksum, tamanho, corrupção)
    │
    ├─► Compressão: algoritmo gzip para redução de banda
    │   (redução típica: 60-70% do tamanho original)
    │
    └─► Upload HTTPS para servidor AxHub
        - Protocolo: TLS 1.3 (criptografia fim-a-fim)
        - Retry automático: 5 tentativas com backoff exponencial
        - Timeout: 30 segundos por tentativa
        - Se falhar: arquivo armazenado localmente no SD do equipamento
          para sincronização posterior
```

### 1.3 Recebimento no AxHub e Processamento

**Servidor AxHub recebe:**

```
1. Validação de autenticação
   - Token JWT do equipamento
   - Verificação de assinatura digital
   - Controle de acesso: apenas equipamentos autorizados

2. Extração e descompressão
   - Descompactação gzip
   - Verificação de integridade (hash SHA-256)
   - Se hash não corresponder: rejeição + log de erro
   - Equipamento recebe comando para reenviar

3. Registro no banco de dados (SQL Server)
   INSERT INTO Passagens (
     EquipamentoID, DataHora, Placa, Confianca,
     ImagemOriginalID, ImagemEditadaID, Status,
     DataCriacao, UsuarioCriacao
   ) VALUES (...)

4. Envio para Azure Blob Storage
   - Container: "imagens-originais-[ano-mes]"
   - Nome blob: "equipamento-[ID]/YYYYMM/DD/HHmmss_[UUID].jpg"
   - Exemplo: "equipamento-001/202605/08/183045_a7f3d1b2.jpg"
```

---

## 2. Sistema de Proteção contra Edição da Imagem Original

### 2.1 Princípio Fundamental: WORM (Write Once, Read Many)

A imagem original é **nunca alterável** após armazenamento. Implementado através de:

**Camada 1 — Banco de Dados:**
- Permissão de leitura: ✅ Todas as aplicações
- Permissão de edição: ❌ Bloqueada por constraint de banco
- Permissão de exclusão: ❌ Bloqueada por política de retenção
- Trigger de auditoria: ✅ Registra toda tentativa de acesso

**Camada 2 — Azure Blob Storage (WORM):**
- Política de retenção legal: 365 dias (renovável)
- Immutable Storage habilitado: não permite sobrescrita
- Versionamento: cada versão anterior imutável
- SLA de durabilidade: 99,99999999999% (11 noves)

### 2.2 Fluxo de Obliteração — Proteção de Dados Pessoais (LGPD)

Quando é necessário remover dados pessoais (rosto de pedestre, placa de terceiro não envolvido):

```
┌─────────────────────────────────────────────────────────────┐
│ IMAGEM ORIGINAL (Azure Blob Storage — WORM)                │
│                                                             │
│ ✅ Intacta e imutável                                      │
│ ✅ Protegida por retenção legal                            │
│ ✅ Valor probatório preservado                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Sistema cria cópia
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ CÓPIA DE TRABALHO (Container: imagens-processadas)         │
│                                                             │
│ 1. Técnico visualiza a cópia no AxHub                      │
│ 2. Aplica máscara de obliteração                           │
│    - Blur gaussiano: sobre rostos                          │
│    - Pixelização: sobre placas sensíveis                   │
│    - Desenho de retângulos: sobre áreas sensíveis          │
│ 3. Sistema registra:                                       │
│    - Usuário que fez edição: login@axion.ws               │
│    - Data/hora exata: 2026-05-08 18:30:45                │
│    - Justificativa LGPD: "Rosto de pedestre"             │
│    - Versão: v2 (original = v1)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Armazenamento versionado
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ AZURE BLOB STORAGE (Versões)                              │
│                                                             │
│ v1: Imagem original (data: 2026-05-08 18:30:21)          │
│     → WORM (nunca pode ser alterada)                       │
│                                                             │
│ v2: Imagem com obliteração (data: 2026-05-08 18:35:10)   │
│     → Metadados: usuário, justificativa, algoritmo usado  │
│     → Ligação para v1 (rastreabilidade completa)          │
│     → Pode ser exportada ou descartada conforme necessário │
│                                                             │
│ v3, v4, ...: Versões adicionais se houver novos pedidos   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Garantia de Integridade

Toda imagem armazenada possui:

| Propriedade | Mecanismo | Benefício |
|---|---|---|
| **Hash SHA-256** | Calculado no equipamento e verificado no servidor | Detecta corrupção de dados em trânsito |
| **Timestamp RFC 3339** | Carimbo de data/hora com timezone | Prova cronológica da captura |
| **Assinatura digital** | RSA-2048 do equipamento | Autentica origem — equipamento específico capturou |
| **Versioning** | Todas as versões mantidas indefinidamente | Histórico completo preservado |

---

## 3. Estratégia de Backup e Proteção com Azure Blob Storage

### 3.1 Os 4 Pilares da Arquitetura

#### Pilar 1: Imutabilidade (WORM)

**O quê:** Política "Write Once, Read Many" — após escrita, arquivo não pode ser alterado.

**Como implementado:**
- Azure Blob Storage Immutable Storage habilitado
- Retenção legal de 365 dias (bloqueio permanente pode ser ativado)
- Nenhuma permissão de delete, update ou overwrite durante retenção

**Cenários protegidos:**
- ✅ Ransomware: não consegue criptografar ou deletar
- ✅ Exclusão acidental: bloqueada por política
- ✅ Edição indevida: apenas leitura permitida
- ✅ Auditoria: prova de que arquivo nunca foi tocado

**Conformidade:**
- GDPR: artigo 5.1.f (integridade)
- LGPD: artigo 46 (segurança)
- ISO 27001: controle A.12.2.1

#### Pilar 2: Versionamento

**O quê:** Manutenção automática de múltiplas versões de cada blob.

**Como implementado:**
```
Blob "2026050818304521.jpg"

├─ Version 1 (original)
│  └─ Criado: 2026-05-08 18:30:45
│     Tamanho: 2.4 MB
│     Hash: a7f3d1b2...
│     Status: WORM (imutável)
│
├─ Version 2 (após obliteração)
│  └─ Criado: 2026-05-08 18:35:10
│     Tamanho: 2.3 MB (ligeiramente menor por compressão)
│     Modificado por: usuario@axion.ws
│     Justificativa: LGPD - dados pessoais removidos
│
└─ Version 3 (após marcação com carimbo)
   └─ Criado: 2026-05-08 19:00:22
      Tamanho: 2.5 MB
      Modificado por: operador@axion.ws
```

**Benefícios:**
- Restauração rápida: 1 segundo via `Get-AzStorageBlob -Include VersionId`
- Histórico completo: auditoria de quem modificou quando
- Sem overhead de espaço: versões antigas em tier Cool/Archive

#### Pilar 3: Snapshots

**O quê:** Cópia ponto-no-tempo, somente leitura, de um blob ou container.

**Cenários de uso:**

| Evento | Snapshot criado | Proteção contra |
|---|---|---|
| Antes de deploy crítico | ✅ Automático | Rollback se deploy falhar |
| Antes de sincronização com Elastic Search | ✅ Automático | Recuperação de dados corrompidos |
| Antes de limpeza de dados antigos | ✅ Automático | Exclusão acidental em massa |
| Backup mensal full | ✅ Manual | Perda total de dados em região |

**Exemplo:**
```
Snapshot criado: 2026-05-08 00:00:00
├─ Contém: todas as imagens até esse horário
├─ Tamanho: 1.2 TB
├─ Retention: 30 dias
├─ Acesso: somente leitura
└─ Uso: se corrupção detectada, restaurar desde snapshot
```

#### Pilar 4: Retenção Automática (Lifecycle Management)

**O quê:** Movimentação automática de dados entre camadas Hot/Cool/Archive conforme idade.

**Política configurada:**

```
Imagem capturada (Data = T)
│
├─ Dias 0-30: Camada HOT
│  └─ Custo: R$ 0,018 por GB/mês
│     Latência: <10ms
│     Uso: acesso frequente em operações do dia
│     Exemplo: imagens dos últimos 30 dias consultadas 50+ vezes/dia
│
├─ Dias 30-180: Camada COOL
│  └─ Custo: R$ 0,009 por GB/mês (50% do Hot)
│     Latência: 100-500ms
│     Uso: consulta ocasional de casos históricos
│     Exemplo: revisão de múltiplas infrações de um veículo
│
└─ Dias 180+: Camada ARCHIVE
   └─ Custo: R$ 0,003 por GB/mês (83% mais barato que Cool)
      Latência: 1-15 horas (primeiro acesso = "rehydratação")
      Uso: arquivo para conformidade legal
      Exemplo: documentação de processo administrativo de 6 meses atrás
```

**Economia anual estimada:**
```
Cenário: 10 mil imagens/dia × 30 dias × 365 dias = 109.5 milhões/ano

Sem lifecycle (tudo em Hot):
  109.5M imagens × 2 MB × R$ 0,018/GB = R$ 3.942 mil/mês

Com lifecycle (30% Hot, 50% Cool, 20% Archive):
  = (30% × R$ 0,018 + 50% × R$ 0,009 + 20% × R$ 0,003)
  = R$ 0,0099 por GB/mês
  = 109.5M × 2 MB × R$ 0,0099/GB = R$ 2.170 mil/mês
  
Economia: 45% de redução = R$ 1.772 mil/mês = R$ 21.264 mil/ano
```

---

## 4. Fluxo Completo: Do Equipamento ao Arquivo Protegido

```
┌────────────────────────────────────────────────────────────────┐
│ EQUIPAMENTO (Câmera OCR/LPR)                                  │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ T0: Passagem detectada                                  │  │
│ │ • Frame capturado: 2026-05-08 18:30:45.327              │  │
│ │ • Placa lida: ABC1D23 (confiança: 98.5%)                │  │
│ │ • Velocidade: 72 km/h                                   │  │
│ │ • Arquivo gerado: /tmp/2026050818304500.jpg (2.4 MB)   │  │
│ │ • Hash SHA-256: a7f3d1b2c8e9f0g1h2i3j4k5l6...          │  │
│ └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                           │
                           │ Validação local + compressão
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ REDE (Upload HTTPS/TLS 1.3)                                  │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ • Arquivo comprimido: 2.4 MB → 720 KB (70% redução)    │  │
│ │ • Upload: 3-5 segundos em conexão 1 Mbps               │  │
│ │ • Retry automático: até 5 tentativas se falhar         │  │
│ │ • Fallback: armazenamento local no SD até sincronização│  │
│ └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                           │
                           │ Autenticação + registro
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ AXHUB (Servidor)                                              │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ T+1s: Recebimento                                       │  │
│ │ • Verificação JWT: token válido ✅                      │  │
│ │ • Descompressão: 720 KB → 2.4 MB                        │  │
│ │ • Verificação hash: a7f3d1b2c8... ✅ (integridade OK)   │  │
│ │ • INSERT Passagens:                                    │  │
│ │   - EquipamentoID: 001                                 │  │
│ │   - Placa: ABC1D23                                     │  │
│ │   - DataHora: 2026-05-08 18:30:45.327                 │  │
│ │   - ImagemOriginalID: a7f3d1b2... (referência)        │  │
│ │   - Status: PROCESSANDO                                │  │
│ └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                           │
                           │ Envio para Azure Blob
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ AZURE BLOB STORAGE (Armazenamento Seguro)                    │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ T+3s: Upload completado                                │  │
│ │ Container: imagens-originais-202605                     │  │
│ │ Path: equipamento-001/202605/08/183045_a7f3d1b2.jpg   │  │
│ │ • Blob versioning: v1 (original)                       │  │
│ │ • Immutable Storage: habilitado (retenção 365d)        │  │
│ │ • Replicação: LRS (3 cópias no mesmo datacenter)       │  │
│ │   + GRS (3 cópias em datacenter na região US-East)    │  │
│ │ • Snapshot: criado automaticamente (ponto-no-tempo)    │  │
│ │ • Camada: HOT (acesso frequente)                       │  │
│ │ • Status: IMUTÁVEL ✅                                   │  │
│ └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴─────────┐
                    │                │
        (Acesso Normal)     (Se edição necessária)
                    │                │
                    ▼                ▼
        ┌─────────────────┐   ┌──────────────────┐
        │ Visualização    │   │ Cópia de Trabalho│
        │ em Relatórios   │   │ com Obliteração  │
        └─────────────────┘   └──────────────────┘
                    │                │
                    │                │ v2, v3... (versionado)
                    │                │
                    ▼                ▼
        ┌─────────────────────────────────┐
        │ AZURE LIFECYCLE MANAGEMENT      │
        │ • Dia 0-30: HOT (acesso rápido) │
        │ • Dia 30-180: COOL (raro)      │
        │ • Dia 180+: ARCHIVE (legal)    │
        └─────────────────────────────────┘
```

---

## 5. Conformidade e Benefícios

### 5.1 Conformidade Regulatória

| Lei/Norma | Requisito | Como atendido |
|---|---|---|
| **LGPD** (Lei 13.709/2018) | Art. 46: segurança de dados pessoais | WORM previne modificação não autorizada; auditoria completa |
| **LGPD** | Art. 45: direito ao esquecimento | Lifecycle Management deleta automaticamente após prazo |
| **GDPR** | Art. 5.1.f: integridade e confidencialidade | Versionamento + snapshot + criptografia TLS 1.3 |
| **GDPR** | Art. 32: segurança e resiliência | RTO 1h, RPO <1s com snapshots automáticos |
| **ISO 27001** | A.12.2.1: proteção contra acesso e modificação | Immutable Storage + controle de acesso IAM |

### 5.2 Benefícios Operacionais

| Benefício | Valor | Impacto |
|---|---|---|
| **RTO (Recovery Time Objective)** | <1 hora | Recuperação rápida de falhas |
| **RPO (Recovery Point Objective)** | <1 segundo | Perda de dados mínima |
| **Durabilidade anual** | 99,99999999999% (11 noves) | 0.0000000001% chance de perda |
| **Disponibilidade SLA** | 99.99% | 52 minutos de downtime permitido/ano |
| **Redundância** | GRS (geograficamente distribuída) | Sobrevive desastre regional |
| **Capacidade** | Ilimitada | Crescimento sem planejamento |
| **Custo operacional** | -45% com lifecycle | Economia significativa no TCO |

### 5.3 Cenários de Proteção

| Cenário | Sem proteção | Com proteção |
|---|---|---|
| **Ransomware** | Dados criptografados e perdidos | WORM impede, snapshot restaura em 1h |
| **Exclusão acidental** | Perda permanente | Versionamento restaura versão anterior |
| **Corrupção de dados** | Sem recuperação | Snapshot de 24h anterior disponível |
| **Auditoria legal** | Sem prova de integridade | Hash + versioning + auditoria completa |
| **Conformidade LGPD** | Risco de multa até 2% do faturamento | Documentação de retenção automática |
| **Desastre regional** | Perda total em caso de falha de datacenter | GRS replica em região secundária |

---

## 6. Conclusão

A arquitetura proposta implementa um sistema de **proteção multinível** que:

✅ **Garante integridade:** imagem original nunca alterável (WORM)  
✅ **Preserva conformidade:** LGPD + GDPR + ISO 27001  
✅ **Oferece resiliência:** 4 pilares de proteção (imutabilidade, versionamento, snapshots, retenção)  
✅ **Reduz custos:** lifecycle management com economia de 45%  
✅ **Recuperação rápida:** RTO <1h, snapshots em tempo real  
✅ **Escalabilidade:** capacidade ilimitada, crescimento sem planejamento  

**Recomendação:** Implementação imediata com ativação de retenção legal de 365 dias para atender requisitos legais máximos.
