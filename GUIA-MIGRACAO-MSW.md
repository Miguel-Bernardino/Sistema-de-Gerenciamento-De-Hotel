# 🔄 Guia de Migração: MSW → Backend Real

**Data**: 04/12/2025  
**Status**: Preparado para implementação

---

## 📌 Visão Geral

Este guia descreve como remover MSW e conectar o frontend ao backend real com **mudanças mínimas** de código.

---

## 🎯 Objetivo

Manter a mesma estrutura de endpoints e tipos, apenas apontando para um servidor real ao invés de MSW.

---

## 📋 Pré-requisitos

1. Backend rodando em `http://localhost:3000` (ou outra porta)
2. Endpoints implementados conforme `MAPEAMENTO-ENDPOINTS.md`
3. CORS configurado no backend
4. Autenticação JWT implementada

---

## 🔧 Passos para Migração

### Passo 1: Desabilitar MSW

**Arquivo**: `app/entry.client.tsx`

**Antes:**
```typescript
import { worker } from '~/mocks/browser';

if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
  }).then(() => {
    console.log('[MSW] Service Worker iniciado');
    hydrateRoot(document.getElementById('root')!, <App />);
  });
} else {
  hydrateRoot(document.getElementById('root')!, <App />);
}
```

**Depois:**
```typescript
// MSW desabilitado em produção
hydrateRoot(document.getElementById('root')!, <App />);
```

### Passo 2: Criar Variável de Ambiente

**Arquivo**: `.env.local`

```env
VITE_API_URL=http://localhost:3000
```

**Para Produção**: `.env.production`
```env
VITE_API_URL=https://api.hotel.com
```

### Passo 3: Criar Utility para Base URL

**Arquivo**: `app/utils/api.ts` (novo)

```typescript
export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

export const buildUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  return `${baseUrl}${endpoint}`;
};
```

### Passo 4: Atualizar RoomsContext

**Arquivo**: `app/contexts/RoomsContext.tsx`

**Antes:**
```typescript
const response = await fetch('/rooms');
```

**Depois:**
```typescript
import { buildUrl } from '~/utils/api';

// ...

const response = await fetch(buildUrl('/rooms'));
```

### Passo 5: Atualizar Login

**Arquivo**: `app/routes/login.tsx`

**Antes:**
```typescript
const response = await fetch('/auth/login', {
```

**Depois:**
```typescript
import { buildUrl } from '~/utils/api';

// ...

const response = await fetch(buildUrl('/auth/login'), {
```

### Passo 6: Atualizar CreateRoomModal

**Arquivo**: `app/component/Topbar/CreateRoomModal/CreateRoomModal.tsx`

**Antes:**
```typescript
const response = await fetch('/rooms', {
```

**Depois:**
```typescript
import { buildUrl } from '~/utils/api';

// ...

const response = await fetch(buildUrl('/rooms'), {
```

### Passo 7: Atualizar room.tsx

**Arquivo**: `app/component/room/room.tsx`

**Antes:**
```typescript
const response = await fetch('/occupations', {
const occupationResponse = await fetch(`/occupations/room/${id}`);
const response = await fetch(`/occupations/${occupationId}/checkout`, {
```

**Depois:**
```typescript
import { buildUrl } from '~/utils/api';

// ...

const response = await fetch(buildUrl('/occupations'), {
const occupationResponse = await fetch(buildUrl(`/occupations/room/${id}`));
const response = await fetch(buildUrl(`/occupations/${occupationId}/checkout`), {
```

---

## 🔐 Configurar Autenticação JWT

### Passo 1: Armazenar Token

**Arquivo**: `app/utils/auth.ts` (novo)

```typescript
const TOKEN_KEY = 'authToken';

export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
```

### Passo 2: Adicionar Token em Requisições

**Arquivo**: `app/utils/api.ts` (atualizado)

```typescript
export const apiHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  return fetch(buildUrl(endpoint), {
    ...options,
    headers: {
      ...apiHeaders(),
      ...options.headers,
    },
  });
};
```

### Passo 3: Usar apiCall em Componentes

