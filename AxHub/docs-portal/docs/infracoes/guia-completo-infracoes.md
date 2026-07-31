---
sidebar_position: 1
title: "Guia Completo: Processo de Infração"
description: Passo a passo completo do fluxo de Infrações no AxHub — da captura à exportação
---

# Guia Completo — Processo de Infração

Este guia explica **todo o fluxo de uma Infração no AxHub, desde o momento em que o Equipamento registra a Infração até o envio para o órgão autuador (DETRAN, DER, Prefeitura, etc.).

---

## Visão Geral do Fluxo

O processo de Infração no AxHub segue **5 etapas** obrigatórias:

```
 📷 CAPTURA → O Equipamento registra a Infração na via
      ↓
 📥 IMPORTAÇÃO → Os dados chegam ao AxHub automaticamente
      ↓
 🔍 TRIAGEM → O analista revisa e válida ou descarta
      ↓
 ✅ AUDITORIA → O auditor confere o trabalho do analista
      ↓
 📤 EXPORTAÇÃO → O sistema gera o arquivo e envia ao órgão
```

:::tip Analogia simples
Pense no processo como uma **linha de produção**:
- O Equipamento **fotografa** a Infração (matéria-prima)
- O analista **inspeciona** se está tudo correto (controle de qualidade 1)
- O auditor **confere** o trabalho do analista (controle de qualidade 2)
- O sistema **empacota** e envia ao órgão (expedição)
:::

---

## Etapa 1 — Captura e Importação

### O que acontece?

O Equipamento de fiscalização** (radar, lombada eletrônica, câmera, etc.) detecta a Infração e registra automaticamente:

- 📸 **Imagens** do Veículo (frente e/ou traseira)
- 🚗 **Placa** do Veículo (via OCR — leitura automática)
- ⏱️ **Data e hora** da Infração
- 🏎️ **Velocidade medida** (se for Infração de velocidade)
- 📍 **Local** Equipamento e faixa)

Esses dados são enviados ao AxHub em **lotes de importação** e ficam disponíveis com o status **"Aguardando Triagem"**.

:::info Exceções automáticas
Se houver [regras de exceção](./excecoes) configuradas (ex: placas de emergência, horários especiais), o sistema **descarta automaticamente** as Infrações que se enquadrem nessas regras durante a importação.
:::

---

## Etapa 2 — Triagem Análise do Analista)

A Triagem é a etapa onde o **analista humano** revisa cada Infração para garantir que os dados estão corretos antes de seguir para auditoria.

### Como acessar

**Menu lateral** → Infrações → **Triagem**

![Acesso ao menu de Triagem](../img/triagem-menu-principal.png)

### Passo a passo da Triagem

#### Passo 1 — Abrir a tela de Triagem

Clique em Infrações → Triagem** no menu lateral. Você verá a tela com todas as Infrações pendentes.

![Tela de consulta de Infrações na Triagem](../img/triagem-consultar-infracoes.png)

#### Passo 2 — Filtrar as Infrações (opcional)

Use os filtros para encontrar Infrações específicas:

| Filtro | Para que serve | Exemplo |
|--------|----------------|---------|
| **Período** | Buscar por data | Infrações de ontem |
| **Status** | Ver só pendentes, validadas ou descartadas | Só "Pendentes" |
| **Tipo de Infração | Velocidade, sinal, faixa, etc. | Só "Velocidade" |
| **Operação** | Filtrar por operação de fiscalização | Operação 001 |

#### Passo 3 — Analisar cada Infração

Para cada Infração analista deve verificar:

| O que verificar | Como verificar | Motivo |
|-----------------|----------------|--------|
| **Placa legível?** | Olhar a imagem — a placa precisa estar clara e legível | Se a placa não der para ler, a Infração não é válida |
| Veículo correto?** | Confirmar que não é outro Veículo ou obstrução | Garantir que o Veículo na foto é o que cometeu a Infração |
| **Velocidade coerente?** | Comparar velocidade medida × regulamentada | A velocidade considerada deve ser maior que a regulamentada |
| **Enquadramento correto?** | Verificar se o tipo de Infração está certo | Ex: Infração de sinal vermelho com enquadramento correto |
| **Imagem em boa qualidade?** | Verificar se a imagem não está borrada ou escura | Imagens ruins invalidam a Infração |

