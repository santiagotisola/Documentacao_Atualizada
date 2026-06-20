# Problema: Status Equipamentos Incorreto no Dashboard — SOLUÇÃO RÁPIDA

## 🎯 O Problema

Equipamentos **PE602C**, **PE601C** e **PE004C** aparecem como **offline** (vermelho) no dashboard, mas estão **funcionando normalmente** e gerando passagens.

## 🔍 Por Que Isso Acontece?

**Heartbeat** e **Passagens** são processos **INDEPENDENTES**:

```
┌──────────────────────────────────────────────────────────┐
│                      EQUIPAMENTO                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Processo 1: CAPTURA DE IMAGENS                         │
│  ├─ Detecta veículo                                     │
│  ├─ Tira foto                                           │
│  ├─ OCR lê placa                                        │
│  └─ Envia para TBPassagens                  ✅ FUNCIONA│
│                                                          │
│  Processo 2: HEARTBEAT (pulso de vida)                  │
│  ├─ A cada 10 minutos envia sinal                       │
│  ├─ Confirma que está online                            │
│  └─ Envia para TBHeartbeatEquipamentos      ❌ PAROU   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Resultado**: Dashboard lê `TBHeartbeatEquipamentos` (vazia ou antiga) e marca como offline, mas `TBPassagens` continua recebendo dados normalmente.

## ✅ Solução Imediata (5 minutos)

Execute este script SQL no banco de dados AxHub:

```sql
-- Forçar heartbeat manual para os 3 equipamentos
DECLARE @IdEquipamento UNIQUEIDENTIFIER

-- PE602C
SELECT @IdEquipamento = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE602C'
IF EXISTS (SELECT 1 FROM TBHeartbeatEquipamentos WHERE Equipamento_id = @IdEquipamento)
    UPDATE TBHeartbeatEquipamentos SET DataHoraHeartbeat = GETDATE() WHERE Equipamento_id = @IdEquipamento
ELSE
    INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat) VALUES (@IdEquipamento, GETDATE())

-- PE601C
SELECT @IdEquipamento = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE601C'
IF EXISTS (SELECT 1 FROM TBHeartbeatEquipamentos WHERE Equipamento_id = @IdEquipamento)
    UPDATE TBHeartbeatEquipamentos SET DataHoraHeartbeat = GETDATE() WHERE Equipamento_id = @IdEquipamento
ELSE
    INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat) VALUES (@IdEquipamento, GETDATE())

-- PE004C
SELECT @IdEquipamento = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE004C'
IF EXISTS (SELECT 1 FROM TBHeartbeatEquipamentos WHERE Equipamento_id = @IdEquipamento)
    UPDATE TBHeartbeatEquipamentos SET DataHoraHeartbeat = GETDATE() WHERE Equipamento_id = @IdEquipamento
ELSE
    INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat) VALUES (@IdEquipamento, GETDATE())
```

**Aguarde 1 minuto e recarregue o dashboard**. Equipamentos devem aparecer como online (verde).

⚠️ **IMPORTANTE**: Esta é uma solução TEMPORÁRIA. O problema voltará quando o script de heartbeat do equipamento falhar novamente.

---

## 🔧 Solução Definitiva — Trigger Automático (10 minutos)

Crie um trigger que atualiza automaticamente o heartbeat sempre que uma passagem chegar:

```sql
CREATE OR ALTER TRIGGER TR_AtualizaHeartbeatNaPassagem
ON TBPassagens
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Atualizar heartbeat automaticamente quando chegar passagem
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

### Vantagens

✅ **Automático**: Não requer intervenção manual  
✅ **Realista**: Se equipamento envia passagem, está realmente online  
✅ **Simples**: Uma vez criado, funciona para sempre  
✅ **Seguro**: Não afeta processamento de passagens  

### Desvantagens

⚠️ **Não detecta**: Equipamento parado entre passagens (baixo fluxo)  
⚠️ **Workaround**: Não corrige o problema real (script de heartbeat no equipamento)

---

## 📋 Passo a Passo Completo

### 1️⃣ **Diagnóstico** (verificar se é realmente esse o problema)

```sql
-- Verificar se equipamento gera passagem mas não envia heartbeat
SELECT 
    e.Codigo,
    MAX(p.DataHoraPassagem) AS UltimaPassagem,
    MAX(h.DataHoraHeartbeat) AS UltimoHeartbeat,
    CASE 
        WHEN MAX(p.DataHoraPassagem) > DATEADD(HOUR, -24, GETDATE()) 
         AND MAX(h.DataHoraHeartbeat) < DATEADD(HOUR, -2, GETDATE())
        THEN '⚠️ Gera passagem mas não envia heartbeat'
        ELSE '✅ OK'
    END AS Diagnostico
FROM TBEquipamentos e
LEFT JOIN TBPassagens p ON e.IdEquipamento = p.IdEquipamento
LEFT JOIN TBHeartbeatEquipamentos h ON e.IdEquipamento = h.Equipamento_id
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C')
GROUP BY e.Codigo
```

### 2️⃣ **Correção Imediata** (testar se dashboard responde)

```sql
-- Execute o script de heartbeat manual (acima na seção "Solução Imediata")
```

### 3️⃣ **Correção Definitiva** (implementar trigger)

```sql
-- Execute o script do trigger (acima na seção "Solução Definitiva")
```

### 4️⃣ **Validação** (confirmar que funcionou)

```sql
-- Verificar status atual
SELECT 
    e.Codigo,
    h.DataHoraHeartbeat,
    DATEDIFF(MINUTE, h.DataHoraHeartbeat, GETDATE()) AS MinutosAtras,
    CASE 
        WHEN h.DataHoraHeartbeat >= DATEADD(HOUR, -2, GETDATE()) THEN '🟢 Online'
        ELSE '🔴 Offline'
    END AS Status
FROM TBEquipamentos e
LEFT JOIN TBHeartbeatEquipamentos h ON e.IdEquipamento = h.Equipamento_id
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C', 'PE005C', 'PE012C')
ORDER BY e.Codigo
```

---

## 📞 Quando Chamar o Suporte?

Chame o suporte técnico da Axion se:

- ❌ Script de heartbeat manual não funcionar (dashboard continua mostrando offline)
- ❌ Trigger foi criado mas equipamentos voltam a ficar offline
- ❌ Você não tem acesso ao SQL Server para executar os scripts
- ❌ Precisa corrigir o problema definitivamente no EQUIPAMENTO (não no banco)

---

## 📚 Documentos Relacionados

- **Análise Técnica Completa**: [ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md](ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md)
- **Diagnóstico Detalhado**: [DIAGNOSTICO-HEARTBEAT-VS-PASSAGENS-IPEMPE.md](DIAGNOSTICO-HEARTBEAT-VS-PASSAGENS-IPEMPE.md)
- **Scripts Completos SQL**: [SCRIPTS-CORRECAO-HEARTBEAT-IPEMPE.sql](SCRIPTS-CORRECAO-HEARTBEAT-IPEMPE.sql)

---

## ✅ Checklist Rápido

- [ ] Executei script de heartbeat manual
- [ ] Aguardei 1 minuto
- [ ] Recarreguei o dashboard (F5)
- [ ] Equipamentos aparecem como online? **SIM** → Continuar | **NÃO** → Chamar suporte
- [ ] Criei o trigger automático
- [ ] Testei que trigger está ativo
- [ ] Documentei data da correção no sistema

---

**Criado em**: 2026-06-16  
**Cliente**: IPEMPE  
**Sistema**: AxHub v1.2.1  
**Suporte**: suporte@axiontecnologia.com.br
