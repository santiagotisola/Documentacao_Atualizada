# 🚀 GUIA DE IMPLEMENTAÇÃO — ODOO HELPDESK + AXION IA

**Objetivo:** Implementar Odoo Community + Módulos Axion IA em 8 semanas  
**Base:** [CONSOLIDACAO-PROJETO-HELPDESK-COMPLETA.md](CONSOLIDACAO-PROJETO-HELPDESK-COMPLETA.md)  
**Data:** 14/06/2026

---

## 📋 PRÉ-REQUISITOS

### ✅ Infraestrutura Mínima
- **Servidor:** 2 vCPUs, 4GB RAM, 40GB SSD
- **OS:** Ubuntu 22.04 LTS ou Docker
- **Database:** PostgreSQL 14+
- **Python:** 3.10+
- **Node.js:** 18+ (para módulos Axion)

### ✅ Acessos Necessários
- [ ] Domínio/subdomínio (ex: helpdesk.axiontecnologia.com.br)
- [ ] Meta Cloud API WhatsApp (Business Account)
- [ ] OpenAI API Key (GPT-4)
- [ ] Servidor SMTP (email)
- [ ] Acesso Jitbit (migração dados)

---

## 📅 CRONOGRAMA DETALHADO

### **SEMANA 1: Setup Odoo Community**

#### Dia 1-2: Instalação Odoo
```bash
# Opção 1: Docker (recomendado)
docker run -d -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo \
  -e POSTGRES_DB=postgres --name db postgres:14

docker run -d -p 8069:8069 --name odoo --link db:db \
  -e HOST=db -e USER=odoo -e PASSWORD=odoo \
  odoo:17.0

# Opção 2: Ubuntu direto
wget -q -O - https://nightly.odoo.com/odoo.key | sudo gpg --dearmor -zo /usr/share/keyrings/odoo-archive-keyring.gpg
echo 'deb [signed-by=/usr/share/keyrings/odoo-archive-keyring.gpg] https://nightly.odoo.com/17.0/nightly/deb/ ./' | sudo tee /etc/apt/sources.list.d/odoo.list
sudo apt update && sudo apt install odoo -y
```

#### Dia 3: Configuração Inicial
- [ ] Criar database `axion_helpdesk`
- [ ] Configurar idioma PT-BR
- [ ] Instalar módulo **Helpdesk**
- [ ] Configurar usuários/permissões
- [ ] Criar equipes de suporte (Técnico, Comercial, Financeiro)

#### Dia 4-5: Customização Visual
- [ ] Logo Axion
- [ ] Cores corporativas
- [ ] Criar categorias de tickets
- [ ] Configurar SLA policies básicas
- [ ] Templates de email

**Entregável:** Odoo funcionando com Helpdesk básico

---

### **SEMANA 2: Migração Jitbit → Odoo**

#### Dia 1-2: Exportação Jitbit
```python
# Script: export_jitbit.py
import requests
import json

JITBIT_URL = "https://desk.axiontecnologia.com.br"
JITBIT_USER = "admin"
JITBIT_PASS = "senha"

# Exportar tickets
tickets = requests.get(
    f"{JITBIT_URL}/api/Tickets",
    auth=(JITBIT_USER, JITBIT_PASS)
).json()

with open('jitbit_tickets.json', 'w') as f:
    json.dump(tickets, f, indent=2)

# Exportar usuários
users = requests.get(
    f"{JITBIT_URL}/api/Users",
    auth=(JITBIT_USER, JITBIT_PASS)
).json()

with open('jitbit_users.json', 'w') as f:
    json.dump(users, f, indent=2)
```

#### Dia 3-4: Importação Odoo
```python
# Script: import_to_odoo.py
import xmlrpc.client
import json

ODOO_URL = "http://localhost:8069"
ODOO_DB = "axion_helpdesk"
ODOO_USER = "admin"
ODOO_PASS = "admin"

# Conectar Odoo
common = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/common")
uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
models = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/object")

# Importar tickets
with open('jitbit_tickets.json') as f:
    jitbit_tickets = json.load(f)

for ticket in jitbit_tickets:
    ticket_id = models.execute_kw(
        ODOO_DB, uid, ODOO_PASS,
        'helpdesk.ticket', 'create', [{
            'name': ticket['Subject'],
            'description': ticket['Body'],
            'priority': '1' if ticket['Priority'] >= 2 else '0',
            'partner_email': ticket['UserEmail'],
            'create_date': ticket['Updated'],
        }]
    )
    print(f"Ticket {ticket['IssueID']} → Odoo #{ticket_id}")
```

