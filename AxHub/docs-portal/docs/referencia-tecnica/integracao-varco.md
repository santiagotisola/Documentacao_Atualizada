---
sidebar_position: 5
title: Integração VARCO — Variáveis de Template
description: Referência completa das variáveis disponíveis no template de integração VARCO para câmeras OCR/LPR no AxHub
---

# Integração VARCO — Variáveis de Template

O **VARCO** é o sistema OCR/LPR das câmeras de fiscalização eletrônica integradas ao AxHub. Ao capturar uma passagem, o equipamento VARCO envia os dados ao AxHub usando um **modelo de conteúdo (template)** com variáveis dinâmicas que são substituídas pelos valores reais de cada evento.

:::info
Este documento detalha todas as variáveis disponíveis no template de integração VARCO. Use-as ao configurar webhooks, layouts de importação ou integrações customizadas.
:::

---

## Variáveis de Identificação do Equipamento

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `{{cameraId}}` | String | Nome do equipamento cadastrado no VARCO |
| `{{equipmentId}}` | String | Endereço MAC do equipamento — identificador único de hardware |
| `{{registerId}}` | String | Identificador único do registro atual (passagem) |
| `{{lane}}` | Integer | Número da faixa onde a placa foi detectada |

---

## Variáveis de Localização

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `{{latitude}}` | Decimal | Coordenada geográfica do equipamento (graus decimais) |
| `{{longitude}}` | Decimal | Coordenada geográfica do equipamento (graus decimais) |
| `{{gpsHdop}}` | Decimal | Diluição da precisão horizontal do GPS (quanto menor, mais preciso) |

**Exemplo de localização:**
```
latitude: -15.7801
longitude: -47.9292
gpsHdop: 1.2
```

---

## Variáveis de Data e Hora

### Horário Local (fuso horário configurado no equipamento)

| Variável | Formato | Descrição |
|----------|:-------:|-----------|
| `{{localYear}}` | `YYYY` | Ano |
| `{{localMonth}}` | `MM` | Mês (01-12) |
| `{{localDay}}` | `DD` | Dia (01-31) |
| `{{localHours}}` | `HH` | Horas (00-23) |
| `{{localMinutes}}` | `MM` | Minutos (00-59) |
| `{{localSeconds}}` | `SS` | Segundos (00-59) |
| `{{localMilliseconds}}` | `mmm` | Milissegundos (000-999) |

### Horário UTC

| Variável | Formato | Descrição |
|----------|:-------:|-----------|
| `{{utcYear}}` | `YYYY` | Ano UTC |
| `{{utcMonth}}` | `MM` | Mês UTC |
| `{{utcDay}}` | `DD` | Dia UTC |
| `{{utcHours}}` | `HH` | Horas UTC |
| `{{utcMinutes}}` | `MM` | Minutos UTC |
| `{{utcSeconds}}` | `SS` | Segundos UTC |
| `{{utcMilliseconds}}` | `mmm` | Milissegundos UTC |

**Exemplo de timestamp completo:**
```
{{localYear}}-{{localMonth}}-{{localDay}}T{{localHours}}:{{localMinutes}}:{{localSeconds}}.{{localMilliseconds}}
→ 2026-07-31T14:35:22.847
```

---

## Variáveis de Reconhecimento de Placa

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `{{plate}}` | String | Caracteres da placa detectada (ex: `ABC1D23`) |
| `{{plateBoundingBox}}` | String | Coordenadas da placa na imagem — formato `"x,y,w,h"` |
| `{{plateBoundingBoxPointsStr}}` | String | Coordenadas da placa como polígono — formato `"x0,y0;x1,y1;x2,y2;x3,y3"` |
| `{{plateCountryCode}}` | String | Código do país conforme ISO 3166-1 (ex: `BR`) |
| `{{plateIsMotorcycle}}` | Boolean | `true` se a placa segue formato de motocicleta |
| `{{plateProbability}}` | String | Confiança de cada caractere, separadas por vírgula (ex: `99,98,97,99,99,98`) |
| `{{plateTextColor}}` | Integer | Cor do texto: `0` = preto sobre branco; `1` = branco sobre preto |

:::tip
Use `{{plateProbability}}` para filtrar placas com baixa confiança. Caracteres com probabilidade < 85% indicam possível leitura incorreta.
:::

---

## Variáveis de Imagem

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `{{image}}` | Base64 | JPEG da captura codificado em base64. Aceita prefixo data URL: `data:image/jpeg;base64,{{image}}` |
| `{{imageList}}` | JSON Array | Lista de JPEGs (base64) de cada exposição. Não precisa de colchetes no template |
| `{{imageRaw}}` | Raw bytes | JPEG em bytes brutos. **Uso especial:** o conteúdo deve ser exatamente `{{imageRaw}}` |
| `{{imageRawList}}` | Raw bytes | Lista de JPEGs em bytes brutos para formulários multipart. Conteúdo deve ser exatamente `{{imageRawList}}` |

:::warning Variáveis Raw
`{{imageRaw}}` e `{{imageRawList}}` são tratadas de forma especial. O campo de conteúdo deve conter **apenas** essa variável — qualquer texto adicional gerará JSON inválido.

Use `{{imageRawList}}` em formulários multipart para enviar múltiplas exposições como arquivos separados.
:::

---

## Variáveis do Veículo

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `{{vehicleBoundingBox}}` | String | Coordenadas do veículo na imagem — formato `"x,y,w,h"` |
| `{{vehicleType}}` | String | Tipo do veículo detectado (ex: `car`, `truck`, `motorcycle`) |
| `{{vehicleTypeProbability}}` | Decimal | Confiança do tipo detectado (0.0 a 1.0) |
| `{{vehicleBrand}}` | String | Marca do veículo detectado |
| `{{vehicleBrandProbability}}` | Decimal | Confiança da marca detectada |
| `{{vehicleColor}}` | String | Cor do veículo detectado |
| `{{vehicleColorProbability}}` | Decimal | Confiança da cor detectada |
| `{{vehicleModel}}` | String | Modelo do veículo detectado |
| `{{vehicleModelProbability}}` | Decimal | Confiança do modelo detectado |

