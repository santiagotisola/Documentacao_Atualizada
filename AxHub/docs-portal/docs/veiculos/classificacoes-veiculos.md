---
sidebar_position: 4
title: Classificações de Veículos
description: Classificações de veículos para enquadramento nas infrações do AxHub
---

# Classificações de Veículos

Subdivide as categorias de veículos em **classificações mais específicas** para fins de enquadramento preciso nas infrações.

![Lista de Classificações](../img/Veículos%20-%20Classificações%20dos%20Veiculos.png)

## Como acessar

**Menu lateral** → Veículos → **Classificações de Veículos**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Código da classificação |
| **Descrição** | Sim | Nome da classificação |
| **Categoria** | Sim | Categoria pai |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Classificações de Veículos**
2. Clique em **+ Nova**
3. Preencha o **Código**, **Descrição** e selecione a **Categoria** pai
4. Clique em **Salvar**

:::info Hierarquia
Categoria → Classificação → Veículo. A classificação é o nível mais específico, usada no enquadramento da infração.
:::

## Exemplos de classificação

| Categoria | Classificação |
|-----------|----------------|
| Moto | Motocicleta, Ciclomotor, Motoneta |
| Caminhão | Toco, Truck, Bi-truck |
| Passeio | Automóvel, Caminhoneta, Camponã |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Enquadramento errado | Classificação incorreta | Verificar CTB e corrigir |
| Classificação sem categoria | Vínculo ausente | Associar categoria pai |
| Veículo com classificação obsoleta | Resolução desatualizada | Atualizar conforme CTB vigente |

## Relacionado

- [Tipos de Veículos](./tipos-veiculos)
- [Categorias de Veículos](./categorias-veiculo)
- [Enquadramento](../glossario/enquadramento)

| Carro | Sedan, Hatch, SUV, Pickup |
| Caminhão | Toco, Truck, Carreta |

## Passo a passo

1. Acesse **Veículos → Classificações**
2. Clique em **+ Novo**
3. Informe o **Código**, **Descrição** e **Categoria**
4. Clique em **Salvar**

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Classificação sem categoria pai | Criada sem selecionar a categoria | Editar e vincular a categoria correta |
| Enquadramento errado por classificação | Veículo enquadrado na classificação equivocada | Revisar no cadastro do veículo e reconsiderar a infração |
| Classificação duplicada | Criada mais de uma vez com nomes similares | Inativar a duplicata e reclassificar os veículos vinculados |


![Cadastro de Classificação](../img/Veículos%20-%20Classificações%20dos%20Veiculos%20-%20cadastros.png)

| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Nome da classificação |
| **Tipo de Veículo | Tipo vinculado |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Categorias](./categorias-veiculo) | Categorias vinculadas |
| Relacionado | [Tipos de Veiculos](./tipos-veiculos) | Tipos |

## Boas práticas

- Mantenha a hierarquia Categoria → Classificação coerente com a tabela DENATRAN para evitar enquadramentos inválidos
- Antes de criar uma nova classificação, pesquise se já existe com nome diferente — duplicidades prejudicam os relatórios
- Classificações vinculadas a infrações exportadas não devem ser renomeadas ou excluídas
- Revise periodicamente as classificações à luz das resoluções CONTRAN para garantir conformidade legal

## Perguntas frequentes

**Posso renomear uma classificação vinculada a infrações já exportadas?**
Não. Renomear pode causar inconsistência nos registros históricos. Inative a classificação atual e crie uma nova com o nome correto.

**Como evitar classificações duplicadas no sistema?**
Use a barra de busca antes de criar uma nova entrada. Caso encontre duplicatas, inative-as e reclassifique os veículos vinculados.

**O que significa a hierarquia Categoria → Classificação?**
A classificação é o nível mais específico dentro de uma categoria. Por exemplo: Categoria "Caminhão" → Classificação "Truck". Enquadramentos usam a classificação para determinar o artigo CTB correto.
## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Categorias de Veículos](./categorias-veiculo)** | Cada classificação deve ser vinculada a uma categoria pai; sem esse vínculo o enquadramento não funciona corretamente |
| **[Tipos de Veículos](./tipos-veiculos)** | A classificação também está associada ao tipo de veículo para compor a hierarquia completa de identificação |
| **[Enquadramentos](../administracao/enquadramentos)** | O enquadramento usa a classificação do veículo para determinar o artigo CTB aplicável à infração |
| **[Infrações — Triagem](../infracoes/triagem)** | O operador pode corrigir a classificação do veículo durante a triagem quando a consulta RENAVAM retorna dado impreciso |

## Exemplo prático

**Cenário**: A operação detecta que veículos do tipo **Truck** (6 eixos) estão sendo classificados como **Toco** (2 eixos) na triagem, o que impacta o artigo CTB e o valor da multa.

**Configuração**:

1. Acesse **Veículos → Classificações de Veículos**
2. Confirme que **Truck** existe como classificação filha da categoria **Caminhão** com o código correto
3. Na triagem, filtre por **Classificação = Toco** e **Data** do período suspeito
4. Para cada infração incorreta, edite o campo **Classificação** de `Toco` para `Truck`
5. O sistema recalcula o enquadramento e atualiza o valor da autuação automaticamente

**Resultado**: As infrações corrigidas refletem o artigo CTB adequado para veículos de grande porte, e o lote de exportação passa na validação do órgão autuador.