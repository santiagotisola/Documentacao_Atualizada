# 📋 Relatório de Erros — Frota ITScam 450

> **Gerado em:** 07/07/2026, 08:24:26  
> **Script padrão:** `config-padrao/padrao-faixa-{1,2}.json`  
> **Regras validadas:** 26

---

## 📊 Resumo Executivo

| Indicador | Valor | Detalhes |
| --- | --- | --- |
| Total de equipamentos | 72 | Faixas 1 e 2 de cada ponto |
| ✅ Conformes | **59** | 82% do total |
| ⚠️ Com erros | **4** | 2 grupo(s) de problemas |
| 📡 Offline | **9** | Sem comunicação — verificar fisicamente |

**Conformidade:** `[████████████████░░░░] 82%`

---

## ❌ Erros a Corrigir

> **4 equipamento(s)** com divergências em **2 grupo(s)**:

- [Grupo 1: SNMP Desabilitado](#grupo-1) — GOEC6O009 - Faixa 1, GOEC6O009 - Faixa 2
- [Grupo 2: NTP Server](#grupo-2) — GOEC6O011 - Faixa 2, GOEC6O028 - Faixa 1

---

### Grupo 1

#### 🟢 SNMP Desabilitado

| Campo | Valor |
|---|---|
| **Severidade** | Baixa |
| **Localização na UI** | Sistema > SNMP |
| **Valor atual** | `Sim (true)` |
| **Valor esperado** | `Não (false)` |

**Problema:** SNMP está habilitado, mas o padrão exige que esteja desabilitado.

**Como corrigir:**
1. Acesse a interface web do equipamento: `http://<IP-do-equipamento>`
2. Navegue até **Sistema > SNMP**
3. Desmarque a opção **Habilitar SNMP**
4. Clique em **Salvar**

⚠️ Não é possível corrigir via API REST — necessário acesso manual à UI web.

**Equipamentos afetados (2):**

| Equipamento | Faixa | Score | IP / Acesso Web |
| --- | --- | --- | --- |
| GOEC6O009 - Faixa 1 | F1 | 96% | [`187.43.180.235`](http://187.43.180.235) |
| GOEC6O009 - Faixa 2 | F2 | 96% | [`187.43.180.235`](http://187.43.180.235) |

---

### Grupo 2

#### 🟡 NTP Server

| Campo | Valor |
|---|---|
| **Severidade** | Média |
| **Localização na UI** | Equipamento > Data e Hora |
| **Valor atual** | `200.160.0.8` |
| **Valor esperado** | `time.google.com` |

**Problema:** Servidor NTP configurado incorretamente (`200.160.0.8`). Deve ser `time.google.com`.

**Como corrigir:**
1. Acesse a interface web do equipamento: `http://<IP-do-equipamento>`
2. Navegue até **Equipamento > Data e Hora**
3. No campo **Servidor NTP**, substitua `200.160.0.8` por `time.google.com`
4. Clique em **Salvar**

⚠️ O endpoint REST `/api/equipment/dateAndTime` retorna HTTP 500 para este campo — necessário acesso manual à UI web.

**Equipamentos afetados (2):**

| Equipamento | Faixa | Score | IP / Acesso Web |
| --- | --- | --- | --- |
| GOEC6O011 - Faixa 2 | F2 | 96% | [`187.61.123.9`](http://187.61.123.9) |
| GOEC6O028 - Faixa 1 | F1 | 96% | [`177.25.225.6`](http://177.25.225.6) |

---

## 📡 Equipamentos Offline

> **9 equipamento(s)** sem comunicação. Não é possível validar ou corrigir remotamente.

| Equipamento | Endereço IP | UUID (Varco Cloud) | Ação recomendada |
| --- | --- | --- | --- |
| GOEC6O006 - Faixa 1 | 191.56.243.74 | `29a63deb-dfe5-4765-a10a-57485f03f301` | 🔧 Verificar fisicamente no local |
| GOEC6O006 - Faixa 2 | 191.56.243.74 | `a8f7026c-21b1-4415-8978-51788088124d` | 🔧 Verificar fisicamente no local |
| GOEC6O008 - Faixa 1 | 191.58.157.152 | `5d6880f0-e8f2-4ff0-be25-00c3b31d6522` | 🔧 Verificar fisicamente no local |
| GOEC6O013 - Faixa 1 | 187.43.160.194 | `7d9bf2eb-0f9a-4691-bffd-e003fc3781ed` | 🔧 Verificar fisicamente no local |
| GOEC6O018 - Faixa 1 | 177.200.42.236 | `0e154d78-62b4-4e0f-867c-0d93b7c79c74` | 🔧 Verificar fisicamente no local |
| GOEC6O029 - Faixa 1 | 177.25.224.79 | `d4c91424-ff2b-408a-930d-f12b595a6212` | 🔧 Verificar fisicamente no local |
| GOEC6O029 - Faixa 2 | 177.25.224.79 | `0462e9d3-b0ce-42aa-9cfb-1b24c1cb1bee` | 🔧 Verificar fisicamente no local |
| GOEC6O048 - Faixa 1 | 179.249.70.250 | `43d7e92f-482e-4822-bf76-ef2c5cc4dfd9` | 🔧 Verificar fisicamente no local |
| GOEC6O048 - Faixa 2 | 179.249.70.250 | `d23fe240-246f-4601-8987-d864ecb24d22` | 🔧 Verificar fisicamente no local |

### Passos para verificação física

1. Deslocar equipe técnica ao ponto de instalação
2. Verificar alimentação elétrica do equipamento
3. Verificar cabo de rede / conexão 4G do roteador
4. Verificar LED de status do equipamento:
   - 🟢 Verde piscando = operacional
   - 🔴 Vermelho = falha de hardware
   - ⚫ Apagado = sem energia
5. Reinicializar o equipamento se necessário
6. Após restaurar a comunicação, re-executar a validação

---

## 🔄 Como re-executar este relatório

```bash
# 1. Recoleta dados da frota (≈90s)
node auditoria-itscam/recoletar-dados.mjs

# 2. Valida configurações e atualiza validacao-config.json
node auditoria-itscam/validar-config.mjs

# 3. Gera este relatório
node auditoria-itscam/gerar-relatorio.mjs
```

---

*Relatório gerado automaticamente pelo sistema de auditoria ITScam — Axion Tecnologia*