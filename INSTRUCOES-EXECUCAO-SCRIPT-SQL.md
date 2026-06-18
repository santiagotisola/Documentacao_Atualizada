# 🔧 INSTRUÇÕES: Execução do Script de Diagnóstico

## Objetivo
Executar queries SQL no banco de dados real de Goiânia para identificar **exatamente** o que está causando os valores zerados no equipamento GYN1R801.

---

## 📋 Pré-requisitos

- ✅ Acesso ao SQL Server de Goiânia
- ✅ SQL Server Management Studio (SSMS) instalado
- ✅ Permissões de leitura no banco de dados AxHub

---

## 🚀 Passo a Passo

### 1. Conectar ao Servidor

```
1. Abra o SQL Server Management Studio (SSMS)
2. Conecte-se ao servidor de Goiânia:
   - Server type: Database Engine
   - Server name: [IP ou nome do servidor de Goiânia]
   - Authentication: SQL Server Authentication ou Windows Authentication
   - Login: [seu usuário]
   - Password: [sua senha]
3. Clique em "Connect"
```

### 2. Selecionar o Banco de Dados

```
1. No Object Explorer, expanda: Databases
2. Localize o banco: AxHub_Goiania (ou nome similar)
3. Clique com botão direito → New Query
```

### 3. Executar o Script

```
1. Abra o arquivo: SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql
2. Copie TODO o conteúdo do script
3. Cole na janela de Query do SSMS
4. Pressione F5 ou clique em "Execute"
5. Aguarde a execução (pode levar 10-30 segundos)
```

### 4. Capturar os Resultados

```
1. Após a execução, você verá várias abas de resultados
2. Role até encontrar as 9 queries principais
3. Para cada query, clique com botão direito na grade de resultados
4. Selecione: "Copy with Headers"
5. Cole em um arquivo de texto ou Word
```

---

## 📊 Queries Executadas

| Query | Descrição | O que Verifica |
|-------|-----------|----------------|
| **1** | Equipamentos | Se os 4 equipamentos existem e estão ativos |
| **2** | Faixas | Se cada equipamento tem 2 faixas cadastradas |
| **3** | ⭐ **Recursos (CHAVE)** | Se recursos existem e têm ValorPrevisto + BDI |
| **4** | Resumo Comparativo | Contagem de recursos por equipamento |
| **5** | Contratos Ativos | Contratos vigentes de Goiânia |
| **6** | Vinculação | Se equipamentos estão vinculados a contratos |
| **7** | Passagens Maio/2026 | Confirma dados operacionais OK |
| **8** | GYN1R803 Referência | Configuração correta para copiar |
| **9** | ⭐ **GYN1R801 Diagnóstico** | Identifica exatamente o problema |

---

## 🎯 O que Procurar nos Resultados

### Query 3 (Recursos) - MAIS IMPORTANTE

**Cenário A: GYN1R801 com RecursoId = NULL**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi
------------------|-------------|-----------|---------------|----
GYN1R801          | 1           | NULL      | NULL          | NULL
GYN1R801          | 2           | NULL      | NULL          | NULL
GYN1R803          | 1           | 12345     | 15000.00      | 25
GYN1R803          | 2           | 12346     | 15000.00      | 25
```
**Diagnóstico:** ❌ **RECURSOS NÃO CADASTRADOS** (Causa Raiz)

---

**Cenário B: GYN1R801 com RecursoId mas ValorPrevisto = 0**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi
------------------|-------------|-----------|---------------|----
GYN1R801          | 1           | 12347     | 0.00          | 0
GYN1R801          | 2           | 12348     | 0.00          | 0
GYN1R803          | 1           | 12345     | 15000.00      | 25
GYN1R803          | 2           | 12346     | 15000.00      | 25
```
**Diagnóstico:** ❌ **VALORES ZERADOS** (Recurso existe mas não configurado)

---

**Cenário C: GYN1R801 com valores mas Status = 0**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi | Status
------------------|-------------|-----------|---------------|-----|-------
GYN1R801          | 1           | 12347     | 15000.00      | 25  | 0
GYN1R801          | 2           | 12348     | 15000.00      | 25  | 0
GYN1R803          | 1           | 12345     | 15000.00      | 25  | 1
GYN1R803          | 2           | 12346     | 15000.00      | 25  | 1
```
**Diagnóstico:** ❌ **RECURSOS INATIVOS** (Status = 0)

---

### Query 9 (Diagnóstico GYN1R801) - CONFIRMA O PROBLEMA

Procure pela coluna **"DiagnosticoProblema"**:

```
NumeroFaixa | DiagnosticoProblema
------------|--------------------
1           | 🔴 RECURSO NÃO EXISTE - CADASTRAR
2           | 🔴 RECURSO NÃO EXISTE - CADASTRAR
```

Ou:

```
NumeroFaixa | DiagnosticoProblema
------------|--------------------
1           | 🔴 VALOR PREVISTO ZERADO - CORRIGIR
2           | 🔴 VALOR PREVISTO ZERADO - CORRIGIR
```

---

## 📤 Enviar Resultados

Após executar o script, **copie e cole** os resultados das seguintes queries em um e-mail ou documento:

### Obrigatório:
- ✅ **Query 3** (Recursos) - Completa com todos os 4 equipamentos
- ✅ **Query 9** (Diagnóstico GYN1R801) - Mostra o problema exato

### Opcional mas recomendado:
- Query 4 (Resumo Comparativo)
- Query 8 (GYN1R803 Referência)

---

## 🔍 Exemplo de Resposta Esperada

### Se Recurso NÃO existe (Cenário A):

```
QUERY 3 - RECURSOS:
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi    | StatusDesc
GYN1R801          | 1           | NULL      | NULL          | NULL   | RECURSO NÃO EXISTE
GYN1R801          | 2           | NULL      | NULL          | NULL   | RECURSO NÃO EXISTE
GYN1R803          | 1           | 456       | 15000.00      | 25.00  | Ativo
GYN1R803          | 2           | 457       | 15000.00      | 25.00  | Ativo

QUERY 9 - DIAGNÓSTICO:
NumeroFaixa | DiagnosticoProblema
1           | 🔴 RECURSO NÃO EXISTE - CADASTRAR
2           | 🔴 RECURSO NÃO EXISTE - CADASTRAR

CONCLUSÃO:
❌ GYN1R801 não possui recursos cadastrados
✅ GYN1R803 está configurado corretamente

SOLUÇÃO:
Cadastrar 2 recursos (Faixa 1 e Faixa 2) para GYN1R801 no módulo Medição → Recursos
Copiar valores do GYN1R803: ValorPrevisto = R$ 15.000,00 e BDI = 25%
```

---

## ⚠️ Troubleshooting

### Erro: "Invalid object name 'TBRecursos'"
- Banco de dados incorreto selecionado
- Verifique se está conectado ao banco AxHub_Goiania correto

### Erro: "Permission denied"
- Usuário não tem permissão de leitura
- Solicite permissões ao DBA

### Nenhum resultado nas queries
- Equipamentos podem não existir no banco
- Verifique se está conectado ao ambiente correto (Produção vs Homologação)

### Query demora muito
- Banco de dados pode estar lento
- Aguarde até 1 minuto
- Se travar, cancele (Alt+Break) e tente novamente

---

## 📞 Próximo Passo

Após coletar os resultados:
1. Cole os resultados em um arquivo TXT
2. Envie para análise
3. Aguarde script de **CORREÇÃO** baseado no diagnóstico real

---

**Arquivo gerado:** SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql  
**Instruções:** INSTRUCOES-EXECUCAO-SCRIPT-SQL.md  
**Data:** 18/06/2026
