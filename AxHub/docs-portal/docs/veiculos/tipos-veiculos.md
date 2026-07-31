---
sidebar_position: 1
title: Tipos de Veículos
description: Cadastro dos tipos de veículos utilizados na classificação do AxHub
---

# Tipos de Veículos

Cadastro dos **tipos de veículos** utilizados para classificação nas operações e enquadramentos.

![Lista de Tipos](../img/Veículos%20-%20tipos%20de%20veículos.png)

## Como acessar

**Menu lateral** → Veículos → **Tipos de Veículos**

## Tipos padrão (DENATRAN)

| Tipo | Descrição |
|------|-----------|
| **Passeio** | Veículo particular para até 8 ocupantes |
| **Carga** | Veículo para transporte de mercadorias |
| **Passageiros** | Ônibus, van, microvan |
| **Moto** | Motocicleta, ciclomotor |
| **Especial** | Trator, máquina agrícola |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Código identificador |
| **Nome** | Sim | Nome do tipo |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Tipos de Veículos**
2. Clique em **+ Novo**
3. Preencha o **Código** e o **Nome**
4. Clique em **Salvar**

:::tip
Os tipos de veículos são usados em conjunto com **Espécies** e **Classificações** para determinar o enquadramento exato da infração.
:::

## Relacionado

- [Espécies de Veículos](./especie-veiculo)
- [Classificações de Veículos](./classificacoes-veiculos)
- [Categorias de Veículos](./categorias-veiculo)


## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do tipo |
| **Código DENATRAN** | Não | Código oficial |
| **Status** | Sim | Ativo ou Inativo |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Tipo duplicado na lista | Cadastrado mais de uma vez com nomes similares | Inativar o duplicado e manter apenas um ativo |
| Tipo não aparece no enquadramento | Tipo inativo ou sem vínculo com categoria | Verificar status e hierarquia Tipo → Categoria |
| Código DENATRAN em branco | Não informado no cadastro | Preencher com o código da tabela oficial do DENATRAN |

## Passo a passo

1. Acesse **Veículos → Tipos de Veículos**
2. Clique em **+ Novo**
3. Informe o **Nome** e **Código**
4. Clique em **Salvar**


## Cadastro

![Cadastro de Tipo](../img/Veículos%20-%20tipos%20de%20veículos%20-%20cadastro.png)

| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador do tipo |
| **Descrição** | Nome do tipo de Veículo (ex: Automóvel, Caminhão, Motocicleta) |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Classificacoes](./classificacoes-veiculos) | Classificacoes |
| Relacionado | [Especies](./especie-veiculo) | Especies |

## Boas práticas

- Utilize os tipos padrão DENATRAN pré-cadastrados; adicione tipos personalizados somente se expressamente exigido pelo órgão autuador
- Mantenha a consistência com as **Espécies** e **Classificações** vinculadas — um tipo sem classificação correspondente impede o enquadramento correto
- Não exclua tipos associados a infrações históricas; inative-os para preservar a rastreabilidade
- Ao atualizar um tipo, revise os enquadramentos que dependem dele para evitar inconsistências nos lotes futuros

## Perguntas frequentes

**Qual a diferença entre Tipo de Veículo e Espécie?**
Espécie é a classificação oficial do DENATRAN (do CRV). Tipo é a categorização operacional usada internamente no sistema para filtros e enquadramentos.

**Um tipo inativo ainda aparece nos relatórios históricos?**
Sim. Inativar um tipo apenas impede seu uso em novos cadastros; os registros históricos que o utilizaram são preservados.

**Preciso cadastrar tipos personalizados ou os padrão DENATRAN são suficientes?**
Os tipos padrão pré-cadastrados cobrem a maioria dos casos. Crie tipos personalizados somente se o órgão autuador exigir categorias específicas não contempladas na tabela padrão.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Espécies de Veículos](./especie-veiculo)** | Espécie e Tipo compõem a hierarquia de identificação do veículo; ambos são usados no enquadramento |
| **[Classificações de Veículos](./classificacoes-veiculos)** | Cada classificação deve ser vinculada a um Tipo de Veículo válido para funcionar corretamente nos enquadramentos |
| **[Enquadramentos](../administracao/enquadramentos)** | O Tipo de Veículo influencia o artigo CTB sugerido automaticamente no enquadramento da infração |

## Exemplo prático

**Cenário**: O órgão autuador começa a fiscalizar **patinetes elétricos** (ciclo motorizado) e exige que infrações desse tipo de veículo sejam enquadradas com tipo específico no auto. O tipo não existe no sistema e precisa ser criado.

| Configuração | Valor |
|-------------|-------|
| Nome | Ciclo Motorizado |
| Código DENATRAN | 11 |
| Status | Ativo |

**Passo a passo**:
1. Confirme o código correto com o órgão autuador (tabela DENATRAN)
2. Acesse **Veículos → Tipos de Veículos** e clique em **+ Novo**
3. Preencha: **Nome** `Ciclo Motorizado`, **Código DENATRAN** `11`
4. Clique em **Salvar**
5. Acesse **Veículos → Classificações de Veículos** e crie a classificação vinculada ao novo tipo
6. Atualize os **Enquadramentos** para incluir o artigo CTB aplicado a ciclos motorizados

**Resultado**: Infrações de patinetes elétricos passam a ser enquadradas com o tipo correto. O auto exportado identifica o veículo como `Ciclo Motorizado` conforme exigido pelo órgão, eliminando rejeicoes por tipo de veículo inválido.
| **[Infrações — Triagem](../infracoes/triagem)** | Durante a triagem, o tipo do veículo é verificado para garantir que o enquadramento seja compatível com a categoria |

## Exemplo prático

**Cenário**: O gestor da operação percebe que motocicletas estão sendo enquadradas em artigos de velocidade para automóveis — o **Tipo** estava incorretamente configurado, misturando "Moto" com "Passeio".

**Configuração**:

1. Acesse **Veículos → Tipos de Veículos** e localize o tipo **Moto**
2. Confirme que o **Código DENATRAN** está em `2` (código oficial para motocicletas/ciclomotores)
3. Acesse **Enquadramentos** e verifique que os artigos para velocidade em moto estão vinculados ao tipo correto
4. Corrija os vínculos e reprocesse as infrações afetadas via **Infrações → Triagem** (filtro: tipo = Moto, data do período)

**Resultado**: As infrações de moto passam a usar os limites de velocidade e artigos CTB específicos para motocicletas, eliminando enquadramentos indevidos.
