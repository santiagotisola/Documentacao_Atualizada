---
sidebar_position: 2
title: Espécies de Veículos
description: Espécies de veículos para classificação nas infrações do AxHub
---

# Espécies de Veículos

Classificação dos veículos por **espécie** conforme o Registro Nacional de Veículos Automotores (RENAVAM). A espécie correta é essencial para o enquadramento legal das infrações.

![Lista de Espécies](../img/Veículos%20-%20Espécies%20de%20veículos.png)

## Como acessar

**Menu lateral** → Veículos → **Espécies de Veículos**

## Espécies do DENATRAN

| Espécie | Descrição |
|--------|-----------|
| **Automóvel** | Veículo de passeio com até 8 ocupantes |
| **Caminhão** | Veículo de transporte de carga |
| **Caminhão-trator** | Cavalo mecânico sem carroceria |
| **Ônibus** | Transporte público com mais de 8 assentos |
| **Microonibus** | De 9 a 15 passageiros |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código DENATRAN** | Sim | Código oficial |
| **Descrição** | Sim | Nome da espécie |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Veículos → Espécies de Veículos**
2. Clique em **+ Nova**
3. Preencha o **Código** e a **Descrição**
4. Clique em **Salvar**

:::info
As espécies são pré-carregadas conforme a tabela do DENATRAN. Adicionar espécies novas apenas quando solicitado pelo órgão autuador.
:::

## Hierarquia de classificação

```
Espécie (DENATRAN)
  └─ Tipo de Veículo
       └─ Categoria
            └─ Classificação
```

## Relacionado

- [Tipos de Veículos](./tipos-veiculos)
- [Categorias de Veículos](./categorias-veiculo)
- [Classificações de Veículos](./classificacoes-veiculos)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Espécie incorreta no auto | OCR classificou errado ou RENAVAM retornou dado inconsistente | Corrigir manualmente na triagem |
| Espécie não existe na lista | Código DENATRAN não cadastrado | Cadastrar conforme a tabela oficial do DENATRAN |
| Infração enquadrada com artigo errado | Espécie errada resultou em artigo CTB incorreto | Reconsiderar o enquadramento após corrigir a espécie |

| **Moto** | Motocicleta, ciclomotor, motoneta |
| **Trator** | Equipamento agrícola ou de obras |

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome da espécie |
| **Código DENATRAN** | Não | Código oficial |
| **Status** | Sim | Ativo ou Inativo |


## Cadastro

![Cadastro de Espécie](../img/Veículos%20-%20Espécies%20de%20veículos%20-%20cadastro.png)

| Campo | Descrição |
|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Nome da espécie (ex: Passageiro, Carga, Misto) |
| **Ativo** | Status do registro |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Tipos de Veiculos](./tipos-veiculos) | Tipos vinculados |

## Boas práticas

- Utilize os códigos DENATRAN oficiais para garantir compatibilidade nos arquivos de exportação ao SENATRAN
- Não crie espécies personalizadas sem alinhamento com o órgão autuador — dados divergentes invalidam autos
- Revise a tabela sempre que o DENATRAN publicar novas normativas de classificação veicular
- Mantenha espécies obsoletas como **Inativas** em vez de excluí-las para preservar o histórico de infrações

## Perguntas frequentes

**Qual a diferença entre Espécie e Tipo de Veículo?**
Espécie é a classificação DENATRAN do CRV (ex.: Automóvel, Caminhão-trator). Tipo é uma categorização interna do sistema para fins operacionais. Ambos compõem a hierarquia de identificação do veículo.

**Quando o campo espécie aparece em branco na infração?**
Ocorre quando a consulta RENAVAM falhou ou retornou dado inconsistente. Corrija manualmente durante a triagem antes da exportação.

**Preciso criar novas espécies ou as do DENATRAN são suficientes?**
As espécies pré-carregadas cobrem toda a tabela DENATRAN. Crie entradas adicionais somente se expressamente solicitado pelo órgão autuador.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Tipos de Veículos](./tipos-veiculos)** | Espécie e Tipo formam a hierarquia de classificação veicular; ambos são consultados no enquadramento da infração |
| **[Enquadramentos](../administracao/enquadramentos)** | A espécie do veículo influencia o artigo CTB aplicável — espécie incorreta pode gerar enquadramento inválido |
| **[Consulta de Placas](../operacoes/consulta-placas)** | A espécie é retornada automaticamente pela consulta RENAVAM e associada à passagem registrada |
| **[Infrações — Triagem](../infracoes/triagem)** | O operador pode corrigir a espécie manualmente na triagem quando o valor retornado pelo RENAVAM está inconsistente |

## Exemplo prático

**Cenário**: Um radar registra um **caminhão-trator** (cavalo mecânico) mas a consulta RENAVAM retorna a espécie como "Automóvel", gerando enquadramento incorreto no artigo CTB.

**Configuração**:

1. Na triagem da infração, o operador identifica a inconsistência visualmente na imagem
2. Clica em **Editar** no campo **Espécie do Veículo**
3. Altera de `Automóvel` para `Caminhão-trator`
4. O sistema recalcula automaticamente o enquadramento para o artigo CTB correto
5. O operador confirma e envia a infração para aprovação

**Resultado**: A infração é enquadrada corretamente. O relatório de inconsistências RENAVAM registra o caso para análise da integração com o órgão de trânsito.