:::info Disponibilidade
As variáveis `vehicleBrand`, `vehicleColor`, `vehicleModel` e suas probabilidades são opcionais e disponíveis apenas quando o módulo de **características de veículo** está habilitado no equipamento.
:::

---

## Variável de Lista de Reconhecimentos

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `{{recognitionList}}` | JSON Array | Lista completa de todos os reconhecimentos da passagem |

### Estrutura de `recognitionList`

Cada elemento da lista contém:

```json
{
  "imageIndex": 0,
  "lane": 1,
  "plateInfo": {
    "plate": "ABC1D23",
    "plateBoundingBox": "120,200,180,40",
    "plateCountryCode": "BR",
    "plateIsMotorcycle": false,
    "plateProbability": "99,98,97,99,99,98",
    "plateTextColor": 0
  },
  "vehicleInfo": {
    "vehicleBoundingBox": "50,80,400,300",
    "vehicleType": "truck",
    "vehicleTypeProbability": 0.97,
    "vehicleBrand": "MERCEDES-BENZ",
    "vehicleBrandProbability": 0.89,
    "vehicleColor": "Branco",
    "vehicleColorProbability": 0.94,
    "vehicleModel": "Actros",
    "vehicleModelProbability": 0.81
  }
}
```

:::tip
`recognitionList` não precisa de colchetes no template. Ela é serializada automaticamente como array JSON.
:::

---

## Exemplo de Template Completo

Exemplo de payload JSON enviado pelo VARCO ao AxHub:

```json
{
  "camera": "{{cameraId}}",
  "mac": "{{equipmentId}}",
  "lane": {{lane}},
  "timestamp": "{{utcYear}}-{{utcMonth}}-{{utcDay}}T{{utcHours}}:{{utcMinutes}}:{{utcSeconds}}Z",
  "plate": "{{plate}}",
  "plateConfidence": "{{plateProbability}}",
  "country": "{{plateCountryCode}}",
  "isMoto": {{plateIsMotorcycle}},
  "vehicleType": "{{vehicleType}}",
  "vehicleBrand": "{{vehicleBrand}}",
  "vehicleColor": "{{vehicleColor}}",
  "lat": {{latitude}},
  "lon": {{longitude}},
  "image": "data:image/jpeg;base64,{{image}}"
}
```

---

## Mapeamento no AxHub

| Variável VARCO | Campo no AxHub | Tabela |
|----------------|----------------|--------|
| `{{cameraId}}` | Equipamento | `TBEquipamentos` |
| `{{lane}}` | Faixa | `TBFaixas` |
| `{{plate}}` | Placa do Veículo | `TBPassagens` |
| `{{plateCountryCode}}` | País da Placa | `TBPassagens` |
| `{{vehicleType}}` | Tipo de Veículo | `TBVeiculos` |
| `{{vehicleBrand}}` | Marca | `TBVeiculos` |
| `{{vehicleColor}}` | Cor | `TBVeiculos` |
| `{{vehicleModel}}` | Modelo | `TBVeiculos` |
| `{{utcYear}}...{{utcSeconds}}` | Data/Hora UTC | `TBPassagens` |
| `{{image}}` | Imagem Base64 | `TBImagens` |

---

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| JSON inválido na importação | `{{imageRaw}}` com texto ao redor | Isolar em campo exclusivo |
| Placa com caracteres errados | Probabilidade baixa | Filtrar `plateProbability` < 85 |
| Timestamp incorreto | Fuso horário errado no equip. | Usar variáveis `utc*` |
| Coordenadas zeradas | GPS sem sinal | Verificar sinal GPS do equipamento |
| Marca/Cor ausentes | Módulo de veículos desabilitado | Habilitar nas configurações do VARCO |

## Integração com outros módulos

| Módulo | Como usa as variáveis VARCO |
|--------|----------------------------|
| **Passagens** | `plate`, `lane`, timestamp, `image` |
| **Triagem** | `plateProbability`, `image`, `vehicleType` |
| **Lote de Exportação** | `plate`, `plateCountryCode`, timestamp |
| **Consulta de Veículos** | `vehicleBrand`, `vehicleColor`, `vehicleModel` |
| **Webhooks** | Reencaminha payload VARCO para sistemas externos |

## Perguntas frequentes

**O VARCO envia os dados em tempo real ou em lote?**
Por padrão, envia em tempo real (passagem a passagem). Configurações de lote são possíveis para conexões instáveis.

**Posso usar `{{imageList}}` e `{{image}}` juntos?**
Sim. `{{image}}` retorna apenas a primeira exposição; `{{imageList}}` retorna todas.

**Como validar a assinatura HMAC do payload VARCO?**
Calcule o HMAC-SHA256 do corpo do request usando o segredo configurado no webhook e compare com o header `X-Signature`.

## Relacionado

- [Webhooks](../administracao/webhooks) — Configuração de endpoints de integração
- [Consulta Automática de Veículos](./consulta-automatica-veiculos) — Como o AxHub processa os dados recebidos
- [Banco de Dados](./banco-de-dados) — Estrutura das tabelas que armazenam os dados VARCO
- [Layouts de Arquivos](../administracao/layouts-arquivos) — Mapeamento de campos de importação
- [Tipos de Imagens](../administracao/tipos-imagens) — Categorias de imagens recebidas pelo VARCO