#### Passo 4 — Decidir: Validar ou Descartar

| Decisão | Quando usar | O que acontece |
|---------|-------------|----------------|
| ✅ **Validar** | Tudo está correto | A Infração segue para **Auditoria** |
| ❌ **Descartar** | Algo está errado | A Infração é rejeitada e registra-se o **motivo** |
| 🔄 **Reabrir** | Descartou por engano | Reabre uma Infração descartada para nova Análise |

![Resultado da triagem com Infrações analisadas](../img/triagem-consultar-resultado.png)

:::warning Atenção: motivo obrigatório
Ao **descartar** uma Infração é **obrigatório** informar o motivo. Os motivos disponíveis são configurados em **Administração → Motivos de Descarte**.
:::

### Resumo visual da Triagem

```
  Infração chega com status "Pendente"
          ↓
  Analista abre e verifica imagem + dados
          ↓
     Está tudo OK?
     ╱ ╲
  SIM NÃO
   ↓ ↓
Validar Descartar
   ↓ (com motivo)
 Status: ↓
"Válida" Status:
   ↓ "Descartada"
 Segue p/
Auditoria
```

---

## Etapa 3 — Auditoria (Revisão do Auditor)

A Auditoria é a etapa de **controle de qualidade** — um segundo profissional (auditor) confere o trabalho feito pelo analista na triagem.

### Como acessar

**Menu lateral** → Infrações → **Auditoria**

![Tela de Auditoria de Infrações](../img/triagem-auditoria.png)

### Passo a passo da Auditoria

#### Passo 1 — Configurar filtros

Use os filtros para definir o escopo da auditoria:

![Filtros avançados de Auditoria](../img/triagem-filtro-auditoria.png)

| Filtro | Para que serve |
|--------|----------------|
| **Faixa de data** | Período que será auditado |
| Equipamento | Auditar um Equipamento específico |
| **Tipo de Infração | Apenas velocidade, sinal, etc. |
| **Analista** | Conferir o trabalho de um analista específico |
| **Amostragem (%)** | Auditar apenas uma porcentagem (ex: 10%, 25%) |

:::tip Dica de produtividade
Para contratos que exigem auditoria parcial, use o campo **Amostragem** — o sistema seleciona aleatoriamente a porcentagem informada.
:::

#### Passo 2 — Analisar e decidir

O auditor vê a Infração exatamente como o analista viu, incluindo as imagens e todos os dados. As opções são:

| Decisão | Quando usar | O que acontece |
|---------|-------------|----------------|
| ✅ **Confirmar** | A decisão do analista está correta | A Infração segue para **Exportação** |
| ❌ **Rejeitar** | O analista errou (validou algo inválido ou vice-versa) | Retorna para a **Triagem** com observação |
| 📝 **Adicionar observação** | Quer registrar algo sem alterar o status | Apenas registra o comentário |

:::warning Cuidado com rejeições
Rejeições frequentes do mesmo analista aparecem nos Relatórios de qualidade** e devem ser investigadas pelo gestor.
:::

### Resumo visual da Auditoria

```
  Infração com status "Válida" (vinda da Triagem)
          ↓
  Auditor abre e revisa imagem + dados + decisão do analista
          ↓
    Análise correta?
     ╱ ╲
  SIM NÃO
   ↓ ↓
Confirmar Rejeitar
   ↓ (volta p/ Triagem
 Status: com observação)
"Auditada"
   ↓
 Segue p/
Exportação
```

---

## Etapa 4 — Exceções (Regras Automáticas)

As Exceções são **regras que descartam Infrações automaticamente** — antes mesmo de chegar à triagem. Servem para situações previstas em lei ou contrato.

### Como acessar

**Menu lateral** → Infrações → **Exceções**

![Tela de Gerenciamento de Exceções](../img/triagem-excecoes.png)

### Tipos de exceção

