# Resposta à Portaria de Diligência — CGM
**Referência:** Solicitação de Dados para Atendimento à Portaria de Diligência  
**Sistema:** AxHub — Sistema de Gestão de Equipamentos de Trânsito  
**Data de Emissão:** 06 de maio de 2026  
**Elaborado por:** Axion Tecnologia

---

## Apresentação

Em atendimento à diligência encaminhada pela Controladoria Geral do Município (CGM), a Axion Tecnologia apresenta, a seguir, as informações técnicas solicitadas relativas ao sistema **AxHub**, detalhando os mecanismos implementados para cada item requerido.

---

## Item 1 — Sincronização de Relógio (GPS/NTP)

**Status: OPERACIONAL**

A sincronização de tempo dos equipamentos de fiscalização (radares, câmeras, lombadas eletrônicas) é de responsabilidade do **firmware embarcado em cada equipamento**, homologado e certificado pelo INMETRO, conforme exigência da Resolução CONTRAN nº 396/2011.

O AxHub atua como **receptor e registrador** dos dados enviados pelos equipamentos, preservando a data e hora exata de cada evento conforme transmitido pelo dispositivo:

- O campo `DataHoraPassagem` (tabela `TBPassagens`) registra o timestamp enviado diretamente pelo equipamento, sem qualquer alteração pelo sistema.
- O campo `DataHoraInfracao` (tabela `TBInfracoes`) preserva o momento da detecção registrado pelo hardware.
- O AxHub não interpola, ajusta ou corrige timestamps — o horário registrado é sempre o do equipamento, garantindo a cadeia de custódia do dado original.

**Evidência complementar:** O controle de aferições (`TBAfericoes`) registra o número de lacre INMETRO, certificado e datas de validade de cada equipamento. Equipamentos com aferição vencida são bloqueados automaticamente pelo sistema — não geram infrações válidas.

| Componente | Responsável | Evidência |
|------------|-------------|-----------|
| Sincronização GPS/NTP no equipamento | Fabricante homologado (INMETRO) | Certificado de Aferição |
| Preservação do timestamp no AxHub | Axion Tecnologia | Campos `DataHoraPassagem` / `DataHoraInfracao` em banco |
| Auditabilidade do horário | Axion Tecnologia | Tabela `TBHistoricoTriagens` — log de cada ação com data/hora |

---

## Item 2 — Criptografia de Imagens e Dados (Software de Descriptografia Restrito)

**Status: ATIVO**

O AxHub implementa múltiplas camadas de proteção criptográfica:

### 2.1 Autenticação de Fabricantes por Token Criptografado

Cada fabricante de equipamento possui um **token de API único** cadastrado no sistema (`TBFabricantes`, campo `Token`). Este token é:

- Gerado criptograficamente pelo sistema.
- Exigido em cada transmissão de dados (passagens e imagens) pelo equipamento ao AxHub.
- A qualquer momento o órgão pode **gerar novo token**, invalidando imediatamente o anterior — bloqueio instantâneo de transmissões não autorizadas.
- **Sem token válido, nenhum equipamento consegue enviar dados ao sistema.**

### 2.2 Imagem Criptografada na Transmissão

O campo `Imagem Criptografada` na configuração de fabricantes (`TBFabricantes`) indica que as imagens transmitidas pelos equipamentos chegam ao AxHub em formato criptografado, com descriptografia restrita ao servidor do sistema. Operadores e analistas acessam apenas a imagem renderizada — nunca o arquivo binário criptografado original.

### 2.3 Assinatura Digital no Lote de Exportação

Ao gerar um lote para envio ao órgão autuador, o sistema **cria automaticamente um hash de assinatura digital** do arquivo gerado. Este hash:

- Permite que o órgão receptor verifique a integridade do lote após o recebimento.
- Qualquer alteração no arquivo após a geração invalida a assinatura — tornando a adulteração detectável.
- Apenas lotes com assinaturas válidas de triagem e auditoria são aceitos para exportação.

### 2.4 Comunicação Segura

O acesso ao AxHub exige autenticação por login e senha. O controle de acesso por IP (`TBAcessoPorIps`) restringe o acesso ao sistema por endereço de rede, com possibilidade de configuração de máscara CIDR e prazo de validade.

---

## Item 3 — Sistema de Proteção Contra Edição de Imagens Originais

**Status: IMPLEMENTADO — Imagens originais são imutáveis**

A arquitetura do AxHub foi projetada para garantir que **imagens originais capturadas pelos equipamentos jamais sejam alteradas** por qualquer usuário do sistema. Os mecanismos são:

### 3.1 Separação entre Visualização e Armazenamento

- Operadores, analistas e auditores **visualizam** as imagens de infração — não têm acesso de escrita ao arquivo de imagem.
- As ações permitidas sobre uma infração são exclusivamente: **Validar**, **Descartar** (com motivo obrigatório) ou **Reabrir** — nenhuma delas altera o conteúdo da imagem.
- Não existe funcionalidade de edição, recorte ou substituição de imagem no fluxo de triagem ou auditoria.

