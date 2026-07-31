---
sidebar_position: 4
title: Monitoramento Online
description: Acompanhamento em tempo real dos equipamentos e passagens no AxHub
---

# Monitoramento Online

Permite **acompanhar em tempo real** o status e funcionamento dos equipamentos de fiscalização, exibindo passagens e alertas assim que ocorrem.

![Monitoramento Online](../img/Operações%20-%20Monitoramento%20online.png)

## Como acessar

**Menu lateral** → Operações → **Monitoramento Online**

## Informações exibidas

| Elemento | Descrição |
|----------|-----------|
| **Status do equipamento** | Online (verde) / Offline (vermelho) |
| **Última passagem** | Data, hora, placa e imagem |
| **Alertas ativos** | Infrações pendentes de triagem |
| **Taxa OCR** | Percentual de leitura de placas |

## Filtros disponíveis

- **Equipamento**: filtrar por câmera específica
- **Grupo de equipamentos**: filtrar por grupo
- **Status**: online, offline ou todos

## Usos operacionais

- **Início do turno:** verificar se todos os equipamentos estão ativos
- **Ocorrência em campo:** confirmar passagem de veículo suspeito
- **Qualidade:** acompanhar taxa OCR em tempo real

:::tip Dica
Configure o filtro por grupo de equipamentos para focar no seu âmbito de responsabilidade.
:::

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Eventos de Equipamentos](./eventos-equipamentos) | Histórico de falhas |
| Relacionado | [Aferições](./afericoes) | Calibração dos equipamentos |


## Cadastro de monitoramento

![Cadastro de Monitoramento](../img/Operações%20-%20Monitoramento%20online%20-%20cadastro.png)

| Coluna | Descrição |
|--------|-----------|
| Equipamento | Nome e código do Equipamento |
| **Status** | Online, Offline, Manutenção |
| **Última Comunicação** | Data/hora do último sinal recebido |
| **Passagens (dia)** | Quantidade de Veículos registrados no dia |

---

## Relacionado

- [Eventos de Equipamentos](./eventos-equipamentos)

## Tabela de referência — status dos equipamentos

| Status | Cor | Significado | Ação |
|--------|:---:|-------------|------|
| **Online** | 🟢 Verde | Equipamento operacional | Nenhuma |
| **Offline** | 🔴 Vermelho | Sem comunicação | Acionar manutenção |
| **Manutenção** | 🟡 Amarelo | Parada programática | Acompanhar previsão |

## Erros comuns

| Problema | Causa provável | Solução |
|----------|---------------|----------|
| Equipamento sempre offline | IP incorreto no cadastro | Verificar cadastro do equipamento |
| Passagens não aparecem em tempo real | Heartbeat desabilitado | Verificar configurações do grupo |
| Mapa não exibe equipamentos | Lat/Long não configuradas | Preencher coordenadas no cadastro do equipamento |
| Status desatualizado | Cache do browser | Pressionar F5 para atualizar |

## Relacionado

- [Eventos de Equipamentos](./eventos-equipamentos)
- [Afe rições](./afericoes)
- [Grupos de Equipamentos](../cadastros-basicos/grupos-equipamentos)
| Taxa OCR não exibida | Permissão insuficiente | Solicitar permissão ao administrador |

## Perguntas frequentes

**Por que um equipamento aparece offline mesmo com a rede funcionando?**
O heartbeat pode estar desabilitado no grupo de equipamentos, ou o intervalo de timeout pode estar muito curto. Verifique **Configurações → Grupos de Equipamentos** e o campo **Timeout Heartbeat** em Configurações do Sistema.

**O monitoramento online consome muita banda de rede?**
Sim. O painel atualiza em tempo real e pode impactar redes com baixa largura de banda. Use filtros por grupo para reduzir o volume de dados carregados.

**Posso usar o monitoramento online em dispositivos móveis?**
Sim. O sistema é acessível via navegador em tablets e smartphones. Otimize usando o filtro por grupo para carregar apenas os equipamentos relevantes ao turno.

## Fluxo de uso no início do turno

1. Acessar **Operações → Monitoramento Online**
2. Verificar se todos os equipamentos do turno estão **Online** (verdes)
3. Identificar e registrar equipamentos Offline em [Eventos](./eventos-equipamentos)
4. Monitorar Taxa OCR — queda indica necessidade de manutenção
5. Ao final do turno, verificar alertas ativos não triados
- [Aferições](./afericoes)
- [Dashboard](../primeiros-passos/dashboard)
- [Consulta de Placas](./consulta-placas)

## Boas práticas

- Verifique o status de todos os equipamentos no início de cada turno antes de liberar a operação
- Equipamentos com status **Offline** por mais de 15 minutos devem ser escalados para suporte técnico imediatamente
- Use o filtro por grupo para focar no âmbito de responsabilidade e reduzir ruído visual
- Monitore a taxa OCR em tempo real — quedas abaixo de 85% indicam necessidade de calibração ou limpeza

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Eventos de Equipamentos](./eventos-equipamentos) | histórico de eventos |
| Relacionado | [Dashboard](../primeiros-passos/dashboard) | Visao geral do sistema |
| Relacionado | [Consulta de Placas](./consulta-placas) | Buscar veiculos |
