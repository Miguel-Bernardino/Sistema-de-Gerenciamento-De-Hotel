/**
 * Utilitário para gerenciar autenticação e token JWT
 */

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export interface AuthUser {
  id?: string | number;
  email: string;
  name?: string;
  role?: string;
}

/**
 * Salvar token JWT no localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  console.log('✅ Token armazenado com sucesso');
};

/**
 * Recuperar token JWT do localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remover token do localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  console.log('✅ Token removido');
};

/**
 * Verificar se usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Salvar dados do usuário
 */
export const saveUser = (user: AuthUser): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Recuperar dados do usuário
 */
export const getUser = (): AuthUser | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Logout: remover token e dados do usuário
 */
export const logout = (): void => {
  removeToken();
  console.log('👋 Usuário desconectado');
};
