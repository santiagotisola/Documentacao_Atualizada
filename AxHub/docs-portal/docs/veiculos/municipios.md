---
sidebar_position: 8
title: Municípios
description: Cadastro de municípios utilizados nas operações e infrações do AxHub
---

# Municípios

Cadastro dos municípios utilizados no sistema para **classificação geográfica** das operações, faixas e infrações.

![Lista de Municípios](../img/Veículos%20-%20Municípios.png)

## Como acessar

**Menu lateral** → Veículos → **Municípios**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do município |
| **Código IBGE** | Sim | Código do IBGE (7 dígitos) |
| **UF** | Sim | Unidade Federativa |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Municípios**
2. Clique em **+ Novo**
3. Informe o **Nome**, **Código IBGE** e **UF**
4. Clique em **Salvar**

:::tip
O código IBGE de 7 dígitos é obrigatório nos arquivos de exportação de infrações ao DENATRAN/SENATRAN.
:::

## Base de municípios

O sistema já inclui todos os municípios brasileiros com códigos IBGE. Adicione entradas personalizadas apenas para subdivisões não listadas ou localidades estrangeiras.

## Impacto na exportação

O código IBGE do município aparece obrigatoriamente nos campos:
- **Arquivo de notificação DENATRAN** — identifica o local da infração
- **Lote de exportação** — requerido pelo órgão autuador
- **Boletim de medição** — localização dos postos

:::warning
Código IBGE incorreto causa rejeição do lote pelo órgão. Sempre verifique no site oficial do IBGE antes de cadastrar.
:::
## Relacionado

- [Faixas](../operacoes/faixas)
- [Tipos de Veículos](./tipos-veiculos)

O sistema já vem com uma base pré-carregada dos municípios brasileiros com código IBGE. Adicione novas entradas apenas se a localidade não constar na lista ou se for necessária uma subdivisão personalizada.

:::tip
O código IBGE é obrigatório nos arquivos de exportação de infrações. Certifique-se de usar o código correto para o município do equipamento.
:::

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Lote rejeitado por código IBGE inválido | Código com 6 dígitos ao invés de 7 | Verificar e corrigir pelo portal oficial do IBGE |
| Município não encontrado na busca | Nome cadastrado diferente do oficial | Padronizar o nome conforme o portal do IBGE |
| Infração sem município | Faixa sem município vinculado | Verificar o cadastro da faixa e vincular o município correto |


## Cadastro

![Cadastro de Município](../img/Veículos%20-%20Municípios%20-%20cadastro.png)

| Campo | Descrição |
|-------|-----------|
| **Código IBGE** | Código oficial do município |
| **Nome** | Nome do município |
| **UF** | Estado |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Regioes](../administracao/regioes) | Regioes administrativas |

## Boas práticas

- Sempre utilize o código IBGE de **7 dígitos** — o código de 6 dígitos sem o dígito verificador causa rejeição nos arquivos SENATRAN
- Consulte o portal IBGE (ibge.gov.br/cidades) para confirmar o código oficial antes de cadastrar
- Não duplique municípios — use a busca antes de criar; duplicidades causam inconsistência nos relatórios regionais
- A base pré-carregada do sistema cobre todos os municípios brasileiros; adicione entradas personalizadas apenas para localidades não reconhecidas pelo IBGE

## Perguntas frequentes

**O lote foi rejeitado por código IBGE inválido. Como corrigir?**
Verifique o código no portal oficial do IBGE (ibge.gov.br/cidades) e corrija no cadastro do município. O código deve ter 7 dígitos incluindo o dígito verificador.

**Preciso cadastrar municípios manualmente ou o sistema já tem todos?**
O sistema inclui todos os municípios brasileiros com código IBGE. Cadastre manualmente apenas subdivisões ou localidades não reconhecidas pelo IBGE.

**A faixa não encontra o município no cadastro. O que fazer?**
Verifique se o município está ativo e se o nome está grafado corretamente. Se necessário, use o código IBGE para localizar o registro.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Faixas](../operacoes/faixas)** | Cada faixa deve ser vinculada a um município para que as infrações geradas tragam a localização geográfica correta |
| **[Regiões](../administracao/regioes)** | As regiões agrupam municípios para filtros de relatórios e controle de operações por área geográfica |
| **[Infrações — Consulta](../infracoes/consulta-infracoes)** | O município é um dos filtros disponíveis na busca de infrações e nos relatórios exportados |
| **[Exportação de Infrações](../infracoes/exportacao)** | O código IBGE do município é obrigatório em diversos layouts de exportação ao SENATRAN/DETRAN |

## Exemplo prático

**Cenário**: Um novo equipamento é instalado na cidade de **Itabirito/MG**. Ao tentar vincular a faixa ao município, o operador não encontra "Itabirito" na lista (o sistema exibia "Itabirito" com o código IBGE errado de 6 dígitos).

**Configuração**:

1. Acesse o portal IBGE (ibge.gov.br/cidades) e confirme: código correto de Itabirito/MG é **3132107** (7 dígitos)
2. Acesse **Veículos → Municípios** e localize o registro com código incorreto
3. Edite o registro: corrija **Código IBGE** para `3132107` e **UF** para `MG`
4. Clique em **Salvar**
5. Vincule a faixa ao município corrigido

**Resultado**: As infrações geradas nessa faixa passam a conter o código IBGE correto no arquivo de exportação, eliminando a rejeição pelo DETRAN-MG.
