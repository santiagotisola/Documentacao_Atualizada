# CUTI v3.0 - Explicação Simples 🎯

## O que você quer fazer?

Você quer que o sistema:
1. **Leia o manual** (ex: manual de cadastro de veículo)
2. **Use o manual como script** (igual aos cenários gravados)
3. **Você informe os dados** antes de executar (placa, marca, modelo, etc.)
4. **Sistema execute automaticamente** preenchendo com seus dados

**Exemplo prático:**
- Manual diz: "Clique em Novo, preencha Placa, Marca, Modelo, clique Salvar"
- Você informa: "Placa: ABC-1234, Marca: Toyota, Modelo: Corolla"
- Sistema executa: Abre tela, preenche ABC-1234, Toyota, Corolla, salva

---

## ✅ A proposta JÁ contempla isso!

Mas estava muito técnica. Aqui está a explicação simples:

---

## Como funciona (versão simples)

### 📘 Passo 1: Sistema lê o manual

O sistema varre os manuais do Docusaurus e transforma em "receita de bolo":

**Manual original:**
```markdown
## Cadastrar Veículo
1. Acesse Menu → Cadastros → Veículos
2. Clique em "Novo"
3. Preencha os campos obrigatórios:
   - Placa (formato: AAA-9999)
   - Marca
   - Modelo
   - Ano
4. Clique em "Salvar"
```

**Sistema transforma em:**
```
Script: Cadastrar Veículo
- Passo 1: Navegar para /veiculo
- Passo 2: Clicar no botão "Novo"
- Passo 3: Preencher campo Placa com [DADO]
- Passo 4: Preencher campo Marca com [DADO]
- Passo 5: Preencher campo Modelo com [DADO]
- Passo 6: Preencher campo Ano com [DADO]
- Passo 7: Clicar em "Salvar"

Campos que você precisa informar:
✏️ Placa (obrigatório)
✏️ Marca (obrigatório)
✏️ Modelo (obrigatório)
✏️ Ano (obrigatório)
```

---

### ✏️ Passo 2: Você informa os dados

**Antes de executar, o sistema abre uma telinha assim:**

```
┌─────────────────────────────────────┐
│  Informe os dados para o teste:    │
├─────────────────────────────────────┤
│                                     │
│  Placa: [ABC-1234        ] *        │
│  Marca: [Toyota ▼        ] *        │
│  Modelo:[Corolla         ] *        │
│  Ano:   [2022            ] *        │
│  Cor:   [Prata  ▼        ]          │
│                                     │
│  [Executar]  [Salvar Template]     │
│                                     │
│  Carregar: [Veículo Teste ▼]       │
│                                     │
└─────────────────────────────────────┘
```

**Você preenche os dados** que quer testar.

Se já tem um template salvo (ex: "Veículo Teste"), só carrega e executa.

---

### ⚡ Passo 3: Sistema executa automaticamente

Quando você clica **"Executar"**:

1. Sistema abre o navegador
2. Faz login no AxHub
3. Vai em Cadastros → Veículos
4. Clica em "Novo"
5. **Preenche os campos com seus dados:**
   - Placa: ABC-1234
   - Marca: Toyota
   - Modelo: Corolla
   - Ano: 2022
6. Clica em "Salvar"
7. Tira screenshot
8. Te mostra o resultado: ✅ Sucesso ou ❌ Erro

---

### 💾 Passo 4: Salvar template (reutilização)

Depois de executar, você pode clicar **"Salvar Template"** e dar um nome:

```
Template: "Veículo Toyota Corolla 2022"
```

**Da próxima vez:**
- Você carrega esse template
- Só muda a placa se quiser (ex: XYZ-9876)
- Executa de novo

**Ou importa planilha:**
```csv
placa,marca,modelo,ano
ABC-1234,Toyota,Corolla,2022
XYZ-5678,Honda,Civic,2021
DEF-9012,Ford,Focus,2020
```

Sistema executa 3 cadastros automaticamente, um atrás do outro.

---

## 🎬 Exemplo Completo (passo a passo visual)

### Cenário: Cadastrar 2 veículos no AxHub Homologação

