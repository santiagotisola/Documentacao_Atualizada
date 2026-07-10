---
sidebar_position: 1
title: Fabricantes
description: Cadastro de fabricantes de Equipamentos de trânsito
---

# Fabricantes

O cadastro de fabricantes permite registrar as empresas que fabricam os Equipamentos de trânsito integrados ao AxHub. Cada fabricante possui credenciais de API para envio de dados ao sistema.

## Como acessar

**Menu lateral** → Equipamentos → **Fabricantes**

## Listagem

![Tela de Fabricantes - Lista](../img/Fabricantes%20-%20Lista.png)

A tela de listagem exibe todos os fabricantes cadastrados no sistema.

### Funcionalidades da listagem

| Ação | Descrição |
|------|-----------|
| **+ Novo** | Abre o formulário para cadastrar um novo fabricante |
| **Excel** | Exporta a lista de fabricantes para planilha Excel |
| **Pesquisa** | Filtra fabricantes pelo nome |
| **Editar** (ícone lápis) | Abre o cadastro do fabricante para edição |
| **Excluir** (ícone X) | Remove o fabricante do sistema |

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do fabricante (ordenável) |
| **Ações** | Botões de editar e excluir |

## Cadastro

![Tela de Fabricantes - Cadastro](../img/Fabricantes%20-%20Cadastro.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome do fabricante |
| **Slug** | Sim | Identificador único em formato URL (ex: "axion"). Usado internamente para identificar o fabricante nas integrações |
| **Agrupador Sequencial** | Não | Código para agrupar sequenciais de Infrações por fabricante |
| **Código do Fabricante** | Não | Código externo do fabricante |
| **Token** | — | Token de autenticação gerado automaticamente. Usado pelo fabricante para enviar dados via API |
| **Certificado** | Não | Certificado digital do fabricante para comunicação segura |
| **Imagem Criptografada** | Não | Indica se as imagens enviadas pelo fabricante são criptografadas |

### Ações do formulário

| Botão | Descrição |
|-------|-----------|
| **Voltar** (seta para esquerda) | Retorna à listagem sem salvar |
| **Salvar** | Grava o fabricante no sistema |
| **Gerar Novo Token** | Gera um novo token de autenticação para o fabricante |

### Passo a passo — Cadastrar fabricante

1. Na listagem, clique em **+ Novo**
2. Preencha o **Nome** do fabricante
3. Preencha o **Slug** (identificador único, sem espaços ou caracteres especiais)
4. Preencha os demais campos conforme necessário
5. Clique em **Salvar**
6. Após salvar, clique em **Gerar Novo Token** para criar o token de API

:::warning Atenção
Ao clicar em **Gerar Novo Token**, o token anterior será invalidado. Certifique-se de comunicar o novo token ao fabricante, pois o envio de dados via API passará a exigir o novo token.
:::

:::info Token de API
O token é utilizado pelo fabricante para autenticar as chamadas de API ao AxHub. Sem um token válido, o fabricante não conseguirá enviar passagens e imagens ao sistema.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](./equipamentos) | Equipamentos do fabricante |
| Relacionado | [Modelos](./modelos-equipamentos) | Modelos do fabricante |
