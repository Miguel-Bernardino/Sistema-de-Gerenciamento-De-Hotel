import { http, HttpResponse } from 'msw';

// In-memory data store
let rooms = [
  {
    id: 1,
    number: '101',
    status: 'AVAILABLE',
    roomType: 'STANDARD',
    floor: 1,
    capacity: 2,
    dailyRate: 100,
    nightRate: 150,
  },
  {
    id: 2,
    number: '102',
    status: 'OCCUPIED',
    roomType: 'DELUXE',
    floor: 1,
    capacity: 2,
    dailyRate: 150,
    nightRate: 200,
  },
  {
    id: 3,
    number: '103',
    status: 'CLEANING',
    roomType: 'SUITE',
    floor: 2,
    capacity: 3,
    dailyRate: 200,
    nightRate: 280,
  },
];

let occupations: any[] = [];
let products = [
  { id: 1, name: 'Cerveja', description: 'Cerveja Premium', price: 12.00, category: 'Bebidas' },
  { id: 2, name: 'Refrigerante', description: 'Pepsi 350ml', price: 5.00, category: 'Bebidas' },
  { id: 3, name: 'Café', description: 'Café coado', price: 3.00, category: 'Bebidas' },
];

let occupationIdCounter = 1;
let productIdCounter = 4;

