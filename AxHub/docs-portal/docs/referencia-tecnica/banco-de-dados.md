---
sidebar_position: 1
title: Banco de Dados
description: Referência técnica das principais tabelas SQL Server do AxHub
---

# Referência Técnica — Banco de Dados AxHub

O AxHub utiliza **SQL Server** com **120 tabelas**. Abaixo estão as principais tabelas agrupadas por domínio funcional.

---

## Domínios funcionais

| Domínio | Tabelas principais |
|---|---|
| Equipamentos | TBEquipamentos, TBTipoEquipamentos, TBModeloEquipamentos, TBFabricantes, TBFaixas, TBGrupoEquipamentos, TBHeartbeatEquipamentos |
| **Passagens** | TBPassagens, TBPassagensMonitoramentos, TBPassagensConjugadas, TBPassagensCronotacografos, TBImagemPassagens |
| Infrações | TBInfracoes, TBInfracoesEnquadramentos, TBEnquadramentos, TBSequencialInfracoes, TBMotivosDescartes |
| **Triagem/Auditoria** | TBTriagens, TBTriagensCronotacografos, TBHistoricoTriagens |
| **Operações** | TBOperacoes, TBOperacoesFaixas, TBPostos, TBPostoOperacoes, TBOperacoesRecursos |
| **Pesagens** | TBDadosPesagens, TBEixoPesagens, TBGrupoEixoPesagens, TBTicketPesagens, TBAfericoes |
| Veículos Monitorados** | TBMonitoramentos, TBPassagensMonitoramentos, TBImagemPassagensMonitoramentos |
| **Contratos** | TBContratos, TBAjustesContratuais, TBContratosFaixas |
| **Exportação** | TBLoteExportacoes, TBLoteImportacoes, TBSequencialLoteExportacoes, TBLayoutArquivos |
| **Usuários/Acesso** | TBUsuarios, TBPerfilAcessos, TBPermissoesAcesso, TBLogsAcessos, TBUserSessions, TBAcessosBloqueadosPeriodo |
| Veículos | TBVeiculos, TBCategoriaVeiculos, TBClassificacoesVeiculos, TBTipoVeiculos, TBEspecieVeiculos |
| Relatórios | TBRelatoriosPowerBi, TBQuantitativos |

---

## Tabelas principais

### TBPassagens
Registro de cada Veículo que passa pelos pontos monitorados.

| Campo | Descrição |
|---|---|
| `IdPassagem` | Identificador único |
| `DataHoraPassagem` | Data/hora da detecção |
| `Placa` | Placa lida pelo OCR |
| `Velocidade` | Velocidade medida |
| `IdEquipamento` | FK → TBEquipamentos |
| `IdLocal` | FK → TBLocais |
| `IdFaixa` | FK → TBFaixas |

---

### TBInfracoes
Infrações geradas após triagem e auditoria.

| Campo | Descrição |
|---|---|
| `IdInfracao` | Identificador único |
| `DataHoraInfracao` | Data/hora da Infração |
| `Placa` | Placa autuada |
| `IdEquipamento` | FK → TBEquipamentos |
| `Status` | Pendente, Auditada, Exportada, Descartada |

**Relacionamentos importantes:**
- `TBInfracoesEnquadramentos` — liga Infração ao enquadramento legal
- `TBInfracoesExcessoPeso` — dados específicos de excesso de peso

---

### TBTriagens
Controle do processo de triagem Validação das passagens/infrações).

| Campo | Descrição |
|---|---|
| `IdTriagem` | Identificador único |
| `Status` | Pendente, Aprovada, Descartada, Reaberta |
| `IdPassagem` | FK → TBPassagens |
| `IdUsuario` | Analista responsável |
| `DataHoraTriagem` | Data/hora da triagem |

---

### TBMonitoramentos
Veículos/placas em lista de monitoramento especial.

| Campo | Descrição |
|---|---|
| `IdMonitoramento` | Identificador único |
| `Placa` | Placa monitorada |
| `Ativo` | 1 = Ativo, 0 = Inativo |
| `Motivo` | Motivo do monitoramento |
| `IdClassificacao` | FK → TBClassificacoesVeiculos |

---

### TBLoteExportacoes
Controle dos lotes de exportação para órgãos autuadores.

| Campo | Descrição |
|---|---|
| `IdLoteExportacao` | Identificador único |
| `DataHoraGeracao` | Data/hora de geração |
| `Status` | Processando, Ok, Erro |
| `UrlArquivo` | Caminho do arquivo gerado |
| `TipoExportacao` | RENAINF, XML, TXT, CSV |

---

### TBSequencialInfracoes
Contador do número sequencial das AITs (Autos de Infração de Trânsito).

| Campo | Descrição |
|---|---|
| `IdSequencial` | Identificador único |
| `Sequential` | Valor atual do contador |
| `Prefix` | Prefixo do código da AIT |

:::warning Atenção
Nunca altere está tabela manualmente sem autorização. O número sequencial incorreto pode gerar AITs inválidas ou duplicadas.
:::

---

### TBHeartbeatEquipamentos
Status de comunicação de cada Equipamento

| Campo | Descrição |
|---|---|
| `IdEquipamento` | FK → TBEquipamentos |
| `DataHora` | Data/hora do último sinal |

