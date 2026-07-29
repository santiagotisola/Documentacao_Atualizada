# 57 — CLI — axionia.js
## AXIONIA KNOWLEDGE PLATFORM — Interface de Linha de Comando

## Comandos

```bash
# Pipeline completo
axionia presentation generate projeto.json

# Detectar e aplicar atualizações
axionia presentation update Dashboard.jsx --sim

# Ver arquivos alterados desde último commit
axionia presentation diff

# Status do projeto atual
axionia presentation status

# Executar agente específico
axionia agent run AKP-SB --input knowledge.json

# Validar output
axionia validate output/axhub/03-manual.json
```

## Opções Globais

| Opção | Descrição |
|-------|-----------|
| --sim / -y | Confirmar sem prompt |
| --resume | Retomar do checkpoint |
| --continue | Continuar com erros |
| --no-commit | Sem git commit automático |
| --open | Abrir output no browser |
| --project | Projeto alvo |
