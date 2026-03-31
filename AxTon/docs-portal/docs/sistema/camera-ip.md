---
sidebar_position: 2
title: Câmera IP
description: Instalação, configuração e solução de problemas de câmeras IP no AxTon
---

# Câmera IP

![Tela de Câmera IP](../img/Sistema%20-%20camera%20ip.png)

A aba **Câmera IP** nas Configurações do Sistema permite configurar a câmera utilizada para captura de imagens dos veículos durante a pesagem.

## Como acessar

**Menu lateral** → **Sistema** → aba **Câmera IP**

## Campos da configuração

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **IP** | Endereço IP da câmera na rede local | `192.168.11.21` |
| **Altura** | Altura da resolução da imagem em pixels | `1080` |
| **Largura** | Largura da resolução da imagem em pixels | `1280` |
| **Usuário de login** | Credencial de acesso à câmera | `admin` |
| **Senha de login** | Senha de acesso à câmera | *(definida pelo fabricante/instalador)* |

## Câmeras compatíveis testadas

| Fabricante | Modelo | Interface |
|------------|--------|-----------|
| **Uniview (UNV)** | IPC2122LB-ADF28KM-G / IPC2112LB-ADF28KM-G | UNV Web — Live View, Setup |
| **Intelbras** | VIP-1230-B / VIP-1230-D | CFTV IP — Intelbras Acesso Web |

## Passo a passo — Configurar câmera IP

1. **Verifique o acesso à câmera** — Abra o Google Chrome e digite o IP da câmera na barra de endereço (ex.: `http://192.168.11.21`). Confirme que a imagem ao vivo (Live View) é exibida corretamente.
2. **Acesse as Configurações do Sistema** — No AxTon, clique em **Sistema** no menu lateral e depois na aba **Câmera IP**.
3. **Preencha o IP** — Informe o endereço IP da câmera (ex.: `192.168.11.21`).
4. **Preencha a resolução** — Defina **Altura** (ex.: `1080`) e **Largura** (ex.: `1280`).
5. **Informe as credenciais** — Preencha **Usuário de login** (ex.: `admin`) e **Senha de login**.
6. **Teste a conexão** — Clique em **Testar câmera** para validar.
7. **Salve** — Se o teste for bem-sucedido, clique em **+ Salvar**.

## Solução de problemas

### Erro: "Falha ao conectar na câmera — Any suitable track is not found"

Este é o erro mais comum ao configurar câmeras IP no AxTon. Ele ocorre quando o software não consegue localizar um stream de vídeo compatível, **mesmo que a câmera esteja acessível pelo navegador**.

#### Causas possíveis

| Causa | Descrição |
|-------|-----------|
| **Codec incompatível** | A câmera está transmitindo apenas em H.265 (HEVC), que o AxTon pode não suportar. O sistema espera **H.264** |
| **Porta RTSP incorreta** | A porta padrão RTSP (554) pode estar diferente na câmera |
| **Stream principal vs. substream** | O AxTon pode não conseguir acessar o stream principal. Tente configurar o substream |
| **Credenciais incorretas** | Usuário ou senha digitados de forma incorreta |
| **Firewall/rede** | Alguma regra de firewall bloqueando a porta RTSP entre o servidor AxTon e a câmera |
| **Protocolo ONVIF desativado** | Algumas câmeras precisam ter o ONVIF habilitado para acesso externo ao stream |

#### Passo a passo para resolver

1. **Acesse a interface web da câmera** pelo navegador e vá em configurações de **Vídeo / Encode / Stream**.
2. **Altere o codec do Stream Principal para H.264** (em vez de H.265). Na UNV: Setup → Video & Audio → Video. Na Intelbras: Configurações → Câmera → Vídeo.
3. **Verifique a porta RTSP** — confirme que é **554** (padrão). Na UNV: Setup → Network → Port. Na Intelbras: Configurações → Rede → Portas.
4. **Habilite o protocolo ONVIF** se disponível. Na UNV: Setup → Network → Protocol → ONVIF. Na Intelbras: Configurações → Rede → ONVIF.
5. **Teste novamente no AxTon** — Volte à aba Câmera IP e clique em **Testar câmera**.
6. **Se persistir**, tente usar o **Substream** configurando resolução menor (ex.: 640×480) e codec H.264.

:::warning Atenção
Após alterar configurações na câmera, aguarde alguns segundos para a câmera reiniciar o serviço de streaming antes de testar novamente no AxTon.
:::

:::tip Dica
Para confirmar que o stream RTSP funciona, teste no VLC Media Player: **Mídia → Abrir Transmissão de Rede** e insira `rtsp://admin:SENHA@IP:554/stream1` (o caminho exato varia por fabricante).
:::

### Erro: "Falha ao conectar na câmera" (sem detalhes adicionais)

| Verificação | Ação |
|-------------|------|
| Câmera ligada? | Verifique alimentação PoE ou fonte de energia |
| IP correto? | Confirme o IP acessando pelo navegador |
| Mesma rede? | O servidor AxTon e a câmera devem estar na mesma sub-rede ou com rota configurada |
| Credenciais válidas? | Teste login diretamente na interface web da câmera |
| Porta liberada? | Verifique se a porta 554 (RTSP) e 80 (HTTP) estão abertas |

## Referência de portas

| Porta | Protocolo | Uso |
|-------|-----------|-----|
| **80** | HTTP | Acesso à interface web da câmera |
| **554** | RTSP | Stream de vídeo em tempo real |
| **8000** | SDK | Porta de integração SDK (alguns modelos) |
| **443** | HTTPS | Acesso web seguro (quando habilitado) |