#### **Tela 1: Escolher o script**
```
┌──────────────────────────────────────────┐
│ CUTI v3.0 - Scripts dos Manuais          │
├──────────────────────────────────────────┤
│                                          │
│ Produto: [AxHub ▼]                       │
│ Módulo:  [Cadastros Básicos ▼]          │
│ Script:  [Veículos ▼]                    │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ✅ Cadastrar Veículo (7 passos)      │ │
│ │                                      │ │
│ │ Campos necessários:                  │ │
│ │ • Placa (obrigatório)                │ │
│ │ • Marca (obrigatório)                │ │
│ │ • Modelo (obrigatório)               │ │
│ │ • Ano (obrigatório)                  │ │
│ │                                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [Preencher Dados] ───────────────────►   │
│                                          │
└──────────────────────────────────────────┘
```

#### **Tela 2: Preencher dados (NOVA!)**
```
┌──────────────────────────────────────────┐
│ Dados para executar o script             │
├──────────────────────────────────────────┤
│                                          │
│ Placa: *                                 │
│ ┌──────────────────────────────────────┐ │
│ │ ABC-1234                             │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Marca: *                                 │
│ ┌──────────────────────────────────────┐ │
│ │ Toyota           ▼                   │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Modelo: *                                │
│ ┌──────────────────────────────────────┐ │
│ │ Corolla                              │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Ano: *                                   │
│ ┌──────────────────────────────────────┐ │
│ │ 2022                                 │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Templates salvos:                        │
│ [Veículo Teste ▼] [Carregar]            │
│                                          │
│ [❌ Cancelar]  [⚡ Executar Agora]       │
│                                          │
└──────────────────────────────────────────┘
```

#### **Tela 3: Executando...**
```
┌──────────────────────────────────────────┐
│ Executando script...                     │
├──────────────────────────────────────────┤
│                                          │
│ ⏳ Abrindo navegador...                  │
│ ✅ Login efetuado                        │
│ ✅ Navegou para /veiculo                 │
│ ✅ Clicou em "Novo"                      │
│ ⏳ Preenchendo Placa: ABC-1234...        │
│                                          │
│ [Navegador aberto em segundo plano]     │
│                                          │
└──────────────────────────────────────────┘
```

#### **Tela 4: Resultado**
```
┌──────────────────────────────────────────┐
│ ✅ Execução concluída com sucesso!       │
├──────────────────────────────────────────┤
│                                          │
│ Script: Cadastrar Veículo                │
│ Tempo: 14.3 segundos                     │
│ Passos: 7/7 ✅                           │
│                                          │
│ Dados utilizados:                        │
│ • Placa: ABC-1234                        │
│ • Marca: Toyota                          │
│ • Modelo: Corolla                        │
│ • Ano: 2022                              │
│                                          │
│ Screenshots: [Ver 7 capturas]            │
│                                          │
│ [💾 Salvar Template]  [🔄 Executar +]    │
│                                          │
└──────────────────────────────────────────┘
```

#### **Executar novamente com dados diferentes:**

Você clica **"🔄 Executar +"**, sistema abre o formulário de novo, você muda só a placa:

```
Placa: XYZ-5678  ← mudou só isso
Marca: Toyota    ← manteve
Modelo: Corolla  ← manteve
Ano: 2022        ← manteve
```

Clica **"⚡ Executar Agora"** → Sistema cadastra outro veículo!

**Resultado:** 2 veículos cadastrados usando o mesmo script, mas com dados diferentes.

---

## 🆚 Comparação: Antes vs Depois

### **Antes (como era):**

```
1. Criar cenário gravando manualmente
2. Editar JSON para mudar dados
3. Executar
4. Para mudar dados, editar JSON de novo
5. Executar de novo
```

**Problema:** Tedioso, precisa saber JSON, um cenário por conjunto de dados.

---

### **Depois (CUTI v3.0):**

```
1. Escolher script do manual
2. Preencher formulário visual
3. Executar
4. Para mudar dados, só preencher formulário de novo
5. Executar de novo
```