:::tip Diagnóstico
Equipamentos sem heartbeat nas últimas 2 horas devem ser verificados. Compare `DataHora` com `GETDATE()` para identificar offline.
:::

---

### TBUserSessions / TBAcessosBloqueadosPeriodo
Controle de sessões ativas e bloqueios de Usuário

| Tabela | Finalidade |
|---|---|
| `TBUserSessions` | Sessões abertas (tokens ativos) |
| `TBAcessosBloqueadosPeriodo` | Usuários bloqueados por tentativas excessivas |
| `TBLogsAcessos` | Histórico completo de acessos ao sistema |

---

## API — Endpoints disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/axhub/status` | Testa conexão com banco |
| GET | `/api/axhub/resumo` | Contagem geral de registros |
| GET | `/api/axhub/Equipamentos` | Lista Equipamentos |
| GET | `/api/axhub/operacoes` | Últimas 50 operações |
| GET | `/api/axhub/infracoes` | Estatísticas e últimas Infrações |
| GET | `/api/axhub/heartbeat` | Status dos Equipamentos |
| GET | `/api/axhub/monitoramentos` | Veículos monitorados e últimas detecções |
| GET | `/api/axhub/passagens` | Últimas 20 passagens |
| GET | `/api/axhub/triagens` | Contagem de triagens por status |
| GET | `/api/axhub/tabelas` | Todas as 120 tabelas com contagem |

---

## Exemplos práticos

### Testar conexão

```bash
curl http://localhost:3100/api/axhub/status
```

```json
{ "conectado": true, "banco": "AxHub", "latencia": "12ms" }
```

---

### Buscar resumo geral

```bash
curl http://localhost:3100/api/axhub/resumo
```

```json
{
  Equipamentos 42,
  "operacoes": 1580,
  "infracoes": 94320,
  "passagens": 2847500,
  Usuários 18,
  "triagens": 91200
}
```

---

### Listar Equipamentos (JavaScript / Axios)

```js
import api from '../services/api';

const { data } = await api.get('/axhub/equipamentos');
console.log(data.total); // 42
console.log(data.equipamentos); // [{ IdEquipamento, NumeroSerie, Descricao, ... }]
```

---

### Verificar Infrações por enquadramento

```bash
curl http://localhost:3100/api/axhub/infracoes
```

```json
{
  "total": 94320,
  "porEnquadramento": [
    { "Enquadramento": "Excesso de Velocidade", "Total": 52400 },
 { "Enquadramento": "Excesso de Peso PBT", "Total": 18900 },
 { "Enquadramento": "Excesso de Eixo", "Total": 9200 }
  ],
  "ultimas": [
    { "IdInfracao": 94320, "DataHoraInfracao": "2026-03-31T22:10:00", "Placa": "ABC1D23", Equipamento "Radar Km-42" }
  ]
}
```

---

### Monitoramentos — placas em alerta

```bash
curl http://localhost:3100/api/axhub/monitoramentos
```

```json
{
  "monitoramentosAtivos": 15,
  "ultimasDeteccoes": [
    {
      "IdPassagemMonitoramento": 8821,
      "DataHora": "2026-03-31T21:45:00",
      "Placa": "XYZ9A10",
      Equipamento "Câmera Norte - P1",
      "Local": "Posto Km-12 BR-101"
    }
  ]
}
```

---

### Triagens por status

```bash
curl http://localhost:3100/api/axhub/triagens
```

```json
{
  "porStatus": [
  { "Status": "Aprovada", "Total": 82000 },
 { "Status": "Pendente", "Total": 3120 },
 { "Status": "Descartada", "Total": 6100 }
  ]
}
```

---

### Query SQL direta — Equipamentos offline

```sql
-- Equipamentos sem heartbeat nas últimas 2 horas
SELECT
  e.Descricao AS Equipamento
  e.NumeroSerie,
 h.DataHora AS UltimoHeartbeat,
  DATEDIFF(MINUTE, h.DataHora, GETDATE()) AS MinutosSemSinal
FROM TBHeartbeatEquipamentos h
JOIN TBEquipamentos e ON h.IdEquipamento = e.IdEquipamento
WHERE h.DataHora < DATEADD(HOUR, -2, GETDATE())
ORDER BY h.DataHora ASC;
```

---

### Query SQL direta — Infrações pendentes de exportação

```sql
-- Infrações auditadas mas não exportadas
SELECT
  i.IdInfracao,
  i.DataHoraInfracao,
  i.Placa,
  i.Status
FROM TBInfracoes i
WHERE i.Status = 'Auditada'
  AND i.IdLoteExportacao IS NULL
ORDER BY i.DataHoraInfracao ASC;
```

---

### Integração no axion-ia-panel (React)

```jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ResumoAxHub() {
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    api.get('/axhub/resumo').then(r => setResumo(r.data));
  }, []);

  if (!resumo) return <p>Carregando...</p>;

  return (
    <div>
      <p>Equipamentos: {resumo.equipamentos}</p>
      <p>Passagens: {resumo.passagens.toLocaleString()}</p>
      <p>Infrações: {resumo.infracoes.toLocaleString()}</p>
      <p>Triagens pendentes: {resumo.triagens}</p>
    </div>
  );
}
```
