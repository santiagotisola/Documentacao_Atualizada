---
sidebar_position: 5
title: Cores
description: Cadastro de cores de veículos utilizadas nas autuações do AxHub
---

# Cores

Tabela de cores de veículos utilizada na identificação de veículos nas autuações. A cor correta garante que as informações da infração exportada estejam completas e precisas.

![Lista de Cores](../img/Veículos%20-%20cores.png)

## Como acessar

**Menu lateral** → Veículos → **Cores**

## Cadastro

![Cadastro de Cor](../img/Veículos%20-%20cores%20-%20cadastro.png)

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da cor (ex.: Branco, Prata, Preto, Vermelho) |
| **Código** | Não | Código padrão do órgão autuador |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Cores**
2. Clique em **+ Nova**
3. Preencha o **Nome** e o **Código** (se exigido pelo órgão autuador)
4. Clique em **Salvar**

:::tip
As cores são extraídas automaticamente do RENAVAM quando o OCR lê a placa. Mantenha a tabela atualizada para evitar dados em branco nas infrações exportadas.
:::

## Relacionado

- [Marcas de Veículos](./marcas-veiculos)
- [Modelos de Veículos](./modelos-veiculos)

## Tabela DENATRAN de cores

O sistema já inclui as 15 cores padrão do DENATRAN. Adicione apenas cores personalizadas exigidas pelo órgão autuador local.

- [Marcas de Veículos](./marcas-veiculos)
- [Modelos de Veículos](./modelos-veiculos)

3. Informe o **Nome** da cor
4. Opcionalmente informe o **Código**
5. Clique em **Salvar**

:::tip Cores padrão
Verifique com o órgão autuador (DETRAN/DENATRAN) quais códigos de cor são aceitos no arquivo de exportação.
:::

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Marcas](./marcas-veiculos) | Marcas de veículos |
| Relacionado | [Classificações](./classificacoes-veiculos) | Classificações |


| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Nome da cor (ex: Branco, Preto, Prata) |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Consulta de Infracoes](../infracoes/consulta-infracoes) | Filtro por cor |

## Boas práticas

- Mantenha todas as 15 cores padrão DENATRAN cadastradas — lacunas na tabela resultam em campo vazio nos autos exportados
- Confirme com o órgão autuador quais códigos de cor são aceitos no layout de exportação antes de cadastrar cores adicionais
- A cor é extraída automaticamente do RENAVAM na consulta de placa; mantenha a tabela atualizada para evitar inconsistências
- Não exclua cores vinculadas a infrações existentes — inative-as para preservar a integridade do histórico

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Campo cor em branco no auto exportado | Cor não cadastrada ou consulta RENAVAM falhou | Verificar a tabela de cores e preencher manualmente |
| Cor duplicada com código diferente | Cadastro inconsistente com a tabela DENATRAN | Inativar duplicatas e manter apenas a cor com código oficial |
| Código de cor rejeitado na exportação | Código não reconhecido pelo órgão autuador | Confirmar os códigos aceitos no layout do órgão |

## Perguntas frequentes

**O sistema preenche a cor do veículo automaticamente?**
Sim, quando a consulta RENAVAM retorna a cor cadastrada no CRV. Se a cor não estiver na tabela do sistema, o campo ficará em branco e precisará de preenchimento manual.

**Devo cadastrar as 15 cores DENATRAN manualmente?**
Não. O sistema já inclui as cores padrão pré-carregadas. Adicione apenas cores personalizadas exigidas pelo órgão autuador local.

**Posso excluir uma cor que não é mais utilizada?**
Não exclua — inative a cor. Cores vinculadas a infrações históricas precisam ser preservadas para manter a integridade dos registros.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Consulta de Placas](../operacoes/consulta-placas)** | A cor do veículo é preenchida automaticamente via consulta RENAVAM — o cadastro de cores deve estar completo para evitar campos em branco |
| **[Infrações — Triagem](../infracoes/triagem)** | A cor consta nos dados do auto e pode ser corrigida manualmente durante a triagem caso a consulta RENAVAM falhe |
| **[Exportação de Infrações](../infracoes/exportacao)** | Alguns layouts de exportação exigem o código de cor padronizado pelo DENATRAN — confirme o requisito do órgão autuador |
| **[Infrações — Consulta](../infracoes/consulta-infracoes)** | A cor pode ser usada como filtro na busca de infrações para localizar registros de um veículo específico |

## Exemplo prático

**Cenário**: O órgão autuador rejeita o lote porque o campo **cor do veículo** está em branco em 12% das infrações. A análise identifica que a cor "VINHO" não está cadastrada na tabela.

**Configuração**:

1. Acesse **Veículos → Cores**
2. Clique em **+ Nova**
3. Preencha **Nome**: `VINHO` e **Código**: `10` (código DENATRAN para vinho/bordô)
4. Clique em **Salvar**
5. Reprocesse as infrações pendentes em **Infrações → Triagem**, filtrando por "cor em branco"

**Resultado**: As 12% de infrações com cor em branco passam a exibir "VINHO" automaticamente após o reprocessamento, e o lote seguinte é aceito pelo órgão sem rejeição.
