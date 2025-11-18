// Use a string enum for the keys and a separate metadata map for labels/colors.
// Enums cannot contain object values; this pattern is type-safe and bundler-friendly.
export enum RoomStatusType {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    CLEANING = 'CLEANING',
    EXPIRED = 'EXPIRED',
    MAINTENANCE = 'MAINTENANCE',
    RESERVED = 'RESERVED',
}

export const RoomStatusMeta = {
    [RoomStatusType.AVAILABLE]: { status: 'disponível', color: 'var(--ocupacao-disponivel)' },
    [RoomStatusType.OCCUPIED]: { status: 'ocupado', color: 'var(--ocupacao-ocupado)' },
    [RoomStatusType.CLEANING]: { status: 'limpeza', color: 'var(--ocupacao-limpeza)' },
    [RoomStatusType.EXPIRED]: { status: 'vencido', color: 'var(--ocupacao-vencido)' },
    [RoomStatusType.MAINTENANCE]: { status: 'manutenção', color: 'var(--ocupacao-manutencao)' },
    [RoomStatusType.RESERVED]: { status: 'reservado', color: 'var(--ocupacao-reservado)' },
} as const;

export type RoomStatusInfo = typeof RoomStatusMeta[RoomStatusType];