# Automação do Cadastro de Usuários — Blocks

Testes E2E do fluxo de cadastro em [blocksrvt.com/pt/registrar](https://www.blocksrvt.com/pt/registrar), escritos com **Playwright + JavaScript**.

## Como executar

Pré-requisito: Node.js 18+.

```bash
npm ci
npx playwright install
npm test
```

| Comando | O que faz |
|---|---|
| `npm test` | Roda todos os testes no Chromium, Firefox e WebKit |
| `npm run test:smoke` | Roda só o cadastro com sucesso (`@smoke`) |
| `npm run test:negative` | Roda só os cenários negativos (`@negative`) |
| `npm run test:ui` | Abre o UI Mode para acompanhar passo a passo |
| `npm run test:headed` | Roda com o navegador visível |
| `npm run report` | Abre o relatório HTML da última execução |

A suíte completa (42 execuções = 14 testes × 3 navegadores) leva cerca de 1,5 min localmente.

## Cenários

### Obrigatórios (desafio)

| ID | Cenário | Validação |
|---|---|---|
| CT01 | Cadastro com sucesso | API `POST /v1/user` retorna 201 com o e-mail informado e o usuário é redirecionado para `/login` |
| CT02 | E-mail inválido (5 formatos) | Mensagem "This is not a valid email." e botão "Entrar" desabilitado |
| CT03 | Senha e confirmação diferentes | Mensagem "Passwords must match" e botão desabilitado |
| CT04 | Sem aceitar os termos de uso | Após tentar enviar, nenhuma requisição de cadastro é feita e a página continua em `/registrar` |

### Adicionais

| ID | Cenário | Por que foi incluído |
|---|---|---|
| CT05 | E-mail já cadastrado | Regra de negócio real do formulário. O usuário é criado via API antes do teste, sem depender da UI |
| CT06 | Regras de senha (5 casos) | O site exige mínimo de 9 caracteres, maiúscula, minúscula, número e caractere especial. Cada regra é validada pela sua mensagem |

## Estrutura

```
fixtures/index.js      # fixtures customizadas (página de cadastro aberta, usuário pré-cadastrado)
pages/RegisterPage.js  # Page Object: locators e ações da página
tests/register.spec.js # cenários de teste e assertions
utils/api.js           # criação de usuário via API e identificação da requisição de cadastro
utils/testData.js      # geração de usuário válido e massa de dados dos testes parametrizados
```

## Decisões técnicas

- **Page Object + fixtures:** o Page Object concentra locators e ações; as assertions ficam nos specs. A página já chega aberta ao teste por uma fixture, sem `beforeEach`.
- **Dados únicos por execução:** cada teste gera um e-mail novo (`qa.automacao+<timestamp>@mailinator.com`), então os testes podem rodar em paralelo e repetidas vezes.
- **Validação em camadas:** no cenário de sucesso, além do redirecionamento, a resposta da API é verificada, o que evita falso positivo caso a UI redirecione sem cadastrar.
- **Pré-condição via API:** o CT05 cria o usuário direto na API, deixando o teste mais rápido e independente do CT01.
- **Banner de cookies:** tratado com `page.addLocatorHandler`, que fecha o banner sempre que ele aparece, sem esperas fixas.
- **Testes parametrizados:** CT02 e CT06 usam massa de dados em `utils/testData.js`, então um novo caso é só uma linha.
- **CI:** o workflow em `.github/workflows/playwright.yml` roda a suíte a cada push/PR e publica o relatório HTML como artefato.

## Observações encontradas durante a automação

- Os `<label>` do formulário não estão associados aos campos (o `for` não corresponde ao `id` do input). Isso afeta a acessibilidade (leitores de tela) e impede o uso de `getByLabel`.
- "Área de atuação" e o aceite dos termos são botões estilizados, não checkboxes nativos, e não expõem estado (`aria-checked`) para tecnologias assistivas.
- As mensagens de validação aparecem em inglês ("This is not a valid email.", "Passwords must match", regras de senha) mesmo na versão em português, com exceção de "Este email já está em uso.".

> **Atenção:** os testes rodam contra o ambiente de produção. Cada execução completa cria 6 contas reais (CT01 e CT05 em cada navegador), usando e-mails descartáveis do Mailinator.
