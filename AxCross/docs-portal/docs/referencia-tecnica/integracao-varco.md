---
sidebar_position: 3
title: Integração VARCO — Variáveis de Template
description: Referência das variáveis VARCO para integração com câmeras OCR/LPR no AxCross
---

# Integração VARCO — Variáveis de Template

O **VARCO** é o sistema OCR/LPR das câmeras de monitoramento instaladas nos cruzamentos do AxCross. Cada passagem detectada gera um evento com variáveis dinâmicas que o AxCross processa para registrar a passagem, verificar veículos monitorados e gerar alertas.

:::info
Para a referência completa de todas as variáveis, consulte [AxHub — Integração VARCO](../../AxHub/referencia-tecnica/integracao-varco).
:::

---

## Variáveis utilizadas no AxCross

### Identificação

| Variável | Descrição |
|----------|-----------|
| `{{cameraId}}` | Nome do equipamento — mapeia ao equipamento cadastrado no AxCross |
| `{{equipmentId}}` | MAC address do equipamento |
| `{{lane}}` | Faixa onde a placa foi detectada |
| `{{registerId}}` | ID único da passagem |

### Placa

| Variável | Descrição |
|----------|-----------|
| `{{plate}}` | Placa detectada — usada para consultar a lista de monitorados |
| `{{plateProbability}}` | Confiança por caractere (ex: `99,97,98,99,95,98`) |
| `{{plateCountryCode}}` | País da placa (ISO 3166-1) |
| `{{plateIsMotorcycle}}` | `true` para placa de motocicleta |
| `{{plateBoundingBox}}` | Coordenadas da placa na imagem (`x,y,w,h`) |
| `{{plateTextColor}}` | `0` = texto preto; `1` = texto branco |

### Veículo

| Variável | Descrição |
|----------|-----------|
| `{{vehicleType}}` | Tipo do veículo detectado |
| `{{vehicleTypeProbability}}` | Confiança do tipo (0.0–1.0) |
| `{{vehicleBrand}}` | Marca detectada |
| `{{vehicleBrandProbability}}` | Confiança da marca |
| `{{vehicleColor}}` | Cor detectada |
| `{{vehicleColorProbability}}` | Confiança da cor |
| `{{vehicleModel}}` | Modelo detectado |
| `{{vehicleModelProbability}}` | Confiança do modelo |
| `{{vehicleBoundingBox}}` | Coordenadas do veículo na imagem (`x,y,w,h`) |

### Imagem

| Variável | Descrição |
|----------|-----------|
| `{{image}}` | JPEG base64 da captura |
| `{{imageList}}` | Lista JSON de JPEGs (múltiplas exposições) |
| `{{imageRaw}}` | Bytes brutos — conteúdo deve ser exatamente `{{imageRaw}}` |
| `{{imageRawList}}` | Lista raw para formulários multipart |

### Localização e Tempo

| Variável | Descrição |
|----------|-----------|
| `{{latitude}}` | Latitude do cruzamento |
| `{{longitude}}` | Longitude do cruzamento |
| `{{gpsHdop}}` | Precisão GPS |
| `{{utcYear}}..{{utcSeconds}}` | Timestamp UTC |
| `{{localYear}}..{{localSeconds}}` | Timestamp local |

---

## Fluxo de integração VARCO → AxCross

```
Veículo passa pelo cruzamento monitorado
        ↓
Câmera VARCO captura:
  - Placa ({{plate}})
  - Imagem ({{image}})
  - Tipo de veículo ({{vehicleType}})
  - Faixa ({{lane}})
  - Timestamp
        ↓
AxCross recebe o payload
        ↓
Verifica {{plate}} na lista de Veículos Monitorados
        ↓
        ├─ Placa monitorada → Cria ALERTA automático
        └─ Placa não monitorada → Registra passagem sem alerta
        ↓
Passagem salva no banco (disponível para relatórios)
```

---

## Lógica de geração de alertas

O AxCross usa `{{plate}}` como chave primária para verificar monitoramento:

```
SE plate ∈ TBVeiculosMonitorados
  E Status = Habilitado
  E DataExpiracao > Hoje (ou sem expiração)
ENTÃO gera alerta
```

