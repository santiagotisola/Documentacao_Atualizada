---
sidebar_position: 3
title: Recursos
description: Gestão de recursos humanos e materiais vinculados às medições do AxHub
---

# Recursos

Cadastro e gestão dos **recursos humanos e materiais** utilizados nas operações de fiscalização, vinculados a contratos para cálculo de medição.

![Lista de Recursos](../img/Medição%20-%20Recursos%20.png)

## Como acessar

**Menu lateral** → Medição → **Recursos**

## Cadastro

![Cadastro de Recurso](../img/Medição%20-%20Recursos%20-.cadastro.png)

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Identificação do recurso |
| **Tipo** | Sim | Humano ou Material |
| **Quantidade** | Sim | Quantidade contratada |
| **Unidade** | Sim | Horas, unidades, mês |
| **Contrato** | Sim | Contrato a que pertence |

## Passo a passo

1. Acesse **Medição → Recursos**
2. Clique em **+ Novo**
3. Preencha o **Nome**, **Tipo**, **Quantidade** e **Unidade**
4. Vincule ao **Contrato**
5. Clique em **Salvar**

:::info
Os recursos cadastrados são incluídos no **Boletim de Medição** como comprovação do fornecimento contratual.
:::

## Boas práticas

- Cadastre recursos com os mesmos nomes usados no contrato para facilitar auditoria e conciliação
- Informe a quantidade exata contratada — desvios impactam o cálculo do boletim de medição
- Vincule cada recurso ao contrato correto; recursos sem contrato não aparecem no boletim
- Mantenha o cadastro atualizado quando houver aditivos ou renovação contratual

## Relacionado

- [Contratos](./contratos)
- [Criar Medição](./criar-medicao)
- [Medições Finalizadas](./medicoes-finalizadas)

## Fluxo de gestão de recursos

1. Consultar o contrato para identificar os recursos previstos
2. Cadastrar cada recurso em **Medição → Recursos**
3. Vincular ao contrato correto
4. A cada medição mensal, os recursos são incluídos automaticamente no boletim
5. Ao renovar o contrato, atualizar quantidades e tipos de recursos

## Tabela de referência — tipos de recursos

| Tipo | Exemplos | Unidade comum |
|------|----------|:-------------:|
| **Humano** | Agente de trânsito, técnico de campo, supervisor | Hora/mês |
| **Equipamento** | Câmera, radar, sensor, servidor | Unidade |
| **Veículo** | Viatura de apoio operacional | Unidade/mês |
| **Serviço** | Manutenção preventiva, conectividade | Evento/mês |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Recurso não aparece no boletim | Não vinculado ao contrato | Editar recurso e vincular |
| Quantidade incorreta | Aditivo contratual não atualizado | Editar e corrigir quantidade |
| Recurso duplicado | Dois registros para o mesmo item | Inativar o duplicado |

## Tipos de recurso

| Tipo | Exemplos |
|------|----------|
| **Humano** | Agente de trânsito, técnico de campo, supervisor |
| **Equipamento** | Câmera, radar, sensor, servidor |
| **Veículo** | Viatura de apoio operacional |
| **Serviço** | Manutenção preventiva, conectividade |
- [Criar Medição](./criar-medicao)


## Tipos de recurso

| Tipo | Exemplos |
|------|----------|
| **Humano** | Agentes fiscais, técnicos de manutenção |
| **Material** | Equipamentos, veículos de suporte |

## Uso nas medições

Os recursos são vinculados às medições mensais para comprovar a alocação contratada e embasar o pagamento.


| Campo | Descrição |
|-------|-----------|
| **Descrição** | Nome do recurso |
| **Tipo** | Equipamento pessoal, veicular |
| **Contrato** | Contrato vinculado |
| **Status** | Ativo ou Inativo |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Contratos](./contratos) | Contrato vinculado |
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Equipamentos como recurso |
