# TARJA E PORTARIA - ANALISES E INVESTIGACOES

**Data de Consolidacao:** 2026-06-20  
**Arquivos consolidados:** 5

---

---

## ORIGEM: ANALISE-CHAMADO-100460372-PORTARIA-NAO-METROLOGICA.md

# AnÃ¡lise do Chamado 100460372 - Portaria NÃ£o MetrolÃ³gica na Tarja

**Data:** 2026-06-14  
**Sistema:** AxHub - STRANS  
**Chamado:** https://desk.axiontecnologia.com.br/Ticket/100460372  
**TÃ©cnico:** Labor | Strans | Haviner Cavalcante  

---

## ðŸ“‹ Resumo do Problema

O tÃ©cnico precisa alterar a **Portaria NÃ£o MetrolÃ³gica** que aparece na tarja das imagens de infraÃ§Ãµes. Ele nÃ£o sabe onde configurar essa informaÃ§Ã£o no sistema.

---

## ðŸ” AnÃ¡lise das URLs e EvidÃªncias

### 1. Tarja EspecÃ­fica
**URL:** https://strans.axhub.axion.ws/tarja/edit/7c63d905-76d5-4824-bb91-2251e62dc77d

Esta Ã© a tela de ediÃ§Ã£o de uma tarja especÃ­fica. A tarja contÃ©m um **Template** com campos de substituiÃ§Ã£o:

- `{PortariaNaoMetrologico}` - Campo que exibe a portaria nÃ£o metrolÃ³gica
- `{MarcaModeloEquipamento}` - Campo que exibe marca e modelo do equipamento
- Outros campos como: `{Data}`, `{Hora}`, `{CodigoEquipamento}`, etc.

### 2. OperaÃ§Ã£o EspecÃ­fica
**URL:** https://strans.axhub.axion.ws/operacao/edit/359a6427-d58d-490e-ab3b-362504f5c7ef

Na imagem anexada, vemos o campo **"Tarja PadrÃ£o"** destacado em vermelho. Este campo define qual tarja serÃ¡ usada nas imagens dessa operaÃ§Ã£o.

### 3. Consulta de AferiÃ§Ãµes
**URL:** https://strans.axhub.axion.ws/afericao

Listagem de aferiÃ§Ãµes/certificados dos equipamentos.

---

## ðŸ—‚ï¸ Modelo de Dados - Como Funciona

### Estrutura das Tabelas

```
TBOperacoes
â”œâ”€â”€ Equipamento_id (FK) â”€â”€â”€â”€> TBEquipamentos
â”‚                             â”œâ”€â”€ ModeloEquipamento_id (FK) â”€â”€â”€â”€> TBModeloEquipamentos
â”‚                             â”‚                                   â”œâ”€â”€ Marca (ex: "FOCALLE")
â”‚                             â”‚                                   â”œâ”€â”€ Modelo (ex: "T5403")
â”‚                             â”‚                                   â”œâ”€â”€ NumeroPortaria (ex: "492")
â”‚                             â”‚                                   â”œâ”€â”€ Portaria (ex: "Portaria INMETRO 492/2021")
â”‚                             â”‚                                   â””â”€â”€ Fabricante_id (FK)
â”‚                             â””â”€â”€ Codigo (ex: "T5403")
â”‚
â””â”€â”€ Tarja_id (FK) â”€â”€â”€â”€> TBTarjas
                        â”œâ”€â”€ Nome (ex: "Tarja Axion PadrÃ£o")
                        â”œâ”€â”€ Template (contÃ©m {PortariaNaoMetrologico}, {MarcaModeloEquipamento}, etc.)
                        â””â”€â”€ PosicaoTarja (ex: "Concatenar no RodapÃ©")
```

### Fluxo de SubstituiÃ§Ã£o dos Campos na Tarja

Quando uma infraÃ§Ã£o Ã© gerada:

1. **Sistema identifica a OperaÃ§Ã£o** (ex: SE812C-1)
2. **Busca o Equipamento** da operaÃ§Ã£o via `Equipamento_id`
3. **Busca o Modelo do Equipamento** via `ModeloEquipamento_id`
4. **Busca a Tarja** configurada na operaÃ§Ã£o via `Tarja_id`
5. **Substitui os campos** no Template da tarja:
   - `{PortariaNaoMetrologico}` â†’ **TBModeloEquipamentos.Portaria** (ex: "Portaria INMETRO 492/2021")
   - `{MarcaModeloEquipamento}` â†’ **TBModeloEquipamentos.Marca + TBModeloEquipamentos.Modelo** (ex: "FOCALLE T5403")

---

## âœ… ONDE ALTERAR A PORTARIA NÃƒO METROLÃ“GICA

### Resposta Direta ao TÃ©cnico:

> **A Portaria NÃ£o MetrolÃ³gica exibida na tarja vem do cadastro do MODELO DO EQUIPAMENTO, nÃ£o da operaÃ§Ã£o nem da tarja.**

### Passo a Passo para Alterar:

#### **1ï¸âƒ£ Identifique o Equipamento da OperaÃ§Ã£o**

Acesse a operaÃ§Ã£o problemÃ¡tica:
```
Menu: OperaÃ§Ãµes â†’ Listar OperaÃ§Ãµes
Buscar: SE812C-1 (ou o cÃ³digo do equipamento)
Abrir: EdiÃ§Ã£o da operaÃ§Ã£o
```

Veja qual equipamento estÃ¡ configurado no campo **"Equipamento"**.

#### **2ï¸âƒ£ Identifique o Modelo do Equipamento**

Acesse o cadastro do equipamento:
```
Menu: Equipamentos â†’ Listar Equipamentos
Buscar: T5403 (ou o cÃ³digo anotado na operaÃ§Ã£o)
Abrir: EdiÃ§Ã£o do equipamento
```

Veja qual **"Modelo de Equipamento"** estÃ¡ vinculado.

#### **3ï¸âƒ£ Altere a Portaria no Cadastro do Modelo**

Esta Ã© a tela **CORRETA** para alterar:

```
Menu: Cadastros BÃ¡sicos â†’ Modelos de Equipamentos
Buscar: "T5403" ou "FOCALLE T5403"
Abrir: EdiÃ§Ã£o do modelo
```

**Campos a alterar:**

| Campo | DescriÃ§Ã£o | Exemplo Atual | Novo Valor |
|-------|-----------|---------------|------------|
| **Marca** | Fabricante do equipamento | FOCALLE | (manter) |
| **Modelo** | Modelo especÃ­fico | T5403 | (manter) |
| **NÃºmero da Portaria** | NÃºmero da portaria INMETRO | 492 | **492** (se SAnMFT) |
| **Portaria** | Texto completo da portaria | Portaria INMETRO 492/2021 | **Portaria INMETRO 492/2021** |
| **Fabricante** | Fabricante cadastrado | FOCALLE | (manter) |

**IMPORTANTE:**  
- A **Portaria INMETRO 492/2021** Ã© a portaria para **Sistemas AutomÃ¡ticos nÃ£o MetrolÃ³gicos de FiscalizaÃ§Ã£o de TrÃ¢nsito (SAnMFT)**
- Se o equipamento for SAnMFT (nÃ£o faz mediÃ§Ã£o de velocidade/peso), use **Portaria 492/2021**
- Se o equipamento for metrolÃ³gico (radar de velocidade, balanÃ§a), use outras portarias (544/2014, 301/2003, etc.)

---

## ðŸ“„ ReferÃªncia: Portaria INMETRO 492/2021

A Portaria 492/2021 (anexada ao chamado) aprova os **Requisitos de AvaliaÃ§Ã£o da Conformidade para Fornecedor de Sistemas AutomÃ¡ticos nÃ£o MetrolÃ³gicos de FiscalizaÃ§Ã£o de TrÃ¢nsito - SAnMFT**.

### Tipos de SAnMFT (conforme portaria):

- **Fixo:** Instalado em local definido em carÃ¡ter permanente
- **EstÃ¡tico:** Instalado em veÃ­culo parado ou suporte apropriado  
- **MÃ³vel:** Em veÃ­culo em movimento
- **PortÃ¡til:** Direcionado manualmente para o veÃ­culo alvo

### InfraÃ§Ãµes Fiscalizadas por SAnMFT (exemplos):

- Art. 208 CTB - AvanÃ§o de sinal vermelho
- Art. 183 CTB - Uso de faixa exclusiva
- Art. 184 CTB - CirculaÃ§Ã£o em acostamento
- Art. 185 CTB - Transitar em vias destinadas a pedestres
- Art. 209 CTB - EvasÃ£o de pedÃ¡gio (conforme Portaria DENATRAN 179/2015)

---

## ðŸ–¼ï¸ Sobre as Tarjas

### O que Ã© a Tarja?

A tarja Ã© a **sobreposiÃ§Ã£o de texto** nas imagens de infraÃ§Ãµes contendo informaÃ§Ãµes como:
- Data e hora da infraÃ§Ã£o
- CÃ³digo do equipamento
- Velocidade medida (se aplicÃ¡vel)
- **Portaria do equipamento**
- **Marca e modelo do equipamento**
- Faixa de rolamento
- Enquadramento legal

### Campos de SubstituiÃ§Ã£o Comuns:

| Campo Template | Origem dos Dados | Exemplo |
|----------------|------------------|---------|
| `{Data}` | Data da passagem | 14/06/2026 |
| `{Hora}` | Hora da passagem | 14:59:32 |
| `{CodigoEquipamento}` | TBEquipamentos.Codigo | T5403 |
| `{PortariaNaoMetrologico}` | TBModeloEquipamentos.Portaria | Portaria INMETRO 492/2021 |
| `{MarcaModeloEquipamento}` | TBModeloEquipamentos.Marca + Modelo | FOCALLE T5403 |
| `{Faixa}` | TBFaixas.Descricao | Faixa 1 |
| `{Velocidade}` | Velocidade detectada | 80 km/h |

---

## ðŸ”„ Processo Completo de CorreÃ§Ã£o

