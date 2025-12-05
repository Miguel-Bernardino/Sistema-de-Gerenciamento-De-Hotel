# 🧪 Guia de Testes - Endpoints API

## 📋 Pré-requisitos

1. **Servidor rodando**: `npm run dev` na porta 5174 ou 5173
2. **Postman instalado** (opcional, mas recomendado)
3. **Navegador aberto** em `http://localhost:5174`

---

## 🔐 Teste 1: Login

### Via Frontend
1. Acesse `http://localhost:5174/`
2. Insira as credenciais:
   - Email: `admin@hotel.com`
   - Senha: `admin123`
3. Clique em "Entrar"
4. Você deve ser redirecionado para `/home`

### Via Postman
```
POST http://localhost:5174/auth/login
Content-Type: application/json

{
  "email": "admin@hotel.com",
  "password": "admin123"
}
```

**Resposta Esperada (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Admin",
    "email": "admin@hotel.com",
    "role": "admin"
  },
  "token": "mock-jwt-token-..."
}
```

---

## 🏨 Teste 2: Listar Quartos

### Via Frontend
1. Após login, clique em "Home"
2. Você verá uma lista de quartos com:
   - Número (101, 102, 103...)
   - Status (cor verde, azul, laranja...)
   - Tipo (STANDARD, DELUXE, SUITE)
   - Botões de ação

### Via Postman
```
GET http://localhost:5174/rooms
```

**Resposta Esperada (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "number": "101",
      "status": "AVAILABLE",
      "roomType": "STANDARD",
      "floor": 1,
      "capacity": 2,
      "dailyRate": 100,
      "nightRate": 150
    },
    {
      "id": 2,
      "number": "102",
      "status": "OCCUPIED",
      "roomType": "DELUXE",
      "floor": 1,
      "capacity": 2,
      "dailyRate": 150,
      "nightRate": 200
    },
    {
      "id": 3,
      "number": "103",
      "status": "CLEANING",
      "roomType": "SUITE",
      "floor": 2,
      "capacity": 3,
      "dailyRate": 200,
      "nightRate": 280
    }
  ]
}
```

---

## ➕ Teste 3: Criar Novo Quarto

### Via Frontend
1. Na Home, clique no ícone **"+"** na Topbar (canto superior direito)
2. Preencha o formulário:
   - **Número**: 104
   - **Tipo**: Deluxe
   - **Andar**: 1
   - **Capacidade**: 2
   - **Tarifa 12h**: 120.00
   - **Tarifa Pernoite**: 180.00
3. Clique em "Criar Quarto"
4. O novo quarto deve aparecer na lista

### Via Postman
```
POST http://localhost:5174/rooms
Content-Type: application/json
Authorization: Bearer your-token

{
  "number": "104",
  "roomType": "DELUXE",
  "floor": 1,
  "capacity": 2,
  "dailyRate": 120.00,
  "nightRate": 180.00,
  "status": "AVAILABLE"
}
```

**Resposta Esperada (201):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "number": "104",
    "status": "AVAILABLE",
    "roomType": "DELUXE",
    "floor": 1,
    "capacity": 2,
    "dailyRate": 120.00,
    "nightRate": 180.00
  }
}
```

---

## ✅ Teste 4: Check-in (Criar Ocupação)

### Via Frontend
1. Em um quarto com status **AVAILABLE** (verde), clique em **"Check-in"**
2. Preencha o modal:
   - **Nome do Responsável**: João Silva
   - **CPF**: 123.456.789-00
   - **Telefone**: (11) 98765-4321
   - **Data Nascimento**: 1990-05-15
   - **Placa**: ABC-1234
   - **Data Entrada**: 2025-12-04
   - **Data Saída**: 2025-12-07
   - **Acompanhantes**: (opcional)
3. Clique em "Confirmar"
4. O quarto deve virar **AZUL** (status OCCUPIED)

### Via Postman
```
POST http://localhost:5174/occupations
Content-Type: application/json
Authorization: Bearer your-token

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
  "companions": []
}
```

**Resposta Esperada (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
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
    "companions": [],
    "consumptions": [],
    "createdAt": "2025-12-04T10:00:00.000Z"
  }
}
```

---

## 🛒 Teste 5: Adicionar Consumo na Ocupação

### Via Postman
```
POST http://localhost:5174/occupations/1/consumptions
Content-Type: application/json
Authorization: Bearer your-token

{
  "productId": 2,
  "quantity": 2,
  "unitPrice": 5.00
}
```

**Resposta Esperada (201):**
```json
{
  "success": true,
  "data": {
    "id": 1702736400000,
    "productId": 2,
    "quantity": 2,
    "unitPrice": 5.00,
    "totalPrice": 10.00,
    "addedAt": "2025-12-04T10:00:00.000Z"
  }
}
```

---

## 🚪 Teste 6: Check-out (Finalizar Ocupação)

