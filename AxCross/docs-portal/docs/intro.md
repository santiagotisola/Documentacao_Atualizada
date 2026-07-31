---
sidebar_position: 1
slug: /
title: Visão Geral
---

# AxCross — Manual do Usuário

Bem-vindo ao manual do usuário do **AxCross**, plataforma de monitoramento e gestão de cruzamentos viários da **Axion Tecnologia**.

## O que é o AxCross?

O AxCross integra câmeras, sensores e equipamentos de fiscalização instalados em cruzamentos e vias para capturar e processar passagens de veículos em tempo real. O sistema permite:

- **Identificar e rastrear** placas por OCR automático em todas as faixas monitoradas
- **Monitorar veículos** cadastrados em listas de interesse com alertas automáticos
- **Gerar relatórios** operacionais para fiscalização, auditoria e inteligência policial
- **Visualizar** a operação em tempo real por mapa, mural de câmeras e dashboard
- **Controlar o acesso** de operadores com perfis e permissões individualizados

## Módulos do sistema

| Módulo | Função principal |
|---|---|
| **Dashboard** | Indicadores operacionais em tempo real — passagens, alertas e ocorrências |
| **Veículos Monitorados** | Cadastro de placas de interesse com alertas automáticos de detecção |
| **Equipamentos** | Gestão de câmeras, sensores, grupos, áreas, locais, faixas e importação |
| **Monitoramento** | Acompanhamento em tempo real — status de câmeras e Mural de Câmeras |
| **Relatórios** | 10 relatórios operacionais com exportação em PDF, Excel e CSV |
| **Configurações** | Parâmetros do sistema, usuários, perfis, permissões, logs e sincronização |

## Como utilizar este manual

Cada página do manual segue a mesma estrutura:

- **Descrição** — o que a tela faz e quando deve ser usada
- **Como acessar** — caminho exato no menu do sistema
- **Campos** — tabela com cada campo do formulário, se é obrigatório e o que representa
- **Passo a passo** — sequência de ações para executar a operação
- **Dicas e avisos** — alertas importantes, boas práticas e atalhos operacionais

## Requisitos de acesso

- Credenciais fornecidas pelo administrador do sistema
- Navegador moderno (Chrome, Edge ou Firefox)
- Conexão com a rede interna da organização

## Primeiros passos

1. Acesse a URL do sistema fornecida pela sua organização
2. Faça login com as credenciais recebidas
3. No primeiro acesso, altere a senha imediatamente
4. Explore o menu lateral para conhecer os módulos disponíveis
5. Consulte a documentação de cada módulo pelo menu lateral esquerdo

## Como começar

Se é o seu primeiro acesso ao AxCross, siga este roteiro:

1. **Faça o login** — acesse a URL do sistema e entre com as credenciais fornecidas pelo administrador
2. **Explore o Dashboard** — veja os indicadores em tempo real de passagens, alertas e equipamentos ativos
3. **Configure veículos monitorados** — cadastre placas de interesse em **Veículos Monitorados → Cadastro**
4. **Verifique os equipamentos** — confirme que todos os cruzamentos estão com câmeras online
5. **Gere seu primeiro relatório** — acesse **Relatórios → Rastreamento de Placas** para consultar passagens de uma placa

:::tip Perfis recomendados por função
| Função | Módulos essenciais |
|--------|-------------------|
| **Operador** | Monitoramento Online, Veículos Monitorados, Relatórios |
| **Supervisor** | Todos os módulos operacionais + Alertas |
| **Administrador** | Acesso total incluindo Configurações e Permissões |
:::

## Suporte

Em caso de dúvidas sobre o sistema, entre em contato:
- **Portal de chamados**: suporte.axiontecnologia.com.br
- **E-mail**: suporte@axiontecnologia.com.br

## Integração dos módulos

```
Equipamentos (cadastro) → Faixas → Passagens registradas
    ↓
Veículos monitorados? → Sim → Alerta gerado
    ↓
Ocorrência tratada → Relatório de Ocorrências
```

:::info
Este manual é atualizado a cada nova versão do sistema. Consulte sempre a versão online para informações atualizadas.
:::
| Requisito | Detalhe |
|---|---|
| **Credenciais** | Usuário e senha fornecidos pelo administrador do sistema |
| **Navegador** | Google Chrome, Mozilla Firefox ou Microsoft Edge (versão atualizada) |
| **Rede** | Conexão com a rede onde o AxCross está hospedado |
| **Perfil** | O acesso a cada módulo depende das permissões do perfil do usuário |

:::info Suporte técnico
Em caso de dúvidas ou problemas, entre em contato com o administrador do sistema da sua organização ou com o suporte da **Axion Tecnologia**.
:::

## Erros comuns no AxCross

| Erro | Causa | Solução |
|------|-------|----------|
| Alerta não gerado | Veículo não cadastrado | Cadastrar em Veículos Monitorados |
| Câmera Offline | Falha de conexão | Verificar rede e equipamento |
| Passagens não aparecem | Sincronização atrasada | Executar Sincronização de Passagens |
| Relatório vazio | Faixa sem equipamento | Vincular equipamento à faixa |

## Perguntas frequentes

**Quantos equipamentos posso monitorar?**
Não há limite no sistema. O desempenho depende da infraestrutura do servidor.

**O AxCross funciona com qualquer câmera OCR?**
Compatibilidade depende do modelo. Consulte o suporte para homologação de novos modelos.

**Quanto tempo os dados de passagem ficam armazenados?**
Conforme configuração do servidor. O padrão é 12 meses antes da expurgão automática.
