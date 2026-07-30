---
title: "Cronoatacógrafo"
sidebar_position: 5
description: "O que é cronoatacógrafo no AxHub — obrigatoriedade, verificação e penalidades"
---

# Cronoatacógrafo

Instrumento eletrônico de controle do **tempo de direção, parada e velocidade**. O AxHub verifica automaticamente a situação do cronoatacógrafo nos veículos que passam pelos equipamentos monitorados.

**Base legal:** Art. 105, II do CTB — Resolução CONTRAN 92/1999

## Obrigatoriedade

| Veículo | Obrigatório? |
|---------|:-----------:|
| Veículos de carga com PBT > 4.536 kg | Sim |
| Transporte coletivo de passageiros | Sim |
| Condução escolar | Sim |
| Veículos de passeio | Não |

## Status verificado pelo AxHub

| Status | Descrição | Ação |
|--------|-----------|------|
| **Regular** | Cronoat - presente e válido | Nenhuma |
| **Irregular** | Ausente, violado ou adulterado | Gera infração |
| **N/A** | Veículo não obrigado | Nenhuma |

## Relacionado

- [Enquadramentos](../administracao/enquadramentos) — Códigos CTB aplicáveis
- [Tipos de Veículos](../veiculos/tipos-veiculos)

## Penalidade por ausência

**Art. 162, II do CTB:** Multa gravíssima (7 UFIRs) + suspensão do direito de dirigir

## Verificação no AxHub

O AxHub consulta automaticamente o status do cronoatacógrafo durante a triagem das passagens. Quando a situação está **Irregular**, o sistema sugere o enquadramento do Art. 162, II do CTB ao operador.

:::tip
Acesse **Operações → Aferições** para verificar os registros de equipamentos com verificação de cronoatacógrafo pendente.
:::

## Tempo de direção máximo

| Situação | Limite |
|----------|:------:|
| Direção contínua | 4 horas |
| Pausa obrigatória | 30 minutos |
| Jornada diária total | 8 horas (podendo chegar a 10 com adicional) |

**Base:** Resolução CONTRAN 92/1999 + Conselho Nacional de Política de Saúde no Trabalho

## Boas práticas

- Verifique o status do cronoatacógrafo na triagem sempre que o veículo for de carga pesada com PBT > 4.536 kg
- Use o filtro **Tipo = Cronoatacógrafo irregular** no relatório de infrações para monitorar a frequência de irregularidades
## Tabela de referência — limites de jornada

| Situação | Limite | Base legal |
|----------|:------:|------------|
| Direção contínua | 4 horas | Res. CONTRAN 92/1999 |
| Pausa obrigatória | 30 minutos | Res. CONTRAN 92/1999 |
| Jornada diária normal | 8 horas | CLT + CONTRAN |
| Jornada diária máxima | 10 horas | Com adicional |
| Descanso interjornada | 11 horas | CLT |

## Erros comuns na verificação

| Problema | Causa | Solução |
|----------|-------|----------|
| Status sempre `NãoEncontrado` | Banco de certif. desatualizado | Acionar suporte técnico |
| Falso positivo de irregularidade | Certif. renovado após consulta | Verificar data de atualização do banco |
| Veículo não verificado | Tipo não obrigado a ter cronotácografo | Normal — status `N/A` |- Registre as infrações do Art. 162, II com o enquadramento correto para validade jurídica no DETRAN
- Combine com a verificação de placa para confirmar se o mesmo veículo reincide na irregularidade

## Relacionado

- [Enquadramentos](../administracao/enquadramentos) — Códigos CTB aplicáveis
- [Tipos de Veículos](../veiculos/tipos-veiculos) — Quais veículos são obrigados
- [Aferição](./afericao) — Validade do equipamento que registra a infração