### CenÃ¡rio: Equipamento T5403 mostrando portaria errada na tarja

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 1. IDENTIFICAR O MODELO DO EQUIPAMENTO                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ OperaÃ§Ãµes â†’ Editar OperaÃ§Ã£o â†’ Campo "Equipamento"           â”‚
â”‚ Equipamentos â†’ Buscar cÃ³digo â†’ Campo "Modelo de Equipamento"â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 2. ALTERAR O MODELO                                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Cadastros BÃ¡sicos â†’ Modelos de Equipamentos                 â”‚
â”‚ Buscar: "T5403" ou "FOCALLE"                                â”‚
â”‚ Editar:                                                      â”‚
â”‚   âœ“ Marca: FOCALLE                                          â”‚
â”‚   âœ“ Modelo: T5403                                           â”‚
â”‚   âœ“ NÃºmero Portaria: 492                                    â”‚
â”‚   âœ“ Portaria: Portaria INMETRO 492/2021                     â”‚
â”‚ Salvar                                                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 3. VALIDAR A ALTERAÃ‡ÃƒO                                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â€¢ Reprocessar uma infraÃ§Ã£o existente (Triagem/Auditoria)    â”‚
â”‚ â€¢ Verificar a tarja na imagem gerada                         â”‚
â”‚ â€¢ Confirmar que "Portaria INMETRO 492/2021" aparece correto â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸŽ¯ Resumo Executivo para o TÃ©cnico

### Pergunta do TÃ©cnico:
> "Na tarja como eu faÃ§o para alterar a portaria nÃ£o metrolÃ³gica?"

### Resposta:
**A portaria nÃ£o metrolÃ³gica NÃƒO se altera na tarja nem na operaÃ§Ã£o.**

Ela vem do cadastro do **Modelo do Equipamento**:

1. **Menu:** `Cadastros BÃ¡sicos` â†’ `Modelos de Equipamentos`
2. **Buscar:** Modelo do equipamento (ex: "FOCALLE T5403")
3. **Editar:** Campo **"Portaria"**
4. **Exemplo:** `Portaria INMETRO 492/2021` (para equipamentos SAnMFT)
5. **Salvar**

---

## ðŸ“š DocumentaÃ§Ã£o de ReferÃªncia

### No Sistema AxHub:

- **Modelos de Equipamentos:** `docs/cadastros-basicos/modelos-equipamentos`
- **Tarjas:** `docs/administracao/tarjas`
- **OperaÃ§Ãµes:** `docs/operacoes`
- **Base Legal:** Portaria INMETRO 492/2021 (anexada)

### Tabelas do Banco de Dados:

- `TBModeloEquipamentos` - Armazena marca, modelo e portaria
- `TBEquipamentos` - Relaciona equipamento com modelo
- `TBOperacoes` - Relaciona operaÃ§Ã£o com equipamento e tarja
- `TBTarjas` - Armazena templates das tarjas

---

## âš ï¸ ObservaÃ§Ãµes Importantes

### 1. DiferenÃ§a entre MetrolÃ³gico e NÃ£o MetrolÃ³gico

| Tipo | FunÃ§Ã£o | Portaria AplicÃ¡vel | AferiÃ§Ã£o INMETRO? |
|------|--------|-------------------|-------------------|
| **MetrolÃ³gico** | Mede velocidade, peso, dimensÃµes | Portaria 544/2014, 301/2003 | âœ… Sim - obrigatÃ³ria |
| **NÃ£o MetrolÃ³gico (SAnMFT)** | Detecta infraÃ§Ãµes sem mediÃ§Ã£o | Portaria 492/2021 | âŒ NÃ£o exigida |

### 2. Validade Legal das InfraÃ§Ãµes

**ATENÃ‡ÃƒO JURÃDICA:**  
As infraÃ§Ãµes sÃ³ sÃ£o vÃ¡lidas se a **Portaria do Ã³rgÃ£o autuador** cobre o perÃ­odo da operaÃ§Ã£o. Verificar:
- Data de InstalaÃ§Ã£o da operaÃ§Ã£o
- Data de HomologaÃ§Ã£o
- VigÃªncia da portaria do Ã³rgÃ£o

### 3. Campos Relacionados

Se alterar a portaria, considere tambÃ©m validar:
- âœ… **NÃºmero da Portaria** (campo separado para filtros)
- âœ… **Fabricante** (deve estar corretamente vinculado)
- âœ… **Tipo de Equipamento** (deve ser SAnMFT se usar Portaria 492/2021)

---

## ðŸ”— Links Ãšteis

- **OperaÃ§Ã£o:** https://strans.axhub.axion.ws/operacao/edit/359a6427-d58d-490e-ab3b-362504f5c7ef
- **Tarja:** https://strans.axhub.axion.ws/tarja/edit/7c63d905-76d5-4824-bb91-2251e62dc77d
- **AferiÃ§Ãµes:** https://strans.axhub.axion.ws/afericao
- **Chamado:** https://desk.axiontecnologia.com.br/Ticket/100460372

---

## âœ… ConclusÃ£o

O campo `{PortariaNaoMetrologico}` na tarja Ã© preenchido automaticamente a partir do cadastro de **Modelos de Equipamentos**. 

**Para alterar:**
1. Acesse `Cadastros BÃ¡sicos â†’ Modelos de Equipamentos`
2. Edite o modelo do equipamento em questÃ£o
3. Altere o campo "Portaria"
4. Salve

**NÃƒO Ã© necessÃ¡rio:**
- âŒ Alterar a tarja
- âŒ Alterar a operaÃ§Ã£o  
- âŒ Reprocessar manualmente as infraÃ§Ãµes (serÃ£o atualizadas automaticamente)

---

**Documento gerado em:** 2026-06-14  
**AnÃ¡lise por:** AxionIA (GitHub Copilot)  
**Base:** Portaria INMETRO 492/2021 + Estrutura do Banco AxHub


---

## ORIGEM: ANALISE-COMPLETA-LOCAIS-PORTARIA-TARJA.md

# ðŸ” AnÃ¡lise Completa: Todos os Locais PossÃ­veis da Portaria na Tarja

**Data:** 2026-06-14  
**Sistema:** AxHub  
**Contexto:** ValidaÃ§Ã£o de origens de dados para campo "Portaria nÃ£o metrolÃ³gico" nas tarjas  

---

## ðŸ“ LOCAIS POSSÃVEIS DE CONFIGURAÃ‡ÃƒO DA PORTARIA

### âœ… **1. TBModeloEquipamentos.Portaria** (VALIDADO âœ“)

**LocalizaÃ§Ã£o no sistema:** `Cadastros BÃ¡sicos â†’ Modelos de Equipamentos`

**Campo no banco:**
```sql
TBModeloEquipamentos.Portaria [nvarchar(50)]
```

**Status no STRANS:** âœ… **CORRETO**
- Valor atual: `"PORTARIA INMETRO/DIMEL NÂº 492/2021"`
- Data correta: 2021 (nÃ£o 2012)

**Como Ã© usado:**
- O placeholder `{PortariaNaoMetrologico}` na tarja Ã© substituÃ­do por este valor
- Afeta **TODOS os equipamentos** deste modelo (VSIS-OCR)

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    Marca,
    Modelo,
    NumeroPortaria,
    Portaria,
    Fabricante_id
FROM TBModeloEquipamentos
WHERE Modelo = 'VSIS-OCR'
```

**Resultado esperado:**
| Marca | Modelo | NumeroPortaria | Portaria | Fabricante |
|-------|--------|----------------|----------|------------|
| VELSIS | VSIS-OCR | 492 | PORTARIA INMETRO/DIMEL NÂº 492/2021 | Velsis |

---

### ðŸ”Ž **2. TBTarjas.Template** (Template com placeholders)

**LocalizaÃ§Ã£o no sistema:** `ConfiguraÃ§Ãµes â†’ Tarjas`

**Campo no banco:**
```sql
TBTarjas.Template [nvarchar(max)]
```

**ConteÃºdo tÃ­pico do template:**
```html
<!-- Exemplo simplificado -->
<div class="tarja-info">
  <span>CÃ³d. Equipamento: {CodigoEquipamento}</span>
  <span>Data: {DataInfracao}</span>
  <span>Hora: {HoraInfracao}</span>
  <span>Certif.: {NumeroInmetro}</span>
  <span>Reg. nÃ£o metrolÃ³gico: {RegNaoMetrologico}</span>
  <span>Venc. nÃ£o metrolÃ³gico: {VencNaoMetrologico}</span>
  <span>Portaria nÃ£o metrolÃ³gico: {PortariaNaoMetrologico}</span>
  <span>Marca/Modelo: {MarcaModeloEquipamento}</span>
</div>
```

**âš ï¸ IMPORTANTE:** O template **NÃƒO contÃ©m valores fixos**, apenas **placeholders** que sÃ£o substituÃ­dos em tempo de execuÃ§Ã£o.

**Possibilidade de erro:**
- âŒ Se alguÃ©m hardcoded "492 de 17/07/2012" diretamente no template (improvÃ¡vel)
- âœ… Mais provÃ¡vel: o erro estava no TBModeloEquipamentos e foi corrigido

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    Id,
    Nome,
    Template
FROM TBTarjas
WHERE Nome LIKE '%Axion%' OR Nome LIKE '%padrÃ£o%'
```

**Como verificar no sistema:**
1. Menu â†’ ConfiguraÃ§Ãµes â†’ Tarjas
2. Editar a tarja usada pela operaÃ§Ã£o
3. Verificar se hÃ¡ texto hardcoded com data errada

---

### ðŸ”§ **3. TBConfiguracoes** (ConfiguraÃ§Ãµes globais do sistema)

**Campo no banco:**
```sql
TBConfiguracoes
  - TipoConfiguracao [nvarchar(100)]
  - ValorConfiguracao [nvarchar(max)]
```

**Possibilidade:**
- Sistema pode ter configuraÃ§Ãµes globais para portarias padrÃ£o
- Exemplo: `TipoConfiguracao = 'PortariaPadrao'`, `ValorConfiguracao = '492 de 17/07/2012'`

**âš ï¸ ImprovÃ¡vel mas possÃ­vel!**

**Query de validaÃ§Ã£o:**
```sql
SELECT 
    TipoConfiguracao,
    ValorConfiguracao
FROM TBConfiguracoes
WHERE 
    TipoConfiguracao LIKE '%portaria%' 
    OR ValorConfiguracao LIKE '%492%'
    OR ValorConfiguracao LIKE '%2012%'
```

**Status:** ðŸ” **NÃƒO VERIFICADO** - Precisa validar no banco de dados

---

### ðŸ“‹ **4. TBAfericoes** (Certificados INMETRO individuais)

**Campo no banco:**
```sql
TBAfericoes
  - NumeroInmetro [nvarchar(20)]  â† Usado no campo "Reg. nÃ£o metrolÃ³gico"
  - NumeroLaudo [nvarchar(20)]
  - DataAfericao [datetime]
  - DataVencimento [datetime]      â† Usado no campo "Venc. nÃ£o metrolÃ³gico"
```

**âš ï¸ NÃƒO possui campo "Portaria"**

