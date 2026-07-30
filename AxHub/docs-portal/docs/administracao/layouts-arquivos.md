---
sidebar_position: 8
title: Layouts de Arquivos
description: Configuração dos layouts de importação e exportação de dados no AxHub
---

# Layouts de Arquivos

Define o **formato dos arquivos** utilizados para importação de dados e exportação de infrações para órgãos externos (DETRAN, SENATRAN, Prefeituras).

## Como acessar

**Menu lateral** → Configurações → **Layouts de Arquivos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Identificação do layout |
| **Tipo** | Sim | Importação ou Exportação |
| **Formato** | Sim | CSV, TXT, XML, JSON |
| **Separador** | Cond. | Separador de campos (CSV) |
| **Campos** | Sim | Mapeamento de colunas/campos |

## Tipos de layout

| Tipo | Descrição |
|------|-----------|
| **Exportação DETRAN** | Formato para envio ao DETRAN estadual |
| **Exportação SENATRAN** | Formato federal para notificação |
| **Importação RENAVAM** | Dados do veículo da consulta RENAVAM |

## Passo a passo

1. Acesse **Configurações → Layouts de Arquivos**
2. Clique em **+ Novo**
3. Selecione o **Tipo** (Importação ou Exportação)
4. Defina o **Formato** e o **Separador**
5. Configure o **Mapeamento de campos**
6. Clique em **Salvar**

:::warning
Alterações em layouts de exportação ativos podem causar rejeição de lotes pelo órgão autuador. Testar antes em ambiente de homologação.
:::

## Boas práticas

- Teste qualquer alteração em ambiente de homologação antes de ativar em produção — erros de formato causam rejeição do lote
- Nunca altere um layout ativo sem alinhar com o órgão autuador; mudanças não comunicadas causam rejeição silenciosa
- Documente a versão e a data de cada alteração no campo Descrição para facilitar suporte e auditoria
- Mantenha cópia das especificações técnicas do órgão autuador arquivada como referência para cada layout

## Relacionado

- [Lotes de Exportação](../glossario/lote-exportacao)
- [Sequenciais de Infrações](./sequenciais-infracoes)
- [Sequenciais de Lote](./sequenciais-lote-exportacao)

## Exemplos de campos mapeados

### Exportação DETRAN (CSV)

| Campo no sistema | Coluna no arquivo | Obrigatório |
|-----------------|:-----------------:|:-----------:|
| Número Auto | `nro_auto` | Sim |
| Placa | `placa_veiculo` | Sim |
| Data/Hora | `data_infracao` | Sim |
| Enquadramento | `cod_enquadramento` | Sim |
| Velocidade medida | `vel_medida` | Sim |
| Velocidade permitida | `vel_permitida` | Sim |
| Forma de autuação | `forma_autuacao` | Sim |

## Tabela de referência — formatos de arquivo

| Formato | Separador padrão | Encoding | Uso típico |
|---------|:----------------:|:--------:|------------|
| CSV | `;` | UTF-8 | DETRAN estadual |
| TXT posicional | N/A | ISO-8859-1 | SENATRAN |
| XML | N/A | UTF-8 | Sistemas ERP |
| JSON | N/A | UTF-8 | APIs modernas |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Lote rejeitado por campo inválido | Mapeamento incorreto | Conferir spec do órgão e reconfigurar |
| Caracteres especiais corrompidos | Encoding errado | Ajustar para ISO-8859-1 se exigido |
| Arquivo gerado vazio | Nenhuma infração no período | Verificar filtros da exportação |

| **Importação veículos** | Carga de dados de veículos |
| **Importação placas** | Lista de placas para equipamentos |

:::caution
O layout de exportação deve seguir rigorosamente as especificações do órgão autuador. Erros causam rejeição do lote.
:::

| **Formato** | CSV, TXT, XML |
| **Delimitador** | Caractere separador de campos |
| **Encoding** | Codificação do arquivo (UTF-8, ISO-8859-1) |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Exportacao](../infracoes/exportacao) | Exportacao usa o layout |
| Glossario | [Lote de Exportacao](../glossario/lote-exportacao) | Definicao |
