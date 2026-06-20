# Diagnóstico: Equipamentos Offline no Dashboard Mas Gerando Passagens — IPEMPE

## 🎯 **Resumo Executivo**

**Problema identificado**: Equipamentos aparecem como **offline** no dashboard do AxHub IPEMPE, mas estão **gerando passagens normalmente** (conforme relatórios de fluxo diário e mapa de teste).

**Causa raiz**: **Heartbeat não está sendo enviado** pelos equipamentos, embora o envio de passagens esteja funcionando.

**Impacto**: 
- ❌ Dashboard exibe status incorreto (equipamentos online aparecem como offline)
- ❌ Alertas de equipamento offline são falsos positivos
- ✅ Processamento de imagens/passagens está funcionando normalmente

---

## 📊 **Análise Técnica**

### O que é Heartbeat vs. Passagens?

| Aspecto | Heartbeat | Passagens |
|---------|-----------|-----------|
| **O que é** | Sinal periódico de "pulso de vida" | Dados de veículos detectados |
| **Finalidade** | Monitorar conectividade do equipamento | Registrar detecções para infrações |
| **Frequência** | A cada 5-10 minutos (configurável) | Quando veículo é detectado |
| **Tabela** | `TBHeartbeatEquipamentos` | `TBPassagens` |
| **Independente** | ✅ Sim | ✅ Sim |
| **Pode falhar separadamente** | ✅ Sim | ✅ Sim |

:::warning Importante
**Heartbeat e Passagens são processos INDEPENDENTES!**

Um equipamento pode:
- ✅ Enviar passagens mas NÃO enviar heartbeat (seu caso atual)
- ✅ Enviar heartbeat mas NÃO enviar passagens (problema inverso)
- ✅ Enviar ambos (funcionamento normal)
- ❌ Não enviar nenhum (offline completo)
:::

---

## 🔍 **Como Confirmar o Diagnóstico**

### 1. Verificar se equipamento está enviando passagens

Acesse: `https://ipempe.axhub.axion.ws/relatorio/relatoriofluxodiarioveiculos`

```sql
-- Query para verificar últimas passagens
SELECT TOP 10
    p.DataHoraPassagem,
    e.Codigo AS CodigoEquipamento,
    e.Descricao AS NomeEquipamento,
    p.Placa,
    DATEDIFF(MINUTE, p.DataHoraPassagem, GETDATE()) AS MinutosAtras
FROM TBPassagens p
JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C') -- Equipamentos "offline"
ORDER BY p.DataHoraPassagem DESC
```

**✅ Resultado esperado**: Se retornar passagens recentes (< 24h), equipamento ESTÁ ENVIANDO DADOS.

---

### 2. Verificar se equipamento está enviando heartbeat

```sql
-- Query para verificar último heartbeat
SELECT 
    e.Codigo AS CodigoEquipamento,
    e.Descricao AS NomeEquipamento,
    h.DataHoraHeartbeat AS UltimoHeartbeat,
    DATEDIFF(MINUTE, h.DataHoraHeartbeat, GETDATE()) AS MinutosSemSinal,
    CASE 
        WHEN h.DataHoraHeartbeat >= DATEADD(HOUR, -2, GETDATE()) THEN 'Online'
        ELSE 'Offline'
    END AS StatusCalculado
FROM TBEquipamentos e
LEFT JOIN TBHeartbeatEquipamentos h ON e.IdEquipamento = h.Equipamento_id
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C')
ORDER BY h.DataHoraHeartbeat DESC
```

**❌ Resultado esperado**: Se `UltimoHeartbeat` for antigo (> 2 horas), heartbeat NÃO ESTÁ SENDO ENVIADO.

---

### 3. Comparar Passagens vs. Heartbeat

```sql
-- Query comparativa
SELECT 
    e.Codigo,
    e.Descricao,
    (SELECT MAX(DataHoraPassagem) FROM TBPassagens WHERE IdEquipamento = e.IdEquipamento) AS UltimaPassagem,
    (SELECT MAX(DataHoraHeartbeat) FROM TBHeartbeatEquipamentos WHERE Equipamento_id = e.IdEquipamento) AS UltimoHeartbeat,
    DATEDIFF(MINUTE, (SELECT MAX(DataHoraPassagem) FROM TBPassagens WHERE IdEquipamento = e.IdEquipamento), GETDATE()) AS MinutosSemPassagem,
    DATEDIFF(MINUTE, (SELECT MAX(DataHoraHeartbeat) FROM TBHeartbeatEquipamentos WHERE Equipamento_id = e.IdEquipamento), GETDATE()) AS MinutosSemHeartbeat,
    CASE 
        WHEN (SELECT MAX(DataHoraPassagem) FROM TBPassagens WHERE IdEquipamento = e.IdEquipamento) > DATEADD(HOUR, -24, GETDATE()) THEN 'Gerando Passagens'
        ELSE 'Sem Passagens'
    END AS StatusPassagens,
    CASE 
        WHEN (SELECT MAX(DataHoraHeartbeat) FROM TBHeartbeatEquipamentos WHERE Equipamento_id = e.IdEquipamento) > DATEADD(HOUR, -2, GETDATE()) THEN 'Heartbeat OK'
        ELSE 'Heartbeat Falhou'
    END AS StatusHeartbeat
FROM TBEquipamentos e
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C', 'PE005C', 'PE012C')
ORDER BY e.Codigo
```