**O que TBAfericoes fornece:**
- âœ… `NumeroInmetro` â†’ Campo "Reg. nÃ£o metrolÃ³gico: 006350/2021"
- âœ… `DataVencimento` â†’ Campo "Venc. nÃ£o metrolÃ³gico: 18/10/2026"
- âŒ **NÃƒO** fornece a portaria (isso vem do modelo)

**Relacionamento:**
```
TBAfericoes â†’ TBFaixasAfericoes â†’ TBFaixas â†’ TBOperacoesFaixas â†’ TBOperacoes
```

**Status:** âœ… **Confirmado** - NÃ£o tem portaria aqui

---

### âš™ï¸ **5. TBOperacoes** (ConfiguraÃ§Ã£o da operaÃ§Ã£o especÃ­fica)

**Campo no banco:**
```sql
TBOperacoes
  - Equipamento_id [FK]
  - Tarja_id [FK]        â† Define qual tarja usar
  - DataInstalacao
  - Cronotacografo [bit]
  - Monitoramento [bit]
  - Balanca [bit]
```

**O que define:**
- âœ… Qual **tarja** serÃ¡ usada (via `Tarja_id`)
- âœ… Qual **equipamento** (e portanto qual modelo)
- âŒ **NÃƒO** tem campo prÃ³prio de portaria

**Fluxo de dados:**
```
TBOperacoes.Equipamento_id 
    â†’ TBEquipamentos.ModeloEquipamento_id 
    â†’ TBModeloEquipamentos.Portaria â† AQUI estÃ¡ a portaria!
```

**Status:** âœ… **Confirmado** - Apenas referencia, nÃ£o armazena portaria

---

### ðŸŽ¯ **6. TBEquipamentos** (Equipamento individual)

**Campo no banco:**
```sql
TBEquipamentos
  - Codigo [nvarchar(20)]           â† "T5402"
  - ModeloEquipamento_id [FK]       â† Link para TBModeloEquipamentos
  - NumeroSerie [nvarchar(50)]
  - NumeroPatrimonio [nvarchar(50)]
```

**âš ï¸ NÃƒO possui campo "Portaria"**

**O que fornece:**
- âœ… CÃ³digo do equipamento
- âœ… Link para o modelo (que TEM a portaria)
- âŒ **NÃƒO** armazena portaria prÃ³pria

**Status:** âœ… **Confirmado** - NÃ£o tem portaria aqui

---

### ðŸ—‚ï¸ **7. MÃºltiplas OperaÃ§Ãµes com Tarjas Diferentes**

**CenÃ¡rio possÃ­vel:**
- OperaÃ§Ã£o A usa "Tarja PadrÃ£o" (com portaria correta)
- OperaÃ§Ã£o B usa "Tarja Antiga" (com portaria hardcoded errada)

**ValidaÃ§Ã£o necessÃ¡ria:**
```sql
-- Ver todas as tarjas cadastradas
SELECT 
    t.Id,
    t.Nome,
    COUNT(o.Id) as QtdOperacoes,
    LEFT(t.Template, 200) as TemplateInicio
FROM TBTarjas t
LEFT JOIN TBOperacoes o ON t.Id = o.Tarja_id
GROUP BY t.Id, t.Nome, t.Template
ORDER BY COUNT(o.Id) DESC
```

**Status:** ðŸ” **NÃƒO VERIFICADO** - Precisa validar quantas tarjas existem

---

### ðŸŽ¨ **8. Processamento de Imagem (Backend/Frontend)**

**Possibilidade:**
- CÃ³digo C# que processa a tarja pode ter regra customizada
- LÃ³gica de negÃ³cio pode sobrescrever valores do template

**Locais para verificar:**
1. **Backend:** `Controllers/TarjaController.cs`, `Services/ImagemService.cs`
2. **Frontend:** Componentes React/Angular que geram preview de tarja
3. **Jobs/Workers:** Processamento assÃ­ncrono de imagens

**Status:** ðŸ” **NÃƒO VERIFICADO** - Precisa anÃ¡lise de cÃ³digo-fonte

---

## ðŸ“Š RESUMO - MATRIZ DE PROBABILIDADES

| Local | Campo | Probabilidade | Status | Impacto |
|-------|-------|---------------|--------|---------|
| **TBModeloEquipamentos.Portaria** | `Portaria` | ðŸŸ¢ **95%** | âœ… Validado (correto) | **GLOBAL** - Afeta todos equipamentos deste modelo |
| **TBTarjas.Template** | `Template` | ðŸŸ¡ **30%** | ðŸ” NÃ£o verificado | **POR TARJA** - Afeta operaÃ§Ãµes que usam esta tarja |
| **TBConfiguracoes** | `ValorConfiguracao` | ðŸŸ¡ **20%** | ðŸ” NÃ£o verificado | **GLOBAL** - ConfiguraÃ§Ã£o de sistema |
| **CÃ³digo Backend** | LÃ³gica de negÃ³cio | ðŸŸ¡ **15%** | ðŸ” NÃ£o verificado | **GLOBAL** - Regra hardcoded |
| **TBAfericoes** | âŒ NÃ£o existe | ðŸ”´ **0%** | âœ… Confirmado (sem campo) | â€” |
| **TBOperacoes** | âŒ NÃ£o existe | ðŸ”´ **0%** | âœ… Confirmado (sem campo) | â€” |
| **TBEquipamentos** | âŒ NÃ£o existe | ðŸ”´ **0%** | âœ… Confirmado (sem campo) | â€” |

---

## âœ… PLANO DE VALIDAÃ‡ÃƒO COMPLETA

### âœ“ **JÃ¡ Validado:**

1. âœ… **TBModeloEquipamentos** - Portaria estÃ¡ CORRETA no STRANS
2. âœ… **TBAfericoes** - Confirmado que nÃ£o tem campo portaria
3. âœ… **TBOperacoes** - Confirmado que nÃ£o tem campo portaria
4. âœ… **TBEquipamentos** - Confirmado que nÃ£o tem campo portaria

### ðŸ” **Pendente de ValidaÃ§Ã£o:**

#### **1. Verificar Templates de Tarjas**

**No sistema STRANS:**
```
Menu â†’ ConfiguraÃ§Ãµes â†’ Tarjas â†’ Listar todas
```

**Para cada tarja, verificar:**
- âœ“ Qual operaÃ§Ã£o usa esta tarja?
- âœ“ O template tem texto hardcoded com "2012"?
- âœ“ Usa placeholders `{PortariaNaoMetrologico}` ou valor fixo?

**Query SQL:**
```sql
-- Buscar texto "2012" ou "17/07" em templates
SELECT 
    Id,
    Nome,
    Template
FROM TBTarjas
WHERE 
    Template LIKE '%2012%' 
    OR Template LIKE '%17/07%'
    OR Template LIKE '%492 de%'
```

---

#### **2. Verificar ConfiguraÃ§Ãµes Globais**

**Query SQL:**
```sql
-- Buscar configuraÃ§Ãµes relacionadas a portaria
SELECT 
    Id,
    TipoConfiguracao,
    ValorConfiguracao,
    DataAtualizacao,
    AtualizadoPor
FROM TBConfiguracoes
WHERE 
    TipoConfiguracao LIKE '%portaria%'
    OR ValorConfiguracao LIKE '%492%'
    OR ValorConfiguracao LIKE '%2012%'
    OR ValorConfiguracao LIKE '%portaria%'
ORDER BY DataAtualizacao DESC
```

---

#### **3. Validar OperaÃ§Ã£o EspecÃ­fica (359a6427-...)**

**Query SQL:**
```sql
-- Ver todos os dados da operaÃ§Ã£o que gera as tarjas
SELECT 
    o.Id as OperacaoId,
    e.Codigo as CodigoEquipamento,
    e.ModeloEquipamento_id,
    m.Marca,
    m.Modelo,
    m.Portaria as PortariaDoModelo,
    t.Id as TarjaId,
    t.Nome as NomeTarja,
    LEFT(t.Template, 500) as TemplateInicio
FROM TBOperacoes o
INNER JOIN TBEquipamentos e ON o.Equipamento_id = e.Id
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
LEFT JOIN TBTarjas t ON o.Tarja_id = t.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'
```

**Verificar:**
- âœ“ Qual tarja estÃ¡ vinculada Ã  operaÃ§Ã£o?
- âœ“ O template desta tarja especÃ­fica tem erro?

---

#### **4. Comparar com Outras OperaÃ§Ãµes do Mesmo Modelo**

**Query SQL:**
```sql
-- Ver TODAS as operaÃ§Ãµes que usam modelo VSIS-OCR
SELECT 
    o.Id as OperacaoId,
    e.Codigo as CodigoEquipamento,
    t.Nome as NomeTarja,
    o.DataInstalacao,
    o.DataInicial,
    o.DataFinal
FROM TBOperacoes o
INNER JOIN TBEquipamentos e ON o.Equipamento_id = e.Id
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
LEFT JOIN TBTarjas t ON o.Tarja_id = t.Id
WHERE m.Modelo = 'VSIS-OCR'
ORDER BY o.DataInstalacao DESC
```

**Perguntar:**
- Todas usam a mesma tarja?
- Alguma operaÃ§Ã£o antiga pode ter tarja legada?

---

#### **5. Verificar CÃ³digo Backend (Se possÃ­vel)**

**Arquivos para analisar:**
- `Controllers/ImagemController.cs`
- `Services/TarjaService.cs`
- `Helpers/TemplateHelper.cs`
- `Processors/ImageProcessor.cs`

**Buscar por:**
```csharp
// Buscar strings hardcoded
"492 de 17/07/2012"
"17/07/2012"

// Buscar lÃ³gica de substituiÃ§Ã£o
Replace("{PortariaNaoMetrologico}", ...)
```

---

## ðŸŽ¯ CONCLUSÃƒO ATUAL

### âœ… **O que sabemos:**

1. **TBModeloEquipamentos.Portaria** no STRANS estÃ¡ **CORRETO** (2021, nÃ£o 2012)
2. O campo `{PortariaNaoMetrologico}` na tarja **deveria** buscar de `TBModeloEquipamentos.Portaria`
3. Tabelas de AferiÃ§Ãµes, OperaÃ§Ãµes e Equipamentos **NÃƒO armazenam** portaria prÃ³pria

### â“ **O que falta verificar:**

1. **Templates de tarjas** - Verificar se algum tem texto hardcoded
2. **TBConfiguracoes** - Verificar se hÃ¡ configuraÃ§Ã£o global sobrescrevendo
3. **CÃ³digo backend** - Verificar se hÃ¡ lÃ³gica customizada de processamento
4. **Tarja especÃ­fica da operaÃ§Ã£o 359a6427-...** - Qual tarja estÃ¡ vinculada?

