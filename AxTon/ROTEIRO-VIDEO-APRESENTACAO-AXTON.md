# Roteiro de Vídeo — Apresentação Completa AxTon v1.0.0

> **Duração estimada:** 25–35 minutos  
> **Formato:** Gravação de tela + narração  
> **Público:** Operadores, gestores e auditores de postos de pesagem  
> **Ferramentas:** OBS Studio / Camtasia + Microfone  

---

## ABERTURA (0:00 – 1:30)

### Slide de Abertura
- Logo Axion Tecnologia
- Título: "AxTon — Sistema de Gestão de Pesagem Veicular"
- Subtítulo: "Apresentação Completa v1.0.0"

### Narração:
> "Bem-vindos à apresentação completa do AxTon, o sistema de gestão de pesagem veicular da Axion Tecnologia. Neste vídeo, vamos percorrer todas as funcionalidades do sistema, desde o login até a exportação de infrações para o órgão autuador. O AxTon automatiza todo o ciclo de pesagem: seleção do veículo, leitura da balança HAENNI, cálculo de excesso de peso e geração de infrações. Vamos começar."

---

## CENA 1 — LOGIN (1:30 – 3:00)

### Tela: Página de Login

### Ações na tela:
1. Mostrar a tela de login com os campos vazios
2. Digitar o nome de usuário
3. Digitar a senha
4. Clicar em ENTRAR
5. Mostrar o redirecionamento para o Dashboard

### Narração:
> "A primeira tela do sistema é o Login. Aqui você informa suas credenciais: nome de usuário e senha, ambos fornecidos pelo administrador do sistema. Após clicar em 'Entrar', o sistema valida suas credenciais e redireciona para o Painel Principal. Caso esqueça a senha, utilize o link 'Esqueceu a Senha?' para receber instruções de recuperação no e-mail cadastrado. Importante: após múltiplas tentativas incorretas, a conta será bloqueada temporariamente por segurança."

### Pontos a destacar:
- Campo de Nome de Usuário
- Campo de Senha
- Botão ENTRAR
- Link "Esqueceu a Senha?"

---

## CENA 2 — DASHBOARD / PAINEL PRINCIPAL (3:00 – 6:00)

### Tela: Dashboard

### Ações na tela:
1. Mostrar os 4 indicadores no topo
2. Passar o mouse sobre cada card
3. Mostrar o gráfico de distribuição diária
4. Scroll até "Últimas Pesagens"
5. Mostrar o menu lateral recolhido/expandido

### Narração:
> "O Painel Principal é a primeira tela após o login. No topo, temos quatro indicadores-chave:
> 
> 1. **Pesagens Realizadas no mês** — total de pesagens concluídas
> 2. **Infrações Realizadas no mês** — total de infrações geradas
> 3. **Total de Pesagens na Operação** — acumulado da operação ativa
> 4. **Total de Infrações na Operação** — infrações da operação ativa
> 
> Abaixo, o gráfico de 'Distribuição de Pesagens e Infrações Diário' permite visualizar o volume por dia e identificar tendências. Na seção 'Últimas Pesagens', vemos um histórico rápido com placa, data/hora e peso medido. E no 'Comparativo de Pesagens e Infrações', correlacionamos o total pesado com as infrações geradas.
> 
> À esquerda, o menu lateral dá acesso a todos os módulos do sistema. Vamos explorar cada um deles."

### Pontos a destacar:
- 4 cards de KPI no topo
- Gráfico de barras diário
- Lista de últimas pesagens (placa, data, peso)
- Gráfico comparativo
- Alertas (quando existentes)
- Últimas Notas Fiscais
- Menu lateral com todos os módulos

---

## CENA 3 — OPERAÇÕES (6:00 – 9:00)

### Tela: Cadastro de Operações

### Ações na tela:
1. Clicar em "Operações" no menu lateral
2. Mostrar a listagem de operações (Em Andamento / Concluído)
3. Clicar em "+ Novo"
4. Preencher: Local, Data Início, Usuário
5. Salvar
6. Mostrar operação criada na lista

