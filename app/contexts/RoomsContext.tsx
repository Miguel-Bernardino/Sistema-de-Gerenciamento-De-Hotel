import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { RoomStatusType } from '~/component/roomStatusbar/roomStatusEnums';
import { apiCall } from '~/utils/api';

export interface RoomData {
    id: number;
    number: string;
    status: RoomStatusType;
    roomType: string;
    floor: number;
    capacity: number;
    dailyRate: number;
    nightRate: number;
    startDate?: string | Date;
    endDate?: string | Date;
    responsible?: string;
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

    // Normaliza os dados do backend para garantir campos de ocupação presentes na UI
    const normalizeStatus = (statusValue: any): RoomStatusType => {
        const normalized = String(statusValue || '').toUpperCase();
        return (Object.values(RoomStatusType) as string[]).includes(normalized)
            ? (normalized as RoomStatusType)
            : RoomStatusType.AVAILABLE;
    };

    const isActiveOccupation = (occupation: any): boolean => {
        const status = String(occupation?.status || occupation?.state || '').toUpperCase();
        if (!status && occupation) return true;
        return ['ACTIVE', 'OPEN', 'ONGOING', 'IN_PROGRESS', 'CHECKED_IN', 'OCCUPIED'].includes(status);
    };

    const normalizeRoom = (room: any, occupationFromMap?: any): RoomData => {
        const occupation = occupationFromMap
            || room?.currentOccupation
            || room?.occupation
            || room?.activeOccupation
            || (Array.isArray(room?.occupations)
                ? room.occupations.find((occ: any) => isActiveOccupation(occ) || occ?.isActive)
                : undefined);

        const statusSource = occupation?.status ?? room?.status ?? room?.roomStatus ?? room?.state;
        const normalizedStatus = occupation ? RoomStatusType.OCCUPIED : normalizeStatus(statusSource);

        // Preserve backend-provided timestamps (assumed ISO strings) without timezone shifting
        const occupationStart = occupation?.checkInDate ?? occupation?.startDate ?? occupation?.entryDate ?? room?.startDate ?? room?.checkInDate ?? '';
        const occupationEnd = occupation?.expectedCheckOut ?? occupation?.endDate ?? occupation?.checkOutDate ?? occupation?.exitDate ?? room?.endDate ?? room?.checkOutDate ?? '';

        return {
            id: Number(room?.id ?? room?.roomId ?? room?._id ?? 0),
            number: String(room?.number ?? room?.roomNumber ?? room?.name ?? ''),
            status: normalizedStatus,
            roomType: String(room?.roomType ?? room?.type ?? ''),
            floor: Number(room?.floor ?? room?.floorNumber ?? 0),
            capacity: Number(room?.capacity ?? room?.maxGuests ?? 0),
            dailyRate: Number(room?.dailyRate ?? room?.daily_rate ?? room?.rate ?? 0),
            nightRate: Number(room?.nightRate ?? room?.night_rate ?? room?.dailyRate ?? room?.rate ?? 0),
            responsible: occupation?.responsibleName ?? occupation?.responsible ?? room?.responsibleName ?? room?.responsible ?? '',
            startDate: occupationStart,
            endDate: occupationEnd
        };
    };

    const setNormalizedRooms = (rawRooms: any[], occupationByRoom?: Record<number, any>) => {
        const normalized = (rawRooms || []).map((room) => {
            const roomId = Number(room?.id ?? room?.roomId ?? room?._id ?? 0);
            const occupation = occupationByRoom ? occupationByRoom[roomId] : undefined;
            return normalizeRoom(room, occupation);
        });
        setRooms(normalized);
    };

    // Função para buscar quartos do backend
    const fetchRooms = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('🏨 Buscando quartos e ocupações do backend...');

            const [roomsResponse, occupationsResponse] = await Promise.all([
                apiCall('/rooms'),
                apiCall('/occupations')
            ]);

            if (!roomsResponse.ok) {
                const errorData = await roomsResponse.json();
                console.error('❌ Erro ao buscar quartos:', errorData);
                setError(errorData.message || 'Erro ao carregar quartos');
                return;
            }

            if (!occupationsResponse.ok) {
                console.warn('⚠️ Não foi possível carregar ocupações, continuando apenas com quartos.');
            }

            const [roomsData, occupationsData] = await Promise.all([
                roomsResponse.json(),
                occupationsResponse.ok ? occupationsResponse.json() : Promise.resolve(null)
            ]);

            console.log('✅ Dados de quartos recebidos:', roomsData);
            console.log('✅ Dados de ocupações recebidos:', occupationsData);

            const extractArray = (value: any) => {
                if (Array.isArray(value)) return value;
                if (value?.data && Array.isArray(value.data)) return value.data;
                if (value?.items && Array.isArray(value.items)) return value.items;
                if (value?.occupations && Array.isArray(value.occupations)) return value.occupations;
                return [];
            };

            const occupationsArray = extractArray(occupationsData);
            const occupationByRoom = occupationsArray.reduce((acc: Record<number, any>, occ: any) => {
                const roomId = Number(occ?.roomId ?? occ?.room?.id ?? occ?.room?._id ?? 0);
                if (!roomId) return acc;

                if (isActiveOccupation(occ)) {
                    acc[roomId] = occ;
                }
                return acc;
            }, {} as Record<number, any>);

            // Verificar diferentes formatos de resposta para quartos
            if (Array.isArray(roomsData)) {
                setNormalizedRooms(roomsData, occupationByRoom);
                console.log(`✅ ${roomsData.length} quartos carregados (array direto)`);
            } else if (roomsData?.success && roomsData.data) {
                setNormalizedRooms(roomsData.data, occupationByRoom);
                console.log(`✅ ${roomsData.data.length} quartos carregados (success/data)`);
            } else if (roomsData?.rooms) {
                setNormalizedRooms(roomsData.rooms, occupationByRoom);
                console.log(`✅ ${roomsData.rooms.length} quartos carregados (rooms)`);
            } else {
                console.warn('⚠️ Formato de resposta desconhecido:', roomsData);
                setError('Formato de resposta inválido');
            }
        } catch (err: any) {
            console.error('❌ Erro ao buscar quartos:', err);
            setError(err.message || 'Erro ao conectar com o servidor');
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
