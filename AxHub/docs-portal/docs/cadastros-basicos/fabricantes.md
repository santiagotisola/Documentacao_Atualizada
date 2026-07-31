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

## Fluxo de integração de fabricante

1. Cadastrar o fabricante com **Nome** e **Slug** únicos em **Equipamentos → Fabricantes**
2. Clicar em **Gerar Novo Token** para criar o token de API
3. Comunicar o **Token** ao fabricante por canal seguro (nunca por e-mail simples)
4. Fabricante configura o token no sistema de captura de imagens
5. Verificar em **Operações → Monitoramento Online** se o equipamento começa a enviar dados
6. Em caso de troca de token: regenerar, comunicar ao fabricante e confirmar retomada do envio

## Tabela de referência — campos críticos

| Campo | Impacto se incorreto | Exemplo correto |
|-------|---------------------|:---------------:|
| **Slug** | Equipamentos não autenticam | `axion`, `velsis` |
| **Token** | API rejeitada com erro 401 | Gerado automaticamente |
| **Imagem Criptografada** | Imagens não decodificadas | Conforme documentação do fabricante |
| **Agrupador Sequencial** | Sequencial errado no lote | Código fornecido pelo órgão |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Equipamento não envia dados | Token inválido ou não configurado | Regenerar token e comunicar ao fabricante |
| Imagens corrompidas | Flag "Imagem Criptografada" incorreta | Verificar documentação do fabricante |
| Slug duplicado | Outro fabricante usa o mesmo identificador | Alterar para um slug único |
| Token regenerado sem avisar | Troca não comunicada ao fabricante | Comunicar novo token imediatamente |

## Relacionado

- [Equipamentos](./equipamentos)
- [Modelos de Equipamentos](./modelos-equipamentos)
- [Tipos de Equipamentos](./tipos-equipamentos)

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Modelos de Equipamentos** | Cada modelo é vinculado a um fabricante; sem esse vínculo o modelo não aparece no cadastro de equipamentos |
| **Equipamentos** | O fabricante é exibido na listagem e usado como filtro de busca |
| **API de Captura** | O token do fabricante autentica o envio de passagens e imagens via API |

## Perguntas frequentes

**O que acontece se o token do fabricante for regenerado sem aviso?**
O equipamento para de enviar dados imediatamente, pois o token anterior é invalidado. Comunique o novo token ao fabricante por canal seguro antes de regenerar.

**Posso ter vários fabricantes com o mesmo slug?**
Não. O slug deve ser único. Slugs duplicados causam conflito na autenticação da API e im pedem o envio de dados.

**As imagens criptografadas do fabricante não aparecem no sistema. O que verificar?**
Confira se a opção “Imagem Criptografada” está marcada corretamente no cadastro do fabricante, conforme a documentação técnica do dispositivo.
| **Relatórios** | Permite filtrar relatórios por fabricante para análise de desempenho por marca |
