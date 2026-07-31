---
title: "Autuação"
sidebar_position: 4
description: "O que é autuação no AxHub — processo, base legal e tipos de auto"
---

# Autuação

Ato administrativo pelo qual um agente de trânsito ou equipamento eletrônico **registra formalmente a ocorrência de uma infração**, gerando o Auto de Infração de Trânsito (AIT).

**Base legal:** Art. 280 do CTB — Resolução CONTRAN 619/2016

## Tipos de autuação

| Tipo | Descrição |
|------|-----------|
| **Eletrônica** | Gerada automaticamente por radar/câmera OCR (AxHub) |
| **Pessoal** | Lavrada por agente de trânsito em campo |
| **Mista** | Equipamento identifica + agente confirma |

## Fluxo de autuação eletrônica no AxHub

```
Equipamento captura infração
       ↓
   OCR lê a placa
       ↓
   Triagem pelo operador
       ↓
   Enquadramento confirmado
       ↓
   Inclusão no lote de exportação
       ↓
   Envio ao órgão autuador
```

## Boas práticas

- Confirme o enquadramento automático antes de incluir a autuação no lote de exportação
- Revise autuações com placa duvidosa — uma autuação inválida gera recurso e retrabalho
- Documente ocorrências especiais (veículo em fuga, imagem degradada) nos campos de observação
- Mantenha o prazo de 30 dias da infração à expedição do AIT para garantir validade jurídica

## Relacionado

- [Triagem](./triagem)
- [Enquadramentos](../administracao/enquadramentos)
- [Lote de Exportação](./lote-exportacao)

## Prazos legais

| Etapa | Prazo máximo |
|-------|:------------:|
| Expedição do AIT | 30 dias após a infração |
| Notificação ao infrator | 30 dias após AIT |
| Prazo para recurso | 30 dias após notificação |

**Base:** Art. 281 do CTB

   OCR lê a placa
       ↓
   Triagem (operador valida)
       ↓
   Auditoria (supervisor aprova)
       ↓
   Exportação ao órgão autuador
       ↓
   AIT emitido com validade legal
```

## O que é exigido para validade

- Equipamento com **aferição INMETRO válida**
- Imagem com **placa legível**
- **Enquadramento** correto
- Triagem e auditoria aprovadas

## Relacionados

- [Infração](./infracao) — O que gera o auto

## Erros comuns no processo de autuação

| Erro | Causa | Solução |
|------|-------|----------|
| AIT emitido após 30 dias | Atraso no processamento | Monitorar backlog de triagem diariamente |
| Placa errada no auto | OCR incorreto não corrigido | Revisar placa na triagem antes de confirmar |
| Enquadramento incorreto | Velocidade mál configurada | Verificar configuração de enquadramento |
| Auto sem imagem obrigatória | Tipo de imagem não capturado | Verificar tipos de imagem obrigatórios |

## Tabela de referência — prazos da autuação

| Etapa | Prazo | Base legal | Consequência do descumprimento |
|-------|:-----:|------------|---------------------------------|
| Expedição do AIT | 30 dias | Art. 281 CTB | Auto inválido |
| Notificação ao infrator | 30 dias | Art. 281 CTB | Prescrição |
| Prazo para recurso | 30 dias | Art. 285 CTB | Direito de defesa |
| Arquivamento | 5 anos | Lei 9.873/99 | Prescrição administrativa |
- [Enquadramento](./enquadramento) — Classificação legal
- [Aferição](./afericao) — Pré-requisito do equipamento

## Contexto operacional

A **autuação** eletrônica no AxHub é um processo distribuído entre três atores. O **operador** valida a imagem e confirma o enquadramento na triagem. O **auditor** revisa a consistência jurídica antes da exportação. O **órgão autuador** emite formalmente o Auto de Infração de Trânsito (AIT) e envia a notificação ao proprietário do veículo.

Do ponto de vista do operador, cada autuação representa uma responsabilidade: uma infração confirmada incorretamente pode gerar um auto inválido que será contestado e anulado, revertendo o trabalho e impactando métricas de qualidade. A máxima do triador é simples: **em caso de dúvida, descartar com motivo**.

Para o gestor, a taxa de autuações aceitas pelo órgão é o índice de qualidade mais importante do sistema. Alta taxa de rejeição pelo órgão indica problema sistêmico (enquadramento errado, placa ilegível recorrente, aferição vencida) que exige intervenção imediata na configuração ou nos equipamentos.


## Uso no Sistema AxHub

No AxHub, a autuacao ocorre ao final do fluxo de triagem, quando o operador confirma a validade da Use Infração (com acento) O sistema gera o registro no formato exigido pelo orgao autuador. As **Formas de Autuacao** sao configuradas em Administracao.

## Paginas Relacionadas

- [Formas de Autuacao](../administracao/formas-autuacao)
- [Triagem de Infracoes](../infracoes/triagem)

## Perguntas frequentes

**Qual a diferença entre autuação eletrônica e notificação?**
A autuação é o registro formal da infração (AIT). A notificação é o documento enviado ao infrator comunicando a multa. Um precede o outro: primeiro o AIT é lavrado, depois a notificação é expedida.

**Qual o prazo máximo entre a infração e a expedição do AIT?**
30 dias, conforme o Art. 281 do CTB. Infrações não exportadas dentro desse prazo prescrevem e não têm validade legal. Monitore o backlog de triagem diariamente.

**O que significa “forma de autuação” no AxHub?**
É o código que identifica o tipo de auto gerado (AIT-E, NOT-E, etc.). Esse código é exigido pelo sistema do órgão autuador no arquivo de exportação e deve ser configurado em **Administração → Formas de Autuação**.
- [Exportacao](../infracoes/exportacao)
- [Infracao](./infracao)

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **Triagem** | A triagem valida as infrações que resultam no auto de infração formal |
| **Enquadramento** | Define o artigo CTB, penalidade e pontuação atribuídos a cada auto |
| **Exportação** | O auto gerado é incluído no lote enviado ao órgão autuador |
