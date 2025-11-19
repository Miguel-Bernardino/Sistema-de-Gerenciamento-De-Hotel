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

/**
 * Determina se as informações do responsável devem ser exibidas
 * Apenas mostrado para: OCCUPIED, EXPIRED, CLEANING
 * (Status onde o check-in foi feito e alguém é/foi responsável)
 * @param status - Status atual do quarto
 * @returns true se o responsável deve aparecer
 */
export const shouldShowResponsible = (status: RoomStatusType): boolean => {
    return [
        RoomStatusType.OCCUPIED,
        RoomStatusType.EXPIRED,
        RoomStatusType.CLEANING
    ].includes(status);
};

/**
 * Determina se as informações de data devem ser exibidas
 * Apenas mostrado para: OCCUPIED, EXPIRED, CLEANING
 * (Mesma lógica do responsável - datas são relevantes após check-in)
 * @param status - Status atual do quarto
 * @returns true se as datas devem aparecer
 */
export const shouldShowDates = (status: RoomStatusType): boolean => {
    return [
        RoomStatusType.OCCUPIED,
        RoomStatusType.EXPIRED,
        RoomStatusType.CLEANING
    ].includes(status);
};