#### Dia 5: Validação
- [ ] Conferir total tickets (Jitbit vs Odoo)
- [ ] Verificar anexos
- [ ] Validar histórico
- [ ] Testar busca

**Entregável:** Tickets históricos no Odoo

---

### **SEMANAS 3-4: Integração Motor IA Axion**

#### Arquitetura Módulo Odoo
```
axion_ia_helpdesk/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── helpdesk_ticket.py      # Extensão modelo ticket
│   └── ai_classifier.py         # Classificador IA
├── services/
│   ├── openai_service.py       # Integração OpenAI
│   └── knowledge_base.py       # KB RAG
├── controllers/
│   └── webhook.py              # Webhook WhatsApp
├── views/
│   ├── helpdesk_ticket_views.xml
│   └── ai_suggestions.xml
├── data/
│   └── kb.json                 # Base conhecimento
└── security/
    └── ir.model.access.csv
```

#### Dia 1-3: Desenvolver Módulo
```python
# models/helpdesk_ticket.py
from odoo import models, fields, api
import openai

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    ai_classification = fields.Char('Classificação IA')
    ai_confidence = fields.Float('Confiança IA')
    ai_suggestion = fields.Text('Sugestão IA')

    @api.model
    def create(self, vals):
        ticket = super().create(vals)
        
        # Classificar com IA
        classification = self._classify_ai(ticket.description)
        ticket.write({
            'ai_classification': classification['category'],
            'ai_confidence': classification['confidence'],
            'ai_suggestion': classification['suggestion']
        })
        
        # Auto-responder se confiança >= 85%
        if classification['confidence'] >= 0.85:
            ticket.message_post(
                body=classification['suggestion'],
                message_type='comment',
                subtype_xmlid='mail.mt_note'
            )
            ticket.stage_id = self.env.ref('helpdesk.stage_solved')
        
        return ticket

    def _classify_ai(self, text):
        openai.api_key = self.env['ir.config_parameter'].get_param('axion.openai_key')
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Você é um assistente de helpdesk..."},
                {"role": "user", "content": text}
            ]
        )
        
        return {
            'category': response.choices[0].message.category,
            'confidence': response.choices[0].message.confidence,
            'suggestion': response.choices[0].message.content
        }
```

#### Dia 4-5: Testes
- [ ] Testar classificação manual (10 tickets)
- [ ] Validar auto-resposta (confiança ≥85%)
- [ ] Testar sugestão agente (65-84%)
- [ ] Métricas de acurácia

**Entregável:** Módulo IA funcionando

---

### **SEMANA 5: WhatsApp Meta Cloud API**

#### Dia 1-2: Setup Meta Cloud
1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Crie App WhatsApp Business
3. Configure Webhook URL: `https://helpdesk.axion.com.br/api/whatsapp/webhook`
4. Obtenha Token Permanente
5. Adicione número de telefone verificado

#### Dia 3-4: Módulo WhatsApp Odoo
```python
# controllers/whatsapp_webhook.py
from odoo import http
import json

class WhatsAppWebhook(http.Controller):
    
    @http.route('/api/whatsapp/webhook', type='json', auth='public', csrf=False)
    def webhook(self):
        data = json.loads(http.request.httprequest.data)
        
        # Verificação Meta
        if http.request.httprequest.method == 'GET':
            mode = http.request.params.get('hub.mode')
            token = http.request.params.get('hub.verify_token')
            challenge = http.request.params.get('hub.challenge')
            
            if mode == 'subscribe' and token == 'AXION_VERIFY_TOKEN':
                return int(challenge)
        
        # Processar mensagem
        if 'messages' in data['entry'][0]['changes'][0]['value']:
            message = data['entry'][0]['changes'][0]['value']['messages'][0]
            
            # Criar ticket no Odoo
            ticket_id = http.request.env['helpdesk.ticket'].sudo().create({
                'name': f"WhatsApp - {message['from']}",
                'description': message['text']['body'],
                'partner_phone': message['from'],
                'channel': 'whatsapp'
            })
            
            return {'status': 'ok', 'ticket_id': ticket_id.id}
```

#### Dia 5: Testes
- [ ] Enviar mensagem WA → Criar ticket
- [ ] Ticket → Responder via WA
- [ ] Anexos (imagens)
- [ ] Templates mensagem

**Entregável:** WhatsApp integrado

---

### **SEMANAS 6-7: Portal Self-Service**