### Narração:
> "Antes de iniciar qualquer pesagem, é necessário ter uma Operação ativa. As operações representam as atividades de fiscalização em campo. Cada operação é vinculada a um local de pesagem e possui um período de vigência.
> 
> Na listagem, vemos: data de início, data de fim, local vinculado, usuário responsável e status. Uma operação 'Em Andamento' permite registrar novas pesagens. Uma operação 'Concluído' é apenas para consulta.
> 
> Para criar uma nova operação: clique em '+ Novo', selecione o Local (por exemplo, PI504B — PI 247 Divisa PI/MA), defina a Data de Início, selecione o Usuário responsável e clique em Salvar.
> 
> Para encerrar uma operação, clique em Editar e preencha a Data de Fim. O status será alterado automaticamente para 'Concluído'.
> 
> **Regra importante:** Somente operações com status 'Em Andamento' permitem registrar novas pesagens. Sempre verifique se há uma operação ativa antes de iniciar uma pesagem."

### Pontos a destacar:
- Status: Em Andamento vs Concluído
- Vínculo obrigatório com Local
- Só permite pesagem se houver operação ativa
- Encerramento manual pela edição

---

## CENA 4 — INICIAR PESAGEM (9:00 – 15:00)

### Tela: Iniciar Pesagem (fluxo completo em 4 etapas)

### Ações na tela:

#### Etapa 1 — Seleção do Tipo do Veículo
1. Clicar em "Iniciar Pesagem" no menu lateral
2. Mostrar a lista de classificações
3. Demonstrar busca por código (3S3) e por PBT (48,5t)
4. Selecionar uma classificação

### Narração (Etapa 1):
> "A tela 'Iniciar Pesagem' guia o operador por todo o processo. A primeira etapa é selecionar a classificação do veículo. O sistema exibe a tabela completa com: código da classe, denominação, configuração de eixos e PBT regulamentado.
> 
> Você pode buscar pela classificação (como '3S3') ou pelo PBT em toneladas (como '48,5'). As classificações mais comuns em operação são:
> - **2C** (Caminhão simples, 16t)
> - **3C** (Trucado, 23t)  
> - **2S3** (Trator + Semi, 41,5t)
> - **3S3** (Combinação 6 eixos, 48,5t)
> - **3T6** (Tritrem, 74t)
> 
> Selecione o tipo correto observando a configuração de eixos do veículo que está no posto."

#### Etapa 2 — Informar a Placa
5. Campo de placa aparece
6. Digitar a placa (formato Mercosul: ABC1D23)
7. Clicar em Continuar

### Narração (Etapa 2):
> "Com a classificação selecionada, informe a placa do veículo. O sistema aceita tanto o padrão antigo (ABC-1234) quanto o Mercosul (ABC1D23). Após informar a placa, clique em 'Continuar' para prosseguir à leitura da balança."

#### Etapa 3 — Conexão com a Balança
8. Tela mostra "Aguarde..." com animação
9. Balança HAENNI registra o peso

### Narração (Etapa 3):
> "O sistema se conecta automaticamente à balança HAENNI e aguarda a leitura do peso. O status 'Aguarde...' indica que a leitura está em andamento. Se aparecer a mensagem 'Nenhum equipamento localizado', verifique:
> 1. A balança está ligada e conectada à rede
> 2. A URL está correta em Sistema → HAENNI
> 3. O número de balanças ativas no menu lateral é maior que zero"

#### Etapa 4 — Resultado e Finalização
10. Peso é registrado
11. Sistema calcula automaticamente: PBT Medido, PBT Regulamentado, PBT Considerado (com tolerância), Excesso
12. Se houver excesso → infração gerada automaticamente
13. Ticket criado com status "Finalizado"

### Narração (Etapa 4):
> "Com o peso registrado, o sistema realiza automaticamente os cálculos de conformidade:
> 
> - **PBT Medido:** peso total registrado pela balança
> - **PBT Regulamentado:** limite legal da classificação selecionada
> - **PBT Considerado:** PBT Regulamentado mais a tolerância configurada (percentual definido em Sistema → Infração)
> - **Excesso:** diferença entre PBT Medido e PBT Considerado
> 
> Se o excesso for positivo, o sistema gera automaticamente a infração com o enquadramento legal correto. O ticket é criado com status 'Finalizado' e pode ser consultado nos Tickets de Pesagens.
> 
> **Exemplo prático:** Um veículo 3S3 com PBT regulamentado de 48.500 kg e tolerância de 5%. O PBT Considerado será 48.500 + 2.425 = 50.925 kg. Se o peso medido for 53.000 kg, o excesso será 53.000 - 50.925 = 2.075 kg, gerando infração."

### Pontos a destacar:
- Fluxo linear de 4 etapas
- Busca por classificação OU por PBT
- Formato de placa antigo e Mercosul
- Conexão automática com balança HAENNI
- Cálculo automático de tolerância e excesso
- Geração automática de infração

---

