// @ts-check
import { test, expect } from '../fixtures/index.js';
import { isRequisicaoDeCadastro } from '../utils/api.js';
import { buildValidUser, EMAILS_INVALIDOS, MENSAGENS, SENHAS_INVALIDAS } from '../utils/testData.js';

test.describe('Cadastro de usuários - cenários obrigatórios', () => {
  test('CT01 - Deve realizar o cadastro com sucesso', { tag: '@smoke' }, async ({ page, registerPage }) => {
    const user = buildValidUser();

    await registerPage.preencherFormulario(user);
    await registerPage.aceitarTermos();
    await expect(registerPage.botaoEnviar).toBeEnabled();

    const respostaCadastro = page.waitForResponse((res) => isRequisicaoDeCadastro(res.request()));
    await registerPage.enviar();

    const resposta = await respostaCadastro;
    expect(resposta.status()).toBe(201);
    expect(await resposta.json()).toMatchObject({ email: user.email });
    await expect(page).toHaveURL(/\/pt\/login/);
  });

  for (const email of EMAILS_INVALIDOS) {
    test(`CT02 - Não deve permitir cadastro com e-mail inválido: "${email}"`, { tag: '@negative' }, async ({ registerPage }) => {
      await registerPage.preencherFormulario(buildValidUser({ email }));
      await registerPage.aceitarTermos();

      await expect(registerPage.mensagemDeErro(MENSAGENS.emailInvalido)).toBeVisible();
      await expect(registerPage.botaoEnviar).toBeDisabled();
    });
  }

  test('CT03 - Não deve permitir cadastro quando senha e confirmação são diferentes', { tag: '@negative' }, async ({ registerPage }) => {
    await registerPage.preencherFormulario(buildValidUser({ confirmarSenha: 'SenhaDiferente@999' }));
    await registerPage.aceitarTermos();

    await expect(registerPage.mensagemDeErro(MENSAGENS.senhasDiferentes)).toBeVisible();
    await expect(registerPage.botaoEnviar).toBeDisabled();
  });

  test('CT04 - Não deve permitir cadastro sem aceitar os termos de uso', { tag: '@negative' }, async ({ page, registerPage }) => {
    /** @type {import('@playwright/test').Request[]} */
    const requisicoesDeCadastro = [];
    page.on('request', (req) => {
      if (isRequisicaoDeCadastro(req)) requisicoesDeCadastro.push(req);
    });

    await registerPage.preencherFormulario(buildValidUser());
    await expect(registerPage.botaoEnviar).toBeDisabled();

    await registerPage.tentarEnviar();

    await expect(page).toHaveURL(/\/pt\/registrar/);
    expect(requisicoesDeCadastro).toHaveLength(0);
  });
});

test.describe('Cadastro de usuários - cenários adicionais', () => {
  test('CT05 - Não deve permitir cadastro com e-mail já cadastrado', { tag: '@negative' }, async ({ registerPage, usuarioExistente }) => {
    await registerPage.preencherFormulario(buildValidUser({ email: usuarioExistente.email }));
    await registerPage.aceitarTermos();

    await expect(registerPage.mensagemDeErro(MENSAGENS.emailEmUso)).toBeVisible();
    await expect(registerPage.botaoEnviar).toBeDisabled();
  });

  for (const { regra, senha, mensagem } of SENHAS_INVALIDAS) {
    test(`CT06 - Não deve aceitar senha ${regra}`, { tag: '@negative' }, async ({ registerPage }) => {
      await registerPage.preencherFormulario(buildValidUser({ senha, confirmarSenha: senha }));
      await registerPage.aceitarTermos();

      await expect(registerPage.mensagemDeErro(mensagem)).toBeVisible();
      await expect(registerPage.botaoEnviar).toBeDisabled();
    });
  }
});