#### Dia 1-3: Configurar Portal Odoo
- [ ] Ativar módulo **Portal**
- [ ] Customizar template portal
- [ ] Criar página "Meus Tickets"
- [ ] Formulário abertura ticket
- [ ] KB pública (FAQs)

#### Dia 4-7: Customização Visual
```xml
<!-- views/portal_templates.xml -->
<template id="portal_my_tickets" name="My Tickets">
    <t t-call="portal.portal_layout">
        <div class="container">
            <h1>Meus Chamados</h1>
            <table class="table">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Assunto</th>
                        <th>Status</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    <t t-foreach="tickets" t-as="ticket">
                        <tr>
                            <td><t t-esc="ticket.id"/></td>
                            <td><t t-esc="ticket.name"/></td>
                            <td><t t-esc="ticket.stage_id.name"/></td>
                            <td><t t-esc="ticket.create_date"/></td>
                        </tr>
                    </t>
                </tbody>
            </table>
        </div>
    </t>
</template>
```

**Entregável:** Portal cliente funcional

---

### **SEMANA 8: Testes + Ajustes**

#### Dia 1-2: Testes Funcionais
- [ ] Criar ticket (todos canais)
- [ ] Atribuir agente
- [ ] Responder ticket
- [ ] Escalar/transferir
- [ ] Fechar ticket
- [ ] Reabrir ticket

#### Dia 3-4: Testes de Integração
- [ ] IA classificação
- [ ] Auto-resposta ≥85%
- [ ] WhatsApp bidirecional
- [ ] Portal cliente
- [ ] Notificações email

#### Dia 5: Go-Live
- [ ] Backup Jitbit (última vez)
- [ ] Redirecionar emails → Odoo
- [ ] WhatsApp → Odoo
- [ ] Comunicar equipe
- [ ] Monitorar 24h

**Entregável:** Sistema em produção ✅

---

## 📊 KPIs PÓS GO-LIVE

### Semana 1 Pós-Produção
- [ ] Taxa auto-resposta IA: **objetivo 60%+**
- [ ] Tempo médio primeira resposta: **< 2h**
- [ ] Tempo médio resolução: **< 24h**
- [ ] CSAT: **> 80%**
- [ ] Tickets criados: monitorar volume

### Mês 1 Pós-Produção
- [ ] Redução custo operacional: **objetivo -30%**
- [ ] Deflection rate (KB): **objetivo 20%+**
- [ ] SLA compliance: **objetivo 95%+**
- [ ] ROI vs Jitbit: calcular

---

## 🆘 TROUBLESHOOTING

### Problema: IA não está classificando
**Solução:**
```bash
# Verificar logs Odoo
tail -f /var/log/odoo/odoo-server.log

# Testar OpenAI API
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "test"}]}'
```

### Problema: WhatsApp não recebe mensagens
**Solução:**
1. Verificar webhook Meta: `https://developers.facebook.com/apps/`
2. Testar webhook: `curl -X POST https://helpdesk.axion.com.br/api/whatsapp/webhook`
3. Verificar token: `hub.verify_token` correto?

### Problema: Portal lento
**Solução:**
```bash
# Otimizar PostgreSQL
sudo -u postgres psql
ALTER DATABASE axion_helpdesk SET work_mem = '256MB';
REINDEX DATABASE axion_helpdesk;
VACUUM ANALYZE;
```

---

## 📚 RECURSOS

- 📖 [Odoo Documentation](https://www.odoo.com/documentation/17.0/)
- 📖 [Helpdesk Module](https://www.odoo.com/documentation/17.0/applications/services/helpdesk.html)
- 💬 [Odoo Forum](https://www.odoo.com/forum/help-1)
- 🎥 [Odoo Academy](https://www.odoo.com/slides)
- 🛠️ [GitHub Odoo](https://github.com/odoo/odoo)
- 📡 [Meta Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

## ✅ CHECKLIST FINAL

Antes do Go-Live, confirme:

- [ ] ✅ Odoo instalado e configurado
- [ ] ✅ Tickets Jitbit migrados
- [ ] ✅ Motor IA Axion integrado
- [ ] ✅ WhatsApp funcionando
- [ ] ✅ Portal cliente acessível
- [ ] ✅ SLA policies configuradas
- [ ] ✅ Equipe treinada
- [ ] ✅ Backup funcionando
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Plano rollback pronto

**Status:** ☐ Pendente | ☑️ Concluído

---

**Responsável Implementação:** _____________  
**Data Início:** __/__/____  
**Data Go-Live:** __/__/____  
**Aprovado por:** _____________
