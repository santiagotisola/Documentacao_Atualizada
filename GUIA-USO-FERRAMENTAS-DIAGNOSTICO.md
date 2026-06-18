# 🔍 GUIA DE USO - FERRAMENTAS DE DIAGNÓSTICO

**Ferramentas para diagnosticar equipamentos com valores zerados no Relatório de Medição**

---

## 📦 FERRAMENTAS DISPONÍVEIS

### 1. 🌐 **Dashboard HTML Interativo**
📄 **Arquivo:** `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html`

**O que faz:**
- Interface visual moderna e intuitiva
- Gera scripts SQL automaticamente
- Mostra checklist completo de validação
- Fornece solução passo a passo
- Cria script de correção (INSERT)

**Como usar:**
1. Abra o arquivo `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html` em qualquer navegador
2. Preencha:
   - **URL do Sistema:** Ex: https://goiania.axhub.axion.ws
   - **Código do Equipamento:** Ex: GYN1R801
   - **Banco de Dados:** (opcional) Ex: AxHub_Goiania
3. Clique em **🔍 Gerar Diagnóstico Completo**
4. Navegue pelas abas:
   - **📊 Resumo:** Informações gerais
   - **✅ Checklist:** Lista de validação completa
   - **💻 SQL Script:** Scripts SQL prontos para executar
   - **🛠️ Solução:** Passo a passo para resolver

**Vantagens:**
- ✅ Não precisa de instalação
- ✅ Funciona offline
- ✅ Gera scripts personalizados instantaneamente
- ✅ Visual profissional
- ✅ Pode imprimir ou salvar como PDF

---

### 2. 💻 **Script SQL Parametrizável**
📄 **Arquivo:** `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql`

**O que faz:**
- Diagnóstico completo com análise automática
- Checklist de validação
- Simulação de cálculo da medição
- Geração automática de script de correção
- Resumo final com problema identificado

**Como usar:**
1. Abra o arquivo `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql` no SQL Server Management Studio (SSMS)
2. Conecte-se ao servidor SQL do sistema
3. Altere APENAS esta linha no início do script:
   ```sql
   DECLARE @CodigoEquipamento VARCHAR(50) = 'GYN1R801'; -- ⬅️ ALTERE AQUI!
   ```
4. Selecione o banco de dados correto (USE AxHub_Goiania)
5. Execute o script completo (F5)
6. Leia os resultados:
   - **DIAGNÓSTICO COMPLETO:** Tabela com todas as informações
   - **ANÁLISE QUANTITATIVA:** Quantos recursos faltam
   - **CHECKLIST DE VALIDAÇÃO:** Status item a item
   - **SIMULAÇÃO DE CÁLCULO:** Valores esperados no relatório
   - **SOLUÇÃO AUTOMÁTICA:** Script pronto para corrigir (se aplicável)
   - **RESUMO FINAL:** Problema principal identificado

**Vantagens:**
- ✅ Análise profunda e técnica
- ✅ Resultados detalhados
- ✅ Gera script de correção automático
- ✅ Valida tudo de uma vez
- ✅ Ideal para DBAs e técnicos

---

### 3. 📋 **Script SQL Completo (Goiânia)**
📄 **Arquivo:** `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql`

**O que faz:**
- 9 queries completas de diagnóstico
- Análise comparativa entre equipamentos
- Validação de todas as tabelas relacionadas

**Quando usar:**
- Análise profunda de múltiplos equipamentos
- Comparação entre equipamentos funcionando vs problemáticos
- Auditorias completas

---

### 4. 📝 **Resposta ao Chamado**
📄 **Arquivo:** `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md`

**O que contém:**
- Explicação detalhada do problema
- Onde validar os dados (SQL + Interface)
- Solução passo a passo
- Checklist imprimível
- Exemplo prático resolvido
- Prevenção para futuros casos

**Quando usar:**
- Responder ao ticket do helpdesk
- Documentar o problema e solução
- Passar instruções para operadores
- Treinamento de equipe

---

## 🚀 FLUXO DE USO RECOMENDADO

### Para Operadores (Sem Acesso SQL):

1. **Use o Dashboard HTML:**
   - Abra `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html`
   - Preencha os dados do equipamento
   - Na aba **✅ Checklist**, marque cada item manualmente verificando no sistema
   - Na aba **🛠️ Solução**, siga o passo a passo para cadastrar recursos

2. **Consulte o documento:**
   - Leia `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md`
   - Siga a seção "VALIDAÇÃO COMPLETA VIA INTERFACE"

---

### Para Técnicos/DBAs (Com Acesso SQL):

1. **Use o Script Parametrizável:**
   - Abra `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql` no SSMS
   - Altere apenas o código do equipamento
   - Execute e analise os resultados
   - Se sugerido, copie o script de correção automática
   - Ajuste valores (Valor Previsto, BDI, Contrato ID, Datas)
   - Execute o script de correção
   - Execute novamente o diagnóstico para validar

2. **Ou use o Dashboard HTML:**
   - Abra `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html`
   - Gere os scripts na aba **💻 SQL Script**
   - Copie e execute no SSMS

---

### Para Gestores/Auditores:

1. **Consulte os documentos:**
   - `RESUMO-EXECUTIVO-AXION-IA-MEDICAO.md` - Visão executiva
   - `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md` - Resposta formal
   - `RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md` - Relatório técnico completo

---

## 📊 EXEMPLOS DE USO

### Exemplo 1: Diagnóstico Rápido (2 minutos)

**Cenário:** Cliente reporta valores zerados no relatório