---

## Qualidade OCR e `{{plateProbability}}`

| Confiança média | Interpretação | Ação |
|----------------|:-------------:|------|
| ≥ 95% | Leitura excelente | Nenhuma |
| 85–94% | Leitura boa | Monitorar |
| 70–84% | Atenção | Verificar câmera |
| < 70% | Crítico | Manutenção urgente |

Passagens com probabilidade muito baixa podem gerar **falsos negativos** (placa monitorada não detectada) ou **falsos positivos** (placa errada gera alerta). O AxCross registra todas as passagens independentemente da probabilidade.

---

## `{{recognitionList}}` — Múltiplos reconhecimentos

Quando uma câmera cobre várias faixas ou captura múltiplas exposições, `{{recognitionList}}` contém todos os reconhecimentos do evento:

```json
[
  {
    "imageIndex": 0,
    "lane": 1,
    "plateInfo": {
      "plate": "ABC1D23",
      "plateProbability": "99,98,97,99,95,98",
      "plateCountryCode": "BR",
      "plateIsMotorcycle": false
    },
    "vehicleInfo": {
      "vehicleType": "car",
      "vehicleTypeProbability": 0.95,
      "vehicleColor": "Prata",
      "vehicleBrand": "VOLKSWAGEN"
    }
  }
]
```

---

## Mapeamento VARCO → AxCross

| Variável VARCO | Campo no AxCross | Tabela |
|----------------|-----------------|--------|
| `{{cameraId}}` | Equipamento | `TBEquipamentos` |
| `{{lane}}` | Faixa | `TBFaixas` |
| `{{plate}}` | Placa da passagem | `TBPassagens` |
| `{{image}}` | Imagem | `TBImagens` |
| `{{vehicleType}}` | Tipo do veículo | `TBPassagens` |
| `{{vehicleBrand}}` | Marca | `TBPassagens` |
| `{{vehicleColor}}` | Cor | `TBPassagens` |
| Timestamp UTC | Data/hora | `TBPassagens` |
| `{{latitude}}` + `{{longitude}}` | Localização | `TBEquipamentos` |

---

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Alerta não gerado para placa monitorada | OCR leu placa incorretamente | Verificar `plateProbability` e câmera |
| Passagem sem imagem | `{{image}}` vazio | Verificar configuração do VARCO |
| Faixa incorreta na passagem | `{{lane}}` mapeado errado | Corrigir mapeamento em Cadastros → Faixas |
| Localização zerada | GPS sem sinal | Verificar antena GPS do equipamento |
| Marca/cor ausentes | Módulo de características desabilitado | Habilitar no VARCO |

## Integração com outros módulos

| Módulo AxCross | Como usa as variáveis VARCO |
|---------------|----------------------------|
| **Passagens** | Todas as variáveis formam o registro |
| **Veículos Monitorados** | `{{plate}}` consulta a lista |
| **Alertas** | Gerado automaticamente se monitorado |
| **Mapeamento de Rotas** | Sequência de `{{plate}}` + localização |
| **Mapa de Bolhas** | Agregação por `{{cameraId}}` |
| **Sincronização** | Dados VARCO são sincronizados com Elasticsearch |

## Perguntas frequentes

**O AxCross registra passagens mesmo sem veículo monitorado?**
Sim. Todas as passagens são registradas. Apenas passagens com placa monitorada geram alerta.

**Como configurar o VARCO para enviar ao AxCross?**
Configure o endpoint do AxCross na integração HTTP do VARCO, usando o template JSON com as variáveis desejadas.

**`{{imageList}}` ou `{{image}}` — qual usar?**
`{{image}}` para a imagem principal da passagem. `{{imageList}}` quando o equipamento captura múltiplas exposições e você quer todas.

## Relacionado

- [Equipamentos](../cadastros/equipamentos) — Cadastro de câmeras VARCO
- [Faixas](../cadastros/faixas) — Mapeamento de `{{lane}}` para faixas
- [Veículos Monitorados](../operacoes/veiculos-monitorados) — Lista consultada via `{{plate}}`
- [Sincronização](../sistema/sincronizacao) — Como os dados chegam ao Elasticsearch
