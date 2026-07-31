---
sidebar_position: 3
title: Categorias de Veículos
description: Categorias de veículos utilizadas nos enquadramentos do AxHub
---

# Categorias de Veículos

Classificação dos veículos por tipo para fins de **enquadramento nas infrações**. A categoria correta determina o artigo do CTB aplicável.

![Lista de Categorias](../img/Veículos%20-%20categoia%20de%20veículos.png)

## Como acessar

**Menu lateral** → Veículos → **Categorias de Veículos**

## Categorias padrão do CTB

| Categoria | Descrição |
|----------|-----------|
| **Carro de passeio** | Veículo particular leve |
| **Motocicleta** | Moto, ciclomotor, motoneta |
| **Caminhão** | Veículo de carga pesada |
| **Ônibus** | Transporte coletivo |
| **Van/Microvan** | Transporte de passageiros |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da categoria |
| **Código CTB** | Não | Código do CTB |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Categorias de Veículos**
2. Clique em **+ Nova**
3. Preencha o **Nome** e o **Código CTB** (se aplicável)
4. Clique em **Salvar**

:::info
As categorias de veículos são usadas no enquadramento para determinar qual artigo do CTB se aplica. Categorias incorretas podem invalidar infrações no julgamento administrativo.
:::

## Impacto no enquadramento

| Categoria | Artigos CTB com uso freqüente |
|-----------|-------------------------------|
| Moto | 174 (velocidade), 170 (sinal) |
| Caminhão | 231 (excesso peso), 218 (velocidade) |
| Ônibus | 218, 170 |
| Passeio | 218, 165 (célulaório), 170 |

## Relacionado

- [Classificações de Veículos](./classificacoes-veiculos)
- [Tipos de Veículos](./tipos-veiculos)
- [Enquadramentos](../administracao/enquadramentos)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Artigo CTB incorreto na infração | Categoria errada atribuída ao veículo | Revisar a categoria e reconsiderar o enquadramento |
| Categoria não aparece no filtro de triagem | Categoria inativa | Reativar o cadastro da categoria |
| Veículo sem categoria | Classificação não vinculada a nenhuma categoria | Verificar a hierarquia Tipo → Categoria → Classificação |

| **Trator** | Veículo agrícola/industrial |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da categoria |
| **Código** | Não | Código do DENATRAN |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Categorias**
2. Clique em **+ Novo**
3. Informe o **Nome** e opcionalmente o **Código**
4. Clique em **Salvar**


| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Nome da categoria |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Classificacoes](./classificacoes-veiculos) | Classificacoes vinculadas |

## Boas práticas

- Utilize as categorias padrão do CTB para garantir enquadramentos válidos nos autos de infração
- Não altere o **Código CTB** de categorias já vinculadas a infrações exportadas — pode invalidar registros no órgão autuador
- Mantenha categorias descontinuadas como **Inativas** para preservar rastreabilidade histórica
- Revise o cadastro sempre que o CONTRAN publicar atualizações no Anexo II do CTB