**Solução:** Visual, fácil, reutiliza o mesmo script infinitas vezes.

---

## 💡 Principais Vantagens (em português claro)

### 1️⃣ **Não precisa gravar cenário**
   - Manual já vira script automaticamente
   - Economiza 30 minutos por teste

### 2️⃣ **Formulário visual**
   - Não mexe em JSON
   - Preenche como qualquer formulário web
   - Sistema valida se digitou certo (ex: placa no formato AAA-9999)

### 3️⃣ **Reutilização fácil**
   - Mesmo script, múltiplos dados
   - Templates salvos
   - Importa planilha com 100 registros → sistema testa 100 veículos

### 4️⃣ **Testes realistas**
   - Usa dados reais de teste
   - Valida formulário antes de executar
   - Você vê o navegador executando (não é caixa-preta)

### 5️⃣ **Documentação sempre atualizada**
   - Se o script falhar, sistema sugere atualização do manual
   - Você aprova ou rejeita
   - Manual fica sempre correto

---

## ❓ Funcionamento para Cenários Gravados (bonus)

**E se você gravar um cenário manualmente?**

Sistema também detecta os dados!

**Exemplo:**
1. Você grava um cadastro de usuário
2. Durante gravação, preenche:
   - Nome: João da Silva
   - Email: joao@teste.com
   - Telefone: (11) 98765-4321
3. Sistema detecta e pergunta:

```
┌─────────────────────────────────────────────┐
│ Detectei que você preencheu estes campos:  │
│                                             │
│ ✏️ Nome: João da Silva                      │
│ ✏️ Email: joao@teste.com                    │
│ ✏️ Telefone: (11) 98765-4321                │
│                                             │
│ Quer transformar em variáveis?              │
│ (Para reutilizar com outros dados)         │
│                                             │
│ [✅ Sim, criar formulário]  [❌ Não]        │
└─────────────────────────────────────────────┘
```

Se você clicar **"Sim"**:
- Sistema salva o cenário com variáveis
- Próxima execução, te pede os dados de novo
- Você pode executar o mesmo cenário com Maria, José, etc.

**Mesma lógica do manual, mas para cenários gravados!**

---

## 📋 Resumo de 1 minuto

### O que muda na prática?

**HOJE:**
- Scripts gravados = dados fixos
- Manuais = só documentação

**CUTI v3.0:**
- Scripts gravados = pede dados antes de executar
- Manuais = viram scripts automáticos que pedem dados

**Como usa:**
1. Escolhe o que testar (manual ou cenário gravado)
2. Preenche formulário com dados
3. Clica "Executar"
4. Sistema faz tudo automaticamente
5. Mostra resultado (sucesso ou erro)

**Reutilização:**
- Salva template
- Importa planilha
- Executa múltiplas vezes

---

## ✅ Isso atende sua necessidade?

Você falou:
> "preciso de ter um campo onde vou informar os dados que deverão ser efetuados"

**Resposta:** SIM! ✅

- **Campo para informar dados:** Formulário visual (Tela 2)
- **Dados usados na automação:** Sistema preenche automaticamente
- **Funciona com manual:** Scripts gerados do Docusaurus
- **Funciona com gravação:** Cenários gravados também pedem dados

---

## 🚀 Próximo Passo

Se ficou claro e você aprovar, eu implemento:

### **Semana 1: Interface**
- Tela de escolher script do manual
- **Formulário de dados** ← sua necessidade principal
- Botão "Carregar Template"
- Botão "Executar"

### **Semana 2: Backend**
- Sistema que lê o manual e detecta campos
- Sistema que preenche formulário web com seus dados
- Salvar templates

### **Semana 3-5: Extras**
- Importação de planilha
- Atualização automática do manual
- Executar múltiplos testes em sequência

---

## 🎯 Ficou claro?

Me diga:
1. **Entendeu como funciona?** (Manual → Formulário → Dados → Execução)
2. **É isso que você quer?** (Campo para informar dados antes de executar)
3. **Posso começar?** (Implementar o formulário de dados)

Se tiver alguma dúvida, me explica com suas palavras o que você quer e eu ajusto a proposta! 😊
