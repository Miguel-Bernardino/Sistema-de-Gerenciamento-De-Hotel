import { http, HttpResponse } from 'msw';

// In-memory data store
let rooms = [
  {
    id: '101',
    status: 'AVAILABLE',
    type: 'STANDARD',
    responsible: '',
    startDate: '',
    endDate: '',
  },
  {
    id: '102',
    status: 'OCCUPIED',
    type: 'DELUXE',
    responsible: 'João Silva',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
  },
  {
    id: '103',
    status: 'CLEANING',
    type: 'SUITE',
    responsible: '',
    startDate: '',
    endDate: '',
  },
];

export const handlers = [
  // Login endpoint
  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Mock validation
    if (body.email === 'admin@hotel.com' && body.password === 'admin123') {
      return HttpResponse.json({
        success: true,
        user: {
          id: '1',
          name: 'Admin',
          email: body.email,
        },
        token: 'mock-jwt-token-' + Date.now(),
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'Credenciais inválidas' },
      { status: 401 }
    );
  }),

  // Get all rooms
  http.get('/api/rooms', () => {
    return HttpResponse.json({
      success: true,
      rooms: rooms,
    });
  }),

  // Create new room
  http.post('/api/rooms', async ({ request }) => {
    const body = await request.json() as {
      id: string;
      type: string;
      pricePerNight: number;
    };
    
    // Check if room already exists
    if (rooms.find(r => r.id === body.id)) {
      return HttpResponse.json(
        { success: false, message: 'Quarto já existe' },
        { status: 400 }
      );
    }
    
    const newRoom = {
      id: body.id,
      status: 'AVAILABLE' as const,
      type: body.type,
      responsible: '',
      startDate: '',
      endDate: '',
    };
    
    rooms.push(newRoom);
    
    return HttpResponse.json({
      success: true,
      room: newRoom,
    });
  }),

  // Check-in
  http.post('/api/checkin', async ({ request }) => {
    const body = await request.json() as {
      roomId: string;
      responsible: string;
      startDate: string;
      endDate: string;
    };
    
    const room = rooms.find(r => r.id === body.roomId);
    
    if (!room) {
      return HttpResponse.json(
        { success: false, message: 'Quarto não encontrado' },
        { status: 404 }
      );
    }
    
    if (room.status !== 'AVAILABLE') {
      return HttpResponse.json(
        { success: false, message: 'Quarto não está disponível' },
        { status: 400 }
      );
    }
    
    room.status = 'OCCUPIED';
    room.responsible = body.responsible;
    room.startDate = body.startDate;
    room.endDate = body.endDate;
    
    return HttpResponse.json({
      success: true,
      room: room,
    });
  }),

  // Check-out
  http.post('/api/checkout', async ({ request }) => {
    const body = await request.json() as {
      roomId: string;
    };
    
    const room = rooms.find(r => r.id === body.roomId);
    
    if (!room) {
      return HttpResponse.json(
        { success: false, message: 'Quarto não encontrado' },
        { status: 404 }
      );
    }
    
    if (room.status !== 'OCCUPIED') {
      return HttpResponse.json(
        { success: false, message: 'Quarto não está ocupado' },
        { status: 400 }
      );
    }
    
    // Calculate days and total
    const start = new Date(room.startDate);
    const end = new Date();
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = 150; // Mock price
    const total = days * pricePerNight;
    
    room.status = 'CLEANING';
    room.responsible = '';
    const checkoutData = {
      roomId: room.id,
      startDate: room.startDate,
      endDate: end.toISOString().split('T')[0],
      days: days,
      pricePerNight: pricePerNight,
      total: total,
    };
    
    room.startDate = '';
    room.endDate = '';
    
    return HttpResponse.json({
      success: true,
      room: room,
      checkout: checkoutData,
    });
  }),
];