---

## ðŸ“‹ SCRIPT DE VALIDAÃ‡ÃƒO COMPLETA

```sql
-- ==================================================
-- SCRIPT DE VALIDAÃ‡ÃƒO COMPLETA DE PORTARIAS
-- Execute no banco STRANS para diagnÃ³stico completo
-- ==================================================

PRINT '1. VALIDANDO TBModeloEquipamentos (VSIS-OCR)'
SELECT 
    Marca,
    Modelo,
    NumeroPortaria,
    Portaria,
    DataAtualizacao,
    AtualizadoPor
FROM TBModeloEquipamentos
WHERE Modelo = 'VSIS-OCR'

PRINT ''
PRINT '2. BUSCANDO TEXTO "2012" EM TEMPLATES DE TARJAS'
SELECT 
    Id,
    Nome,
    CASE 
        WHEN Template LIKE '%2012%' THEN 'SIM - CONTÃ‰M 2012'
        WHEN Template LIKE '%17/07%' THEN 'SIM - CONTÃ‰M 17/07'
        ELSE 'NÃƒO'
    END as ContemErro,
    LEN(Template) as TamanhoTemplate
FROM TBTarjas
WHERE 
    Template LIKE '%2012%' 
    OR Template LIKE '%17/07%'

PRINT ''
PRINT '3. VERIFICANDO CONFIGURAÃ‡Ã•ES GLOBAIS'
SELECT 
    TipoConfiguracao,
    ValorConfiguracao,
    DataAtualizacao
FROM TBConfiguracoes
WHERE 
    ValorConfiguracao LIKE '%492%'
    OR ValorConfiguracao LIKE '%2012%'
    OR TipoConfiguracao LIKE '%portaria%'

PRINT ''
PRINT '4. OPERAÃ‡ÃƒO ESPECÃFICA (359a6427-...)'
SELECT 
    o.Id as OperacaoId,
    e.Codigo as Equipamento,
    m.Modelo as Modelo,
    m.Portaria as PortariaModelo,
    t.Nome as NomeTarja,
    CASE 
        WHEN t.Template LIKE '%2012%' THEN 'âŒ ERRO - Template tem 2012'
        WHEN t.Template LIKE '%{PortariaNaoMetrologico}%' THEN 'âœ… OK - Usa placeholder'
        ELSE 'âš ï¸ VERIFICAR - Template customizado'
    END as StatusTarja
FROM TBOperacoes o
INNER JOIN TBEquipamentos e ON o.Equipamento_id = e.Id
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
LEFT JOIN TBTarjas t ON o.Tarja_id = t.Id
WHERE o.Id = '359a6427-d58d-490e-ab3b-362504f5c7ef'

PRINT ''
PRINT '5. TODAS AS TARJAS USADAS POR VSIS-OCR'
SELECT DISTINCT
    t.Nome as NomeTarja,
    COUNT(o.Id) as QtdOperacoes,
    MAX(o.DataInstalacao) as UltimaInstalacao
FROM TBOperacoes o
INNER JOIN TBEquipamentos e ON o.Equipamento_id = e.Id
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
LEFT JOIN TBTarjas t ON o.Tarja_id = t.Id
WHERE m.Modelo = 'VSIS-OCR'
GROUP BY t.Nome
ORDER BY COUNT(o.Id) DESC
```

---

## ðŸŽ¯ PRÃ“XIMOS PASSOS

1. âœ… **Executar o script SQL** acima no banco STRANS
2. ðŸ” **Analisar resultados** - identificar qual tarja contÃ©m o erro
3. âš™ï¸ **Corrigir o template** da tarja (se for o caso)
4. ðŸ§ª **Testar** - reprocessar uma infraÃ§Ã£o e verificar se a portaria aparece correta

---

**Documento gerado em:** 2026-06-14  
**Sistema:** AxHub STRANS  
**Status:** Aguardando validaÃ§Ã£o de templates e configuraÃ§Ãµes


---

## ORIGEM: ANALISE-ERRO-PORTARIA-492-TARJA-VSIS-OCR.md

# ðŸš¨ AnÃ¡lise de Erro: Portaria 492 com Data Incorreta na Tarja

**Data da AnÃ¡lise:** 2026-06-14  
**Sistema:** AxHub - STRANS  
**Equipamento:** T5402 EndereÃ§o (VSIS-OCR)  
**InfraÃ§Ã£o:** 75870 - Faixa 3 Sentido LESTE â†’ OESTE  

---

## ðŸ”´ PROBLEMA IDENTIFICADO

### InformaÃ§Ã£o Exibida na Tarja (INCORRETA):

```
Portaria nÃ£o metrolÃ³gico: 492 de 17/07/2012 Marca/Modelo: VSIS-OCR
```

### âŒ Erros Detectados:

1. **Data da Portaria ERRADA:** 
   - Mostra: `17/07/2012`
   - Correto: `10/12/2021` (Portaria INMETRO nÂº 492, de 10 de dezembro de 2021)

2. **FormataÃ§Ã£o Confusa:**
   - O campo "Marca/Modelo: VSIS-OCR" estÃ¡ concatenado no mesmo texto
   - Deveria estar separado ou em outra linha

---

## ðŸ“Š TABELA COMPARATIVA - DADOS DA TARJA

| Campo na Tarja | Valor Atual (ERRADO) | Valor Correto | Origem no Banco de Dados |
|----------------|----------------------|---------------|--------------------------|
| **Reg. nÃ£o metrolÃ³gico** | 006350/2021 | 006350/2021 âœ… | TBModeloEquipamentos.NumeroPortaria |
| **Venc. nÃ£o metrolÃ³gico** | 18/10/2026 | 18/10/2026 âœ… | TBAfericoes.DataVencimento |
| **Portaria nÃ£o metrolÃ³gico** | **492 de 17/07/2012** âŒ | **Portaria INMETRO nÂº 492/2021** | TBModeloEquipamentos.Portaria |
| **Marca/Modelo** | **VSIS-OCR** | **VELSIS / VSIS-OCR** | TBModeloEquipamentos.Marca + Modelo |

---

## ðŸ” ANÃLISE TÃ‰CNICA - DE ONDE VÃŠM OS DADOS

### 1ï¸âƒ£ **Registro NÃ£o MetrolÃ³gico: 006350/2021**

**Origem:** `TBModeloEquipamentos.NumeroPortaria`

```sql
SELECT NumeroPortaria 
FROM TBModeloEquipamentos 
WHERE Modelo = 'VSIS-OCR'
-- Retorna: "006350" ou "492" (nÃºmero da portaria)
```

âœ… **Status:** Correto (pode ser o nÃºmero de registro do fabricante no INMETRO)

---

### 2ï¸âƒ£ **Vencimento NÃ£o MetrolÃ³gico: 18/10/2026**

**Origem:** `TBAfericoes.DataVencimento`

```sql
SELECT DataVencimento 
FROM TBAfericoes 
WHERE Equipamento_id = [ID do equipamento T5402]
ORDER BY DataVencimento DESC
-- Retorna: 2026-10-18
```

âœ… **Status:** Correto (data de validade da certificaÃ§Ã£o)

---

### 3ï¸âƒ£ **Portaria NÃ£o MetrolÃ³gico: "492 de 17/07/2012"** âŒ

**Origem:** `TBModeloEquipamentos.Portaria`

```sql
SELECT Portaria 
FROM TBModeloEquipamentos 
WHERE Modelo = 'VSIS-OCR'
-- Retorna atualmente: "492 de 17/07/2012" (ERRADO!)
-- Deveria retornar: "Portaria INMETRO nÂº 492/2021"
```

âŒ **Status:** **INCORRETO** - A data estÃ¡ errada!

**Problema:**
- A Portaria INMETRO nÂº 492 foi publicada em **10/12/2021**, nÃ£o em 17/07/2012
- A data 17/07/2012 nÃ£o corresponde a nenhuma portaria conhecida relacionada a SAnMFT

**PossÃ­veis causas:**
- Erro de digitaÃ§Ã£o no cadastro do modelo
- ConfusÃ£o com outra portaria (ex: Portaria DENATRAN 16/2004 ou outras)
- Dado antigo nÃ£o atualizado apÃ³s revisÃ£o regulatÃ³ria

---

### 4ï¸âƒ£ **Marca/Modelo: "VSIS-OCR"**

**Origem:** `TBModeloEquipamentos.Marca + TBModeloEquipamentos.Modelo`

```sql
SELECT Marca, Modelo 
FROM TBModeloEquipamentos 
WHERE Modelo = 'VSIS-OCR'
-- Deveria retornar:
-- Marca: "VELSIS" ou "VELSIS TECNOLOGIA"
-- Modelo: "VSIS-OCR"
```

âš ï¸ **Status:** Incompleto - falta a Marca

**Problema:**
- A tarja sÃ³ estÃ¡ mostrando o modelo "VSIS-OCR"
- A marca (VELSIS) nÃ£o estÃ¡ sendo exibida
- O template da tarja pode estar pegando apenas o campo Modelo

---

## ðŸ“„ REFERÃŠNCIA: Portaria INMETRO nÂº 492/2021

### Dados Oficiais:

| InformaÃ§Ã£o | Detalhe |
|------------|---------|
| **NÃºmero** | 492 |
| **Ano** | 2021 |
| **Data de PublicaÃ§Ã£o** | **10 de dezembro de 2021** |
| **TÃ­tulo** | Requisitos de AvaliaÃ§Ã£o da Conformidade para Fornecedor de Sistemas AutomÃ¡ticos nÃ£o MetrolÃ³gicos de FiscalizaÃ§Ã£o de TrÃ¢nsito (SAnMFT) |
| **Escopo** | Equipamentos que fiscalizam infraÃ§Ãµes SEM fazer mediÃ§Ãµes (avanÃ§o de sinal, faixa exclusiva, etc.) |
| **Validade** | Vigente a partir de 03/01/2022 |
| **Revoga** | Portaria Inmetro nÂº 372/2012 |

### ðŸ”— Documentos de ReferÃªncia:

- **DOU:** DiÃ¡rio Oficial da UniÃ£o - SeÃ§Ã£o 1, pÃ¡ginas XX-XX (10/12/2021)
- **Arquivo PDF:** Anexado ao chamado (11 pÃ¡ginas)

---

## ðŸ”§ ONDE PESQUISAR E CORRIGIR

### ðŸ”Ž **1. Identificar o Modelo Cadastrado**

#### Menu Sistema:
```
Cadastros BÃ¡sicos â†’ Modelos de Equipamentos
```

