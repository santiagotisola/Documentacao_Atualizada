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

## Perguntas frequentes

**Posso alterar o Código CTB de uma categoria já usada em infrações exportadas?**
Não. Alterar o código após a exportação pode invalidar registros no órgão autuador. Inative a categoria existente e crie uma nova com o código correto.

**O que fazer quando uma infração é enquadrada com artigo errado por causa da categoria do veículo?**
Corrigir a categoria no cadastro do veículo, reconsiderar o enquadramento e reprocessar a infração antes da exportação.

**Preciso criar categorias novas ou as padrão CTB são suficientes?**
As categorias padrão do CTB cobrem a maioria dos enquadramentos. Crie categorias adicionais apenas se o órgão autuador exigir subdivisões não previstas no CTB.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Classificações de Veículos](./classificacoes-veiculos)** | A categoria é a unidade pai da classificação; a hierarquia Categoria → Classificação é essencial para o enquadramento correto |
| **[Enquadramentos](../administracao/enquadramentos)** | O artigo CTB do enquadramento é determinado com base na categoria do veículo registrada na passagem |
| **[Infrações — Triagem](../infracoes/triagem)** | A categoria do veículo é verificada na triagem; enquadramento incorreto por categoria errada deve ser corrigido antes da exportação |
| **[Exportação de Infrações](../infracoes/exportacao)** | A categoria integra os dados do auto exportado ao órgão autuador conforme o layout exigido |

## Exemplo prático

**Cenário**: Um órgão autuador exige que infrações de motocicletas sejam categorizadas como `Moto` (código CTB `04`) separado de `Automóvel` (código `01`). A categoria padrão `Motocicleta` não está cadastrada com o código correto exigido pelo layout.

| Configuração | Valor |
|-------------|-------|
| Nome | Motocicleta |
| Código CTB | 04 |
| Status | Ativo |

**Passo a passo**:
1. Acesse **Veículos → Categorias de Veículos** e pesquise por `Motocicleta`
2. Se existir com código incorreto, clique em **Editar** e corrija o **Código CTB** para `04`
3. Se não existir, clique em **+ Nova** e preencha: Nome `Motocicleta`, Código CTB `04`
4. Clique em **Salvar**
5. Verifique os enquadramentos vinculados a esta categoria e ajuste se necessário

**Resultado**: Infrações de motocicletas passam a ser exportadas com o código `04` no arquivo ao órgão, eliminando rejeicoes por código de categoria inválido. A triagem também reflete a categoria correta no auto de infração.
