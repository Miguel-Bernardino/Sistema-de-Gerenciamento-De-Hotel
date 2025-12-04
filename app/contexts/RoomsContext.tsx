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
    const [isMswReady, setIsMswReady] = useState<boolean>(false);

    // Aguarda MSW estar pronto (apenas no cliente)
    useEffect(() => {
        if (typeof window === 'undefined') {
            // No servidor, não usa MSW
            setIsMswReady(true);
            return;
        }

        // No cliente, aguarda MSW estar pronto
        const checkMswReady = () => {
            if (import.meta.env.DEV) {
                // Aguarda um pouco para garantir que MSW iniciou
                setTimeout(() => setIsMswReady(true), 1000);
            } else {
                // Em produção, não usa MSW
                setIsMswReady(true);
            }
        };

        checkMswReady();
    }, []);

    // Função para buscar quartos do backend
    const fetchRooms = useCallback(async () => {
        // Só faz fetch no cliente e quando MSW estiver pronto
        if (typeof window === 'undefined' || !isMswReady) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/rooms');
            const data = await response.json();
            
            if (data.success && data.rooms) {
                setRooms(data.rooms);
            } else {
                setError(data.message || 'Erro ao carregar quartos');
            }
        } catch (err) {
            console.error('Erro ao buscar quartos:', err);
            setError('Erro ao conectar com o servidor');
        } finally {
            setIsLoading(false);
        }
    }, [isMswReady]);

    // Refresh manual (pode ser chamado por componentes filhos)
    const refreshRooms = useCallback(async () => {
        await fetchRooms();
    }, [fetchRooms]);

    // Polling automático
    useEffect(() => {
        // Só inicia polling quando MSW estiver pronto
        if (!isMswReady) {
            return;
        }

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
    }, [fetchRooms, pollingInterval, isMswReady]);

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
