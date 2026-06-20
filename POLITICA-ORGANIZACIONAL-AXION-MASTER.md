# 📋 POLÍTICA ORGANIZACIONAL - AXION MASTER

**Data:** 2026-06-20  
**Versão:** 1.0  
**Status:** ✅ APROVADO PARA EXECUÇÃO

---

## 🎯 OBJETIVO

Estabelecer diretrizes claras para consolidação e manutenção de TODOS os projetos Axion em uma estrutura única, organizada e escalável.

---

## 📍 LOCALIZAÇÃO ÚNICA

### **Diretório Mestre**
```
C:\Projects\Axion-Master\
```

✅ **Todos** os projetos devem estar neste local  
❌ **Nenhum** projeto deve estar fora deste local

---

## 🗂️ TAXONOMIA ORGANIZACIONAL

### **1. applications/ - Aplicações Executáveis**

**Definição:** Projetos de software que executam como aplicações.

**Critérios de Inclusão:**
- ✅ Possui `package.json` (Node.js)
- ✅ Pode ser executado (`npm run dev`, `npm start`, etc.)
- ✅ É uma API, frontend, sistema, serviço
- ✅ Tem propósito de execução (não apenas documentação)

**Exemplos:**
- `axion-ia-api/` - Backend API principal
- `axion-ia-panel/` - Frontend React principal
- `helpdesk-universal/` - Sistema HelpDesk
- `script-integracao-universal/` - Scripts de integração

**Estrutura Interna:**
```
applications/
└── nome-aplicacao/
    ├── src/
    ├── package.json
    ├── .env.example
    └── README.md
```

---

### **2. portals/ - Portais de Documentação**

**Definição:** Sites estáticos de documentação gerados por ferramentas.

**Critérios de Inclusão:**
- ✅ É Docusaurus, Writerside, Jekyll, etc.
- ✅ Gera site de documentação
- ✅ Foco em conteúdo técnico/usuário
- ✅ Possui `docs/` ou `topics/`

**Exemplos:**
- `axhub-portal/` - Documentação AxHub (Docusaurus)
- `axton-portal/` - Documentação AxTon (Docusaurus)
- `axcross-portal/` - Documentação AxCross (Docusaurus)
- `documentacao-atualizada/` - Portal Writerside
- `documentacao-helpdesk/` - Docs HelpDesk

**Estrutura Interna:**
```
portals/
└── nome-portal/
    ├── docs/ (ou topics/)
    ├── docusaurus.config.js (ou writerside.cfg)
    └── package.json
```

---

### **3. projects/ - Projetos Específicos**

**Definição:** Projetos com escopo definido (início, meio, fim).

**Critérios de Inclusão:**
- ✅ Tem objetivo específico
- ✅ Auditorias, investigações, POCs
- ✅ Análises pontuais
- ✅ Projetos de tempo limitado

**Exemplos:**
- `auditoria-itscam/` - Auditoria do sistema ITScam
- `investigacao-duplicidade/` - Investigação de duplicidades

**Estrutura Interna:**
```
projects/
└── nome-projeto/
    ├── analise/
    ├── resultados/
    ├── scripts/
    └── README.md
```

---

### **4. documentation/ - Documentação Geral**

**Definição:** Documentos markdown que não pertencem a portais específicos.

**Critérios de Inclusão:**
- ✅ Arquivos `.md` de análises
- ✅ Guias transversais
- ✅ Referências de arquitetura
- ✅ Documentação de negócio

**Subdivisões:**
```
documentation/
├── analysis/
│   ├── technical/        ← ANALISE-*.md
│   └── business/         ← RESUMO-*.md
├── guides/
│   ├── user/            ← Guias de usuário
│   └── developer/       ← GUIA-*.md
└── references/
    ├── architecture/     ← PLANO-*.md, DIAGRAMA-*.md
    └── api-specs/        ← Especificações API
```

**Nomenclatura:**
- Análises técnicas: `ANALISE-DESCRICAO.md`
- Guias: `GUIA-DESCRICAO.md`
- Planos: `PLANO-DESCRICAO.md`
- Diagramas: `DIAGRAMA-DESCRICAO.md`
- Mapeamentos: `MAPEAMENTO-DESCRICAO.md`

---

### **5. data/ - Dados e Base de Conhecimento**

**Definição:** Dados estruturados e bases de conhecimento.

**Critérios de Inclusão:**
- ✅ Knowledge base (embeddings, training)
- ✅ Uploads (imagens, documentos)
- ✅ Exports (relatórios, JSON, CSV)
- ✅ Schemas de banco de dados

**Estrutura:**
```
data/
├── knowledge-base/
│   ├── embeddings/
│   └── training/
├── uploads/
│   ├── images/
│   └── documents/
├── exports/
│   └── reports/
└── databases/
    └── schemas/
```

---

### **6. media/ - Recursos Multimídia**

**Definição:** Arquivos de mídia (vídeos, imagens, screenshots).

**Critérios de Inclusão:**
- ✅ Vídeos (.mp4, .avi, etc.)
- ✅ Imagens (.png, .jpg, etc.)
- ✅ Screenshots
- ✅ GIFs, SVGs