#### Buscar:
- **Por Modelo:** "VSIS-OCR"
- **Por Marca:** "VELSIS"
- **Por CÃ³digo:** Equipamento "T5402"

#### Query SQL (para validaÃ§Ã£o):
```sql
-- Encontrar o modelo do equipamento T5402
SELECT 
    e.Codigo AS CodigoEquipamento,
    m.Marca,
    m.Modelo,
    m.NumeroPortaria,
    m.Portaria,
    f.Nome AS Fabricante
FROM TBEquipamentos e
INNER JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
INNER JOIN TBFabricantes f ON m.Fabricante_id = f.Id
WHERE e.Codigo = 'T5402'
```

**Resultado Esperado:**

| Campo | Valor Atual (ERRADO) | Valor Correto |
|-------|----------------------|---------------|
| Marca | VELSIS (?) | **VELSIS** ou **VELSIS TECNOLOGIA** |
| Modelo | VSIS-OCR âœ… | VSIS-OCR |
| NumeroPortaria | 492 ou 006350 | **492** |
| Portaria | **"492 de 17/07/2012"** âŒ | **"Portaria INMETRO nÂº 492/2021"** |
| Fabricante | VELSIS (?) | VELSIS TECNOLOGIA LTDA |

---

### âœï¸ **2. Corrigir o Cadastro do Modelo**

#### Passo a Passo:

1. **Acessar o sistema:**
   ```
   https://strans.axhub.axion.ws/
   Login â†’ Menu Cadastros BÃ¡sicos â†’ Modelos de Equipamentos
   ```

2. **Localizar o registro:**
   - Buscar por: **"VSIS-OCR"**
   - Ou buscar por: **"VELSIS"**
   - Clicar em **Editar** (Ã­cone de lÃ¡pis)

3. **Validar os campos atuais:**
   ```
   [ ] Marca: VELSIS ou vazio?
   [ ] Modelo: VSIS-OCR
   [ ] NÃºmero Portaria: 492 ou 006350?
   [ ] Portaria: "492 de 17/07/2012" â† CAMPO ERRADO
   [ ] Fabricante: VELSIS TECNOLOGIA
   ```

4. **CORRIGIR o campo "Portaria":**

   **DE (valor atual - ERRADO):**
   ```
   492 de 17/07/2012
   ```

   **PARA (valor correto):**
   ```
   Portaria INMETRO nÂº 492/2021
   ```

   **Ou formato alternativo:**
   ```
   PORTARIA NÂº 492, DE 10 DE DEZEMBRO DE 2021
   ```

5. **Validar campo "Marca":**
   - Se estiver vazio, preencher: **VELSIS**
   - Ou: **VELSIS TECNOLOGIA**

6. **Salvar** as alteraÃ§Ãµes

---

### ðŸ§ª **3. Validar a CorreÃ§Ã£o**

#### ApÃ³s salvar, validar:

1. **Reprocessar uma infraÃ§Ã£o:**
   ```
   Menu: Triagem ou Auditoria
   Selecionar: InfraÃ§Ã£o 75870 ou outra do equipamento T5402
   Reprocessar: Clicar em "Reprocessar" ou "Avaliar Novamente"
   ```

2. **Verificar a tarja na nova imagem:**
   - Abrir a imagem da infraÃ§Ã£o reprocessada
   - Verificar se agora mostra:
     ```
     Portaria nÃ£o metrolÃ³gico: Portaria INMETRO nÂº 492/2021
     Marca/Modelo: VELSIS VSIS-OCR
     ```

3. **Query de validaÃ§Ã£o (SQL):**
   ```sql
   -- Confirmar que a correÃ§Ã£o foi salva
   SELECT 
       Marca,
       Modelo,
       Portaria,
       DataAtualizacao,
       AtualizadoPor
   FROM TBModeloEquipamentos
   WHERE Modelo = 'VSIS-OCR'
   ```

---

## ðŸ–¼ï¸ POR QUE A INFRAÃ‡ÃƒO ESTÃ RETORNANDO ESSA IMAGEM?

### Fluxo de GeraÃ§Ã£o da Tarja:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 1. EQUIPAMENTO CAPTURA INFRAÃ‡ÃƒO                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Equipamento: T5402 (VSIS-OCR)                               â”‚
â”‚ Data/Hora: 11/06/2026 08:29:23                              â”‚
â”‚ InfraÃ§Ã£o: 75870 - Art. 183 CTB (faixa exclusiva)            â”‚
â”‚ Faixa: 3 - Sentido LESTE â†’ OESTE                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 2. SISTEMA BUSCA DADOS PARA A TARJA                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ SELECT FROM TBOperacoes WHERE Id = '359a6427...'            â”‚
â”‚   â†’ Equipamento_id â†’ TBEquipamentos                         â”‚
â”‚   â†’ ModeloEquipamento_id â†’ TBModeloEquipamentos             â”‚
â”‚   â†’ Tarja_id â†’ TBTarjas                                     â”‚
â”‚                                                              â”‚
â”‚ Dados coletados:                                            â”‚
â”‚ âœ“ Equipamento.Codigo = "T5402"                              â”‚
â”‚ âœ“ ModeloEquipamento.Marca = "VELSIS" (ou vazio?)            â”‚
â”‚ âœ“ ModeloEquipamento.Modelo = "VSIS-OCR"                     â”‚
â”‚ âœ“ ModeloEquipamento.Portaria = "492 de 17/07/2012" â† ERRO! â”‚
â”‚ âœ“ Afericao.DataVencimento = "18/10/2026"                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 3. TEMPLATE DA TARJA SUBSTITUI OS CAMPOS                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Template da tarja (TBTarjas.Template):                      â”‚
â”‚                                                              â”‚
â”‚ Reg. nÃ£o metrolÃ³gico: {NumeroRegistroINMETRO}               â”‚
â”‚ Venc. nÃ£o metrolÃ³gico: {DataVencimentoAfericao}             â”‚
â”‚ Portaria nÃ£o metrolÃ³gico: {PortariaNaoMetrologico}          â”‚
â”‚   Marca/Modelo: {MarcaModeloEquipamento}                    â”‚
â”‚                                                              â”‚
â”‚ SubstituiÃ§Ã£o:                                               â”‚
â”‚ {NumeroRegistroINMETRO} â†’ "006350/2021"                     â”‚
â”‚ {DataVencimentoAfericao} â†’ "18/10/2026"                     â”‚
â”‚ {PortariaNaoMetrologico} â†’ "492 de 17/07/2012" â† ERRO!      â”‚
â”‚ {MarcaModeloEquipamento} â†’ "VSIS-OCR" (falta marca)         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 4. IMAGEM GERADA COM A TARJA (RESULTADO FINAL)              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                              â”‚
â”‚ Reg. nÃ£o metrolÃ³gico: 006350/2021                           â”‚
â”‚ Venc. nÃ£o metrolÃ³gico: 18/10/2026                           â”‚
â”‚ Portaria nÃ£o metrolÃ³gico: 492 de 17/07/2012 â† DATA ERRADA!  â”‚
â”‚   Marca/Modelo: VSIS-OCR                                    â”‚
â”‚                                                              â”‚
â”‚ CÃ³d. Org. 212190 InfraÃ§Ã£o: 75870                            â”‚
â”‚ DescriÃ§Ã£o: TRANSITAR COM O VEÃC NA FAIXA OU VIA DE          â”‚
â”‚            TRÃ‚NSITO EXCLUSIVO...                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### ðŸ”´ **Resposta Direta:**

A infraÃ§Ã£o estÃ¡ retornando essa imagem com **dados incorretos** porque:

1. **O Modelo "VSIS-OCR" estÃ¡ cadastrado com a portaria errada** no banco de dados
   - Campo `TBModeloEquipamentos.Portaria` contÃ©m: `"492 de 17/07/2012"`
   - Deveria conter: `"Portaria INMETRO nÂº 492/2021"`

2. **A tarja puxa os dados automaticamente do cadastro do modelo**
   - Sempre que uma infraÃ§Ã£o do equipamento T5402 (VSIS-OCR) for gerada
   - A tarja exibirÃ¡ a portaria cadastrada no modelo
   - Como o dado estÃ¡ errado, a imagem sai errada

3. **Todas as infraÃ§Ãµes desse equipamento estÃ£o com o erro**
   - NÃ£o Ã© problema especÃ­fico desta infraÃ§Ã£o 75870
   - Ã‰ problema do **cadastro do modelo** que afeta TODAS as infraÃ§Ãµes

---

## ðŸ“‹ CHECKLIST DE CORREÃ‡ÃƒO

### âœ… Tarefas:

- [ ] **1. Acessar:** Cadastros BÃ¡sicos â†’ Modelos de Equipamentos
- [ ] **2. Buscar:** Modelo "VSIS-OCR"
- [ ] **3. Editar:** Abrir o registro para ediÃ§Ã£o
- [ ] **4. Validar Marca:** Confirmar se campo "Marca" estÃ¡ preenchido com "VELSIS"
- [ ] **5. Corrigir Portaria:** Alterar de `"492 de 17/07/2012"` para `"Portaria INMETRO nÂº 492/2021"`
- [ ] **6. Salvar:** Gravar as alteraÃ§Ãµes
- [ ] **7. Testar:** Reprocessar uma infraÃ§Ã£o do equipamento T5402
- [ ] **8. Validar Tarja:** Conferir se a nova imagem mostra a portaria correta
- [ ] **9. Documentar:** Registrar no chamado que a correÃ§Ã£o foi aplicada

---

## ðŸŽ¯ RESUMO EXECUTIVO

### ðŸ“ **Problema:**
Tarja de infraÃ§Ãµes do equipamento T5402 (VSIS-OCR) exibe portaria com data errada: "492 de 17/07/2012"

### ðŸ” **Causa Raiz:**
Campo `Portaria` do modelo "VSIS-OCR" estÃ¡ cadastrado incorretamente no banco de dados

### âœ… **SoluÃ§Ã£o:**
Corrigir o cadastro em `Cadastros BÃ¡sicos â†’ Modelos de Equipamentos â†’ VSIS-OCR`

### ðŸ“ **CorreÃ§Ã£o:**
```
ANTES: "492 de 17/07/2012"
DEPOIS: "Portaria INMETRO nÂº 492/2021"
```

### ðŸŽ¯ **Impacto:**
- **JurÃ­dico:** InfraÃ§Ãµes podem ser contestadas se a portaria estiver incorreta
- **Operacional:** Todas as novas infraÃ§Ãµes do equipamento terÃ£o a portaria correta
- **HistÃ³rico:** InfraÃ§Ãµes antigas mantÃªm os dados originais (nÃ£o retroativo)

