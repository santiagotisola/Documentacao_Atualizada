# ========================================
# GUIA: Configurar Validação Automática
# ========================================

## 1. AGENDAMENTO MANUAL VIA TASK SCHEDULER

### Passo 1: Abrir o Agendador de Tarefas
1. Pressione `Win + R`
2. Digite: `taskschd.msc`
3. Pressione Enter

### Passo 2: Criar Nova Tarefa
1. Clique em "Criar Tarefa" (no painel direito)
2. Na aba "Geral":
   - Nome: `AxionIA - Validação Automática`
   - Descrição: `Executa cenários de teste automaticamente`
   - Marque: "Executar estando o usuário conectado ou não"
   - Marque: "Executar com privilégios mais altos"

### Passo 3: Configurar Gatilho (Quando Executar)
1. Aba "Gatilhos" → Clique "Novo"
2. Escolha uma opção:
   
   **Opção A - Diário:**
   - Iniciar: Diariamente
   - Horário: 06:00:00
   - Repetir a cada: (deixe em branco para 1x ao dia)
   
   **Opção B - A cada hora (24/7):**
   - Iniciar: Diariamente
   - Horário: 00:00:00
   - Marque: "Repetir tarefa a cada: 1 hora"
   - Durante: 1 dia
   
   **Opção C - Após deploy:**
   - Criar gatilho manual
   - Execute via PowerShell quando fizer deploy

### Passo 4: Configurar Ação (O que Executar)
1. Aba "Ações" → Clique "Novo"
2. Ação: Iniciar um programa
3. Programa/script: `powershell.exe`
4. Adicionar argumentos:
   ```
   -ExecutionPolicy Bypass -File "C:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\executar-cenarios-diarios.ps1"
   ```
5. Iniciar em: `C:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel`

### Passo 5: Configurações Adicionais
1. Aba "Condições":
   - Desmarque: "Iniciar tarefa somente se o computador estiver conectado à energia CA"
   - Marque: "Ativar tarefa se ignorada"
   
2. Aba "Configurações":
   - Marque: "Permitir que a tarefa seja executada sob demanda"
   - Marque: "Executar tarefa assim que possível após a perda de um agendamento"
   - Se a tarefa falhar, reiniciar a cada: 1 minuto
   - Tentar reiniciar até: 3 vezes

3. Clique "OK"

---

## 2. AGENDAMENTO RÁPIDO VIA POWERSHELL

Execute este comando como Administrador:

```powershell
# Criar tarefa agendada
$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\executar-cenarios-diarios.ps1" `
    -WorkingDirectory "C:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel"

$trigger = New-ScheduledTaskTrigger -Daily -At 6am

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

Register-ScheduledTask `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -TaskName "AxionIA - Validação Automática" `
    -Description "Executa cenários de teste automaticamente todos os dias às 6h" `
    -User $env:USERNAME `
    -RunLevel Highest `
    -Force
```

**Verificar se foi criada:**
```powershell
Get-ScheduledTask -TaskName "AxionIA*"
```

**Executar manualmente (teste):**
```powershell
Start-ScheduledTask -TaskName "AxionIA - Validação Automática"
```

**Ver histórico de execuções:**
```powershell
Get-ScheduledTask -TaskName "AxionIA*" | Get-ScheduledTaskInfo
```

**Remover (se necessário):**
```powershell
Unregister-ScheduledTask -TaskName "AxionIA - Validação Automática" -Confirm:$false
```

---

## 3. INTEGRAÇÃO COM CI/CD (GitHub Actions)

Crie o arquivo `.github/workflows/automated-tests.yml`:

```yaml
name: Validação Automática AxionIA

on:
  schedule:
    - cron: '0 6 * * *'  # Diariamente às 6h UTC
  push:
    branches: [ main, develop ]  # Após cada commit
  workflow_dispatch:  # Execução manual

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Instalar dependências
      run: |
        cd axion-ia-panel/api
        npm install
    
    - name: Iniciar API
      run: |
        cd axion-ia-panel/api
        node --env-file=.env src/app.js &
        sleep 10
    
    - name: Executar Cenários de Teste
      run: |
        curl -X POST http://localhost:3100/api/scenarios/scenario-001/execute \
          -H "Content-Type: application/json" \
          -d '{"categories": ["functional", "visual", "performance"]}'
    
    - name: Notificar Resultado
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: '❌ Testes automáticos falharam!'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 4. MONITORAMENTO E NOTIFICAÇÕES

### A. Enviar Email ao Falhar

Adicione ao final do script `executar-cenarios-diarios.ps1`:

```powershell
# Configurar email
$EmailFrom = "axionia@axiontecnologia.com.br"
$EmailTo = "equipe@axiontecnologia.com.br"
$SMTPServer = "smtp.gmail.com"
$SMTPPort = 587

