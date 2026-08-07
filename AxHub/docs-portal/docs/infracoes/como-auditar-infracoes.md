---
sidebar_position: 4
title: "Como Auditar Infrações"
description: Guia completo de auditoria de infrações no AxHub
---

# Como Auditar Infrações

Guia passo a passo para o processo de **auditoria de infrações** no AxHub — etapa posterior à triagem, onde um supervisor ou auditor revisa e aprova as infrações antes da exportação ao órgão autuador.

## Quando auditar

A auditoria é necessária quando:
- A operação exige **dupla validação** (triagem + auditoria)
- O contrato prevê controle de qualidade mínimo (ex: 10% de amostragem)
- Infrações foram devolvidas da triagem para reavaliação

## Como acessar

**Menu lateral** → Infrações → **Auditoria**

![Auditoria de Infrações](../img/triagem-filtro-auditoria.png)

## Passo a passo

### 1. Filtrar o período

Selecione o **Período**, **Equipamento** e **Analista** que deseja auditar. Defina a **Amostragem (%)** desejada.

### 2. Iniciar a auditoria

Clique em **Iniciar Auditoria**. O sistema apresentará as infrações uma a uma com imagens e dados completos.

### 3. Analisar cada infração

Verifique:
- **Placa**: OCR correto e legível
- **Enquadramento**: artigo CTB adequado ao evento
- **Velocidade**: coerente com o limite da via
- **Imagens**: qualidade suficiente para suportar o auto

### 4. Tomar a decisão

| Decisão | Quando usar |
|---------|-------------|
| ✅ **Confirmar** | Infração válida — segue para exportação |
| ❌ **Rejeitar** | Erro encontrado — devolve ao triador com observação |
| 📝 **Observar** | Registra comentário sem alterar o status |

## Boas práticas

- Auditar no mínimo **10% das infrações** por equipamento por turno
- Documentar o motivo de rejeição para retroalimentação da equipe
- Infrações rejeitadas devem ser revisadas pelo triador original

:::warning
Infrações confirmadas na auditoria não podem ser alteradas posteriormente sem reabertura manual com justificativa registrada.
:::

## Relacionado

- [Auditoria](./auditoria) — Tela de auditoria detalhada
- [Triagem](../glossario/triagem) — Etapa anterior
- [Infrações Descartadas](./infracoes-descartadas) — Histórico de descartes
- [Processamento por Usuário](../relatorios/processamento-por-usuario) — Métricas por analista

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Infração não encontrada na auditoria | Status diferente de Triada | Verificar filtros de status |
| Não consigo confirmar | Sem permissão de auditoria | Solicitar ao administrador |
| Imagens não carregam | Conexão lenta | Recarregar ou usar conexão melhor |

## Integração com outros módulos

| Módulo | Relação |
|--------|---------|
| **Triagem** | Etapa anterior — envia para auditoria |
| **Lote de Exportação** | Recebe infrações auditadas |
| **Processamento por Usuário** | Métricas de auditores |

## Perguntas frequentes

**Com que frequência devo auditar?**
Recomendado 100% das infrações antes da exportação. Para volumes altos, use amostragem mínima de 10%.

**Posso reverter uma confirmação errada?**
Sim, desde que a infração não tenha sido exportada. Rejeite-a com justificativa.

**Quais infrações devem ser rejeitadas obrigatoriamente?**
Imagem ilegível, placa não confirmada, enquadramento incorreto ou ausência de imagens obrigatórias.

## Fluxo decisório

```
Infração aprovada na triagem → entra na fila de auditoria
        │
        ▼
Auditor verifica: placa, velocidade, imagem, enquadramento
        │
        ▼
Todos os critérios atendem aos requisitos legais?
   ├── SIM → CONFIRMAR → segue para exportação
   ├── NÃO → REJEITAR com observação → volta para triagem
   └── DÚCIDA → OBSERVAR e escalar para supervisor
```

:::tip Taxa de amostragem
Para volumes altos, audite no mínimo **10% das infrações** por equipamento por turno. Documente o motivo de rejeição para retroalimentação da equipe.
:::
Este documento foi criado com o **template local** (sem IA generativa).
Revise e complete as se��es marcadas com ?? antes de publicar.
:::

:::info Para quem � este documento?
> ?? _Descreva o p�blico-alvo: analistas, operadores, administradores..._
:::

---

## O que � Como Auditar Infracoes?

> ?? _Explique em 2-3 frases o que este processo/funcionalidade faz e por que � importante._

Benef�cios deste processo:
- ? ?? _Benef�cio 1_
- ? ?? _Benef�cio 2_
- ?? ?? _Requisito ou restri��o importante_

:::warning Aten��o
> ?? _Adicione um alerta sobre responsabilidades ou impactos desta opera��o._
:::

---

## Como Acessar

### Passo 1 - Login

> ?? _Descreva aqui o que o usu�rio deve fazer neste passo._

![Login](../img/Login.png)

### Passo 2 - triagem consultar infracoes

> ?? _Descreva aqui o que o usu�rio deve fazer neste passo._

![triagem consultar infracoes](../img/triagem-consultar-infracoes.png)

### Passo 3 - triagem infracoes descartadas

> ?? _Descreva aqui o que o usu�rio deve fazer neste passo._

![triagem infracoes descartadas](../img/triagem-infracoes-descartadas.png)

### Passo 4 - Relatório Relatório de infra��es

> ?? _Descreva aqui o que o usu�rio deve fazer neste passo._

Relatório Relatório de infra��es](../img/relatório - Use Relatório (com acento) de infra��es.png)


---

## Checklist de Verifica��o

Antes de confirmar qualquer opera��o, verifique:

- [ ] ?? _Item de verifica��o 1_
- [ ] ?? _Item de verifica��o 2_
- [ ] ?? _Item de verifica��o 3_
- [ ] ?? _Item de verifica��o 4_

---

## Crit�rios e Regras

| Situa��o | A��o | Motivo |
|---|---|---|
| ?? _Caso 1_ | ? ?? _A��o_ | ?? _Motivo_ |
| ?? _Caso 2_ | ? ?? _A��o_ | ?? _Motivo_ |
| ?? _Caso 3_ | ?? ?? _A��o_ | ?? _Motivo_ |

---

## Casos Especiais

:::tip Dica
> ?? _Descreva uma situa��o especial comum e como lidar._
:::

:::danger Situa��o Cr�tica
> ?? _Descreva um caso cr�tico que exige aten��o redobrada ou escala��o._
:::

---

## Fluxo do Processo

```
[In�cio]
    ?
[?? Etapa 1]
    ?
[?? Etapa 2]
  ? ?
[? OK] [? Erro]
    ? ?
[?? Resultado OK] [?? A��o de Erro]
```

---

> **Pr�ximos passos:** ?? _Adicione links para p�ginas relacionadas._
