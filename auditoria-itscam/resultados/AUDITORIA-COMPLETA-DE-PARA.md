# AUDITORIA COMPLETA ITScam 450 — De-Para de Configurações

**Data:** 03/06/2026  
**Equipamentos auditados:** 70 (64 online, 6 offline)  
**Referências confirmadas:** GOEC6O058-F1 e GOEC6O007-F1 (idênticos, ambos funcionando corretamente)  
**Equipamentos com problema conhecido (P&B de dia):** GOEC6O008-F1, GOEC6O040-F1, GOEC6O013-F1  

---

## COMO LER ESTE DOCUMENTO

Cada seção representa um **problema específico** encontrado na frota. Para cada um:

1. **O que é** — Explicação simples do problema
2. **Onde corrigir** — Caminho exato no sistema (tela por tela)
3. **De-Para** — Tabela mostrando o valor errado vs valor correto
4. **Equipamentos afetados** — Lista completa

---

## ÍNDICE

1. [PROBLEMA 1 — Camera presa no modo noturno (P&B de dia)](#problema-1)
2. [PROBLEMA 2 — Transição por horário (risco de travar)](#problema-2)
3. [PROBLEMA 3 — Classificador com fila alta](#problema-3)
4. [PROBLEMA 4 — Vídeo MJPEG degradado](#problema-4)
5. [PROBLEMA 5 — OCR com desempenho reduzido](#problema-5)
6. [PROBLEMA 6 — OCR tipo veículo/placas incorreto](#problema-6)
7. [PROBLEMA 7 — Classificador cena/probabilidade errado](#problema-7)
8. [PROBLEMA 8 — NTP servidor incorreto](#problema-8)
9. [PROBLEMA 9 — SNMP habilitado indevidamente](#problema-9)
10. [PROBLEMA 10 — Reboot automático ativo](#problema-10)
11. [PROBLEMA 11 — Portas IO flash sem antecipação](#problema-11)
12. [PROBLEMA 12 — FTP com credenciais](#problema-12)
13. [PROBLEMA 13 — Gateway de rede divergente](#problema-13)
14. [ANÁLISE — Padrão Faixa 2 vs Faixa 1](#analise-faixa2)
15. [EQUIPAMENTOS OFFLINE](#offline)

---

<a name="problema-1"></a>
## PROBLEMA 1 — Camera presa no modo noturno (imagem P&B durante o dia)

### O QUE É

A câmera usa dois perfis de imagem: **Diurno** (colorido) e **Noturno** (P&B com flash IR). A troca entre eles é controlada por **transições de luminosidade**. Quando as transições têm **horários fixos** (startTime/endTime diferentes de 00:00:00) E o **perfil de retorno está errado**, a câmera fica **travada no noturno** e não consegue voltar para o diurno.

### COMO FUNCIONA (correto)

```
DIA (luminosidade alta)                NOITE (luminosidade baixa)
     Perfil DIURNO ◄──────────────────────── Perfil NOTURNO
     (colorido)     ────────────────────────► (P&B + flash)
                    
     Quando luz cai  → lower.level = 10 → Vai para NOTURNO
     Quando luz sobe → upper.level = 35 → Volta para DIURNO
     
     REGRA: startTime e endTime DEVEM ser 00:00:00
     (significa que a transição funciona 24h, só por luminosidade)
```

### ONDE CORRIGIR NO SISTEMA

```
1. Acessar câmera via Varco:
   https://varco.io → Devices → Selecionar equipamento → Tunnels → Link porta 80
   
2. Login: admin / #econocr@

3. Navegar até:
   Menu lateral → IMAGEM → Perfis de Imagem
   
4. Selecionar PERFIL DIURNO (primeiro perfil, id=0):
   → Aba "Transições"
   → Seção "Inferior" (Lower = transição para noturno):
      • Start Time = 00:00:00
      • End Time = 00:00:00  
      • Level = 10
      • Hold Time = 60000
   → Seção "Superior" (Upper = volta do noturno):
      • Start Time = 00:00:00
      • End Time = 00:00:00
      • Level = 35
      • Hold Time = 60000
      • Profile = 0 (Diurno)
      
5. Selecionar PERFIL NOTURNO (segundo perfil):
   → Aba "Transições"
   → Seção "Inferior" (Lower):
      • Start Time = 00:00:00
      • End Time = 00:00:00
      • Level = 10
      • Hold Time = 60000
   → Seção "Superior" (Upper = VOLTA para diurno):
      • Start Time = 00:00:00
      • End Time = 00:00:00
      • Level = 35
      • Hold Time = 60000
      • Profile = 0 (DEVE ser 0 = Diurno!)  ← ESTE É O CAMPO CRÍTICO
```

### DE-PARA

| Equipamento | Problema | Diurno Lower start/end | Diurno Upper start/end | Noturno Lower start/end | Noturno Upper start/end | Noturno Upper Profile | CORRETO |
|---|---|---|---|---|---|---|---|
| **GOEC6O008-F1** | 🔴 TRAVADO | 00:00:00/18:00:00 | 06:00:00/00:00:00 | 00:00:00/06:00:00 | 18:01:00/00:00:00 | **23483 (APONTA P/ SI MESMO!)** | 0 |
| GOEC6O058-F1 ✅ | Referência | 00:00/00:00 | 00:00/00:00 | 00:00/00:00 | 00:00/00:00 | 0 | — |
| GOEC6O007-F1 ✅ | Referência | 00:00/00:00 | 00:00/00:00 | 00:00/00:00 | 00:00/00:00 | 0 | — |

**Causa raiz do GOEC6O008-F1:**
- A transição usa **janelas de horário** (06:00-18:00) em vez de funcionar 24h
- O campo `noturno.upper.profile = 23483` aponta para **o próprio perfil noturno** (ID 23483)
- Resultado: quando deveria voltar ao diurno, volta para si mesmo → fica preso no P&B

---

<a name="problema-2"></a>
## PROBLEMA 2 — Transição por horário (risco de travar em P&B)

### O QUE É

Equipamentos com horários nas transições. Não estão travados agora, mas podem travar dependendo das condições de luz em horários específicos.

### ONDE CORRIGIR

Mesmo caminho do Problema 1:
```
IMAGEM → Perfis de Imagem → [Perfil] → Transições → Start Time/End Time
Corrigir TODOS para 00:00:00
```

### DE-PARA

| Equipamento | D.Lower start→end | D.Upper start→end | N.Lower start→end | N.Upper start→end | N.Upper Profile |
|---|---|---|---|---|---|
| **GOEC6O033-F2** | 06:00:00→18:00:00 | 06:00:00→17:58:00 | 18:00:00→06:00:00 | 18:00:00→06:00:00 | 0 ✅ |
| **GOEC6O040-F1** | 18:00:00→00:00:00 | 06:00:00→00:00:00 | 06:00:00→00:00:00 | 18:00:00→00:00:00 | 0 ✅ |
| **GOEC6O040-F2** | 00:00:00→18:00:00 | 06:00:00→00:00:00 | 00:00:00→06:00:00 | 18:01:00→00:00:00 | 0 ✅ |
| **GOEC6O055-F1** | 00:00:00→18:00:00 | 06:00:00→00:00:00 | 00:00:00→06:00:00 | 18:01:00→00:00:00 | 0 ✅ |
| **GOEC6O055-F2** | 18:00:00→00:00:00 | 06:00:00→00:00:00 | 05:59:59→00:00:00 | 18:01:00→00:00:00 | 0 ✅ |
| **CORRETO** | **00:00:00→00:00:00** | **00:00:00→00:00:00** | **00:00:00→00:00:00** | **00:00:00→00:00:00** | **0** |

### COMO CORRIGIR

Para cada equipamento da lista acima:
1. Acessar via Varco tunnel
2. Menu IMAGEM → Perfis → Perfil Diurno → Transições
3. Zerar TODOS os campos Start Time e End Time para **00:00:00**
4. Repetir para Perfil Noturno → Transições
5. Salvar

---

<a name="problema-3"></a>
## PROBLEMA 3 — Classificador com fila de processamento alta

### O QUE É

O classificador veicular identifica tipo de veículo (carro, moto, caminhão). Com `processingQueue=4` e/ou `processingThreads` alto, consome mais CPU e pode atrasar o processamento de placas (OCR).

### ONDE CORRIGIR

```
Menu lateral → EQUIPAMENTO → Classificador
  → Processing Queue = 1
  → Processing Threads = 1
```

### DE-PARA

| Equipamento | Queue Atual | Threads Atual | Queue Correto | Threads Correto |
|---|---|---|---|---|
| GOEC6O003-F2 | **4** | 1 | 1 | 1 |
| GOEC6O004-F1 | **4** | 1 | 1 | 1 |
| GOEC6O004-F2 | **4** | 1 | 1 | 1 |
| GOEC6O006-F1 | **4** | 1 | 1 | 1 |
| GOEC6O006-F2 | **4** | 1 | 1 | 1 |
| GOEC6O009-F1 | **4** | 1 | 1 | 1 |
| GOEC6O009-F2 | **4** | 1 | 1 | 1 |
| GOEC6O010-F1 | **4** | **4** | 1 | 1 |
| GOEC6O010-F2 | 1 | **2** | 1 | 1 |
| GOEC6O011-F1 | **4** | 1 | 1 | 1 |
| GOEC6O011-F2 | **2** | **2** | 1 | 1 |
| GOEC6O013-F1 | **4** | 1 | 1 | 1 |
| GOEC6O018-F2 | **4** | 1 | 1 | 1 |
| GOEC6O020-F1 | **4** | 1 | 1 | 1 |
| GOEC6O028-F1 | **2** | **2** | 1 | 1 |
| GOEC6O029-F1 | **4** | 1 | 1 | 1 |
| GOEC6O029-F2 | **4** | 1 | 1 | 1 |
| GOEC6O033-F1 | **4** | 1 | 1 | 1 |
| GOEC6O043-F1 | **4** | 1 | 1 | 1 |
| GOEC6O043-F2 | **4** | 1 | 1 | 1 |
| GOEC6O046-F1 | **4** | 1 | 1 | 1 |
| GOEC6O050-F1 | **4** | 1 | 1 | 1 |
| GOEC6O052-F2 | **4** | **4** | 1 | 1 |
| GOEC6O054-F1 | **4** | 1 | 1 | 1 |
| GOEC6O054-F2 | **4** | 1 | 1 | 1 |
| GOEC6O055-F2 | **4** | 1 | 1 | 1 |
| GOEC6O056-F1 | **4** | 1 | 1 | 1 |
| GOEC6O056-F2 | **4** | 1 | 1 | 1 |
| GOEC6O057-F1 | **4** | 1 | 1 | 1 |
| GOEC6O058-F2 | **4** | **4** | 1 | 1 |
| GOEC6O059-F2 | **4** | 1 | 1 | 1 |

**Total: 31 equipamentos**

---

<a name="problema-4"></a>
## PROBLEMA 4 — Vídeo MJPEG degradado

### O QUE É

O stream MJPEG é usado para visualização remota e captura de triggers. Com `useTriggerFrames=false`, o stream não inclui os frames exatos do momento da captura. Com `framerate=1`, a imagem atualiza apenas 1x por segundo. Com `quality` baixa, a imagem fica borrada.

### ONDE CORRIGIR

```
Menu lateral → VÍDEO → Streams
  → MJPEG → Main:
    • Framerate = 12
    • Quality = 85
    • Use Trigger Frames = true (habilitado)
```

### DE-PARA

| Equipamento | Framerate Atual | Quality Atual | Trigger Atual | Correto |
|---|---|---|---|---|
| **GOEC6O008-F1** | **1** | **60** | **false** | 12 / 85 / true |
| **GOEC6O028-F1** | **1** | **10** | **false** | 12 / 85 / true |
| GOEC6O011-F2 | **1** | 85 | true | 12 / 85 / true |
| GOEC6O055-F2 | **5** | 85 | true | 12 / 85 / true |
| GOEC6O020-F1 | 12 | 85 | **false** | 12 / 85 / true |
| GOEC6O036-F1 | 12 | 85 | **false** | 12 / 85 / true |
| GOEC6O050-F2 | 12 | 85 | **false** | 12 / 85 / true |
| GOEC6O056-F2 | 12 | 85 | **false** | 12 / 85 / true |
| GOEC6O057-F1 | 12 | 85 | **false** | 12 / 85 / true |

**Total: 9 equipamentos** (008 e 028 são os mais graves)

---

<a name="problema-5"></a>
## PROBLEMA 5 — OCR com desempenho reduzido

### O QUE É

O OCR (reconhecimento de placas) funciona melhor com 4 threads e queue 4. Com valores menores, perde placas em momentos de alto volume. O `processingMode=3` é o mais completo; modo 2 é básico e perde caracteres.

### ONDE CORRIGIR

```
Menu lateral → EQUIPAMENTO → OCR
  → Processing Threads = 4
  → Processing Queue = 4
  → Processing Mode = 3
  → Processing Timeout = 1000
```

### DE-PARA

| Equipamento | Threads | Queue | Mode | Timeout | Correto |
|---|---|---|---|---|---|
| **GOEC6O008-F1** | **2** | **2** | 3 | 1000 | 4/4/3/1000 |
| **GOEC6O009-F1** | 4 | 4 | 3 | 1000 | ✅ (ver Problema 6) |
| **GOEC6O009-F2** | 4 | 4 | 3 | 1000 | ✅ (ver Problema 6) |
| **GOEC6O010-F1** | **2** | 4 | 3 | 1000 | 4/4/3/1000 |
| **GOEC6O011-F2** | **2** | **2** | **2** | **700** | 4/4/3/1000 |
| **GOEC6O028-F1** | **2** | **2** | **2** | **700** | 4/4/3/1000 |
| **GOEC6O055-F2** | 4 | 4 | 3 | 1000 | ✅ (ver Problema 6) |
| **GOEC6O059-F2** | **1** | 4 | 3 | 1000 | 4/4/3/1000 |

**Total: 8 equipamentos** (5 com threads/queue/mode errado, 3 só com veículo/placas)

---

<a name="problema-6"></a>
## PROBLEMA 6 — OCR tipo veículo/placas incorreto

### O QUE É

`vehicleType=3` reconhece todos os veículos (carros, motos, caminhões). Com valor 1, só reconhece carros. `maxPlates=2` permite ler 2 placas por frame; com 1, perde a segunda placa.

### ONDE CORRIGIR

```
Menu lateral → EQUIPAMENTO → OCR
  → Vehicle Type = 3 (Todos)
  → Max Plates = 2
```

### DE-PARA

| Equipamento | Vehicle Type Atual | Max Plates Atual | Correto |
|---|---|---|---|
| **GOEC6O009-F1** | **1** (só carros) | 2 | 3 / 2 |
| **GOEC6O009-F2** | **1** (só carros) | **1** | 3 / 2 |
| **GOEC6O055-F2** | 3 | **1** | 3 / 2 |

**Total: 3 equipamentos**

---

<a name="problema-7"></a>
## PROBLEMA 7 — Classificador cena/probabilidade errado

### O QUE É

`sceneType=0` é para câmera fixa (padrão correto). `sceneType=1` é para câmera móvel (inadequado). `minProbability=20` aceita classificações com 20%+ de confiança; valores altos (50/60) rejeitam muitas classificações válidas.

### ONDE CORRIGIR

```
Menu lateral → EQUIPAMENTO → Classificador
  → Scene Type = 0 (Fixed)
  → Min Probability = 20
```

### DE-PARA

| Equipamento | Scene Type Atual | Min Probability Atual | Correto |
|---|---|---|---|
| **GOEC6O009-F1** | **1** (Mobile) | **60** | 0 / 20 |
| **GOEC6O009-F2** | 0 | **50** | 0 / 20 |
| **GOEC6O011-F2** | **1** (Mobile) | 20 | 0 / 20 |
| **GOEC6O028-F1** | **1** (Mobile) | 20 | 0 / 20 |
| **GOEC6O055-F2** | **1** (Mobile) | **60** | 0 / 20 |

**Total: 5 equipamentos**

---

<a name="problema-8"></a>
## PROBLEMA 8 — Servidor NTP incorreto

### O QUE É

O NTP sincroniza o relógio. `time.google.com` é estável e rápido. `200.160.0.8` é o NTP.br (pode ser lento ou instável em algumas redes).

### ONDE CORRIGIR

```
Menu lateral → SISTEMA → Geral → Data e Hora
  → NTP Server Address = time.google.com
```

### DE-PARA

| Equipamento | NTP Atual | Correto |
|---|---|---|
| **GOEC6O011-F2** | 200.160.0.8 | time.google.com |
| **GOEC6O028-F1** | 200.160.0.8 | time.google.com |

**Total: 2 equipamentos**

---

<a name="problema-9"></a>
## PROBLEMA 9 — SNMP habilitado indevidamente

### O QUE É

SNMP é um protocolo de monitoramento de rede. Não é utilizado nesta instalação. Com ele habilitado, a câmera fica exposta a escaneamento de rede (risco de segurança). O community contém uma variável não resolvida.

### ONDE CORRIGIR

```
Menu lateral → SISTEMA → Monitoramento → SNMP
  → Enabled = false (desabilitado)
  → V2 → Enabled = false
  → V2 → Community = (vazio)
```

### DE-PARA

| Equipamento | SNMP | V2 | Community | Correto |
|---|---|---|---|---|
| **GOEC6O009-F1** | **true** | **true** | {$SNMP_COMMUNITY} | false/false/(vazio) |
| **GOEC6O009-F2** | **true** | **true** | {$SNMP_COMMUNITY} | false/false/(vazio) |

**Total: 2 equipamentos**

---

<a name="problema-10"></a>
## PROBLEMA 10 — Reboot automático ativo

### O QUE É

A câmera está configurada para reiniciar sozinha em dias específicos. Isso causa interrupções inesperadas na captura. Os demais 62 equipamentos não têm isso habilitado.

### ONDE CORRIGIR

```
Menu lateral → SISTEMA → Manutenção → Reboot Automático
  → Scheduled → Enabled = false (desabilitado)
```

### DE-PARA

| Equipamento | Habilitado | Dias da semana | Hora | Correto |
|---|---|---|---|---|
| **GOEC6O009-F1** | **true** | Dom(0), Qua(2), Sex(4), Sáb(6) | 00h | false |
| **GOEC6O009-F2** | **true** | Dom(0), Qua(2), Sex(4), Sáb(6) | 00h | false |

**Total: 2 equipamentos**

---

<a name="problema-11"></a>
## PROBLEMA 11 — Portas IO flash sem antecipação

### O QUE É

O parâmetro `earlyUs=7` define a antecipação do disparo do flash em microssegundos para compensar o delay eletrônico. Com `earlyUs=0`, o flash dispara atrasado e a iluminação não sincroniza com a captura. `isReserved=true` protege a porta de alterações acidentais.

### ONDE CORRIGIR

```
Menu lateral → EQUIPAMENTO → Portas IO
  → Output 1 (Flash 1):
    • Early Us = 7
    • Is Reserved = true
  → Output 3 (Flash 2):
    • Early Us = 7
    • Is Reserved = true
```

### DE-PARA

| Equipamento | Out1 earlyUs | Out1 reserved | Out3 earlyUs | Out3 reserved | Correto |
|---|---|---|---|---|---|
| **GOEC6O008-F1** | **0** | true | **0** | true | 7/true/7/true |
| **GOEC6O033-F2** | 7 | **false** | 7 | **false** | 7/true/7/true |

**Total: 2 equipamentos**

---

<a name="problema-12"></a>
## PROBLEMA 12 — FTP com credenciais configuradas

### O QUE É

O cliente FTP da câmera está com credenciais configuradas desnecessariamente. Na operação normal, o envio de imagens é feito pelo protocolo Lince, não por FTP client. Credenciais expostas representam risco de segurança.

### ONDE CORRIGIR

```
Menu lateral → EQUIPAMENTO → Servidores → FTP
  → Username = (vazio)
  → Password = (vazio)
```

### DE-PARA

| Equipamento | Username | Password | Correto |
|---|---|---|---|
| **GOEC6O036-F1** | admin | (configurada) | (vazio) |
| **GOEC6O054-F2** | admin | (configurada) | (vazio) |

**Total: 2 equipamentos**

---

<a name="problema-13"></a>
## PROBLEMA 13 — Gateway de rede divergente

### O QUE É

O gateway padrão da rede é `192.168.0.1`. Os equipamentos abaixo estão com `192.168.1.1`. Isso pode ser intencional (site com infraestrutura diferente) ou um erro de configuração.

### ONDE CORRIGIR (com cautela!)

```
⚠️ ATENÇÃO: Alterar gateway pode DESCONECTAR o equipamento!
   Verificar com equipe de campo se 192.168.1.1 é correto para este site.

Menu lateral → SISTEMA → Rede → Ethernet
  → IPv4 Primary → Gateway = 192.168.0.1
```

### DE-PARA

| Equipamento | Gateway Atual | Padrão | Ação |
|---|---|---|---|
| **GOEC6O046-F1** | 192.168.1.1 | 192.168.0.1 | ⚠️ Verificar com campo |
| **GOEC6O046-F2** | 192.168.1.1 | 192.168.0.1 | ⚠️ Verificar com campo |

**Total: 2 equipamentos**

---

<a name="analise-faixa2"></a>
## ANÁLISE — Padrão Faixa 2 vs Faixa 1 (Exposição e Flash)

### O QUE É

Todas as câmeras **Faixa 2** (27 equipamentos) têm parâmetros de exposição e flash **consistentemente diferentes** da Faixa 1. Como o padrão é uniforme entre todas as Faixa 2, isso sugere configuração **intencional** (compensação de ângulo/distância).

### COMPARAÇÃO F1 vs F2

| Parâmetro | Faixa 1 (referência) | Faixa 2 (padrão) | Possível Motivo |
|---|---|---|---|
| **Diurno gain max** | 1500 | 1000 | F2 mais próxima, precisa menos ganho |
| **Diurno shutter max** | 500 | 1500 | F2 precisa mais tempo de exposição |
| **Diurno target value** | 38 | 35 | F2 ligeiramente mais escura |
| **Diurno sharpness** | 30 | 40 | F2 precisa mais nitidez (mais longe?) |
| **Noturno flash1 out1** | 65% | 100% | F2 precisa mais iluminação |
| **Noturno flash1 out3** | 65% | 100% | F2 precisa mais iluminação |
| **Noturno flash2 out1** | 20% | 7% | Flash secundário mais fraco na F2 |
| **Noturno shutter flash1** | 50 | 100 | Exposição mais longa com flash na F2 |

### EQUIPAMENTOS FAIXA 2 COM ESTE PADRÃO (27)

GOEC6O002-F2, 003-F2, 004-F2, 006-F2, 007-F2, 008-F2, 010-F2, 020-F2, 022-F2, 029-F2, 041-F2, 043-F2, 045-F2, 046-F2, 048-F2, 050-F2, 051-F2, 054-F2, 056-F2, 058-F2, 059-F2, 009-F2, 011-F2, 013-F2, 018-F2, 053-F2, 057-F2

### DECISÃO NECESSÁRIA

**Opção A:** Manter como está (padrão F2 é intencional para compensar posicionamento)  
**Opção B:** Uniformizar com F1 (se ambas as faixas são na mesma distância)

⚠️ **Recomendação:** Validar com a equipe de instalação se os parâmetros de F2 foram configurados intencionalmente.

---

### EXCEÇÕES — Faixa 1 com divergências de exposição

Estes equipamentos **Faixa 1** têm parâmetros diferentes da referência. Como não seguem o padrão F2 nem o padrão F1, são candidatos a correção:

| Equipamento | gainMax | shutterMax | target | sharp | flash1 | flash2 | n.gainMax | n.shutterMax | Obs |
|---|---|---|---|---|---|---|---|---|---|
| **Ref (058/007)** | **1500** | **500** | **38** | **30** | **65/65** | **20/20** | **4000** | **800** | ✅ |
| GOEC6O008-F1 | **1400** | **1450** | **45** | **20** | **100/?** | **5/?** | **2400** | **2000** | 🔴 Mais divergente |
| GOEC6O009-F1 | 1500 | **1200** | **40** | **40** | **100/100** | **7/7** | 4000 | **2155** | Shutter/flash alto |
| GOEC6O013-F1 | 1500 | 500 | 38 | 30 | **100/100** | **63/65** | 4000 | 800 | Só flash divergente |
| GOEC6O028-F1 | **1400** | **1200** | **40** | **25** | **100/100** | **5/5** | **1400** | **1400** | 🔴 n.gain muito baixo! |
| GOEC6O036-F1 | **1800** | **1200** | **40** | **20** | 65/65 | **5/5** | **2400** | **1800** | Flash2 muito baixo |
| GOEC6O053-F1 | **1000** | **1500** | **35** | **40** | **70/70** | **25/25** | 4000 | 800 | Padrão similar F2 |
| GOEC6O055-F1 | 1500 | 500 | **40** | 30 | **100/100** | **7/7** | 4000 | **1200** | Target/flash/shutter |
| GOEC6O057-F1 | **1000** | **1500** | **35** | **20** | **70/70** | **25/25** | 4000 | 800 | Padrão similar F2 |

⚠️ **GOEC6O028-F1** é o mais crítico: noturno com gainMax=1400 (deveria ser 4000) → **imagem noturna muito escura**.

---

<a name="offline"></a>
## EQUIPAMENTOS OFFLINE (Falha de Autenticação)

Estes equipamentos não responderam durante a coleta. Possíveis causas: tunnel offline, firmware diferente, credenciais alteradas.

| Equipamento | Erro | Ação Recomendada |
|---|---|---|
| GOEC6O019 - Faixa 1 | AUTH_FAILED | Verificar credenciais / reiniciar tunnel |
| GOEC6O019 - Faixa 2 | AUTH_FAILED | Verificar credenciais / reiniciar tunnel |
| GOEC6O023 - Faixa 1 | AUTH_FAILED | Verificar credenciais / reiniciar tunnel |
| GOEC6O049 - Faixa 1 | AUTH_FAILED | Verificar credenciais / reiniciar tunnel |
| GOEC6O049 - Faixa 2 | AUTH_FAILED | Verificar credenciais / reiniciar tunnel |
| GOEC6O052 - Faixa 1 | AUTH_FAILED | Verificar credenciais / reiniciar tunnel |

**Para verificar no Varco:** https://varco.io → Devices → Filtrar por nome → Verificar se tunnel está "Connected"

---

## RESUMO GERAL — PRIORIDADE DE AÇÃO

| # | Problema | Equipamentos | Impacto | Urgência |
|---|---|---|---|---|
| 1 | Camera travada no P&B | 1 (008-F1) | 🔴 Sem captura diurna correta | IMEDIATO |
| 2 | Risco de travar em P&B | 5 (033-F2, 040-F1/F2, 055-F1/F2) | 🟠 Pode falhar | ALTO |
| — | Níveis de transição errados | 5 (008, 009-F1/F2, 013-F2, 033-F2) | 🟠 Sensibilidade errada | ALTO |
| — | Exposição F1 divergente | 8 (008, 009, 013, 028, 036, 053, 055, 057) | 🟠 Qualidade imagem | ALTO |
| 3 | Classificador fila alta | 31 | 🟡 Uso desnecessário de CPU | MÉDIO |
| 4 | Vídeo degradado | 9 (008, 028 graves) | 🟡 Monitoramento ruim | MÉDIO |
| 5 | OCR threads/mode baixo | 5 (008, 010, 011-F2, 028, 059-F2) | 🟡 Perda de placas | MÉDIO |
| 6 | OCR tipo veículo errado | 3 (009-F1/F2, 055-F2) | 🟡 Não lê motos | MÉDIO |
| 7 | Classificador cena errada | 5 (009-F1, 009-F2, 011-F2, 028, 055-F2) | 🔵 Classificação imprecisa | BAIXO |
| 8 | NTP incorreto | 2 (011-F2, 028) | 🔵 Relógio | BAIXO |
| 9 | SNMP habilitado | 2 (009-F1/F2) | 🔵 Segurança | BAIXO |
| 10 | Reboot automático | 2 (009-F1/F2) | 🔵 Interrupção | BAIXO |
| 11 | IO flash timing | 2 (008, 033-F2) | 🔵 Flash desincronizado | BAIXO |
| 12 | FTP credenciais | 2 (036, 054-F2) | 🔵 Segurança | BAIXO |
| 13 | Gateway diferente | 2 (046-F1/F2) | ⚠️ Verificar com campo | INVESTIGAR |
| — | Padrão F2 diferente | 27 | ❓ Possivelmente intencional | INVESTIGAR |

---

## EQUIPAMENTO MAIS PROBLEMÁTICO: GOEC6O008 - Faixa 1

Este equipamento acumula **7 problemas diferentes**:

| # | Problema | Valor Atual | Deveria Ser |
|---|---|---|---|
| 1 | Transição com horário | start/end ≠ 00:00:00 | 00:00:00 em todos |
| 2 | Noturno upper aponta p/ si | profile=23483 | profile=0 |
| 3 | Vídeo framerate | 1 | 12 |
| 4 | Vídeo quality | 60 | 85 |
| 5 | Vídeo trigger | false | true |
| 6 | OCR threads/queue | 2/2 | 4/4 |
| 7 | IO earlyUs | 0/0 | 7/7 |
| 8 | Diurno gainMax | 1400 | 1500 |
| 9 | Diurno shutterMax | 1450 | 500 |
| 10 | Diurno target | 45 | 38 |
| 11 | Diurno sharpness | 20 | 30 |
| 12 | Noturno gamma | 120 | 12 |
| 13 | Noturno gainMax | 2400 | 4000 |
| 14 | Noturno shutterMax | 2000 | 800 |

---

## EQUIPAMENTO GOEC6O009 (Faixa 1 e 2)

Segundo mais problemático, acumula configurações de sistema incorretas:

| # | Problema | F1 | F2 | Deveria Ser |
|---|---|---|---|---|
| 1 | OCR vehicleType | 1 (só carro) | 1 (só carro) | 3 (todos) |
| 2 | OCR maxPlates | 2 | 1 | 2 |
| 3 | Classifier sceneType | 1 (mobile) | 0 | 0 (fixed) |
| 4 | Classifier minProb | 60 | 50 | 20 |
| 5 | Classifier queue | 4 | 4 | 1 |
| 6 | SNMP | habilitado | habilitado | desabilitado |
| 7 | Reboot automático | habilitado | habilitado | desabilitado |
| 8 | Transition upper level | 40 | 40 | 35 |

---

## NÍVEIS DE TRANSIÇÃO (Level) DIVERGENTES

Estes equipamentos usam levels diferentes para transição dia/noite. O nível de luminosidade (ADC) define quando trocar de perfil.

### ONDE CORRIGIR

```
Menu lateral → IMAGEM → Perfis de Imagem → [Perfil] → Transições
  → Lower → Level = 10  (limiar para ir pro noturno)
  → Upper → Level = 35  (limiar para voltar ao diurno)
```

### DE-PARA

| Equipamento | D.Lower | D.Upper | N.Lower | N.Upper | Correto |
|---|---|---|---|---|---|
| **GOEC6O008-F1** | 10 ✅ | **30** | 10 ✅ | **30** | 10/35/10/35 |
| **GOEC6O009-F1** | 10 ✅ | **40** | 10 ✅ | **40** | 10/35/10/35 |
| **GOEC6O009-F2** | 10 ✅ | **40** | 10 ✅ | **40** | 10/35/10/35 |
| **GOEC6O013-F2** | **30** | **30** | 10 ✅ | **30** | 10/35/10/35 |
| **GOEC6O033-F2** | **35** | **35** | **35** | **35** | 10/35/10/35 |

---

## ARQUIVOS GERADOS

| Arquivo | Conteúdo |
|---|---|
| `PLANILHA-TRANSICOES.csv` | Todos os 64 equip. com valores de transição (para abrir no Excel) |
| `PLANILHA-EXPOSICAO-FLASH.csv` | Exposição diurna/noturna e flash de todos |
| `PLANILHA-OCR-SISTEMA.csv` | OCR, classificador, vídeo, NTP, SNMP de todos |
| `_DIAGNOSTICO_TRANSICOES.json` | Diagnóstico automático com classificação de risco |
| `_PERFIS_COMPLETOS.json` | Dados extraídos dos perfis de todos os 70 equip. |
| `_ALL_DEVICES.json` | Dados brutos completos (35 endpoints × 70 equip.) |

Todos os arquivos estão em: `auditoria-itscam/resultados/`
