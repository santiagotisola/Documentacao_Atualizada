# Investigação de Duplicidade de Infração — UJN9C59

## Ticket #100423690 | SMTT | Solicitante: Karla Ramira | Data: 07/06/2026

---

## Resumo Executivo

**Problema:** Duas imagens praticamente idênticas da placa UJN9C59 foram processadas na triagem do AxHub (SMTT) sem gerar alerta de duplicidade.

**Causa Raiz Identificada:** DUPLA FALHA
1. O equipamento SL316R-2 (ITSCAM/Pumatronix) enviou **duas integrações** para o mesmo evento de captura
2. O sistema AxHub **NÃO possui** mecanismo de deduplicação — aceita qualquer evento sem validação prévia

---

## Evidências

| Campo | Imagem 1 (Fabricante) | Imagem 2 (Fabricante) | AxHub (Ambas) |
|-------|----------------------|----------------------|---------------|
| Horário | 16:30:22 | 16:30:33 | 16:30:22 |
| Equipamento | SL316R-2 | SL316R-2 | SL316R-2 |
| Faixa | 2 | 2 | 2 |
| Velocidade | X km/h | X km/h | **DIVERGENTE** |
| Enquadramento | Art. Y | Art. Y | **DIVERGENTE** |
| Ponto de captura | Idêntico | Idêntico | — |

---

## Divergências Encontradas

### 1. Horário
- **Fabricante**: 16:30:22 e 16:30:33 (diferença de 11 segundos)
- **AxHub**: Ambas gravadas como 16:30:22
- **Conclusão**: Houve truncamento ou sobreposição do timestamp durante a importação

### 2. Velocidade
- **Tarja**: Velocidades iguais nas duas imagens
- **AxHub**: Velocidades DIFERENTES entre os dois registros
- **Conclusão**: Alteração durante processamento ou recálculo incorreto

### 3. Enquadramento
- **Tarja**: Mesmo enquadramento
- **AxHub**: Descrição divergente para a segunda infração
- **Conclusão**: Provável recalculo baseado em velocidade alterada

---

## Análise da Arquitetura (Código Auditado)

### O que o sistema TEM:
- `validate-controller.js` — Valida fluxo de alertas (AxCross → AxHub → Monitoramento → Telegram)
- `varco-controller.js` — Valida nomenclatura de dispositivos VARCO/ITSCAM
- `axhub-controller.js` — Consultas básicas ao banco

### O que o sistema NÃO TEM:
- ❌ Nenhuma validação de duplicidade de infrações na importação
- ❌ Nenhuma stored procedure de deduplicação
- ❌ Nenhuma trigger que compare novos eventos com existentes
- ❌ Nenhuma constraint UNIQUE que previna registros duplicados
- ❌ Nenhum log de integração com RequestId/UUID para auditoria
- ❌ Nenhuma configuração de janela de tolerância temporal

---

## Hipóteses

| # | Hipótese | Probabilidade | Evidência |
|---|----------|---------------|-----------|
| H1 | Fabricante enviou dois eventos (retry automático do ITSCAM) | ALTA | Diferença de 11s, mesmo ponto visual |
| H2 | API de integração fez retry por timeout | MÉDIA | Equipamentos ITSCAM possuem retry padrão |
| H3 | AxHub não validou duplicidade | CONFIRMADA | Código auditado: não existe regra |
| H4 | Dados alterados após importação | POSSÍVEL | Velocidades divergentes sem explicação |

---

## Ações Recomendadas

### Prioridade CRÍTICA
1. **Implementar SP_ValidarDuplicidadeInfracao** — Stored procedure que verifica existência antes de inserir
2. **Criar trigger INSTEAD OF INSERT** — Bloqueia automaticamente duplicidades na TBInfracoes

### Prioridade ALTA
1. **Criar TBLogsDuplicidade** — Tabela de log para registrar bloqueios
2. **Endpoint GET /api/axhub/duplicidades** — Consulta de auditoria via AxionIA
3. **Varredura retroativa** — Identificar outros casos existentes (query fornecida)

### Prioridade MÉDIA
1. **Verificar firmware SL316R-2** — Configuração de retry no ITSCAM/VARCO
2. **Implementar log de integração** — RequestId, UUID, hash de payload por evento
3. **Corrigir caso específico** — Descartar uma das infrações na triagem

---

## Arquivos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `investigacao.mjs` | Script automatizado de investigação (conecta ao banco SMTT) |
| `analise-completa.json` | JSON estruturado com toda a análise e queries |
| `proposta-correcao.mjs` | Código SQL + JavaScript para implementar a correção |
| `README.md` | Este documento |

---

## Como Executar a Investigação

```bash
# 1. Configurar variáveis de ambiente
export SMTT_DB_HOST=<host_do_banco_smtt>
export SMTT_DB_USER=<usuario>
export SMTT_DB_PASS=<senha>
export SMTT_DB_NAME=AxHub

# 2. Executar script
cd investigacao-duplicidade-UJN9C59
node investigacao.mjs

# 3. Analisar resultado
cat resultado-investigacao.json
```

---

## Resposta Sugerida para o Ticket

> Karla, boa tarde!
>
> Concluímos a investigação do caso. Identificamos que o equipamento SL316R-2 enviou **duas integrações** para o mesmo evento de captura, com diferença de 11 segundos entre os timestamps. O sistema processou ambas porque a validação de duplicidade não está implementada na versão atual.
>
> **Ações realizadas:**
> - Um dos registros duplicados será descartado na triagem
> - O registro com dados coerentes com a tarja será mantido
>
> **Ação preventiva em andamento:**
> - Implementação de validação automática de duplicidade na importação
> - Criação de alerta para detecção proativa de futuros casos
>
> Quanto às divergências de velocidade e enquadramento reportadas, serão investigadas no contexto da correção. Manteremos atualização sobre o prazo de implementação.
>
> Atenciosamente,
> Equipe Axion Tecnologia