### Via Frontend
1. Em um quarto com status **OCCUPIED** (azul), clique em **"Check-out"**
2. Confirme a ação
3. Uma tela de resumo deve mostrar:
   - **Dias**: 3
   - **Tarifa**: 450.00
   - **Consumos**: 10.00
   - **Taxa de Serviço**: 46.00 (10%)
   - **Total**: 506.00
4. O quarto deve virar **LARANJA** (status CLEANING)

### Via Postman (2 passos)

**Passo 1: Obter ID da Ocupação**
```
GET http://localhost:5174/occupations/room/1
Authorization: Bearer your-token
```

**Passo 2: Fazer Checkout**
```
POST http://localhost:5174/occupations/1/checkout
Content-Type: application/json
Authorization: Bearer your-token

{
  "serviceChargePercentage": 10
}
```

**Resposta Esperada (200):**
```json
{
  "success": true,
  "data": {
    "occupationId": 1,
    "roomId": 1,
    "responsibleName": "João Silva",
    "checkInDate": "2025-12-04",
    "checkOutDate": "2025-12-04",
    "days": 1,
    "accommodationCost": 150.00,
    "consumptionTotal": 10.00,
    "serviceCharge": 16.00,
    "total": 176.00
  }
}
```

---

## 📦 Teste 7: Listar Produtos

### Via Frontend
1. Clique em **"Produtos"** no sidebar
2. Você verá uma lista de produtos disponíveis

### Via Postman
```
GET http://localhost:5174/products
Authorization: Bearer your-token
```

**Resposta Esperada (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cerveja",
      "description": "Cerveja Premium",
      "price": 12.00,
      "category": "Bebidas"
    },
    {
      "id": 2,
      "name": "Refrigerante",
      "description": "Pepsi 350ml",
      "price": 5.00,
      "category": "Bebidas"
    },
    {
      "id": 3,
      "name": "Café",
      "description": "Café coado",
      "price": 3.00,
      "category": "Bebidas"
    }
  ]
}
```

---

## ➕ Teste 8: Criar Produto

### Via Postman
```
POST http://localhost:5174/products
Content-Type: application/json
Authorization: Bearer your-token

{
  "name": "Água Mineral",
  "description": "Água mineral 500ml",
  "price": 2.00,
  "category": "Bebidas"
}
```

**Resposta Esperada (201):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Água Mineral",
    "description": "Água mineral 500ml",
    "price": 2.00,
    "category": "Bebidas"
  }
}
```

---

## 🔄 Teste 9: Atualizar Status de Quarto

### Via Postman
```
PATCH http://localhost:5174/rooms/1/status
Content-Type: application/json
Authorization: Bearer your-token

{
  "status": "AVAILABLE"
}
```

**Resposta Esperada (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "number": "101",
    "status": "AVAILABLE",
    "roomType": "STANDARD",
    "floor": 1,
    "capacity": 2,
    "dailyRate": 100,
    "nightRate": 150
  }
}
```

---

## 🗑️ Teste 10: Deletar Quarto

### Via Postman
```
DELETE http://localhost:5174/rooms/4
Authorization: Bearer your-token
```

**Resposta Esperada (200):**
```json
{
  "success": true,
  "message": "Quarto deletado"
}
```

---

## 📊 Checklist de Testes

- [ ] Login realizado com sucesso
- [ ] Quartos listados corretamente
- [ ] Novo quarto criado
- [ ] Check-in realizado (quarto muda para OCCUPIED)
- [ ] Consumo adicionado na ocupação
- [ ] Check-out realizado (quarto muda para CLEANING)
- [ ] Produtos listados
- [ ] Novo produto criado
- [ ] Status de quarto atualizado
- [ ] Quarto deletado
- [ ] Ocupação deletada
- [ ] Produto deletado

---

## 🐛 Troubleshooting

### Erro: "Port 5173 is in use"
- **Solução**: O servidor rodará na porta 5174 automaticamente
- Acesse `http://localhost:5174`

### Erro: "No route matches URL"
- **Solução**: MSW pode estar sendo inicializado
- Aguarde 2-3 segundos e recarregue a página
- Verifique se o endpoint é chamado corretamente

### Erro: "Token não fornecido"
- **Solução**: Faça login primeiro
- O token é salvo em `localStorage`

### Modal não abre
- **Solução**: Verifique se o JavaScript está habilitado
- Tente recarregar a página

---

## 📝 Notas Importantes

1. **MSW está ativo** em desenvolvimento
   - Todos os dados são simulados em memória
   - Serão perdidos ao recarregar a página

2. **Autenticação é básica** (MSW)
   - Token é gerado dinamicamente
   - Não há validação real de JWT

3. **IDs são gerados automaticamente**
   - Rooms: numéricos (1, 2, 3...)
   - Occupations: incrementais (1, 2, 3...)
   - Products: numéricos (1, 2, 3...)

4. **Dados iniciais** são mockados em:
   - 3 quartos (101, 102, 103)
   - 3 produtos (Cerveja, Refrigerante, Café)

5. **Próxima etapa**:
   - Substituir MSW pelo backend real
   - Todas as URLs permanecerão iguais

---

Documento criado: 04/12/2025
