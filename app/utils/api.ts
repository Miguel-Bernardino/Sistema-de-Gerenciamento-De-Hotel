/**
 * Utilitário para gerenciar requisições API
 * Centraliza URL base, headers e tratamento de erros
 * 
 * ⚙️ Configuração via .env ou .env.local:
 * VITE_API_URL=https://seu-backend.com/api
 * 
 * Fallback: http://localhost:3000 (se VITE_API_URL não estiver definido)
 */

import { getToken } from './auth';

export const getApiUrl = (): string => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // Log inicial (apenas uma vez)
  if (typeof window !== 'undefined') {
    const alreadyLogged = (window as any).__apiUrlLogged;
    if (!alreadyLogged) {
      console.log(`🔗 API Base URL: ${url}`);
      console.log(`   De: ${import.meta.env.VITE_API_URL ? '.env' : 'fallback padrão'}`);
      (window as any).__apiUrlLogged = true;
    }
  }
  
  return url;
};

export const buildUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  return `${baseUrl}${endpoint}`;
};

export const apiHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = buildUrl(endpoint);
  const method = options.method || 'GET';
  console.log(`📡 [API] ${method.toUpperCase()} → ${url}`);
  
  return fetch(url, {
    ...options,
    headers: {
      ...apiHeaders(),
      ...options.headers,
    },
  });
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
  }
}

export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    throw new ApiError(
      response.status,
      data.message || 'Erro na requisição',
      data
    );
  }
  return response;
};
