# Análise Equipamentos VARCO - Problema Faixas

**Data da Análise:** 17/06/2026, 10:48:20

---

## 📊 Sumário Executivo

- **Total de Dispositivos:** 74
- **Online:** 60 (81.1%)
- **Offline:** 14 (18.9%)
- **Locais com Problema Reportado:** 9
- **Equipamentos com Queda às 22h:** 0

## 🔴 Dispositivo Exemplo - OFFLINE

- **Nome:** GOEC6O010 - Faixa 1
- **UUID:** `abf8fedb-4f1b-471f-a6bd-4e00484d5737`
- **IP:** 138.97.25.44
- **Status:** 🔴 OFFLINE
- **Última Conexão:** 2026-06-17T13:47:24Z
- **Disponibilidade:** 99.88%
- **Túnel VARCO:** https://abf8fedb-4f1b-471f-a6bd-4e00484d5737-80.tunnel.varco.cloud

### Erro Reportado
```
Dispositivo Offline
O túnel está configurado, mas o dispositivo não está conectado no momento
```

## ⚠️ Equipamentos Reportados com Problema

| Local | Faixa | Nome | Status | Última Visão | Availability | Problema 22h |
|-------|-------|------|--------|--------------|--------------|--------------|
| 10 | 1 | GOEC6O010 - Faixa 1 | 🔴 Offline | 2026-06-17T13:47:24Z | 99.88% | - |
| 11 | 1 | GOEC6O011 - Faixa 1 | 🔴 Offline | 2026-06-17T13:47:20Z | 90.67% | - |
| 13 | 1 | GOEC6O013 - Faixa 1 | 🔴 Offline | 2026-06-17T13:47:26Z | 99.92% | - |
| 13 | 2 | GOEC6O013 - Faixa 2 | 🔴 Offline | 2026-06-17T13:47:27Z | 99.91% | - |
| 18 | 2 | GOEC6O018 - Faixa 2 | 🔴 Offline | 2026-06-17T13:47:22Z | 90.65% | - |
| 28 | 1 | GOEC6O028 - Faixa 1 | 🟢 Online | 2026-06-17T13:47:42Z | 57.54% | - |
| 29 | 1 | GOEC6O029 - Faixa 1 | 🟢 Online | 2026-06-17T13:47:33Z | 65.65% | - |
| 44 | 1 | GOEC6O044 - Faixa 1 | 🔴 Offline | 2026-06-17T13:47:28Z | 9.24% | - |
| 44 | 2 | GOEC6O044 - Faixa 2 | 🔴 Offline | 2026-06-17T13:47:26Z | 99.91% | - |
| 46 | 2 | GOEC6O046 - Faixa 2 | 🔴 Offline | 2026-06-17T13:47:23Z | 99.91% | - |
| 57 | 1 | GOEC6O057 - Faixa 1 | 🔴 Offline | 2026-06-17T13:48:12Z | 99.93% | - |

## 🔍 Análise Comparativa: Faixa 1 vs Faixa 2

- **Locais Divergentes:** 17
- **Locais Conformes:** 18
- **Locais Incompletos:** 4 (apenas uma faixa)

### 🚨 Locais com Divergências entre Faixas

#### Local 3 (GOEC6O003)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 177.25.235.230 | 177.25.235.230 | OK |
| Availability | 96.48% | 53.44% | Δ 43.04% |
| UUID | `1792282c-bacb-4808-8ff6-e44404b72de5` | `ea779324-56d4-4ea5-bfb6-63b4cf751621` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 96.48%, Faixa 2 = 53.44%

#### Local 5 (GOEC6O005)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 160.19.243.71 | 160.19.243.71 | OK |
| Availability | 9.24% | 99.88% | Δ 90.64% |
| UUID | `0b6cdb29-2876-40fd-8e57-51572a2a1021` | `3df4eaee-9d2d-480d-b04c-faf75662dc70` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 9.24%, Faixa 2 = 99.88%

