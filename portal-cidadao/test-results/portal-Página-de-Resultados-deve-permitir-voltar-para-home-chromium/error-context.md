# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.js >> Página de Resultados >> deve permitir voltar para home
- Location: tests\e2e\portal.spec.js:232:3

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - navigation [ref=e5]:
        - generic [ref=e6]:
          - link "A Portal do Cidadão Powered by Axion" [ref=e7] [cursor=pointer]:
            - /url: /
            - generic [ref=e9]: A
            - generic [ref=e10]:
              - text: Portal do Cidadão
              - paragraph [ref=e11]: Powered by Axion
          - generic [ref=e12]:
            - link "Consultar Infrações" [ref=e13] [cursor=pointer]:
              - /url: /
            - link "Entrar" [ref=e14] [cursor=pointer]:
              - /url: /login
              - img [ref=e15]
              - generic [ref=e18]: Entrar
    - main [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e23]:
          - heading "Portal do Cidadão" [level=1] [ref=e24]
          - paragraph [ref=e25]: Consulte e conteste infrações de trânsito de forma rápida e segura
          - button "Consultar Agora" [ref=e26] [cursor=pointer]:
            - img [ref=e27]
            - generic [ref=e30]: Consultar Agora
        - generic [ref=e32]:
          - heading "Como funciona?" [level=2] [ref=e33]
          - generic [ref=e34]:
            - generic [ref=e35]:
              - img [ref=e37]
              - heading "1. Consulte" [level=3] [ref=e40]
              - paragraph [ref=e41]: Informe seu CPF ou placa do veículo para consultar infrações pendentes
            - generic [ref=e42]:
              - img [ref=e44]
              - heading "2. Analise" [level=3] [ref=e47]
              - paragraph [ref=e48]: Veja detalhes completos das infrações, incluindo fotos e documentos
            - generic [ref=e49]:
              - img [ref=e51]
              - heading "3. Conteste" [level=3] [ref=e53]
              - paragraph [ref=e54]: Abra uma contestação online com documentos e acompanhe o processo
        - generic [ref=e59]:
          - img [ref=e61]
          - generic [ref=e63]:
            - heading "Assistente Virtual com IA" [level=3] [ref=e64]
            - paragraph [ref=e65]: Tire suas dúvidas sobre infrações, processos e legislação com nosso assistente inteligente, disponível 24/7.
            - generic [ref=e66]: Disponível agora
        - generic [ref=e70]:
          - img [ref=e71]
          - heading "Segurança e Privacidade" [level=3] [ref=e73]
          - paragraph [ref=e74]: Seus dados estão protegidos por criptografia de ponta a ponta. Somos 100% conformes com a Lei Geral de Proteção de Dados (LGPD).
          - generic [ref=e75]:
            - generic [ref=e76]: 🔒 Criptografia AES-256
            - generic [ref=e77]: ✅ LGPD Compliant
            - generic [ref=e78]: 🛡️ reCAPTCHA v3
            - generic [ref=e79]: 🔐 Autenticação JWT
    - contentinfo [ref=e80]:
      - generic [ref=e81]:
        - generic [ref=e82]:
          - generic [ref=e83]:
            - heading "Portal do Cidadão" [level=3] [ref=e84]
            - paragraph [ref=e85]: Consulte e conteste infrações de trânsito de forma rápida e segura. Plataforma oficial para acesso aos seus dados.
            - generic [ref=e86]:
              - generic [ref=e88]: A
              - generic [ref=e89]: Powered by Axion Tecnologia
          - generic [ref=e90]:
            - heading "Links Úteis" [level=3] [ref=e91]
            - list [ref=e92]:
              - listitem [ref=e93]:
                - link "Consultar Infrações" [ref=e94] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e95]:
                - link "Meus Processos" [ref=e96] [cursor=pointer]:
                  - /url: /meus-processos
              - listitem [ref=e97]:
                - link "Como Contestar" [ref=e98] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e99]:
                - link "Perguntas Frequentes" [ref=e100] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e101]:
                - link "Política de Privacidade" [ref=e102] [cursor=pointer]:
                  - /url: "#"
          - generic [ref=e103]:
            - heading "Contato" [level=3] [ref=e104]
            - list [ref=e105]:
              - listitem [ref=e106]:
                - img [ref=e107]
                - link "contato@axion.com.br" [ref=e110] [cursor=pointer]:
                  - /url: mailto:contato@axion.com.br
              - listitem [ref=e111]:
                - img [ref=e112]
                - link "(81) 99999-9999" [ref=e114] [cursor=pointer]:
                  - /url: tel:+5581999999999
              - listitem [ref=e115]:
                - img [ref=e116]
                - generic [ref=e119]: Recife, PE - Brasil
        - generic [ref=e120]:
          - paragraph [ref=e121]: © 2026 Axion Tecnologia. Todos os direitos reservados.
          - paragraph [ref=e122]: LGPD Compliant | Dados protegidos por criptografia AES-256
  - generic [ref=e123]:
    - img [ref=e125]
    - button "Open Tanstack query devtools" [ref=e173] [cursor=pointer]:
      - img [ref=e174]
```