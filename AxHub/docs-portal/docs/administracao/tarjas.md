---
sidebar_position: 13
title: Tarjas
description: Configuração de tarjas e templates para imagens de infrações
---

# Tarjas

Permite configurar as tarjas aplicadas nas imagens de infrações. Existem dois tipos principais de tarjas no sistema:

1. **Tarjas de Proteção de Dados:** Para anonimização (placas, rostos)
2. **Tarjas de Informação:** Templates com dados da infração e equipamento

## Como acessar

**Menu lateral** → Configurações → **Tarjas**

## Campos da Tela

| Campo | Descrição |
|-------|-----------|
| **Nome** | Identificação da tarja (ex: "Tarja Axion", "Tarja Anonimização") |
| **Tipo** | Tipo da tarja (informação, proteção de placa, rosto, etc.) |
| **Template** | Layout com variáveis para tarjas de informação |
| **Posição** | Coordenadas de aplicação na imagem |
| **Ativo** | Status do registro |

:::note Sem screenshot
Esta tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

## Templates de Tarja

Templates são modelos que definem **quais informações** aparecem na tarja e **como são formatadas**.

### Variáveis Disponíveis

Os templates utilizam **variáveis entre chaves** que são automaticamente substituídas por valores reais ao gerar a infração:

| Categoria | Variáveis |
|-----------|-----------|
| **Equipamento** | `{CodigoEquipamento}` `{SerialEquipamento}` `{MarcaModeloEquipamento}` |
| **Localização** | `{CodigoLocalOperacaoEquipamento}` `{NumeroFaixa}` `{SentidoFaixa}` |
| **Aferição** | `{DataAfericaoInmetro}` `{DataVencimentoAfericao}` `{CertificadoEquipamento}` `{NumeroCertificadoInmetro}` |
| **Portaria** | `{PortariaEquipamento}` `{PortariaNaoMetrologico}` |
| **Infração** | `{DataPassagemInfracao}` `{CodigoEnquadramento}` `{DescricaoEnquadramento}` |
| **Órgão** | `{CodigoOrgaoAutuador}` |

### Exemplo de Template

```
Cód. Equipamento : {CodigoEquipamento}
Endereço : {CodigoLocalOperacaoEquipamento}
Faixa : {NumeroFaixa}        Sentido : {SentidoFaixa}
Data : {DataPassagemInfracao}
─────────────────────────────────────────────────────
Data aferição : {DataAfericaoInmetro}
Data venc. aferição : {DataVencimentoAfericao}
Certif. : {CertificadoEquipamento}
Portaria : {PortariaEquipamento}
─────────────────────────────────────────────────────
Marca/Modelo : {MarcaModeloEquipamento}
Infração : {CodigoEnquadramento}
Descrição : {DescricaoEnquadramento}
Serial : {SerialEquipamento}
```

## Como Alterar Informações da Tarja

As informações exibidas na tarja vêm de **diferentes cadastros** do sistema. Para alterar o que aparece na tarja impressa, você precisa atualizar os cadastros correspondentes.

:::tip Guia Completo Disponível
Para um **guia detalhado passo a passo** sobre como alterar cada informação que aparece na tarja (portaria, endereço, marca/modelo, aferições, etc.), consulte:

👉 **[Configuração de Dados da Tarja](./configuracao-dados-tarja)**

Este guia explica:
- Onde alterar cada campo da tarja
- Como atualizar portaria INMETRO
- Como corrigir informações de aferição
- Passo a passo ilustrado para cada operação
- Perguntas frequentes e troubleshooting
:::

### Referência Rápida

| Informação | Onde Alterar |
|-----------|--------------|
| Portaria INMETRO | Equipamentos → Modelos de Equipamentos |
| Endereço | Operações → Operações |
| Marca/Modelo | Equipamentos → Modelos de Equipamentos |
| Faixa/Sentido | Equipamentos → Equipamentos → Aba Faixas |
| Aferição (datas) | Operações → Aferições |
| Serial/Código | Equipamentos → Equipamentos |
| Enquadramento | Configurações → Enquadramentos |

## Passo a passo — Criar Nova Tarja

1. Na listagem, clique em **+ Novo**
2. Informe o **Nome** identificador da tarja
3. Selecione o **Tipo** de tarja
4. Se for tarja de informação, preencha o campo **Template** usando as variáveis disponíveis
5. Configure a **Posição** onde a tarja será aplicada na imagem
6. Marque como **Ativo**
7. Clique em **Salvar**

## Passo a passo — Editar Template Existente

1. Na listagem, localize a tarja desejada
2. Clique em **Editar** (ícone de lápis)
3. Altere o campo **Template**
   - Use as variáveis entre chaves listadas acima
   - Mantenha a formatação e espaçamentos desejados
4. Clique em **Salvar**
5. Teste gerando uma nova infração

:::warning Importante
Alterações no template afetam apenas **novas infrações**.  
Infrações já geradas permanecem com o template anterior.
:::

## Múltiplas Tarjas

O sistema permite criar várias tarjas diferentes para diferentes finalidades:

- **Por tipo de infração:** Velocidade, avanço de sinal, conversão proibida
- **Por tipo de equipamento:** Radar, OCR, Lombada eletrônica
- **Por produto:** AxHub, AxTon (pesagem), AxCross (monitoramento)
- **Variações:** Tarja completa, tarja simplificada

Para configurar qual tarja usar:
- Por enquadramento: Configurações → Enquadramentos → Campo "Tarja Padrão"
- Por equipamento: Equipamentos → Equipamentos → Campo "Template de Tarja"

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Guia | [Configuração de Dados da Tarja](./configuracao-dados-tarja) | Como alterar informações exibidas |
| Relacionado | [Modelos de Equipamentos](../cadastros-basicos/modelos-equipamentos) | Portaria INMETRO |
| Relacionado | [Enquadramentos](./enquadramentos) | Código e descrição |
| Relacionado | [Triagem](../infracoes/triagem) | Tarja aplicada na imagem |
| Relacionado | [Exportacao](../infracoes/exportacao) | Imagem exportada com tarja |