export const handlers = [
  // ============== AUTH ==============
  
  // POST /auth/register
  http.post('/auth/register', async ({ request }) => {
    const body = await request.json() as { email: string; name: string; password: string };
    
    return HttpResponse.json({
      success: true,
      data: {
        id: String(Date.now()),
        email: body.email,
        name: body.name,
        role: 'admin',
      },
      token: 'mock-jwt-token-' + Date.now(),
    }, { status: 201 });
  }),

  // POST /auth/login
  http.post('/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'admin@hotel.com' && body.password === 'admin123') {
      return HttpResponse.json({
        success: true,
        data: {
          id: '1',
          name: 'Admin',
          email: body.email,
          role: 'admin',
        },
        token: 'mock-jwt-token-' + Date.now(),
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'Credenciais inválidas' },
      { status: 401 }
    );
  }),

  // GET /auth/profile
  http.get('/auth/profile', ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return HttpResponse.json(
        { success: false, message: 'Token não fornecido' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        name: 'Admin',
        email: 'admin@hotel.com',
        role: 'admin',
      },
    });
  }),

  // ============== ROOMS ==============

  // GET /rooms - Listar quartos
  http.get('/rooms', () => {
    return HttpResponse.json({
      success: true,
      data: rooms,
    });
  }),

  // POST /rooms - Criar novo quarto
  http.post('/rooms', async ({ request }) => {
    const body = await request.json() as {
      number: string;
      roomType: string;
      floor: number;
      capacity: number;
      dailyRate: number;
      nightRate: number;
      status?: string;
    };
    
    if (rooms.find(r => r.number === body.number)) {
      return HttpResponse.json(
        { success: false, message: 'Quarto com este número já existe' },
        { status: 400 }
      );
    }
    
    const newRoom = {
      id: rooms.length + 1,
      number: body.number,
      status: body.status || 'AVAILABLE',
      roomType: body.roomType,
      floor: body.floor,
      capacity: body.capacity,
      dailyRate: body.dailyRate,
      nightRate: body.nightRate,
    };
    
    rooms.push(newRoom);
    
    return HttpResponse.json({
      success: true,
      data: newRoom,
    }, { status: 201 });
  }),

  // GET /rooms/:id - Obter quarto por ID
  http.get('/rooms/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const room = rooms.find(r => r.id === id);
    
    if (!room) {
      return HttpResponse.json(
        { success: false, message: 'Quarto não encontrado' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: room,
    });
  }),

  // PUT /rooms/:id - Atualizar quarto
  http.put('/rooms/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const room = rooms.find(r => r.id === id);
    
    if (!room) {
      return HttpResponse.json(
        { success: false, message: 'Quarto não encontrado' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as Record<string, any>;
    Object.assign(room, body);
    
    return HttpResponse.json({
      success: true,
      data: room,
    });
  }),

  // PATCH /rooms/:id/status - Atualizar apenas status
  http.patch('/rooms/:id/status', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const room = rooms.find(r => r.id === id);
    
    if (!room) {
      return HttpResponse.json(
        { success: false, message: 'Quarto não encontrado' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as { status: string };
    room.status = body.status;
    
    return HttpResponse.json({
      success: true,
      data: room,
    });
  }),

  // DELETE /rooms/:id - Deletar quarto
  http.delete('/rooms/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const idx = rooms.findIndex(r => r.id === id);
    
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: 'Quarto não encontrado' },
        { status: 404 }
      );
    }
    
    rooms.splice(idx, 1);
    
    return HttpResponse.json({
      success: true,
      message: 'Quarto deletado',
    });
  }),

  // ============== OCCUPATIONS ==============

  // POST /occupations - Criar ocupação (check-in)
  http.post('/occupations', async ({ request }) => {
    const body = await request.json() as {
      roomId: number;
      responsibleName: string;
      responsibleCPF: string;
      responsiblePhone: string;
      responsibleBirthDate: string;
      carPlate: string;
      checkInDate: string;
      expectedCheckOut: string;
      roomRate: number;
      initialConsumption?: number;
      companions?: Array<{
        name: string;
        cpf: string;
        birthDate: string;
      }>;
    };
    
    const room = rooms.find(r => r.id === body.roomId);
    
    if (!room) {
      return HttpResponse.json(
        { success: false, message: 'Quarto não encontrado' },
        { status: 404 }
      );
    }
    
    if (room.status !== 'AVAILABLE' && room.status !== 'RESERVED') {
      return HttpResponse.json(
        { success: false, message: 'Quarto não está disponível' },
        { status: 400 }
      );
    }
    
    const newOccupation = {
      id: occupationIdCounter++,
      roomId: body.roomId,
      responsibleName: body.responsibleName,
      responsibleCPF: body.responsibleCPF,
      responsiblePhone: body.responsiblePhone,
      responsibleBirthDate: body.responsibleBirthDate,
      carPlate: body.carPlate,
      checkInDate: body.checkInDate,
      expectedCheckOut: body.expectedCheckOut,
      roomRate: body.roomRate,
      initialConsumption: body.initialConsumption || 0,
      companions: body.companions || [],
      consumptions: [],
      createdAt: new Date().toISOString(),
    };
    
    occupations.push(newOccupation);
    room.status = 'OCCUPIED';
    
    return HttpResponse.json({
      success: true,
      data: newOccupation,
    }, { status: 201 });
  }),

  // GET /occupations - Listar ocupações
  http.get('/occupations', () => {
    return HttpResponse.json({
      success: true,
      data: occupations,
    });
  }),

  // GET /occupations/:id - Obter ocupação por ID
  http.get('/occupations/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const occupation = occupations.find(o => o.id === id);
    
    if (!occupation) {
      return HttpResponse.json(
        { success: false, message: 'Ocupação não encontrada' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: occupation,
    });
  }),

  // GET /occupations/room/:roomId - Obter ocupação ativa de um quarto
  http.get('/occupations/room/:roomId', ({ params }) => {
    const roomId = parseInt(params.roomId as string);
    const occupation = occupations.find(
      o => o.roomId === roomId && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
    );
    
    if (!occupation) {
      return HttpResponse.json(
        { success: false, message: 'Nenhuma ocupação ativa encontrada' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: occupation,
    });
  }),

  // POST /occupations/:occupationId/consumptions - Adicionar consumo
  http.post('/occupations/:occupationId/consumptions', async ({ params, request }) => {
    const occupationId = parseInt(params.occupationId as string);
    const occupation = occupations.find(o => o.id === occupationId);
    
    if (!occupation) {
      return HttpResponse.json(
        { success: false, message: 'Ocupação não encontrada' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as {
      productId: number;
      quantity: number;
      unitPrice: number;
    };
    
    const consumption = {
      id: Date.now(),
      productId: body.productId,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      totalPrice: body.quantity * body.unitPrice,
      addedAt: new Date().toISOString(),
    };
    
    occupation.consumptions.push(consumption);
    
    return HttpResponse.json({
      success: true,
      data: consumption,
    }, { status: 201 });
  }),

  // POST /occupations/:occupationId/checkout - Realizar check-out
  http.post('/occupations/:occupationId/checkout', async ({ params, request }) => {
    const occupationId = parseInt(params.occupationId as string);
    const occupation = occupations.find(o => o.id === occupationId);
    
    if (!occupation) {
      return HttpResponse.json(
        { success: false, message: 'Ocupação não encontrado' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as { serviceChargePercentage?: number };
    const serviceChargePercentage = body.serviceChargePercentage || 10;
    
    const start = new Date(occupation.checkInDate);
    const end = new Date();
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    
    const roomRate = occupation.roomRate;
    const accommodationCost = days * roomRate;
    
    const consumptionTotal = occupation.consumptions.reduce((sum: number, c: any) => sum + c.totalPrice, 0);
    
    const serviceCharge = (accommodationCost + consumptionTotal) * (serviceChargePercentage / 100);
    const total = accommodationCost + consumptionTotal + serviceCharge;
    
    const room = rooms.find(r => r.id === occupation.roomId);
    if (room) {
      room.status = 'CLEANING';
    }
    
    occupation.status = 'COMPLETED';
    
    return HttpResponse.json({
      success: true,
      data: {
        occupationId: occupation.id,
        roomId: occupation.roomId,
        responsibleName: occupation.responsibleName,
        checkInDate: occupation.checkInDate,
        checkOutDate: end.toISOString().split('T')[0],
        days: days,
        accommodationCost: accommodationCost,
        consumptionTotal: consumptionTotal,
        serviceCharge: serviceCharge,
        total: total,
      },
    });
  }),

  // DELETE /occupations/:id - Deletar ocupação
  http.delete('/occupations/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const idx = occupations.findIndex(o => o.id === id);
    
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: 'Ocupação não encontrada' },
        { status: 404 }
      );
    }
    
    occupations.splice(idx, 1);
    
    return HttpResponse.json({
      success: true,
      message: 'Ocupação deletada',
    });
  }),

  // ============== PRODUCTS ==============

  // POST /products - Criar produto
  http.post('/products', async ({ request }) => {
    const body = await request.json() as {
      name: string;
      description: string;
      price: number;
      category: string;
    };
    
    const newProduct = {
      id: productIdCounter++,
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
    };
    
    products.push(newProduct);
    
    return HttpResponse.json({
      success: true,
      data: newProduct,
    }, { status: 201 });
  }),

  // GET /products - Listar produtos
  http.get('/products', () => {
    return HttpResponse.json({
      success: true,
      data: products,
    });
  }),

  // GET /products/:id - Obter produto por ID
  http.get('/products/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return HttpResponse.json(
        { success: false, message: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: product,
    });
  }),

  // PUT /products/:id - Atualizar produto
  http.put('/products/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return HttpResponse.json(
        { success: false, message: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as Record<string, any>;
    Object.assign(product, body);
    
    return HttpResponse.json({
      success: true,
      data: product,
    });
  }),

  // DELETE /products/:id - Deletar produto
  http.delete('/products/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const idx = products.findIndex(p => p.id === id);
    
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    
    products.splice(idx, 1);
    
    return HttpResponse.json({
      success: true,
      message: 'Produto deletado',
    });
  }),

  // ============== HEALTH CHECK ==============

  // GET / - Verificar se servidor está rodando
  http.get('/', () => {
    return HttpResponse.json({
      success: true,
      message: 'Servidor rodando',
    });
  }),
];
