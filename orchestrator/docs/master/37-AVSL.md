# 37 — AVSL — AKP VIDEO SPECIFICATION LANGUAGE
## AXIONIA KNOWLEDGE PLATFORM — Linguagem de Especificação de Vídeo

## Sintaxe

```avsl
@video(titulo)
@capitulo(numero, titulo)
@cena(numero) {
  objetivo: "string"
  narrativa: "string"
  imagem: screenshot.png | slide | animacao
  zoom: regiao="selector" fator=1.5
  cursor: visivel=true destacado=true
  callout: texto="Atenção!" posicao=right
  legenda: "Texto exibido na tela"
  transicao: fade|cut|slide|zoom_out|dissolve
  audio: narracao=true musica=false
  tempo: 12s
}
```

## Validação

Todo AVSL é validado antes da renderização:
- Todas as cenas têm objetivo definido
- Narrativas respeitam limite de palavras
- Screenshots referenciados existem no MinIO
- Tempo total dentro dos limites do nível