### 3.2 Dupla Camada de Revisão Humana

O fluxo obrigatório de **Triagem → Auditoria** funciona como duplo controle:

1. **Analista (Triagem):** Apenas pode validar ou descartar.
2. **Auditor (Auditoria):** Pode confirmar ou rejeitar o trabalho do analista — nenhum dos dois pode alterar a imagem.

Toda ação é registrada com data, hora e identificador do usuário em `TBHistoricoTriagens`.

### 3.3 Controle Granular de Permissões

O módulo de Controle de Acesso (`TBPerfilAcessos`, `TBPermissoesAcesso`) define permissões por recurso de sistema. Perfis de analista e auditor têm acesso **somente leitura** às imagens — a permissão de escrita sobre arquivos de imagem não existe como opção no sistema.

### 3.4 Log de Auditoria Completo

Cada acesso ao sistema é registrado em `TBLogsAcessos`, contendo:

- Usuário
- IP de origem
- Data e hora
- Ação realizada

Este log permite rastrear qualquer consulta ou operação realizada sobre uma infração.

### 3.5 Validação de Integridade na Exportação

Antes de qualquer exportação, o sistema executa 7 validações automáticas — entre elas a verificação de que as **imagens estão em qualidade adequada e que as assinaturas digitais de triagem e auditoria estão presentes**. Infrações sem essas validações são bloqueadas da exportação.

---

## Item 4 — Backup e Redundância de Dados Operacional

**Status: OPERACIONAL**

### 4.1 Banco de Dados SQL Server — Backup Nativo

O AxHub utiliza **Microsoft SQL Server** como banco de dados principal. O SQL Server possui recursos nativos de backup e recuperação:

- **Backup completo diário** — cópia integral do banco de dados.
- **Backup diferencial** — captura das alterações desde o último backup completo.
- **Backup de log de transações** — permite recovery point-in-time (recuperação para qualquer minuto).

A frequência e retenção dos backups são definidas em acordo com o órgão contratante e configuradas pelo administrador de infraestrutura.

### 4.2 Estrutura de Dados para Rastreabilidade

O banco de dados do AxHub foi projetado com campos de auditoria em todas as tabelas principais:

| Campo | Descrição |
|-------|-----------|
| `DataCriacao` | Data/hora de criação do registro |
| `DataAtualizacao` | Data/hora da última modificação |
| `CriadoPor` | Usuário ou processo que criou |
| `AtualizadoPor` | Usuário ou processo que atualizou |

Esses campos garantem rastreabilidade total de qualquer alteração no banco de dados.

### 4.3 Imutabilidade Operacional dos Registros de Passagem

Os registros de `TBPassagens` e `TBInfracoes` não possuem operação de exclusão física disponível ao operador. Descartes são operações lógicas (alteração de status com motivo obrigatório), preservando o histórico integral no banco.

### 4.4 Disponibilidade e Monitoramento

O módulo de **Monitoramento Online** (`TBHeartbeatEquipamentos`) acompanha em tempo real o status de cada equipamento. Quedas de comunicação são detectadas e registradas em `TBEventosEquipamentos`, gerando alertas no Dashboard do sistema. Isso permite intervenção imediata antes de qualquer perda de dados.

---

## Síntese dos Requisitos Atendidos

| Requisito CGM | Status | Mecanismo Principal |
|--------------|--------|---------------------|
| Sincronização de relógio GPS/NTP | ✅ Operacional | Firmware INMETRO + preservação de timestamp no AxHub |
| Criptografia de imagens e dados | ✅ Ativo | Token de fabricante + imagem criptografada + assinatura digital no lote |
| Proteção contra edição de imagens | ✅ Implementado | Arquitetura read-only + triagem/auditoria + log de auditoria completo |
| Backup e redundância de dados | ✅ Operacional | SQL Server com backup nativo + imutabilidade lógica dos registros |

---

## Documentação Complementar Disponível

Os documentos abaixo podem ser fornecidos mediante solicitação formal para instrução do processo:

- Certificados de Aferição INMETRO dos equipamentos em campo.
- Relatório de logs de acesso (`TBLogsAcessos`) por período.
- Relatório de histórico de triagens (`TBHistoricoTriagens`) por lote de exportação.
- Configuração atual de perfis e permissões de acesso.
- Política de backup e plano de recuperação de desastres (DRP) do ambiente de servidor.
- Manual Técnico do AxHub (portal de documentação oficial: `https://axion-tecnologia.github.io/AxHub.Docs/`).

---

## Contato para Esclarecimentos

Para esclarecimentos adicionais ou envio de documentação complementar, favor contatar:

**Axion Tecnologia**  
Suporte Técnico / Atendimento à Fiscalização  
E-mail: *(preencher com e-mail oficial)*  
Telefone: *(preencher)*

---

*Documento gerado automaticamente pelo sistema AxionIA em 06/05/2026.*  
*Revisão técnica obrigatória antes do envio ao órgão.*