if ($falhas -gt 0) {
    Send-MailMessage `
        -From $EmailFrom `
        -To $EmailTo `
        -Subject "❌ ALERTA: Validação Automática Falhou" `
        -Body "Foram detectadas $falhas falhas nos testes automáticos. Verifique os logs." `
        -SmtpServer $SMTPServer `
        -Port $SMTPPort `
        -UseSsl `
        -Credential (Get-Credential)
}
```

### B. Enviar Notificação via Telegram

```powershell
$TelegramBotToken = "SEU_BOT_TOKEN"
$TelegramChatId = "SEU_CHAT_ID"

$message = "✅ Validação automática concluída com sucesso! Score: 100/100"

Invoke-WebRequest `
    -Uri "https://api.telegram.org/bot$TelegramBotToken/sendMessage" `
    -Method POST `
    -Body @{
        chat_id = $TelegramChatId
        text = $message
    }
```

### C. Integrar com Slack

```powershell
$SlackWebhook = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

$payload = @{
    text = "✅ Validação Automática AxionIA"
    attachments = @(
        @{
            color = "good"
            fields = @(
                @{
                    title = "Score"
                    value = "100/100"
                    short = $true
                }
                @{
                    title = "Testes Executados"
                    value = "12/12 ✅"
                    short = $true
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest `
    -Uri $SlackWebhook `
    -Method POST `
    -ContentType "application/json" `
    -Body $payload
```

---

## 5. DASHBOARD DE MONITORAMENTO

### Criar arquivo `monitor-validacoes.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Monitor de Validações - AxionIA</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #4caf50; font-weight: bold; }
        .failed { color: #f44336; font-weight: bold; }
        .score { font-size: 48px; text-align: center; }
    </style>
</head>
<body>
    <h1>🎯 Monitor de Validações Automáticas - AxionIA</h1>
    
    <div class="card">
        <h2>Última Execução</h2>
        <p>Data/Hora: <span id="lastExecution">Carregando...</span></p>
        <p>Status: <span id="status" class="success">✅ SUCESSO</span></p>
        <div class="score" id="score">100/100</div>
    </div>
    
    <div class="card">
        <h2>Estatísticas (Últimos 7 dias)</h2>
        <p>Execuções: <span id="totalExecutions">42</span></p>
        <p>Taxa de Sucesso: <span id="successRate" class="success">98.5%</span></p>
        <p>Tempo Médio: <span id="avgTime">12.3s</span></p>
    </div>
    
    <script>
        // Atualizar dados a cada 30 segundos
        setInterval(async () => {
            const response = await fetch('http://localhost:3100/api/orchestrator/status');
            const data = await response.json();
            
            document.getElementById('lastExecution').textContent = new Date(data.lastExecution).toLocaleString('pt-BR');
            document.getElementById('score').textContent = `${data.score}/100`;
            
            if (data.status === 'success') {
                document.getElementById('status').textContent = '✅ SUCESSO';
                document.getElementById('status').className = 'success';
            } else {
                document.getElementById('status').textContent = '❌ FALHA';
                document.getElementById('status').className = 'failed';
            }
        }, 30000);
    </script>
</body>
</html>
```

---

## 6. BOAS PRÁTICAS

### ✅ Recomendações:

1. **Execute testes em horários de baixo movimento**
   - Madrugada: 2h-6h
   - Evite horário comercial

2. **Mantenha histórico de execuções**
   - Salve logs com data/hora
   - Guarde screenshots de falhas
   - Compare resultados ao longo do tempo

3. **Configure alertas apenas para falhas**
   - Não envie notificação quando sucesso
   - Alerte apenas quando algo quebrar
   - Inclua contexto do erro

4. **Versione seus cenários**
   - Use Git para controlar alterações
   - Tag cenários por versão do sistema
   - Mantenha cenários antigos para rollback

5. **Documente cenários críticos**
   - Nome descritivo
   - Descrição do fluxo
   - Por que é importante
   - O que valida

---

## 7. TROUBLESHOOTING

### Problema: Script não executa
**Solução:**
```powershell
# Habilitar execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema: API não responde
**Solução:**
```powershell
# Verificar se API está rodando
Test-NetConnection -ComputerName localhost -Port 3100

# Se não estiver, iniciar
cd axion-ia-panel/api
node --env-file=.env src/app.js
```

### Problema: Cenário não encontrado
**Solução:**
```powershell
# Listar cenários disponíveis
curl -UseBasicParsing http://localhost:3100/api/scenarios

# Verificar se arquivo existe
Test-Path "axion-ia-panel\engine\scenarios\*.json"
```

---

## 🎯 RESUMO RÁPIDO

**Para agendar validação diária:**
```powershell
# 1. Abrir Task Scheduler
taskschd.msc

# 2. Criar tarefa apontando para:
C:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\executar-cenarios-diarios.ps1

# 3. Agendar horário (ex: 6h)

# 4. Testar manualmente
Start-ScheduledTask -TaskName "AxionIA - Validação Automática"
```

**Pronto! Sistema validando automaticamente! 🚀**