## CENA 5 — TICKETS DE PESAGENS (15:00 – 17:30)

### Tela: Tickets de Pesagens (Abertos e Fechados)

### Ações na tela:
1. Clicar em "Tickets de Pesagens" no menu lateral
2. Mostrar listagem com colunas: Data, Placa, PBT, Eixos, Classe, Status
3. Clicar em "Visualizar" em um ticket
4. Mostrar detalhes: peso por eixo, resultado, operador, operação vinculada
5. Demonstrar botão "+ Nova Pesagem"

### Narração:
> "Os Tickets de Pesagens registram todas as pesagens realizadas. Na listagem, cada registro mostra: data, placa, PBT regulamentado, configuração de eixos, classe e status (Finalizado ou Em Andamento).
> 
> Ao clicar em 'Visualizar', vemos os detalhes completos: placa, classe, PBT regulamentado, PBT medido em quilogramas, peso individual por eixo, resultado (Regular ou Infração), operador e operação vinculada.
> 
> O botão '+ Nova Pesagem' inicia diretamente o processo de pesagem. Os tickets fechados ficam disponíveis para consulta histórica com filtros por período, placa e posto."

---

## CENA 6 — RECLASSIFICAÇÃO (17:30 – 19:00)

### Tela: Reclassificação de Veículos

### Ações na tela:
1. Na lista de tickets, selecionar um ticket
2. Clicar em "Reclassificar"
3. Mostrar classificação atual
4. Selecionar nova classificação
5. Informar motivo
6. Salvar

### Narração:
> "A reclassificação permite corrigir a classificação de um veículo quando o sistema ou o operador classificou incorretamente. Situações comuns: reboque não detectado, mudança de configuração de eixos, ou erro na seleção inicial.
> 
> Para reclassificar: selecione o ticket, clique em 'Reclassificar', verifique a classificação atual, selecione a nova classificação correta e informe obrigatoriamente o motivo da alteração.
> 
> **Atenção:** A reclassificação altera o PBT permitido, podendo impactar diretamente o cálculo de excesso de peso. Um veículo reclassificado de 3C (23t) para 3S3 (48,5t) pode deixar de ser infrator."

---

## CENA 7 — LIBERAR PESAGEM (19:00 – 20:30)

### Tela: Liberar Pesagem

### Ações na tela:
1. Localizar ticket pendente
2. Clicar em "Liberar"
3. Informar motivo da liberação
4. Registrar responsável
5. Confirmar

### Narração:
> "A liberação manual permite liberar veículos retidos no processo de pesagem. Motivos comuns: liberação por autoridade competente, regularização após transbordo, ou correção de registro incorreto.
> 
> Para liberar: localize o ticket pendente, clique em 'Liberar', informe o motivo e registre o responsável pela autorização. Toda liberação gera um registro de auditoria com data, hora e responsável — garantindo rastreabilidade total."

---

## CENA 8 — EXPORTAÇÃO DE INFRAÇÕES (20:30 – 23:00)

### Tela: Exportação

### Ações na tela:
1. Clicar em "Exportação" no menu lateral
2. Mostrar listagem de lotes (sequencial, tipo, status)
3. Mostrar filtros: Status, Data, Tipo de exportação
4. Clicar em "+ Novo"
5. Selecionar tipo (XTraffic)
6. Selecionar tipo de infração (Excesso de PBT, Eixo, Eixo/PBT)
7. Definir período
8. Salvar e aguardar processamento
9. Mostrar status "Ok"

### Narração:
> "A Exportação envia as infrações ao órgão autuador em lotes numerados. Na listagem, vemos: formato do arquivo, tipo de exportação (XTraffic ou AxHub), tipo de infração, sequencial do lote, datas e status.
> 
> Para gerar um novo lote: clique em '+ Novo', selecione o Tipo de Exportação (XTraffic para o órgão autuador externo, ou AxHub para integração com o sistema central), selecione o Tipo de Infração (Excesso de PBT, Excesso de Eixo ou Excesso Eixo/PBT), defina o período e clique em Salvar.
> 
> O sistema processa o lote em background. Quando o status mudar para 'Ok', o lote foi gerado com sucesso. Clique em 'Visualizar' para conferir o conteúdo antes do envio.
> 
> **Dica operacional:** Gere lotes separados por tipo de infração — o órgão autuador geralmente exige arquivos separados por enquadramento. Lotes com status 'Error' devem ser analisados nos Logs antes de qualquer reenvio."

---

## CENA 9 — CADASTROS (23:00 – 25:00)