**Ação:**
1. Abrir `DASHBOARD-DIAGNOSTICO-MEDICAO-EQUIPAMENTO.html`
2. Informar URL: `https://goiania.axhub.axion.ws`
3. Informar Equipamento: `GYN1R801`
4. Clicar em "Gerar Diagnóstico"
5. Ir na aba **💻 SQL Script**
6. Copiar "Query Rápida de Diagnóstico"
7. Executar no SSMS
8. Resultado:
   ```
   Equipamento | Faixa | Status           | ValorPrevisto | Bdi
   GYN1R801    | 1     | 🔴 SEM RECURSO   | NULL          | NULL
   GYN1R801    | 2     | 🔴 SEM RECURSO   | NULL          | NULL
   ```

**Diagnóstico:** Falta cadastrar recursos ✅ Problema identificado!

---

### Exemplo 2: Análise Completa + Correção (10 minutos)

**Cenário:** Preciso analisar e corrigir o problema

**Ação:**
1. Abrir `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql` no SSMS
2. Alterar linha 19:
   ```sql
   DECLARE @CodigoEquipamento VARCHAR(50) = 'GYN1R801';
   ```
3. Executar script (F5)
4. Ler "DIAGNÓSTICO COMPLETO":
   - Resultado: `🔴 RECURSO NÃO CADASTRADO ⚠️`
5. Ler "ANÁLISE QUANTITATIVA":
   - Faixas: 2 | Recursos: 0 | Faltando: 2
6. Ler "CHECKLIST DE VALIDAÇÃO":
   - Todos OK exceto "⚠️ RECURSOS cadastrados (CRÍTICO)" = 🔴 NÃO
7. Ler "SOLUÇÃO AUTOMÁTICA":
   - Copiar script de INSERT fornecido
8. Ajustar valores no script:
   ```sql
   DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00;
   DECLARE @Bdi DECIMAL(5,2) = 25.00;
   DECLARE @DataInicio DATE = '2026-01-01';
   DECLARE @DataFim DATE = '2026-12-31';
   SET @ContratoId = 5; -- ID obtido via SELECT Id FROM TBContratos
   ```
9. Executar script de correção
10. Executar novamente `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql`
11. Resultado: `✅ CONFIGURAÇÃO OK - Valores devem aparecer no relatório!`

**Problema Resolvido!** ✅

---

### Exemplo 3: Responder Chamado Helpdesk (5 minutos)

**Cenário:** Ticket #100676992 sobre valores zerados

**Ação:**
1. Abrir `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md`
2. Copiar seção "VALIDAÇÃO RÁPIDA (1 minuto)"
3. Executar a query SQL informando ao cliente
4. Cliente informa resultado: "Recurso não cadastrado"
5. Copiar seção "SOLUÇÃO PASSO A PASSO"
6. Enviar para cliente com instruções claras
7. Cliente segue passo a passo na interface
8. Validar: Cliente gera relatório e valores aparecem

**Chamado Resolvido!** ✅

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### "Não consigo executar script SQL"
**Solução:** Use o Dashboard HTML! Ele funciona sem precisar de SQL.

### "Dashboard não abre"
**Solução:** 
1. Clique com botão direito no arquivo
2. Abrir com → Google Chrome (ou Edge, Firefox)
3. Se bloquear, habilite JavaScript no navegador

### "Script SQL dá erro"
**Solução:**
1. Verifique se está conectado ao banco correto
2. Verifique se alterou o nome do equipamento corretamente
3. Use aspas simples: `'GYN1R801'` e não `"GYN1R801"`

### "Script de correção não funciona"
**Solução:**
1. Verifique se preencheu o `@ContratoId`
2. Execute: `SELECT Id, NumeroContrato FROM TBContratos WHERE Status = 1;`
3. Use o ID correto do contrato
4. Ajuste `@ValorPrevisto` e `@Bdi` conforme contrato

---

## 📞 SUPORTE

**Dúvidas sobre uso das ferramentas:**
1. Consulte este guia primeiro
2. Consulte `RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md`
3. Consulte `INDICE-DOCUMENTACAO-MEDICAO.md` para mais documentos

**Precisa de análise personalizada:**
- Utilize o Dashboard HTML ou Script SQL
- Copie os resultados completos
- Anexe ao chamado ou email

---

## ✅ VANTAGENS DAS FERRAMENTAS

| Ferramenta | Vantagem Principal | Público |
|------------|-------------------|---------|
| **Dashboard HTML** | Interface visual, sem SQL | Operadores, Gestores |
| **Script Parametrizável** | Diagnóstico automático completo | DBAs, Técnicos |
| **Script Completo** | Análise profunda e comparativa | Analistas, Auditores |
| **Resposta Chamado** | Documentação formal e instruções | Suporte, Helpdesk |

---

## 🎯 CHECKLIST DE VALIDAÇÃO RÁPIDA

Use qualquer ferramenta para validar:

```
EQUIPAMENTO: _______________

Cadastros Básicos:
[ ] Equipamento existe e está Ativo
[ ] Possui 2 faixas cadastradas e Ativas

Configuração Contratual:
[ ] Existe contrato cadastrado e Ativo
[ ] Contrato dentro da vigência
[ ] Equipamento vinculado ao contrato

⚠️ CRÍTICO - Recursos:
[ ] Existe 1 recurso para CADA faixa
[ ] Recursos estão Ativos (Status = 1)
[ ] Valor Previsto > 0 em todos os recursos
[ ] BDI configurado (pode ser 0)
[ ] Recursos dentro da vigência (DataInicio ≤ Hoje ≤ DataFim)

Validação Final:
[ ] Gerar relatório de teste
[ ] Verificar se valores aparecem (≠ R$ 0,00)
```

**Se todos os itens CRÍTICOS estiverem OK = Problema resolvido!** ✅

---

**Última Atualização:** 18/06/2026  
**Versão:** 1.0  
**Equipe:** Axion Tecnologia