**✅ Resultado esperado para seu caso**:

| Equipamento | UltimaPassagem | UltimoHeartbeat | StatusPassagens | StatusHeartbeat |
|-------------|----------------|-----------------|-----------------|-----------------|
| PE602C | 2026-06-16 15:00 | 2025-12-13 21:00 | ✅ Gerando | ❌ Falhou |
| PE601C | 2026-06-16 14:30 | 2026-01-13 15:18 | ✅ Gerando | ❌ Falhou |
| PE004C | 2026-06-16 16:00 | 2026-02-28 09:51 | ✅ Gerando | ❌ Falhou |
| PE005C | 2026-06-16 15:50 | 2026-06-16 15:50 | ✅ Gerando | ✅ OK |
| PE012C | 2026-06-16 15:55 | 2026-06-16 15:55 | ✅ Gerando | ✅ OK |

---

## 🛠️ **Possíveis Causas do Problema**

### 1. **Script de Heartbeat desabilitado no equipamento**

**Descrição**: Equipamento tem dois processos separados:
- Processo de captura/envio de imagens (✅ funcionando)
- Processo de heartbeat (❌ parado ou desabilitado)

**Como verificar**:
- Acessar console do equipamento via SSH/Telnet
- Verificar se script de heartbeat está rodando:

```bash
# Para equipamentos Linux (Raspberry Pi, etc.)
ps aux | grep heartbeat
crontab -l | grep heartbeat

# Verificar logs do sistema
tail -f /var/log/axhub-heartbeat.log
```

**Solução**:
```bash
# Reiniciar serviço de heartbeat
sudo systemctl restart axhub-heartbeat

# Ou reativar cron job
crontab -e
# Adicionar linha: */10 * * * * /opt/axhub/heartbeat.sh
```

---

### 2. **URL/Endpoint de heartbeat incorreto**

**Descrição**: Script está tentando enviar heartbeat para URL antiga ou incorreta.

**Como verificar**:
- Verificar configuração do equipamento:

```bash
# Verificar arquivo de configuração
cat /opt/axhub/config.ini

# Ou variáveis de ambiente
env | grep AXHUB
```

**Procurar por**:
```ini
[AxHub]
SERVER_URL=https://ipempe.axhub.axion.ws
HEARTBEAT_ENDPOINT=/api/heartbeat/ping
HEARTBEAT_INTERVAL=600  # 10 minutos em segundos
```

**Solução**:
- Atualizar URL do servidor se estiver incorreta
- Verificar se endpoint existe e está respondendo

---

### 3. **Heartbeat indo para banco antigo/errado**

**Descrição**: Heartbeat pode estar sendo enviado para banco de dados de homologação/desenvolvimento em vez de produção.

**Como verificar**:
```sql
-- Verificar se tabela TBHeartbeatEquipamentos existe
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'TBHeartbeatEquipamentos'

-- Verificar estrutura da tabela
sp_help 'TBHeartbeatEquipamentos'

-- Verificar últimos registros (qualquer equipamento)
SELECT TOP 20 * FROM TBHeartbeatEquipamentos 
ORDER BY DataHoraHeartbeat DESC
```

**Se não houver registros recentes de NENHUM equipamento**: Problema pode ser no banco ou na aplicação receptora.

**Se houver registros recentes de ALGUNS equipamentos**: Problema é específico dos equipamentos PE602C, PE601C, PE004C.

---

### 4. **Problema de firewall/rede bloqueando heartbeat**

**Descrição**: Porta ou protocolo do heartbeat pode estar bloqueado, mas porta de envio de imagens não.

**Como verificar**:
```bash
# Do equipamento, testar conectividade
curl -X POST https://ipempe.axhub.axion.ws/api/heartbeat/ping \
  -H "Content-Type: application/json" \
  -d '{"equipamento_id": "PE602C", "timestamp": "2026-06-16T16:00:00"}'

# Ou usando telnet
telnet ipempe.axhub.axion.ws 443
```