#### Local 7 (GOEC6O007)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 191.58.131.231 | 191.58.131.231 | OK |
| Availability | 99.63% | 87.07% | Δ 12.56% |
| UUID | `2c1ab0be-d0a3-4742-98ed-a916cb12fa22` | `33e77a95-b079-4ce2-9d03-69d5f2c82293` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 99.63%, Faixa 2 = 87.07%

#### Local 8 (GOEC6O008)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🔴 Offline | 🔴 Offline | OK |
| IP | 187.43.163.195 | 191.58.134.17 | ⚠️ IPs diferentes |
| Availability | 0.00% | 92.97% | Δ 92.97% |
| UUID | `5d6880f0-e8f2-4ff0-be25-00c3b31d6522` | `d741e55b-19d6-4b2d-9c55-3651c310e1b1` | - |

**Divergências Detectadas:**
- **IP:** Faixa 1 = 187.43.163.195, Faixa 2 = 191.58.134.17
- **Disponibilidade:** Faixa 1 = 0.00%, Faixa 2 = 92.97%

#### Local 9 (GOEC6O009)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 187.43.163.132 | 187.43.163.132 | OK |
| Availability | 99.25% | 87.07% | Δ 12.18% |
| UUID | `c296d7bf-0d3b-4da1-bf1d-3e4fe998e4a1` | `ef0e72ca-d3a5-4f4e-bbf6-40f3737bda3f` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 99.25%, Faixa 2 = 87.07%

#### Local 10 (GOEC6O010)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🔴 Offline | 🟢 Online | ⚠️ DIVERGÊNCIA |
| IP | 138.97.25.44 | 138.97.25.44 | OK |
| Availability | 99.88% | 99.91% | Δ 0.03% |
| UUID | `abf8fedb-4f1b-471f-a6bd-4e00484d5737` | `481dd19b-4968-4759-860b-35f9ec09c206` | - |

**Divergências Detectadas:**
- **Status Conexão:** Faixa 1 = OFFLINE, Faixa 2 = ONLINE

#### Local 11 (GOEC6O011)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🔴 Offline | 🟢 Online | ⚠️ DIVERGÊNCIA |
| IP | 187.61.123.9 | 187.61.123.9 | OK |
| Availability | 90.67% | 0.00% | Δ 90.67% |
| UUID | `259688db-e246-42df-b327-192de761ec5d` | `d0595c80-9ea7-49af-b2a0-d305d688e567` | - |

**Divergências Detectadas:**
- **Status Conexão:** Faixa 1 = OFFLINE, Faixa 2 = ONLINE
- **Disponibilidade:** Faixa 1 = 90.67%, Faixa 2 = 0.00%

#### Local 18 (GOEC6O018)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🔴 Offline | 🔴 Offline | OK |
| IP | 177.200.42.236 | 177.200.42.236 | OK |
| Availability | 9.24% | 90.65% | Δ 81.41% |
| UUID | `43110b24-2ef8-432e-8382-e838930240ef` | `def24641-a5f4-4673-973c-88cba3fbb571` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 9.24%, Faixa 2 = 90.65%

#### Local 22 (GOEC6O022)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 149.19.165.242 | 149.19.165.242 | OK |
| Availability | 70.24% | 99.75% | Δ 29.51% |
| UUID | `29c1d243-f44f-4a40-b62d-06c9cce958c9` | `dfb678d9-4e51-45c5-b7a0-15a972fe354b` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 70.24%, Faixa 2 = 99.75%

#### Local 41 (GOEC6O041)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 179.242.162.53 | 179.242.162.53 | OK |
| Availability | 47.11% | 59.51% | Δ 12.40% |
| UUID | `b2faa440-b39f-479b-a3bd-afbadfbfe194` | `de950460-2405-4ec4-838d-4a8ef2b49720` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 47.11%, Faixa 2 = 59.51%

#### Local 44 (GOEC6O044)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🔴 Offline | 🔴 Offline | OK |
| IP | 189.40.76.48 | 189.40.76.48 | OK |
| Availability | 9.24% | 99.91% | Δ 90.67% |
| UUID | `90ad51ea-744c-48bd-8a98-153e081dc810` | `f05ce9f8-a34e-4942-8859-60c89bc77097` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 9.24%, Faixa 2 = 99.91%

