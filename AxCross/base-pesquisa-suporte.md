# Base de Pesquisa e Suporte — AxCross

## Visão Geral do Sistema

O **AxCross** é o sistema de **monitoramento de cruzamentos** da Axion Tecnologia. Gerencia equipamentos de fiscalização, operações de monitoramento e relatórios de passagens em cruzamentos viários.

---

## Menu lateral do AxCross

### Itens diretos

| Item do menu | Tela / Função |
|---|---|
| **Monitoramento Online** | Acompanhamento em tempo real de equipamentos e passagens |
| **Operações** | Cadastro e gestão de operações de fiscalização |
| **Sistema** | Configurações gerais, dados do órgão, integrações |
| **Relatório de Passagens** | Consulta e exportação de passagens registradas |

### Categorias expansíveis

| Categoria | Itens |
|---|---|
| **Cadastros** | Locais, Equipamentos, Faixas |
| **Administração** | Usuários, Permissões de acesso, Perfis de acesso |

---

## Módulos e Funcionalidades

### Monitoramento Online
- Mapa de equipamentos com status em tempo real (online/offline)
- Últimas passagens registradas com placa, data/hora e local
- Alertas de equipamentos offline ou com falhas

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

### Erro ao fazer login
1. Verificar nome de usuário correto
2. Conferir Caps Lock
3. Usar "Esqueceu a Senha?" para recuperar
4. Contatar administrador se conta bloqueada