**Solução**:
- Liberar porta no firewall
- Verificar regras de segurança do servidor

---

### 5. **Credenciais de autenticação expiradas**

**Descrição**: Se heartbeat requer autenticação separada, token pode ter expirado.

**Como verificar**:
```bash
# Verificar logs do equipamento
tail -f /var/log/axhub-heartbeat-error.log

# Procurar por erros tipo:
# "401 Unauthorized"
# "403 Forbidden"
# "Token expired"
```

**Solução**:
- Renovar token de autenticação
- Atualizar credenciais no equipamento

---

## ✅ **Soluções Recomendadas (por ordem de prioridade)**

### **Solução 1: Forçar envio manual de heartbeat**

Teste se o problema é temporário enviando heartbeat manualmente via SQL:

```sql
-- Forçar heartbeat manual para os 3 equipamentos offline
DECLARE @IdEquipamento UNIQUEIDENTIFIER

-- PE602C
SELECT @IdEquipamento = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE602C'
INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat)
VALUES (@IdEquipamento, GETDATE())

-- PE601C
SELECT @IdEquipamento = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE601C'
INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat)
VALUES (@IdEquipamento, GETDATE())

-- PE004C
SELECT @IdEquipamento = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE004C'
INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat)
VALUES (@IdEquipamento, GETDATE())
```

**Resultado esperado**: Equipamentos devem aparecer como online no dashboard imediatamente.

**⚠️ IMPORTANTE**: Esta é uma solução TEMPORÁRIA para teste. O problema real deve ser corrigido no equipamento.

---

### **Solução 2: Sincronizar heartbeat com passagens (workaround automático)**

Se não for possível corrigir os equipamentos imediatamente, criar trigger para atualizar heartbeat automaticamente quando chega uma passagem:

```sql
-- Criar trigger na tabela TBPassagens
CREATE OR ALTER TRIGGER TR_AtualizaHeartbeatNaPassagem
ON TBPassagens
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Atualizar ou inserir heartbeat para equipamentos que enviaram passagem
    MERGE INTO TBHeartbeatEquipamentos AS target
    USING (
        SELECT DISTINCT IdEquipamento, GETDATE() AS DataHora
        FROM inserted
    ) AS source
    ON target.Equipamento_id = source.IdEquipamento
    WHEN MATCHED THEN
        UPDATE SET DataHoraHeartbeat = source.DataHora
    WHEN NOT MATCHED THEN
        INSERT (Equipamento_id, DataHoraHeartbeat)
        VALUES (source.IdEquipamento, source.DataHora);
END
GO
```

**Vantagens**:
- ✅ Solução automática, não requer intervenção manual
- ✅ Status do dashboard reflete realidade (se enviou passagem = está online)
- ✅ Funciona mesmo se equipamento não enviar heartbeat dedicado

**Desvantagens**:
- ⚠️ Não detecta se equipamento para de funcionar entre passagens
- ⚠️ Pode dar falso positivo em horários de baixo fluxo

---

### **Solução 3: Script de sincronização periódica**

Criar job SQL que roda a cada 10 minutos para sincronizar heartbeat baseado em passagens recentes:

```sql
-- Job que roda a cada 10 minutos
CREATE OR ALTER PROCEDURE SP_SincronizarHeartbeatComPassagens
AS
BEGIN
    -- Atualizar heartbeat de equipamentos que tiveram passagens nas últimas 2 horas
    MERGE INTO TBHeartbeatEquipamentos AS target
    USING (
        SELECT 
            IdEquipamento,
            MAX(DataHoraPassagem) AS UltimaPassagem
        FROM TBPassagens
        WHERE DataHoraPassagem >= DATEADD(HOUR, -2, GETDATE())
        GROUP BY IdEquipamento
    ) AS source
    ON target.Equipamento_id = source.IdEquipamento
    WHEN MATCHED AND target.DataHoraHeartbeat < source.UltimaPassagem THEN
        UPDATE SET DataHoraHeartbeat = source.UltimaPassagem
    WHEN NOT MATCHED THEN
        INSERT (Equipamento_id, DataHoraHeartbeat)
        VALUES (source.IdEquipamento, source.UltimaPassagem);
    
    PRINT 'Heartbeat sincronizado com ' + CAST(@@ROWCOUNT AS VARCHAR) + ' equipamentos';
END
GO

-- Criar SQL Agent Job para executar a cada 10 minutos
-- (via SQL Server Management Studio → SQL Server Agent → New Job)
```

