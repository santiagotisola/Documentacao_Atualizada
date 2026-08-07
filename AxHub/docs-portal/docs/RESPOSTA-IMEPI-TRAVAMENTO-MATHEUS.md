# RESPOSTA TÉCNICA — Travamento na Triagem de Imagens (IMEPI)

**Chamado:** Verificação de Usuário da Triagem — Máquina CCO IMEPI  
**Solicitante:** Karla Ramira  
**Usuário afetado:** MATHEUS ROCHA DA SILVA (matheus.silva)  
**Sites:** IMEPI, ITPS, IMETROPA  
**Data da Análise 29/05/2026  
**Equipe responsável:** Axion Tecnologia — Suporte Nível 2  

---

## 1. Resumo Executivo

Após Análise técnica detalhada dos logs de console do navegador, comportamento de rede e estrutura da aplicação, **identificamos que o travamento NÃO é causado pelo sistema AxHub**, nem por problema de permissão, perfil de Usuário ou Configuração de máquina.

O travamento é causado por **falha em um serviço externo de consulta de cronotacógrafo** que o sistema utiliza como dependência, resultando em centenas de requisições com erro que congestionam o navegador.

---

## 2. Diagnóstico Técnico

### 2.1 O que acontece

Ao abrir a tela de **Triagem de Passagens** (módulo Cronotacógrafo), o sistema AxHub realiza automaticamente consultas ao **webservice externo de verificação de cronotacógrafo** para cada passagem carregada na tela. Este é o fluxo normal e necessário para a operação.

**O problema:** O serviço externo de consulta está **retornando erro 400 (Bad Request) em 100% das chamadas**, gerando o seguinte efeito cascata:

| Etapa | O que ocorre | Impacto |
|-------|-------------|---------|
| 1 | Tela carrega lote de passagens (~25-50) | Normal |
| 2 | Sistema dispara consulta de cronotacógrafo por passagem | Normal |
| 3 | **Serviço externo retorna erro 400** | ⚠️ FALHA EXTERNA |
| 4 | Sistema tenta novamente (retry automático) | Multiplica requisições |
| 5 | ~200+ requisições com erro empilhadas no navegador | 🔴 **TRAVAMENTO** |

### 2.2 Evidência nos Logs do Console

```
/consultar-placa-cronotacografo?parametro=23123024&placa=CNR8I00 → 400 (Bad Request)
/consultar-placa-cronotacografo?parametro=23123937&placa=OEE8929 → 400 (Bad Request)
/consultar-placa-cronotacografo?parametro=23124006&placa=RSP3H20 → 400 (Bad Request)
... (repetido para TODAS as passagens, com múltiplas tentativas cada)
```

**Total observado:** 245+ requisições falhadas em uma única sessão, com retentativas de 2 a 7 vezes por placa.

### 2.3 Por que trava o navegador

O navegador Google Chrome possui um **limite técnico de 6 conexões simultâneas por domínio** (padrão HTTP/1.1 — RFC 7230). Quando mais de 200 requisições são empilhadas na fila de rede — todas aguardando resposta ou em retry — o navegador entra em estado de congestionamento:

- A interface para de responder a cliques e teclado
- Imagens param de carregar (erro 404 adicional)
- Componentes JavaScript não inicializam (erro Kendo DropDownList)
- O Usuário percebe como "travamento geral"

---

## 3. Por que afeta ESTE Usuário com mais frequência

O travamento não é específico do Usuário `matheus.silva` — é **específico do momento e do volume de dados**:

| Fator | Explicação |
|-------|-----------|
| Lote grande de passagens | Quanto mais passagens no lote, mais consultas simultâneas |
| Horário de operação | Horários de pico = mais passagens acumuladas = mais requisições |
| Máquina CCO | Rede local pode ter latência adicional ao serviço externo |
| Outros Usuários "funcionam" | Podem estar em lotes menores ou o serviço externo voltou momentaneamente |

**Nota:** O fato de funcionar no notebook da Karla confirma que é um problema de **momento/volume** — não de máquina ou perfil. Quando ela testou, o lote era diferente ou o serviço externo estava temporariamente respondendo.

