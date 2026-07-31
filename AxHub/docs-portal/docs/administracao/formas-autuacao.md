---
sidebar_position: 7
title: Formas de Autuação
description: Cadastro das formas de autuação utilizadas no processo de fiscalização do AxHub
---

# Formas de Autuação

Define **como a autuação é lavrada** no sistema. A forma correta garante compatibilidade com o sistema do órgão autuador na exportação das infrações.

## Como acessar

**Menu lateral** → Configurações → **Formas de Autuação**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Código exigido pelo órgão autuador |
| **Descrição** | Sim | Descrição da forma de autuação |
| **Status** | Sim | Ativo ou Inativo |

## Formas comuns

| Código | Descrição |
|--------|-----------|
| **AIT-E** | Auto de Infração de Trânsito Eletrônico |
| **NOT-E** | Notificação Eletrônica |
| **AIT-M** | Auto de Infração de Trânsito Manual |

## Passo a passo

1. Acesse **Configurações → Formas de Autuação**
2. Clique em **+ Nova**
3. Preencha o **Código** e a **Descrição**
4. Clique em **Salvar**

:::info
As formas de autuação são configuradas conforme exigência do órgão autuador. Usar o código correto garante que o lote exportado seja aceito.
:::

## Boas práticas

- Confirme com o órgão autuador quais códigos são aceitos no sistema de destino antes de configurar
- Nunca altere o código de uma forma de autuação já em uso — pode invalidar infrações exportadas
- Cadastre apenas as formas exigidas pelo contrato vigente para reduzir o risco de seleção incorreta
- Em caso de dúvida, consulte o layout de exportação fornecido pelo órgão autuador

## Relacionado

- [Enquadramentos](./enquadramentos)
- [Sequenciais de Infrações](./sequenciais-infracoes)
- [Lote de Exportação](../glossario/lote-exportacao)

## Exemplos de uso

**AIT-E (Auto de Infração Eletrônico):**  
Usado para infrações de vel. eletrônica e avanço de sinal. O código é exigido no campo `FormaAutuacao` do arquivo de exportação ao DENATRAN.

**NOT-E (Notificação Eletrônica):**  
Usado na fase de notificação anterior à lavratura do auto. Alguns órgãos exigem essa etapa antes do AIT.

## Tabela de referência

| Código | Descrição | Quando usar |
|--------|-----------|-------------|
| **AIT-E** | Auto de Infração Eletrônico | Infração confirmada na triagem |
| **NOT-E** | Notificação Eletrônica | Fase de notificação prévia |
| **AIT-M** | Auto Manual | Operações sem equipamento eletrônico |
| **RES** | Resolução DENATRAN | Código específico por portaria |

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Lote rejeitado por código inválido | Código não aceito pelo órgão | Confirmar código com o contratante |
| Forma errada usada em infração | Configuração da operação incorreta | Revisar operação antes de exportar |
| Duplicidade de códigos | Dois registros com mesmo código | Inativar o duplicado |

3. Informe o **Código** e a **Descrição**
4. Clique em **Salvar**

:::caution
Verifique com o órgão autuador (DETRAN/DER/Prefeitura) quais códigos são aceitos no sistema destino antes de configurar.
:::

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Enquadramentos](./enquadramentos) | Tabela CTB |
| Relacionado | [Exportação](../infracoes/exportacao) | Lote de exportação |

| **Ativo** | Status do registro |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Enquadramentos](./enquadramentos) | Enquadramentos vinculados |
| Relacionado | [Exportacao](../infracoes/exportacao) | Exportacao com forma |
| Glossario | [Autuacao](../glossario/autuacao) | Definicao CTB |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Lote rejeitado por código de forma inválido | Código não corresponde ao esperado pelo órgão | Confirmar códigos aceitos no layout de exportação e corrigir |
| Infração sem forma de autuação associada | Forma inativa ou não configurada | Verificar se a forma está ativa e vinculada à operação |
| Duplicidade de autos por forma igual | Configuração de sequencial incorreta | Revisar sequenciais por forma de autuação nas Configurações |

## Perguntas frequentes

**Posso alterar o código de uma forma de autuação já usada em infrações exportadas?**
Não. Alterar o código invalida a rastreabilidade das infrações já enviadas ao órgão. Inative a forma antiga e crie uma nova com o código correto.

**Quantas formas de autuação posso ter ativas ao mesmo tempo?**
O sistema não impõe limite, mas recomenda-se cadastrar apenas as formas exigidas pelo contrato vigente para reduzir o risco de seleção incorreta durante a triagem.

**Por que meu lote foi rejeitado com erro de forma de autuação?**
Provavelmente o código cadastrado não corresponde ao esperado pelo sistema do órgão autuador. Confirme os códigos aceitos no layout de exportação fornecido pelo contratante.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Exportação de Infrações** | O código da forma de autuação é incluído em cada registro do lote exportado ao órgão autuador |
| **Layouts de Arquivos** | O campo da forma de autuação é mapeado no layout de exportação configurado em **Administração → Layouts** |
| **Triagem** | O operador seleciona ou confirma a forma de autuação ao validar a infração antes de incluí-la no lote |
| **Sequenciais de Infrações** | A numeração sequencial dos autos é controlada por forma de autuação, garantindo unicidade por tipo |
