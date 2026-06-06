# Investigação: Imagem Panorâmica T1054 - Ticket #99804104

## Resumo do Chamado

> "Solicitamos verificação no equipamento T1054 referente à tela de triagem. A imagem panorâmica deverá aparecer ao lado do zoom, seguindo o mesmo padrão exibido na primeira tela dos modelos padrão."

---

## Por que existem ZT, P1, ZF, P2, Z1, Z, P e VID?

### Explicação Completa dos Tipos de Imagem

O sistema STRANS possui **8 tipos de imagem** cadastrados na tabela `TBTiposImagens`. Esses tipos existem porque **cada fabricante de equipamento usa nomenclatura diferente** para classificar os arquivos de imagem que envia:

| Código | Descrição | Categoria Interna | Ordem | Quem usa |
|--------|-----------|-------------------|-------|----------|
| **ZT** | Zoom Faixa | Zoom | 1 | Velsis (padrão antigo/tarja) |
| **P1** | Panorâmica 1 | Panorâmica | 2 | Velsis (primeira câmera panorâmica) |
| **ZF** | Zoom Faixa | Zoom | 3 | Velsis (zoom por faixa específica) |
| **P2** | Panorâmica 2 | Panorâmica | 4 | Velsis (segunda câmera panorâmica) |
| **Z1** | Zoom faixa 1 | Zoom | 5 | Velsis/variantes (zoom faixa numerado) |
| **Z** | Zoom Faixa | Zoom | 6 | Focalle / Vizentec (genérico) |
| **P** | Panorâmica | Panorâmica | 7 | Focalle / Vizentec (genérico) |
| **VID** | Vídeo | Vídeo | 8 | Qualquer fabricante |

### O que significa cada grupo?

#### 🔵 Grupo Velsis (ZT, P1, ZF, P2, Z1)
A Velsis usa um sistema de nomenclatura **detalhado por câmera e posição**:
- **ZT** = "Zoom Tarja" — imagem de zoom focada na placa com sobreposição da tarja de infração
- **P1** = "Panorâmica 1" — primeira imagem panorâmica (contexto do veículo na via)
- **ZF** = "Zoom Faixa" — zoom identificando a faixa de rodagem
- **P2** = "Panorâmica 2" — segunda imagem panorâmica (segundo ângulo ou momento)
- **Z1** = "Zoom faixa 1" — variante numerada do zoom por faixa

#### 🟢 Grupo Focalle / Vizentec (Z, P)
Estes fabricantes usam nomenclatura **genérica/simplificada**:
- **Z** = "Zoom" — qualquer imagem de zoom (placa/detalhe)
- **P** = "Panorâmica" — qualquer imagem panorâmica

#### 🟡 Comum (VID)
- **VID** = "Vídeo" — arquivo de vídeo da passagem (qualquer fabricante)

---

## De onde vem essa informação? Quem define?

### Fluxo de classificação:

```
┌─────────────────────┐     ┌──────────────────────────────────┐     ┌──────────────────────┐
│  FABRICANTE (Velsis) │     │  IMPORTAÇÃO AxHub                │     │  BANCO DE DADOS      │
│                      │     │                                  │     │                      │
│  Gera arquivo com    │────▶│  Lê o código do tipo do nome     │────▶│  TBImagensPassagens  │
│  nome: T1054_ZT_... │     │  do arquivo (ex: "ZT")           │     │  Conjugadas          │
│  ou: T1054_P1_...   │     │  Vincula ao TBTiposImagens.Codigo│     │  TipoImagem_id → ZT  │
└─────────────────────┘     └──────────────────────────────────┘     └──────────────────────┘
```

1. **O fabricante (Velsis/Focalle/Vizentec)** gera os arquivos de imagem com um padrão de nome que inclui o código do tipo (ZT, P1, Z, P, etc.)
2. **O AxHub** importa esses arquivos e usa o campo `TipoImagem` do nome do arquivo (definido no Layout de Arquivo) para determinar qual tipo de imagem é
3. **O registro** é salvo na tabela `TBImagensPassagensConjugadas` com o `TipoImagem_id` correspondente

