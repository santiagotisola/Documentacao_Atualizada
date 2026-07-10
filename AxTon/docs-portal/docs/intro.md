---
sidebar_position: 1
slug: /
title: Visão Geral
---

# AxTon — Manual do Usuário v1.0.0

![Menu Principal do AxTon](./img/Menu%20principal%20-%20Axton.png)

Bem-vindo ao manual do Usuário do **AxTon**, o sistema de gestão de pesagem veicular da Axion Tecnologia.

**Versão do sistema:** v1.0.0  
**Última atualização do manual:** Junho/2026  
**Documentação online:** [http://localhost:3011/AxTon.Docs](http://localhost:3011/AxTon.Docs)

---

## O que é o AxTon?

O AxTon é uma plataforma web destinada ao **controle e monitoramento de pesagem de Veículos em rodovias**, integrando postos de pesagem, balanças HAENNI, classificação de Veículos e geração automatizada de registros de Infração por excesso de peso. O sistema opera em postos de pesagem nos estados do Piauí (PI), Goiás (GO), Ceará (CE) e Paraíba (PB).

### Ciclo operacional completo

```mermaid
flowchart LR
    A[Veículo chega ao posto] --> B[Operador inicia pesagem]
    B --> C[Seleciona classificação]
    C --> D[Informa placa]
    D --> E[Balança HAENNI mede peso]
    E --> F{Excesso?}
    F -->|Sim| G[Gera Infração automaticamente]
    F -->|Não| H[Libera Veículo
    G --> I[Exporta para órgão autuador]
```

### Módulos do sistema

| Módulo | Descrição | Acesso |
|--------|-----------|--------|
| **Iniciar Pesagem** | Fluxo completo de pesagem veicular com balança HAENNI | Menu lateral |
| **Tickets de Pesagens** | Registro de todas as pesagens (abertos e fechados) | Menu lateral |
| **Operações** | Cadastro e controle de operações de fiscalização em campo | Menu lateral |
| **Exportação** | Envio de Infrações em lotes ao órgão autuador (XTraffic/AxHub) | Menu lateral |
| Relatório de Pesagem** | Consulta consolidada com exportação em PDF | Menu lateral |
| **Cadastros** | Locais, classificações de Veículos sequenciais | Menu lateral → Cadastros |
| **Sistema** | Configurações de balança, câmera IP, tolerâncias, integração AxHub | Menu lateral → Sistema |
| **Administração** | Usuários perfis de acesso, permissões | Menu lateral |

### Inteligência do sistema

O AxTon automatiza os seguintes cálculos:

1. **Cálculo de excesso de PBT** — Compara peso medido com PBT regulamentado + tolerância configurada
2. **Cálculo de excesso por eixo** — Verifica cada grupo de eixos individualmente
3. **Geração automática de Infração — Quando detecta excesso, cria o registro com enquadramento legal
4. **Numeração sequencial** — Controla automaticamente os números de auto de Infração
5. **Integração com AxHub** — Exporta dados para o sistema central de fiscalização

---

## Como utilizar este manual

Utilize o **menu lateral** para navegar entre os módulos do sistema. Cada seção contém:

- **Descrição da funcionalidade** — o que a tela realiza e quando deve ser utilizada
- **Campos** — tabela descritiva de cada campo do formulário
- **Passo a passo** — sequência de ações para executar a operação (com narração para vídeo)
- **Regras de negócio** — lógica interna e cálculos realizados pelo sistema
- **Alertas e observações** — informações importantes sobre restrições ou cuidados necessários

---

## Requisitos de acesso

| Requisito | Detalhe |
|-----------|---------|
| **Credenciais** | Nome de Usuário e senha fornecidos pelo administrador |
| **Navegador** | Google Chrome, Mozilla Firefox ou Microsoft Edge (versão atualizada) |
| **Rede** | Conexão com a rede local onde o servidor AxTon está instalado |
| **Balança** | Equipamento HAENNI conectado e configurado (para operações de pesagem) |
| **Câmera IP** | Configurada em Sistema → Câmera IP (para captura de imagens dos Veículos |

---

## Postos de pesagem em operação

| Código | Localização | Rodovia |
|--------|-------------|---------|
| **PI503B** | Uruçuí — PI | PI 247, KM 115, Rod. Eng. Vasco Filho |
| **PI504B** | Uruçuí — PI | PI 247, Divisa PI/MA |
| **PI505B** | Bertolínia — PI | BR 135, KM 120, Posto SEFAZ |

---

:::info Suporte técnico
Em caso de dúvidas ou problemas, entre em contato com o suporte da Axion Tecnologia:
- **E-mail:** [suporte@axiontecnologia.com.br](mailto:suporte@axiontecnologia.com.br)
- **Helpdesk:** [desk.axiontecnologia.com.br](https://desk.axiontecnologia.com.br)
- **WhatsApp:** Canal de atendimento 24/7
:::
