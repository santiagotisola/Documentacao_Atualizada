---
sidebar_position: 4
title: Exportação
description: Exportação de Infrações validadas para órgãos autuadores
---

# Exportação

A tela de Exportação permite enviar as Infrações validadas pelo fluxo de triagem e auditoria para os órgãos autuadores (DETRAN, DER, PRF, etc.), gerando os arquivos nos layouts exigidos por cada órgão.

![Tela de Exportação de Infrações](../img/triagem-exportacao.png)

## Como acessar

**Menu lateral** → Infrações → **Exportação**

## Como usar

1. Acesse Infrações → Exportação**
2. Configure o lote:
   - **Órgão destino**: DETRAN, Prefeitura, DER, PRF, etc.
   - **Período**: Infrações a exportar por data
   - **Status**: Apenas Infrações auditadas e válidas
   - **Layout**: Formato do arquivo (configurado em Administração → Layouts Arquivos)
3. Clique em **Gerar lote** — o sistema válida os dados, gera o arquivo e cria o hash de assinatura digital
4. Clique em **Enviar lote** via SFTP/API ou faça o download para envio manual

## Formatos suportados

| Formato | Descrição |
|---------|-----------|
| **RENAINF** | Padrão nacional para Infrações de trânsito |
| **XML** | Layout customizável por órgão |
| **TXT** | Arquivo texto com delimitadores definidos |
| **CSV** | Para importação em sistemas legados |

## Validações realizadas antes da exportação

- ✅ Placa válida e legível
- ✅ Imagens em qualidade adequada
- ✅ Dados de local e Equipamento completos
- ✅ Enquadramento legal correto
- ✅ Assinaturas digitais de triagem e auditoria presentes
- ✅ Infração não duplicada no lote
- ✅ Período de presção dentro do prazo legal

:::info
Os layouts de arquivo são configurados em **Administração → Layouts Arquivos**, com os campos e delimitadores exigidos por cada órgão autuador.
:::

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definicao no glossario |
| [Lote de Exportacao](../glossario/lote-exportacao) | Ver definicao no glossario |
| [Triagem](../glossario/triagem) | Ver definicao no glossario |
## Erros comuns na exportação

| Erro | Causa | Solução |
|------|-------|----------|
| Lote rejeitado por layout inválido | Formato do arquivo não aceito | Verificar configuração do layout |
| Infração não incluída no lote | Status diferente de Auditada | Revisar o status das infrações |
| Sequencial duplicado no lote | Número já utilizado | Executar Falhas de Sequenciais antes |
| Placa fora do formato aceito | Placa Mercosul não configurada | Verificar layout de exportação |
| AIT fora do prazo legal | Infração com > 30 dias sem exportar | Monitorar backlog de triagem diariamente |

## Fluxo de exportação

1. Garantir que infrações estão com status **Auditada**
2. Verificar **Falhas de Sequenciais** (Relatórios → Falhas Sequenciais)
3. Acessar **Infrações → Exportação** e configurar o lote
4. Clicar em **Gerar Lote** e aguardar validação automática
5. Enviar via SFTP/API ou fazer download para envio manual
6. Confirmar recebimento e guardar protocolo por 5 anos
---

:::info Dica
Em caso de erros na exportação de lotes, utilize o assistente **AxionIA** (botão no canto inferior direito) para obter orientações detalhadas de correção.
:::

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Etapa anterior | [Auditoria](./auditoria) | Revisao final antes da exportacao |
| Configuracao | [Layouts de Arquivos](../administracao/layouts-arquivos) | Formatos |
| Configuracao | [Sequenciais de Lote](../administracao/sequenciais-lote-exportacao) | Numeracao |
| Glossario | [Lote de Exportacao](../glossario/lote-exportacao) | Definicao tecnica |
| Glossario | [Autuacao](../glossario/autuacao) | Ato de autuacao |

## Perguntas frequentes

**O que fazer quando o lote é rejeitado pelo órgão autuador?**
Identifique o erro na mensagem de rejeição do órgão. As causas mais comuns são: layout incorreto, campo obrigatório vazio ou infração fora do prazo legal. Corrija e gere um novo lote.

**Infrações com mais de 30 dias ainda podem ser exportadas?**
Depende da legislação do órgão autuador. O prazo de prescrição varia entre órgãos. Monitore o backlog diariamente para evitar infrações vencidas.

**Posso exportar infrações parcialmente (parte auditada)?**
Sim. O lote pode conter apenas as infrações com status Auditada até o momento da exportação. As demais permanecem em fila para o próximo lote.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Infrações — Auditoria](./auditoria)** | Apenas infrações com status **Auditada** podem ser incluídas em um lote de exportação |
| **[Layouts de Arquivos](../administracao/layouts-arquivos)** | O layout configurado determina o formato do arquivo exportado; órgãos diferentes exigem layouts diferentes |
| **[Sequenciais de Lote](../administracao/sequenciais-lote-exportacao)** | O número sequencial do lote é gerado automaticamente conforme a configuração; duplicidade de sequencial causa rejeição |
| **[Falhas Sequenciais](../relatorios/falhas-sequenciais)** | Verifique este relatório antes de exportar para identificar lacunas sequenciais que podem causar rejeição do lote |