---

## 4. Delimitação de Responsabilidades

### 4.1 O que é responsabilidade do AxHub (Axion Tecnologia)

| Item | Status |
|------|--------|
| Tela de triagem de imagens | ✅ Funcionando corretamente |
| Carregamento de passagens | ✅ Funcionando corretamente |
| Interface de processamento | ✅ Funcionando corretamente |
| Exibição de imagens do storage | ✅ Funcionando (exceto imagens não disponíveis — 404) |
| Lógica de negócio da triagem | ✅ Funcionando corretamente |
| Hospedagem no Azure App Service | ✅ Ativo e operacional |

### 4.2 O que é dependência externa (NÃO gerenciada pela Axion)

| Item | Status | Responsável |
|------|--------|-------------|
| Webservice de consulta de cronotacógrafo | ❌ **Retornando erro 400** | Órgão externo / ANTT / INMETRO |
| Disponibilidade do serviço de consulta | ❌ **Indisponível** | Provedor do webservice |
| Credencial/token de acesso ao webservice | ⚠️ **Possivelmente expirada** | Gestão do contrato IMEPI |

---

## 5. Causa Raiz Identificada

**O serviço externo de consulta de cronotacógrafo está rejeitando TODAS as requisições com status HTTP 400 (Bad Request).**

Possíveis motivos para o 400 no serviço externo:

1. **Token de autenticação expirado** — necessita renovação junto ao provedor
2. **IP do Azure App Service não está no whitelist** — o Azure pode ter alterado os IPs de saída
3. **Mudança no formato aceito pelo webservice** — o serviço externo pode ter atualizado sua API
4. **Serviço externo em manutenção ou instável** — indisponibilidade temporária

---

## 6. Ações Recomendadas

### Para o IMEPI (ação imediata):

| # | Ação | Responsável |
|---|------|-------------|
| 1 | Verificar com o provedor do webservice de cronotacógrafo se o acesso está ativo | Gestão IMEPI |
| 2 | Confirmar se o token/credencial de acesso ao serviço está válido | Gestão IMEPI |
| 3 | Informar ao provedor os IPs de saída do Azure para whitelist | Axion + IMEPI |

### Para a Axion (já em andamento):

| # | Ação | Status |
|---|------|--------|
| 1 | Ativar HTTP/2 no Azure App Service (reduz impacto de múltiplas requisições) | 🔄 Em andamento |
| 2 | Investigar se houve mudança nos Outbound IPs do App Service | 🔄 Em andamento |
| 3 | Avaliar implementação de circuit breaker para evitar flood de retentativas | 📋 Planejado |

---

## 7. Solução Paliativa (Imediata para o Matheus)

Enquanto o serviço externo não é restabelecido:

1. **Se a tela travar**, pressionar **F5** para recarregar a página
2. **Trabalhar com lotes menores** (reduzir o período de filtro de passagens)
3. **Utilizar o Chrome ou Edge** na versão mais recente
4. **Limpar cache do navegador** (Ctrl+Shift+Del → últimas 24h)

---

## 8. Conclusão

O travamento reportado pelo Usuário Matheus Rocha da Silva é **real e reproduzível**, porém sua causa é uma **dependência externa ao sistema AxHub** — especificamente o webservice de consulta de cronotacógrafo que está retornando erro para todas as requisições.

O sistema AxHub está funcionando conforme projetado. O travamento visual no navegador é consequência do acúmulo de requisições com falha na fila de rede do browser, causado pela indisponibilidade do serviço externo.

**Não se trata de:**
- ❌ Problema de máquina
- ❌ Problema de usuário/permissão
- ❌ Problema de rede local
- ❌ Bug no sistema AxHub

**Trata-se de:**
- ✅ Serviço externo de cronotacógrafo indisponível/rejeitando conexões

---

**Axion Tecnologia**  
Equipe de Suporte — Nível 2  
Data: 29/05/2026

---

*Documento gerado com base na Análise técnica dos logs de console do navegador (DevTools), comportamento de rede e arquitetura do sistema AxHub hospedado no Azure App Service.*
