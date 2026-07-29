# 38 — ADSL — AKP DOCUMENT SPECIFICATION LANGUAGE
## AXIONIA KNOWLEDGE PLATFORM — Linguagem de Especificação de Documentos

## Sintaxe

```adsl
@document(titulo)
@template(A)
@sistema(AxHub)
@modulo(Triagem)
@publico(operador)
@versao(1.0.0)

@secao(objetivo) {
  "Orienta o operador a realizar a triagem de infrações..."
}

@secao(prerequisitos) {
  - Perfil Triador ativo
  - Acesso ao módulo Infrações
}

@secao(faq) {
  Q: "Como descartar uma infração?"
  A: "O usuário deverá selecionar..."
}

@relacionar(VIDEO_OF, AKP-VID-AH-TRL-001)
@relacionar(FAQ_OF, AKP-FAQ-AH-015)
```
