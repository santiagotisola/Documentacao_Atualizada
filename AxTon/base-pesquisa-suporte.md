# AxTon — Base de Pesquisa para Suporte

> Referência rápida para atendimento de chamados do sistema AxTon (Pesagem Veicular).
> Última atualização: 29/03/2026

---

## Menu lateral do AxTon

### Itens diretos (acesso pelo menu lateral)
| Funcionalidade | Menu lateral | Doc |
|---|---|---|
| Iniciar Pesagem | Menu lateral → **Iniciar Pesagem** | [postos](pesagem/postos) |
| Operações | Menu lateral → **Operações** | [cadastro](operacoes/cadastro-operacoes) |
| Tickets de Pesagens | Menu lateral → **Tickets de Pesagens** | [ticket-aberto](pesagem/ticket-aberto) |
| Exportação | Menu lateral → **Exportação** | [exportação](infracoes/exportacao) |
| Sistema | Menu lateral → **Sistema** | [configurações](sistema/configuracoes) |
| Relatório de Pesagem | Menu lateral → **Relatório de Pesagem** | [passagens](relatorios/relatorio-passagens) |
| Sequenciais de Infração | Menu lateral → **Sequenciais de Infração** | [sequenciais](cadastros/sequencial-infracao) |

### Cadastros (categoria expansível)
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Locais | Cadastros → Locais | [locais](cadastros/locais) |
| Classificações | Cadastros → Classificações | [classificações](cadastros/classificacao-veiculos) |
| Sequencial de Infração | Cadastros → Sequencial de Infração | [sequencial](cadastros/sequencial-infracao) |

### Administração (categoria expansível)
| Funcionalidade | Caminho | Doc |
|---|---|---|
| Usuários | Administração → Usuários | [usuários](administracao/usuarios) |
| Perfis de acesso | Administração → Perfis de acesso | [perfis](administracao/perfis-acesso) |
| Permissões de acesso | Administração → Permissões de acesso | [permissões](administracao/permissoes) |

---

## Telas internas (acessadas a partir dos itens do menu)

### Pesagem (dentro de Iniciar Pesagem / Tickets de Pesagens)
| Funcionalidade | Acesso | Doc |
|---|---|---|
| Tickets em Aberto | Tickets de Pesagens | [ticket-aberto](pesagem/ticket-aberto) |
| Tickets Fechados | Tickets de Pesagens → Fechados | [ticket-fechado](pesagem/ticket-fechado) |
| Reclassificação | Tickets de Pesagens → Reclassificar | [reclassificar](pesagem/reclassificar) |
| Liberar Pesagem | Tickets de Pesagens → Liberar | [liberar](pesagem/liberar-pesagem) |
| Motivos | Iniciar Pesagem → Motivos | [motivos](pesagem/motivos) |

### Operações (dentro de Operações)
| Funcionalidade | Acesso | Doc |
|---|---|---|
| Monitoramento Online | Operações → Monitoramento | [monitoramento](operacoes/monitoramento-online) |
| Eventos de Equipamentos | Operações → Eventos | [eventos](operacoes/eventos-equipamentos) |
| Consulta de Placas | Operações → Consulta | [placas](operacoes/consulta-placas) |
| Alertas | Operações → Alertas | [alertas](operacoes/alertas) |

### Relatórios
| Funcionalidade | Acesso | Doc |
|---|---|---|
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
| Funcionalidade | Acesso | Doc |
|---|---|---|
| Tipos | Veículos → Tipos | [tipos](veiculos/tipos-veiculos) |
| Marcas | Veículos → Marcas | [marcas](veiculos/marcas-veiculos) |
| Modelos | Veículos → Modelos | [modelos](veiculos/modelos-veiculos) |
| Cores | Veículos → Cores | [cores](veiculos/cores) |
| Classificações | **Menu lateral → Classificações** | [classificações](veiculos/classificacoes-veiculos) |
| Municípios | Veículos → Municípios | [municípios](veiculos/municipios) |

### Cadastros Básicos
| Funcionalidade | Acesso | Doc |
|---|---|---|
| Equipamentos | Cadastros Básicos → Equipamentos | [equipamentos](cadastros-basicos/equipamentos) |
| Fabricantes | Cadastros Básicos → Fabricantes | [fabricantes](cadastros-basicos/fabricantes) |
| Tipos de Equipamentos | Cadastros Básicos → Tipos | [tipos](cadastros-basicos/tipos-equipamentos) |
| Modelos | Cadastros Básicos → Modelos | [modelos](cadastros-basicos/modelos-equipamentos) |
| Grupos | Cadastros Básicos → Grupos | [grupos](cadastros-basicos/grupos-equipamentos) |

### Medições
| Funcionalidade | Acesso | Doc |
|---|---|---|
| Contratos | Medições → Contratos | [contratos](medicoes/contratos) |
| Índices de Performance | Medições → Índices | [índices](medicoes/indices-performance) |
| Interrupções | Medições → Interrupções | [interrupções](medicoes/interrupcoes) |
| Gerar Medição | Medições → Gerar | [gerar](medicoes/criar-medicao) |

### Controle de Acesso
| Funcionalidade | Acesso | Doc |
|---|---|---|
| Logs de Acesso | Controle de Acesso → Logs | [logs](controle-acesso/logs-acesso) |
| Restrição por IP | Controle de Acesso → IP | [ip](controle-acesso/acessos-por-ip) |

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
- Pode ser necessário reclassificar manualmente (Tickets de Pesagens → Reclassificar)
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
