# 🎯 GUIA COMPLETO: COMO VALIDAR O CUTI - Passo a Passo

## 📋 ÍNDICE RÁPIDO
1. [Fluxo Básico de Uso](#1-fluxo-básico-de-uso)
2. [Gravação de Cenários (LEARN)](#2-gravação-de-cenários-learn)
3. [Execução de Cenários Gravados](#3-execução-de-cenários-gravados)
4. [Validação Automática](#4-validação-automática)
5. [Agendamento de Validações](#5-agendamento-de-validações)
6. [Troubleshooting](#6-troubleshooting)

---

## 1️⃣ FLUXO BÁSICO DE USO

### **VISÃO GERAL DO SISTEMA:**

```
┌─────────────────────────────────────────────────────────┐
│                    CUTI - 3 MODOS                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣ EXECUTAR    →  Validação instantânea               │
│     (Execute)       Testa categorias selecionadas       │
│                    Resultado imediato                   │
│                                                         │
│  2️⃣ GRAVAR      →  Aprendizado de cenários             │
│     (Learn)        Grava interações do usuário          │
│                    Salva para reutilização             │
│                                                         │
│  3️⃣ REPRODUZIR  →  Executa cenário gravado            │
│     (Replay)       Repete fluxo automaticamente        │
│                    Validação completa                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2️⃣ GRAVAÇÃO DE CENÁRIOS (LEARN)

### **PASSO 1: Preparar Sistema**

Antes de gravar, certifique-se:
- ✅ Sistema alvo está acessível (AxHub, AxTon, AxCross)
- ✅ Você sabe o fluxo que vai executar
- ✅ Tem credenciais de acesso

### **PASSO 2: Configurar Gravação**

1. Acesse: http://localhost:3017/cuti

2. Configure os campos:
   ```
   Sistema:     [AxHub]
   Ambiente:    [Produção - Goiânia]
   URL:         https://goiania.axhub.axion.ws
   ```

3. **NÃO selecione categorias ainda** (isso é para validação, não gravação)

4. Clique em **"Gravar Cenário"** (botão vermelho 🔴)

### **PASSO 3: Executar Fluxo**

Depois de clicar em "Gravar Cenário":

```
1. Uma nova aba do navegador será aberta
2. O sistema está GRAVANDO cada ação sua
3. Execute o fluxo normalmente:
   - Faça login
   - Navegue pelo sistema
   - Clique em botões
   - Preencha formulários
   - Consulte dados
   - Faça o que normalmente faria
```

**💡 DICA:** Faça um fluxo completo e representativo (ex: Login → Consulta → Edição → Salvar)

### **PASSO 4: Finalizar Gravação**

1. Volte para a aba do CUTI
2. Clique em **"Parar Gravação"** (botão quadrado ⏹️)
3. Aguarde a mensagem: **"✅ Gravação encerrada!"**

### **PASSO 5: Verificar Cenário Salvo**

O cenário foi salvo em:
```
axion-ia-panel/engine/scenarios/[Sistema] - [Ambiente]/scenario.json
```

Exemplo:
```
axion-ia-panel/engine/scenarios/AxHub - production/scenario.json
```

**Arquivos gerados automaticamente:**
- `scenario.json` - Cenário em formato JSON
- `workflow.json` - Estrutura do workflow
- `test-case.md` - Caso de teste em Markdown
- `bpm-diagram.mmd` - Diagrama BPM em Mermaid
- `procedimento-operacional.md` - Documentação do procedimento

---

## 3️⃣ EXECUÇÃO DE CENÁRIOS GRAVADOS

### **PROBLEMA IDENTIFICADO: Cenários não são listados automaticamente**

**Por que não funciona hoje:**
1. O frontend tenta buscar cenários em `/api/scenarios`
2. A API retorna erro 500 (MongoDB não está configurado)
3. Os cenários existem no disco, mas não no banco

**SOLUÇÃO IMEDIATA: Executar via Histórico de Cenários**

### **MÉTODO 1: Executar via Histórico (Mais Simples)**

**PASSO 1:** Listar cenários disponíveis no disco:

```powershell
# No PowerShell, dentro de axion-ia-panel
Get-ChildItem -Path "engine\scenarios" -Recurse -Filter "scenario.json" | ForEach-Object {
    $content = Get-Content $_.FullName | ConvertFrom-Json
    [PSCustomObject]@{
        Nome = $_.Directory.Name
        Passos = $content.steps.Count
        Caminho = $_.FullName
    }
} | Format-Table -AutoSize
```

**Resultado esperado:**
```
Nome                 Passos Caminho
----                 ------ -------
AxHub - production      64  C:\...\engine\scenarios\AxHub - production\scenario.json
```

**PASSO 2:** Copiar cenário para local acessível pela API:

```powershell
# Copiar cenário para pasta de exemplos
Copy-Item "engine\scenarios\AxHub - production\scenario.json" `
          "engine\scenarios\axhub-login-completo.json"
```

**PASSO 3:** Editar o arquivo copiado e adicionar ID:

```powershell
notepad "engine\scenarios\axhub-login-completo.json"
```

Adicione no início do JSON (se não existir):
```json
{
  "id": "axhub-login-001",
  "name": "Login e Consulta AxHub",
  "description": "Fluxo completo de login e consulta de infrações",
  "system": "AxHub",
  "environment": "production",
  "steps": [
    ...seus passos...
  ]
}
```

### **MÉTODO 2: Executar via API REST (Mais Direto)**

**PASSO 1:** Criar um script PowerShell para executar cenário:

Crie o arquivo: `executar-cenario-gravado.ps1`

```powershell
# ============================================
# EXECUTAR CENÁRIO GRAVADO
# ============================================

param(
    [string]$ScenarioPath = "engine\scenarios\AxHub - production\scenario.json",
    [string]$ApiUrl = "http://localhost:3100"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXECUTAR CENÁRIO GRAVADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ler cenário do disco
if (-not (Test-Path $ScenarioPath)) {
    Write-Host "❌ Cenário não encontrado: $ScenarioPath" -ForegroundColor Red
    exit 1
}

$scenario = Get-Content $ScenarioPath -Raw | ConvertFrom-Json

Write-Host "📋 Cenário: $($scenario.steps.Count) passos" -ForegroundColor Yellow
Write-Host "🎯 Sistema: AxHub" -ForegroundColor Yellow
Write-Host ""

# Preparar payload
$payload = @{
    scenario = $scenario
    environment = "production"
    categories = @("functional", "visual")
} | ConvertTo-Json -Depth 10

# Executar via API
try {
    Write-Host "▶️ Executando cenário..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest `
        -Uri "$ApiUrl/api/scenarios/execute" `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ EXECUÇÃO CONCLUÍDA" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Score: $($result.score)/100" -ForegroundColor Green
    Write-Host "Passos executados: $($result.stepsExecuted)" -ForegroundColor Green
    Write-Host "Duração: $($result.duration)s" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao executar: $_" -ForegroundColor Red
}
```

**PASSO 2:** Executar o script:

```powershell
.\executar-cenario-gravado.ps1
```

---

## 4️⃣ VALIDAÇÃO AUTOMÁTICA (SEM CENÁRIO GRAVADO)

Se você não gravou cenário ainda, pode fazer validação básica:

### **MODO 1: Validação Rápida (Smoke Test)**

```powershell
# Testar se sistema está respondendo
Invoke-WebRequest `
    -Uri "http://localhost:3100/api/cuti/execute" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"system":"AxHub","environment":"production","categories":["functional"],"mode":"single"}' `
    -UseBasicParsing | ConvertFrom-Json | Format-List
```

**Resultado esperado:**
```
status        : success
score         : 100
testsExecuted : 1
testsPassed   : 1
testsFailed   : 0
duration      : 0.01
```

### **MODO 2: Validação Completa (Via Interface)**

1. Acesse http://localhost:3017/cuti

2. Configure:
   - Sistema: **AxHub**
   - Ambiente: **Produção - Goiânia**
   - URL: **https://goiania.axhub.axion.ws**

3. Selecione categorias (clique nos cards):
   - ✅ Funcional
   - ✅ Visual
   - ✅ Performance

4. Clique em **"Executar"** (botão verde ▶️)

5. Aguarde resultado:
   - Score: X/100
   - Testes Aprovados: X
   - Testes Reprovados: X
   - Duração: Xs

---

## 5️⃣ AGENDAMENTO DE VALIDAÇÕES

### **PASSO 1: Acessar Configurações**

1. Abra: http://localhost:3017/cuti
2. Clique no botão **"Configurações"** (roxo, canto superior direito)

### **PASSO 2: Criar Nova Configuração**

1. Clique em **"Nova Configuração"**

2. Preencha:
   ```
   Nome:        Validação Diária AxHub Goiânia
   Descrição:   Validação automática todos os dias às 6h
   ```

3. Configure Agendamento:
   ```
   Tipo:    Diário
   Horário: 06:00
   ```

4. Configure Execução:
   ```
   Sistema:    AxHub
   Ambiente:   Produção - Goiânia
   URL:        https://goiania.axhub.axion.ws
   ```

5. Selecione Categorias:
   - ✅ Funcional
   - ✅ Visual
   - ✅ Performance

6. Configure Notificações:
   ```
   ✅ Ativar notificações
   ✅ Notificar em caso de falha
   
   Email (opcional):
   📧 equipe@axiontecnologia.com.br
   ```

7. Clique em **"Salvar Configuração"**

### **PASSO 3: Ativar Configuração**

- A configuração aparecerá na lista com toggle **ON** (verde)
- Próxima execução será exibida automaticamente

### **PASSO 4: Testar Execução Manual**

- Clique no botão **▶️ Executar agora**
- Aguarde conclusão
- Veja resultado na última execução

---

## 6️⃣ TROUBLESHOOTING

### **PROBLEMA 1: "Erro ao carregar cenários"**

**Causa:** MongoDB não está configurado

**Solução:**
```powershell
# Opção 1: Configurar MongoDB no .env
# Edite: axion-ia-panel/api/.env
MONGODB_URI=mongodb://localhost:27017/axionia

# Opção 2: Usar cenários do disco (método acima)
# Copiar para pasta de exemplos e executar via API
```

### **PROBLEMA 2: "Cenário não encontrado"**

**Causa:** Cenário não foi carregado no sistema

**Solução:**
```powershell
# Listar cenários disponíveis
Get-ChildItem -Path "axion-ia-panel\engine\scenarios" -Recurse -Filter "*.json"

# Copiar para local acessível
Copy-Item "engine\scenarios\AxHub - production\scenario.json" `
          "engine\scenarios\exemplo-001.json"
```

### **PROBLEMA 3: "API retorna 500"**

**Causa:** Rota não está registrada ou MongoDB offline

**Verificação:**
```powershell
# Testar rota básica
Invoke-WebRequest -Uri "http://localhost:3100" -UseBasicParsing | ConvertFrom-Json

# Deve retornar: versao: "4.0", engines: 36
```

**Solução:**
```powershell
# Reiniciar API
cd axion-ia-panel/api
node --env-file=.env src/app.js
```

### **PROBLEMA 4: "Gravação não salva passos"**

**Causa:** Puppeteer não consegue interceptar eventos

**Solução:**
1. Faça ações mais lentas
2. Aguarde carregamento de páginas
3. Evite navegação muito rápida
4. Use Chrome em modo não-headless

### **PROBLEMA 5: "Scheduler não executa automaticamente"**

**Causa:** API precisa estar rodando continuamente

**Solução:**
```powershell
# Manter API rodando em background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd axion-ia-panel/api; node --env-file=.env src/app.js"

# Ou criar serviço Windows (mais avançado)
nssm install AxionIA "node" "C:\path\to\axion-ia-panel\api\src\app.js"
```

---

## 7️⃣ EXEMPLOS PRÁTICOS

### **EXEMPLO 1: Validar Login AxHub**

```powershell
# 1. Gravar cenário de login
# Via interface: Gravar Cenário → Login → Parar

# 2. Executar cenário
cd axion-ia-panel
.\executar-cenario-gravado.ps1 -ScenarioPath "engine\scenarios\AxHub - production\scenario.json"

# 3. Ver resultado
# Score: 100/100
# 64 passos executados
```

### **EXEMPLO 2: Validação Diária Automatizada**

```powershell
# 1. Criar configuração via interface
# http://localhost:3017/cuti/config

# 2. Verificar agendamento
Invoke-WebRequest -Uri "http://localhost:3100/api/automated-validation/scheduler/status" -UseBasicParsing | ConvertFrom-Json

# 3. Executar manualmente (teste)
Invoke-WebRequest -Uri "http://localhost:3100/api/automated-validation/configurations/[ID]/run" -Method POST -UseBasicParsing
```

### **EXEMPLO 3: Monitoramento Contínuo**

```powershell
# Criar script de monitoramento
while ($true) {
    $result = Invoke-WebRequest -Uri "http://localhost:3100/api/cuti/execute" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"system":"AxHub","categories":["functional","performance"]}' `
        -UseBasicParsing | ConvertFrom-Json
    
    if ($result.score -lt 80) {
        Write-Host "⚠️ ALERTA: Score baixo ($($result.score)/100)" -ForegroundColor Red
        # Enviar notificação
    }
    
    Start-Sleep -Seconds 3600  # A cada 1 hora
}
```

---

## 8️⃣ FLUXO COMPLETO RECOMENDADO

### **DIA 1: Setup e Gravação**

```
1. ✅ Iniciar sistema (.\iniciar.ps1)
2. ✅ Acessar CUTI (http://localhost:3017/cuti)
3. ✅ Gravar 3-5 cenários principais:
   - Login + Consulta
   - Edição de dados
   - Geração de relatórios
   - Workflow completo
4. ✅ Verificar cenários salvos
```

### **DIA 2: Validação Manual**

```
1. ✅ Executar cada cenário gravado
2. ✅ Validar score (deve ser 100/100)
3. ✅ Ajustar cenários se necessário
4. ✅ Testar diferentes categorias
```

### **DIA 3: Automação**

```
1. ✅ Criar configurações de agendamento
2. ✅ Testar execução manual
3. ✅ Configurar notificações
4. ✅ Deixar rodando 24/7
```

---

## 9️⃣ CHECKLIST DE VALIDAÇÃO COMPLETA

### **Validação Básica:**
- [ ] Sistema inicia sem erros
- [ ] API responde na porta 3100
- [ ] Panel responde na porta 3017
- [ ] Consegue acessar http://localhost:3017/cuti
- [ ] Botão "Executar" funciona
- [ ] Score é calculado corretamente

### **Validação de Gravação:**
- [ ] Botão "Gravar Cenário" abre nova aba
- [ ] Consegue executar ações no sistema
- [ ] Botão "Parar Gravação" finaliza
- [ ] Cenário é salvo no disco
- [ ] Arquivos JSON/MD são gerados

### **Validação de Execução:**
- [ ] Consegue listar cenários
- [ ] Consegue executar cenário gravado
- [ ] Passos são executados na ordem
- [ ] Validações são aplicadas
- [ ] Relatório é gerado

### **Validação de Agendamento:**
- [ ] Consegue criar configuração
- [ ] Configuração aparece na lista
- [ ] Toggle ON/OFF funciona
- [ ] Execução manual funciona
- [ ] Próxima execução é calculada
- [ ] Scheduler executa automaticamente

---

## 🎯 PRÓXIMOS PASSOS

Agora que você entendeu o fluxo completo:

1. **Teste o EXEMPLO 1 acima** (Validar Login AxHub)
2. **Grave seu primeiro cenário completo**
3. **Execute o cenário gravado**
4. **Crie uma configuração de agendamento**
5. **Deixe rodando e monitore os resultados**

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique logs da API (terminal rodando app.js)
2. Verifique console do navegador (F12)
3. Consulte este guia (seção Troubleshooting)
4. Execute os comandos de diagnóstico abaixo

### **Comandos de Diagnóstico:**

```powershell
# Status da API
Invoke-WebRequest -Uri "http://localhost:3100" -UseBasicParsing

# Listar cenários no disco
Get-ChildItem -Path "axion-ia-panel\engine\scenarios" -Recurse -Filter "*.json"

# Testar execução básica
Invoke-WebRequest -Uri "http://localhost:3100/api/cuti/execute" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"system":"AxHub","categories":["functional"]}' `
    -UseBasicParsing

# Status do scheduler
Invoke-WebRequest -Uri "http://localhost:3100/api/automated-validation/scheduler/status" -UseBasicParsing
```

---

**BOA VALIDAÇÃO! 🚀**
