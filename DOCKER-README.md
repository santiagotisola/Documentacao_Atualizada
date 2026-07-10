# 🐳 AxionIA Ecosystem - Docker

Configuração completa do **AxionIA Ecosystem** usando **Docker** e **Docker Compose**.

## 📋 Pré-requisitos

- **Docker Desktop** instalado
- **Docker Compose** v2.0+
- **Windows 10/11** ou **Linux/macOS**
- Mínimo **8GB RAM** (recomendado: 16GB)
- Mínimo **20GB espaço** em disco

### Instalar Docker Desktop

**Windows/macOS:**
- Download: https://www.docker.com/products/docker-desktop
- Instale e inicie o Docker Desktop

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## 🚀 Início Rápido

### 1. Iniciar Sistema Completo

**Windows (PowerShell):**
```powershell
.\docker-iniciar.ps1
```

**Linux/macOS:**
```bash
docker compose up -d --build
```

### 2. Acessar Aplicação

Aguarde ~30 segundos para inicialização completa, então acesse:

- **AxionIA Panel:** http://localhost:3017
- **AxionIA API:** http://localhost:3100
- **MongoDB:** localhost:27017
- **SQL Server:** localhost:1433

---

## 📦 Serviços Incluídos

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **axion-ia-panel** | 3017 | Frontend React/Vite |
| **axion-ia-api** | 3100 | Backend Node.js/Express |
| **mongodb** | 27017 | Banco MongoDB 7.0 |
| **sqlserver** | 1433 | SQL Server 2022 |
| **axhub-docs** | 3010 | Documentação AxHub (opcional) |
| **axton-docs** | 3011 | Documentação AxTon (opcional) |
| **axcross-docs** | 3012 | Documentação AxCross (opcional) |

---

## 🎛️ Modos de Inicialização

### Modo 1: Serviços Principais (Padrão)

Inicia apenas Panel, API, MongoDB e SQL Server.

```powershell
.\docker-iniciar.ps1
# Escolha: 1
```

Ou diretamente:
```bash
docker compose up -d --build
```

### Modo 2: Sistema Completo (com Documentação)

Inicia todos os serviços incluindo portais de documentação.

```powershell
.\docker-iniciar.ps1
# Escolha: 2
```

Ou diretamente:
```bash
docker compose --profile docs up -d --build
```

---

## 🛠️ Comandos Úteis

### Scripts PowerShell (Windows)

| Script | Descrição |
|--------|-----------|
| `.\docker-iniciar.ps1` | Iniciar sistema |
| `.\docker-parar.ps1` | Parar containers (mantém dados) |
| `.\docker-encerrar.ps1` | Remover containers |
| `.\docker-logs.ps1 <serviço>` | Ver logs |

### Comandos Docker Compose

```bash
# Ver status dos containers
docker compose ps

# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f api
docker compose logs -f panel

# Reiniciar todos os serviços
docker compose restart

# Reiniciar um serviço específico
docker compose restart api

# Parar todos os containers
docker compose stop

# Iniciar containers parados
docker compose start

# Remover containers (mantém volumes)
docker compose down

# Remover containers E volumes (APAGA DADOS)
docker compose down -v

# Rebuild sem cache
docker compose build --no-cache
docker compose up -d --build --force-recreate
```

---

## 🔍 Verificar Saúde dos Serviços

### Health Checks

Todos os serviços possuem health checks automáticos:

```bash
# Ver status de saúde
docker compose ps

# Exemplo de saída:
# NAME                STATUS              PORTS
# axion-ia-panel      Up (healthy)        0.0.0.0:3017->80/tcp
# axion-ia-api        Up (healthy)        0.0.0.0:3100->3100/tcp
# axion-mongodb       Up (healthy)        0.0.0.0:27017->27017/tcp
# axion-sqlserver     Up (healthy)        0.0.0.0:1433->1433/tcp
```

### Testar Endpoints

```bash
# Panel
curl http://localhost:3017

# API Health Check
curl -H "x-api-token: 4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3" \
     http://localhost:3100/api/portal/health

# WhatsApp Status
curl -H "x-api-token: 4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3" \
     http://localhost:3100/api/whatsapp/status
```