| Tipo | Exemplo | Duração |
|------|---------|---------|
| **Por placa** | Ambulâncias, viaturas, Veículos oficiais | Permanente |
| **Por horário** | Via escolar ativa só das 7h às 18h | Recorrente |
| **Por faixa** | Faixa em obras Equipamento desativado) | Temporária |
| **Por classificação** | Motocicletas isentas em determinada via | Permanente |
| **Por enquadramento** | Tipo de Infração não aplicável naquele local | Permanente |
| **Por data** | Feriado ou evento especial | Data específica |

:::danger Atenção
Exceções configuradas incorretamente podem **descartar Infrações válidas** sem que ninguém perceba. Revise periodicamente as regras ativas.
:::

---

## Etapa 5 — Exportação (Envio ao Órgão)

A Exportação é a **etapa final** — o sistema gera os arquivos com todas as Infrações auditadas e válidas para envio ao órgão autuador.

### Como acessar

**Menu lateral** → Infrações → **Exportação**

![Tela de Exportação de Infrações](../img/triagem-exportacao.png)

### Passo a passo da Exportação

#### Passo 1 — Configurar o lote

| Campo | O que preencher |
|-------|-----------------|
| **Órgão destino** | DETRAN, DER, PRF, Prefeitura, etc. |
| **Período** | Data inicial e final das Infrações |
| **Layout** | Formato exigido pelo órgão (RENAINF, XML, TXT, CSV) |

#### Passo 2 — Gerar o lote

Clique em **Gerar Lote**. O sistema faz automaticamente:

1. ✅ Verifica se a placa é válida e legível
2. ✅ Confere se as imagens estão em qualidade adequada
3. ✅ válida dados de local e Equipamento
4. ✅ Confirma o enquadramento legal correto
5. ✅ Verifica assinaturas digitais de triagem e auditoria
6. ✅ Checa se não há Infrações duplicadas no lote
7. ✅ Confirma que o prazo legal não foi ultrapassado

Se todas as Validações passarem, o **arquivo é gerado e assinado digitalmente**.

#### Passo 3 — Enviar o lote

| Método de envio | Descrição |
|-----------------|-----------|
| **SFTP** | Envio automático para servidor do órgão |
| **API** | Integração direta com sistema do órgão |
| **Download** | Baixar o arquivo para envio manual |

:::info Erros de exportação
Se alguma Infração não passou nas Validações o sistema mostra o erro detalhado. Use a **Consulta de Erros de Exportação** para investigar.
:::

---

## Etapa 6 — Consulta e Acompanhamento

### Consulta de Infrações

A qualquer momento, você pode consultar todas as Infrações no sistema, independente do status.

**Menu lateral** → Infrações → **Consulta de Infrações**

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Infração rejeitada pelo órgão | Placa incorreta ou enquadramento errado | Corrigir na triagem e reexportar |
| Lote não aceito | Sequencial duplicado | Verificar Falhas de Sequenciais |
| Imagem inválida | Resolução insuficiente | Calibrar equipamento |
| Prazo expirado | 30 dias após a infração | Infração prescrita — não pode ser exportada |

## Integração com outros módulos

| Módulo | Relação |
|--------|---------|
| **Triagem** | Valida as infrações capturadas |
| **Auditoria** | Revisa e aprova antes da exportação |
| **Lote de Exportação** | Envia ao órgão autuador |
| **Relatório de Infrações** | Acompanhamento e estatísticas |

## Perguntas frequentes

**Qual o prazo legal para exportar uma infração?**
30 dias a partir da data da infração (Art. 281 do CTB).

**Posso cancelar uma infração já exportada?**
Não diretamente no AxHub. Entre em contato com o órgão autuador.

**O sistema gera infrações automaticamente ou precisa de aprovação humana?**
O equipamento captura automaticamente. A triagem humana é obrigatória antes da exportação.
Filtros disponíveis:
- **Período** | Equipamento | **Placa** | **Status** | **Operação** | Usuário

Status possíveis de uma Infração

