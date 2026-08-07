---
sidebar_position: 10
title: Proteção de Imagens e Backup
description: Arquitetura de proteção de imagens originais e estratégia de backup com Azure Blob Storage
---

# Proteção de Imagens e Backup

## Origem das imagens no sistema

Cada imagem registrada no AxHub é **gerada diretamente no Equipamento instalado no ponto de fiscalização — câmeras OCR/LPR, radares ou sensores com captura fotográfica. No momento da passagem, o dispositivo produz o arquivo de imagem e o transmite ao servidor, onde é armazenado com carimbo de data/hora, identificador único e vínculo ao registro de passagem correspondente.

Essas imagens têm **valor probatório e legal**: comprovam a Infração identificam o Veículo e sustentam autuações, processos administrativos e auditorias. Por isso, a **imagem original nunca pode ser alterada** após recebida pelo sistema.

---

## Proteção contra edição da imagem original

### O processo de obliteração (cópia de trabalho)

Situações operacionais exigem edições nas imagens — por exemplo, **obliteração de dados sensíveis** (rostos de pedestres, placas não relacionadas à Infração para conformidade com a LGPD, ou inserção de marcações para uso em autuações exportadas.

O sistema adota o seguinte fluxo para garantir a **integridade da imagem original**:

```
Equipamento
    │
    ▼
Imagem original gerada (somente leitura)
    │
    ├─── Armazenamento seguro ──► Azure Blob Storage (imutável)
    │
    └─── Quando edição necessária ──► Cópia de trabalho gerada
                                           │
                                           ▼
                                    Processo de edição
                                    (obliteração, marcação)
                                           │
                                           ▼
                                    Imagem editada armazenada
                                    separadamente (versionada)
```

| Item | Imagem Original | Imagem Editada (cópia) |
|------|:--------------:|:---------------------:|
| Gerada pelo Equipamento | ✅ | — |
| Pode ser alterada | ❌ Nunca | ✅ Processo controlado |
| Armazenamento imutável | ✅ | ✅ Versionada |
| Uso em autuações | ✅ Referência legal | ✅ Exportação/impressão |
| Rastreabilidade de edição | — | ✅ Usuário e data registrados |

:::danger Imagem original protegida
A imagem gerada pelo Equipamento é gravada com política **WORM (Write Once, Read Many)**. Nenhum Usuário — nem administradores — pode sobrescrevê-la ou excluí-la durante o período de retenção configurado.
:::

---

## Estratégia de Backup com Azure Blob Storage

O sistema utiliza o **Azure Blob Storage** como camada principal de armazenamento seguro e resiliente para imagens, registros de passagem e backups críticos.

### Recursos de proteção implementados

#### Blob Versioning — Versionamento automático

- Mantém **múltiplas versões** de cada arquivo automaticamente.
- Permite restauração rápida em caso de sobrescrita acidental ou exclusão indevida.
- Cada alteração gera uma nova versão do objeto armazenado, preservando o histórico completo.

#### Snapshots — Pontos de restauração

- Cópias **somente leitura** criadas em pontos específicos no tempo.
- Possibilita rollback rápido sem impacto operacional.
- Utilizados automaticamente antes de operações críticas (migrações, deploys, limpezas de dados).

#### Immutable Storage — Armazenamento Imutável (WORM)

- Implementação da política **"Write Once, Read Many"**.
- Impede alteração ou exclusão de imagens originais e backups durante o período de retenção configurado.
- Protege contra **ransomware**, exclusões maliciosas e falhas operacionais.
- Política de retenção pode ser **bloqueada permanentemente** para garantia máxima de conformidade.

#### Políticas de Retenção

- Retenção configurável por tempo (dias, meses, anos).
- Garantia de conformidade com requisitos legais e regulatórios.
- Ao expirar o período, os arquivos podem ser excluídos automaticamente conforme regras de ciclo de vida.

#### Lifecycle Management — Gerenciamento de Ciclo de Vida

- Automação de movimentação entre camadas de armazenamento:

| Camada | Custo | Uso recomendado |
|--------|-------|-----------------|
| **Hot** | Alto | Imagens dos últimos 30 dias (acesso frequente) |
| **Cool** | Médio | Imagens de 30 a 180 dias |
| **Archive** | Baixo | Imagens acima de 180 dias (acesso raro) |

- Redução de custos operacionais mantendo retenção segura dos backups antigos.
- Movimentação automática sem intervenção manual.

---

## Diagrama da arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│ Azure Blob Storage │
│ │
│ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │ Container │ │ Container │ │
│ │ imagens-orig │ │ imagens-editadas │ │
│ │ (WORM/Imutável) │ │ (Versionado) │ │
│ │ │ │ │ │
│ │ ● Blob v1 ──────┼──────► ● Blob v1 (original) │ │
│ │ (somente │ │ ● Blob v2 (obliterado) │ │
│ │ leitura) │ │ ● Blob v3 (marcado) │ │
│ └──────────────────┘ └──────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Lifecycle Management │ │
│ │ Hot (0-30d) → Cool (30-180d) → Archive (180d+) │ │
│ └──────────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Snapshots automáticos (antes de operações críticas) │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefícios da arquitetura

| Benefício | Descrição |
|-----------|-----------|
| **Alta durabilidade** | Redundância automática com SLA de 99,99999999999% (11 noves) |
| **Recuperação rápida** | Restore de imagem específica em segundos via versionamento |
| **Proteção contra ransomware** | WORM impede criptografia ou exclusão dos arquivos |
| **Conformidade LGPD** | Controle de retenção e exclusão automática ao fim do prazo |
| **Auditoria completa** | Rastreabilidade de toda operação de leitura e escrita |
| **Escalabilidade** | Capacidade ilimitada sem necessidade de gestão de infraestrutura |

---

## Estratégia recomendada (3-2-1)

A solução segue a estratégia de backup **3-2-1**:

- **3** cópias dos dados (produção + Azure Hot + Azure Archive)
- **2** mídias distintas (disco local + nuvem)
- **1** cópia offsite (Azure em datacenter geograficamente separado)

### Configuração recomendada

| Recurso | Configuração |
|---------|-------------|
| **Versionamento** | Habilitado — retenção das últimas 10 versões |
| **Immutable Storage** | Retenção mínima de 365 dias (ajustável por contrato) |
| **Snapshots** | Automáticos antes de cada deploy e migração |
| **Lifecycle** | Hot → Cool aos 30 dias; Cool → Archive aos 180 dias |
| **Backup externo** | Exportação mensal para storage secundário (estratégia 3-2-1) |

:::info Referência oficial
Para detalhes técnicos da plataforma, consulte a documentação oficial:
[Armazenamento de Blobs do Azure — Microsoft](https://azure.microsoft.com/pt-br/products/storage/blobs)
:::

:::tip Conformidade
está arquitetura atende aos requisitos da **LGPD** (Lei 13.709/2018) para proteção de dados pessoais capturados pelas câmeras, garantindo controle de acesso, rastreabilidade e destruição segura ao fim do prazo de retenção.
:::
