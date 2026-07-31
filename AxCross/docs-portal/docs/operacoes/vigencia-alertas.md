---
sidebar_position: 2
title: Vigência dos Alertas
description: Configure prazos de expiração para Veículos monitorados e controle automaticamente a validade dos alertas no AxCross
---

A **Vigência dos Alertas** permite definir um **prazo de expiração** para os Veículos monitorados. Ao configurar um prazo no Tipo de Ocorrência, o sistema calcula automaticamente a data limite para cada Veículo cadastrado. Após esse período, o Veículo deixa de gerar alertas — sem necessidade de desativação manual.

:::info Novo Recurso
Disponível a partir da versão com as melhorias **AxCross — Vigência dos Alertas**. Inclui campo **Prazo de Expiração (dias)** no Tipo de Ocorrência e controle de vigência na lista de Veículos Monitorados.
:::

---

## Conceitos Fundamentais

| Conceito | Descrição |
| ---------- | ----------- |
| **Habilitado** | Controle **manual** do Usuário Não é alterado automaticamente por nenhum processo. |
| **Vigência** | Controle de **expiração** baseado no prazo do Tipo de Ocorrência. Independente do campo Habilitado. |
| **Alerta** | Gerado somente se o Veículo estiver **habilitado** E **dentro da vigência**. |

### Status da Vigência

| Status | Condição | Cor |
| -------- | ---------- | ----- |
| **Ativo** | Habilitado e dentro do prazo (ou sem expiração) | 🟢 Verde |
| **Expira em Xhoras / Xdias** | Habilitado e expirando em breve | 🟡 Amarelo |
| **Expirado** | Habilitado, mas prazo já venceu | 🔴 Vermelho |
| **Desativado** | `Habilitado = Não` (independente da data) | 🟡 Amarelo |

---

## Passo 1 — Configurar o Tipo de Ocorrência

O prazo de vigência é definido diretamente no **Tipo de Ocorrência**. Todos os Veículos vinculados a esse tipo herdam automaticamente o prazo.

Para acessar: **Veículos Monitorados → Tipos de Ocorrências**.

![Tipo de Ocorrência](../img/Tipo de Ocorrência.png)

### Campos do Tipo de Ocorrência

| Campo | Obrigatório | Descrição |
| ------- | :-----------: | ----------- |
| **Código** | Sim | Identificador único do tipo |
| **Nome** | Sim | Nome descritivo da ocorrência |
| **Cor** | Sim | Cor de identificação visual nos alertas |
| **Emitir Alerta Sonoro** | Não | Dispara sinal sonoro ao gerar alerta |
| **Prazo de Expiração (dias)** | Não | Número de dias para expirar os Veículos deste tipo. Deixe vazio para vigência ilimitada. |

### Como configurar o prazo

1. No menu lateral, acesse **Veículos Monitorados → Tipos de Ocorrências**
2. Clique no ícone de edição ✏️ do tipo desejado (ou clique em **+ NOVO** para criar)
3. No campo **Prazo de Expiração (dias)**, informe a quantidade de dias (ex.: `30`)
4. Clique em **Salvar**

:::tip Exemplos de prazo

- **30 dias** — Veículo expira 30 dias após o cadastro
- **90 dias** — vigência trimestral
- **365 dias** — vigência anual
- **Vazio** — sem prazo, nunca expira automaticamente
:::

---

## Passo 2 — Cadastrar Veículo com Vigência

Ao cadastrar um Veículo monitorado vinculado a um tipo com prazo, a **Data de Expiração** é calculada automaticamente.

![Novo Veículo Monitorado](../img/Novo Veículo Monitorado.png)

### Campos relacionados à vigência

| Campo | Descrição |
| ------- | ----------- |
| **Tipo de Ocorrência** | Define o prazo herdado automaticamente |
| **Habilitado** | Ativa ou desativa manualmente o monitoramento |
| **Data de Expiração** | Calculada automaticamente pelo prazo do tipo. Pode ser informada manualmente para um prazo diferente. |

---

## Visualizando a Vigência na Lista

A lista de Veículos Monitorados exibe colunas dedicadas ao controle de vigência:

| Coluna | Descrição |
| -------- | ----------- |
| **Habilitado** | Ícone ✔ (ativo) ou ✘ (inativo) — controle manual |
| **Vigência** | Badge colorido com o status atual |
| **Expira em** | Data e hora de expiração no formato `dd/MM/yyyy HH:mm` ou `-` se sem prazo |

---

## Atualização em Bloco — Alterar Prazo do Tipo

Quando o **Prazo de Expiração** de um Tipo de Ocorrência é alterado, o sistema atualiza automaticamente **todos os Veículos vinculados** àquele tipo — sem necessidade de editar cada Veículo individualmente.

:::warning Atenção
A atualização em bloco é **imediata** e afeta todos os Veículos do tipo. Durante o salvamento, uma mensagem de carregamento confirma que o processo está em andamento.
:::

### Cenários de atualização em bloco

