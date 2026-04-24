# Base de Pesquisa e Suporte — AxCross

## Visão Geral do Sistema

O **AxCross** é o sistema de **monitoramento de cruzamentos** da Axion Tecnologia. Gerencia equipamentos de fiscalização, operações de monitoramento e relatórios de passagens em cruzamentos viários.

---

## Menu lateral do AxCross

### Itens diretos

| Item do menu | Tela / Função |
| --- | --- |
| **Monitoramento Online** | Acompanhamento em tempo real de equipamentos e passagens |
| **Operações** | Cadastro e gestão de operações de fiscalização |
| **Sistema** | Configurações gerais, dados do órgão, integrações |
| **Relatório de Passagens** | Consulta e exportação de passagens registradas |

### Categorias expansíveis

| Categoria | Itens |
| --- | --- |
| **Cadastros** | Locais, Equipamentos, Faixas |
| **Administração** | Usuários, Permissões de acesso, Perfis de acesso |

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

### Cadastros

#### Locais

- Nome, endereço, município, UF
- Latitude/longitude opcionais para mapa
- Acesse: Menu lateral → Cadastros → Locais

#### Equipamentos

- Câmeras, detectores, sensores, radares
- Nome, tipo, modelo, fabricante, número de série, IP
- Vinculado a um local
- Acesse: Menu lateral → Cadastros → Equipamentos

#### Faixas

- Via monitorada em um cruzamento
- Número da faixa, sentido, equipamento vinculado
- Velocidade máxima opcional
- Acesse: Menu lateral → Cadastros → Faixas

### Relatórios

- Relatório de Passagens: filtro por período, local, equipamento, faixa
- Exportação em PDF ou CSV

### Sistema

- Dados do órgão (nome, CNPJ, endereço)
- Parâmetros operacionais (intervalo de atualização, timeout, retenção)
- Integrações (API externa, webhook)
- Somente administradores

### Administração

#### Usuários

- Nome, login, e-mail, senha, perfil de acesso
- Acesse: Menu lateral → Administração → Usuários

#### Permissões de Acesso

- Visualizar, criar, editar, excluir por módulo
- Acesse: Menu lateral → Administração → Permissões de acesso

#### Perfis de Acesso

- Administrador, Operador, Consulta (padrão)
- Acesse: Menu lateral → Administração → Perfis de acesso

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
