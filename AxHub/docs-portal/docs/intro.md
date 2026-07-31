---
sidebar_position: 1
slug: /
title: Visão Geral
---

# AxHub — Manual do Usuário

Bem-vindo ao manual do Usuário do **AxHub**, o sistema de gestão de Equipamentos de trânsito da Axion Tecnologia.

## O que é o AxHub?

O AxHub é uma plataforma completa para **gestão de Equipamentos de fiscalização de trânsito**, integrando radares metrológicos e não metrológicos, câmeras OCR e balanças de pesagem.

## Estrutura do Sistema

| # | Módulo | Descrição |
|---|--------|-----------|
| 1 | [Primeiros Passos](./primeiros-passos/login) | Login navegação e Dashboard |
| 2 | [Infrações](./infracoes/triagem) | Triagem, auditoria, consulta e exportação |
| 3 | [Cronotacógrafo](./cronotacografo/consulta) | Consulta e processamento de cronotacógrafos |
| 4 | [Balança](./pesagem/postos) | Pesagem e controle de excesso de peso |
| 5 | [Operações](./operacoes/cadastro-operacoes) | Configuração e gestão de operações |
| 6 | [Veículos](./veiculos/tipos-veiculos) | Cadastro e consulta de Veículos |
| 7 | [Equipamentos](./cadastros-basicos/Equipamentos) | Gestão de Equipamentos de fiscalização |
| 8 | [Medição](./medicoes/contratos) | Medições contratuais e índices de performance |
| 9 | [Relatórios](./relatorios/relatorio-infracoes) | Dashboards e Relatórios operacionais |
| 10 | [Controle de Acesso](./controle-acesso/usuarios) | Gestão de Usuários e permissões |
| 11 | [Administração](./administracao/configuracoes-sistema) | Configurações gerais do sistema |

## Como usar este manual

Use o **menu lateral** para navegar entre os módulos. Cada seção contém:

- **Como acessar** — caminho no menu do sistema
- **Campos** — descrição de cada campo com obrigatoriedade
- **Passo a passo** — procedimento detalhado
- **Boas práticas** — orientações operacionais
- **Relacionado** — links para módulos complementares

## Suporte

Em caso de dúvidas sobre o sistema:
- **Portal de chamados**: suporte.axiontecnologia.com.br
- **E-mail**: suporte@axiontecnologia.com.br
- **Telefônica**: (62) 3000-0000 (dias úteis 8h-18h)

:::info
Este manual é atualizado automaticamente a cada versão do sistema. Consulte sempre a versão online para garantir informações atualizadas.
:::

## Portais de documentação

| Portal | Produto | URL |
|--------|---------|-----|
| AxHub.Docs | Fiscalização eletrônica | /AxHub.Docs |
| AxTon.Docs | Pesagem veicular | /AxTon.Docs |
| AxCross.Docs | Monitoramento de cruzamentos | /AxCross.Docs |

## Integração entre módulos

Os módulos do AxHub trabalham de forma integrada:

```
Equipamentos (cadastro) → Operações (fiscalização)
    ↓
Passagens → Infrações geradas
    ↓
Triagem (validação) → Auditoria → Exportação
    ↓
Órgão autuador (DETRAN/DER)
    ↓
Medição contratual
```
- **Integrações** — tabelas e sistemas relacionados

:::tip Dica
Em cada tela do AxHub, você encontrará um link de ajuda que o direcionará diretamente para a documentação daquela funcionalidade.
:::

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Cronotacografo](./glossario/cronotacografo) | Ver definicao no glossario |
| Use Infração (com acento) de Transito](./glossario/infracao) | Ver definicao no glossario |
| [Medicao de Desempenho](./glossario/medicao-desempenho) | Ver definicao no glossario |
| [Triagem](./glossario/triagem) | Ver definicao no glossario |

## Erros comuns no AxHub

| Erro | Causa | Solução |
|------|-------|----------|
| Login sem acesso ao módulo | Permissão não concedida | Verificar Perfil de Acesso |
| Infração não exportada | Aferição vencida | Renovar certificação INMETRO |
| Lote rejeitado | Sequencial duplicado | Usar Relatório de Falhas de Sequenciais |
| Dashboard sem dados | Período sem operação | Verificar operações ativas |

## Perguntas frequentes

**O AxHub funciona em dispositivos móveis?**
Sim, a interface é responsiva e funciona em tablets e smartphones modernos.

**Com que frequência devo gerar a medição contratual?**
Mensalmente, dentro do prazo definido em contrato. Recomendado até o 5º dia útil do mês seguinte.

**O que fazer se um equipamento aparecer Offline no Dashboard?**
Verifique a conexão de rede do equipamento e abra um chamado em Operações → Eventos de Equipamentos.
