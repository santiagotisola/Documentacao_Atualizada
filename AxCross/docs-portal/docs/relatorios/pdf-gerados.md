---
sidebar_position: 6
title: PDF Gerados
description: Consulta e download de relatórios PDF gerados no AxCross
---

# PDF Gerados

Lista todos os relatórios em formato **PDF já gerados** pelo sistema, permitindo download, visualização e reprocessamento sem precisar executar novamente os filtros.

## Como acessar

No **menu lateral**, clique em **Relatórios** e selecione **PDF Gerados**.

![Relatórios Gerados](<../img/Relatórios Gerados.png>)

## Informações exibidas

| Campo | Descrição |
|-------|-----------|
| **Nome** | Tipo do relatório gerado |
| **Data de geração** | Quando foi gerado |
| **Período** | Período de dados do relatório |
| **Usuário** | Quem gerou |
| **Status** | Concluído / Processando / Erro |

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Download** | Baixar o PDF gerado |
| **Visualizar** | Abrir no navegador |
| **Reprocessar** | Regenerar o relatório |
| **Excluir** | Remover da lista |

:::tip
Relatórios pesados (muitos registros) ficam na lista de PDF Gerados para download posterior, sem travar a tela.
:::

|-------|-----------|
| **Nome do Arquivo** | Nome identificador do Relatório gerado |
| **Tipo** | Tipo de Relatório (Passagens, Ocorrências, Veículos Monitorados, etc.) |
| **Período** | Intervalo de datas do Relatório |
| **Gerado por** | Usuário que solicitou a geração |
| **Data de Geração** | Data e hora em que o PDF foi criado |
| **Status** | Processando, Concluído, Erro |

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Download** | Baixar o arquivo PDF gerado |
| **Visualizar** | Abrir o PDF diretamente no navegador |
| **Reprocessar** | Gerar novamente o Relatório (quando houver erro) |
| **Excluir** | Remover o arquivo da lista |

## Passo a passo — Baixar um Relatório

1. Acesse **Relatórios → PDF Gerados** no menu lateral
2. Localize o Relatório na lista (use a pesquisa se necessário)
3. Clique no ícone de **Download** na coluna Ação
4. O arquivo será baixado para o seu computador

:::tip Relatórios pendentes
Relatórios com grande volume de dados podem levar alguns minutos para serem gerados. Se o status aparecer como "Processando", aguarde e atualize a página.
:::

:::info Retenção de arquivos
PDFs gerados ficam disponíveis por um período limitado conforme a política de retenção configurada no sistema. Faça o download dos Relatórios importantes para armazenamento externo.
:::

## Fluxo de geração de PDF

1. Usuário acessa qualquer relatório com suporte a exportação PDF
2. Aplica filtros e clica em **Exportar PDF**
3. Sistema processa em background (especialmente relatórios com muitos registros)
4. Arquivo fica disponível em **Relatórios → PDF Gerados** com status **Concluído**
5. Usuário acessa a lista e faz o **Download**
6. Para relatórios com erro, clica em **Reprocessar**

## Perguntas frequentes

**Por que um relatório gerado aparece com status "Erro" na lista?**
Isso geralmente indica falha no processamento em background, como timeout por excesso de dados ou problema temporário de sistema. Clique em **Reprocessar** para tentar novamente. Se persistir, reduza o período do relatório para diminuir o volume de dados processados.

**Por quanto tempo os PDFs gerados ficam disponíveis na lista para download?**
O período de retenção é configurado pela equipe técnica de acordo com a política de cada implantação. Faça o download e armazene externamente os relatórios que precisam de retenção por mais tempo (ex.: relatórios mensais de prestação de contas).

**Por que o relatório aparece com status "Processando" há muito tempo?**
Relatórios com grande volume de dados podem demorar vários minutos. Se o status não mudar após 15 minutos, contate o suporte técnico, pois pode ter ocorrido um problema no serviço de processamento em background.

## Tabela de referência — relatórios que geram PDF

| Relatório | Inclui imagens | Tempo estimado |
|-----------|:--------------:|:---------------:|
| Passagens (até 500 reg.) | Sim | < 1 min |
| Passagens (acima de 500) | Sim | 2 – 5 min |
| Ocorrências e Alertas | Não | < 1 min |
| Veículos Monitorados | Sim | 1 – 3 min |
| Rastreamento de Placas | Sim | 1 – 2 min |

## Erros comuns

| Status | Causa provável | Solução |
|--------|---------------|----------|
| **Processando** longo tempo | Volume muito grande de registros | Aguardar ou reduzir o período |
| **Erro** na geração | Falha de memória ou servidor | Clicar em **Reprocessar** |
| PDF não disponível para download | Política de retenção expirou | Gerar novamente |
| Imagens ausentes no PDF | Imagem original não indexada | Verificar sincronização |

## Relacionado

- [Relatório de Passagens](./relatorio-passagens)
- [Ocorrências e Alertas](./ocorrencias-alertas)
- [Veículos Monitorados](./veiculos-monitorados)

## Boas práticas

- Para relatórios com grande volume de dados, aguarde o status **Concluído** antes de baixar — PDFs em status **Processando** podem estar incompletos
- Faça download dos relatórios críticos imediatamente após a geração para garantir que estejam disponíveis dentro do período de retenção
- Use **Reprocessar** somente quando o status for **Erro** — verifique se os filtros originais ainda são válidos antes de regenerar
- Nomeie e arquive os PDFs gerados com contexto (data, tipo, operador) para referência futura em auditorias

## Integração com outros módulos

| Módulo | Como se relaciona com PDFs Gerados |
|--------|------------------------------------|
| **Relatório de Passagens** | Os PDFs de passagens gerados ficam listados aqui para redownload |
| **Ocorrências e Alertas** | PDFs de ocorrências gerados também aparecem na fila |
| **Veículos Monitorados** | Relatórios de veículos monitorados com imagens ficam disponíveis aqui |

## Tabela de referência rápida

| Situação | Configuração recomendada | Observação |
|----------|:------------------------:|------------|
| Relatório pesado (>500 reg.) | Gerar via botão Exportar PDF e aguardar em PDF Gerados | Não aguardar na mesma tela |
| Relatório urgente para entrega | Reduzir o período para acelerar a geração | Períodos de 1-7 dias são mais rápidos |
| Status "Erro" persistente | Clicar em Reprocessar após verificar filtros | Reduzir período se o erro persistir |
| PDF expirado (fora do período de retenção) | Gerar novamente com os mesmos filtros | Arquivar PDFs críticos localmente |
| Relatório mensal para prestação de contas | Exportar até o 5º dia do mês seguinte | Evitar geração tardia após expiração |
| **Rastreamento de Placas** | PDFs de rastreamento ficam acessíveis para download posterior |