#### Local 46 (GOEC6O046)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🔴 Offline | ⚠️ DIVERGÊNCIA |
| IP | 170.81.67.233 | 170.81.67.233 | OK |
| Availability | 99.87% | 99.91% | Δ 0.04% |
| UUID | `1e26be92-70e4-468f-a582-4e015282a4fe` | `4d68163e-8462-4dce-adad-df3b0d7c76af` | - |

**Divergências Detectadas:**
- **Status Conexão:** Faixa 1 = ONLINE, Faixa 2 = OFFLINE

#### Local 48 (GOEC6O048)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 179.249.66.56 | 179.249.66.56 | OK |
| Availability | 97.67% | 77.66% | Δ 20.01% |
| UUID | `43d7e92f-482e-4822-bf76-ef2c5cc4dfd9` | `d23fe240-246f-4601-8987-d864ecb24d22` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 97.67%, Faixa 2 = 77.66%

#### Local 52 (GOEC6O052)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 187.68.165.85 | 187.68.165.85 | OK |
| Availability | 99.88% | 87.08% | Δ 12.80% |
| UUID | `49cbc26f-7a42-47d6-9d32-bc66f740e886` | `8244f568-59f3-4f27-932e-86cc2eb10fc3` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 99.88%, Faixa 2 = 87.08%

#### Local 56 (GOEC6O056)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 170.81.93.157 | 170.81.93.157 | OK |
| Availability | 0.00% | 99.89% | Δ 99.89% |
| UUID | `07b43518-06b0-4186-89b8-201132a845ac` | `8dfa023b-1492-4d06-ad06-13aa51fe8fa2` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 0.00%, Faixa 2 = 99.89%

#### Local 57 (GOEC6O057)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🔴 Offline | 🟢 Online | ⚠️ DIVERGÊNCIA |
| IP | 138.97.25.51 | 138.97.25.51 | OK |
| Availability | 99.93% | 84.77% | Δ 15.16% |
| UUID | `41d74d00-032e-4a4c-864e-ac86ea4d01aa` | `78fd907c-0085-4d9b-963d-b4e8ee2ad47b` | - |

**Divergências Detectadas:**
- **Status Conexão:** Faixa 1 = OFFLINE, Faixa 2 = ONLINE
- **Disponibilidade:** Faixa 1 = 99.93%, Faixa 2 = 84.77%

#### Local 59 (GOEC6O059)

| Aspecto | Faixa 1 | Faixa 2 | Observação |
|---------|---------|---------|------------|
| Status | 🟢 Online | 🟢 Online | OK |
| IP | 170.81.93.135 | 170.81.93.135 | OK |
| Availability | 9.26% | 90.63% | Δ 81.37% |
| UUID | `97a97d01-3d12-4f16-94b0-831575825255` | `cedcda0f-9104-498c-9f52-8f6e3ebfdcfb` | - |

**Divergências Detectadas:**
- **Disponibilidade:** Faixa 1 = 9.26%, Faixa 2 = 90.63%

## ⏰ Análise de Horário das Quedas

| Local | Faixa | Hora da Queda | Horas Offline | Problema às 22h |
|-------|-------|---------------|---------------|-----------------|
| 10 | 1 | 10:00 | 0.0h | Não |
| 11 | 1 | 10:00 | 0.0h | Não |
| 13 | 1 | 10:00 | 0.0h | Não |
| 13 | 2 | 10:00 | 0.0h | Não |
| 18 | 2 | 10:00 | 0.0h | Não |
| 44 | 1 | 10:00 | 0.0h | Não |
| 44 | 2 | 10:00 | 0.0h | Não |
| 46 | 2 | 10:00 | 0.0h | Não |
| 57 | 1 | 10:00 | 0.0h | Não |

## 🔬 Hipóteses de Diagnóstico

## ✅ Recomendações de Correção

### Ações Imediatas

1. **Verificar Logs do Sistema**
   ```bash
   # Acessar via túnel VARCO (quando online)
   journalctl -u itscam -S "22:00" --since today
   tail -f /var/log/syslog | grep -i varco
   ```