### Tela: Locais + Classificações + Sequenciais

### Ações na tela:
1. Menu lateral → Cadastros → Locais
2. Mostrar lista de locais (PI503B, PI504B, PI505B)
3. Cadastrar novo local (código, CEP, endereço, município, UF)
4. Menu lateral → Cadastros → Classificações
5. Mostrar tabela de classificações de veículos
6. Menu lateral → Sequenciais de Infração
7. Mostrar numeração e controle

### Narração:
> "Na seção de Cadastros, gerenciamos os dados base do sistema:
> 
> **Locais:** São os postos de pesagem. Cada local tem um código único (como PI503B), CEP, endereço da rodovia, município e UF. O código é usado para vincular operações e gerar relatórios.
> 
> **Classificações de Veículos:** A tabela completa de tipos de veículos com código, denominação, configuração de eixos e PBT regulamentado. Segue a norma CONTRAN/DENATRAN.
> 
> **Sequenciais de Infração:** Controla a numeração dos autos de infração e dos lotes de exportação, garantindo rastreabilidade sequencial sem saltos."

---

## CENA 10 — CONFIGURAÇÕES DO SISTEMA (25:00 – 28:00)

### Tela: Sistema (5 abas)

### Ações na tela:
1. Menu lateral → Sistema
2. Aba Gerais: código equipamento, tipo exportação, URL AxHub
3. Aba Dados do Órgão: informações do órgão fiscalizador
4. Aba HAENNI: URL e configuração da balança
5. Aba Infração: tolerâncias PBT (%), Eixo (%), enquadramentos
6. Aba Câmera IP: configuração da câmera de captura

### Narração:
> "As Configurações do Sistema centralizam todos os parâmetros operacionais, organizadas em 5 abas:
> 
> **Gerais:** Código do equipamento, tipo de exportação (XTraffic ou AxHub), obrigatoriedade de imagem e URL de integração com o AxHub.
> 
> **Dados do Órgão:** Informações do órgão fiscalizador responsável pelas autuações.
> 
> **HAENNI:** Configuração da balança — URL do servidor e número de balanças ativas. Esta é a conexão que permite a leitura automática de peso.
> 
> **Infração:** Os parâmetros mais críticos do sistema. Aqui definimos:
> - Tolerância PBT (%) — percentual acima do PBT que não gera infração
> - Tolerância Eixo/Grupo (%) — tolerância por eixo individual
> - Códigos de enquadramento legal por tipo de excesso
> 
> O cálculo funciona assim: PBT Considerado = PBT Regulamentado × (1 + Tolerância%). Se o PBT Medido ultrapassar o PBT Considerado, a infração é gerada automaticamente.
> 
> **Câmera IP:** Configuração da câmera para captura de imagens dos veículos durante a pesagem."

---

## CENA 11 — RELATÓRIOS (28:00 – 30:00)

### Tela: Relatório de Pesagem

### Ações na tela:
1. Menu lateral → Relatório de Pesagem
2. Selecionar período (Data Inicial e Final)
3. Clicar em Pesquisar
4. Mostrar resultados: data, placa, classe, peso, resultado
5. Clicar em "Exportar PDF"

### Narração:
> "O Relatório de Pesagem consolida todas as pesagens de um período. Selecione a data inicial e final e clique em 'Pesquisar'. O sistema lista todas as pesagens com: data/hora, placa, classificação, PBT medido, PBT regulamentado, resultado (Regular ou Infração), operação e operador.
> 
> Clique em 'Exportar PDF' para gerar o documento oficial — ideal para auditorias e relatórios de encerramento de operação.
> 
> O sistema também oferece relatórios especializados: Relatório de Infrações, Fluxo Diário de Veículos, Discrepâncias, Notas Fiscais, Processamento de Imagens, Processamento por Usuário, Power BI, Mapa de Fluxo e Falhas Sequenciais."

---

## CENA 12 — ADMINISTRAÇÃO (30:00 – 32:00)

### Tela: Usuários + Perfis + Permissões

### Ações na tela:
1. Menu lateral → Usuários
2. Mostrar lista (admin, operador)
3. Cadastrar novo usuário
4. Menu lateral → Perfis de Acesso
5. Mostrar perfis (Porteiro, Administrador, Operador)
6. Configurar permissões de um perfil

