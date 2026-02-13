/****** Object:  UserDefinedFunction [dbo].[HasAccessEquipment]    Script Date: 12/02/2026 10:05:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   FUNCTION [dbo].[HasAccessEquipment](
    @userId UNIQUEIDENTIFIER, 
    @equipamentoId UNIQUEIDENTIFIER,
    @operacaoRecursoId UNIQUEIDENTIFIER,
    @operacaoId UNIQUEIDENTIFIER
)
RETURNS BIT
WITH INLINE = ON
AS
BEGIN
    RETURN (
        SELECT CAST(
            CASE 
                WHEN NOT EXISTS (SELECT 1 FROM TBUsuariosGrupoEquipamentos WHERE Usuario_id = @userId)
                    THEN 1
                WHEN @equipamentoId IS NOT NULL AND EXISTS (
                    SELECT 1
                    FROM TBUsuariosGrupoEquipamentos ug   
                    INNER JOIN TBEquipamentos e ON e.GrupoEquipamento_id = ug.GrupoEquipamento_id  
                    WHERE ug.Usuario_id = @userId AND e.Id = @equipamentoId
                ) THEN 1
                WHEN @operacaoRecursoId IS NOT NULL AND EXISTS (
                    SELECT 1
                    FROM TBOperacoesRecursos opr
                    INNER JOIN TBOperacoesRecursosFaixas oprf ON oprf.OperacaoRecurso_id = opr.Id
                    INNER JOIN TBFaixas f ON f.Id = oprf.Faixa_id
                    INNER JOIN TBOperacoesFaixas opf ON opf.Faixa_id = f.Id
                    INNER JOIN TBOperacoes op ON op.Id = opf.Operacao_id
                    INNER JOIN TBEquipamentos eq ON eq.Id = op.Equipamento_id
                    INNER JOIN TBUsuariosGrupoEquipamentos uge ON uge.GrupoEquipamento_id = eq.GrupoEquipamento_id
                    WHERE uge.Usuario_id = @userId AND opr.Id = @operacaoRecursoId
                ) THEN 1
                WHEN @operacaoId IS NOT NULL AND EXISTS (
                    SELECT 1
                    FROM TBOperacoes op
                    INNER JOIN TBEquipamentos eq ON eq.Id = op.Equipamento_id
                    INNER JOIN TBUsuariosGrupoEquipamentos uge ON uge.GrupoEquipamento_id = eq.GrupoEquipamento_id
                    WHERE uge.Usuario_id = @userId AND op.Id = @operacaoId
                ) THEN 1
                ELSE 0
            END AS BIT)
    );
END
GO
/****** Object:  Table [dbo].[TBAcessoPorIps]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBAcessoPorIps](
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Id] [uniqueidentifier] NOT NULL,
	[Ip] [nvarchar](45) NOT NULL,
	[MascaraCidr] [nvarchar](20) NULL,
	[ValidoAte] [datetime] NULL,
	[Ativo] [bit] NOT NULL,
	[Descricao] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBAcessoPorIps] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBAcessosBloqueadosPeriodo]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBAcessosBloqueadosPeriodo](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataInicio] [datetime] NOT NULL,
	[DataFim] [datetime] NOT NULL,
	[Motivo] [nvarchar](200) NOT NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBAcessosBloqueadosPeriodo] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBAfericoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBAfericoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataAfericao] [datetime] NOT NULL,
	[DataVencimento] [datetime] NOT NULL,
	[DataEmissao] [datetime] NOT NULL,
	[NumeroLacre] [nvarchar](20) NOT NULL,
	[NumeroInmetro] [nvarchar](20) NOT NULL,
	[NumeroSerie] [nvarchar](40) NOT NULL,
	[NumeroLaudo] [nvarchar](20) NOT NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
	[TipoAfericao_id] [uniqueidentifier] NOT NULL,
	[StatusLacre] [nvarchar](30) NOT NULL,
	[DataLacreRompido] [datetime] NULL,
 CONSTRAINT [PK_TBAfericoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBAjustesContratuais]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBAjustesContratuais](
	[Id] [uniqueidentifier] NOT NULL,
	[DataInicio] [date] NOT NULL,
	[ValorAjuste] [float] NOT NULL,
	[Contrato_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBAjustesContratuais] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBArcoNos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBArcoNos](
	[Id] [uniqueidentifier] NOT NULL,
	[Arco_id] [uniqueidentifier] NOT NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[Centroide] [bit] NULL,
 CONSTRAINT [PK_TBArcoNos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBArcos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBArcos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_TBArcos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBCamposLayoutArquivos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBCamposLayoutArquivos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Posicao] [int] NOT NULL,
	[TipoCampoLayoutArquivo] [nvarchar](255) NOT NULL,
	[LayoutArquivo_id] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TBCamposLayoutArquivos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBCategoriaVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBCategoriaVeiculos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Codigo] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBCategoriaVeiculos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBClassificacoesVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBClassificacoesVeiculos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Codigo] [nvarchar](50) NOT NULL,
	[Descricao] [nvarchar](100) NOT NULL,
	[LabelRedeNeural] [nvarchar](100) NULL,
	[PbtVeiculo] [float] NULL,
	[ComprimentoMaximoVeiculo] [float] NULL,
	[ComprimentoMinimoVeiculo] [float] NULL,
	[Uvp] [float] NULL,
 CONSTRAINT [PK_TBClassificacoesVeiculos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBConfiguracoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBConfiguracoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[TipoConfiguracao] [nvarchar](100) NOT NULL,
	[ValorConfiguracao] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBConfiguracoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBContratos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBContratos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](50) NOT NULL,
	[DataInicio] [datetime] NOT NULL,
	[DataFim] [datetime] NOT NULL,
	[Bdi] [float] NOT NULL,
	[Descricao] [nvarchar](50) NULL,
	[Numero] [nvarchar](20) NULL,
 CONSTRAINT [PK_TBContratos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBContratosFaixas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBContratosFaixas](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[ValorFaixa] [decimal](19, 5) NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[Contrato_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBContratosFaixas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBCores]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBCores](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Codigo] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBCores] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBDadosCronotacografos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBDadosCronotacografos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Mensagem] [nvarchar](200) NULL,
	[DataDocumento] [datetime] NULL,
	[DataVencimento] [datetime] NULL,
	[ProprietarioUf] [nvarchar](50) NULL,
	[PostoUf] [nvarchar](50) NULL,
	[TipoCertificado] [nvarchar](50) NULL,
	[NumeroCertificado] [nvarchar](50) NULL,
	[DsCertificado] [nvarchar](100) NULL,
	[Infracao_id] [bigint] NULL,
	[DataHoraConsulta] [datetime] NULL,
	[StatusCronotacografo] [nvarchar](50) NULL,
	[PassagemCronotacografo_id] [bigint] NULL,
	[PassagemMonitoramento_id] [bigint] NULL,
 CONSTRAINT [PK_TBDadosCronotacografos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBDadosPesagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBDadosPesagens](
	[Id] [bigint] NOT NULL,
	[PesoBrutoTotal] [float] NULL,
	[PesoPorEixo] [nvarchar](100) NULL,
	[DistanciaEntreEixos] [nvarchar](100) NULL,
	[Temperatura] [int] NULL,
	[QuantidadeEixo] [int] NULL,
	[TamanhoVeiculo] [int] NULL,
	[Velocidade] [int] NULL,
	[NumeroSerial] [nvarchar](20) NULL,
	[NomeClasse] [nvarchar](100) NULL,
	[Tara] [float] NULL,
 CONSTRAINT [PK_TBDadosPessagens_Id] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBDiscrepancias]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBDiscrepancias](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NOT NULL,
	[DataHoraDiscrepancia] [datetime] NOT NULL,
	[MediaPassagem] [float] NOT NULL,
	[MediaInfracao] [float] NOT NULL,
	[QuantidadePassagem] [int] NOT NULL,
	[QuantidadeInfracao] [int] NOT NULL,
	[PercentualDiscrepanciaPassagem] [float] NOT NULL,
	[PercentualDiscrepanciaInfracao] [float] NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBDiscrepancias] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBDocumentoOperacoesRecursosFaixas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBDocumentoOperacoesRecursosFaixas](
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Id] [uniqueidentifier] NOT NULL,
	[NomeDocumento] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[OperacaoRecurso_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBDocumentoOperacoesRecursosFaixas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBDocumentosAfericoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBDocumentosAfericoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeDocumento] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[Afericao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBDocumentosAfericoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBDocumentosOperacoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBDocumentosOperacoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeDocumento] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBDocumentosOperacoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBEixoPesagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBEixoPesagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Numero] [int] NOT NULL,
	[Distancia] [int] NOT NULL,
	[Tipo] [nvarchar](50) NOT NULL,
	[Peso] [float] NOT NULL,
	[PesoDireito] [float] NOT NULL,
	[PesoEsquerdo] [float] NOT NULL,
	[Limite] [int] NOT NULL,
	[Ordem] [int] NOT NULL,
	[GrupoEixoPesagem_id] [uniqueidentifier] NOT NULL,
	[TicketPesagem_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBEixoPesagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBEnquadramentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBEnquadramentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Codigo] [nvarchar](50) NOT NULL,
	[Descricao] [nvarchar](max) NULL,
	[Valor] [decimal](10, 2) NULL,
	[ResponsavelInfracao] [nvarchar](50) NOT NULL,
	[ArtigoCtb] [nvarchar](10) NULL,
	[GravidadeInfracao] [nvarchar](50) NULL,
	[TipoConversao] [nvarchar](50) NULL,
	[TipoFaixaExclusiva] [nvarchar](50) NULL,
	[TipoInfracao] [nvarchar](50) NOT NULL,
	[TipoInfracaoExcessoPeso] [nvarchar](50) NULL,
 CONSTRAINT [PK_TBCodigosInfracoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBEquipamentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Codigo] [nvarchar](100) NOT NULL,
	[ModeloEquipamento_id] [uniqueidentifier] NOT NULL,
	[TipoEquipamento_id] [uniqueidentifier] NOT NULL,
	[LayoutArquivo_id] [uniqueidentifier] NULL,
	[ModoOperacao] [nvarchar](50) NOT NULL,
	[GrupoEquipamento_id] [uniqueidentifier] NULL,
	[NumeroSerie] [nvarchar](25) NULL,
	[DesabilitarLimiteHorasImportacao] [bit] NOT NULL,
	[NumeroCertificadoInmetro] [nvarchar](100) NULL,
	[EmissaoCertificadoInmetro] [date] NULL,
	[VencimentoCertificadoInmetro] [date] NULL,
 CONSTRAINT [PK_TBEquipamentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UN_TBEquipamentos_Codigo] UNIQUE NONCLUSTERED 
(
	[Codigo] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBEspecieVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBEspecieVeiculos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Codigo] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBEspecieVeiculos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBEventosEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBEventosEquipamentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Descricao] [nvarchar](100) NOT NULL,
	[DataHoraRegistro] [datetime] NOT NULL,
	[TipoEventoEquipamento] [nvarchar](50) NOT NULL,
	[Correcao] [bit] NOT NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[Equipamento_id] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TBEventosEquipamentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBExcecaoDatas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBExcecaoDatas](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Excecao_id] [uniqueidentifier] NOT NULL,
	[DataHoraInicio] [datetime] NOT NULL,
	[DataHoraFim] [datetime] NOT NULL,
 CONSTRAINT [PK_TBExcecaoDatas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBExcecoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBExcecoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Descricao] [nvarchar](50) NOT NULL,
	[Habilitada] [bit] NOT NULL,
	[Automatica] [bit] NOT NULL,
	[MotivoDescarte_id] [uniqueidentifier] NOT NULL,
	[DataInicial] [datetime] NULL,
	[DataFinal] [datetime] NULL,
	[CriadoPelaApi] [bit] NOT NULL,
 CONSTRAINT [PK_TBExcecoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBExcecoesClassificacoesVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBExcecoesClassificacoesVeiculos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[ClassificacaoVeiculo_id] [uniqueidentifier] NOT NULL,
	[Excecao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBExcecoesClassificacoesVeiculos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBExcecoesEnquadramentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBExcecoesEnquadramentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[InfracaoEnquadramento_id] [uniqueidentifier] NOT NULL,
	[Excecao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBExcecoesEnquadramentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBExcecoesFaixas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBExcecoesFaixas](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[Excecao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBExcecoesFaixas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBExcecoesHorarios]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBExcecoesHorarios](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Excecao_id] [uniqueidentifier] NOT NULL,
	[HoraInicio] [time](7) NOT NULL,
	[HoraFim] [time](7) NOT NULL,
	[DiaSemana] [nvarchar](20) NULL,
 CONSTRAINT [PK_TBExcecoesHorarios] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBExcecoesPlacas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBExcecoesPlacas](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Excecao_id] [uniqueidentifier] NOT NULL,
	[Placa] [nvarchar](7) NULL,
	[DataValidadePlaca] [datetime] NULL,
 CONSTRAINT [PK_TBExcecoesPlacas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBFabricantes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBFabricantes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](150) NOT NULL,
	[Client_Id] [nvarchar](50) NULL,
	[ApiKey] [nvarchar](50) NULL,
	[AgrupadorSequencial] [nvarchar](10) NULL,
	[CodigoFabricante] [nvarchar](30) NULL,
	[Certificado] [nvarchar](max) NULL,
	[ImagemCriptografada] [bit] NOT NULL,
 CONSTRAINT [PK_TBFabricantes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBFaixas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBFaixas](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NumeroFaixa] [nvarchar](150) NOT NULL,
	[Sentido] [nvarchar](150) NOT NULL,
	[Codigo] [nvarchar](20) NULL,
	[Logradouro] [nvarchar](250) NULL,
	[Numero] [nvarchar](20) NULL,
	[Complemento] [nvarchar](100) NULL,
	[Bairro] [nvarchar](100) NULL,
	[Municipio] [nvarchar](100) NULL,
	[CodigoMunicipio] [nvarchar](10) NULL,
	[Uf] [nvarchar](2) NULL,
	[CodigoLogradouro] [nvarchar](10) NULL,
	[Latitude] [real] NULL,
	[Longitude] [real] NULL,
	[CepFaixa] [nvarchar](9) NULL,
 CONSTRAINT [PK_TBFaixas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBFaixasAfericoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBFaixasAfericoes](
	[Afericao_id] [uniqueidentifier] NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBFormaAtuacao]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBFormaAtuacao](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Codigo] [int] NOT NULL,
	[Nome] [nvarchar](250) NOT NULL,
 CONSTRAINT [PK_TBFormaAtuacao] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBGrupoEixoPesagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBGrupoEixoPesagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Numero] [int] NOT NULL,
	[QuantidadeEixos] [int] NOT NULL,
	[Distancia] [float] NULL,
	[Tipo] [nvarchar](50) NOT NULL,
	[Peso] [float] NOT NULL,
	[TicketPesagem_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBGrupoEixoPesagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBGrupoEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBGrupoEquipamentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](50) NOT NULL,
	[DesabilitarMonitoramento] [bit] NOT NULL,
	[Cor] [nvarchar](7) NULL,
	[DesabilitarLimiteHorasImportacao] [bit] NOT NULL,
 CONSTRAINT [PK_TBGrupoEquipamentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBHeartbeatEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBHeartbeatEquipamentos](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[DataHoraHeartbeat] [datetime] NOT NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBHistoricoImagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBHistoricoImagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataHistorico] [datetime] NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[ImagemId] [uniqueidentifier] NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBHistoricoImagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBHistoricoTriagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBHistoricoTriagens](
	[Id] [uniqueidentifier] NOT NULL,
	[Infracao_id] [bigint] NOT NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
	[MotivoDescarte_id] [uniqueidentifier] NULL,
	[NovoStatusProcessamento] [nvarchar](25) NULL,
	[DataHora] [datetime] NOT NULL,
	[NovaPlaca] [nvarchar](7) NULL,
	[StatusProcessamentoAnterior] [nvarchar](25) NULL,
	[PlacaAnterior] [nvarchar](7) NULL,
	[Descricao] [nvarchar](500) NULL,
 CONSTRAINT [PK_TBHistoricoTriagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBHistoricoTriagensCronotacografos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBHistoricoTriagensCronotacografos](
	[Id] [uniqueidentifier] NOT NULL,
	[PassagemCronotacografo_id] [bigint] NOT NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
	[MotivoDescarte_id] [uniqueidentifier] NULL,
	[NovoStatusProcessamento] [nvarchar](25) NULL,
	[StatusProcessamentoAnterior] [nvarchar](25) NULL,
	[DataHora] [datetime] NOT NULL,
	[NovaPlaca] [nvarchar](7) NULL,
	[PlacaAnterior] [nvarchar](7) NULL,
	[Descricao] [nvarchar](500) NULL,
 CONSTRAINT [PK_TBHistoricoTriagensCronotacografos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBHorariosAcessos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBHorariosAcessos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DiaSemana] [nvarchar](150) NOT NULL,
	[HoraInicio] [time](7) NOT NULL,
	[HoraFim] [time](7) NOT NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBHorariosAcessos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBImagemPassagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBImagemPassagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeImagem] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[TipoImagem_id] [uniqueidentifier] NULL,
	[Passagem_id] [bigint] NULL,
	[AssinaturaHash] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBImagemPassagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBImagemPassagensCronotacografos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBImagemPassagensCronotacografos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeImagem] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[TipoImagem_id] [uniqueidentifier] NULL,
	[PassagemCronotacografo_id] [bigint] NULL,
	[AssinaturaHash] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBImagemPassagensCronotacografos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBImagemPassagensMonitoramentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBImagemPassagensMonitoramentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeImagem] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[TipoImagem_id] [uniqueidentifier] NULL,
	[PassagemMonitoramento_id] [bigint] NULL,
	[AssinaturaHash] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBImagemPassagensMonitoramentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBImagemPesagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBImagemPesagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeImagem] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[TicketPesagem_id] [uniqueidentifier] NOT NULL,
	[TipoImagem_id] [uniqueidentifier] NULL,
	[AssinaturaHash] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBImagemPesagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBImagemTestes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBImagemTestes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[TesteEquipamento_id] [uniqueidentifier] NOT NULL,
	[TipoImagem_id] [uniqueidentifier] NULL,
	[NomeImagem] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[AssinaturaHash] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBImagemTestes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBImagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBImagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeImagem] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[Infracao_id] [bigint] NOT NULL,
	[TipoImagem_id] [uniqueidentifier] NULL,
	[AssinaturaHash] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBImagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBImagensPassagensConjugadas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBImagensPassagensConjugadas](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeImagem] [nvarchar](500) NOT NULL,
	[Caminho] [nvarchar](max) NOT NULL,
	[TipoImagem_id] [uniqueidentifier] NULL,
	[PassagemConjugada_id] [bigint] NULL,
	[AssinaturaHash] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBImagensPassagensConjugadas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBIndicesPerformances]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBIndicesPerformances](
	[Id] [uniqueidentifier] NOT NULL,
	[TipoIndice] [nvarchar](20) NOT NULL,
	[PercentualIndice] [float] NOT NULL,
	[PercentualMulta] [float] NOT NULL,
 CONSTRAINT [PK_TBIndicesPerformances] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBInfracoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBInfracoes](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
	[Faixa_id] [uniqueidentifier] NULL,
	[Enquadramento_id] [uniqueidentifier] NULL,
	[StatusProcessamento] [nvarchar](200) NOT NULL,
	[PlacaVeiculo] [nvarchar](10) NULL,
	[DataHoraPassagem] [datetime] NULL,
	[VelocidadeRegulamentada] [int] NOT NULL,
	[VelocidadeMedida] [int] NOT NULL,
	[VelocidadeConsiderada] [int] NOT NULL,
	[TamanhoVeiculo] [int] NOT NULL,
	[SequencialInfracao] [bigint] NOT NULL,
	[ClassificacaoVeiculo_id] [uniqueidentifier] NULL,
	[ReClassificado] [bit] NULL,
	[ErroOcr] [bit] NULL,
	[Monitoramento_id] [uniqueidentifier] NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[LoteExportacao_id] [uniqueidentifier] NULL,
	[NumeroAuto] [nvarchar](50) NULL,
	[TempoAvancoSinal] [int] NULL,
	[TempoParadaFaixa] [int] NULL,
	[TipoConversao] [nvarchar](50) NULL,
	[TipoFaixaExclusiva] [nvarchar](50) NULL,
	[TipoInfracao] [nvarchar](50) NULL,
	[Homologacao] [bit] NULL,
	[IsDeleted] [bit] NULL,
	[DeletedAt] [datetime] NULL,
	[LoteImportacao_id] [uniqueidentifier] NULL,
	[PlacaVeiculoOcr] [nvarchar](20) NULL,
	[NumeroCertificadoInmetro] [nvarchar](100) NULL,
	[InfracaoExportacaoId] [nvarchar](50) NULL,
	[InfracaoExportacaoMessagem] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBInfracoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBInfracoesEnquadramentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBInfracoesEnquadramentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[TipoInfracao] [nvarchar](50) NOT NULL,
	[Enquadramento_id] [uniqueidentifier] NOT NULL,
	[TipoConversao] [nvarchar](50) NULL,
	[Porcentagem] [float] NULL,
	[TipoFaixaExclusiva] [nvarchar](50) NULL,
	[TempoRetardo] [float] NULL,
	[TempoPermanencia] [float] NULL,
	[StatusCronotacografo] [nvarchar](50) NULL,
	[PrazoReincidencia] [int] NULL,
	[MotivoDescarteReincidente_id] [uniqueidentifier] NULL,
	[TipoInfracaoExcessoPeso] [nvarchar](50) NULL,
 CONSTRAINT [PK_TBInfracoesEnquadramentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBInfracoesExcessoPeso]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBInfracoesExcessoPeso](
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Id] [uniqueidentifier] NOT NULL,
	[Infracao_Id] [bigint] NOT NULL,
	[PesoConstatado] [float] NOT NULL,
	[Classificacao] [nvarchar](5) NOT NULL,
	[Eixos] [nvarchar](5) NOT NULL,
	[PesoConsiderado] [float] NULL,
	[PesoRegulamentado] [float] NULL,
	[ExcessoPeso] [float] NULL,
	[DataHoraPesagem] [datetime] NOT NULL,
	[BalancaInmetro] [nvarchar](20) NOT NULL,
	[NumeroAIIP] [nvarchar](255) NOT NULL,
	[NumeroPesagem] [nvarchar](255) NOT NULL,
	[ExcessoPesoGrupoEixos] [float] NOT NULL,
	[TipoInfracaoExcessoPeso] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_TBInfracoesExcessoPeso] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBInfracoesPesagemEixos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBInfracoesPesagemEixos](
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Id] [uniqueidentifier] NOT NULL,
	[NumeroEixo] [nvarchar](2) NOT NULL,
	[PesoConstatado] [float] NOT NULL,
	[PesoRegulamentado] [float] NOT NULL,
	[DistanciaEixo] [nvarchar](255) NOT NULL,
	[ExcessoPeso] [float] NOT NULL,
	[Codigo] [nvarchar](10) NULL,
	[PesoConsiderado] [float] NULL,
	[InfracaoExcessoPeso_Id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBInfracoesPesagemEixos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBLayoutArquivos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBLayoutArquivos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBLayoutArquivos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBLocais]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBLocais](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Latitude] [float] NULL,
	[Longitude] [float] NULL,
	[Codigo] [nvarchar](255) NOT NULL,
	[Centroide] [bit] NOT NULL,
	[Regiao_id] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TBLocais] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBLogsAcessos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBLogsAcessos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataHoraAcesso] [datetime] NULL,
	[CaminhoUrl] [nvarchar](2000) NULL,
	[HostPublicoAcesso] [nvarchar](50) NULL,
	[HostLocalAcesso] [nvarchar](50) NULL,
	[UserAgent] [nvarchar](2000) NULL,
	[MethodRequest] [nvarchar](50) NULL,
	[BodyRequest] [nvarchar](max) NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBLogsAcessos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBLoteExportacoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBLoteExportacoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataHoraGeracao] [datetime] NOT NULL,
	[Sequencial] [bigint] NOT NULL,
	[UrlArquivo] [nvarchar](2000) NULL,
	[StatusExportacao] [nvarchar](50) NOT NULL,
	[Mensagem] [nvarchar](max) NULL,
	[DataIncialInfracoes] [datetime] NOT NULL,
	[DataFinalInfracoes] [datetime] NOT NULL,
	[SequencialInicio] [int] NULL,
	[SequencialFim] [int] NULL,
	[Prefixo] [nvarchar](10) NULL,
	[TipoInfracao] [nvarchar](50) NULL,
	[SequencialLoteOrigem] [bigint] NULL,
 CONSTRAINT [PK_TBLoteExportacoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBLoteImportacaoErros]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBLoteImportacaoErros](
	[Id] [uniqueidentifier] NOT NULL,
	[LoteImportacao_id] [uniqueidentifier] NULL,
	[CodigoErro] [nvarchar](5) NULL,
	[DescicaoErro] [nvarchar](255) NULL,
	[Sequencia] [nvarchar](5) NULL,
 CONSTRAINT [PK_TBLoteImportacaoErros] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBLoteImportacoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBLoteImportacoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[NomeArquivoEntrada] [nvarchar](40) NOT NULL,
	[CodigoFabricante] [nvarchar](50) NULL,
	[NumeroFaixa] [tinyint] NULL,
	[TipoImportacao] [nvarchar](20) NOT NULL,
	[StatusImportacao] [nvarchar](20) NOT NULL,
	[CodigoEquipamento] [nvarchar](12) NULL,
	[DataRemessa] [date] NULL,
	[HoraInicio] [nvarchar](6) NULL,
	[HoraFim] [nvarchar](6) NULL,
	[UrlArquivoEntrada] [nvarchar](255) NULL,
	[NomeArquivoRetorno] [nvarchar](60) NULL,
	[CodigoErro] [nvarchar](255) NULL,
	[Excecao] [nvarchar](255) NULL,
	[Equipamento_id] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TBLoteImportacoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMarcaModeloVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMarcaModeloVeiculos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Modelo] [nvarchar](100) NOT NULL,
	[Codigo] [nvarchar](100) NOT NULL,
	[Keywords] [nvarchar](500) NULL,
	[Marca] [nvarchar](50) NULL,
	[CodigoExterno] [nvarchar](100) NULL,
 CONSTRAINT [PK_TBMarcaModeloVeiculos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMarcaVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMarcaVeiculos](
	[Id] [uniqueidentifier] NOT NULL,
	[Codigo] [nvarchar](100) NOT NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[CodigoExterno] [nvarchar](100) NULL,
	[Keywords] [nvarchar](500) NULL,
 CONSTRAINT [PK_TBMarcaVeiculos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMedicaoEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMedicaoEquipamentos](
	[Medicao_id] [uniqueidentifier] NOT NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBMedicaoEquipamentos] PRIMARY KEY CLUSTERED 
(
	[Medicao_id] ASC,
	[Equipamento_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMedicaoFaixas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMedicaoFaixas](
	[Id] [uniqueidentifier] NOT NULL,
	[Medicao_id] [uniqueidentifier] NOT NULL,
	[Equipamento] [nvarchar](255) NOT NULL,
	[Endereco] [nvarchar](255) NOT NULL,
	[CodigoFaixa] [nvarchar](255) NOT NULL,
	[NumeroFaixa] [int] NOT NULL,
	[TotalInfracoes] [int] NOT NULL,
	[Validas] [int] NOT NULL,
	[Invalidas] [int] NOT NULL,
	[IP] [float] NOT NULL,
	[PercentualImgInvalidas] [float] NOT NULL,
	[MultaPercentualImgInvalidas] [decimal](19, 5) NOT NULL,
	[MultaImagensInvalidas] [decimal](19, 5) NOT NULL,
	[HorasPrevistas] [float] NOT NULL,
	[HorasOperacao] [float] NOT NULL,
	[HorasParalisadas] [float] NOT NULL,
	[DescontoHorasParalisadas] [decimal](19, 5) NOT NULL,
	[DescontoTotalPorFaixa] [decimal](19, 5) NOT NULL,
	[ValorPrevistoPorFaixa] [decimal](19, 5) NOT NULL,
	[ValorTotalPorFaixa] [decimal](19, 5) NOT NULL,
	[Bdi] [float] NOT NULL,
	[ValorBdi] [decimal](19, 5) NOT NULL,
	[ValorTotalBdi] [decimal](19, 5) NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[ContagemVeiculos] [int] NOT NULL,
	[HorasJustificadas] [float] NOT NULL,
	[HorasSemJustificativas] [float] NOT NULL,
	[TotalHorasOperadas] [float] NOT NULL,
	[ContratoNumero] [nvarchar](20) NULL,
	[ContratoDescricao] [nvarchar](50) NULL,
	[Equipamento_id] [uniqueidentifier] NULL,
	[PlacasLidas] [int] NULL,
	[IndiceOcr] [float] NULL,
	[Testes] [int] NULL,
	[IndiceOperacao] [float] NULL,
	[PercentualMultaIndiceOcr] [float] NULL,
	[MultaIndiceOcr] [decimal](19, 5) NULL,
 CONSTRAINT [PK_TBMedicaoFaixas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMedicaoInformacoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMedicaoInformacoes](
	[Id] [uniqueidentifier] NOT NULL,
	[Descricao] [nvarchar](250) NULL,
	[Valor] [decimal](10, 2) NOT NULL,
	[TipoInformacaoAdicional] [nvarchar](10) NULL,
	[Medicao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBMedicaoInformacoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMedicoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMedicoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataInicio] [datetime] NOT NULL,
	[DataFim] [datetime] NOT NULL,
	[StatusMedicao] [nvarchar](50) NOT NULL,
	[GrupoEquipamento_id] [uniqueidentifier] NOT NULL,
	[Sequencial] [bigint] NOT NULL,
	[Usuario_id] [uniqueidentifier] NULL,
	[NotaDeEmpenho] [nvarchar](50) NULL,
 CONSTRAINT [PK_TBMedicoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UN_TBMedicoes_Sequencial] UNIQUE NONCLUSTERED 
(
	[Sequencial] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBModeloEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBModeloEquipamentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Marca] [nvarchar](50) NOT NULL,
	[Modelo] [nvarchar](50) NOT NULL,
	[NumeroPortaria] [nvarchar](20) NOT NULL,
	[Portaria] [nvarchar](50) NOT NULL,
	[Fabricante_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBModeloEquipamentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMonitoramentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMonitoramentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Usuario_id] [uniqueidentifier] NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[InicioOperacao] [datetime] NOT NULL,
	[FimOperacao] [datetime] NULL,
 CONSTRAINT [PK_TBMonitoramentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMotivoDescarteTipoInfracoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMotivoDescarteTipoInfracoes](
	[Id] [uniqueidentifier] NOT NULL,
	[MotivoDescarte_id] [uniqueidentifier] NOT NULL,
	[TipoInfracao] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_TBMotivoDescarteTipoInfracoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMotivosDescartes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMotivosDescartes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Codigo] [nvarchar](100) NOT NULL,
	[Descricao] [nvarchar](100) NOT NULL,
	[Descarte] [bit] NOT NULL,
	[TipoMotivoDescarte] [nvarchar](50) NOT NULL,
	[Habilitado] [bit] NOT NULL,
 CONSTRAINT [PK_TBMotivosDescartes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMotivoTicketPesagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMotivoTicketPesagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](255) NOT NULL,
	[TipoMotivo] [nvarchar](100) NOT NULL,
	[ProcessoTicketPesagem] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBMotivoTicketPesagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBMunicipios]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBMunicipios](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Codigo] [nvarchar](50) NOT NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[UF] [nvarchar](2) NOT NULL,
 CONSTRAINT [PK_TBMunicipios] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBOperacoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBOperacoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
	[DataInstalacao] [datetime] NOT NULL,
	[DataInicial] [datetime] NOT NULL,
	[DataFinal] [datetime] NOT NULL,
	[Tarja_id] [uniqueidentifier] NULL,
	[TicketPesagemOperacao] [nvarchar](50) NULL,
	[OrgaoAutuador_id] [uniqueidentifier] NULL,
	[Cronotacografo] [bit] NOT NULL,
	[Monitoramento] [bit] NOT NULL,
	[Balanca] [bit] NULL,
	[Homologacao] [bit] NULL,
	[DesabilitarMonitoramento] [bit] NOT NULL,
	[UltimoHeartbeat] [datetime] NULL,
	[DataAceite] [datetime] NULL,
	[DataHomologacao] [datetime] NULL,
	[EquipamentoConjugado_id] [uniqueidentifier] NULL,
	[GeraInfracaoPassagem] [bit] NOT NULL,
	[DataHoraUltimaPassagem] [datetime] NULL,
	[DataHoraUltimaInfracao] [datetime] NULL,
 CONSTRAINT [PK_TBOperacoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBOperacoesFaixas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBOperacoesFaixas](
	[Id] [uniqueidentifier] NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
	[Velocidade] [int] NULL,
 CONSTRAINT [PK_TBOperacoesFaixas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBOperacoesInfracoesEnquadramentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBOperacoesInfracoesEnquadramentos](
	[InfracaoEnquadramento_id] [uniqueidentifier] NOT NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBOperacoesInfracoesEnquadramentos] PRIMARY KEY CLUSTERED 
(
	[InfracaoEnquadramento_id] ASC,
	[Operacao_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBOperacoesInterrupcoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBOperacoesInterrupcoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[DataInterrupcao] [date] NOT NULL,
	[HoraInicio] [time](7) NOT NULL,
	[HoraFim] [time](7) NOT NULL,
	[TotalHoras] [float] NOT NULL,
	[Observacao] [nvarchar](500) NULL,
	[Automatico] [bit] NOT NULL,
 CONSTRAINT [PK_TBOperacoesInterrupcoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBOperacoesRecursos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBOperacoesRecursos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataRecurso] [datetime] NOT NULL,
	[TipoRecurso] [nvarchar](50) NOT NULL,
	[Quantidade] [float] NOT NULL,
	[Observacao] [nvarchar](500) NULL,
	[StatusRecurso] [nvarchar](50) NULL,
	[IsentarTudo] [bit] NOT NULL,
 CONSTRAINT [PK_TBOperacoesRecursos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBOperacoesRecursosFaixas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBOperacoesRecursosFaixas](
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[OperacaoRecurso_id] [uniqueidentifier] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBOperacoesRecursosHistorico]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBOperacoesRecursosHistorico](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataHoraCriacao] [datetime] NULL,
	[CaminhoUrl] [nvarchar](2000) NULL,
	[HostPublicoAcesso] [nvarchar](50) NULL,
	[HostLocalAcesso] [nvarchar](50) NULL,
	[UserAgent] [nvarchar](2000) NULL,
	[MethodRequest] [nvarchar](50) NULL,
	[BodyRequest] [nvarchar](max) NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
	[OperacaoRecurso_id] [uniqueidentifier] NOT NULL,
	[StatusRecurso] [nvarchar](50) NULL,
	[TipoRecurso] [nvarchar](50) NULL,
	[Quantidade] [float] NULL,
 CONSTRAINT [PK_TBOperacoesRecursosHistorico] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBOrgaosAutuadores]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBOrgaosAutuadores](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBOrgaosAutuadores] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPassagemDadosVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPassagemDadosVeiculos](
	[Passagem_id] [bigint] NOT NULL,
	[CodigoCor] [nvarchar](100) NULL,
	[CodigoMarca] [nvarchar](100) NULL,
	[CodigoMarcaModelo] [nvarchar](100) NULL,
	[Cor] [nvarchar](100) NULL,
	[Marca] [nvarchar](100) NULL,
	[MarcaModelo] [nvarchar](100) NULL,
 CONSTRAINT [PK_TBPassagemDadosVeiculos_Passagem_id] PRIMARY KEY CLUSTERED 
(
	[Passagem_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPassagemMonitoramentoDadosVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPassagemMonitoramentoDadosVeiculos](
	[Passagem_Monitoramento_id] [bigint] NOT NULL,
	[CodigoCor] [nvarchar](100) NULL,
	[CodigoMarca] [nvarchar](100) NULL,
	[CodigoMarcaModelo] [nvarchar](100) NULL,
	[Cor] [nvarchar](100) NULL,
	[Marca] [nvarchar](100) NULL,
	[MarcaModelo] [nvarchar](100) NULL,
 CONSTRAINT [PK_TBPassagemMonitoramentoDadosVeiculos_Passagem_Monitoramento_id] PRIMARY KEY CLUSTERED 
(
	[Passagem_Monitoramento_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPassagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPassagens](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataHoraPassagem] [datetime] NOT NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[Equipamento_id] [uniqueidentifier] NULL,
	[Faixa_id] [uniqueidentifier] NULL,
	[ClassificacaoVeiculo_id] [uniqueidentifier] NULL,
	[PlacaVeiculo] [nvarchar](10) NULL,
	[VelocidadeMedida] [smallint] NULL,
	[VelocidadeConsiderada] [smallint] NULL,
	[TamanhoVeiculo] [smallint] NULL,
	[QuantidadeEixo] [smallint] NULL,
	[Infracao_id] [bigint] NULL,
	[LoteImportacao_id] [uniqueidentifier] NULL,
	[PesoBrutoTotal] [float] NULL,
	[DistanciaPorEixo] [float] NULL,
	[DistanciaEntreEixos] [float] NULL,
	[IntervaloEntreVeiculos] [time](7) NULL,
	[CaminhoImagem] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBPassagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPassagensConjugadas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPassagensConjugadas](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataHoraPassagem] [datetime] NOT NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[Equipamento_id] [uniqueidentifier] NULL,
	[Faixa_id] [uniqueidentifier] NULL,
	[ClassificacaoVeiculo_id] [uniqueidentifier] NULL,
	[PlacaVeiculo] [nvarchar](10) NULL,
	[FoiGeradaInfracao] [bit] NOT NULL,
 CONSTRAINT [PK_TBPassagensConjugadas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPassagensCronotacografos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPassagensCronotacografos](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[StatusProcessamento] [nvarchar](50) NULL,
	[DataCriacao] [datetime] NULL,
	[DataHoraPassagem] [datetime] NOT NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[Equipamento_id] [uniqueidentifier] NULL,
	[Local_id] [uniqueidentifier] NULL,
	[Faixa_id] [uniqueidentifier] NULL,
	[ClassificacaoVeiculo_id] [uniqueidentifier] NULL,
	[LoteImportacao_id] [uniqueidentifier] NULL,
	[PlacaVeiculo] [nvarchar](10) NULL,
	[VelocidadeMedida] [smallint] NULL,
	[VelocidadeConsiderada] [smallint] NULL,
	[TamanhoVeiculo] [smallint] NULL,
	[QuantidadeEixo] [smallint] NULL,
 CONSTRAINT [PK_TBPassagensCronotacografos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPassagensMonitoramentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPassagensMonitoramentos](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[Monitoramento_id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataHoraPassagem] [datetime] NOT NULL,
	[StatusProcessamento] [nvarchar](50) NULL,
	[Infracao_id] [bigint] NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[Equipamento_id] [uniqueidentifier] NULL,
	[Local_id] [uniqueidentifier] NULL,
	[Faixa_id] [uniqueidentifier] NULL,
	[ClassificacaoVeiculo_id] [uniqueidentifier] NULL,
	[LoteImportacao_id] [uniqueidentifier] NULL,
	[PlacaVeiculo] [nvarchar](10) NULL,
	[VelocidadeMedida] [smallint] NULL,
	[VelocidadeConsiderada] [smallint] NULL,
	[TamanhoVeiculo] [smallint] NULL,
	[QuantidadeEixo] [smallint] NULL,
 CONSTRAINT [PK_TBPassagensMonitoramentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPerfilAcessos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPerfilAcessos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBPerfilAcessos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPerfilAcessosPermissoesAcesso]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPerfilAcessosPermissoesAcesso](
	[PerfilAcesso_id] [uniqueidentifier] NOT NULL,
	[PermissaoAcesso_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBPerfilAcessosPermissoesAcesso] PRIMARY KEY CLUSTERED 
(
	[PerfilAcesso_id] ASC,
	[PermissaoAcesso_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPermissoesAcesso]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPermissoesAcesso](
	[Id] [uniqueidentifier] NOT NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Acao] [nvarchar](255) NULL,
	[PermissaoAcessoPai_id] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TBPermissoesAcesso] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPlacasRepetidas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPlacasRepetidas](
	[PlacaVeiculo] [nvarchar](10) NULL,
	[QTDE] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPostoFuncionamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPostoFuncionamentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataHoraAbertura] [datetime] NOT NULL,
	[DataHoraFechamento] [datetime] NULL,
	[MotivoFechamento] [nvarchar](1000) NULL,
	[Posto_id] [uniqueidentifier] NULL,
	[UsuarioAbertura_id] [uniqueidentifier] NOT NULL,
	[UsuarioFechamento_id] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TBPostoFuncionamentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPostoOperacoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPostoOperacoes](
	[Id] [uniqueidentifier] NOT NULL,
	[Operacao_id] [uniqueidentifier] NULL,
	[Posto_id] [uniqueidentifier] NULL,
	[DistanciaPosto] [float] NULL,
 CONSTRAINT [PK_TBPostoOperacoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPostos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPostos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Descricao] [nvarchar](150) NOT NULL,
	[Latitude] [float] NULL,
	[Longitude] [float] NULL,
	[Rodovia] [nvarchar](50) NOT NULL,
	[Km] [nvarchar](20) NULL,
	[Logradouro] [nvarchar](250) NULL,
	[Bairro] [nvarchar](100) NOT NULL,
	[Municipio] [nvarchar](100) NOT NULL,
	[Uf] [nvarchar](2) NOT NULL,
	[Acesso] [nvarchar](200) NULL,
	[Complemento] [nvarchar](255) NULL,
	[Sentido] [nvarchar](200) NULL,
	[DecisaoFuncionamento] [nvarchar](200) NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBPostos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBPostoUsuarios]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBPostoUsuarios](
	[Posto_id] [uniqueidentifier] NOT NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBPostoUsuarios] PRIMARY KEY CLUSTERED 
(
	[Posto_id] ASC,
	[Usuario_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBQuantitativos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBQuantitativos](
	[DataHora] [datetime] NOT NULL,
	[Infracoes] [int] NOT NULL,
	[Passagens] [int] NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
	[MediaPassagens] [int] NOT NULL,
	[MediaInfracoes] [int] NOT NULL,
	[SequencialInfracoes] [int] NOT NULL,
	[SequencialPassagens] [int] NOT NULL,
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[Testes] [int] NOT NULL,
	[DataUltimaAtualizacao] [datetime] NULL,
	[Ocr] [int] NULL,
	[PlacasNaoLidas] [int] NULL,
 CONSTRAINT [PK_TBQuantitativos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBRegioes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBRegioes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_TBRegioes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBRelatoriosPowerBi]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBRelatoriosPowerBi](
	[Id] [uniqueidentifier] NOT NULL,
	[Titulo] [nvarchar](50) NOT NULL,
	[WorkspaceId] [nvarchar](50) NOT NULL,
	[ReportId] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_TBRelatoriosPowerBi] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBSequencialInfracoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBSequencialInfracoes](
	[Id] [uniqueidentifier] NOT NULL,
	[Sequencial] [bigint] NOT NULL,
	[Prefixo] [nvarchar](10) NOT NULL,
	[TipoInfracao] [nvarchar](50) NULL,
 CONSTRAINT [PK_TBSequencialInfracoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBSequencialInfracoesFalhas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBSequencialInfracoesFalhas](
	[Id] [uniqueidentifier] NOT NULL,
	[DataFalha] [datetime] NOT NULL,
	[Descricao] [nvarchar](1000) NOT NULL,
	[TotalFalhas] [int] NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBSequencialInfracoesFalhas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBSequencialLoteExportacoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBSequencialLoteExportacoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[SequencialInicial] [bigint] NOT NULL,
	[SequencialFinal] [bigint] NOT NULL,
	[TipoInfracao] [nvarchar](50) NULL,
	[AgrupadorSequencial] [nvarchar](10) NULL,
 CONSTRAINT [PK_TbSequencialLoteExportacoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTarjas]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTarjas](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Largura] [int] NOT NULL,
	[Altura] [int] NOT NULL,
	[Template] [nvarchar](max) NOT NULL,
	[PosicaoTarja] [nvarchar](100) NOT NULL,
	[TamanhoFonte] [int] NULL,
 CONSTRAINT [PK_TBTarjas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTestesEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTestesEquipamentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[DataHoraTeste] [datetime] NOT NULL,
	[Equipamento_id] [uniqueidentifier] NOT NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
	[Local_id] [uniqueidentifier] NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[LoteImportacao_id] [uniqueidentifier] NULL,
 CONSTRAINT [PK_TBTestesEquipamentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTicketPesagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTicketPesagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[EquipamentoAbertura_id] [uniqueidentifier] NOT NULL,
	[Posto_id] [uniqueidentifier] NOT NULL,
	[Faixa_id] [uniqueidentifier] NOT NULL,
	[Usuario_id] [uniqueidentifier] NULL,
	[MotivoAbertura_id] [uniqueidentifier] NOT NULL,
	[MotivoFechamento_id] [uniqueidentifier] NULL,
	[ClassificacaoVeiculo_id] [uniqueidentifier] NULL,
	[PlacaVeiculo] [nvarchar](10) NULL,
	[Sequencial] [bigint] NOT NULL,
	[DataHoraPassagem] [datetime] NOT NULL,
	[EstimativaChegadaPosto] [datetime] NULL,
	[DataHoraAbertura] [datetime] NOT NULL,
	[DataHoraFechamento] [datetime] NULL,
	[TamanhoVeiculo] [int] NULL,
	[VelocidadeMedida] [int] NULL,
	[CodigoAfericao] [nvarchar](20) NULL,
	[DataHoraAfericao] [datetime] NULL,
	[DataHoraAfericaoInmetro] [datetime] NULL,
	[QuantidadeEixo] [int] NULL,
	[DataExportacao] [datetime] NULL,
	[ErroOcr] [bit] NOT NULL,
	[DataHoraLiberacaoPesagem] [datetime] NULL,
	[MotivoDescarte] [nvarchar](max) NULL,
	[DataHoraDescarte] [datetime] NULL,
	[UsuarioTriagem_id] [uniqueidentifier] NULL,
	[EquipamentoFechamento_id] [uniqueidentifier] NULL,
	[CodigoLocal] [nvarchar](20) NULL,
 CONSTRAINT [PK_TBTicketPesagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTipoAfericoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTipoAfericoes](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBTipoAfericoes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTipoCriptografias]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTipoCriptografias](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Criptografia] [nvarchar](100) NOT NULL,
	[CerfiticadoDigital] [varbinary](max) NULL,
	[NomeCerfiticadoDigital] [nvarchar](500) NULL,
	[SenhaCerfiticadoDigital] [nvarchar](1000) NULL,
 CONSTRAINT [PK_TBTipoCriptografias] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTipoEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTipoEquipamentos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[DesabilitarMonitoramento] [bit] NOT NULL,
	[CaminhoIcone] [nvarchar](max) NULL,
 CONSTRAINT [PK_TBTipoEquipamentos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTipoEquipamentoTipoInfracaoFormaAtuacao]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTipoEquipamentoTipoInfracaoFormaAtuacao](
	[Id] [uniqueidentifier] NOT NULL,
	[TipoEquipamento_id] [uniqueidentifier] NOT NULL,
	[FormaAtuacao_id] [uniqueidentifier] NOT NULL,
	[TipoInfracao] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_TBTipoEquipamentoTipoInfracaoFormaAtuacao] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UN_TBTipoEquipamentoTipoInfracaoFormaAtuacao_TipoEquipamentoTipoInfracao] UNIQUE NONCLUSTERED 
(
	[TipoEquipamento_id] ASC,
	[TipoInfracao] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTiposImagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTiposImagens](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Codigo] [nvarchar](10) NULL,
	[Descricao] [nvarchar](50) NULL,
	[OrdemExibicao] [int] NULL,
	[TipoDeImagem] [nvarchar](20) NULL,
	[ExportarImagem] [bit] NULL,
	[CodigoExportacao] [nvarchar](12) NULL,
 CONSTRAINT [PK_TBTiposImagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTipoVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTipoVeiculos](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Codigo] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_TBTipoVeiculos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTriagens]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTriagens](
	[Id] [bigint] NOT NULL,
	[MotivoDescarte_id] [uniqueidentifier] NULL,
	[Usuario_id] [uniqueidentifier] NULL,
	[UsuarioTriagem_id] [uniqueidentifier] NULL,
	[UsuarioAuditoria_id] [uniqueidentifier] NULL,
	[InicioTriagem] [datetime] NULL,
	[InicioAuditoria] [datetime] NULL,
	[DataProcessamento] [datetime] NULL,
	[Observacao] [nvarchar](max) NULL,
	[DescarteAutomatico] [bit] NOT NULL,
 CONSTRAINT [PK_TBTriagens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBTriagensCronotacografos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBTriagensCronotacografos](
	[Id] [bigint] NOT NULL,
	[MotivoDescarte_id] [uniqueidentifier] NULL,
	[Usuario_id] [uniqueidentifier] NULL,
	[UsuarioTriagem_id] [uniqueidentifier] NULL,
	[UsuarioAuditoria_id] [uniqueidentifier] NULL,
	[InicioTriagem] [datetime] NULL,
	[InicioAuditoria] [datetime] NULL,
	[DataProcessamento] [datetime] NULL,
	[StatusConsultaCronotacografo] [nvarchar](15) NULL,
	[Observacao] [nvarchar](500) NULL,
 CONSTRAINT [PK_TBTriagensCronotacografos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBUserSessions]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBUserSessions](
	[SessionId] [uniqueidentifier] NOT NULL,
	[User_Id] [uniqueidentifier] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[ExpiresAt] [datetime2](7) NOT NULL,
	[EndedAt] [datetime2](7) NULL,
	[ClientIp] [nvarchar](45) NULL,
	[UserAgent] [nvarchar](512) NULL,
	[RefreshTokenHash] [varbinary](64) NULL,
 CONSTRAINT [PK_TBUserSessions] PRIMARY KEY CLUSTERED 
(
	[SessionId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBUsuarios]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBUsuarios](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[NomeUsuario] [nvarchar](100) NULL,
	[Email] [nvarchar](150) NOT NULL,
	[Senha] [nvarchar](1000) NULL,
	[Token] [nvarchar](50) NULL,
	[DataExpiracaoToken] [datetime] NULL,
	[Inativo] [bit] NOT NULL,
	[Admin] [bit] NOT NULL,
	[AutenticacaoDoisFatores] [bit] NULL,
	[Telefone] [nvarchar](255) NULL,
	[CodigoAgente] [nvarchar](50) NULL,
	[AnalistaTriagem] [bit] NOT NULL,
	[AuditorDescartadas] [bit] NOT NULL,
	[AuditorValidas] [bit] NOT NULL,
	[Supervisor] [bit] NOT NULL,
 CONSTRAINT [PK_TBUsuarios] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBUsuariosAcessoPorIps]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBUsuariosAcessoPorIps](
	[Id] [uniqueidentifier] NOT NULL,
	[Usuario_id] [uniqueidentifier] NOT NULL,
	[AcessoPorIp_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBUsuariosAcessoPorIps] PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[Usuario_id] ASC,
	[AcessoPorIp_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBUsuariosGrupoEquipamentos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBUsuariosGrupoEquipamentos](
	[Usuario_id] [uniqueidentifier] NOT NULL,
	[GrupoEquipamento_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBUsuariosGrupoEquipamentos] PRIMARY KEY CLUSTERED 
(
	[Usuario_id] ASC,
	[GrupoEquipamento_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBUsuariosPerfilAcessos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBUsuariosPerfilAcessos](
	[Usuario_id] [uniqueidentifier] NOT NULL,
	[PerfilAcesso_id] [uniqueidentifier] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBVeiculos]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBVeiculos](
	[Id] [uniqueidentifier] NOT NULL,
	[CodigoMarcaModelo] [nvarchar](100) NULL,
	[MarcaModeloVeiculo] [nvarchar](100) NULL,
	[CodigoMunicipio] [nvarchar](100) NULL,
	[Municipio] [nvarchar](100) NULL,
	[CodigoCor] [nvarchar](100) NULL,
	[Cor] [nvarchar](100) NULL,
	[CodigoCategoria] [nvarchar](100) NULL,
	[Categoria] [nvarchar](100) NULL,
	[CodigoEspecie] [nvarchar](100) NULL,
	[Especie] [nvarchar](100) NULL,
	[CodigoTipoVeiculo] [nvarchar](100) NULL,
	[TipoVeiculo] [nvarchar](100) NULL,
	[AnoVeiculo] [int] NULL,
	[QuantidadePassageiros] [int] NULL,
	[CapacidadeCarga] [int] NULL,
	[Infracao_id] [bigint] NULL,
	[PassagemCronotacografo_id] [bigint] NULL,
	[AnoModelo] [int] NULL,
	[Chassi] [nvarchar](50) NULL,
	[UfPlaca] [nvarchar](2) NULL,
	[MarcaVeiculo] [nvarchar](60) NULL,
	[Renavam] [nvarchar](11) NULL,
	[CpfCnpj] [nvarchar](14) NULL,
	[NomeProprietario] [nvarchar](200) NULL,
	[CepProprietario] [nvarchar](9) NULL,
	[UfProprietario] [nvarchar](2) NULL,
	[MunicipioProprietario] [nvarchar](255) NULL,
	[BairroProprietario] [nvarchar](255) NULL,
	[LogradouroProprietario] [nvarchar](255) NULL,
	[TipoCategoria] [int] NULL,
	[TipoProprietario] [int] NULL,
	[ModeloVeiculo] [nvarchar](60) NULL,
	[NumeroLogradouro] [nvarchar](10) NULL,
	[ComplementoEndereco] [nvarchar](100) NULL,
	[DataNascimentoProprietario] [int] NULL,
	[NumeroRegistro] [nvarchar](255) NULL,
	[CategoriaCnh] [nvarchar](255) NULL,
	[NumeroCnh] [nvarchar](255) NULL,
	[DataValidadeCnh] [int] NULL,
	[UfCnh] [nvarchar](255) NULL,
	[DataPrimeiraHabilitacao] [int] NULL,
	[DataEmissaoCNH] [int] NULL,
	[Observacoes] [nvarchar](255) NULL,
	[Debitos] [nvarchar](255) NULL,
	[Motor] [nvarchar](255) NULL,
	[Carroceria] [nvarchar](255) NULL,
	[CaixaCambio] [nvarchar](255) NULL,
	[Restricao] [nvarchar](255) NULL,
	[DataHoraConsulta] [datetime] NULL,
	[WebServiceConsultado] [nvarchar](255) NULL,
 CONSTRAINT [PK_TBVeiculos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBVeiculosClassificacao]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBVeiculosClassificacao](
	[PlacaVeiculo] [nvarchar](10) NULL,
	[Descricao] [nvarchar](100) NULL,
	[Qtde] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBWebHooks]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBWebHooks](
	[Id] [uniqueidentifier] NOT NULL,
	[DataCriacao] [datetime] NULL,
	[DataAtualizacao] [datetime] NULL,
	[CriadoPor] [nvarchar](100) NULL,
	[AtualizadoPor] [nvarchar](100) NULL,
	[UniformResourceIdentifier] [nvarchar](250) NOT NULL,
	[Evento] [nvarchar](100) NOT NULL,
	[Ativo] [bit] NOT NULL,
	[Codigo] [bigint] NOT NULL,
	[Nome] [nvarchar](50) NULL,
	[Transacional] [bit] NOT NULL,
 CONSTRAINT [PK_TBWebHooks] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TBWebHooksOperacoes]    Script Date: 12/02/2026 10:05:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TBWebHooksOperacoes](
	[Id] [uniqueidentifier] NOT NULL,
	[WebHook_id] [uniqueidentifier] NULL,
	[Operacao_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_TBWebHooksOperacoes_id] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[TBAfericoes] ADD  CONSTRAINT [DF_TBAfericoes_StatusAfericao]  DEFAULT (N'Valida') FOR [StatusLacre]
GO
ALTER TABLE [dbo].[TBInfracoes] ADD  CONSTRAINT [DF_TBInfracoes_VelocidadeRegulamentada]  DEFAULT ((0)) FOR [VelocidadeRegulamentada]
GO
ALTER TABLE [dbo].[TBInfracoes] ADD  CONSTRAINT [DF_TBInfracoes_VelocidadeMedida]  DEFAULT ((0)) FOR [VelocidadeMedida]
GO
ALTER TABLE [dbo].[TBInfracoes] ADD  CONSTRAINT [DF_TBInfracoes_VelocidadeConsiderada]  DEFAULT ((0)) FOR [VelocidadeConsiderada]
GO
ALTER TABLE [dbo].[TBInfracoes] ADD  CONSTRAINT [DF_TBInfracoes_TamanhoVeiculo]  DEFAULT ((0)) FOR [TamanhoVeiculo]
GO
ALTER TABLE [dbo].[TBInfracoes] ADD  CONSTRAINT [DF_TBInfracoes_SequencialInfracao]  DEFAULT ((0)) FOR [SequencialInfracao]
GO
ALTER TABLE [dbo].[TBMotivosDescartes] ADD  CONSTRAINT [DF_TBMotivosDescartes_Habilitado]  DEFAULT ((1)) FOR [Habilitado]
GO
ALTER TABLE [dbo].[TBUserSessions] ADD  CONSTRAINT [DF_TBUserSessions_SessionId]  DEFAULT (newid()) FOR [SessionId]
GO
ALTER TABLE [dbo].[TBUserSessions] ADD  CONSTRAINT [DF_TBUserSessions_CreatedAtUtc]  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[TBUsuarios] ADD  CONSTRAINT [DF_TBUsuarios_Supervisor]  DEFAULT ((0)) FOR [Supervisor]
GO
ALTER TABLE [dbo].[TBAcessosBloqueadosPeriodo]  WITH CHECK ADD  CONSTRAINT [FK_TBAcessosBloqueadosPeriodo_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBAcessosBloqueadosPeriodo] CHECK CONSTRAINT [FK_TBAcessosBloqueadosPeriodo_Usuario_id]
GO
ALTER TABLE [dbo].[TBAfericoes]  WITH CHECK ADD  CONSTRAINT [FK_TBAfericoes_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBAfericoes] CHECK CONSTRAINT [FK_TBAfericoes_Equipamento_id]
GO
ALTER TABLE [dbo].[TBAfericoes]  WITH CHECK ADD  CONSTRAINT [FK_TBAfericoes_TipoAfericao_id] FOREIGN KEY([TipoAfericao_id])
REFERENCES [dbo].[TBTipoAfericoes] ([Id])
GO
ALTER TABLE [dbo].[TBAfericoes] CHECK CONSTRAINT [FK_TBAfericoes_TipoAfericao_id]
GO
ALTER TABLE [dbo].[TBAjustesContratuais]  WITH CHECK ADD  CONSTRAINT [FK_TBAjustesContratuais_Contrato_id] FOREIGN KEY([Contrato_id])
REFERENCES [dbo].[TBContratos] ([Id])
GO
ALTER TABLE [dbo].[TBAjustesContratuais] CHECK CONSTRAINT [FK_TBAjustesContratuais_Contrato_id]
GO
ALTER TABLE [dbo].[TBArcoNos]  WITH CHECK ADD  CONSTRAINT [FK_TBArcoNos_Arco_Id] FOREIGN KEY([Arco_id])
REFERENCES [dbo].[TBArcos] ([Id])
GO
ALTER TABLE [dbo].[TBArcoNos] CHECK CONSTRAINT [FK_TBArcoNos_Arco_Id]
GO
ALTER TABLE [dbo].[TBArcoNos]  WITH CHECK ADD  CONSTRAINT [FK_TBArcoNos_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBArcoNos] CHECK CONSTRAINT [FK_TBArcoNos_Operacao_id]
GO
ALTER TABLE [dbo].[TBCamposLayoutArquivos]  WITH CHECK ADD  CONSTRAINT [FK_TBCamposLayoutArquivos_LayoutArquivo_id] FOREIGN KEY([LayoutArquivo_id])
REFERENCES [dbo].[TBLayoutArquivos] ([Id])
GO
ALTER TABLE [dbo].[TBCamposLayoutArquivos] CHECK CONSTRAINT [FK_TBCamposLayoutArquivos_LayoutArquivo_id]
GO
ALTER TABLE [dbo].[TBContratosFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBContratosFaixas_Contrato_id] FOREIGN KEY([Contrato_id])
REFERENCES [dbo].[TBContratos] ([Id])
GO
ALTER TABLE [dbo].[TBContratosFaixas] CHECK CONSTRAINT [FK_TBContratosFaixas_Contrato_id]
GO
ALTER TABLE [dbo].[TBContratosFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBContratosFaixas_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBContratosFaixas] CHECK CONSTRAINT [FK_TBContratosFaixas_Faixa_id]
GO
ALTER TABLE [dbo].[TBDadosCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBDadosCronotacografos_Infracao_id] FOREIGN KEY([Infracao_id])
REFERENCES [dbo].[TBInfracoes] ([Id])
GO
ALTER TABLE [dbo].[TBDadosCronotacografos] CHECK CONSTRAINT [FK_TBDadosCronotacografos_Infracao_id]
GO
ALTER TABLE [dbo].[TBDadosCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBDadosCronotacografos_PassagemCronotacografo_id] FOREIGN KEY([PassagemCronotacografo_id])
REFERENCES [dbo].[TBPassagensCronotacografos] ([Id])
GO
ALTER TABLE [dbo].[TBDadosCronotacografos] CHECK CONSTRAINT [FK_TBDadosCronotacografos_PassagemCronotacografo_id]
GO
ALTER TABLE [dbo].[TBDadosCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBDadosCronotacografos_PassagemMonitoramento_id] FOREIGN KEY([PassagemMonitoramento_id])
REFERENCES [dbo].[TBPassagensMonitoramentos] ([Id])
GO
ALTER TABLE [dbo].[TBDadosCronotacografos] CHECK CONSTRAINT [FK_TBDadosCronotacografos_PassagemMonitoramento_id]
GO
ALTER TABLE [dbo].[TBDadosPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBDadosPesagens_id] FOREIGN KEY([Id])
REFERENCES [dbo].[TBPassagens] ([Id])
GO
ALTER TABLE [dbo].[TBDadosPesagens] CHECK CONSTRAINT [FK_TBDadosPesagens_id]
GO
ALTER TABLE [dbo].[TBDiscrepancias]  WITH CHECK ADD  CONSTRAINT [FK_TBDiscrepancias_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBDiscrepancias] CHECK CONSTRAINT [FK_TBDiscrepancias_Equipamento_id]
GO
ALTER TABLE [dbo].[TBDiscrepancias]  WITH CHECK ADD  CONSTRAINT [FK_TBDiscrepancias_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBDiscrepancias] CHECK CONSTRAINT [FK_TBDiscrepancias_Faixa_id]
GO
ALTER TABLE [dbo].[TBDiscrepancias]  WITH CHECK ADD  CONSTRAINT [FK_TBDiscrepancias_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBDiscrepancias] CHECK CONSTRAINT [FK_TBDiscrepancias_Operacao_id]
GO
ALTER TABLE [dbo].[TBDocumentoOperacoesRecursosFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBDocumentoOperacaoRecursos_OperacaoRecurso_id] FOREIGN KEY([OperacaoRecurso_id])
REFERENCES [dbo].[TBOperacoesRecursos] ([Id])
GO
ALTER TABLE [dbo].[TBDocumentoOperacoesRecursosFaixas] CHECK CONSTRAINT [FK_TBDocumentoOperacaoRecursos_OperacaoRecurso_id]
GO
ALTER TABLE [dbo].[TBDocumentosAfericoes]  WITH CHECK ADD  CONSTRAINT [FK_TBDocumentosAfericoes_Afericao_id] FOREIGN KEY([Afericao_id])
REFERENCES [dbo].[TBAfericoes] ([Id])
GO
ALTER TABLE [dbo].[TBDocumentosAfericoes] CHECK CONSTRAINT [FK_TBDocumentosAfericoes_Afericao_id]
GO
ALTER TABLE [dbo].[TBDocumentosOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBDocumentosOperacoes_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBDocumentosOperacoes] CHECK CONSTRAINT [FK_TBDocumentosOperacoes_Operacao_id]
GO
ALTER TABLE [dbo].[TBEixoPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBEixoPesagens_GrupoEixoPesagem_id] FOREIGN KEY([GrupoEixoPesagem_id])
REFERENCES [dbo].[TBGrupoEixoPesagens] ([Id])
GO
ALTER TABLE [dbo].[TBEixoPesagens] CHECK CONSTRAINT [FK_TBEixoPesagens_GrupoEixoPesagem_id]
GO
ALTER TABLE [dbo].[TBEixoPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBEixoPesagens_TicketPesagem_id] FOREIGN KEY([TicketPesagem_id])
REFERENCES [dbo].[TBTicketPesagens] ([Id])
GO
ALTER TABLE [dbo].[TBEixoPesagens] CHECK CONSTRAINT [FK_TBEixoPesagens_TicketPesagem_id]
GO
ALTER TABLE [dbo].[TBEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBEquipamento_LayoutArquivo_id] FOREIGN KEY([LayoutArquivo_id])
REFERENCES [dbo].[TBLayoutArquivos] ([Id])
GO
ALTER TABLE [dbo].[TBEquipamentos] CHECK CONSTRAINT [FK_TBEquipamento_LayoutArquivo_id]
GO
ALTER TABLE [dbo].[TBEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBEquipamentos_GrupoEquipamento_id] FOREIGN KEY([GrupoEquipamento_id])
REFERENCES [dbo].[TBGrupoEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBEquipamentos] CHECK CONSTRAINT [FK_TBEquipamentos_GrupoEquipamento_id]
GO
ALTER TABLE [dbo].[TBEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBEquipamentos_ModeloEquipamento_id] FOREIGN KEY([ModeloEquipamento_id])
REFERENCES [dbo].[TBModeloEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBEquipamentos] CHECK CONSTRAINT [FK_TBEquipamentos_ModeloEquipamento_id]
GO
ALTER TABLE [dbo].[TBEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBEquipamentos_TipoEquipamento_id] FOREIGN KEY([TipoEquipamento_id])
REFERENCES [dbo].[TBTipoEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBEquipamentos] CHECK CONSTRAINT [FK_TBEquipamentos_TipoEquipamento_id]
GO
ALTER TABLE [dbo].[TBEventosEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBEventosEquipamentos_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBEventosEquipamentos] CHECK CONSTRAINT [FK_TBEventosEquipamentos_Equipamento_id]
GO
ALTER TABLE [dbo].[TBEventosEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBEventosEquipamentos_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBEventosEquipamentos] CHECK CONSTRAINT [FK_TBEventosEquipamentos_Operacao_id]
GO
ALTER TABLE [dbo].[TBExcecaoDatas]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesDias_Excecao_id] FOREIGN KEY([Excecao_id])
REFERENCES [dbo].[TBExcecoes] ([Id])
GO
ALTER TABLE [dbo].[TBExcecaoDatas] CHECK CONSTRAINT [FK_TBExcecoesDias_Excecao_id]
GO
ALTER TABLE [dbo].[TBExcecoes]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoes_MotivoDescarte_id] FOREIGN KEY([MotivoDescarte_id])
REFERENCES [dbo].[TBMotivosDescartes] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoes] CHECK CONSTRAINT [FK_TBExcecoes_MotivoDescarte_id]
GO
ALTER TABLE [dbo].[TBExcecoesClassificacoesVeiculos]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesClassificacoesVeiculos_ClassificacaoVeiculo_id] FOREIGN KEY([ClassificacaoVeiculo_id])
REFERENCES [dbo].[TBClassificacoesVeiculos] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoesClassificacoesVeiculos] CHECK CONSTRAINT [FK_TBExcecoesClassificacoesVeiculos_ClassificacaoVeiculo_id]
GO
ALTER TABLE [dbo].[TBExcecoesClassificacoesVeiculos]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesClassificacoesVeiculos_Excecao_id] FOREIGN KEY([Excecao_id])
REFERENCES [dbo].[TBExcecoes] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoesClassificacoesVeiculos] CHECK CONSTRAINT [FK_TBExcecoesClassificacoesVeiculos_Excecao_id]
GO
ALTER TABLE [dbo].[TBExcecoesEnquadramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesInfracoesEnquadramentos_Excecao_id] FOREIGN KEY([Excecao_id])
REFERENCES [dbo].[TBExcecoes] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoesEnquadramentos] CHECK CONSTRAINT [FK_TBExcecoesInfracoesEnquadramentos_Excecao_id]
GO
ALTER TABLE [dbo].[TBExcecoesEnquadramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesInfracoesEnquadramentos_InfracaoEnquadramento_id] FOREIGN KEY([InfracaoEnquadramento_id])
REFERENCES [dbo].[TBInfracoesEnquadramentos] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoesEnquadramentos] CHECK CONSTRAINT [FK_TBExcecoesInfracoesEnquadramentos_InfracaoEnquadramento_id]
GO
ALTER TABLE [dbo].[TBExcecoesFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesFaixas_Excecao_id] FOREIGN KEY([Excecao_id])
REFERENCES [dbo].[TBExcecoes] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoesFaixas] CHECK CONSTRAINT [FK_TBExcecoesFaixas_Excecao_id]
GO
ALTER TABLE [dbo].[TBExcecoesFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesFaixas_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoesFaixas] CHECK CONSTRAINT [FK_TBExcecoesFaixas_Faixa_id]
GO
ALTER TABLE [dbo].[TBExcecoesHorarios]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesHorarios_Excecao_id] FOREIGN KEY([Excecao_id])
REFERENCES [dbo].[TBExcecoes] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoesHorarios] CHECK CONSTRAINT [FK_TBExcecoesHorarios_Excecao_id]
GO
ALTER TABLE [dbo].[TBExcecoesPlacas]  WITH CHECK ADD  CONSTRAINT [FK_TBExcecoesPlacas_Excecao_id] FOREIGN KEY([Excecao_id])
REFERENCES [dbo].[TBExcecoes] ([Id])
GO
ALTER TABLE [dbo].[TBExcecoesPlacas] CHECK CONSTRAINT [FK_TBExcecoesPlacas_Excecao_id]
GO
ALTER TABLE [dbo].[TBFaixasAfericoes]  WITH CHECK ADD  CONSTRAINT [FK_TBFaixasAfericoes_Afericao_id] FOREIGN KEY([Afericao_id])
REFERENCES [dbo].[TBAfericoes] ([Id])
GO
ALTER TABLE [dbo].[TBFaixasAfericoes] CHECK CONSTRAINT [FK_TBFaixasAfericoes_Afericao_id]
GO
ALTER TABLE [dbo].[TBFaixasAfericoes]  WITH CHECK ADD  CONSTRAINT [FK_TBFaixasAfericoes_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBFaixasAfericoes] CHECK CONSTRAINT [FK_TBFaixasAfericoes_Faixa_id]
GO
ALTER TABLE [dbo].[TBGrupoEixoPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBGrupoEixoPesagens_TicketPesagem_id] FOREIGN KEY([TicketPesagem_id])
REFERENCES [dbo].[TBTicketPesagens] ([Id])
GO
ALTER TABLE [dbo].[TBGrupoEixoPesagens] CHECK CONSTRAINT [FK_TBGrupoEixoPesagens_TicketPesagem_id]
GO
ALTER TABLE [dbo].[TBHistoricoImagens]  WITH CHECK ADD  CONSTRAINT [FK_TBHistoricoImagens_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBHistoricoImagens] CHECK CONSTRAINT [FK_TBHistoricoImagens_Usuario_id]
GO
ALTER TABLE [dbo].[TBHistoricoTriagens]  WITH CHECK ADD  CONSTRAINT [FK_TBHistoricoTriagens_Infracao_id] FOREIGN KEY([Infracao_id])
REFERENCES [dbo].[TBInfracoes] ([Id])
GO
ALTER TABLE [dbo].[TBHistoricoTriagens] CHECK CONSTRAINT [FK_TBHistoricoTriagens_Infracao_id]
GO
ALTER TABLE [dbo].[TBHistoricoTriagens]  WITH CHECK ADD  CONSTRAINT [FK_TBHistoricoTriagens_MotivoDescarte_id] FOREIGN KEY([MotivoDescarte_id])
REFERENCES [dbo].[TBMotivosDescartes] ([Id])
GO
ALTER TABLE [dbo].[TBHistoricoTriagens] CHECK CONSTRAINT [FK_TBHistoricoTriagens_MotivoDescarte_id]
GO
ALTER TABLE [dbo].[TBHistoricoTriagens]  WITH CHECK ADD  CONSTRAINT [FK_TBHistoricoTriagens_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBHistoricoTriagens] CHECK CONSTRAINT [FK_TBHistoricoTriagens_Usuario_id]
GO
ALTER TABLE [dbo].[TBHistoricoTriagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBHistoricoTriagensCronotacografos_MotivoDescarte_id] FOREIGN KEY([MotivoDescarte_id])
REFERENCES [dbo].[TBMotivosDescartes] ([Id])
GO
ALTER TABLE [dbo].[TBHistoricoTriagensCronotacografos] CHECK CONSTRAINT [FK_TBHistoricoTriagensCronotacografos_MotivoDescarte_id]
GO
ALTER TABLE [dbo].[TBHistoricoTriagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBHistoricoTriagensCronotacografos_PassagemCronotacografo_id] FOREIGN KEY([PassagemCronotacografo_id])
REFERENCES [dbo].[TBPassagensCronotacografos] ([Id])
GO
ALTER TABLE [dbo].[TBHistoricoTriagensCronotacografos] CHECK CONSTRAINT [FK_TBHistoricoTriagensCronotacografos_PassagemCronotacografo_id]
GO
ALTER TABLE [dbo].[TBHistoricoTriagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBHistoricoTriagensCronotacografos_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBHistoricoTriagensCronotacografos] CHECK CONSTRAINT [FK_TBHistoricoTriagensCronotacografos_Usuario_id]
GO
ALTER TABLE [dbo].[TBHorariosAcessos]  WITH CHECK ADD  CONSTRAINT [FK_TBHorariosAcessos_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBHorariosAcessos] CHECK CONSTRAINT [FK_TBHorariosAcessos_Usuario_id]
GO
ALTER TABLE [dbo].[TBImagemPassagens]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemPassagens_Passagem_id] FOREIGN KEY([Passagem_id])
REFERENCES [dbo].[TBPassagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagemPassagens] CHECK CONSTRAINT [FK_TBImagemPassagens_Passagem_id]
GO
ALTER TABLE [dbo].[TBImagemPassagens]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemPassagens_TipoImagem_id] FOREIGN KEY([TipoImagem_id])
REFERENCES [dbo].[TBTiposImagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagemPassagens] CHECK CONSTRAINT [FK_TBImagemPassagens_TipoImagem_id]
GO
ALTER TABLE [dbo].[TBImagemPassagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemPassagensCronotacografos_PassagemCronotacografo_id] FOREIGN KEY([PassagemCronotacografo_id])
REFERENCES [dbo].[TBPassagensCronotacografos] ([Id])
GO
ALTER TABLE [dbo].[TBImagemPassagensCronotacografos] CHECK CONSTRAINT [FK_TBImagemPassagensCronotacografos_PassagemCronotacografo_id]
GO
ALTER TABLE [dbo].[TBImagemPassagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemPassagensCronotacografos_TipoImagem_id] FOREIGN KEY([TipoImagem_id])
REFERENCES [dbo].[TBTiposImagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagemPassagensCronotacografos] CHECK CONSTRAINT [FK_TBImagemPassagensCronotacografos_TipoImagem_id]
GO
ALTER TABLE [dbo].[TBImagemPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemPassagensMonitoramentos_PassagemMonitoramento_id] FOREIGN KEY([PassagemMonitoramento_id])
REFERENCES [dbo].[TBPassagensMonitoramentos] ([Id])
GO
ALTER TABLE [dbo].[TBImagemPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBImagemPassagensMonitoramentos_PassagemMonitoramento_id]
GO
ALTER TABLE [dbo].[TBImagemPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemPassagensMonitoramentos_TipoImagem_id] FOREIGN KEY([TipoImagem_id])
REFERENCES [dbo].[TBTiposImagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagemPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBImagemPassagensMonitoramentos_TipoImagem_id]
GO
ALTER TABLE [dbo].[TBImagemPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemPesagens_TicketPesagem_id] FOREIGN KEY([TicketPesagem_id])
REFERENCES [dbo].[TBTicketPesagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagemPesagens] CHECK CONSTRAINT [FK_TBImagemPesagens_TicketPesagem_id]
GO
ALTER TABLE [dbo].[TBImagemPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemPesagens_TipoImagem_id] FOREIGN KEY([TipoImagem_id])
REFERENCES [dbo].[TBTiposImagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagemPesagens] CHECK CONSTRAINT [FK_TBImagemPesagens_TipoImagem_id]
GO
ALTER TABLE [dbo].[TBImagemTestes]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemTestes_TesteEquipamento_id] FOREIGN KEY([TesteEquipamento_id])
REFERENCES [dbo].[TBTestesEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBImagemTestes] CHECK CONSTRAINT [FK_TBImagemTestes_TesteEquipamento_id]
GO
ALTER TABLE [dbo].[TBImagemTestes]  WITH CHECK ADD  CONSTRAINT [FK_TBImagemTestes_TipoImagem_id] FOREIGN KEY([TipoImagem_id])
REFERENCES [dbo].[TBTiposImagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagemTestes] CHECK CONSTRAINT [FK_TBImagemTestes_TipoImagem_id]
GO
ALTER TABLE [dbo].[TBImagens]  WITH CHECK ADD  CONSTRAINT [FK_TBImagens_Infracao_id] FOREIGN KEY([Infracao_id])
REFERENCES [dbo].[TBInfracoes] ([Id])
GO
ALTER TABLE [dbo].[TBImagens] CHECK CONSTRAINT [FK_TBImagens_Infracao_id]
GO
ALTER TABLE [dbo].[TBImagens]  WITH CHECK ADD  CONSTRAINT [FK_TBImagens_TipoImagem_id] FOREIGN KEY([TipoImagem_id])
REFERENCES [dbo].[TBTiposImagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagens] CHECK CONSTRAINT [FK_TBImagens_TipoImagem_id]
GO
ALTER TABLE [dbo].[TBImagensPassagensConjugadas]  WITH CHECK ADD  CONSTRAINT [FK_TBImagensPassagensConjugadas_PassagemConjugada_id] FOREIGN KEY([PassagemConjugada_id])
REFERENCES [dbo].[TBPassagensConjugadas] ([Id])
GO
ALTER TABLE [dbo].[TBImagensPassagensConjugadas] CHECK CONSTRAINT [FK_TBImagensPassagensConjugadas_PassagemConjugada_id]
GO
ALTER TABLE [dbo].[TBImagensPassagensConjugadas]  WITH CHECK ADD  CONSTRAINT [FK_TBImagensPassagensConjugadas_TipoImagem_id] FOREIGN KEY([TipoImagem_id])
REFERENCES [dbo].[TBTiposImagens] ([Id])
GO
ALTER TABLE [dbo].[TBImagensPassagensConjugadas] CHECK CONSTRAINT [FK_TBImagensPassagensConjugadas_TipoImagem_id]
GO
ALTER TABLE [dbo].[TBInfracoes]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoes_ClassificacaoVeiculo_id] FOREIGN KEY([ClassificacaoVeiculo_id])
REFERENCES [dbo].[TBClassificacoesVeiculos] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoes] CHECK CONSTRAINT [FK_TBInfracoes_ClassificacaoVeiculo_id]
GO
ALTER TABLE [dbo].[TBInfracoes]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoes_Enquadramento_id] FOREIGN KEY([Enquadramento_id])
REFERENCES [dbo].[TBEnquadramentos] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoes] CHECK CONSTRAINT [FK_TBInfracoes_Enquadramento_id]
GO
ALTER TABLE [dbo].[TBInfracoes]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoes_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoes] CHECK CONSTRAINT [FK_TBInfracoes_Equipamento_id]
GO
ALTER TABLE [dbo].[TBInfracoes]  WITH CHECK ADD  CONSTRAINT [Fk_TBInfracoes_LoteExportacao_id] FOREIGN KEY([LoteExportacao_id])
REFERENCES [dbo].[TBLoteExportacoes] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoes] CHECK CONSTRAINT [Fk_TBInfracoes_LoteExportacao_id]
GO
ALTER TABLE [dbo].[TBInfracoes]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoes_LoteImportacao_id] FOREIGN KEY([LoteImportacao_id])
REFERENCES [dbo].[TBLoteImportacoes] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoes] CHECK CONSTRAINT [FK_TBInfracoes_LoteImportacao_id]
GO
ALTER TABLE [dbo].[TBInfracoes]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoes_Monitoramento_id] FOREIGN KEY([Monitoramento_id])
REFERENCES [dbo].[TBMonitoramentos] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoes] CHECK CONSTRAINT [FK_TBInfracoes_Monitoramento_id]
GO
ALTER TABLE [dbo].[TBInfracoes]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoes_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoes] CHECK CONSTRAINT [FK_TBInfracoes_Operacao_id]
GO
ALTER TABLE [dbo].[TBInfracoesEnquadramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoesEnquadramentos_Enquadramento_id] FOREIGN KEY([Enquadramento_id])
REFERENCES [dbo].[TBEnquadramentos] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoesEnquadramentos] CHECK CONSTRAINT [FK_TBInfracoesEnquadramentos_Enquadramento_id]
GO
ALTER TABLE [dbo].[TBInfracoesEnquadramentos]  WITH CHECK ADD  CONSTRAINT [FK_TTBInfracoesEnquadramentos_MotivoDescarteReincidente_id] FOREIGN KEY([MotivoDescarteReincidente_id])
REFERENCES [dbo].[TBMotivosDescartes] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoesEnquadramentos] CHECK CONSTRAINT [FK_TTBInfracoesEnquadramentos_MotivoDescarteReincidente_id]
GO
ALTER TABLE [dbo].[TBInfracoesExcessoPeso]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoes_Id] FOREIGN KEY([Infracao_Id])
REFERENCES [dbo].[TBInfracoes] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoesExcessoPeso] CHECK CONSTRAINT [FK_TBInfracoes_Id]
GO
ALTER TABLE [dbo].[TBInfracoesPesagemEixos]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoesPesagemEixos_InfracaoExcessoPeso_Id] FOREIGN KEY([InfracaoExcessoPeso_Id])
REFERENCES [dbo].[TBInfracoesExcessoPeso] ([Id])
GO
ALTER TABLE [dbo].[TBInfracoesPesagemEixos] CHECK CONSTRAINT [FK_TBInfracoesPesagemEixos_InfracaoExcessoPeso_Id]
GO
ALTER TABLE [dbo].[TBLocais]  WITH CHECK ADD  CONSTRAINT [FK_TBLocais_Regiao_Id] FOREIGN KEY([Regiao_id])
REFERENCES [dbo].[TBRegioes] ([Id])
GO
ALTER TABLE [dbo].[TBLocais] CHECK CONSTRAINT [FK_TBLocais_Regiao_Id]
GO
ALTER TABLE [dbo].[TBLogsAcessos]  WITH CHECK ADD  CONSTRAINT [FK_TBLogsAcessos_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBLogsAcessos] CHECK CONSTRAINT [FK_TBLogsAcessos_Usuario_id]
GO
ALTER TABLE [dbo].[TBLoteImportacaoErros]  WITH CHECK ADD  CONSTRAINT [FK_TBLoteImportacao_LoteImportacao_id] FOREIGN KEY([LoteImportacao_id])
REFERENCES [dbo].[TBLoteImportacoes] ([Id])
GO
ALTER TABLE [dbo].[TBLoteImportacaoErros] CHECK CONSTRAINT [FK_TBLoteImportacao_LoteImportacao_id]
GO
ALTER TABLE [dbo].[TBLoteImportacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBLoteImportacoes_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBLoteImportacoes] CHECK CONSTRAINT [FK_TBLoteImportacoes_Equipamento_id]
GO
ALTER TABLE [dbo].[TBMedicaoEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBMedicaoEquipamentos_Equipamento_Id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBMedicaoEquipamentos] CHECK CONSTRAINT [FK_TBMedicaoEquipamentos_Equipamento_Id]
GO
ALTER TABLE [dbo].[TBMedicaoEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBMedicaoEquipamentos_Medicao_Id] FOREIGN KEY([Medicao_id])
REFERENCES [dbo].[TBMedicoes] ([Id])
GO
ALTER TABLE [dbo].[TBMedicaoEquipamentos] CHECK CONSTRAINT [FK_TBMedicaoEquipamentos_Medicao_Id]
GO
ALTER TABLE [dbo].[TBMedicaoFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBMedicaoFaixas_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBMedicaoFaixas] CHECK CONSTRAINT [FK_TBMedicaoFaixas_Equipamento_id]
GO
ALTER TABLE [dbo].[TBMedicaoFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBMedicaoFaixas_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBMedicaoFaixas] CHECK CONSTRAINT [FK_TBMedicaoFaixas_Faixa_id]
GO
ALTER TABLE [dbo].[TBMedicaoFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBMedicaoFaixas_Medicao_id] FOREIGN KEY([Medicao_id])
REFERENCES [dbo].[TBMedicoes] ([Id])
GO
ALTER TABLE [dbo].[TBMedicaoFaixas] CHECK CONSTRAINT [FK_TBMedicaoFaixas_Medicao_id]
GO
ALTER TABLE [dbo].[TBMedicaoInformacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBMedicaoInformacoes_Medicao_id] FOREIGN KEY([Medicao_id])
REFERENCES [dbo].[TBMedicoes] ([Id])
GO
ALTER TABLE [dbo].[TBMedicaoInformacoes] CHECK CONSTRAINT [FK_TBMedicaoInformacoes_Medicao_id]
GO
ALTER TABLE [dbo].[TBMedicoes]  WITH CHECK ADD  CONSTRAINT [FK_TBMedicoes_GrupoEquipamento_id] FOREIGN KEY([GrupoEquipamento_id])
REFERENCES [dbo].[TBGrupoEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBMedicoes] CHECK CONSTRAINT [FK_TBMedicoes_GrupoEquipamento_id]
GO
ALTER TABLE [dbo].[TBMedicoes]  WITH CHECK ADD  CONSTRAINT [FK_TBMedicoes_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBMedicoes] CHECK CONSTRAINT [FK_TBMedicoes_Usuario_id]
GO
ALTER TABLE [dbo].[TBModeloEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBModeloEquipamentos_Fabricante_id] FOREIGN KEY([Fabricante_id])
REFERENCES [dbo].[TBFabricantes] ([Id])
GO
ALTER TABLE [dbo].[TBModeloEquipamentos] CHECK CONSTRAINT [FK_TBModeloEquipamentos_Fabricante_id]
GO
ALTER TABLE [dbo].[TBMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBMonitoramentos_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBMonitoramentos] CHECK CONSTRAINT [FK_TBMonitoramentos_Operacao_id]
GO
ALTER TABLE [dbo].[TBMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBMonitoramentos_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBMonitoramentos] CHECK CONSTRAINT [FK_TBMonitoramentos_Usuario_id]
GO
ALTER TABLE [dbo].[TBMotivoDescarteTipoInfracoes]  WITH CHECK ADD  CONSTRAINT [FK_TBMotivoDescarteTipoInfracoes_MotivoDescarte_id] FOREIGN KEY([MotivoDescarte_id])
REFERENCES [dbo].[TBMotivosDescartes] ([Id])
GO
ALTER TABLE [dbo].[TBMotivoDescarteTipoInfracoes] CHECK CONSTRAINT [FK_TBMotivoDescarteTipoInfracoes_MotivoDescarte_id]
GO
ALTER TABLE [dbo].[TBOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoes_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoes] CHECK CONSTRAINT [FK_TBOperacoes_Equipamento_id]
GO
ALTER TABLE [dbo].[TBOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoes_EquipamentoConjugado_id] FOREIGN KEY([EquipamentoConjugado_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoes] CHECK CONSTRAINT [FK_TBOperacoes_EquipamentoConjugado_id]
GO
ALTER TABLE [dbo].[TBOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoes_OrgaoAutuador_id] FOREIGN KEY([OrgaoAutuador_id])
REFERENCES [dbo].[TBOrgaosAutuadores] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoes] CHECK CONSTRAINT [FK_TBOperacoes_OrgaoAutuador_id]
GO
ALTER TABLE [dbo].[TBOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoes_Tarja_id] FOREIGN KEY([Tarja_id])
REFERENCES [dbo].[TBTarjas] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoes] CHECK CONSTRAINT [FK_TBOperacoes_Tarja_id]
GO
ALTER TABLE [dbo].[TBOperacoesFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesFaixas_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesFaixas] CHECK CONSTRAINT [FK_TBOperacoesFaixas_Faixa_id]
GO
ALTER TABLE [dbo].[TBOperacoesFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesFaixas_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesFaixas] CHECK CONSTRAINT [FK_TBOperacoesFaixas_Operacao_id]
GO
ALTER TABLE [dbo].[TBOperacoesInfracoesEnquadramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBInfracoesEnquadramentos_InfracaoEnquadramento_id] FOREIGN KEY([InfracaoEnquadramento_id])
REFERENCES [dbo].[TBInfracoesEnquadramentos] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesInfracoesEnquadramentos] CHECK CONSTRAINT [FK_TBInfracoesEnquadramentos_InfracaoEnquadramento_id]
GO
ALTER TABLE [dbo].[TBOperacoesInfracoesEnquadramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoes_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesInfracoesEnquadramentos] CHECK CONSTRAINT [FK_TBOperacoes_Operacao_id]
GO
ALTER TABLE [dbo].[TBOperacoesInterrupcoes]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesInterrupcoes_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesInterrupcoes] CHECK CONSTRAINT [FK_TBOperacoesInterrupcoes_Equipamento_id]
GO
ALTER TABLE [dbo].[TBOperacoesInterrupcoes]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesInterrupcoes_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesInterrupcoes] CHECK CONSTRAINT [FK_TBOperacoesInterrupcoes_Faixa_id]
GO
ALTER TABLE [dbo].[TBOperacoesInterrupcoes]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesInterrupcoes_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesInterrupcoes] CHECK CONSTRAINT [FK_TBOperacoesInterrupcoes_Operacao_id]
GO
ALTER TABLE [dbo].[TBOperacoesRecursosFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesRecursosFaixas_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesRecursosFaixas] CHECK CONSTRAINT [FK_TBOperacoesRecursosFaixas_Faixa_id]
GO
ALTER TABLE [dbo].[TBOperacoesRecursosFaixas]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesRecursosFaixas_OperacaoRecurso_id] FOREIGN KEY([OperacaoRecurso_id])
REFERENCES [dbo].[TBOperacoesRecursos] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesRecursosFaixas] CHECK CONSTRAINT [FK_TBOperacoesRecursosFaixas_OperacaoRecurso_id]
GO
ALTER TABLE [dbo].[TBOperacoesRecursosHistorico]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesRecursosHistorico_OperacaoRecurso_id] FOREIGN KEY([OperacaoRecurso_id])
REFERENCES [dbo].[TBOperacoesRecursos] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesRecursosHistorico] CHECK CONSTRAINT [FK_TBOperacoesRecursosHistorico_OperacaoRecurso_id]
GO
ALTER TABLE [dbo].[TBOperacoesRecursosHistorico]  WITH CHECK ADD  CONSTRAINT [FK_TBOperacoesRecursosHistorico_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBOperacoesRecursosHistorico] CHECK CONSTRAINT [FK_TBOperacoesRecursosHistorico_Usuario_id]
GO
ALTER TABLE [dbo].[TBPassagens]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagens_ClassificacaoVeiculo_id] FOREIGN KEY([ClassificacaoVeiculo_id])
REFERENCES [dbo].[TBClassificacoesVeiculos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagens] CHECK CONSTRAINT [FK_TBPassagens_ClassificacaoVeiculo_id]
GO
ALTER TABLE [dbo].[TBPassagens]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagens_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagens] CHECK CONSTRAINT [FK_TBPassagens_Equipamento_id]
GO
ALTER TABLE [dbo].[TBPassagens]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagens_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBPassagens] CHECK CONSTRAINT [FK_TBPassagens_Faixa_id]
GO
ALTER TABLE [dbo].[TBPassagens]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagens_Infracao_id] FOREIGN KEY([Infracao_id])
REFERENCES [dbo].[TBInfracoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagens] CHECK CONSTRAINT [FK_TBPassagens_Infracao_id]
GO
ALTER TABLE [dbo].[TBPassagens]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagens_LoteImportacao_id] FOREIGN KEY([LoteImportacao_id])
REFERENCES [dbo].[TBLoteImportacoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagens] CHECK CONSTRAINT [FK_TBPassagens_LoteImportacao_id]
GO
ALTER TABLE [dbo].[TBPassagens]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagens_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagens] CHECK CONSTRAINT [FK_TBPassagens_Operacao_id]
GO
ALTER TABLE [dbo].[TBPassagensConjugadas]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensConjugadas_ClassificacaoVeiculo_id] FOREIGN KEY([ClassificacaoVeiculo_id])
REFERENCES [dbo].[TBClassificacoesVeiculos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensConjugadas] CHECK CONSTRAINT [FK_TBPassagensConjugadas_ClassificacaoVeiculo_id]
GO
ALTER TABLE [dbo].[TBPassagensConjugadas]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensConjugadas_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensConjugadas] CHECK CONSTRAINT [FK_TBPassagensConjugadas_Equipamento_id]
GO
ALTER TABLE [dbo].[TBPassagensConjugadas]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensConjugadas_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensConjugadas] CHECK CONSTRAINT [FK_TBPassagensConjugadas_Faixa_id]
GO
ALTER TABLE [dbo].[TBPassagensConjugadas]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensConjugadas_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensConjugadas] CHECK CONSTRAINT [FK_TBPassagensConjugadas_Operacao_id]
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensCronotacografos_ClassificacaoVeiculo_id] FOREIGN KEY([ClassificacaoVeiculo_id])
REFERENCES [dbo].[TBClassificacoesVeiculos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos] CHECK CONSTRAINT [FK_TBPassagensCronotacografos_ClassificacaoVeiculo_id]
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensCronotacografos_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos] CHECK CONSTRAINT [FK_TBPassagensCronotacografos_Equipamento_id]
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensCronotacografos_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos] CHECK CONSTRAINT [FK_TBPassagensCronotacografos_Faixa_id]
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensCronotacografos_LoteImportacao_id] FOREIGN KEY([LoteImportacao_id])
REFERENCES [dbo].[TBLoteImportacoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos] CHECK CONSTRAINT [FK_TBPassagensCronotacografos_LoteImportacao_id]
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensCronotacografos_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensCronotacografos] CHECK CONSTRAINT [FK_TBPassagensCronotacografos_Operacao_id]
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensMonitoramentos_ClassificacaoVeiculo_id] FOREIGN KEY([ClassificacaoVeiculo_id])
REFERENCES [dbo].[TBClassificacoesVeiculos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBPassagensMonitoramentos_ClassificacaoVeiculo_id]
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensMonitoramentos_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBPassagensMonitoramentos_Equipamento_id]
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensMonitoramentos_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBPassagensMonitoramentos_Faixa_id]
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensMonitoramentos_Infracao_id] FOREIGN KEY([Infracao_id])
REFERENCES [dbo].[TBInfracoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBPassagensMonitoramentos_Infracao_id]
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensMonitoramentos_LoteImportacao_id] FOREIGN KEY([LoteImportacao_id])
REFERENCES [dbo].[TBLoteImportacoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBPassagensMonitoramentos_LoteImportacao_id]
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensMonitoramentos_Monitoramento_id] FOREIGN KEY([Monitoramento_id])
REFERENCES [dbo].[TBMonitoramentos] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBPassagensMonitoramentos_Monitoramento_id]
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPassagensMonitoramentos_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBPassagensMonitoramentos] CHECK CONSTRAINT [FK_TBPassagensMonitoramentos_Operacao_id]
GO
ALTER TABLE [dbo].[TBPerfilAcessosPermissoesAcesso]  WITH CHECK ADD  CONSTRAINT [FK_TBPerfilAcessosPermissoesAcesso_PerfilAcesso_id] FOREIGN KEY([PerfilAcesso_id])
REFERENCES [dbo].[TBPerfilAcessos] ([Id])
GO
ALTER TABLE [dbo].[TBPerfilAcessosPermissoesAcesso] CHECK CONSTRAINT [FK_TBPerfilAcessosPermissoesAcesso_PerfilAcesso_id]
GO
ALTER TABLE [dbo].[TBPerfilAcessosPermissoesAcesso]  WITH CHECK ADD  CONSTRAINT [FK_TBPerfilAcessosPermissoesAcesso_PermissaoAcesso_id] FOREIGN KEY([PermissaoAcesso_id])
REFERENCES [dbo].[TBPermissoesAcesso] ([Id])
GO
ALTER TABLE [dbo].[TBPerfilAcessosPermissoesAcesso] CHECK CONSTRAINT [FK_TBPerfilAcessosPermissoesAcesso_PermissaoAcesso_id]
GO
ALTER TABLE [dbo].[TBPermissoesAcesso]  WITH CHECK ADD  CONSTRAINT [FK_TBPermissoesAcesso_PermissaoAcessoPai_id] FOREIGN KEY([PermissaoAcessoPai_id])
REFERENCES [dbo].[TBPermissoesAcesso] ([Id])
GO
ALTER TABLE [dbo].[TBPermissoesAcesso] CHECK CONSTRAINT [FK_TBPermissoesAcesso_PermissaoAcessoPai_id]
GO
ALTER TABLE [dbo].[TBPostoFuncionamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPostoFuncionamentos_Posto_id] FOREIGN KEY([Posto_id])
REFERENCES [dbo].[TBPostos] ([Id])
GO
ALTER TABLE [dbo].[TBPostoFuncionamentos] CHECK CONSTRAINT [FK_TBPostoFuncionamentos_Posto_id]
GO
ALTER TABLE [dbo].[TBPostoFuncionamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPostoFuncionamentos_UsuarioAbertura_id] FOREIGN KEY([UsuarioAbertura_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBPostoFuncionamentos] CHECK CONSTRAINT [FK_TBPostoFuncionamentos_UsuarioAbertura_id]
GO
ALTER TABLE [dbo].[TBPostoFuncionamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBPostoFuncionamentos_UsuarioFechamento_id] FOREIGN KEY([UsuarioFechamento_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBPostoFuncionamentos] CHECK CONSTRAINT [FK_TBPostoFuncionamentos_UsuarioFechamento_id]
GO
ALTER TABLE [dbo].[TBPostoOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBPostoOperacoes_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBPostoOperacoes] CHECK CONSTRAINT [FK_TBPostoOperacoes_Operacao_id]
GO
ALTER TABLE [dbo].[TBPostoOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBPostoOperacoes_Posto_id] FOREIGN KEY([Posto_id])
REFERENCES [dbo].[TBPostos] ([Id])
GO
ALTER TABLE [dbo].[TBPostoOperacoes] CHECK CONSTRAINT [FK_TBPostoOperacoes_Posto_id]
GO
ALTER TABLE [dbo].[TBPostos]  WITH CHECK ADD  CONSTRAINT [FK_TBPostos_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBPostos] CHECK CONSTRAINT [FK_TBPostos_Equipamento_id]
GO
ALTER TABLE [dbo].[TBPostoUsuarios]  WITH CHECK ADD  CONSTRAINT [FK_TBPostoUsuarios_Posto_id] FOREIGN KEY([Posto_id])
REFERENCES [dbo].[TBPostos] ([Id])
GO
ALTER TABLE [dbo].[TBPostoUsuarios] CHECK CONSTRAINT [FK_TBPostoUsuarios_Posto_id]
GO
ALTER TABLE [dbo].[TBPostoUsuarios]  WITH CHECK ADD  CONSTRAINT [FK_TBPostoUsuarios_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBPostoUsuarios] CHECK CONSTRAINT [FK_TBPostoUsuarios_Usuario_id]
GO
ALTER TABLE [dbo].[TBQuantitativos]  WITH CHECK ADD  CONSTRAINT [FK_TBQuantitativos_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBQuantitativos] CHECK CONSTRAINT [FK_TBQuantitativos_Equipamento_id]
GO
ALTER TABLE [dbo].[TBQuantitativos]  WITH CHECK ADD  CONSTRAINT [FK_TBQuantitativos_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBQuantitativos] CHECK CONSTRAINT [FK_TBQuantitativos_Faixa_id]
GO
ALTER TABLE [dbo].[TBQuantitativos]  WITH CHECK ADD  CONSTRAINT [FK_TBQuantitativos_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBQuantitativos] CHECK CONSTRAINT [FK_TBQuantitativos_Operacao_id]
GO
ALTER TABLE [dbo].[TBSequencialInfracoesFalhas]  WITH CHECK ADD  CONSTRAINT [FK_TBSequencialInfracoesFalhas_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBSequencialInfracoesFalhas] CHECK CONSTRAINT [FK_TBSequencialInfracoesFalhas_Faixa_id]
GO
ALTER TABLE [dbo].[TBSequencialInfracoesFalhas]  WITH CHECK ADD  CONSTRAINT [FK_TBSequencialInfracoesFalhas_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBSequencialInfracoesFalhas] CHECK CONSTRAINT [FK_TBSequencialInfracoesFalhas_Operacao_id]
GO
ALTER TABLE [dbo].[TBTestesEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBTestesEquipamentos_Equipamento_id] FOREIGN KEY([Equipamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBTestesEquipamentos] CHECK CONSTRAINT [FK_TBTestesEquipamentos_Equipamento_id]
GO
ALTER TABLE [dbo].[TBTestesEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBTestesEquipamentos_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBTestesEquipamentos] CHECK CONSTRAINT [FK_TBTestesEquipamentos_Faixa_id]
GO
ALTER TABLE [dbo].[TBTestesEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBTestesEquipamentos_LoteImportacao_id] FOREIGN KEY([LoteImportacao_id])
REFERENCES [dbo].[TBLoteImportacoes] ([Id])
GO
ALTER TABLE [dbo].[TBTestesEquipamentos] CHECK CONSTRAINT [FK_TBTestesEquipamentos_LoteImportacao_id]
GO
ALTER TABLE [dbo].[TBTestesEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBTestesEquipamentos_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBTestesEquipamentos] CHECK CONSTRAINT [FK_TBTestesEquipamentos_Operacao_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_ClassificacaoVeiculo_id] FOREIGN KEY([ClassificacaoVeiculo_id])
REFERENCES [dbo].[TBClassificacoesVeiculos] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_ClassificacaoVeiculo_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_EquipamentoAbertura_id] FOREIGN KEY([EquipamentoAbertura_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_EquipamentoAbertura_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_EquipamentoFechamento_id] FOREIGN KEY([EquipamentoFechamento_id])
REFERENCES [dbo].[TBEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_EquipamentoFechamento_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_Faixa_id] FOREIGN KEY([Faixa_id])
REFERENCES [dbo].[TBFaixas] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_Faixa_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_MotivoAbertura_id] FOREIGN KEY([MotivoAbertura_id])
REFERENCES [dbo].[TBMotivoTicketPesagens] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_MotivoAbertura_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_MotivoFechamento_id] FOREIGN KEY([MotivoFechamento_id])
REFERENCES [dbo].[TBMotivoTicketPesagens] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_MotivoFechamento_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_Posto_id] FOREIGN KEY([Posto_id])
REFERENCES [dbo].[TBPostos] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_Posto_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_Usuario_id]
GO
ALTER TABLE [dbo].[TBTicketPesagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTicketPesagens_UsuarioTriagem_id] FOREIGN KEY([UsuarioTriagem_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBTicketPesagens] CHECK CONSTRAINT [FK_TBTicketPesagens_UsuarioTriagem_id]
GO
ALTER TABLE [dbo].[TBTipoEquipamentoTipoInfracaoFormaAtuacao]  WITH CHECK ADD  CONSTRAINT [FK_TBFormaAtuacao_FormaAtuacao_id] FOREIGN KEY([FormaAtuacao_id])
REFERENCES [dbo].[TBFormaAtuacao] ([Id])
GO
ALTER TABLE [dbo].[TBTipoEquipamentoTipoInfracaoFormaAtuacao] CHECK CONSTRAINT [FK_TBFormaAtuacao_FormaAtuacao_id]
GO
ALTER TABLE [dbo].[TBTipoEquipamentoTipoInfracaoFormaAtuacao]  WITH CHECK ADD  CONSTRAINT [FK_TBTipoEquipamentos_TipoEquipamento_id] FOREIGN KEY([TipoEquipamento_id])
REFERENCES [dbo].[TBTipoEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBTipoEquipamentoTipoInfracaoFormaAtuacao] CHECK CONSTRAINT [FK_TBTipoEquipamentos_TipoEquipamento_id]
GO
ALTER TABLE [dbo].[TBTriagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagens_id] FOREIGN KEY([Id])
REFERENCES [dbo].[TBInfracoes] ([Id])
GO
ALTER TABLE [dbo].[TBTriagens] CHECK CONSTRAINT [FK_TBTriagens_id]
GO
ALTER TABLE [dbo].[TBTriagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagens_MotivoDescarte_id] FOREIGN KEY([MotivoDescarte_id])
REFERENCES [dbo].[TBMotivosDescartes] ([Id])
GO
ALTER TABLE [dbo].[TBTriagens] CHECK CONSTRAINT [FK_TBTriagens_MotivoDescarte_id]
GO
ALTER TABLE [dbo].[TBTriagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagens_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBTriagens] CHECK CONSTRAINT [FK_TBTriagens_Usuario_id]
GO
ALTER TABLE [dbo].[TBTriagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagens_UsuarioAuditoria_id] FOREIGN KEY([UsuarioAuditoria_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBTriagens] CHECK CONSTRAINT [FK_TBTriagens_UsuarioAuditoria_id]
GO
ALTER TABLE [dbo].[TBTriagens]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagens_UsuarioTriagem_id] FOREIGN KEY([UsuarioTriagem_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBTriagens] CHECK CONSTRAINT [FK_TBTriagens_UsuarioTriagem_id]
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagensCronotacografos_id] FOREIGN KEY([Id])
REFERENCES [dbo].[TBPassagensCronotacografos] ([Id])
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos] CHECK CONSTRAINT [FK_TBTriagensCronotacografos_id]
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagensCronotacografos_MotivoDescarte_id] FOREIGN KEY([MotivoDescarte_id])
REFERENCES [dbo].[TBMotivosDescartes] ([Id])
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos] CHECK CONSTRAINT [FK_TBTriagensCronotacografos_MotivoDescarte_id]
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagensCronotacografos_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos] CHECK CONSTRAINT [FK_TBTriagensCronotacografos_Usuario_id]
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagensCronotacografos_UsuarioAuditoria_id] FOREIGN KEY([UsuarioAuditoria_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos] CHECK CONSTRAINT [FK_TBTriagensCronotacografos_UsuarioAuditoria_id]
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos]  WITH CHECK ADD  CONSTRAINT [FK_TBTriagensCronotacografos_UsuarioTriagem_id] FOREIGN KEY([UsuarioTriagem_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBTriagensCronotacografos] CHECK CONSTRAINT [FK_TBTriagensCronotacografos_UsuarioTriagem_id]
GO
ALTER TABLE [dbo].[TBUserSessions]  WITH CHECK ADD  CONSTRAINT [FK_TBUserSessions_UserId] FOREIGN KEY([User_Id])
REFERENCES [dbo].[TBUsuarios] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TBUserSessions] CHECK CONSTRAINT [FK_TBUserSessions_UserId]
GO
ALTER TABLE [dbo].[TBUsuariosAcessoPorIps]  WITH CHECK ADD  CONSTRAINT [FK_TBUsuariosAcessoPorIps_AcessoPorIp_id] FOREIGN KEY([AcessoPorIp_id])
REFERENCES [dbo].[TBAcessoPorIps] ([Id])
GO
ALTER TABLE [dbo].[TBUsuariosAcessoPorIps] CHECK CONSTRAINT [FK_TBUsuariosAcessoPorIps_AcessoPorIp_id]
GO
ALTER TABLE [dbo].[TBUsuariosAcessoPorIps]  WITH CHECK ADD  CONSTRAINT [FK_TBUsuariosAcessoPorIps_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBUsuariosAcessoPorIps] CHECK CONSTRAINT [FK_TBUsuariosAcessoPorIps_Usuario_id]
GO
ALTER TABLE [dbo].[TBUsuariosGrupoEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBUsuariosGrupoEquipamentos_GrupoEquipamento_id] FOREIGN KEY([GrupoEquipamento_id])
REFERENCES [dbo].[TBGrupoEquipamentos] ([Id])
GO
ALTER TABLE [dbo].[TBUsuariosGrupoEquipamentos] CHECK CONSTRAINT [FK_TBUsuariosGrupoEquipamentos_GrupoEquipamento_id]
GO
ALTER TABLE [dbo].[TBUsuariosGrupoEquipamentos]  WITH CHECK ADD  CONSTRAINT [FK_TBUsuariosGrupoEquipamentos_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBUsuariosGrupoEquipamentos] CHECK CONSTRAINT [FK_TBUsuariosGrupoEquipamentos_Usuario_id]
GO
ALTER TABLE [dbo].[TBUsuariosPerfilAcessos]  WITH CHECK ADD  CONSTRAINT [FK_TBUsuariosPerfilAcessos_PerfilAcesso_id] FOREIGN KEY([PerfilAcesso_id])
REFERENCES [dbo].[TBPerfilAcessos] ([Id])
GO
ALTER TABLE [dbo].[TBUsuariosPerfilAcessos] CHECK CONSTRAINT [FK_TBUsuariosPerfilAcessos_PerfilAcesso_id]
GO
ALTER TABLE [dbo].[TBUsuariosPerfilAcessos]  WITH CHECK ADD  CONSTRAINT [FK_TBUsuariosPerfilAcessos_Usuario_id] FOREIGN KEY([Usuario_id])
REFERENCES [dbo].[TBUsuarios] ([Id])
GO
ALTER TABLE [dbo].[TBUsuariosPerfilAcessos] CHECK CONSTRAINT [FK_TBUsuariosPerfilAcessos_Usuario_id]
GO
ALTER TABLE [dbo].[TBVeiculos]  WITH CHECK ADD  CONSTRAINT [FK_TBVeiculos_Infracao_id] FOREIGN KEY([Infracao_id])
REFERENCES [dbo].[TBInfracoes] ([Id])
GO
ALTER TABLE [dbo].[TBVeiculos] CHECK CONSTRAINT [FK_TBVeiculos_Infracao_id]
GO
ALTER TABLE [dbo].[TBVeiculos]  WITH CHECK ADD  CONSTRAINT [FK_TBVeiculos_PassagemCronotacografo_id] FOREIGN KEY([PassagemCronotacografo_id])
REFERENCES [dbo].[TBPassagensCronotacografos] ([Id])
GO
ALTER TABLE [dbo].[TBVeiculos] CHECK CONSTRAINT [FK_TBVeiculos_PassagemCronotacografo_id]
GO
ALTER TABLE [dbo].[TBWebHooksOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBWebHooksOperacoes_Operacao_id] FOREIGN KEY([Operacao_id])
REFERENCES [dbo].[TBOperacoes] ([Id])
GO
ALTER TABLE [dbo].[TBWebHooksOperacoes] CHECK CONSTRAINT [FK_TBWebHooksOperacoes_Operacao_id]
GO
ALTER TABLE [dbo].[TBWebHooksOperacoes]  WITH CHECK ADD  CONSTRAINT [FK_TBWebHooksOperacoes_WebHook_id] FOREIGN KEY([WebHook_id])
REFERENCES [dbo].[TBWebHooks] ([Id])
GO
ALTER TABLE [dbo].[TBWebHooksOperacoes] CHECK CONSTRAINT [FK_TBWebHooksOperacoes_WebHook_id]
GO
