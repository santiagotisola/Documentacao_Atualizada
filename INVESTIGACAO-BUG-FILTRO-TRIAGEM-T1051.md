# Investigação: Bug no Filtro de Equipamento — Tela de Triagem

**Site:** STRANS  
**URL:** https://strans.axhub.axion.ws/triagem  
**Data do relato:** 27/05/2026  
**Equipamento testado:** T1051 (VIZENTEC)  
**Prioridade:** Alta — impede operação de filtragem por equipamento  

---

## 1. Resumo do Problema

O cliente STRANS relatou divergência entre os dados do **Relatório de Fluxo Diário** e a tela de **Triagem** para o equipamento T1051.

Após análise, identificamos que:

1. **Não há divergência real de dados** — o Fluxo Diário e a Triagem contam métricas diferentes (passagens vs. infrações em pipeline)
2. **O bug real é:** o filtro de equipamento na tela de Triagem **não funciona** — selecionar qualquer equipamento retorna os mesmos dados que sem filtro

---

## 2. Evidência do Bug (Teste realizado em 27/05)

| Ação no filtro          | Resultado (23-27/05)                          |
|-------------------------|----------------------------------------------|
| Sem filtro (TODOS)      | 856, 820, 951, 3149, 751 — Total: 7522-7527  |
| Filtro: T1051 apenas    | 856, 820, 951, 3149, 751 — Total: 7522-7527  |
| Filtro: T1022 apenas    | 856, 820, 951, 3149, 751 — Total: 7522-7527  |
| Filtro: T1051 + T1022   | 856, 820, 951, 3149, 751 — Total: 7522-7527  |

**Conclusão:** O select2 de equipamentos aceita seleção visualmente mas o parâmetro NÃO é transmitido ou NÃO é processado pelo backend.

---

## 3. Localização no Código-Fonte

### 3.1 Frontend (View/JavaScript)

**Elemento HTML:**
```html
<select id="equipamentoIds" name="EquipamentosIds" multiple class="select2">
  <!-- opcões de equipamentos -->
</select>
```

**Pontos de verificação:**

| # | O que verificar | Arquivo provável | Como testar |
|---|-----------------|------------------|-------------|
| 1 | O `<select>` está dentro do `<form>` que faz o POST? | Views/Triagem/Index.cshtml | Inspecionar DOM |
| 2 | O atributo `name` bate com o ViewModel? | TriagemFiltroViewModel.cs | Comparar propriedade |
| 3 | O select2 está configurado com `multiple: true`? | site.js ou triagem.js | Console: `$('#equipamentoIds').select2('val')` |
| 4 | O form serializa o select2 corretamente? | JavaScript do form | F12 → Network → ver payload |
| 5 | Se AJAX: o parâmetro é incluído no body/query? | triagem.js | F12 → Network → Request body |

**Teste rápido no DevTools (F12):**
```javascript
// Verificar se select2 tem valor selecionado
$('#equipamentoIds').val()
// Esperado: array de GUIDs quando selecionado

// Verificar se o form inclui o campo
new FormData(document.querySelector('form')).getAll('EquipamentosIds')
// Esperado: array com os IDs selecionados
```

### 3.2 Backend (Controller .NET)

**Arquivos a localizar:**
```
Controllers/
├── TriagemController.cs         ← PRINCIPAL
├── InfracoesController.cs       ← alternativa
└── RelatoriosController.cs      ← para comparação (fluxo funciona)
```

**Padrão esperado no Controller:**
```csharp
[HttpPost]
public async Task<IActionResult> Filtrar(TriagemFiltroViewModel filtro)
{
    var query = _context.TBInfracoes.AsQueryable();
    
    // ⚠️ VERIFICAR: esta condição existe?
    if (filtro.EquipamentosIds != null && filtro.EquipamentosIds.Any())
    {
        query = query.Where(i => filtro.EquipamentosIds.Contains(i.Equipamento_id));
    }
    
    // filtros de data...
    if (filtro.DataInicio.HasValue)
        query = query.Where(i => i.DataHoraPassagem >= filtro.DataInicio.Value);
    
    // ... resto da query
}
```

**Bugs prováveis no Controller:**

| Cenário | Como identificar |
|---------|-----------------|
| Propriedade com nome diferente no ViewModel | `EquipamentoIds` vs `EquipamentosIds` vs `equipamentoIds` |
| Condição `if` ausente/comentada | Grep por `EquipamentoIds` no controller |
| Binding não funciona (lista vazia) | Adicionar log: `Console.WriteLine($"Equipamentos: {filtro.EquipamentosIds?.Count}")` |
| Service ignora parâmetro | Verificar se Service/Repository recebe e usa o filtro |

### 3.3 ViewModel / DTO

**Localizar:**
```
ViewModels/
├── TriagemFiltroViewModel.cs
└── TriagemIndexViewModel.cs
```

**Verificar:**
```csharp
public class TriagemFiltroViewModel
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    
    // ⚠️ ESTE CAMPO EXISTE? O TIPO ESTÁ CORRETO?
    public List<Guid> EquipamentosIds { get; set; }  // ou Guid[]? ou string[]?
    
    // Se for string[], o parse pode estar falhando silenciosamente
}
```

