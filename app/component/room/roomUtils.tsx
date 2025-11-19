import { RoomStatusType } from "../roomStatusbar/roomStatusEnums";

/**
 * Determina se o botão de Check-in deve ser exibido com base no status do quarto
 * @param status - Status atual do quarto
 * @returns true se o botão de check-in deve aparecer
 */
export const shouldShowCheckin = (status: RoomStatusType): boolean => {
    return [
        RoomStatusType.AVAILABLE,
        RoomStatusType.RESERVED,
        RoomStatusType.CLEANING,
        RoomStatusType.MAINTENANCE
    ].includes(status);
};

/**
 * Determina se o botão de Check-out deve ser exibido com base no status do quarto
 * @param status - Status atual do quarto
 * @returns true se o botão de check-out deve aparecer
 */
export const shouldShowCheckout = (status: RoomStatusType): boolean => {
    return [
        RoomStatusType.OCCUPIED,
        RoomStatusType.EXPIRED
    ].includes(status);
};
