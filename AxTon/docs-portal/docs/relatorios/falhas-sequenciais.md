---
sidebar_position: 10
title: Falhas de Sequenciais
description: Detecção de lacunas ou duplicações na numeração sequencial de infrações no AxTon
---

# Falhas de Sequenciais

![Sequencial de Exportação](../img/sequencial%20de%20exportacao.png)

Identifica **lacunas ou duplicações** na numeração sequencial de infrações, garantindo a integridade dos registros antes da exportação ao órgão autuador.

## Como acessar

**Menu lateral** → Relatórios → **Falhas de Sequenciais**

## Por que é importante

O DENATRAN/SENATRAN exige numeração sequencial contínua nos lotes de exportação. Lacunas podem causar rejeição do lote e comprometer a validade legal das infrações.

## Tipos de falha detectadas

| Tipo | Descrição | Ação recomendada |
|------|-----------|------------------|
| **Lacuna** | Número pulado na sequência | Verificar se houve descarte |
| **Duplicidade** | Mesmo número em duas infrações | Corrigir antes de exportar |
| **Fora de ordem** | Sequência com salto inesperado | Auditar o lote |

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim da análise |
| **Equipamento** | Filtrar por equipamento específico |
| **Tipo de falha** | Lacuna, duplicidade ou ambos |

## Passo a passo

1. Acesse **Relatórios → Falhas de Sequenciais**
2. Selecione o **Período** a analisar
3. Clique em **Verificar**
4. O sistema lista as falhas encontradas
5. Corrija cada falha antes de exportar o lote

:::warning
Não exporte um lote com falhas sequenciais identificadas. O órgão autuador pode rejeitar o lote inteiro, exigindo reenvio de todas as infrações.
:::

## Relacionado

- [Sequenciais de Infrações](../administracao/sequenciais-infracoes)
- [Relatório de Infrações](./relatorio-infracoes)

3. Opcionalmente filtre por **Equipamento**
4. Clique em **Consultar**
5. Para cada falha encontrada, verifique a causa e corrija antes de exportar

:::warning Antes de exportar
Sempre execute este relatório antes de gerar um novo lote de exportação. Falhas não corrigidas causam rejeição pelo órgão autuador.
:::

## Casos de uso

- **Pré-exportação**: executar antes de gerar cada novo lote para garantir a integridade sequencial exigida pelo DENATRAN/SENATRAN
- **Auditoria interna**: identificar descarte não documentado de infrações que causam lacunas na sequência
- **Diagnóstico de falha técnica**: detectar falhas de comunicação entre balanca e servidor que causaram números duplicados
- **Comprovação de integridade**: documentar a ausência de gaps para fins de auditoria contratual

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Sequencial** | Número esperado |
| **Status** | Presente ou Ausente |
| **Data** | Data esperada |
| **Observação** | Detalhes da falha |

### Filtros disponíveis

- Período (data inicial e final)
- Posto de pesagem
- Exportar para Excel/PDF