| Alteração no tipo | Resultado nos Veículos |
| ------------------- | ---------------------- |
| Prazo removido (ex.: 20 dias → vazio) | `Data de Expiração = sem prazo` para todos |
| Prazo alterado (ex.: 20 → 30 dias) | `Data de Expiração = hoje + 30 dias` para todos. O valor **20 dias** é o prazo anterior cadastrado no Tipo de Ocorrência; o valor **30 dias** é o novo prazo informado. O sistema sempre válida pela data de expiração registrada no Veículo monitorado. |
| Prazo adicionado (ex.: vazio → 20 dias) | `Data de Expiração = hoje + 20 dias` para todos |
| Prazo não alterado | Nenhuma modificação nos Veículos |

### Como realizar a atualização em bloco

1. Acesse **Veículos Monitorados → Tipos de Ocorrências**
2. Edite o tipo desejado
3. Altere o campo **Prazo de Expiração (dias)**
4. Clique em **Salvar**
5. Aguarde a mensagem *"Atualizando vigência dos Veículos monitorados vinculados..."*

Após a conclusão, todos os Veículos do tipo terão a data de expiração recalculada.

---

## Sino de Vigência — Monitoramento de Expirações

A **toolbar do AxCross** exibe um ícone de sino 🔔 com badge de contagem mostrando Veículos que expiram nas próximas **24 horas** ou já **expirados**.

### Como funciona

- O sino exibe uma bolinha de notificação quando há Veículos próximos de expirar ou já expirados
- Clique no sino para abrir o Use Dashboard de vigência
- A lista é paginada em **10 itens por página** com botão **"Ver mais"**
- O Use Dashboard atualiza automaticamente a **cada 5 minutos**

### Itens exibidos no sino

| Item | Badge | Descrição |
| ------ | ------- | ----------- |
| Veículo expirando em breve | `Xh` (horas restantes) | Expira nas próximas 24 horas |
| Veículo expirado | `Expirado` (vermelho) | Prazo já vencido, mas ainda habilitado |

### Rodapé do Use Dashboard

O rodapé exibe um resumo: **"X expirando · Y expirado(s)"**

### Ação ao clicar em um item

Clicar em qualquer Veículo no Use Dashboard abre diretamente o formulário de edição, permitindo renovar a Data de Expiração ou desativar o Veículo

---

## Geração de Alertas — Regras de Vigência

O sistema verifica **duas condições obrigatórias** antes de gerar qualquer alerta para um Veículo monitorado:

```text
Gera alerta se:
  ✅ Habilitado = Sim
 ✅ Data de Expiração = sem prazo OU Data de Expiração > agora
```

| Situação do Veículo | Gera alerta? |
| --------------------- | :------------: |
| Habilitado + dentro da vigência | ✅ Sim |
| Habilitado + expirado | ❌ Não |
| Desabilitado + dentro da vigência | ❌ Não |
| Desabilitado + expirado | ❌ Não |
| Habilitado + sem prazo (null) | ✅ Sim |

:::info Controle independente
O campo **Habilitado** nunca é alterado automaticamente pela vigência. São controles independentes — o sistema apenas ignora Veículos expirados na geração de alertas, sem desativá-los.
:::

---

## Importação em Lote com Vigência

Ao importar Veículos via arquivo `.txt`, a data de expiração é calculada automaticamente se o tipo de ocorrência tiver prazo configurado.

- Veículos importados recebem `Expira = hoje + prazo do tipo`
- O campo `Habilitado` é marcado como `Sim` por padrão
- Após a importação, é possível editar individualmente cada Veículo para ajustar a data

---

## Perguntas Frequentes

**O Veículo expirado é desativado automaticamente?**
Não. O campo **Habilitado** é exclusivamente de controle manual. O Veículo expirado continua como "Habilitado = Sim" no banco, mas **não gera alertas**. Para desativá-lo definitivamente, edite o Veículo manualmente.

**Posso definir uma data de expiração diferente do padrão do tipo?**
Sim. Ao cadastrar ou editar um Veículo informe manualmente o campo **Data de Expiração**. O valor informado prevalece sobre o prazo automático do tipo de ocorrência.

**O que acontece se eu remover o prazo do tipo de ocorrência?**
Todos os Veículos vinculados terão a data de expiração removida (`sem prazo`). Eles nunca expirarão automaticamente e deixam de aparecer no sino de vigência.

**O sino mostra Veículos desabilitados?**
Não. O sino de vigência exibe apenas Veículos **habilitados** que estejam expirando nas próximas 24 horas ou já expirados.

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Veículo expirado ainda gera alerta | Cache desatualizado | Recarregar o sistema |
| Data de expiração não calculada | Tipo sem prazo configurado | Adicionar prazo ao tipo |
| Sino não aparece | Nenhum veículo expirando | Normal — só exibe quando há |

## Integração com outros módulos

| Módulo | Relação |
|--------|----------|
| **Veículos Monitorados** | Controla a validade dos monitoramentos |
| **Tipos de Ocorrência** | Define o prazo padrão por categoria |
| **Alertas** | Suspende alertas após expiração |

