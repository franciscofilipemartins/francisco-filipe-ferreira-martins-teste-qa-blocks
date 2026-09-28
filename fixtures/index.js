// @ts-check
import { test as base, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage.js';
import { criarUsuarioViaApi } from '../utils/api.js';
import { buildValidUser } from '../utils/testData.js';

/**
 * @type {import('@playwright/test').TestType<
 *   import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & {
 *     registerPage: RegisterPage,
 *     usuarioExistente: ReturnType<typeof buildValidUser>,
 *   },
 *   import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions
 * >}
 */
export const test = base.extend({
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await use(registerPage);
  },

  usuarioExistente: async ({ request }, use) => {
    const user = buildValidUser();
    await criarUsuarioViaApi(request, user);
    await use(user);
  },
});

export { expect };
