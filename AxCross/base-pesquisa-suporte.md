# Base de Pesquisa e Suporte — AxCross

## Visão Geral do Sistema

O **AxCross** é o sistema de **cruzamento e monitoramento de dados de trânsito** da Axion Tecnologia. Gerencia equipamentos de fiscalização, veículos monitorados, alertas automáticos, rastreamento de placas e relatórios de passagens.

- **URL Produção:** https://economia.axcross.axion.ws
- **Stack:** ASP.NET (.NET 9), Razor MVC, jQuery/DataTables, SignalR, Google Maps
- **Autenticação:** OIDC/OAuth2+PKCE via economia.axion.ws
- **Total de telas:** 24

---

## Menu lateral do AxCross

### Itens diretos (menu principal)

| Item do menu | URL | Telas |
| --- | --- | --- |
| **Dashboard** | `/` | KPIs, mapa de equipamentos, gráfico passagens/hora |
| **Veículos Monitorados** | `/occurrences/monitoredvehicle` | 5 sub-telas |
| **Equipamentos** | `/equipments/equipment` | 4 sub-telas |
| **Monitoramento Online** | `/monitoringonline/monitoring` | 2 sub-telas |
| **Relatórios** | `/reports/reports` | 6 sub-telas |
| **Configurações** | `/settings/systemsettings` | 6 sub-telas |

### Sub-telas por módulo

#### Veículos Monitorados
| Funcionalidade | URL |
| --- | --- |
| Veículos Monitorados | `/occurrences/monitoredvehicle/monitoredvehicle` |
| Tipos de Ocorrências | `/occurrences/occurrencetype` |
| Alertas | `/occurrences/alert` |
| Classificações dos Veículos | `/occurrences/vehicleclassification` |
| Importação de Monitorados | `/occurrences/vehiclemonitoredimport` |

#### Equipamentos
| Funcionalidade | URL |
| --- | --- |
| Equipamentos | `/equipments/equipment/equipment` |
| Grupo de Equipamentos | `/equipments/equipmentgroup` |
| Áreas | `/equipments/area` |
| Importação de Equipamentos | `/equipments/equipmentimport` |

#### Monitoramento Online
| Funcionalidade | URL |
| --- | --- |
| Monitoramento Online (SignalR) | `/monitoringonline/monitoring/monitoringonline` |
| Mapa de Equipamentos (Google Maps) | `/monitoringonline/monitoring/equipmentmap` |

#### Relatórios
| Funcionalidade | URL |
| --- | --- |
| Passagens | `/reports/reports/passages` |
| Mapeamento de Rotas | `/reports/reports/routemapping` |
| Rastreamento de Placas | `/reports/platetracking` |
| Veículos Monitorados | `/reports/reports/vehiclemonitored` |
| Ocorrências e Alertas | `/reports/reports/occurrences` |
| PDF Gerados | `/reports/reports/reportsgenerated` |

#### Configurações
| Funcionalidade | URL |
| --- | --- |
| Configurações do Sistema | `/settings/systemsettings/indexsettings` |
| Usuários | `/settings/user` |
| Perfis de Acesso | `/settings/accessprofile` |
| Permissões | `/settings/accesspermission` |
| Logs de Acesso | `/settings/logaccess` |
| Sincronização de Passagens | `/settings/sync` |

---

## Módulos e Funcionalidades

### Veículos Monitorados

#### Lista de Veículos

- Placas cadastradas para monitoramento especial
- Quando detectado em qualquer cruzamento, gera alerta automático
- Campos: placa, tipo de ocorrência, habilitado, data de expiração, observações
- Acesse: Menu lateral → Veículos Monitorados

#### Tipos de Ocorrências

- Categorias para classificar os alertas de veículos monitorados
- Campos: código, nome, cor, emitir alerta sonoro, **prazo de expiração (dias)**
- O campo **Prazo de Expiração (dias)** define vigência automática para todos os veículos vinculados
- Ao alterar o prazo, todos os veículos do tipo são atualizados automaticamente (atualização em bloco)
- Acesse: Veículos Monitorados → Tipos de Ocorrências

#### Vigência dos Alertas (novo recurso)

- Controle de **data de início e fim** dos alertas por veículo monitorado
- Configura-se o prazo em dias no **Tipo de Ocorrência**
- O veículo recebe automaticamente uma **Data de Expiração** = hoje + prazo
- Após a expiração, o veículo deixa de gerar alertas automaticamente
- O campo **Habilitado** é controle manual — não é alterado automaticamente pela vigência
- Para gerar alerta: veículo deve estar **habilitado** E **dentro da vigência**

**Status de vigência:**

- 🟢 **Ativo** — habilitado e dentro do prazo
- 🟡 **Expira em Xh/Xd** — habilitado e expirando em breve
- 🔴 **Expirado** — habilitado, mas prazo vencido (não gera alertas)
- 🟡 **Desativado** — desabilitado manualmente

**Sino de vigência (toolbar):**

- Ícone de sino 🔔 na barra superior exibe veículos expirando nas próximas 24h ou já expirados
- Lista paginada com 10 itens por página + botão "Ver mais"
- Atualiza automaticamente a cada 5 minutos
- Clicar no item abre o formulário de edição do veículo

**Atualização em bloco:**

- Alterar o prazo do tipo de ocorrência → recalcula a data de expiração de todos os veículos vinculados
- Remover o prazo → expira = sem data (nunca expira) para todos os veículos
- A operação é instantânea via UPDATE em lote no banco

