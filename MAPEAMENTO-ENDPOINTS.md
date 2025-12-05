# Mapeamento de Endpoints - Postman vs Implementado

## 📊 Comparativa Completa

### ✅ AUTH ENDPOINTS

#### 1. POST /auth/register
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `POST {{url}}/auth/register` | `/auth/register` ✅ |
| **Body** | email, name, password | ✅ Idêntico |
| **Response** | success, data, token | ✅ Idêntico |
| **Status** | 201 | ✅ Implementado |

#### 2. POST /auth/login
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `POST {{url}}/auth/login` | `/auth/login` ✅ |
| **Body** | email, password | ✅ Idêntico |
| **Response** | success, data, token | ✅ Idêntico |
| **Credenciais Demo** | admin@hotel.com / admin123 | ✅ Implementado |

#### 3. GET /auth/profile
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `GET {{url}}/auth/profile` | `/auth/profile` ✅ |
| **Auth** | Bearer Token | ✅ Verificado |
| **Response** | success, data | ✅ Idêntico |

---

### ✅ ROOM ENDPOINTS

#### 1. POST /rooms (Criar Quarto)
| Campo | Postman | Implementado | Observação |
|-------|---------|--------------|-----------|
| **URL** | `POST /rooms` | `/rooms` ✅ | |
| **Auth** | Bearer Token | ✅ | |
| number | Sim | ✅ | |
| floor | Sim | ✅ | |
| capacity | Sim | ✅ | |
| roomType | Sim | ✅ | Postman usa "roomType" |
| dailyRate | Sim | ✅ | |
| nightRate | Sim | ✅ | Postman usa "nightRate" |
| status | Opcional | ✅ | Default: AVAILABLE |
| **Response Status** | 201 | ✅ | Implementado |

**Body Exemplo (Idêntico):**
```json
{
  "number": "101",
  "floor": 1,
  "capacity": 2,
  "roomType": "STANDARD",
  "dailyRate": 150.00,
  "nightRate": 200.00,
  "status": "AVAILABLE"
}
```

#### 2. GET /rooms (Listar Quartos)
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `GET /rooms` | `/rooms` ✅ |
| **Response** | success, data | ✅ |

#### 3. GET /rooms/:id
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `GET /rooms/:id` | `/rooms/:id` ✅ |
| **Auth** | (não especificado) | ✅ Funciona |
| **Response** | success, data | ✅ |

#### 4. PUT /rooms/:id (Atualizar Quarto)
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `PUT /rooms/:id` | `/rooms/:id` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Fields** | Todos opcionais | ✅ |
| **Response** | success, data | ✅ |

**Body Exemplo:**
```json
{
  "number": "101",
  "floor": 1,
  "capacity": 1,
  "roomType": "DELUXE",
  "dailyRate": 100,
  "nightRate": 200,
  "status": "OCCUPIED"
}
```

#### 5. PATCH /rooms/:id/status
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `PATCH /rooms/:id/status` | `/rooms/:id/status` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Body** | { "status": "..." } | ✅ |
| **Response** | success, data | ✅ |

#### 6. DELETE /rooms/:id
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `DELETE /rooms/:id` | `/rooms/:id` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Response** | success, message | ✅ |

---

### ✅ OCCUPATIONS ENDPOINTS

#### 1. POST /occupations (Criar Ocupação)
| Campo | Postman | Implementado | Status |
|-------|---------|--------------|--------|
| **URL** | `POST /occupations` | `/occupations` ✅ | |
| **Auth** | Bearer Token | ✅ | |
| roomId | Sim | ✅ | |
| responsibleName | Sim | ✅ | |
| responsibleCPF | Sim | ✅ | |
| responsiblePhone | Sim | ✅ | |
| responsibleBirthDate | Sim | ✅ | |
| carPlate | Sim | ✅ | |
| checkInDate | Sim | ✅ | |
| expectedCheckOut | Sim | ✅ | |
| roomRate | Sim | ✅ | |
| initialConsumption | Opcional | ✅ | |
| companions | Array | ✅ | |
| **Response Status** | 201 | ✅ | |

**Body Exemplo (Idêntico):**
```json
{
  "roomId": 1,
  "responsibleName": "João Silva",
  "responsibleCPF": "123.456.789-00",
  "responsiblePhone": "(11) 98765-4321",
  "responsibleBirthDate": "1990-05-15",
  "carPlate": "ABC-1234",
  "checkInDate": "2025-12-04",
  "expectedCheckOut": "2025-12-07",
  "roomRate": 150.00,
  "initialConsumption": 0,
  "companions": [
    {
      "name": "Maria Santos",
      "cpf": "987.654.321-00",
      "birthDate": "1992-08-20"
    }
  ]
}
```

#### 2. GET /occupations (Listar)
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `GET /occupations` | `/occupations` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Response** | success, data (array) | ✅ |

#### 3. GET /occupations/:id
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `GET /occupations/:id` | `/occupations/:id` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Response** | success, data | ✅ |