**Estrutura:**
```
media/
├── videos/
│   ├── axton-frames/
│   └── axton-narrado/
├── images/
└── screenshots/
```

---

### **7. resources/ - Recursos Diversos**

**Definição:** Recursos não categorizáveis acima.

**Critérios de Inclusão:**
- ✅ PDFs (manuais, contratos, editais)
- ✅ Planilhas (.xlsx, .csv)
- ✅ Templates (documentos, relatórios)

**Estrutura:**
```
resources/
├── pdfs/
│   ├── manuais/
│   ├── contratos/
│   └── editais/
├── planilhas/
└── templates/
    ├── reports/
    └── documents/
```

---

### **8. scripts/ - Scripts e Ferramentas**

**Definição:** Scripts executáveis para automação.

**Critérios de Inclusão:**
- ✅ Scripts PowerShell (.ps1)
- ✅ Scripts Node.js (.mjs, .js standalone)
- ✅ Scripts Python (.py)
- ✅ Ferramentas de automação

**Estrutura:**
```
scripts/
├── powershell/
├── node/
├── python/
└── automation/
```

---

### **9. config/ - Configurações**

**Definição:** Arquivos de configuração do workspace.

**Critérios de Inclusão:**
- ✅ Variáveis de ambiente
- ✅ Configurações de deployment
- ✅ Scripts de backup

**Estrutura:**
```
config/
├── environments/
│   ├── development/
│   ├── staging/
│   └── production/
├── deployments/
└── backups/
```

---

### **10. archive/ - Arquivos Antigos**

**Definição:** Projetos/arquivos deprecados ou legados.

**Critérios de Inclusão:**
- ✅ Projetos descontinuados
- ✅ Código legado
- ✅ Versões antigas

**Estrutura:**
```
archive/
├── deprecated/
└── legacy/
```

---

## 🔄 PROCESSO DE ADIÇÃO

### **Novo Projeto**

1. **Identificar categoria**
   - Aplicação? → `applications/`
   - Portal de docs? → `portals/`
   - Projeto específico? → `projects/`
   - Docs gerais? → `documentation/`
   - Etc.

2. **Criar pasta no local correto**
   ```powershell
   New-Item -Path "C:\Projects\Axion-Master\applications\novo-projeto" -ItemType Directory
   ```

3. **Seguir nomenclatura**
   - kebab-case (minúsculas com hífen)
   - Nome descritivo e único

4. **Adicionar README.md**
   - Descrever propósito
   - Instruções de uso
   - Dependências

---

## 🚫 REGRAS DE PROIBIÇÃO

### **❌ NÃO PERMITIDO**

1. **Projetos fora de C:\Projects\Axion-Master\**
   - Tudo deve estar centralizado

2. **Duplicações**
   - Apenas uma versão de cada projeto

3. **Arquivos soltos na raiz**
   - Raiz só pode ter:
     - README.md
     - .gitignore
     - LICENSE (se houver)

4. **node_modules versionado**
   - Sempre em .gitignore

5. **Nomes confusos**
   - `axion-ia-painel` ❌ (use `axion-ia-panel`)
   - `projeto1`, `projeto2` ❌ (use nomes descritivos)

---

## ✅ VALIDAÇÃO

### **Checklist de Conformidade**

Antes de commitar:

- [ ] Projeto está em categoria correta?
- [ ] Nome segue kebab-case?
- [ ] README.md presente?
- [ ] Sem node_modules versionado?
- [ ] Sem arquivos temporários?
- [ ] Sem duplicações?
- [ ] .env não versionado?

---

## 📊 MÉTRICAS DE QUALIDADE

### **KPIs de Organização**

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Localização tempo | < 1 min | Tempo para encontrar arquivo |
| Duplicações | 0 | Análise manual |
| Conformidade nomes | 100% | Review PRs |
| Categorização correta | 100% | Auditoria trimestral |

---

## 🔧 MANUTENÇÃO

### **Auditoria Trimestral**

1. Verificar se novos projetos estão na categoria correta
2. Identificar duplicações
3. Mover projetos finalizados para `archive/`
4. Limpar arquivos temporários

### **Backup Mensal**

```powershell
# Backup completo
$backupPath = "D:\Backups\Axion-Master-$(Get-Date -Format 'yyyy-MM')"
Copy-Item -Path "C:\Projects\Axion-Master" -Destination $backupPath -Recurse -Force -Exclude "node_modules","dist","build"
```

---

## 📝 CHANGELOG

### **v1.0 - 2026-06-20**
- ✅ Criação da política organizacional
- ✅ Definição de 10 categorias
- ✅ Estabelecimento de regras
- ✅ Processo de validação

---

## 🎯 APROVAÇÃO

**Preparado por:** Axion IA  
**Data:** 2026-06-20  
**Status:** ✅ **APROVADO PARA EXECUÇÃO**

**Autorização para executar:**
- ✅ Análise completa realizada
- ✅ Estrutura definida e validada
- ✅ Script de migração preparado
- ✅ Política organizacional estabelecida

**Próximo passo:** Executar `.\consolidar-todos-projetos.ps1 -DryRun` para testar
