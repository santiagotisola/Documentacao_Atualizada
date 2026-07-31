---
sidebar_position: 2
title: Consulta
description: Consulta de registros de cronotacógrafo
---

# Consulta de Cronotacógrafo

Permite consultar o histórico de registros de cronotacógrafo processados pelo sistema, com detalhes de placa, velocidade, status de verificação e resultado da consulta ao banco de certificados.

![Histórico Cronotacógrafo](../img/Cronotacógrafo%20-%20Triagem%20-%20historico.png)

## Como acessar

**Menu lateral** → Cronotacógrafo → **Consulta**

## O que é verificado

A cada registro de cronotacógrafo, o sistema verifica:

1. **Validade do certificado** — se o certificado do aparelho está dentro do prazo
2. **Regularidade do condutor** — se o tempo de jornada está dentro do limite legal
3. **Integridade do lacre** — se o Equipamento não foi adulterado

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| **Placa** | Filtrar por placa do Veículo |
| Equipamento | Filtrar por Equipamento de fiscalização |
| **Status** | Processado, Pendente, Descartado, Irregular |

## Campos do resultado

| Coluna do Resultado | Descrição |
|---------------------|-----------|
| **Data/Hora** | Momento do registro |
| **Placa** | Placa do Veículo |
| Equipamento | Equipamento que registrou |
| **Velocidade** | Velocidade registrada |
| **Status Cronotacógrafo** | `Regular`, `Irregular`, `Vencido`, `NaoEncontrado` |
| **Status Processamento** | `Processado`, `Pendente`, `Descartado` |
| Infração Gerada** | Número do auto (quando houver Infração |

## Resultado por status

| Status Cronotacógrafo | Gera infração? | Ação |
|-----------------------|:--------------:|------|
| Regular | Não | Passagem liberada |
| Irregular | Sim | Auto de infração Art.162,II CTB |
| Vencido | Sim | Auto de infração Art.162,II CTB |
| NãoEncontrado | Revisão manual | Triagem pelo operador |

## Boas práticas

- Priorize registros com status **NãoEncontrado** na triagem — podem indicar veículos sem certificação ou placas divergentes
- Verifique periodicamente o banco de certificados: certifique-se de que a atualização está em dia para evitar falsos negativos
- Use os filtros de período e placa para auditar registros de uma operação específica rapidamente

## Fluxo de consulta

1. Veículo pesado passa pelo equipamento com leitor de cronotacógrafo
2. Sistema captura a placa e consulta automaticamente o status do cronotácografo
3. Resultado gravado: `Regular`, `Irregular`, `Vencido` ou `NãoEncontrado`
4. Se `Irregular` ou `Vencido` → infração gerada automaticamente
5. Se `NãoEncontrado` → encaminhado para triagem manual
6. Acessar **Cronotacógrafo → Consulta** para acompanhar e revisar registros

## Tabela de referência — erros de consulta

| Situação | Causa provável | Solução |
|----------|---------------|----------|
| Status `NãoEncontrado` frequente | Banco de certificados desatualizado | Acionar equipe técnica para atualizar |
| Infração gerada para veículo regular | Certif. vencido mas renovado recentemente | Verificar data de atualização do banco |
| Status `Erro` na consulta | Falha de conectividade com WS externo | Verificar integração de rede |

## Relacionado

- [Cronotacógrafo](../glossario/cronotacografo)

## Perguntas frequentes

**O que fazer quando um veículo aparece como ‘NãoEncontrado’ no sistema?**
Encaminhe para triagem manual. Pode indicar placa divergente, certif. não cadastrado no banco externo ou falha de conectividade. Priorize esses registros antes do fim do turno.

**A consulta ao banco de certificados ocorre em tempo real?**
Sim. A cada passagem registrada o sistema consulta automaticamente o WS externo. Verifique a integração de rede se ocorrerem muitos erros de status.

**Infrações geradas por cronotacógrafo irregular seguem o mesmo fluxo de triagem e exportação?**
Sim. Seguem o fluxo padrão: triagem → auditoria → lote de exportação, como qualquer outra infração do sistema.
- [Triagem](../infracoes/triagem)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Veículo sempre com status `NãoEncontrado` | Placa divergente ou banco desatualizado | Verificar placa com a documentação do veículo e acionar suporte |
| Muitos erros de conectividade | Falha na integração de rede com o WS externo | Verificar configurações de rede e firewall para o endpoint do WS |
| Status `Irregular` mesmo com jornada normal | Data de atualização do banco desatualizada | Contatar suporte técnico para atualizar o banco de certificados |

## Exemplo prático

**Cenário:** Fiscalização na BR-116 detecta veículo com cronotacógrafo com certificado vencido há 45 dias.

1. O equipamento registra a passagem e envia a placa ao AxHub
2. O sistema consulta automaticamente o banco externo de certificados INMETRO
3. Resultado retornado: `Vencido` — auto de infração gerado automaticamente (Art. 162, II CTB)
4. O registro aparece em **Cronotacógrafo → Consulta** com status `Vencido` e o número do auto preenchido
5. O analista confirma o resultado na triagem e o auto segue para o lote de exportação

:::tip Prioridade na triagem
Registros com status `NãoEncontrado` devem ser triados manualmente com prioridade. Geralmente indicam placa divergente no banco externo ou certificado emitido recentemente que ainda não foi sincronizado.
:::

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Triagem de Cronotacógrafo](./triagem)** | Esta tela exibe o histórico processado pela triagem; as alterações são feitas na tela de triagem |
| **[Infrações — Consulta](../infracoes/consulta-infracoes)** | Infrações de cronotacógrafo geradas aparecem também na consulta geral de infrações |
| **[Glossarío — Cronotacógrafo](../glossario/cronotacografo)** | Define os conceitos técnicos e legais do dispositivo verificado nesta tela |

## Status do Cronotacógrafo

| Status | Significado |
|--------|-------------|
| **Regular** | Certificado válido, jornada dentro do limite |
| **Irregular** | Violação de jornada detectada |
| **Vencido** | Certificado expirado |
| **NaoEncontrado** | Placa não localizada no banco de dados de certificados |

## Exportação

Exportável em **Excel** para Análise e inclusão em autos de Infração administrativos.

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Anterior | [Triagem](./triagem) | Processo de triagem de registros |
| Glossário | [Cronotacógrafo](../glossario/cronotacografo) | Definição técnica e base legal |
