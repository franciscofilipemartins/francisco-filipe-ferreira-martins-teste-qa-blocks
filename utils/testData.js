// @ts-check

/**
 * Gera um usuário válido com e-mail único a cada chamada, evitando colisão
 * com cadastros anteriores no ambiente real.
 * @param {Partial<{nome: string, sobrenome: string, email: string, senha: string, confirmarSenha: string}>} overrides
 */
export function buildValidUser(overrides = {}) {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const senha = 'Teste@12345';
  return {
    nome: 'QA',
    sobrenome: 'Automacao',
    email: `qa.automacao+${unique}@mailinator.com`,
    senha,
    confirmarSenha: senha,
    ...overrides,
  };
}

export const EMAILS_INVALIDOS = [
  'email-invalido',
  'teste@',
  '@dominio.com',
  'teste@dominio',
  'teste dominio.com',
];

/** Regras de senha do site: mínimo de 9 caracteres, maiúscula, minúscula, número e caractere especial. */
export const SENHAS_INVALIDAS = [
  { regra: 'com menos de 9 caracteres', senha: 'Abcde1!', mensagem: 'Password must be at least 9 characters long' },
  { regra: 'sem letra maiúscula', senha: 'abcdefg1!', mensagem: 'Password must contain at least one uppercase letter' },
  { regra: 'sem letra minúscula', senha: 'ABCDEFG1!', mensagem: 'Password must contain at least one lowercase letter' },
  { regra: 'sem número', senha: 'Abcdefgh!', mensagem: 'Password must contain at least one number' },
  { regra: 'sem caractere especial', senha: 'Abcdefg1', mensagem: 'Password must contain at least one special character' },
];

export const MENSAGENS = {
  emailInvalido: 'This is not a valid email.',
  emailEmUso: 'Este email já está em uso.',
  senhasDiferentes: 'Passwords must match',
};
