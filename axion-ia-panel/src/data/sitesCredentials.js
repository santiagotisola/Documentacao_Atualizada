/**
 * Dados de credenciais de todos os sites AxHub e AxCross
 * Usado pelo CredenciaisManager para gerenciar senhas
 */

export const CREDENCIAIS_AXHUB = [
  { id: 'axhub-ibametro', nome: 'IBAMETRO', url: 'https://ibametro.axhub.axion.ws', estado: 'BA', tipo: 'Metrologia', login: 'admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-imepi', nome: 'IMEPI', url: 'https://imepi.axhub.axion.ws', estado: 'PI', tipo: 'Metrologia', login: 'admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-imeqpb', nome: 'IMEQPB', url: 'https://imeqpb.axhub.axion.ws', estado: 'PB', tipo: 'Metrologia', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-imetropa', nome: 'IMETROPA', url: 'https://imetropa.axhub.axion.ws', estado: 'PA', tipo: 'Metrologia', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-ipemce', nome: 'IPEMCE', url: 'https://ipemce.axhub.axion.ws', estado: 'CE', tipo: 'Metrologia', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-ipempe', nome: 'IPEMPE', url: 'https://ipempe.axhub.axion.ws', estado: 'PE', tipo: 'Metrologia', login: 'admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-derse', nome: 'DERSE', url: 'https://derse.axhub.axion.ws', estado: 'PI', tipo: 'Rodovias', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-strans', nome: 'STRANS', url: 'https://strans.axhub.axion.ws', estado: 'PI', tipo: 'Trânsito Municipal', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-detranma', nome: 'DETRANMA', url: 'https://detranma.axhub.axion.ws', estado: 'MA', tipo: 'Trânsito Estadual', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-detranpi', nome: 'DETRANPI', url: 'https://detranpi.axhub.axion.ws', estado: 'PI', tipo: 'Trânsito Estadual', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-goiania', nome: 'GOIÂNIA', url: 'https://goiania.axhub.axion.ws', estado: 'GO', tipo: 'Trânsito Municipal', login: 'suporte@axiontecnologia.com.br', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-ipemmt', nome: 'IPEMMT', url: 'https://ipemmt.axhub.axion.ws', estado: 'MT', tipo: 'Metrologia', login: 'admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-itps', nome: 'ITPS', url: 'https://itps.axhub.axion.ws', estado: 'SE', tipo: 'Metrologia', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-smtt', nome: 'SMTT', url: 'https://smtt.axhub.axion.ws', estado: 'AL', tipo: 'Trânsito Municipal', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-economia', nome: 'ECONOMIA', url: 'https://economia.axhub.axion.ws', estado: 'GO', tipo: 'Fiscal', login: 'via OIDC (economia.axion.ws)', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-imperatriz', nome: 'IMPERATRIZ', url: 'https://imperatriz.axhub.axion.ws', estado: 'MA', tipo: 'Trânsito Municipal', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-homologacao', nome: 'HOMOLOGAÇÃO', url: 'https://homologacao.axhub.axion.ws', estado: '—', tipo: 'Homologação', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub', obs: 'VERIFICAR — pode ter senha diferente' },
  { id: 'axhub-setrans', nome: 'SETRANS', url: 'https://setrans.axhub.axion.ws', estado: 'PI', tipo: 'Rodovias', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-aemto', nome: 'AEMTO', url: 'https://aemto.axhub.axion.ws', estado: 'TO', tipo: 'Metrologia', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub' },
  { id: 'axhub-way306', nome: 'WAY306', url: 'https://way306.axhub.axion.ws', estado: '—', tipo: 'Trânsito', login: 'Admin', senha: 'Labor#5383', sistema: 'AxHub', obs: 'Usuários em /usuario' },
];

export const CREDENCIAIS_AXCROSS = [
  { id: 'axcross-derse', nome: 'DERSE', url: 'https://derse.axcross.axion.ws', estado: 'PI', tipo: 'Rodovias', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-detranpi', nome: 'DETRANPI', url: 'https://detranpi.axcross.axion.ws', estado: 'PI', tipo: 'Trânsito Estadual', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-detranma', nome: 'DETRANMA', url: 'https://detranma.axcross.axion.ws', estado: 'MA', tipo: 'Trânsito Estadual', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-imperatriz', nome: 'IMPERATRIZ', url: 'https://imperatriz.axcross.axion.ws', estado: 'MA', tipo: 'Trânsito Municipal', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-ipemce', nome: 'IPEMCE', url: 'https://ipemce.axcross.axion.ws', estado: 'CE', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-ipemmt', nome: 'IPEMMT', url: 'https://ipemmt.axcross.axion.ws', estado: 'MT', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-ipempe', nome: 'IPEMPE', url: 'https://ipempe.axcross.axion.ws', estado: 'PE', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-sefazpi', nome: 'SEFAZPI', url: 'https://sefazpi.axcross.axion.ws', estado: 'PI', tipo: 'Fiscal', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-goiania', nome: 'GOIÂNIA', url: 'https://goiania.axcross.axion.ws', estado: 'GO', tipo: 'Trânsito Municipal', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-economia', nome: 'ECONOMIA', url: 'https://economia.axcross.axion.ws', estado: 'GO', tipo: 'Fiscal', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-setrans', nome: 'SETRANS', url: 'https://setrans.axcross.axion.ws', estado: 'PI', tipo: 'Rodovias', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-homologacao', nome: 'HOMOLOGAÇÃO', url: 'https://homologacao.axcross.axion.ws', estado: '—', tipo: 'Homologação', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-aemto', nome: 'AEMTO', url: 'https://aemto.axcross.axion.ws', estado: 'TO', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-imetropa', nome: 'IMETROPA', url: 'https://imetropa.axcross.axion.ws', estado: 'PA', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-ibametro', nome: 'IBAMETRO', url: 'https://ibametro.axcross.axion.ws', estado: 'BA', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-imepi', nome: 'IMEPI', url: 'https://imepi.axcross.axion.ws', estado: 'PI', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-imeqpb', nome: 'IMEQPB', url: 'https://imeqpb.axcross.axion.ws', estado: 'PB', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-itps', nome: 'ITPS', url: 'https://itps.axcross.axion.ws', estado: 'SE', tipo: 'Metrologia', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-smtt', nome: 'SMTT', url: 'https://smtt.axcross.axion.ws', estado: 'AL', tipo: 'Trânsito Municipal', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
  { id: 'axcross-strans', nome: 'STRANS', url: 'https://strans.axcross.axion.ws', estado: 'PI', tipo: 'Trânsito Municipal', login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', sistema: 'AxCross' },
];

export const PORTAIS_AUTH = [
  { id: 'auth-identity', nome: 'Identity Axion', url: 'https://identity.axion.ws', usadoPor: 'Geral', sistema: 'Auth' },
  { id: 'auth-goiania', nome: 'Goiânia Identity', url: 'https://goiania.id.axion.ws', usadoPor: 'GOIÂNIA AxHub/AxCross', sistema: 'Auth' },
  { id: 'auth-economia', nome: 'Economia OIDC', url: 'https://economia.axion.ws', usadoPor: 'ECONOMIA AxHub/AxCross', sistema: 'Auth' },
];

export const ALL_CREDENCIAIS = [...CREDENCIAIS_AXHUB, ...CREDENCIAIS_AXCROSS];

export const STATUS_CREDENCIAL = {
  PENDENTE: 'Pendente',
  ALTERADA: 'Alterada',
  VALIDADA: 'Validada',
  ERRO: 'Erro',
};





