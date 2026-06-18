# 📚 Índice Completo: Documentação de Medição AxHub

**Gerado em:** 18/06/2026  
**Sistemas:** IPEMPE e Goiânia  
**Problema Analisado:** Valores zerados no relatório de medição

---

## 🎯 Início Rápido

### Para Operadores/Usuários

👉 **Comece aqui:** [GUIA-OPERACIONAL-RAPIDO-MEDICAO.md](GUIA-OPERACIONAL-RAPIDO-MEDICAO.md)

Guia simplificado em linguagem não-técnica com passo a passo operacional.

---

### Para Técnicos/Desenvolvedores

👉 **Comece aqui:** [CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md](CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md)

Documentação técnica completa com queries SQL e fluxo detalhado.

---

### Para DBAs/Analistas SQL

👉 **Comece aqui:** [SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql](SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql)

Script SQL pronto com 9 queries de diagnóstico automático.

---

## 📁 Estrutura de Documentos

### 1. Guias Operacionais (Para Usuários)

| Arquivo | Audiência | Descrição | Quando Usar |
|---------|-----------|-----------|-------------|
| **[GUIA-OPERACIONAL-RAPIDO-MEDICAO.md](GUIA-OPERACIONAL-RAPIDO-MEDICAO.md)** | Operadores, Usuários | Passo a passo simplificado sem SQL | Cadastrar novo equipamento ou resolver valores zerados |
| **[GUIA-VALIDACAO-CONTRATOS-FAIXAS.md](GUIA-VALIDACAO-CONTRATOS-FAIXAS.md)** | Operadores, Administradores | Interpretação de queries de validação | Entender resultados das queries SQL |

---

### 2. Documentação Técnica (Para TI)

| Arquivo | Audiência | Descrição | Quando Usar |
|---------|-----------|-----------|-------------|
| **[CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md](CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md)** | Desenvolvedores, Analistas | Fluxo completo em 6 etapas com SQL | Entender processo completo ou implementar correções |
| **[ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md](ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md)** | Analistas, Suporte | Análise técnica do problema | Investigar causa raiz de valores zerados |
| **[COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md](COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md)** | Desenvolvedores | Mapeamento regras → SQL | Validar se sistema segue regras documentadas |

---

### 3. Scripts SQL (Para Análise)

| Arquivo | Queries | Descrição | Quando Executar |
|---------|---------|-----------|-----------------|
| **[SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql](SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql)** | 9 queries | Diagnóstico completo com análise automática | Sempre que houver problema com valores zerados |
| **[VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql](VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql)** | 5 queries | Foco em contratos e recursos por faixa | Quando suspeitar de problema de vínculo |
| **[COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql](COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql)** | 5 queries | Comparação entre sistemas funcionando vs problemático | Identificar diferenças de configuração |

---

### 4. Relatórios e Análises

| Arquivo | Tipo | Descrição | Quando Usar |
|---------|------|-----------|-------------|
| **[RELATORIO-ANALISE-MEDICAO-GOIANIA-AXION-IA.md](RELATORIO-ANALISE-MEDICAO-GOIANIA-AXION-IA.md)** | Relatório | Formato Intelligence Hub para gestão | Apresentar análise para gestores |
| **[ENTREGA-ANALISE-DADOS-REAIS-SISTEMA.md](ENTREGA-ANALISE-DADOS-REAIS-SISTEMA.md)** | Resumo Executivo | Documento de entrega final | Documentar solução implementada |
| **[ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md](ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md)** | Roteiro | 10 passos de diagnóstico manual | Seguir passo a passo sem SQL |

---

### 5. Manuais de Referência

| Arquivo | Formato | Descrição |
|---------|---------|-----------|
| **[Guia-Calculo-Medicao.pdf](Guia-Calculo-Medicao.pdf)** | PDF | Manual oficial de cálculo de medição |

---

## 🔍 Fluxo de Uso por Cenário

### Cenário 1: Valores Zerados no Relatório

```
1. Execute: SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql (Query 9)
   ↓
2. Veja coluna "DiagnosticoProblema"
   ↓
3. Se "RECURSO NÃO CADASTRADO":
   - Operador: GUIA-OPERACIONAL-RAPIDO-MEDICAO.md (PASSO 4)
   - TI: CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md (ETAPA 3.2)
   ↓
4. Execute correção
   ↓
5. Valide com Query 9 novamente
```