| Status | Significado | Etapa |
|--------|-------------|-------|
| 🟡 **Aguardando Triagem** | Acabou de chegar, ninguém analisou ainda | Importação |
| 🔵 **Em Triagem** | Um analista está analisando agora | Triagem |
| 🟢 **Válida** | Aprovada na triagem, aguardando auditoria | Triagem → Auditoria |
| 🟣 **Auditada** | Aprovada na auditoria, pronta para exportar | Auditoria → Exportação |
| ✅ **Exportada** | Enviada para o órgão com sucesso | Concluída |
| 🔴 **Descartada** | Rejeitada na triagem ou exceção automática | Finalizada |

### Consulta de Descartadas

**Menu lateral** → Infrações → Infrações Descartadas**

![Consulta de Infrações Descartadas](../img/triagem-infracoes-descartadas.png)

Permite verificar:
- Quem descartou (analista ou sistema)
- Motivo do descarte
- Data do descarte
- Se pode ser reaberta

---

## Configuração de Tempo de Análise

O AxHub controla o **tempo médio** que cada analista leva para analisar uma Infração Esse controle é configurado em:

**Menu lateral** → Configurações do Sistema** → **aba Triagem**

Configuração de tempo de análise](../img/triagem-tempo-analise.png)

---

## Fluxo Completo — Resumo Final

```
                    ┌─────────────────────────────────┐
 │ 📷 Equipamento CAPTURA │
  │ imagem + placa + velocidade │
                    └───────────────┬─────────────────┘
                                    ↓
                    ┌─────────────────────────────────┐
 │ 📥 IMPORTAÇÃO AUTOMÁTICA │
  │ dados entram no AxHub │
   │ ⚠️ exceções descartam aqui │
                    └───────────────┬─────────────────┘
                                    ↓
                    ┌─────────────────────────────────┐
 │ 🔍 TRIAGEM (Analista) │
  │ verifica imagem/placa/dados │
 │ ✅ válida ou ❌ Descarta │
                    └──────┬──────────────┬───────────┘
 ↓ ↓
 Status: Válida Status: Descartada
 ↓ (FIM)
                    ┌─────────────────────────────────┐
 │ ✅ AUDITORIA (Auditor) │
 │ confere trabalho do analista │
 │ ✅ Confirma ou ❌ Rejeita │
                    └──────┬──────────────┬───────────┘
 ↓ ↓
       Status: Auditada  Volta p/ Triagem
                           ↓
                    ┌─────────────────────────────────┐
 │ 📤 EXPORTAÇÃO │
 │ gera arquivo + assinatura │
 │ envia ao DETRAN/DER/PRF │
                    └─────────────────────────────────┘
                           ↓
                     Status: Exportada ✅
```

---

## Perguntas Frequentes

### Como sei em qual etapa está uma Infração
Acesse Infrações → Consulta de Infrações e veja a coluna **Status**. O status indica exatamente em qual etapa a Infração se encontra.

### Uma Infração descartada pode ser recuperada?
**Sim.** Na Triagem, use a opção **Reabrir** para trazer de volta uma Infração descartada para nova Análise

### O que são "exceções"?
São regras automáticas que descartam Infrações antes mesmo da triagem — como placas de Veículos de emergência ou horários especiais. Veja [Exceções](./excecoes).

### Onde vejo os erros de exportação?
Em Infrações → Exportação**, na aba de erros, ou nos Relatórios de Exportação](../relatorios/relatorio-infracoes).

### Quanto tempo o analista tem para triar uma Infração
O tempo é controlado em Configurações do Sistema → aba Triagem**. O gestor define o tempo médio esperado.

---

## Páginas Relacionadas

| Página | Descrição |
|--------|-----------|
| [Triagem](./triagem) | Detalhamento técnico da tela de Triagem |
| [Auditoria](./auditoria) | Detalhamento técnico da tela de Auditoria |
| [Exceções](./excecoes) | Configuração de regras de exceção |
| [Consulta de Infrações](./consulta-infracoes) | Buscar e acompanhar Infrações |
| Infrações Descartadas](./infracoes-descartadas) | Consultar Infrações rejeitadas |
| [Exportação](./exportacao) | Enviar Infrações ao órgão autuador |
| Relatório de Infrações](../relatorios/relatorio-infracoes) | Relatórios e estatísticas |