### 3.4 Camada de Serviço/Repository

**Se o controller delega para um service:**
```csharp
// Services/TriagemService.cs ou Repositories/InfracaoRepository.cs
public async Task<PagedResult<InfracaoDto>> ListarPorFiltro(TriagemFiltroViewModel filtro)
{
    // VERIFICAR: o filtro de equipamento é aplicado aqui?
    // Pode estar sendo ignorado nesta camada
}
```

---

## 4. Comparação: Por que o Fluxo Diário funciona e a Triagem não?

| Aspecto | Relatório Fluxo Diário | Tela Triagem |
|---------|----------------------|--------------|
| Fonte de dados | TBPassagens / TBPassagensConjugadas | TBInfracoes |
| Filtro de equipamento | Dropdown simples (1 equip.) | Select2 múltiplo |
| Tipo de request | GET com query string | POST com form data |
| Funciona? | ✅ SIM (retorna dados filtrados) | ❌ NÃO (ignora filtro) |

**Hipótese principal:** O Fluxo Diário usa um dropdown single-select com binding simples, enquanto a Triagem usa select2 multiple que requer binding especial para arrays no .NET MVC.

---

## 5. Possíveis Causas (ordenadas por probabilidade)

### Causa 1: Select2 não serializa no form submit (80% provável)
O select2 em modo `multiple` precisa que os `<option>` estejam realmente marcados como `selected` antes do form submit. Se o JavaScript não sincroniza, o POST vai sem equipamentos.

**Fix:**
```javascript
// Antes do form submit, garantir que select2 sincroniza
$('form').on('submit', function() {
    // Forçar select2 a atualizar o select nativo
    var vals = $('#equipamentoIds').select2('val');
    // ou verificar se já funciona nativamente
});
```

### Causa 2: Nome do campo no HTML ≠ propriedade do ViewModel (15% provável)
```html
<!-- Se o name for "equipamentoIds" (camelCase) -->
<select name="equipamentoIds" ...>

<!-- Mas o ViewModel espera "EquipamentosIds" (PascalCase + plural) -->
public List<Guid> EquipamentosIds { get; set; }
```
MVC Binding é case-insensitive mas plural matters!

### Causa 3: Controller não usa o parâmetro (5% provável)
O filtro existe no ViewModel mas a query no Controller/Service não aplica o WHERE.

---

## 6. Plano de Correção

### Passo 1: Diagnóstico (30min)
1. Abrir F12 → Network na tela de Triagem
2. Selecionar T1051 no filtro e clicar Filtrar
3. Verificar o payload do POST:
   - Se `EquipamentosIds` NÃO aparece → **Bug frontend**
   - Se `EquipamentosIds` aparece com valor → **Bug backend**

### Passo 2: Fix Frontend (se aplicável)
- Verificar binding do select2 no JavaScript da página
- Garantir que o `name` do `<select>` bate com ViewModel
- Testar com DevTools: remover select2 e usar select nativo pra confirmar

### Passo 3: Fix Backend (se aplicável)  
- Adicionar log no controller para verificar valor recebido
- Verificar se o WHERE está aplicando o filtro
- Comparar com o controller do Fluxo Diário que funciona

### Passo 4: Validação
- Executar as queries SQL do arquivo `scripts-validacao-T1051.sql`
- Confirmar que T1051 tem dados diferentes de "todos"
- Testar no browser com filtro aplicado

---

## 7. Scripts SQL de Apoio

O arquivo **`scripts-validacao-T1051.sql`** contém todas as queries necessárias para:
- Identificar IDs dos equipamentos
- Comparar dados entre camadas (Passagens → Conjugadas → Infrações → Triagem)
- Simular o que a tela deveria mostrar com e sem filtro
- Validar se o pipeline de dados está íntegro

---

## 8. Schema Relevante (Referência Rápida)

```
TBPassagens (velocidades registradas)
    └── Equipamento_id → TBEquipamentos.Id
    └── Infracao_id → TBInfracoes.Id

TBPassagensConjugadas (imagens com pares de fotos)
    └── Equipamento_id → TBEquipamentos.Id
    └── FoiGeradaInfracao (bit) ← indica se gerou infração

TBInfracoes (infrações no pipeline)
    └── Equipamento_id → TBEquipamentos.Id
    └── StatusProcessamento: 'Triagem' | 'Auditada' | 'Exportada' | 'Descartada'

TBTriagens (decisões da triagem)
    └── Id = TBInfracoes.Id (1:1)
    └── MotivoDescarte_id (se descartada)
    └── UsuarioTriagem_id (quem triou)

TBEquipamentos
    └── GrupoEquipamento_id → TBGrupoEquipamentos.Id
    └── Codigo: 'T1051', 'T1022', etc.

TBGrupoEquipamentos
    └── Grupos: VIZENTEC (f1178243-...), FOCALLE (514f9e07-...)
```

---

## 9. Contato

Para dúvidas sobre esta análise, verificar no sistema:
- **URL de teste:** https://strans.axhub.axion.ws/triagem
- **Usuário teste:** Administrador (sem restrição de grupo)
- **Período:** 23/05 a 27/05/2026
- **Equipamentos:** T1051, T1022 (grupo VIZENTEC)