### Narração:
> "Na Administração, gerenciamos os acessos ao sistema:
> 
> **Usuários:** Cadastro de operadores com nome, login, e-mail, celular e senha. Cada usuário é vinculado a um perfil de acesso.
> 
> **Perfis de Acesso:** Agrupam permissões. Exemplos: 'Porteiro' (acesso limitado à pesagem), 'Operador' (pesagem + relatórios), 'Administrador' (acesso total).
> 
> **Permissões:** Controle granular de quais telas e ações cada perfil pode acessar. Isso garante segurança e rastreabilidade — cada operação é registrada com o usuário que a realizou."

---

## CENA 13 — MONITORAMENTO E OPERAÇÕES AVANÇADAS (32:00 – 34:00)

### Tela: Monitoramento Online + Eventos + Consulta de Placas + Alertas

### Ações na tela:
1. Menu lateral → Operações → Monitoramento Online
2. Mostrar status dos equipamentos (Online/Offline)
3. Eventos de Equipamentos
4. Consulta de Placas
5. Alertas operacionais

### Narração:
> "O módulo de Operações avançadas oferece:
> 
> **Monitoramento Online:** Painel em tempo real com status dos equipamentos. Verde = comunicando, Vermelho = offline, Amarelo = alerta. Mantenha esta tela aberta durante operações para detecção rápida de falhas.
> 
> **Eventos de Equipamentos:** Registro histórico de eventos operacionais — comunicação, falhas, manutenção.
> 
> **Consulta de Placas:** Pesquisa de passagens de veículos por placa em qualquer período.
> 
> **Alertas:** Gestão de notificações operacionais para ação imediata."

---

## ENCERRAMENTO (34:00 – 35:00)

### Slide de Fechamento
- Resumo dos módulos apresentados
- Logo Axion Tecnologia
- Contato de suporte

### Narração:
> "Este foi o tour completo pelo AxTon v1.0.0. Recapitulando: o sistema gerencia todo o ciclo de pesagem veicular — da abertura da operação até a exportação das infrações para o órgão autuador. Com cálculos automáticos de tolerância, integração com balança HAENNI e geração inteligente de infrações, o AxTon garante eficiência e conformidade na fiscalização.
> 
> Para dúvidas ou suporte, acesse o helpdesk da Axion Tecnologia ou entre em contato via WhatsApp. Obrigado por assistir!"

---

## CHECKLIST DE PRODUÇÃO DO VÍDEO

### Pré-produção
- [ ] Ambiente AxTon com dados de demonstração carregados
- [ ] Operação ativa no sistema
- [ ] Balança HAENNI conectada (ou simulador)
- [ ] Resolução da tela: 1920×1080
- [ ] Navegador Chrome em modo limpo (sem extensões visíveis)
- [ ] Cursor grande e visível

### Gravação
- [ ] OBS Studio configurado (30fps, 1080p)
- [ ] Microfone testado (sem eco/ruído)
- [ ] Cada cena gravada separadamente para facilitar edição
- [ ] Zoom em campos/botões quando necessário

### Pós-produção
- [ ] Transições suaves entre cenas
- [ ] Destaques (highlights) em botões e campos importantes
- [ ] Legendas/subtítulos em português
- [ ] Marca d'água Axion Tecnologia
- [ ] Música de fundo leve (sem direitos autorais)
- [ ] Exportar em MP4 (H.264, 1080p)

### Materiais complementares
- [ ] PDF do manual (este documento de referência)
- [ ] Slides de apoio para abertura/encerramento
- [ ] Thumbnails para cada seção (se publicar no YouTube)

---

## MAPEAMENTO TELA × TEMPO

| Tempo | Tela | Módulo | Ação principal |
|-------|------|--------|----------------|
| 0:00 | Slide abertura | — | Apresentação |
| 1:30 | Login | Acesso | Autenticação |
| 3:00 | Dashboard | Visão geral | KPIs e gráficos |
| 6:00 | Operações | Gestão | Criar operação |
| 9:00 | Iniciar Pesagem | Core | Fluxo completo 4 etapas |
| 15:00 | Tickets | Consulta | Listagem e detalhes |
| 17:30 | Reclassificação | Correção | Alterar classe |
| 19:00 | Liberar Pesagem | Liberação | Liberar veículo |
| 20:30 | Exportação | Infrações | Gerar lote |
| 23:00 | Cadastros | Base | Locais/Classificações |
| 25:00 | Sistema | Config | 5 abas de configuração |
| 28:00 | Relatórios | Análise | Consulta + PDF |
| 30:00 | Administração | Segurança | Usuários/Perfis |
| 32:00 | Monitoramento | Avançado | Status equipamentos |
| 34:00 | Slide fechamento | — | Encerramento |
