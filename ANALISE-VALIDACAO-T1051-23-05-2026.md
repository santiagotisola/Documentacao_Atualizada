# Análise de Validação — Equipamento T1051 (STRANS)

**Ticket:** #99803931 — "Divergência de fluxo no equipamento T1051"  
**Cliente:** Haviner Cavalcante (STRANS / Labor Engenharia)  
**Data de referência:** 23/05/2026  
**Equipamento:** T1051 (Fabricante: VIZENTEC)  
**Localização:** Av. Jerumenha x Av. Castelo do Piauí, Teresina  
**Data da análise:** 29/05/2026

---

## 1. Resumo Executivo

Os dados do equipamento T1051 estão **consistentes e corretos**. A aparente divergência ocorre porque o Relatório de Fluxo e a Triagem medem estágios diferentes do pipeline de processamento de infrações.

---

## 2. Dados Coletados — Dia 23/05/2026

### 2.1 Relatório de Fluxo Diário de Veículos

| Faixa | Sentido | Fluxo | Infrações |
|-------|---------|------:|----------:|
| Faixa 2 | NORTE - SUL | 4.317 | **5** |
| Faixa 3 | NORTE - SUL | 852 | **15** |
| **Total** | | **5.169** | **20** |

**Fonte:** https://strans.axhub.axion.ws/relatorio/relatoriofluxodiarioveiculos  
**Filtro:** Grupo VIZENTEC → Equipamento T1051 → Maio/2026

### 2.2 Tela de Auditoria

| Válidas | Não Válidas | Processadas | Descartadas | Total |
|--------:|------------:|------------:|------------:|------:|
| 0 | **17** | 0 | 0 | **17** |

**Fonte:** https://strans.axhub.axion.ws/auditoria  
**Filtro:** 23/05/2026, Grupo VIZENTEC, Equipamento T1051

### 2.3 Tela de Triagem Infrações

| Triagem | Reavaliar | Descartadas | Processadas | Total |
|--------:|----------:|------------:|------------:|------:|
| 1 | 0 | 0 | **2** | **3** |

**Fonte:** https://strans.axhub.axion.ws/triagem  
**Filtro:** 23/05/2026, Equipamento T1051, checkbox "Exibir Processadas/Descartadas" ✓

---

## 3. Validação Cruzada

```
Relatório de Fluxo (infrações totais detectadas):     20
                                                      ──
Auditoria (imagens não aprovadas):                    17
Triagem (imagens que passaram auditoria):           +  3
                                                      ──
TOTAL Auditoria + Triagem:                            20 ✓
```

**✅ DADOS CONSISTENTES — Não há perda de registros.**

---

## 4. Explicação do Fluxo de Processamento

O pipeline de infrações no AxHub funciona em etapas:

```
┌─────────────────────┐
│ EQUIPAMENTO (T1051) │  → Captura imagens de veículos em infração
└─────────┬───────────┘
          │
          ▼ (20 infrações detectadas em 23/05)
┌─────────────────────┐
│  RELATÓRIO DE FLUXO │  → Conta TODAS as infrações geradas
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│     AUDITORIA       │  → Valida qualidade da imagem
│                     │     • Aprovada → vai para Triagem
│                     │     • Reprovada → fica como "Não Válida"
└───┬─────────────┬───┘
    │             │
    ▼             ▼
 17 Não       3 Aprovadas
 Válidas         │
                 ▼
┌─────────────────────┐
│      TRIAGEM        │  → Classificação e processamento
│                     │     • 1 pendente de triagem
│                     │     • 2 já processadas
└─────────────────────┘
```

### Por que a Triagem mostra menos que o Fluxo?

O Relatório de Fluxo mostra **todas** as 20 infrações detectadas. Porém, para uma infração chegar à Triagem, a imagem precisa primeiro ser **aprovada na Auditoria** (qualidade legível, placa visível, enquadramento correto).

No dia 23/05, das 20 infrações:
- **17 (85%)** foram reprovadas na Auditoria (imagens com problemas de qualidade)
- **3 (15%)** foram aprovadas e seguiram para a Triagem

Isso é **comportamento esperado** do sistema — não há bug nem perda de dados.

---

## 5. Observação sobre o Filtro de Equipamento na Triagem

Durante a investigação anterior (27/05), foi identificado que o filtro de equipamento na tela de Triagem **pode não estar funcionando corretamente** em alguns cenários (retornando dados de todos os equipamentos). Esse ponto está sendo tratado pela equipe de desenvolvimento.

No entanto, **isso não afeta a consistência dos dados** — apenas a visualização filtrada.

---

## 6. Conclusão

| Aspecto | Status | Observação |
|---------|--------|------------|
| Comunicação do T1051 | ✅ Normal | Fluxo de 5.169 veículos no dia |
| Geração de infrações | ✅ Normal | 20 infrações geradas |
| Consistência dos dados | ✅ Correto | Auditoria (17) + Triagem (3) = Fluxo (20) |
| Alta taxa de rejeição na Auditoria | ⚠️ Observar | 85% das imagens não passaram — verificar posicionamento/limpeza da câmera |

### Recomendação ao cliente:
- A discrepância é **normal** e esperada pelo workflow do sistema
- Sugerimos verificar a **qualidade das imagens** do T1051 (85% de rejeição é alto)
- Possíveis causas: sujeira na lente, desalinhamento, iluminação insuficiente à noite