#### 4. GET /occupations/room/:roomId
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `GET /occupations/room/:roomId` | `/occupations/room/:roomId` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Retorna** | Ocupação ativa do quarto | ✅ |
| **Response** | success, data | ✅ |

#### 5. POST /occupations/:occupationId/consumptions
| Campo | Postman | Implementado | Status |
|-------|---------|--------------|--------|
| **URL** | `POST /occupations/:occupationId/consumptions` | ✅ | |
| **Auth** | Bearer Token | ✅ | |
| productId | Sim | ✅ | |
| quantity | Sim | ✅ | |
| unitPrice | Sim | ✅ | |
| **Response** | success, data | ✅ | |
| **Status Code** | 201 | ✅ | |

**Body Exemplo:**
```json
{
  "productId": 2,
  "quantity": 2,
  "unitPrice": 50.00
}
```

**Response Exemplo:**
```json
{
  "success": true,
  "data": {
    "id": 1702736400000,
    "productId": 2,
    "quantity": 2,
    "unitPrice": 50.00,
    "totalPrice": 100.00,
    "addedAt": "2025-12-04T10:00:00Z"
  }
}
```

#### 6. POST /occupations/:occupationId/checkout
| Campo | Postman | Implementado | Status |
|-------|---------|--------------|--------|
| **URL** | `POST /occupations/:occupationId/checkout` | ✅ | |
| **Auth** | Bearer Token | ✅ | |
| serviceChargePercentage | Sim | ✅ | Default: 10% |
| **Response** | success, data | ✅ | |

**Body Exemplo:**
```json
{
  "serviceChargePercentage": 10
}
```

**Response Exemplo:**
```json
{
  "success": true,
  "data": {
    "occupationId": 1,
    "roomId": 1,
    "responsibleName": "João Silva",
    "checkInDate": "2025-12-04",
    "checkOutDate": "2025-12-07",
    "days": 3,
    "accommodationCost": 450.00,
    "consumptionTotal": 100.00,
    "serviceCharge": 55.00,
    "total": 605.00
  }
}
```

#### 7. DELETE /occupations/:id
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `DELETE /occupations/:id` | `/occupations/:id` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Response** | success, message | ✅ |

---

### ✅ PRODUCTS ENDPOINTS

#### 1. POST /products
| Campo | Postman | Implementado | Status |
|-------|---------|--------------|--------|
| **URL** | `POST /products` | `/products` ✅ | |
| **Auth** | Bearer Token | ✅ | |
| name | Sim | ✅ | |
| description | Sim | ✅ | |
| price | Sim | ✅ | |
| category | Sim | ✅ | |
| **Response Status** | 201 | ✅ | |

**Body Exemplo:**
```json
{
  "name": "Refrigerante",
  "description": "Pepsi 350ml",
  "price": 5.00,
  "category": "Bebidas"
}
```

#### 2. GET /products
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `GET /products` | `/products` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Response** | success, data (array) | ✅ |

#### 3. GET /products/:id
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `GET /products/:id` | `/products/:id` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Response** | success, data | ✅ |

#### 4. PUT /products/:id
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `PUT /products/:id` | `/products/:id` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Fields** | name, price (opcional) | ✅ Todos opcionais |
| **Response** | success, data | ✅ |

**Body Exemplo:**
```json
{
  "name": "Nome Atualizado",
  "price": 10.00
}
```

#### 5. DELETE /products/:id
| Aspecto | Postman | Implementado |
|---------|---------|--------------|
| **URL** | `DELETE /products/:id` | `/products/:id` ✅ |
| **Auth** | Bearer Token | ✅ |
| **Response** | success, message | ✅ |

---

## 📊 Resumo Geral

| Categoria | Total | Implementados | Status |
|-----------|-------|---------------|--------|
| **Auth** | 3 | 3 | ✅ 100% |
| **Rooms** | 6 | 6 | ✅ 100% |
| **Occupations** | 7 | 7 | ✅ 100% |
| **Products** | 5 | 5 | ✅ 100% |
| **TOTAL** | **21** | **21** | ✅ **100%** |

---

## ⚠️ Observações

### Diferenças Intentionais

1. **MSW vs Backend Real**
   - Atualmente usando MSW para desenvolvimento
   - Será substituído pelo backend real quando disponível
   - URLs sem prefixo `/api` já estão preparadas

2. **Status de Ocupação**
   - Postman não especifica campo `status` na criação
   - Implementado com padrão (será definido pelo backend)

3. **Validações**
   - MSW implementa validações básicas
   - Backend real pode ter validações mais robustas

4. **Autenticação**
   - MSW acessa Bearer Token via header `Authorization`
   - Compatível com padrão OAuth 2.0

---

## 🔄 Próximos Passos

1. Substituir MSW pelo backend real apontando para o mesmo URL
2. Adicionar validações mais robustas
3. Implementar tratamento de erros aprimorado
4. Adicionar campos opcionais nos modais (CPF, telefone, etc)
5. Testes de integração com API real

---

Documento gerado: 04/12/2025
