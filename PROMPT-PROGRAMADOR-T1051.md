# Prompt de Análise para o Programador

---

**Assunto:** Investigação — Divergência de dados Fluxo Diário × Triagem — Equipamento T1051 (STRANS)

**Prioridade:** Alta

**Reportado por:** Equipe de Suporte

**Data:** 27/05/2026

---

## Contexto do Chamado

O cliente STRANS reportou divergência no equipamento **T1051** (fabricante VIZENTEC): o fluxo de passagens chega normalmente, mas na triagem "não aparece a mesma quantidade de registros". Solicitou verificação de falha na comunicação, processamento ou contabilização.

---

## Análise Realizada

### 1. Relatório de Fluxo Diário de Veículos (T1051 — Maio/2026)

```
URL: https://strans.axhub.axion.ws/relatorio/relatoriofluxodiarioveiculos
Filtro: Grupo = VIZENTEC, Equipamento = T1051, Mês = 05/2026
```

| Data | Fluxo (Fx2+Fx3) | Infrações (Fx2+Fx3) |
|------|:---:|:---:|
| 23/05 | 5.169 | 20 |
| 24/05 | 4.072 | 16 |
| 25/05 | 5.185 | 19 |
| 26/05 | 5.526 | 19 |
| 27/05 | 3.071 | 2 |
| **Total 5 dias** | **23.023** | **76** |

**Conclusão:** Equipamento comunicando normalmente. Infrações sendo geradas.

---

### 2. Triagem Infrações — SEM checkbox "Exibir Processadas/Descartadas"

```
URL: https://strans.axhub.axion.ws/triagem
Filtro: 23/05 a 27/05, Equipamento = T1051
```

| Data | Triagem | Reavaliar | Descartadas | Processadas |
|------|:---:|:---:|:---:|:---:|
| 23/05 | 1 | 0 | 0 | 0 |
| 24/05 | 1 | 0 | 0 | 0 |
| 25/05 | 1 | 0 | 0 | 0 |
| 26/05 | 1 | 0 | 0 | 0 |
| 27/05 | 1 | 0 | 0 | 0 |
| **Total** | **5** | **0** | **0** | **0** |

**Gap identificado:** Fluxo mostra 76 infrações, Triagem mostra apenas 5. Diferença de 71.

---

### 3. Triagem Infrações — COM checkbox "Exibir Processadas/Descartadas" ✓

| Data | Triagem | Reavaliar | Descartadas | Processadas | Total |
|------|:---:|:---:|:---:|:---:|:---:|
| 23/05 | 856 | 0 | 18 | 13 | 887 |
| 24/05 | 821 | 0 | 27 | 9 | 857 |
| 25/05 | 951 | 0 | 23 | 2 | 976 |
| 26/05 | 3.172 | 0 | 26 | 0 | 3.198 |
| 27/05 | 724 | 0 | 11 | 0 | 735 |
| **Total** | **6.524** | **0** | **105** | **24** | **6.653** |

**Gap identificado:** Agora os números são muito MAIORES que o Fluxo (6.653 vs 76).

---

### 4. Teste de filtro por equipamento na Triagem

Testamos filtrar por T1051 e T1022 (ambos VIZENTEC). **Os resultados são IDÊNTICOS:**

```
T1051 selecionado → 856, 820, 951, 3.150, 746 | Total: 7.522
T1022 selecionado → 856, 820, 951, 3.149, 751 | Total: 7.524
Nenhum selecionado → 856, 821, 951, 3.172, 724 | MESMO resultado
```

**BUG CONFIRMADO: O filtro de equipamento na tela de Triagem NÃO filtra os dados.**

---

## Pontos para Validação pelo Desenvolvedor

### 🔴 BUG 1 — Filtro de equipamento não funciona na Triagem

```
Arquivo provável: Controller/View de Triagem
Comportamento: O campo select2 "Equipamento" aceita seleção visual mas o valor 
NÃO é enviado na query ao backend (ou é ignorado no server-side).

Reprodução:
1. Acessar /triagem
2. Expandir "Mais Filtros"
3. Selecionar qualquer equipamento (T1051, T1022, etc.)
4. Marcar "Exibir Processadas/Descartadas"
5. Clicar Filtrar
6. RESULTADO: dados idênticos independente do equipamento selecionado

Verificar:
- O parâmetro 'equipamentoIds' está sendo enviado no POST/GET do Filtrar?
- O backend está usando esse parâmetro no WHERE da query SQL?
- O select2 está bindando corretamente o value ao form?
```

### ⚠️ QUESTÃO 2 — Relação Infrações (Fluxo) × Triagem

Precisamos confirmar a lógica:

```
Perguntas:
1. A coluna "Infrações" no Relatório de Fluxo conta:
   a) Apenas infrações de VELOCIDADE?
   b) Todas as infrações (qualquer tipo)?
   c) Apenas infrações JÁ EXPORTADAS/CONFIRMADAS?
   d) Passagens que geraram FoiGeradaInfracao = true em TBPassagensConjugadas?

2. A tela de Triagem mostra:
   a) Registros de TBInfracoes agrupados por data?
   b) Inclui infrações de TODOS os tipos (velocidade + avanço + faixa exclusiva)?
   c) A coluna "Triagem" conta apenas Status = 'AguardandoTriagem'?

3. Qual a query SQL exata que gera a coluna "Infrações" do Fluxo Diário?
   - Suspeita: SELECT COUNT(*) FROM TBPassagensConjugadas WHERE FoiGeradaInfracao = 1 
     vs 
   - SELECT COUNT(*) FROM TBInfracoes WHERE Status IN (...)

4. O Relatório de Fluxo usa TBPassagens/TBPassagensConjugadas e a Triagem usa TBInfracoes?
   Se sim, qual a FK entre elas e como garantir consistência?
```

### ⚠️ QUESTÃO 3 — Proporção descartadas vs processadas

```
Dados observados (TODOS os equipamentos, 23-27/05):
- Triagem pendente: 6.524 (98%)
- Descartadas: 105 (1,5%)
- Processadas: 24 (0,4%)

Perguntas:
- É normal ter 98% pendente? Ou indica falha no processamento automático?
- Há algum job/cron que deveria estar processando automaticamente?
- O dia 26/05 tem 3.172 pendentes vs média de 850 — o que causou o pico?
```

---

## Resumo Executivo

| Item | Status | Ação necessária |
|------|--------|----------------|
| Comunicação T1051 | ✅ OK | Nenhuma |
| Geração de infrações | ✅ OK (76 no período) | Nenhuma |
| Filtro equipamento na Triagem | 🔴 **BUG** | Corrigir select2 → backend |
| Relação Fluxo × Triagem | ⚠️ Não documentada | Documentar query SQL de cada um |
| Backlog de triagem | ⚠️ 6.524 pendentes | Verificar se é operacional ou técnico |

---

## Resposta ao Cliente (proposta)

> Verificamos o equipamento T1051 e confirmamos que a comunicação e geração de infrações estão funcionando normalmente (76 infrações geradas no período 23-27/05). A divergência observada ocorre porque o Relatório de Fluxo e a Triagem medem dados diferentes — o fluxo conta infrações de velocidade detectadas, enquanto a triagem apresenta todos os registros do pipeline de processamento. Identificamos também um ajuste necessário no filtro por equipamento da tela de Triagem que está em correção pela equipe de desenvolvimento.

---

**Desenvolvedor responsável:** [preencher]  
**Prazo para validação:** [preencher]  
**Branch/ticket:** [preencher]