---

### **Solução 4: Corrigir configuração dos equipamentos**

Solução DEFINITIVA — corrigir o problema na origem:

#### Passo 1: Identificar modelo/marca dos equipamentos

```sql
SELECT 
    e.Codigo,
    e.NumeroSerie,
    f.Descricao AS Fabricante,
    me.Descricao AS Modelo,
    te.Descricao AS Tipo
FROM TBEquipamentos e
LEFT JOIN TBFabricantes f ON e.IdFabricante = f.IdFabricante
LEFT JOIN TBModeloEquipamentos me ON e.IdModeloEquipamento = me.IdModeloEquipamento
LEFT JOIN TBTipoEquipamentos te ON e.IdTipoEquipamento = te.IdTipoEquipamento
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C')
```

#### Passo 2: Acessar equipamentos remotamente

```bash
# SSH para equipamento (ajustar IP conforme necessário)
ssh admin@192.168.1.100

# Verificar serviços rodando
ps aux | grep -i heartbeat
systemctl status axhub-heartbeat

# Verificar logs
tail -100 /var/log/axhub/heartbeat.log
```

#### Passo 3: Reconfigurar/reiniciar serviço

```bash
# Editar configuração
sudo nano /etc/axhub/config.ini

# Verificar/corrigir estas linhas:
[Server]
URL=https://ipempe.axhub.axion.ws
HeartbeatEndpoint=/api/heartbeat/ping
HeartbeatInterval=600

# Reiniciar serviço
sudo systemctl restart axhub-heartbeat

# Verificar se está funcionando
tail -f /var/log/axhub/heartbeat.log
```

---

## 📋 **Checklist de Diagnóstico**

Execute este checklist para identificar a causa exata:

- [ ] **1. Confirmar que passagens estão sendo enviadas**
  ```sql
  SELECT TOP 5 * FROM TBPassagens 
  WHERE IdEquipamento IN (SELECT IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE602C')
  ORDER BY DataHoraPassagem DESC
  ```

- [ ] **2. Confirmar que heartbeat NÃO está sendo enviado**
  ```sql
  SELECT * FROM TBHeartbeatEquipamentos 
  WHERE Equipamento_id IN (SELECT IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE602C')
  ```

- [ ] **3. Verificar se outros equipamentos estão com heartbeat OK**
  ```sql
  SELECT TOP 10 * FROM TBHeartbeatEquipamentos 
  ORDER BY DataHoraHeartbeat DESC
  ```

- [ ] **4. Testar envio manual de heartbeat via SQL** (Solução 1)
  - [ ] Execute o INSERT manual
  - [ ] Verifique dashboard após 1 minuto
  - [ ] Equipamento aparece como online?

- [ ] **5. Se teste manual funcionou**: Problema é no equipamento
  - [ ] Acessar equipamento remotamente
  - [ ] Verificar logs de heartbeat
  - [ ] Reiniciar serviço de heartbeat

- [ ] **6. Se teste manual não funcionou**: Problema é no dashboard
  - [ ] Verificar query do dashboard
  - [ ] Verificar se está lendo tabela correta
  - [ ] Verificar chave estrangeira `Equipamento_id`

- [ ] **7. Implementar solução definitiva**
  - [ ] Solução 2 (Trigger) — para workaround rápido
  - [ ] Solução 3 (Job periódico) — para sincronização
  - [ ] Solução 4 (Corrigir equipamento) — solução ideal

---

## 🎯 **Recomendação Final**

**Para correção imediata** (hoje):
1. Execute **Solução 1** (heartbeat manual via SQL) — leva 5 minutos
2. Implemente **Solução 2** (Trigger) — leva 10 minutos

**Para correção definitiva** (próximos dias):
1. Entre em contato com responsável pelos equipamentos PE602C, PE601C, PE004C
2. Solicite acesso remoto aos equipamentos
3. Execute **Solução 4** (reconfiguração no equipamento)

**Para prevenção futura**:
1. Mantenha **Solução 2 ou 3** ativa como fallback
2. Configure alertas de heartbeat no sistema de monitoramento
3. Documente procedimento de verificação periódica

---

## 📞 **Suporte**

Para implementar as soluções ou se precisar de assistência:

**Axion Tecnologia**  
📧 suporte@axiontecnologia.com.br  
📱 WhatsApp: [número do suporte]  
🌐 https://axiontecnologia.com.br

---

**Documento criado em**: 2026-06-16  
**Cliente**: IPEMPE — Instituto de Pesos e Medidas de Pernambuco  
**Sistema**: AxHub v1.2.1  
**Status**: ✅ Diagnóstico completo
