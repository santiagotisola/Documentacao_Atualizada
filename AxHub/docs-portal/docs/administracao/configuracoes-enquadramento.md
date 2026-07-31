---
sidebar_position: 3
title: Configurações de Enquadramento
description: Configuração dos enquadramentos de infrações por operação no AxHub
---

# Configurações de Enquadramento

Vincula **enquadramentos do CTB a operações específicas**, definindo quais artigos serão aplicáveis em cada faixa e velocidade monitorada.

![Lista de Enquadramentos](../img/Configurações%20-%20configurações%20de%20enquadramento.png)

## Como acessar

**Menu lateral** → Configurações → **Configurações de Enquadramento**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Operação** | Sim | Operação de fiscalização |
| **Enquadramento** | Sim | Artigo do CTB (da tabela de enquadramentos) |
| **Velocidade Máxima** | Cond. | Limite da via para calcular excesso |
| **Fator de Aplicação** | Não | Percentual de tolerância |

## Cadastro

![Cadastro](../img/Configurações%20-%20configurações%20de%20enquadramento-%20cadastro%20.png)

1. Acesse **Configurações → Configurações de Enquadramento**
2. Clique em **+ Novo**
3. Selecione a **Operação** e o **Enquadramento**
4. Informe a **Velocidade Máxima** da via
5. Clique em **Salvar**

:::caution
Um enquadramento mal configurado resulta em infrações com artigo CTB incorreto, o que pode causar anulação judicial.
:::

## Navegação Relacionada

| Tipo | Página |

## Boas práticas

- Vincule cada enquadramento à operação correta — um enquadramento errado invalida os autos gerados
- Revise as configurações sempre que a velocidade máxima de uma operação for alterada por decreto ou portaria
- Consulte o CTB e as normativas do CONTRAN vigentes antes de adicionar ou alterar enquadramentos personalizados
- Não exclua configurações já usadas em infrações exportadas; inative-as para preservar a rastreabilidade

## Relacionado

- [Enquadramentos](./enquadramentos)
- [Formas de Autuação](./formas-autuacao)
- [Operações](../operacoes/cadastro-operacoes)

## Exemplos de configuração

**Operação de radar de velocidade em via de 60 km/h:**
- Enquadramento: 55411 (excesso até 20%) — Velocidade máxima: 60 km/h
- Enquadramento: 55412 (excesso 20-50%) — Velocidade máxima: 60 km/h
- Enquadramento: 55413 (excesso > 50%) — Velocidade máxima: 60 km/h

**Operação de radar em via de 80 km/h:**
- Duplicar as configurações acima com Velocidade máxima: 80 km/h

## Tabela de referência — enquadramentos de velocidade

| Código | Descrição | Via 60 km/h gera | Via 80 km/h gera |
|--------|-----------|:---------------:|:----------------:|
| 55411 | Até 20% de excesso | 61-72 km/h | 81-96 km/h |
| 55412 | 20% a 50% de excesso | 73-90 km/h | 97-120 km/h |
| 55413 | Acima de 50% | > 90 km/h | > 120 km/h |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Enquadramento incorreto aplicado | Velocidade máxima errada na configuração | Corrigir o campo e rever infrações do período |
| Infração sem enquadramento | Configuração ausente para a operação | Criar configuração para a operação |
| Dois enquadramentos no mesmo limite | Configuração duplicada | Inativar a duplicata |

|------|--------|
| Relacionado | [Enquadramentos](./enquadramentos) |
| Relacionado | [Operações](../operacoes/cadastro-operacoes) |


| Campo | Descrição |
|-------|-----------|
| **Código** | Código do enquadramento |
| **Descrição** | Descrição da Infração |
| **Artigo CTB** | Artigo do Código de Trânsito Brasileiro |
| **Gravidade** | Leve, Média, Grave, Gravíssima |
| **Pontos** | Pontuação na CNH |
| **Valor da Multa** | Valor em reais |

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Enquadramentos](./enquadramentos) | Lista de enquadramentos |
| Relacionado | [Triagem](../infracoes/triagem) | Uso na triagem |

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Operações** | Cada operação usa as configurações de enquadramento para definir quais artigos CTB serão aplicados às passagens capturadas |
| **Triagem** | O enquadramento configurado é exibido automaticamente na tela de triagem para validação pelo analista |
| **Exportação** | O código de enquadramento é campo obrigatório no arquivo enviado ao órgão autuador |
| **Glossário — Enquadramento** | Explica o conceito legal por trás das configurações |
| Glossario | [Enquadramento](../glossario/enquadramento) | Definicao CTB |