---

### Cenário 2: Novo Equipamento na Medição

```
1. Leia: GUIA-OPERACIONAL-RAPIDO-MEDICAO.md
   ↓
2. Siga PASSOS 1-7 do guia
   ↓
3. Valide com: VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql (Query 2)
   ↓
4. Se OK, gere o relatório
```

---

### Cenário 3: Comparar Configuração com Sistema Funcionando

```
1. Execute: COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql
   ↓
2. No banco do IPEMPE (referência)
   ↓
3. No banco de Goiânia (problema)
   ↓
4. Compare resultados lado a lado
   ↓
5. Identifique diferenças
```

---

### Cenário 4: Entender Processo Completo

```
1. Leia: CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md
   ↓
2. Veja fluxo visual em ASCII art
   ↓
3. Consulte ETAPA 3 (Recursos) - mais crítica
   ↓
4. Use checklist de validação
```

---

## 🎯 Principais Conclusões (TL;DR)

### Causa Raiz Identificada
❌ **Problema:** GYN1R801 exibia valores zerados no relatório de medição

✅ **Causa:** Falta de cadastro de recursos (TBRecursos) para as faixas do equipamento

✅ **Solução:** Cadastrar 1 recurso para cada faixa com:
- Valor Previsto > 0
- BDI > 0
- Status = Ativo
- Contrato vinculado
- Vigência válida

---

### O Que É Necessário Para Medição Funcionar

#### Cadastros Básicos
1. ✅ Equipamento cadastrado (TBEquipamentos)
2. ✅ Faixas cadastradas (TBFaixas)
3. ✅ Equipamento ativo

#### Configuração Contratual
4. ✅ Contrato cadastrado (TBContratos)
5. ✅ Contrato ativo
6. ✅ Equipamento vinculado ao contrato (TBContratosEquipamentos)

#### Recursos (⚠️ CRÍTICO)
7. ✅ **1 recurso por faixa** (TBRecursos)
8. ✅ **Recurso vinculado ao contrato**
9. ✅ **Recurso vinculado ao equipamento**
10. ✅ **Recurso vinculado à faixa específica**
11. ✅ **ValorPrevisto > 0**
12. ✅ **BDI > 0**
13. ✅ **Status = Ativo**
14. ✅ **Vigência válida**

#### Operação
15. ✅ Passagens sendo registradas (TBPassagens)
16. ✅ Interrupções registradas (se houver - TBInterrupcoes)

---

## 📊 Fórmulas de Cálculo

```
TOTAL (HORAS) = HORAS PREVISTAS - HORAS DE INTERRUPÇÃO
ÍNDICE OPERAÇÃO = (TOTAL HORAS / HORAS PREVISTAS) × 100
DESCONTO = VALOR PREVISTO × (1 - ÍNDICE OPERAÇÃO)
VALOR FAIXA = VALOR PREVISTO - DESCONTO
VALOR BDI = VALOR FAIXA × (BDI / 100)
TOTAL = VALOR FAIXA + VALOR BDI
```

---

## 🛠️ Queries SQL Mais Importantes

### Query de Diagnóstico Principal
**Arquivo:** SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql - Query 9

```sql
-- Esta query identifica automaticamente o problema
-- Coluna "DiagnosticoProblema" mostra a causa raiz
```

---

### Query de Validação de Recursos
**Arquivo:** VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql - Query 2

```sql
-- Mostra se cada faixa tem recurso com valores configurados
-- Diagnóstico automático na última coluna
```

---

### Query de Comparação
**Arquivo:** COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql - Query 1

```sql
-- Compara configuração entre sistemas
-- Identifica diferenças de setup
```

---

## 📈 Exemplos de Valores

### IPEMPE (Funcionando)
- **Valor Previsto:** R$ 18.500,00 por faixa
- **BDI:** 30%
- **Total (índice 100%):** R$ 24.050,00 por faixa

### Goiânia (Após Correção)
- **Valor Previsto:** R$ 15.000,00 por faixa
- **BDI:** 25%
- **Total (índice 100%):** R$ 18.750,00 por faixa