### Quem cadastrou os 8 tipos?
Os tipos são **cadastrados manualmente** no AxHub pelo administrador em **Configurações → Tipos de Imagem** (`/tipoimagem`). Foram criados para atender TODOS os fabricantes do site STRANS:
- Fabricantes presentes: **Velsis**, **Velsis RTM**, **Focalle**, **Vizentec**, Axion, Lasertech, Engebrás

---

## Por que hora traz de um jeito e hora de outro?

### A raiz do problema: Cada fabricante manda diferente

| Fabricante | Equipamentos | Códigos que envia |
|-----------|--------------|-------------------|
| **Velsis** | T1054, T1016, T1033 | ZT + P1 (ou ZF + P2) |
| **Focalle** | T1005, T1006, T1008, T1012, T1020, T3302 | Z + P |
| **Vizentec** | T1120, T1114, T1115, T4114, T4129 | Z + P |

**Quando o operador de triagem alterna entre equipamentos diferentes**, a exibição muda porque:
- Triagear **T1054 (Velsis)** → as imagens são classificadas como **ZT** e **P1**
- Triagear **T1005 (Focalle)** → as imagens são classificadas como **Z** e **P**

O padrão visual é o mesmo (zoom + panorâmica), mas o **código interno** é diferente.

---

## Configuração atual do "Lado a Lado" no STRANS

A configuração encontrada na página `/configuracao` → aba Triagem:

| Campo | Valor atual | Significado |
|-------|-------------|-------------|
| Tipo Imagem Lado **Direito** | **ZT** | Mostra Zoom Faixa (Velsis) à direita |
| Tipo Imagem Lado **Esquerdo** | **P1** | Mostra Panorâmica 1 (Velsis) à esquerda |

### ⚠️ PROBLEMA IDENTIFICADO

A configuração **está correta APENAS para equipamentos Velsis** (T1054, T1016, T1033).

**Para equipamentos Focalle e Vizentec** (T1005, T1120, etc.), que usam os códigos `Z` e `P`, a configuração de lado-a-lado **NÃO funciona** porque o sistema procura imagens com tipo `ZT` à direita e `P1` à esquerda — mas esses equipamentos enviam `Z` e `P`.

---

## Isso é mudança do AxHub ou do fabricante?

### Resposta: É do FABRICANTE (padrão de nomenclatura de arquivo)

O AxHub é passivo — ele apenas **lê o código que vem no nome do arquivo** e registra no banco. Se:
- Velsis decidiu mudar o padrão de nomenclatura de `ZT`/`P1` para `Z`/`P`
- Ou se o modelo mais novo (VSIS-OCR) usa padrão diferente do antigo

...então o AxHub vai registrar com o novo código, e a exibição muda.

### Cenários possíveis para o T1054:

| Cenário | Probabilidade | Explicação |
|---------|--------------|-------------|
| Velsis mudou firmware e agora manda `Z`+`P` em vez de `ZT`+`P1` | ⚠️ Alta | Atualização de software do equipamento |
| O T1054 sempre mandou `ZT`+`P1` e o lado-a-lado nunca funcionou para `Z`+`P` | Média | Configuração parcial |
| A configuração foi alterada recentemente | Baixa | Estava sem configuração antes |

---

## Diagnóstico Técnico: Por que o lado-a-lado não funciona

### Como o `triagem.js` decide exibir lado-a-lado

```javascript
// Plugin triagem.js — configuração padrão
settings = {
    imagensLadoALado: false,  // ← PADRÃO é false (uma imagem por vez)
    // ...
};

// Comportamento ao clicar na miniatura:
if (settings.imagensLadoALado === false) {
    // Troca a imagem principal (uma por vez)
    $.fn.triagem.setImage(imageId, index);
} else {
    // Abre galeria lado a lado
    $.fn.triagem.openGallery(index);
}
```

