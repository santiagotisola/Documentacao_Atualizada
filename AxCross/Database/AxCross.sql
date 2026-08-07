-- =============================================
-- AxCross — Schema SQL Server
-- Sistema de Monitoramento de Cruzamentos
-- =============================================

-- Locais de cruzamento
CREATE TABLE TBLocais (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nome          NVARCHAR(200) NOT NULL,
    Endereco      NVARCHAR(500),
    Latitude      FLOAT,
    Longitude     FLOAT,
    Cidade        NVARCHAR(100),
    UF            CHAR(2),
    Ativo         BIT DEFAULT 1,
    CriadoEm      DATETIME DEFAULT GETDATE()
);

-- Equipamentos (câmeras, sensores)
CREATE TABLE TBEquipamentos (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nome          NVARCHAR(200) NOT NULL,
    Tipo          NVARCHAR(100),
    Fabricante    NVARCHAR(100),
    Modelo        NVARCHAR(100),
    NumeroSerie   NVARCHAR(100),
    IP            NVARCHAR(50),
    LocalId       INT REFERENCES TBLocais(Id),
    Ativo         BIT DEFAULT 1,
    CriadoEm      DATETIME DEFAULT GETDATE()
);

-- Faixas de monitoramento
CREATE TABLE TBFaixas (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nome          NVARCHAR(100) NOT NULL,
    Sentido       NVARCHAR(50),
    LocalId       INT REFERENCES TBLocais(Id),
    EquipamentoId INT REFERENCES TBEquipamentos(Id),
    Ativa         BIT DEFAULT 1,
    CriadoEm      DATETIME DEFAULT GETDATE()
);

-- Operações de monitoramento
CREATE TABLE TBOperacoes (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Descricao     NVARCHAR(500),
    DataInicio    DATETIME NOT NULL,
    DataFim       DATETIME,
    LocalId       INT REFERENCES TBLocais(Id),
    EquipamentoId INT REFERENCES TBEquipamentos(Id),
    Status        NVARCHAR(50) DEFAULT 'Ativa',
    CriadoEm      DATETIME DEFAULT GETDATE()
);

-- Passagens detectadas
CREATE TABLE TBPassagens (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Placa         NVARCHAR(20),
    DataPassagem  DATETIME NOT NULL,
    Velocidade    DECIMAL(10,2),
    FaixaId       INT REFERENCES TBFaixas(Id),
    EquipamentoId INT REFERENCES TBEquipamentos(Id),
    LocalId       INT REFERENCES TBLocais(Id),
    ImagemPath    NVARCHAR(500),
    CriadoEm      DATETIME DEFAULT GETDATE()
);

-- Heartbeat dos equipamentos
CREATE TABLE TBHeartbeatEquipamentos (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    EquipamentoId INT REFERENCES TBEquipamentos(Id),
    Status        NVARCHAR(50),
    UltimoSinal   DATETIME DEFAULT GETDATE()
);

-- Usuários do sistema
CREATE TABLE TBUsuarios (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nome          NVARCHAR(200) NOT NULL,
    Email         NVARCHAR(200),
    Login         NVARCHAR(100),
    PerfilId      INT,
    Ativo         BIT DEFAULT 1,
    CriadoEm      DATETIME DEFAULT GETDATE()
);

-- Perfis de acesso
CREATE TABLE TBPerfis (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nome          NVARCHAR(100) NOT NULL,
    Descricao     NVARCHAR(500)
);

-- Configurações do sistema
CREATE TABLE TBConfiguracoes (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Chave         NVARCHAR(200) NOT NULL,
    Valor         NVARCHAR(MAX),
    Grupo         NVARCHAR(100)
);

-- Índices
CREATE INDEX IX_Passagens_Data ON TBPassagens(DataPassagem);
CREATE INDEX IX_Passagens_Placa ON TBPassagens(Placa);
CREATE INDEX IX_Equipamentos_Local ON TBEquipamentos(LocalId);
CREATE INDEX IX_Operacoes_Local ON TBOperacoes(LocalId);
CREATE INDEX IX_Faixas_Local ON TBFaixas(LocalId);
