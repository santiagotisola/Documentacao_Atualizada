---
sidebar_position: 3
title: Integração VARCO — Variáveis de Template
description: Referência das variáveis VARCO disponíveis para integração com câmeras OCR/LPR no AxTon
---

# Integração VARCO — Variáveis de Template

O **VARCO** é o sistema OCR/LPR das câmeras integradas ao AxTon. Ao registrar uma passagem no posto de pesagem, o equipamento VARCO envia os dados de placa, imagem e veículo ao AxTon via template com variáveis dinâmicas.

:::info
Este documento detalha as variáveis VARCO utilizadas na integração com o AxTon. Para a documentação completa, consulte a documentação do AxHub — Integração VARCO.
:::

---

## Variáveis principais usadas no AxTon

### Identificação do Equipamento

| Variável | Descrição |
|----------|-----------|
| `{{cameraId}}` | Nome do equipamento VARCO |
| `{{equipmentId}}` | Endereço MAC — identificador único do hardware |
| `{{lane}}` | Faixa do posto onde a placa foi detectada |
| `{{registerId}}` | Identificador único da passagem |

### Placa e Veículo

| Variável | Descrição |
|----------|-----------|
| `{{plate}}` | Placa detectada (ex: `ABC1D23`) |
| `{{plateProbability}}` | Confiança por caractere, separadas por vírgula |
| `{{plateCountryCode}}` | País da placa (ISO 3166-1, ex: `BR`) |
| `{{plateIsMotorcycle}}` | `true` se formato de motocicleta |
| `{{vehicleType}}` | Tipo do veículo (`car`, `truck`, `motorcycle`...) |
| `{{vehicleTypeProbability}}` | Confiança do tipo (0.0–1.0) |
| `{{vehicleBrand}}` | Marca do veículo |
| `{{vehicleColor}}` | Cor do veículo |
| `{{vehicleModel}}` | Modelo do veículo |

### Imagem

| Variável | Uso no AxTon |
|----------|--------------|
| `{{image}}` | Imagem base64 da passagem |
| `{{imageList}}` | Lista de imagens (múltiplas exposições) |
| `{{imageRaw}}` | Bytes brutos — usar isolado no campo |

### Timestamp

| Variável | Descrição |
|----------|-----------|
| `{{utcYear}}`, `{{utcMonth}}`, `{{utcDay}}` | Data UTC |
| `{{utcHours}}`, `{{utcMinutes}}`, `{{utcSeconds}}` | Hora UTC |
| `{{localYear}}`, `{{localMonth}}`, `{{localDay}}` | Data local |
| `{{localHours}}`, `{{localMinutes}}`, `{{localSeconds}}` | Hora local |

### Localização

| Variável | Descrição |
|----------|-----------|
| `{{latitude}}` | Latitude do equipamento (graus decimais) |
| `{{longitude}}` | Longitude do equipamento (graus decimais) |
| `{{gpsHdop}}` | Precisão do GPS (menor = melhor) |

---

## Mapeamento no AxTon

| Variável VARCO | Campo no AxTon | Tabela |
|----------------|----------------|--------|
| `{{cameraId}}` | Equipamento | `TBEquipamentos` |
| `{{lane}}` | Posto/Faixa | `TBPostos` |
| `{{plate}}` | Placa do Veículo | `TBPesagens` |
| `{{plateProbability}}` | Confiança OCR | `TBPassagens` |
| `{{vehicleType}}` | Tipo do Veículo | `TBVeiculos` |
| `{{vehicleBrand}}` | Marca | `TBVeiculos` |
| `{{vehicleColor}}` | Cor | `TBVeiculos` |
| `{{vehicleModel}}` | Modelo | `TBVeiculos` |
| `{{image}}` | Imagem da pesagem | `TBImagens` |
| Timestamp UTC | Data/hora da pesagem | `TBPesagens` |

---

## Fluxo de integração VARCO → AxTon

```
Veículo chega ao posto
        ↓
Câmera VARCO detecta a placa
        ↓
VARCO envia payload com variáveis preenchidas
        ↓
AxTon recebe e processa:
  - Cria passagem (plate, lane, timestamp)
  - Consulta RENAVAM com a placa
  - Vincula dados do veículo (brand, color, type)
  - Inicia processo de pesagem
        ↓
Balan ça registra o peso
        ↓
Sistema compara peso x PBT da classificação
        ↓
Ticket gerado (Regular ou Infrator)
```

---

## Qualidade do reconhecimento OCR

Use `{{plateProbability}}` para monitorar a qualidade das leituras:

| Probabilidade média | Status | Ação recomendada |
|--------------------|:------:|-----------------|
| ≥ 95% | Excelente | Nenhuma |
| 85–94% | Normal | Monitorar |
| 70–84% | Atenção | Verificar limpeza da câmera |
| < 70% | Crítico | Manutenção técnica urgente |

---

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Placa não identificada | Baixa iluminação ou oclusão | Ajustar posicionamento da câmera |
| Caracteres incorretos | Probabilidade baixa | Calibrar o modelo OCR do VARCO |
| Veículo sem marca/modelo | Módulo de características desabilitado | Habilitar no firmware do VARCO |
| Timestamp incorreto | Fuso horário errado | Usar variáveis `utc*` |

## Integração com outros módulos

| Módulo AxTon | Como usa as variáveis VARCO |
|-------------|----------------------------|
| **Pesagem** | `plate` + `lane` + timestamp iniciam o ticket |
| **Classificação** | `vehicleType` determina o PBT aplicável |
| **Triagem** | `plateProbability` + `image` para validação |
| **Relatório de Infrações** | Dados do veículo (`brand`, `color`, `model`) |
| **Medições** | `cameraId` vincula dados ao equipamento contratual |

## Perguntas frequentes

**O VARCO envia o peso diretamente?**
Não. O VARCO envia apenas dados visuais (placa, imagem, veículo). O peso é medido pela balança conectada ao AxTon.

**Como o AxTon identifica o posto a partir dos dados VARCO?**
O `{{cameraId}}` é mapeado ao equipamento cadastrado. O equipamento está vinculado ao posto.

**A variável `{{vehicleType}}` é suficiente para determinar o PBT?**
É um dado auxiliar. O sistema usa a **classificação de eixos** e a pesagem para determinar o PBT aplicável legalmente.

## Relacionado

- [Equipamentos](../cadastros-basicos/equipamentos) — Cadastro dos equipamentos VARCO
- [Postos de Pesagem](../pesagem/postos) — Onde os equipamentos são instalados
- [Tipos de Veículos](../veiculos/tipos-veiculos) — Correspondência com `vehicleType`
- [Classificações de Veículos](../veiculos/classificacoes-veiculos) — PBT por categoria