O parâmetro `imagensLadoALado` é passado pelo **servidor** quando renderiza o partial da infração. O servidor verifica:
1. Se `ConfiguracoesGerais.TipoImagemLadoDireitoId` está preenchido
2. Se `ConfiguracoesGerais.TipoImagemLadoEsquerdoId` está preenchido
3. Se a passagem atual **possui imagens dos DOIS tipos configurados**

Se a passagem tem tipo `Z` + `P` mas a configuração espera `ZT` + `P1`, **não faz match** → `imagensLadoALado = false` → exibe uma imagem por vez.

---

## Solução

### Opção A: Descobrir qual código o T1054 realmente está enviando agora

Verificar no banco de dados:
```sql
SELECT TOP 10 
    ti.Codigo, ti.Descricao, ipc.NomeImagem, pc.DataHoraPassagem
FROM TBImagensPassagensConjugadas ipc
JOIN TBTiposImagens ti ON ipc.TipoImagem_id = ti.Id
JOIN TBPassagensConjugadas pc ON ipc.PassagemConjugada_id = pc.Id
WHERE pc.Equipamento_id = '0a0fa2f4-166a-43bf-8048-a0f9cd34bbdd' -- T1054
ORDER BY pc.DataHoraPassagem DESC
```

Se retornar `Z` + `P` (em vez de `ZT` + `P1`), confirma que a Velsis mudou a nomenclatura.

### Opção B: Alterar configuração para aceitar ambos os padrões

**O AxHub NÃO suporta configurar múltiplos pares lado-a-lado** (é apenas um par global). Então:

1. Se TODOS os equipamentos agora mandam `Z` + `P` → configurar: Direito=Z, Esquerdo=P
2. Se apenas Velsis manda `ZT` + `P1` → manter: Direito=ZT, Esquerdo=P1
3. Se há MIX → **é necessário desenvolvimento** para aceitar múltiplos mapeamentos ou fazer match por `TipoDeImagem` (Zoom/Panorâmica) em vez de código específico

### Opção C (RECOMENDADA): Match por categoria

O campo `TipoDeImagem` na tabela classifica internamente:
- ZT, ZF, Z1, Z → todos são `TipoDeImagem = "Zoom"`
- P1, P2, P → todos são `TipoDeImagem = "Panorâmica"`

Uma alteração no código do AxHub para fazer match por **categoria** em vez de **código específico** resolveria o problema para TODOS os equipamentos de uma vez.

---

## Dados do Equipamento

| Propriedade | Valor |
|-------------|-------|
| Equipamento | T1054 |
| Fabricante | Velsis |
| Modelo | VSIS-OCR |
| Tipo | OCR |
| Grupo | FX EXCLUSIVA |
| Série | 0000010310 |
| Inmetro | 006360/2021 (vence 18/10/2026) |
| Status | Ativo (heartbeat 01/06/2026 07:16) |
| Conjugado | Sim |
| Operação ID | `5e8109d8-34a9-4196-bca0-0ae32ec69fd9` |
| Triagens pendentes | ~23.854 registros |

---

## Próximos Passos

1. **Executar a query SQL** (Opção A) para confirmar quais códigos o T1054 está enviando atualmente
2. **Comparar com histórico** — verificar se antes de ~25/05/2026 os códigos eram diferentes
3. **Se confirmada mudança da Velsis** → abrir chamado com o fabricante para documentar a alteração
4. **Ajustar configuração** conforme o cenário encontrado
5. **Avaliar desenvolvimento** da Opção C (match por categoria) como solução permanente

---

*Investigação realizada em: 01/06/2026*  
*Sistema: AxHub STRANS (https://strans.axhub.axion.ws)*  
*Ticket Jitbit: #99804104*