2. **Verificar Tarefas Agendadas (cron)**
   ```bash
   crontab -l
   ls -la /etc/cron.d/
   systemctl list-timers
   ```

3. **Testar Conectividade Manual**
   ```bash
   # No dispositivo (via SSH ou console)
   ping edge.varco.io -c 5
   curl -v https://api.varco.io/health
   ```

### Ações de Médio Prazo

1. **Ajustar Configuração do Agente VARCO**
   - Revisar timeout de conexão
   - Configurar retry automático
   - Aumentar intervalo de keep-alive

2. **Monitoramento Proativo**
   - Configurar alertas para quedas de conexão
   - Implementar health check periódico
   - Log detalhado de eventos de reconexão

3. **Padronizar Configurações**
   - Garantir que Faixa 1 e Faixa 2 tenham configurações idênticas
   - Sincronizar versões de firmware
   - Validar configurações de rede

## 🎯 Dispositivos Prioritários para Investigação

### Offline no Momento

- **GOEC6O010 - Faixa 1** (Local 10, Faixa 1)
  - UUID: `abf8fedb-4f1b-471f-a6bd-4e00484d5737`
  - Túnel: https://abf8fedb-4f1b-471f-a6bd-4e00484d5737-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:47:24Z

- **GOEC6O011 - Faixa 1** (Local 11, Faixa 1)
  - UUID: `259688db-e246-42df-b327-192de761ec5d`
  - Túnel: https://259688db-e246-42df-b327-192de761ec5d-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:47:20Z

- **GOEC6O013 - Faixa 1** (Local 13, Faixa 1)
  - UUID: `7d9bf2eb-0f9a-4691-bffd-e003fc3781ed`
  - Túnel: https://7d9bf2eb-0f9a-4691-bffd-e003fc3781ed-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:47:26Z

- **GOEC6O013 - Faixa 2** (Local 13, Faixa 2)
  - UUID: `36896650-1bca-4093-9631-667b73bdd93d`
  - Túnel: https://36896650-1bca-4093-9631-667b73bdd93d-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:47:27Z

- **GOEC6O018 - Faixa 2** (Local 18, Faixa 2)
  - UUID: `def24641-a5f4-4673-973c-88cba3fbb571`
  - Túnel: https://def24641-a5f4-4673-973c-88cba3fbb571-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:47:22Z

- **GOEC6O044 - Faixa 1** (Local 44, Faixa 1)
  - UUID: `90ad51ea-744c-48bd-8a98-153e081dc810`
  - Túnel: https://90ad51ea-744c-48bd-8a98-153e081dc810-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:47:28Z

- **GOEC6O044 - Faixa 2** (Local 44, Faixa 2)
  - UUID: `f05ce9f8-a34e-4942-8859-60c89bc77097`
  - Túnel: https://f05ce9f8-a34e-4942-8859-60c89bc77097-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:47:26Z

- **GOEC6O046 - Faixa 2** (Local 46, Faixa 2)
  - UUID: `4d68163e-8462-4dce-adad-df3b0d7c76af`
  - Túnel: https://4d68163e-8462-4dce-adad-df3b0d7c76af-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:47:23Z

- **GOEC6O057 - Faixa 1** (Local 57, Faixa 1)
  - UUID: `41d74d00-032e-4a4c-864e-ac86ea4d01aa`
  - Túnel: https://41d74d00-032e-4a4c-864e-ac86ea4d01aa-80.tunnel.varco.cloud
  - Última conexão: 2026-06-17T13:48:12Z

## 🛠️ Comandos Úteis para Diagnóstico

### Verificar Status Geral da Frota
```bash
curl http://localhost:3100/api/varco/frota
```

### Forçar Recoleta de Dados
```bash
curl -X POST http://localhost:3100/api/varco/recoleta \
  -H "X-Admin-Token: 4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3"
```

### Acessar Dispositivo via Túnel VARCO
```
# Login: admin
# Senha: #econocr@
```

---

*Relatório gerado automaticamente em 17/06/2026, 10:48:20*