// @ts-check
import { expect } from '@playwright/test';

/**
 * Page Object da página de cadastro (/pt/registrar).
 *
 * Particularidades do site que guiam a escolha dos locators:
 * - País, Idioma da Família e "Como você ficou sabendo" são dropdowns
 *   customizados, não <select> nativos.
 * - "Área de atuação" e o aceite dos termos são <button> ao lado de um texto,
 *   não <input type="checkbox">; por isso o clique é no botão do mesmo container.
 * - O `for` dos <label> não bate com o `id` dos campos, então `getByLabel` não
 *   funciona. Os campos de senha compartilham o placeholder "••••••••" e são
 *   localizados pelo `name`.
 * - O botão "Entrar" fica `disabled` até o formulário inteiro ser válido.
 */
export class RegisterPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.nome = page.getByPlaceholder('Nome', { exact: true });
    this.sobrenome = page.getByPlaceholder('Sobrenome', { exact: true });
    this.email = page.getByPlaceholder('Email', { exact: true });
    this.pais = page.getByPlaceholder('Escolha o país');
    this.senha = page.locator('input[name="password"]');
    this.confirmarSenha = page.locator('input[name="confirmPassword"]');
    this.checkboxTermos = page.getByText('Eu aceito a').locator('..').getByRole('button');
    this.botaoEnviar = page.getByRole('button', { name: 'Entrar' });
    this.botaoRejeitarCookies = page.getByRole('button', { name: 'Rejeitar não necessários' });
  }

  async goto() {
    // O banner de cookies pode surgir a qualquer momento e cobrir o formulário.
    await this.page.addLocatorHandler(this.botaoRejeitarCookies, () => this.botaoRejeitarCookies.click());
    await this.page.goto('/pt/registrar');
    await expect(this.nome).toBeVisible();
  }

  /** Nomes de país exibidos em inglês (ex.: "Brazil"). */
  async selecionarPais(pais = 'Brazil') {
    await this.pais.click();
    await this.pais.fill(pais);
    await this.page.getByRole('button', { name: pais, exact: true }).click();
  }

  async selecionarIdiomaDaFamilia(idioma = 'Families in English') {
    await this.page.locator('button').filter({ hasText: 'Idioma da Família' }).click();
    await this.page.getByRole('button', { name: idioma }).click();
  }

  async selecionarAreaDeAtuacao(area = 'Arquiteto') {
    await this.page.getByText(area, { exact: true }).locator('..').getByRole('button').click();
  }

  async selecionarComoSoube(opcao = 'Google') {
    await this.page
      .locator('button')
      .filter({ hasText: 'Como você ficou sabendo sobre a Blocks?' })
      .click();
    await this.page.getByRole('button', { name: opcao, exact: true }).click();
  }

  /**
   * Preenche todos os campos do formulário (exceto o aceite dos termos).
   * @param {{nome: string, sobrenome: string, email: string, senha: string, confirmarSenha: string}} user
   */
  async preencherFormulario(user) {
    await this.nome.fill(user.nome);
    await this.sobrenome.fill(user.sobrenome);
    await this.email.fill(user.email);
    await this.selecionarPais();
    await this.selecionarIdiomaDaFamilia();
    await this.selecionarAreaDeAtuacao();
    await this.selecionarComoSoube();
    await this.senha.fill(user.senha);
    await this.confirmarSenha.fill(user.confirmarSenha);
  }

  async aceitarTermos() {
    await this.checkboxTermos.click();
  }

  async enviar() {
    await this.botaoEnviar.click();
  }

  /** Clica no "Entrar" mesmo desabilitado, simulando um usuário insistindo no envio. */
  async tentarEnviar() {
    await this.botaoEnviar.click({ force: true });
  }

  /** @param {string} mensagem */
  mensagemDeErro(mensagem) {
    return this.page.getByText(mensagem);
  }
}