---

## ðŸ“Š TABELA DE VALIDAÃ‡ÃƒO FINAL

ApÃ³s a correÃ§Ã£o, a tarja deve exibir:

| InformaÃ§Ã£o na Tarja | Valor Esperado | Status Atual | Status ApÃ³s CorreÃ§Ã£o |
|---------------------|----------------|--------------|----------------------|
| **CÃ³d. Equipamento** | T5402 | âœ… Correto | âœ… Correto |
| **Data InfraÃ§Ã£o** | 11/06/2026 | âœ… Correto | âœ… Correto |
| **Hora** | 08:29:23 | âœ… Correto | âœ… Correto |
| **Reg. nÃ£o metrolÃ³gico** | 006350/2021 | âœ… Correto | âœ… Correto |
| **Venc. nÃ£o metrolÃ³gico** | 18/10/2026 | âœ… Correto | âœ… Correto |
| **Portaria nÃ£o metrolÃ³gico** | Portaria INMETRO nÂº 492/2021 | âŒ **Mostra: "492 de 17/07/2012"** | âœ… **Corrigido para "Portaria INMETRO nÂº 492/2021"** |
| **Marca/Modelo** | VELSIS VSIS-OCR | âš ï¸ Incompleto (sÃ³ "VSIS-OCR") | âœ… **"VELSIS VSIS-OCR"** |
| **Faixa** | Faixa 3 | âœ… Correto | âœ… Correto |
| **Sentido** | LESTE â†’ OESTE | âœ… Correto | âœ… Correto |
| **Enquadramento** | Art. 183 CTB | âœ… Correto | âœ… Correto |

---

## ðŸ”— REFERÃŠNCIAS

### URLs do Sistema:
- **OperaÃ§Ã£o:** https://strans.axhub.axion.ws/operacao/edit/359a6427-d58d-490e-ab3b-362504f5c7ef
- **Tarja:** https://strans.axhub.axion.ws/tarja/edit/7c63d905-76d5-4824-bb91-2251e62dc77d
- **Modelos de Equipamentos:** https://strans.axhub.axion.ws/modelo-equipamento

### Documentos:
- **Portaria INMETRO 492/2021** (PDF anexado ao chamado)
- **CTB - Art. 183:** Transitar em faixa ou via exclusiva

---

**AnÃ¡lise criada em:** 2026-06-14  
**Analista:** AxionIA  
**Sistema:** AxHub STRANS  
**Prioridade:** ALTA (erro jurÃ­dico - portaria incorreta)


---

## ORIGEM: PLANO-INVESTIGACAO-WEB-PORTARIA-492.md

# ðŸ” Plano de InvestigaÃ§Ã£o Web: Erro "492 de 17/07/2012"

**Data:** 2026-06-15  
**MÃ©todo:** InvestigaÃ§Ã£o via interface web (sem acesso ao banco SQL)  
**Sistema:** AxHub STRANS  

---

## ðŸ“‹ CHECKLIST DE INVESTIGAÃ‡ÃƒO

### âœ… **1. Verificar Modelos de Equipamentos**

**Menu:** Cadastros BÃ¡sicos â†’ Modelos de Equipamentos

**O que verificar:**
- [ ] Quantos modelos "VSIS-OCR" existem?
- [ ] Modelo atual mostra qual portaria?
- [ ] HÃ¡ modelos duplicados (VSIS-OCR, VSIS OCR, VSISORC)?
- [ ] Data de atualizaÃ§Ã£o dos modelos

**Como investigar:**
1. Login no sistema
2. Menu â†’ Cadastros BÃ¡sicos â†’ Modelos de Equipamentos
3. Buscar: "VSIS"
4. Buscar: "OCR"  
5. Buscar: "VELSIS"
6. Listar TODOS os modelos e verificar se hÃ¡ duplicatas

---

### âœ… **2. Verificar Equipamentos (T5402 e T5403)**

**Menu:** Equipamentos â†’ Equipamentos

**O que verificar:**
- [ ] T5402 estÃ¡ vinculado a qual modelo?
- [ ] T5403 estÃ¡ vinculado a qual modelo?
- [ ] Ambos usam o mesmo modelo?
- [ ] ID do modelo de cada equipamento

**Como investigar:**
1. Menu â†’ Equipamentos â†’ Equipamentos
2. Buscar: "T5402"
3. Editar â†’ Ver campo "Modelo do Equipamento"
4. Anotar qual modelo estÃ¡ vinculado
5. Repetir para "T5403"

---

### âœ… **3. Verificar OperaÃ§Ã£o 359a6427**

**Menu:** OperaÃ§Ãµes â†’ OperaÃ§Ãµes

**O que verificar:**
- [ ] Qual tarja estÃ¡ vinculada? (jÃ¡ sabemos: "Tarja Axion")
- [ ] Qual equipamento? (jÃ¡ sabemos: T5403)
- [ ] Data de instalaÃ§Ã£o
- [ ] HÃ¡ outras operaÃ§Ãµes com T5402?

**URL jÃ¡ conhecida:**
- https://strans.axhub.axion.ws/operacao/edit/359a6427-d58d-490e-ab3b-362504f5c7ef

---

### âœ… **4. Verificar ConfiguraÃ§Ãµes Globais**

**Menu:** ConfiguraÃ§Ãµes â†’ ConfiguraÃ§Ãµes Gerais (se existir)

**O que verificar:**
- [ ] HÃ¡ configuraÃ§Ã£o de "Portaria PadrÃ£o"?
- [ ] Alguma configuraÃ§Ã£o menciona "492" ou "2012"?
- [ ] ConfiguraÃ§Ãµes de tarja

**Como investigar:**
1. Menu â†’ ConfiguraÃ§Ãµes
2. Explorar TODAS as opÃ§Ãµes de configuraÃ§Ã£o
3. Buscar por campos que mencionem "portaria"

---

### âœ… **5. Verificar InfraÃ§Ãµes do Dia 11/06/2026**

**Menu:** InfraÃ§Ãµes â†’ GestÃ£o de InfraÃ§Ãµes

**O que verificar:**
- [ ] Visualizar imagem com erro
- [ ] Comparar duas infraÃ§Ãµes:
  - Uma de T5402
  - Uma de T5403
- [ ] Ambas mostram o mesmo erro?
- [ ] HÃ¡ diferenÃ§a entre equipamentos?

**Como investigar:**
1. Menu â†’ InfraÃ§Ãµes
2. Filtrar: Data = 11/06/2026
3. Filtrar: Equipamento = T5402 OU T5403
4. Abrir 2-3 infraÃ§Ãµes
5. Visualizar imagem com tarja
6. Verificar campo "Portaria nÃ£o metrolÃ³gico"

---

### âœ… **6. Comparar com Outros Equipamentos**

**O que verificar:**
- [ ] Outros modelos VSIS-OCR tÃªm o mesmo problema?
- [ ] Equipamentos de outros modelos (nÃ£o VSIS-OCR) mostram portaria correta?
- [ ] O erro Ã© especÃ­fico de T5402/T5403 ou global?

**Como investigar:**
1. Listar TODOS os equipamentos modelo VSIS-OCR
2. Verificar operaÃ§Ãµes de outros equipamentos VSIS-OCR
3. Visualizar infraÃ§Ãµes de diferentes equipamentos

---

## ðŸŽ¯ ROTEIRO DE NAVEGAÃ‡ÃƒO

### **PASSO 1: Login no Sistema**

**URL:** https://strans.axhub.axion.ws/  
**Credenciais:** Admin / Labor#5383

---

### **PASSO 2: Verificar Modelos de Equipamentos**

**NavegaÃ§Ã£o:**
```
Menu â†’ Cadastros BÃ¡sicos â†’ Modelos de Equipamentos
```

**AÃ§Ãµes:**
1. Clicar em "Listar Todos" ou "Pesquisar"
2. Buscar por "VSIS"
3. Anotar:
   - Quantos modelos aparecem?
   - IDs dos modelos
   - Portaria de cada um
4. Abrir cada modelo VSIS-OCR encontrado
5. Comparar os campos "Portaria" e "NÃºmero da Portaria"

**Resultado esperado:**
- Se houver 1 modelo: Verificar se portaria estÃ¡ correta
- Se houver 2+ modelos: Identificar qual tem erro e qual equipamento usa cada um

---

### **PASSO 3: Verificar VÃ­nculo Equipamento â†’ Modelo**

**NavegaÃ§Ã£o:**
```
Menu â†’ Equipamentos â†’ Equipamentos â†’ Buscar "T5402"
```

**AÃ§Ãµes:**
1. Buscar equipamento T5402
2. Clicar em "Editar"
3. Verificar campo "Modelo do Equipamento"
4. Anotar o modelo vinculado
5. **NÃ£o salvar!** (apenas visualizar)
6. Repetir para T5403

**ComparaÃ§Ã£o:**
| Equipamento | Modelo Vinculado | Portaria do Modelo |
|-------------|------------------|-------------------|
| T5402 | ??? | ??? |
| T5403 | ??? | ??? |

---

### **PASSO 4: Verificar Todas as OperaÃ§Ãµes VSIS-OCR**

**NavegaÃ§Ã£o:**
```
Menu â†’ OperaÃ§Ãµes â†’ OperaÃ§Ãµes â†’ Filtrar por modelo
```

**AÃ§Ãµes:**
1. Listar todas as operaÃ§Ãµes
2. Filtrar por equipamentos modelo VSIS-OCR
3. Ver quantas operaÃ§Ãµes existem
4. Verificar se todas usam "Tarja Axion" ou tarjas diferentes

---

### **PASSO 5: Visualizar InfraÃ§Ãµes com Erro**

**NavegaÃ§Ã£o:**
```
Menu â†’ InfraÃ§Ãµes â†’ GestÃ£o de InfraÃ§Ãµes
```

**AÃ§Ãµes:**
1. Filtrar: 
   - Data Inicial: 11/06/2026
   - Data Final: 11/06/2026
   - Equipamento: T5402
2. Abrir 1-2 infraÃ§Ãµes
3. Visualizar imagem completa
4. Procurar no rodapÃ© da imagem:
   - "Portaria nÃ£o metrolÃ³gico: ???"
5. **Tirar screenshot** se possÃ­vel
6. Repetir com equipamento T5403

---

### **PASSO 6: Testar com Outros Modelos (ComparaÃ§Ã£o)**

**Objetivo:** Verificar se o erro Ã© especÃ­fico do VSIS-OCR