---

## 💾 Gerenciamento de Dados

### Volumes Persistentes

Os dados são armazenados em volumes Docker nomeados:

| Volume | Conteúdo |
|--------|----------|
| `axion-mongodb-data` | Dados MongoDB (logs, KB, configs) |
| `axion-mongodb-config` | Configurações MongoDB |
| `axion-sqlserver-data` | Bancos AxHub, AxTon, AxCross |

### Listar Volumes

```bash
docker volume ls | grep axion
```

### Backup de Dados

**MongoDB:**
```bash
# Backup
docker exec axion-mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/axion-ia?authSource=admin" --out=/backup

# Copiar backup para host
docker cp axion-mongodb:/backup ./mongodb-backup
```

**SQL Server:**
```bash
# Backup AxHub
docker exec axion-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Axion@SqlServer2024" -Q "BACKUP DATABASE AxHub TO DISK='/var/opt/mssql/backup/axhub.bak'"

# Copiar backup para host
docker cp axion-sqlserver:/var/opt/mssql/backup/axhub.bak ./axhub-backup.bak
```

### Restaurar Dados

**MongoDB:**
```bash
# Copiar backup para container
docker cp ./mongodb-backup axion-mongodb:/backup

# Restaurar
docker exec axion-mongodb mongorestore --uri="mongodb://admin:admin123@localhost:27017/axion-ia?authSource=admin" /backup
```

**SQL Server:**
```bash
# Copiar backup para container
docker cp ./axhub-backup.bak axion-sqlserver:/var/opt/mssql/backup/

# Restaurar
docker exec axion-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Axion@SqlServer2024" -Q "RESTORE DATABASE AxHub FROM DISK='/var/opt/mssql/backup/axhub.bak' WITH REPLACE"
```

---

## 🔐 Credenciais Padrão

### MongoDB

- **Host:** localhost:27017
- **Usuário:** admin
- **Senha:** admin123
- **Database:** axion-ia

**Connection String:**
```
mongodb://admin:admin123@localhost:27017/axion-ia?authSource=admin
```

### SQL Server

- **Host:** localhost:1433
- **Usuário:** sa
- **Senha:** Axion@SqlServer2024
- **Databases:** AxHub, AxTon, AxCross

**Connection String:**
```
Server=localhost,1433;Database=AxHub;User Id=sa;Password=Axion@SqlServer2024;Encrypt=false;
```

### AxionIA API

- **Token:** `4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3`

**Header:**
```
x-api-token: 4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3
```

---

## 🔧 Configuração Avançada

### Alterar Portas

Edite `docker-compose.yml`:

```yaml
services:
  panel:
    ports:
      - "8080:80"  # Trocar 3017 por 8080
  
  api:
    ports:
      - "8100:3100"  # Trocar 3100 por 8100
```

### Variáveis de Ambiente

Edite `docker-compose.yml` na seção `environment` de cada serviço:

```yaml
api:
  environment:
    OPENAI_API_KEY: "sua-nova-chave"
    JITBIT_URL: "https://seu-helpdesk.com"
    # ... outras variáveis
```

### Adicionar VARCO

Descomente no `docker-compose.yml`:

```yaml
api:
  environment:
    VARCO_EMAIL: "seu-email"
    VARCO_PASSWORD: "sua-senha"
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs api
docker compose logs panel

# Verificar recursos
docker stats

# Reiniciar com rebuild
docker compose down
docker compose up -d --build --force-recreate
```

### Erro "Porta já em uso"

```powershell
# Windows: Liberar porta 3017
Get-Process -Id (Get-NetTCPConnection -LocalPort 3017).OwningProcess | Stop-Process -Force

# Linux: Liberar porta 3017
sudo lsof -ti:3017 | xargs kill -9
```

### Banco de dados não conecta

