import type { RoomStatusType } from '../roomStatusbar/roomStatusEnums';

export default interface IRoom {

    status: RoomStatusType;
    id: string | number;
    startDate: string | Date;
    endDate: string | Date;
    responsible: string;

    //Deve ser configurado pelo usuario em configuracoes
    type: string;
    

}