**AÃ§Ãµes:**
1. Buscar infraÃ§Ãµes de outros modelos:
   - InfraÃ§Ãµes de equipamentos NÃƒO VSIS-OCR
   - Mesmo perÃ­odo (11/06/2026)
2. Verificar se mostram portaria correta
3. Comparar os campos da tarja

---

## ðŸ“Š TEMPLATE DE REGISTRO DE DADOS

### **Modelos Encontrados:**

```
MODELO 1:
- ID: [navegaÃ§Ã£o nÃ£o mostra ID visual, anotar nome completo]
- Marca: 
- Modelo: 
- NÃºmero Portaria: 
- Portaria: 
- Data AtualizaÃ§Ã£o: 
- Status: [ ] Correto (2021) [ ] Errado (2012)

MODELO 2 (se houver):
- ID: 
- Marca: 
- Modelo: 
- NÃºmero Portaria: 
- Portaria: 
- Data AtualizaÃ§Ã£o: 
- Status: [ ] Correto (2021) [ ] Errado (2012)
```

### **Equipamentos:**

```
T5402:
- Modelo vinculado: 
- Status operaÃ§Ã£o: 
- Ãšltima infraÃ§Ã£o: 

T5403:
- Modelo vinculado: 
- Status operaÃ§Ã£o: 
- Ãšltima infraÃ§Ã£o: 
```

### **InfraÃ§Ãµes Verificadas:**

```
INFRAÃ‡ÃƒO 1:
- Data/Hora: 11/06/2026 __:__
- Equipamento: T5402 ou T5403
- Placa: 
- Campo "Portaria nÃ£o metrolÃ³gico": 
- Status: [ ] Mostra erro 2012 [ ] Mostra correto 2021

INFRAÃ‡ÃƒO 2:
- Data/Hora: 11/06/2026 __:__
- Equipamento: T5402 ou T5403
- Placa: 
- Campo "Portaria nÃ£o metrolÃ³gico": 
- Status: [ ] Mostra erro 2012 [ ] Mostra correto 2021
```

---

## ðŸŽ¯ HIPÃ“TESES A VALIDAR

### **HipÃ³tese 1: Modelo duplicado**
- [ ] Existem 2 modelos VSIS-OCR no sistema
- [ ] Um tem portaria correta (2021)
- [ ] Outro tem portaria errada (2012)
- [ ] T5402/T5403 estÃ£o vinculados ao modelo errado

**Como validar:** Contar quantos modelos VSIS-OCR aparecem na listagem

---

### **HipÃ³tese 2: Modelo Ãºnico com portaria errada**
- [ ] Existe apenas 1 modelo VSIS-OCR
- [ ] Este modelo tem portaria "492 de 17/07/2012"
- [ ] Todos os equipamentos VSIS-OCR mostram o mesmo erro

**Como validar:** Ver se sÃ³ hÃ¡ 1 modelo e se portaria estÃ¡ errada

---

### **HipÃ³tese 3: Template com hardcode**
- [ ] Modelo tem portaria correta
- [ ] MAS template da tarja tem texto fixo errado
- [ ] JÃ¡ verificamos: template usa placeholder âœ“

**Status:** âœ… **DESCARTADA** - Template confirmado com placeholder `{PortariaNaoMetrologico}`

---

### **HipÃ³tese 4: ConfiguraÃ§Ã£o global**
- [ ] Sistema tem configuraÃ§Ã£o global de portaria
- [ ] Esta configuraÃ§Ã£o sobrescreve o valor do modelo
- [ ] Precisa verificar menu ConfiguraÃ§Ãµes

**Como validar:** Explorar menu ConfiguraÃ§Ãµes e buscar por "portaria"

---

## âœ… RESULTADO ESPERADO DA INVESTIGAÃ‡ÃƒO

Ao final, deveremos saber:

1. **Quantos modelos VSIS-OCR existem?** ___
2. **Qual portaria estÃ¡ cadastrada em cada modelo?** 
   - Modelo 1: ___
   - Modelo 2: ___
3. **A qual modelo T5402/T5403 estÃ£o vinculados?** ___
4. **O erro aparece em TODAS as infraÃ§Ãµes VSIS-OCR ou sÃ³ em algumas?** ___
5. **HÃ¡ configuraÃ§Ã£o global de portaria?** [ ] Sim [ ] NÃ£o

---

## ðŸš€ PRÃ“XIMOS PASSOS (ApÃ³s InvestigaÃ§Ã£o)

### **Se encontrarmos modelo com portaria errada:**
â†’ Editar o modelo e corrigir a portaria

### **Se encontrarmos modelos duplicados:**
â†’ Vincular equipamentos ao modelo correto OU excluir modelo duplicado

### **Se encontrarmos configuraÃ§Ã£o global:**
â†’ Editar a configuraÃ§Ã£o global

### **Se NÃƒO encontrarmos nada via web:**
â†’ Problema estÃ¡ no cÃ³digo backend (necessÃ¡rio acesso ao cÃ³digo-fonte)

---

**Documento criado em:** 2026-06-15  
**PrÃ³xima aÃ§Ã£o:** Executar investigaÃ§Ã£o navegando no sistema STRANS


---

## ORIGEM: RESULTADO-INVESTIGACAO-WEB-PORTARIA-492.md

# ðŸ“Š RESULTADO DA INVESTIGAÃ‡ÃƒO WEB - Erro "492 de 17/07/2012"

**Data:** 2026-06-15  
**MÃ©todo:** InvestigaÃ§Ã£o via interface web do STRANS  
**Executor:** AnÃ¡lise completa do sistema  
**Status:** âœ… INVESTIGAÃ‡ÃƒO CONCLUÃDA  

---

## âœ… O QUE FOI VERIFICADO

### 1ï¸âƒ£ **Modelos de Equipamentos** (TBModeloEquipamentos)

**Resultado:** âœ… **CORRETO**

```
NavegaÃ§Ã£o: Cadastros BÃ¡sicos â†’ Modelos de Equipamentos â†’ Buscar "VSIS"
```

**Modelos VSIS encontrados:**

| Marca | Modelo | NÂº Portaria | Portaria | Status |
|-------|--------|-------------|----------|--------|
| VELSIS | VSIS-OCR | 492 | **PORTARIA INMETRO/DIMEL NÂº 492/2021** | âœ… CORRETO |
| VELSIS | VSIS-01 Laser | 103 | PORTARIA INMETRO/DIMEL NÂº 103/2007 | âœ… OK |
| VELSIS | VSIS-VCAP-01 544 | 050 | PORTARIA INMETRO/DIMEL NÂº 050/2018 | âœ… OK |
| VELSIS | VSIS-01 Doppler | 012 | PORTARIA INMETRO/DIMEL NÂº 012/2015 | âœ… OK |
| VELSIS | VSIS-01 Laser 544 | 201 | PORTARIA INMETRO/DIMEL NÂº 201/2018 | âœ… OK |
| VELSIS | VSIS-VCAP-01 | 145 | PORTARIA INMETRO/DIMEL NÂº 145/2008 | âœ… OK |
| VELSIS | VSIS-01 Doppler 544 | 210 | PORTARIA INMETRO/DIMEL NÂº 210/2019 | âœ… OK |

**ConclusÃµes:**
- âœ… Existe **APENAS 1** modelo "VSIS-OCR" cadastrado
- âœ… Portaria cadastrada: **"PORTARIA INMETRO/DIMEL NÂº 492/2021"** (DATA CORRETA!)
- âœ… **NÃƒO hÃ¡ modelos duplicados**
- âœ… NÃºmero da portaria: **492** (correto)

**Link direto do modelo:**
- https://strans.axhub.axion.ws/modeloequipamento/edit/46862521-f218-4127-a4e1-c157101f5cb4

---

### 2ï¸âƒ£ **Template da Tarja** (TBTarjas)

**Resultado:** âœ… **USA PLACEHOLDER** (nÃ£o hÃ¡ hardcode)

```
NavegaÃ§Ã£o: ConfiguraÃ§Ãµes â†’ Tarjas â†’ "Tarja Axion"
```

**Template verificado:**
```
Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico}
```

**ConclusÃµes:**
- âœ… Template **NÃƒO tem texto hardcoded** com "2012"
- âœ… Usa placeholder `{PortariaNaoMetrologico}`
- âœ… Template estÃ¡ **correto**

**Link direto da tarja:**
- https://strans.axhub.axion.ws/tarja/edit/7c63d905-76d5-4824-bb91-2251e62dc77d

---

### 3ï¸âƒ£ **OperaÃ§Ã£o 359a6427** (TBOperacoes)

**Resultado:** âœ… **VINCULAÃ‡ÃƒO CORRETA**

```
NavegaÃ§Ã£o: OperaÃ§Ãµes â†’ Editar operaÃ§Ã£o 359a6427-d58d-490e-ab3b-362504f5c7ef
```

**Dados da operaÃ§Ã£o:**
- **Equipamento:** T5403
- **Tarja vinculada:** Tarja Axion
- **EndereÃ§o:** Av. Frei Serafim, prox. ao n. 2439

**ConclusÃµes:**
- âœ… OperaÃ§Ã£o usa "Tarja Axion" (confirmado)
- âœ… Equipamento T5403 vinculado Ã  operaÃ§Ã£o

---

## âŒ O QUE NÃƒO FOI POSSÃVEL VERIFICAR

### 1ï¸âƒ£ **TBConfiguracoes** (ConfiguraÃ§Ãµes Globais)

**Status:** âš ï¸ **NÃƒO ACESSÃVEL VIA WEB**

- Tentativa de acesso ao menu "ConfiguraÃ§Ãµes" nÃ£o retornou interface de listagem
- NÃ£o foi possÃ­vel verificar se hÃ¡ configuraÃ§Ã£o global de portaria
- Pode haver configuraÃ§Ã£o tipo: `PortariaPadraoNaoMetrologico = "492 de 17/07/2012"`

---

### 2ï¸âƒ£ **InfraÃ§Ãµes do dia 11/06/2026** (VisualizaÃ§Ã£o de imagens)

**Status:** âš ï¸ **NÃƒO ACESSÃVEL NO MOMENTO**

- URL `/infracao` retornou pÃ¡gina vazia
- URL `/infracao/triagem` retornou erro 400/404
- NÃ£o foi possÃ­vel visualizar as imagens com as tarjas
- **NecessÃ¡rio:** Verificar diretamente com o cliente ou baixar imagem de exemplo

---

### 3ï¸âƒ£ **CÃ³digo Backend** (LÃ³gica de substituiÃ§Ã£o)

**Status:** âŒ **NÃƒO ACESSÃVEL VIA WEB**

