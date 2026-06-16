# 🗺️ Diagrama de Fluxo: De Onde Vem Cada Dado da Tarja

**Sistema:** AxHub STRANS  
**Data:** 2026-06-15  

---

## 📊 VISUALIZAÇÃO HIERÁRQUICA

```
🎯 TBInfracoes (Ponto de partida - Registro da infração do dia 11/06/2026)
│
├─── 🔗 Equipamento_id ────────────► TBEquipamentos
│                                    │
│                                    ├─► Codigo = {CodigoEquipamento} ✅ "T5402"
│                                    ├─► NumeroSerie = {SerialEquipamento} ✅
│                                    │
│                                    └─► ModeloEquipamento_id ───► TBModeloEquipamentos
│                                                                  │
│                                                                  ├─► Marca = "VELSIS"
│                                                                  ├─► Modelo = "VSIS-OCR"
│                                                                  ├─► Marca + Modelo = {MarcaModeloEquipamento} ✅
│                                                                  │
│                                                                  ├─► Portaria = {PortariaEquipamento} ✅
│                                                                  │   ✅ "PORTARIA INMETRO/DIMEL Nº 492/2021"
│                                                                  │
│                                                                  └─► Portaria = {PortariaNaoMetrologico} ❌
│                                                                      ❌ Deveria ser "...492/2021"
│                                                                      ❌ MAS aparece "492 de 17/07/2012"
│                                                                      ⚠️ ERRO AQUI!
│
├─── 🔗 Operacao_id ────────────────► TBOperacoes
│                                    │
│                                    └─► Endereco = {CodigoLocalOperacaoEquipamento} ✅
│                                        "Av. Frei Serafim, prox. ao n. 2439"
│
├─── 🔗 Faixa_id ───────────────────► TBFaixas
│                                    │
│                                    ├─► NumeroFaixa = {NumeroFaixa} ✅ "1", "2", "3"
│                                    ├─► Sentido = {SentidoFaixa} ✅ "Norte/Sul"
│                                    │
│                                    └─► Id ────────────► TBFaixasAfericoes
│                                                        │
│                                                        └─► Afericao_id ───► TBAfericoes
│                                                                            │
│                                                                            ├─► DataAfericao = {DataAfericaoInmetro} ✅
│                                                                            │   "15/10/2025"
│                                                                            │
│                                                                            ├─► DataVencimento = {DataVencimentoAfericao} ✅
│                                                                            │   "18/10/2026" (usado 2x!)
│                                                                            │
│                                                                            └─► NumeroInmetro = {NumeroCertificadoInmetro} ✅
│                                                                                "006350/2021"
│
├─── 🔗 Enquadramento_id ───────────► TBEnquadramentos
│                                    │
│                                    ├─► Codigo = {CodigoEnquadramento} ✅ "75870"
│                                    │
│                                    └─► Descricao = {DescricaoEnquadramento} ✅
│                                        "TRANSITAR COM O VEIC NA FAIXA..."
│
└─── 📅 DataHoraInfracao ────────────► {DataPassagemInfracao} ✅
                                       "11/06/2026 14:35:22"
```

---

## 🎯 FOCO NO PROBLEMA: AS DUAS PORTARIAS

### **Comparação Visual:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    TBModeloEquipamentos                         │
│                       (Modelo VSIS-OCR)                         │
│                                                                 │
│  Portaria = "PORTARIA INMETRO/DIMEL Nº 492/2021" ✅            │
│             └─────────┬─────────────┬──────────┘               │
└───────────────────────┼─────────────┼──────────────────────────┘
                        │             │
                        ▼             ▼
        ┌───────────────────┐   ┌───────────────────────┐
        │PortariaEquipamento│   │PortariaNaoMetrologico │
        │                   │   │                       │
        │  ✅ CORRETO       │   │  ❌ ERRADO            │
        │  "...492/2021"    │   │  "492 de 17/07/2012"  │
        │                   │   │                       │
        │  Campo na tarja:  │   │  Campo na tarja:      │
        │  "Portaria:"      │   │  "Portaria não        │
        │                   │   │   metrológico:"       │
        └───────────────────┘   └───────────────────────┘
              ↓                           ↓
         [Template]                  [Template]
    Portaria:                    Portaria não metrológico:
    {PortariaEquipamento}        {PortariaNaoMetrologico}
```

### **Por que isso é estranho?**

Se ambas as variáveis buscam do **MESMO campo** (`TBModeloEquipamentos.Portaria`), por que uma está correta e outra errada?

**Resposta:** O backend **NÃO está** buscando `{PortariaNaoMetrologico}` de `TBModeloEquipamentos.Portaria`!

---

## 🔍 ONDE PODE ESTAR O VALOR ERRADO?

### **Local 1: TBConfiguracoes (Configuração Global)**

```sql
TBConfiguracoes
├─ TipoConfiguracao: "PortariaPadraoNaoMetrologico"
└─ ValorConfiguracao: "492 de 17/07/2012" ❌ ERRO AQUI!
```

**Como o backend usa:**
```csharp
public string PortariaNaoMetrologico 
{ 
    get 
    {
        return ConfigurationManager.AppSettings["PortariaPadraoNaoMetrologico"];
        // Retorna "492 de 17/07/2012" ❌
    }
}
```

---

### **Local 2: Código Backend (Hardcode)**

**Arquivo hipotético:** `TarjaService.cs`

```csharp
public class TarjaViewModel
{
    // Este busca CORRETAMENTE do banco
    public string PortariaEquipamento 
    { 
        get { return ModeloEquipamento.Portaria; } 
        // "PORTARIA INMETRO/DIMEL Nº 492/2021" ✅
    }
    
