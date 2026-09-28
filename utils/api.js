// @ts-check
import { expect } from '@playwright/test';

export const API_URL = process.env.API_URL ?? 'https://api.blocksrvt.com';

/** @param {import('@playwright/test').Request} request */
export function isRequisicaoDeCadastro(request) {
  return request.method() === 'POST' && request.url() === `${API_URL}/v1/user`;
}

/**
 * Cria um usuário direto pela API, com o mesmo payload que o formulário envia.
 * Usado para montar pré-condições sem depender da UI.
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{nome: string, sobrenome: string, email: string, senha: string}} user
 */
export async function criarUsuarioViaApi(request, user) {
  const response = await request.post(`${API_URL}/v1/user`, {
    data: {
      firstName: user.nome,
      lastName: user.sobrenome,
      email: user.email,
      country: 'BR',
      locale: 'en-us',
      origin: 'Google',
      workFields: ['Architect'],
      password: user.senha,
    },
  });
  expect(response.status(), await response.text()).toBe(201);
}