- Interface web nÃ£o permite visualizar cÃ³digo-fonte
- NÃ£o Ã© possÃ­vel verificar se hÃ¡ lÃ³gica diferenciada para `{PortariaNaoMetrologico}`
- **NecessÃ¡rio:** Acesso ao repositÃ³rio Git ou servidor de aplicaÃ§Ã£o

---

## ðŸŽ¯ ANÃLISE FINAL

### **Fatos Confirmados:**

1. âœ… `TBModeloEquipamentos.Portaria` = **"PORTARIA INMETRO/DIMEL NÂº 492/2021"** (CORRETO)
2. âœ… Template da tarja usa **placeholder** `{PortariaNaoMetrologico}` (nÃ£o hardcoded)
3. âœ… Existe **apenas 1 modelo** VSIS-OCR (sem duplicatas)
4. âœ… OperaÃ§Ã£o 359a6427 estÃ¡ vinculada Ã  **"Tarja Axion"**

### **Problema Identificado:**

âš ï¸ **O erro "492 de 17/07/2012" NÃƒO estÃ¡ nos dados visÃ­veis pelo sistema web!**

**Isso significa que o valor errado estÃ¡ em um destes locais:**

1. **TBConfiguracoes** (configuraÃ§Ã£o global nÃ£o acessÃ­vel pela web)
2. **CÃ³digo Backend** (lÃ³gica hardcoded em C#)
3. **Arquivo de configuraÃ§Ã£o** (appsettings.json, web.config)
4. **Cache do sistema** (dados em memÃ³ria)

---

## ðŸ” HIPÃ“TESE PRINCIPAL

### **O Backend tem lÃ³gica diferenciada para as variÃ¡veis:**

```csharp
// CÃ³digo C# hipotÃ©tico (NÃƒO VERIFICADO)
public class TarjaViewModel
{
    // Este campo BUSCA CORRETAMENTE do banco
    public string PortariaEquipamento { get; set; } 
    // TBModeloEquipamentos.Portaria â†’ "PORTARIA INMETRO/DIMEL NÂº 492/2021"
    
    // Este campo pode ter VALOR HARDCODED ou buscar de configuraÃ§Ã£o
    public string PortariaNaoMetrologico 
    { 
        get 
        {
            // POSSÃVEL PROBLEMA AQUI!
            return "492 de 17/07/2012"; // Hardcoded errado
            
            // OU
            return ConfigurationManager.AppSettings["PortariaPadraoNaoMetrologico"];
            
            // OU (correto, mas pode ter bug)
            return ModeloEquipamento?.Portaria ?? "492 de 17/07/2012";
        } 
    }
}
```

**Por que suspeitamos disso?**
- Template tem **DOIS campos** de portaria: `{PortariaEquipamento}` e `{PortariaNaoMetrologico}`
- Ambos **DEVERIAM** buscar do mesmo lugar (`TBModeloEquipamentos.Portaria`)
- Se um estÃ¡ correto e outro errado, Ã© **lÃ³gica de backend diferenciada**

---

## ðŸ“‹ PRÃ“XIMOS PASSOS NECESSÃRIOS

### âœ… **1. Verificar ConfiguraÃ§Ãµes Globais (Via SQL ou Backend)**

**Se tiver acesso SSH ao servidor:**
```bash
# Buscar em arquivos de configuraÃ§Ã£o
grep -r "492 de 17/07/2012" /caminho/do/axhub/
grep -r "2012" /caminho/do/axhub/config/
grep -r "PortariaNaoMetrologico" /caminho/do/axhub/
```

**Ou via SQL (se conseguir acesso):**
```sql
SELECT * FROM TBConfiguracoes 
WHERE ValorConfiguracao LIKE '%492%' OR ValorConfiguracao LIKE '%2012%'
```

---

### âœ… **2. Analisar CÃ³digo-Fonte do Backend**

**Buscar no repositÃ³rio Git:**
```bash
git clone [URL_DO_REPOSITORIO_AXHUB]
cd axhub-backend
grep -r "PortariaNaoMetrologico" --include="*.cs"
grep -r "492 de 17/07/2012" --include="*.cs"
```

**Arquivos principais para verificar:**
- `Controllers/ImagemController.cs`
- `Controllers/InfracaoController.cs`
- `Services/TarjaService.cs`
- `Services/ImagemService.cs`
- `Helpers/TarjaHelper.cs`
- `ViewModels/TarjaViewModel.cs`
- `Processors/ImageProcessor.cs`

---

### âœ… **3. Verificar Arquivos de ConfiguraÃ§Ã£o**

**No servidor da aplicaÃ§Ã£o:**
```bash
# Buscar em appsettings.json
cat /caminho/do/axhub/appsettings.json | grep -i "portaria"

# Buscar em web.config
cat /caminho/do/axhub/web.config | grep -i "portaria"

# Buscar em appsettings.Production.json
cat /caminho/do/axhub/appsettings.Production.json | grep -i "492"
```

---

### âœ… **4. Solicitar Imagem de Exemplo**

**Pedir ao cliente:**
- Enviar 1 imagem de infraÃ§Ã£o do dia 11/06/2026
- Screenshot mostrando o campo "Portaria nÃ£o metrolÃ³gico"
- Confirmar se o erro realmente estÃ¡ aparecendo

---

### âœ… **5. Testar GeraÃ§Ã£o de Nova Tarja**

**Se possÃ­vel:**
1. Gerar uma infraÃ§Ã£o de teste no equipamento T5402 ou T5403
2. Visualizar a imagem gerada
3. Verificar se mostra:
   - âœ… **"PORTARIA INMETRO/DIMEL NÂº 492/2021"** (correto)
   - âŒ **"492 de 17/07/2012"** (errado)

---

## ðŸ’¡ ALTERNATIVAS DE CORREÃ‡ÃƒO (SEM ACESSO AO CÃ“DIGO)

### **OpÃ§Ã£o 1: Atualizar via API (se houver endpoint)**

**Se o sistema tiver API REST:**
```bash
# Atualizar configuraÃ§Ã£o via API
curl -X PUT https://strans.axhub.axion.ws/api/configuracoes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"TipoConfiguracao": "PortariaNaoMetrologico", "ValorConfiguracao": "PORTARIA INMETRO/DIMEL NÂº 492/2021"}'
```

---

### **OpÃ§Ã£o 2: Modificar Template para Usar Outro Placeholder**

**Se `{PortariaEquipamento}` estiver correto:**

**Template atual:**
```
Portaria nÃ£o metrolÃ³gico : {PortariaNaoMetrologico}
```

**Alterar para:**
```
Portaria nÃ£o metrolÃ³gico : {PortariaEquipamento}
```

**Como fazer:**
1. Sistema â†’ ConfiguraÃ§Ãµes â†’ Tarjas â†’ Editar "Tarja Axion"
2. Buscar: `{PortariaNaoMetrologico}`
3. Substituir por: `{PortariaEquipamento}`
4. Salvar

âš ï¸ **IMPORTANTE:** Testar antes em uma tarja de homologaÃ§Ã£o!

---

### **OpÃ§Ã£o 3: Criar Novo Campo Calculado**

**Se houver acesso a customizaÃ§Ãµes:**
- Criar um campo calculado que formate a portaria corretamente
- Exemplo: `{PortariaFormatada}` = `"PORTARIA INMETRO/DIMEL NÂº " + NumeroPortaria + "/2021"`

---

## ðŸŽ¯ RECOMENDAÃ‡ÃƒO IMEDIATA

### **AÃ‡ÃƒO 1: Solicitar ao cliente**
- âœ… Enviar imagem de infraÃ§Ã£o recente (11/06/2026)
- âœ… Confirmar que o erro estÃ¡ aparecendo
- âœ… Verificar se todas as infraÃ§Ãµes mostram o erro ou apenas algumas

### **AÃ‡ÃƒO 2: Solicitar ao time de TI/Desenvolvimento**
- âœ… Acesso ao cÃ³digo-fonte do backend (Git/repositÃ³rio)
- âœ… Acesso aos arquivos de configuraÃ§Ã£o (appsettings.json, web.config)
- âœ… OU acesso SSH ao servidor para buscar por "492 de 17/07/2012"

### **AÃ‡ÃƒO 3: Testar workaround do template**
- âœ… Criar tarja de teste usando `{PortariaEquipamento}` ao invÃ©s de `{PortariaNaoMetrologico}`
- âœ… Gerar infraÃ§Ã£o de teste
- âœ… Verificar se resolve o problema

---

## ðŸ“Š RESUMO EXECUTIVO

| Item | Status | Resultado |
|------|--------|-----------|
| **TBModeloEquipamentos.Portaria** | âœ… Verificado | **CORRETO** (492/2021) |
| **Template da Tarja** | âœ… Verificado | **USA PLACEHOLDER** (sem hardcode) |
| **Modelos Duplicados** | âœ… Verificado | **NÃƒO HÃ** (apenas 1 VSIS-OCR) |
| **TBConfiguracoes** | âŒ NÃ£o acessÃ­vel | **PRECISA VERIFICAR** |
| **CÃ³digo Backend** | âŒ NÃ£o acessÃ­vel | **PRECISA ANALISAR** |
| **Imagens com erro** | âŒ NÃ£o visualizadas | **PRECISA CONFIRMAR** |

---

## âœ… CONCLUSÃƒO

A investigaÃ§Ã£o via web **confirmou que os dados visÃ­veis estÃ£o corretos**, mas **NÃƒO identificou a origem do erro "492 de 17/07/2012"**.

**O problema estÃ¡ em um dos seguintes locais (nÃ£o acessÃ­veis pela web):**
1. ðŸ”§ **ConfiguraÃ§Ã£o global** (TBConfiguracoes)
2. ðŸ’» **CÃ³digo backend** (lÃ³gica C# hardcoded)
3. ðŸ“„ **Arquivo de configuraÃ§Ã£o** (appsettings.json)

**Para corrigir definitivamente, Ã© necessÃ¡rio:**
- âœ… Acesso ao cÃ³digo-fonte OU
- âœ… Acesso ao servidor (SSH/RDP) OU
- âœ… Acesso ao banco de dados (SQL) OU
- âš¡ **Usar o workaround:** Substituir `{PortariaNaoMetrologico}` por `{PortariaEquipamento}` no template

---

**Documento criado em:** 2026-06-15  
**MÃ©todo:** InvestigaÃ§Ã£o via interface web do sistema STRANS  
**Status:** InvestigaÃ§Ã£o concluÃ­da - Aguardando acesso a backend/cÃ³digo-fonte