    // Este tem valor HARDCODED errado
    public string PortariaNaoMetrologico 
    { 
        get { return "492 de 17/07/2012"; } ❌ ERRO AQUI!
    }
}
```

---

### **Local 3: Arquivo appsettings.json**

```json
{
  "Tarja": {
    "Configuracoes": {
      "PortariaNaoMetrologico": "492 de 17/07/2012"  ❌ ERRO AQUI!
    }
  }
}
```

**Como o backend usa:**
```csharp
var config = Configuration.GetSection("Tarja:Configuracoes");
var portaria = config["PortariaNaoMetrologico"];
// Retorna "492 de 17/07/2012" ❌
```

---

## 🎯 TABELA RÁPIDA: STATUS DE CADA CAMPO

| Campo | Variável | Origem | Status |
|-------|----------|--------|--------|
| Cód. Equipamento | `{CodigoEquipamento}` | TBEquipamentos.Codigo | ✅ |
| Endereço | `{CodigoLocalOperacaoEquipamento}` | TBOperacoes.Endereco | ✅ |
| Faixa | `{NumeroFaixa}` | TBFaixas.NumeroFaixa | ✅ |
| Sentido | `{SentidoFaixa}` | TBFaixas.Sentido | ✅ |
| Data | `{DataPassagemInfracao}` | TBInfracoes.DataHoraInfracao | ✅ |
| Data Aferição | `{DataAfericaoInmetro}` | TBAfericoes.DataAfericao | ✅ |
| Data Venc. Aferição | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | ✅ |
| Certif. | `{CertificadoEquipamento}` | TBEquipamentos.NumeroSerie OU TBAfericoes.NumeroInmetro | ⚠️ Ambíguo |
| **Portaria** | **`{PortariaEquipamento}`** | **TBModeloEquipamentos.Portaria** | **✅ CORRETO** |
| Reg. não metrológico | `{NumeroCertificadoInmetro}` | TBAfericoes.NumeroInmetro | ✅ |
| Venc. não metrológico | `{DataVencimentoAfericao}` | TBAfericoes.DataVencimento | ✅ |
| **Portaria não metrológico** | **`{PortariaNaoMetrologico}`** | **??? (NÃO é TBModeloEquipamentos!)** | **❌ ERRADO** |
| Marca/Modelo | `{MarcaModeloEquipamento}` | TBModeloEquipamentos.Marca + Modelo | ✅ |
| Cód. Org | `{CodigoOrgaoAutuador}` | TBConfiguracoes OU TBOrgaosAutuadores | ✅ |
| Infração | `{CodigoEnquadramento}` | TBEnquadramentos.Codigo | ✅ |
| Descrição | `{DescricaoEnquadramento}` | TBEnquadramentos.Descricao | ✅ |
| Serial | `{SerialEquipamento}` | TBEquipamentos.NumeroSerie | ✅ |

**Legenda:**
- ✅ Campo correto e origem confirmada
- ⚠️ Campo funcional mas origem ambígua
- ❌ Campo com erro - origem desconhecida

---

## 💡 SOLUÇÃO PRÁTICA (WORKAROUND)

### **Alternativa 1: Substituir no Template**

**Abrir tarja no sistema:**
1. Menu → Configurações → Tarjas → "Tarja Axion"
2. Buscar no template:
   ```
   Portaria não metrológico : {PortariaNaoMetrologico}
   ```
3. Substituir por:
   ```
   Portaria não metrológico : {PortariaEquipamento}
   ```
4. Salvar e testar

**Por que funciona?**
- `{PortariaEquipamento}` busca corretamente de `TBModeloEquipamentos.Portaria`
- Se `{PortariaNaoMetrologico}` está errado, usar a variável que está certa!

---

### **Alternativa 2: Criar Campo Calculado**

**Se o sistema permitir expressões:**
```
Portaria não metrológico : PORTARIA INMETRO/DIMEL Nº {NumeroPortaria}/2021
```

Onde `{NumeroPortaria}` vem de `TBModeloEquipamentos.NumeroPortaria` = "492"

---

## 🔧 PARA CORREÇÃO DEFINITIVA

### **Necessário acesso a:**

1. **Código-fonte backend:**
   ```bash
   grep -r "PortariaNaoMetrologico" --include="*.cs"
   ```

2. **Arquivos de configuração:**
   ```bash
   cat appsettings.json | grep -i portaria
   cat appsettings.Production.json | grep -i 492
   ```

3. **Banco de dados:**
   ```sql
   SELECT * FROM TBConfiguracoes WHERE ValorConfiguracao LIKE '%2012%'
   ```

---

**Criado em:** 2026-06-15  
**Todas as 16 variáveis mapeadas**  
**Erro localizado:** `{PortariaNaoMetrologico}` não busca de onde deveria
