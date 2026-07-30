---
title: "Triagem"
sidebar_position: 8
description: "O que é triagem no AxHub — processo, responsabilidades e boas práticas"
---

# Triagem

Processo de **análise preliminar** das infrações capturadas automaticamente, onde o operador valida a qualidade da evidência, confirma os dados do veículo e define o enquadramento aplicável.

**Base legal:** Resolução CONTRAN 619/2016, Art. 8º

## O que o triador verifica

| Elemento | O que verificar |
|----------|-----------------|
| **Imagem** | Placa legível e veículo visível |
| **Placa** | Leitura OCR correta |
| **Enquadramento** | Artigo CTB aplicável |
| **Data/Hora** | Registro coerente |
| **Equipamento** | Aferição INMETRO válida |

## Decisões disponíveis

| Decisão | Quando tomar |
|---------|-------------|
| **Confirmar** | Evidência válida, enquadramento correto |
| **Descartar** | Imagem ilegível, placa incorreta, enquadramento inválido |
| **Editar** | Placa ou dados incorretos — corrigir antes de confirmar |

## Relacionado

- [Autuação](./autuacao)
- [Enquadramentos](../administracao/enquadramentos)
- [Motivos de Descarte](../administracao/motivos-descartes)


## Boas práticas

- Manter defasagem de triagem abaixo de 24h
- Descartar sempre com motivo específico (afeta o Dashboard)
- Em dúvida sobre enquadramento, consultar o supervisor

## Relacionados

- [Triagem de Infrações](../infracoes/triagem) — Tela de triagem
- [Auditoria](../infracoes/auditoria) — Etapa seguinte


## Uso no Sistema AxHub

Acessivel em **Infracoes - Triagem**. E a etapa central do fluxo operacional. O operador analisa a imagem, válida os dados (placa, velocidade, faixa), define o enquadramento e encaminha para auditoria ou descarta com motivo justificado.

## Paginas Relacionadas

- [Triagem de Infracoes](../infracoes/triagem)
- [Excecoes](../infracoes/excecoes)
- [Auditoria](../infracoes/auditoria)
- [Motivos de Descarte](../administracao/motivos-descartes)
- [Enquadramento](./enquadramento)
