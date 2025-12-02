import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { RoomStatusType } from '~/component/roomStatusbar/roomStatusEnums';

export interface RoomData {
    id: string;
    status: RoomStatusType;
    type: string;
    responsible?: string;
    startDate?: string;
    endDate?: string;
}

interface RoomsContextType {
    rooms: RoomData[];
    isLoading: boolean;
    error: string | null;
    refreshRooms: () => Promise<void>;
}

const RoomsContext = createContext<RoomsContextType | undefined>(undefined);

export const useRooms = () => {
    const context = useContext(RoomsContext);
    if (!context) {
        throw new Error('useRooms must be used within RoomsProvider');
    }
    return context;
};

interface RoomsProviderProps {
    children: ReactNode;
    pollingInterval?: number; // em milissegundos (padrão: 30 segundos)
}

export const RoomsProvider: React.FC<RoomsProviderProps> = ({ 
    children, 
    pollingInterval = 30000 
}) => {
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Função para buscar quartos do backend
    const fetchRooms = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Substituir por chamada real ao backend
            const response = await mockFetchRooms();
            
            if (response.success && response.data) {
                setRooms(response.data);
            } else {
                setError(response.message || 'Erro ao carregar quartos');
            }
        } catch (err) {
            console.error('Erro ao buscar quartos:', err);
            setError('Erro ao conectar com o servidor');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh manual (pode ser chamado por componentes filhos)
    const refreshRooms = useCallback(async () => {
        await fetchRooms();
    }, [fetchRooms]);

    // Polling automático
    useEffect(() => {
        // Busca inicial
        fetchRooms();

        // Configura polling
        const intervalId = setInterval(() => {
            fetchRooms();
        }, pollingInterval);

        // Cleanup
        return () => {
            clearInterval(intervalId);
        };
    }, [fetchRooms, pollingInterval]);

    const value: RoomsContextType = {
        rooms,
        isLoading,
        error,
        refreshRooms
    };

    return (
        <RoomsContext.Provider value={value}>
            {children}
        </RoomsContext.Provider>
    );
};

// Mock da chamada ao backend
// TODO: Substituir por chamada real usando fetch/axios
async function mockFetchRooms(): Promise<{
    success: boolean;
    data?: RoomData[];
    message?: string;
}> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simula resposta do backend
    const mockRooms: RoomData[] = [
        { id: "101", status: RoomStatusType.AVAILABLE, type: "Standard", responsible: "Miguel Bernardino", startDate: "2025-11-18", endDate: "2025-11-20" },
        { id: "102", status: RoomStatusType.OCCUPIED, type: "Deluxe", responsible: "Maria Silva", startDate: "2025-11-19", endDate: "2025-11-21" },
        { id: "103", status: RoomStatusType.EXPIRED, type: "Suite", responsible: "Carlos Souza", startDate: "2025-11-18", endDate: "2025-11-22" },
        { id: "104", status: RoomStatusType.CLEANING, type: "Standard", responsible: "Ana Costa", startDate: "2025-11-17", endDate: "2025-11-19" },
        { id: "105", status: RoomStatusType.MAINTENANCE, type: "Deluxe", responsible: "Rafael Lima", startDate: "2025-11-20", endDate: "2025-11-23" },
        { id: "106", status: RoomStatusType.RESERVED, type: "Suite", responsible: "Lia Fernandes", startDate: "2025-11-16", endDate: "2025-11-18" },
    ];

    return {
        success: true,
        data: mockRooms
    };
}