```bash
# Verificar se SQL Server está saudável
docker compose ps sqlserver

# Testar conexão SQL Server
docker exec axion-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Axion@SqlServer2024" -Q "SELECT @@VERSION"

# Testar conexão MongoDB
docker exec axion-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Reset Completo

```bash
# Parar e remover tudo (incluindo volumes)
docker compose down -v

# Remover imagens antigas
docker images | grep axion | awk '{print $3}' | xargs docker rmi -f

# Rebuild completo
docker compose up -d --build
```

---

## 📊 Monitoramento

### Ver Recursos Utilizados

```bash
# Uso de CPU e memória
docker stats

# Uso específico de um container
docker stats axion-ia-api
```

### Ver Processos

```bash
# Processos em todos os containers
docker compose top

# Processos em um container específico
docker compose top api
```

---

## 🔄 Atualizações

### Atualizar Sistema

```bash
# Pull das imagens base atualizadas
docker compose pull

# Rebuild e restart
docker compose up -d --build
```

### Atualizar Apenas um Serviço

```bash
# Rebuild apenas a API
docker compose build api
docker compose up -d api

# Rebuild apenas o Panel
docker compose build panel
docker compose up -d panel
```

---

## 📝 Estrutura de Arquivos Docker

```
Axion.Docs/
├── docker-compose.yml              # Orquestração principal
├── docker-iniciar.ps1              # Script de inicialização
├── docker-parar.ps1                # Script de parada
├── docker-encerrar.ps1             # Script de remoção
├── docker-logs.ps1                 # Script de logs
├── docker/
│   └── sqlserver-init/
│       └── init-databases.sh       # Script de inicialização SQL
├── axion-ia-panel/
│   ├── Dockerfile                  # Panel (React/Vite + Nginx)
│   ├── .dockerignore               # Arquivos ignorados Panel
│   └── api/
│       ├── Dockerfile              # API (Node.js/Express)
│       └── .dockerignore           # Arquivos ignorados API
├── AxHub/
│   └── Dockerfile                  # Documentação AxHub
├── AxTon/
│   └── Dockerfile                  # Documentação AxTon
└── AxCross/
    └── Dockerfile                  # Documentação AxCross
```

---

## 🌐 Rede Docker

Todos os serviços estão na mesma rede `axion-network`:

```bash
# Ver rede
docker network inspect axion-network

# Containers podem se comunicar pelos nomes:
# - mongodb (MongoDB)
# - sqlserver (SQL Server)
# - api (Backend)
# - panel (Frontend)
```

---

## ✅ Checklist de Validação

Após iniciar o sistema, valide:

- [ ] Panel acessível: http://localhost:3017
- [ ] API respondendo: http://localhost:3100
- [ ] Health check OK: http://localhost:3100/api/portal/health
- [ ] MongoDB conectado: `docker exec axion-mongodb mongosh --eval "db.adminCommand('ping')"`
- [ ] SQL Server conectado: `docker exec axion-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Axion@SqlServer2024" -Q "SELECT 1"`
- [ ] WhatsApp status: Testar endpoint `/api/whatsapp/status`
- [ ] Logs sem erros: `docker compose logs`

---

## 📚 Documentação Adicional

- **Docker Compose:** https://docs.docker.com/compose/
- **Docker Best Practices:** https://docs.docker.com/develop/dev-best-practices/
- **MongoDB Docker:** https://hub.docker.com/_/mongo
- **SQL Server Docker:** https://hub.docker.com/_/microsoft-mssql-server

---

## 🆘 Suporte

Para problemas específicos do Docker:

1. Verificar logs: `docker compose logs -f`
2. Verificar saúde: `docker compose ps`
3. Verificar recursos: `docker stats`
4. Reset completo: `docker compose down -v && docker compose up -d --build`

Para problemas da aplicação:

- Consultar: [VALIDACAO-OPERACIONAL-2026-06-23.md](VALIDACAO-OPERACIONAL-2026-06-23.md)
- Repositório: Axion-Tecnologia/Documentacao_Atualizada

---

**Gerado por:** AxionIA Integration Intelligence Engine v.2.0.0  
**Data:** 2026-06-23  
**Modo:** Docker Configuration Complete