---

## 🆘 Precisa de Ajuda?

### Para Operadores
1. Abra: [GUIA-OPERACIONAL-RAPIDO-MEDICAO.md](GUIA-OPERACIONAL-RAPIDO-MEDICAO.md)
2. Veja seção "Problemas Comuns e Soluções Rápidas"
3. Siga o passo a passo

### Para TI
1. Execute: [SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql](SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql)
2. Veja Query 9 - coluna "DiagnosticoProblema"
3. Aplique correção conforme o diagnóstico
4. Consulte: [COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md](COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md)

---

## 📚 Documentação Portal AxHub.Docs

### Páginas Relacionadas
- [Medição → Criar Medição](AxHub/docs-portal/docs/medicoes/criar-medicao.md)
- [Medição → Recursos](AxHub/docs-portal/docs/medicoes/recursos.md)
- [Medição → Contratos](AxHub/docs-portal/docs/medicoes/contratos.md)
- [Medição → Interrupções](AxHub/docs-portal/docs/medicoes/interrupcoes.md)
- [Medição → Índices de Performance](AxHub/docs-portal/docs/medicoes/indices-performance.md)
- [Glossário → Medição de Desempenho](AxHub/docs-portal/docs/glossario/medicao-desempenho.md)

---

## 🔗 URLs dos Sistemas

### IPEMPE (Referência - Funcionando)
- **Portal:** https://ipempe.axhub.axion.ws
- **Relatório:** https://ipempe.axhub.axion.ws/medicao/relatoriomedicaoequipamento

### Goiânia (Analisado)
- **Portal:** https://goiania.axhub.axion.ws
- **Relatório:** https://goiania.axhub.axion.ws/medicao/relatoriomedicaoequipamento

---

## ✅ Checklist de Documentos

```
[ ] Li o guia operacional rápido
[ ] Entendi o fluxo completo (6 etapas)
[ ] Sei executar o script de diagnóstico
[ ] Sei interpretar os resultados
[ ] Sei aplicar as correções
[ ] Sei validar se ficou correto
[ ] Sei gerar o relatório
[ ] Sei o que fazer se der erro
```

---

## 📝 Histórico de Criação

| Data | Documento | Versão |
|------|-----------|--------|
| 18/06/2026 | ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md | 1.0 |
| 18/06/2026 | ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md | 1.0 |
| 18/06/2026 | SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql | 1.0 |
| 18/06/2026 | INSTRUCOES-EXECUCAO-SCRIPT-SQL.md | 1.0 |
| 18/06/2026 | COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md | 1.0 |
| 18/06/2026 | RELATORIO-ANALISE-MEDICAO-GOIANIA-AXION-IA.md | 1.0 |
| 18/06/2026 | ENTREGA-ANALISE-DADOS-REAIS-SISTEMA.md | 1.0 |
| 18/06/2026 | VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql | 1.0 |
| 18/06/2026 | GUIA-VALIDACAO-CONTRATOS-FAIXAS.md | 1.0 |
| 18/06/2026 | CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md | 1.0 |
| 18/06/2026 | GUIA-OPERACIONAL-RAPIDO-MEDICAO.md | 1.0 |
| 18/06/2026 | COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql | 1.0 |
| 18/06/2026 | **INDICE-DOCUMENTACAO-MEDICAO.md** | 1.0 |

**Total:** 13 documentos criados

---

## 🎯 Próximos Passos Recomendados

1. ✅ Executar scripts SQL no banco de Goiânia
2. ✅ Cadastrar recursos para GYN1R801 (Faixa 1 e 2)
3. ✅ Validar correção com Query 9
4. ✅ Gerar relatório e confirmar valores
5. ✅ Documentar valores corretos encontrados
6. ⏭️ Treinar operadores com guia operacional
7. ⏭️ Criar procedimento padrão baseado nesta documentação
8. ⏭️ Implementar validação automática no sistema
9. ⏭️ Adicionar alerta quando recursos não estiverem cadastrados

---

**Documento criado em:** 18/06/2026  
**Última atualização:** 18/06/2026  
**Versão:** 1.0  
**Branch:** melhorias-documentacao  
**Repositório:** Axion-Tecnologia/Documentacao_Atualizada
