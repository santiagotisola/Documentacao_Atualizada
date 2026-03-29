# AxTon — Base de Pesquisa para Suporte

> Referência rápida para atendimento de chamados do sistema AxTon (Pesagem Veicular).
> Última atualização: 29/03/2026

---

## Módulos do Sistema

### Pesagem
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Postos de Pesagem | Pesagem → Postos | [postos](pesagem/postos) |
| Tickets em Aberto | Pesagem → Tickets em Aberto | [ticket-aberto](pesagem/ticket-aberto) |
| Tickets Fechados | Pesagem → Tickets Fechados | [ticket-fechado](pesagem/ticket-fechado) |
| Reclassificação | Pesagem → Reclassificar | [reclassificar](pesagem/reclassificar) |
| Liberar Pesagem | Pesagem → Liberar | [liberar](pesagem/liberar-pesagem) |
| Motivos | Pesagem → Motivos | [motivos](pesagem/motivos) |

### Operações
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Cadastro de Operações | Operações → Cadastro | [cadastro](operacoes/cadastro-operacoes) |
| Monitoramento Online | Operações → Monitoramento | [monitoramento](operacoes/monitoramento-online) |
| Eventos de Equipamentos | Operações → Eventos | [eventos](operacoes/eventos-equipamentos) |
| Consulta de Placas | Operações → Consulta | [placas](operacoes/consulta-placas) |
| Alertas | Operações → Alertas | [alertas](operacoes/alertas) |

### Infrações
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Triagem | Infrações → Triagem | [triagem](infracoes/triagem) |
| Auditoria | Infrações → Auditoria | [auditoria](infracoes/auditoria) |
| Consulta | Infrações → Consulta | [consulta](infracoes/consulta-infracoes) |
| Exportação | Infrações → Exportação | [exportação](infracoes/exportacao) |
| Exceções | Infrações → Exceções | [exceções](infracoes/excecoes) |
| Descartadas | Infrações → Descartadas | [descartadas](infracoes/infracoes-descartadas) |

### Relatórios
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Passagens | Relatórios → Passagens | [passagens](relatorios/relatorio-passagens) |
| Infrações | Relatórios → Infrações | [infrações](relatorios/relatorio-infracoes) |
| Fluxo Diário | Relatórios → Fluxo Diário | [fluxo](relatorios/fluxo-diario-veiculos) |
| Discrepâncias | Relatórios → Discrepâncias | [discrepâncias](relatorios/relatorio-discrepancias) |
| Notas Fiscais | Relatórios → NFe | [nfe](relatorios/relatorio-nfe) |
| Processamento Imagens | Relatórios → Imagens | [imagens](relatorios/processamento-imagens) |
| Por Usuário | Relatórios → Por Usuário | [usuário](relatorios/processamento-por-usuario) |
| Power BI | Relatórios → Power BI | [power-bi](relatorios/power-bi) |
| Mapa de Fluxo | Relatórios → Mapa | [mapa](relatorios/mapa-fluxo-passagens) |
| Falhas Sequenciais | Relatórios → Falhas | [falhas](relatorios/falhas-sequenciais) |

### Veículos
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Tipos | Veículos → Tipos | [tipos](veiculos/tipos-veiculos) |
| Marcas | Veículos → Marcas | [marcas](veiculos/marcas-veiculos) |
| Modelos | Veículos → Modelos | [modelos](veiculos/modelos-veiculos) |
| Cores | Veículos → Cores | [cores](veiculos/cores) |
| Classificações | Veículos → Classificações | [classificações](veiculos/classificacoes-veiculos) |
| Municípios | Veículos → Municípios | [municípios](veiculos/municipios) |

### Cadastros Básicos
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Equipamentos | Cadastros Básicos → Equipamentos | [equipamentos](cadastros-basicos/equipamentos) |
| Fabricantes | Cadastros Básicos → Fabricantes | [fabricantes](cadastros-basicos/fabricantes) |
| Tipos de Equipamentos | Cadastros Básicos → Tipos | [tipos](cadastros-basicos/tipos-equipamentos) |
| Modelos | Cadastros Básicos → Modelos | [modelos](cadastros-basicos/modelos-equipamentos) |
| Grupos | Cadastros Básicos → Grupos | [grupos](cadastros-basicos/grupos-equipamentos) |

### Medições
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Contratos | Medições → Contratos | [contratos](medicoes/contratos) |
| Índices de Performance | Medições → Índices | [índices](medicoes/indices-performance) |
| Interrupções | Medições → Interrupções | [interrupções](medicoes/interrupcoes) |
| Gerar Medição | Medições → Gerar | [gerar](medicoes/criar-medicao) |

### Controle de Acesso
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Logs de Acesso | Controle de Acesso → Logs | [logs](controle-acesso/logs-acesso) |
| Restrição por IP | Controle de Acesso → IP | [ip](controle-acesso/acessos-por-ip) |
| Permissões | Controle de Acesso → Permissões | [permissões](controle-acesso/configurar-permissoes) |

### Administração
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Usuários | Administração → Usuários | [usuários](administracao/usuarios) |
| Perfis de Acesso | Administração → Perfis | [perfis](administracao/perfis-acesso) |
| Permissões | Administração → Permissões | [permissões](administracao/permissoes) |

---

## Problemas Frequentes

### Ticket não finaliza
- Verificar se todos os dados obrigatórios estão preenchidos
- Verificar se o veículo foi classificado corretamente
- Verificar se há segunda pesagem pendente

### Erro na exportação de lote
- **Código do município divergente**: Verificar cadastro em Veículos → Municípios
- **Imagens ausentes**: Verificar Relatórios → Processamento de Imagens
- **Dados incompletos**: Reabrir infração na Triagem e completar dados

### Equipamento offline
- Verificar conectividade de rede no local
- Consultar Operações → Eventos de Equipamentos para últimos registros
- Registrar interrupção em Medições → Interrupções

### Placa não reconhecida
- Verificar taxa de reconhecimento em Relatórios → Processamento de Imagens
- Pode ser necessário reclassificar manualmente (Pesagem → Reclassificar)
- Verificar se o equipamento/câmera está calibrado

### Alerta de veículo sem MDF-e
- Verificar em Operações → Alertas o tipo "Veículo sem MDF-e"
- Confirmar se o veículo é de carga (obrigado a portar MDF-e)
- Encaminhar para fiscalização se confirmado

---

## Glossário Rápido

| Termo | Definição |
|---|---|
| **PBT** | Peso Bruto Total — peso máximo permitido |
| **NFe** | Nota Fiscal Eletrônica |
| **MDF-e** | Manifesto de Documento Fiscal Eletrônico |
| **Triagem** | Análise humana de infrações |
| **Auditoria** | Revisão de infrações processadas |
| **OCR** | Reconhecimento óptico de caracteres (placas) |