**Exemplo**:
```typescript
import { apiCall } from '~/utils/api';

// Antes
const response = await fetch(buildUrl('/occupations'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// Depois
const response = await apiCall('/occupations', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

---

## 🛡️ Tratamento de Erros

**Arquivo**: `app/utils/api.ts` (adicionar)

```typescript
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
    const data = await response.json();
    throw new ApiError(
      response.status,
      data.message || 'Erro na requisição',
      data
    );
  }
  return response;
};
```

**Usar em componentes**:
```typescript
try {
  const response = await apiCall('/rooms');
  await handleApiError(response);
  const data = await response.json();
} catch (error: unknown) {
  if (error instanceof ApiError) {
    console.error(`Erro ${error.status}: ${error.message}`);
  } else {
    console.error('Erro desconhecido:', error);
  }
}
```

---

## 📋 Checklist de Migração

### Preparação
- [ ] Backend implementado com todos os 21 endpoints
- [ ] CORS configurado no backend
- [ ] JWT implementado
- [ ] Variáveis de ambiente definidas

### Código
- [ ] MSW desabilitado em `entry.client.tsx`
- [ ] `.env.local` criado com `VITE_API_URL`
- [ ] `app/utils/api.ts` criado
- [ ] `app/utils/auth.ts` criado
- [ ] RoomsContext atualizado
- [ ] login.tsx atualizado
- [ ] CreateRoomModal atualizado
- [ ] room.tsx atualizado
- [ ] Todos os `fetch()` usam `buildUrl()` ou `apiCall()`

### Testes
- [ ] Login funciona
- [ ] Listar quartos funciona
- [ ] Criar quarto funciona
- [ ] Check-in funciona
- [ ] Check-out funciona
- [ ] Listar produtos funciona
- [ ] Criar produto funciona
- [ ] Deletar endpoints funcionam
- [ ] Errors são tratados corretamente
- [ ] Token persiste após reload

### Deploy
- [ ] Build de produção
- [ ] Variáveis de ambiente atualizadas
- [ ] CORS verificado
- [ ] SSL/HTTPS ativo
- [ ] Logs verificados

---

## 🚀 Alternativa: Proxy em Desenvolvimento

Se preferir manter MSW enquanto testa o backend real:

**Arquivo**: `vite.config.ts`

```typescript
export default defineConfig({
  // ... outras configurações
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

**Usar**:
```typescript
const response = await fetch('/api/rooms'); // Proxiado para localhost:3000/rooms
```

---

## 🔗 Estrutura de Pastas - Após Migração

```
app/
├── utils/
│   ├── api.ts          (novo - Base URL + Headers)
│   ├── auth.ts         (novo - Token management)
│   └── errors.ts       (novo - Error handling)
├── contexts/
│   └── RoomsContext.tsx (atualizado)
├── routes/
│   └── login.tsx        (atualizado)
├── component/
│   ├── Topbar/
│   │   └── CreateRoomModal/
│   │       └── CreateRoomModal.tsx (atualizado)
│   └── room/
│       └── room.tsx     (atualizado)
└── mocks/              (pode ser removido em produção)
    ├── handlers.ts
    └── browser.ts
```

---

## 📊 Comparativa: MSW vs Backend Real

| Aspecto | MSW | Backend Real |
|---------|-----|--------------|
| **Dados** | Memória | Banco de Dados |
| **Persistência** | Não | Sim |
| **Autenticação** | Simulada | JWT Real |
| **Validações** | Básicas | Completas |
| **Velocidade** | Rápido | Rede (mais lento) |
| **Deploy** | Não precisa | Necessário |
| **Logs** | Limitados | Detalhados |
| **CORS** | Automático | Configurável |
| **Segurança** | Nenhuma | SSL/HTTPS |

---

## ⚠️ Armadilhas Comuns

### 1. CORS
```
❌ Erro: "No 'Access-Control-Allow-Origin' header"

✅ Solução: Configurar CORS no backend
```

### 2. Token Expirado
```typescript
❌ Erro: 401 Unauthorized

✅ Solução: Implementar refresh token ou re-login
```

### 3. Porta Errada
```env
❌ VITE_API_URL=http://localhost:5173
✅ VITE_API_URL=http://localhost:3000
```

### 4. Headers Faltando
```typescript
❌ Headers não incluem Authorization

✅ Use apiCall() ou apiHeaders() em toda requisição
```

---

## 🧪 Teste de Integração

**Arquivo**: `test-integration.sh`

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "🧪 Testando integração..."

# Test 1: Login
echo "1. Testando login..."
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","password":"admin123"}'

# Test 2: Get Rooms
echo "2. Testando GET /rooms..."
curl -X GET $API_URL/rooms

# Test 3: Get Rooms
echo "3. Testando GET /products..."
curl -X GET $API_URL/products

echo "✅ Testes completos!"
```

---

## 📞 Suporte Pós-Migração

| Problema | Solução |
|----------|---------|
| Token não persiste | Verificar localStorage |
| CORS error | Verificar headers no backend |
| 404 Not Found | Verificar URL e endpoint |
| 500 Server Error | Verificar logs do backend |
| Lentidão | Verificar latência de rede |

---

## 🎓 Recursos Úteis

- [Documentação JWT](https://jwt.io/introduction)
- [CORS no Express](https://expressjs.com/en/resources/middleware/cors.html)
- [Vite Proxy](https://vitejs.dev/config/server-options.html#server-proxy)
- [React Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

## ✅ Quando a Migração Está Completa

- ✅ MSW foi removido (ou desabilitado)
- ✅ Todos os endpoints apontam para backend real
- ✅ Autenticação JWT funcionando
- ✅ Dados persistem no banco
- ✅ Testes passando
- ✅ Sem erros no console
- ✅ Deploy em produção

---

Documento criado: 04/12/2025
Versão: 1.0