#### Alertas

- Registram eventos detectados (veículos monitorados, equipamentos offline, ocorrências)
- Acesse: Veículos Monitorados → Alertas

#### Importação em Lote

- Importar múltiplas placas via arquivo .txt
- Se o tipo de ocorrência tiver prazo, a data de expiração é calculada automaticamente para cada veículo importado
- Acesse: Veículos Monitorados → Importação de Monitorados

### Operações

- Criar operação: definir local, período e parâmetros
- Pausar, encerrar ou excluir operações
- Operações com registros não podem ser excluídas

### Equipamentos

#### Lista de Equipamentos
- **Caminho:** Menu lateral → Equipamentos → Equipamentos (`/equipments/equipment/equipment`)
- Câmeras, detectores, sensores, radares
- Nome, tipo, modelo, fabricante, número de série, IP
- Exportação em Excel
- Acesse: Menu lateral → Equipamentos

#### Grupo de Equipamentos
- **Caminho:** Menu lateral → Equipamentos → Grupo de Equipamentos (`/equipments/equipmentgroup`)
- Agrupamento lógico de equipamentos por região ou finalidade

#### Áreas
- **Caminho:** Menu lateral → Equipamentos → Áreas (`/equipments/area`)
- Regiões geográficas de monitoramento

#### Importação de Equipamentos
- **Caminho:** Menu lateral → Equipamentos → Importação (`/equipments/equipmentimport`)
- Importação em massa de equipamentos via arquivo

### Relatórios

#### Passagens
- **Caminho:** Menu lateral → Relatórios → Passagens (`/reports/reports/passages`)
- **Filtros avançados:** Data/Hora Início, Data/Hora Final, Equipamento, Faixa, Placa (com curinga *), Área, Cor, Modelo, Classificação, Placas Inválidas
- **Classificações disponíveis:** Automóvel, Caminhão, Caminhonete, Motocicleta, Ônibus, Sem Classe
- **Cores disponíveis:** Preto, Azul, Marrom, Dourado, Cinza, Verde, Laranja, Roxo, Vermelho, Prata, Bege, Branco, Amarelo
- Exportação em Excel

#### Mapeamento de Rotas
- **Caminho:** Menu lateral → Relatórios → Mapeamento de Rotas (`/reports/reports/routemapping`)
- Rastreia trajeto de um veículo com base nas passagens em múltiplos equipamentos

#### Rastreamento de Placas
- **Caminho:** Menu lateral → Relatórios → Rastreamento de Placas (`/reports/platetracking`)
- Busca todas as passagens de uma placa específica com imagens e horários

#### Veículos Monitorados (Relatório)
- **Caminho:** Menu lateral → Relatórios → Veículos Monitorados (`/reports/reports/vehiclemonitored`)
- Lista veículos monitorados com status de vigência e últimos alertas

#### Ocorrências e Alertas (Relatório)
- **Caminho:** Menu lateral → Relatórios → Ocorrências e Alertas (`/reports/reports/occurrences`)
- Histórico de detecções e alertas gerados por cruzamentos

#### PDF Gerados
- **Caminho:** Menu lateral → Relatórios → PDF Gerados (`/reports/reports/reportsgenerated`)
- Download de relatórios previamente gerados em PDF

### Configurações e Administração

#### Configurações do Sistema
- **Caminho:** Menu lateral → Configurações → Configurações do Sistema (`/settings/systemsettings/indexsettings`)
- Parâmetros operacionais, dados do órgão, integrações

#### Usuários
- **Caminho:** Menu lateral → Configurações → Usuários (`/settings/user`)
- Nome, login, e-mail, senha, perfil de acesso
- Ativar/desativar contas

#### Perfis de Acesso
- **Caminho:** Menu lateral → Configurações → Perfis de Acesso (`/settings/accessprofile`)
- Administrador, Operador, Consulta (padrão)

#### Permissões
- **Caminho:** Menu lateral → Configurações → Permissões (`/settings/accesspermission`)
- Visualizar, criar, editar, excluir por módulo

#### Logs de Acesso
- **Caminho:** Menu lateral → Configurações → Logs de Acesso (`/settings/logaccess`)
- Auditoria de ações dos usuários no sistema

#### Sincronização de Passagens
- **Caminho:** Menu lateral → Configurações → Sincronização de Passagens (`/settings/sync`)
- Controle de sincronização com fonte de dados externa

---

## Problemas Comuns

### Equipamento offline

1. Verificar se está energizado
2. Confirmar cabo de rede conectado
3. Testar ping para o IP
4. Reiniciar equipamento
5. Acionar equipe de manutenção se persistir

### Veículo monitorado não gera alerta

1. Verificar se o veículo está **Habilitado** na lista de Veículos Monitorados
2. Verificar a **Vigência**: se a coluna "Vigência" mostrar "Expirado" ou "Desativado", o alerta não será gerado
3. Se expirado: editar o veículo e atualizar a Data de Expiração, ou zerar o prazo do Tipo de Ocorrência
4. Confirmar se o Tipo de Ocorrência está ativo
5. Verificar se a placa está cadastrada no formato correto (Mercosul ou padrão antigo)

### Erro ao fazer login

1. Verificar nome de usuário correto
2. Conferir Caps Lock
3. Usar "Esqueceu a Senha?" para recuperar
4. Contatar administrador se conta bloqueada
