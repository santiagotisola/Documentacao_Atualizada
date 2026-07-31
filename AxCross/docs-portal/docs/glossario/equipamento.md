---
sidebar_position: 2
title: Equipamento
---

# Equipamento

Dispositivo instalado em um cruzamento para detecção e registro de Veículos Pode ser câmera OCR/LPR, detector de laço indutivo, sensor de presença ou radar de velocidade.

## Campos cadastrais

| Campo | Descrição |
|-------|-----------|
| **Código** | Código único identificador do Equipamento |
| **Endereço** | Localização física onde está instalado |
| **Detecção por IA** | Indica se utiliza inteligência artificial para leitura de placas |
| **Acesso a Câmera** | Define se há acesso à câmera para visualização ao vivo |
| **Grupo** | Agrupamento lógico ao qual o Equipamento pertence |
| **Área** | Região geográfica de atuação |
| **Status** | Online, Offline, Manutenção |

## Tipos de Equipamento

| Tipo | Descrição |
|------|-----------|
| **Câmera OCR/LPR** | Leitura ótica de placas |
| **Detector de laço** | Detecta presença do veículo no pavímento |
| **Sensor de presença** | Alternativa ao laço indutivo |
| **Radar de velocidade** | Mede e registra a velocidade do veículo |

## Relacionado

- [Grupos de Equipamentos](../cadastros/grupos-equipamentos)
- [Alertas](../operacoes/alertas)

## Manutencao preventiva

| Atividade | Frequência recomendada |
|-----------|:---------------------:|
| Limpeza das lentes | Mensal |
| Verificação de conectividade | Semanal |
| Atualização de firmware | Conforme fabricante |
| Calibração OCR | Semestral |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Equipamento Offline | Falha de rede | Verificar conexão e reiniciar |
| Taxa OCR baixa | Câmera suja | Limpar lentes |
| Passagens duplicadas | Sensor muito sensível | Ajustar sensibilidade |
| Sem imagem | Armazenamento cheio | Limpar disco ou aumentar espaço |

:::tip
Equipamentos com taxa OCR abaixo de 85% precisam de intervenção técnica imediata para não comprometer os registros operacionais.
:::
## Status

| Status | Significado |
|--------|-------------|
| **Online** | Equipamento comunicando normalmente |
| **Offline** | Sem comunicação — requer verificação |
| **Manutenção** | Temporariamente fora de operação por manutenção programada |

:::warning
Equipamentos **Offline** não registram passagens. Verifique a conectividade e contate o suporte técnico se o equipamento não retornar ao status Online.
:::

Veja o cadastro completo em [Equipamentos](../cadastros/equipamentos).

## Ciclo de instalação

1. Instalação física no cruzamento
2. Cadastro em [Cadastros → Equipamentos](../cadastros/equipamentos)
3. Vinculação a uma [Faixa](../cadastros/faixas)
4. Teste de comunicação (status: Online)
5. Primeiro registro de passagem valida o funcionamento

## Boas práticas

- Realize a limpeza das lentes mensalmente para manter a taxa OCR acima de 90%
- Registre toda manutenção no sistema imediatamente — equipamentos sem histórico de manutenção podem ser contestados em auditorias
- Verifique a conectividade semanalmente; equipamentos offline prolongados geram lacunas no histórico de passagens

## Perguntas frequentes

**O que significa um equipamento com status Offline no AxCross?**
Status Offline indica que o equipamento perdeu comunicação com o sistema. Nenhuma passagem é registrada enquanto o equipamento estiver nesse estado. Verifique a conexão de rede, a alimentação elétrica e acione a equipe técnica se não retornar ao status Online após verificação.

**Por que a taxa OCR de um equipamento caiu repentinamente?**
As causas mais comuns são: lentes sujas (necessário limpeza), desalinhamento da câmera (ventos ou vibração), condições climáticas adversas (chuva intensa) ou falha no firmware de OCR. Verifique a imagem capturada para diagnosticar a causa antes de acionar manutenção técnica.

**É obrigatório vincular o equipamento a uma faixa imediatamente após o cadastro?**
Sim. Sem a vinculação com uma faixa, o equipamento não captura passagens mesmo estando Online. Após cadastrar o equipamento, acesse **Cadastros → Equipamentos**, selecione o equipamento e adicione as faixas necessárias.
