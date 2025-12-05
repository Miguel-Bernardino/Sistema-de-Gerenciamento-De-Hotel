import type { RoomStatusType } from '../roomStatusbar/roomStatusEnums';

export default interface IRoom {
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
