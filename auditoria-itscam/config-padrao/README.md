# Configurações Padrão — ITScam 450

## Arquivos de Backup (.bkp)
Os arquivos `.bkp` são exportados pela câmera ITScam 450 (Pumatronix) e contêm toda a configuração do equipamento em formato criptografado.

- `itscam_450_FAIXA_1_PADRAO_UPDATE.bkp` — Backup padrão Faixa 1
- `itscam_450_FAIXA_2_PADRAO_UPDATE.bkp` — Backup padrão Faixa 2

> ⚠️ Os backups são criptografados e só podem ser restaurados pela interface da câmera em:
> **Sistema > Manutenção > Backup > Restaurar**

## Configuração Padrão em JSON
Os arquivos `padrao-faixa-1.json` e `padrao-faixa-2.json` contêm os valores esperados em cada endpoint da API REST.

## REST API Client Templates
Os arquivos `rest-api-client-faixa-*.json` definem o template de envio de imagens ao servidor central.

## Uso
```bash
# Comparar configuração atual vs padrão
node auditoria-itscam/analise-aprimorada.mjs

# Comparar apenas um equipamento
node auditoria-itscam/analise-aprimorada.mjs --equip=GOEC6O010
```
