import { useState } from 'react';
import type IRoom from "./roomProps";
import { BadgeInfo, UserRound, CalendarClock, Check, LogOut, Edit, History, Search } from 'lucide-react';
import styles from './room.module.css';

import * as enums from "../roomStatusbar/roomStatusEnums";
import { shouldShowCheckin, shouldShowCheckout, shouldShowResponsible, shouldShowDates } from "./roomUtils";
import { CheckinModal, type CheckinData } from "./CheckinModal/CheckinModal";
import { CheckoutModal } from "./CheckoutModal/CheckoutModal";
import { useRooms } from '~/contexts/RoomsContext';

export const Room : React.FC<IRoom> = ({ status, id, startDate, endDate, responsible, type }) => {

    console.log(enums.RoomStatusMeta[status].color);

    const { refreshRooms } = useRooms();
    const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [roomData, setRoomData] = useState({
        status,
        responsible,
        startDate,
        endDate
    });

    const showCheckin = shouldShowCheckin(roomData.status);
    const showCheckout = shouldShowCheckout(roomData.status);
    const showResponsible = shouldShowResponsible(roomData.status);
    const showDates = shouldShowDates(roomData.status);

    const handleCheckinClick = () => {
        setIsCheckinModalOpen(true);
    };

    const handleCheckoutClick = () => {
        setIsCheckoutModalOpen(true);
    };

    const handleCheckinComplete = (data: CheckinData) => {
        // Se a data/hora de entrada é futura, tratar como RESERVA; caso contrário, OCUPADO
        const statusToSet = data.isReservation ? enums.RoomStatusType.RESERVED : enums.RoomStatusType.OCCUPIED;
        setRoomData({
            status: statusToSet,
            responsible: data.responsible,
            startDate: `${data.startDate} ${data.startTime}`,
            endDate: `${data.endDate} ${data.endTime}`
        });

        console.log('Check-in/Reserva concluído para quarto', id, {
            ...data,
            finalStatus: statusToSet,
            calculatedStayType: data.stayType === 'daily' ? 'Diária (12h)' : 'Pernoite (24h)'
        });
        
        // Refresh automático após check-in
        refreshRooms();
    };

    const handleCheckoutComplete = () => {
        // Atualiza o estado do quarto para CLEANING após check-out
        setRoomData({
            status: enums.RoomStatusType.CLEANING,
            responsible: '',
            startDate: '',
            endDate: ''
        });

        console.log('Check-out concluído para quarto', id, '- Status alterado para LIMPEZA');
        
        // Refresh automático após checkout
        refreshRooms();
    };

    return (
        <>
            <li className={styles.element}> 
                <header className={`${styles.header}`}
                style={{backgroundColor: `${enums.RoomStatusMeta[roomData.status].color}`}}
                >
                    <h1>{id}</h1>  
                </header>
                <main className={styles.main}>
                    <ul className="flex flex-col gap-2 text-sm md:text-base lg:text-lg">
                        {/* Informações do tipo de Quarto */}
                        <li className="flex items-center gap-2">
                            <BadgeInfo className={styles.icon} />
                            <span className={styles.infoText}>{type}</span>
                        </li>

                        {/* Informações do Responsavel - apenas para quartos ocupados/vencidos/limpeza */}
                        {showResponsible && (
                            <li className="flex items-center gap-2">
                                <UserRound className={styles.icon} />
                                <span className={styles.infoText}>{roomData.responsible}</span>
                            </li>
                        )}

                        {/* Informações do Tempo - apenas para quartos ocupados/vencidos/limpeza */}
                        {showDates && (
                            <li className="flex items-center gap-2">
                                <CalendarClock className={styles.icon} />
                                <div className={`flex flex-col text-xs md:text-sm`}>
                                    <span className={styles.infoText}>{roomData.startDate.toString()}</span>
                                    <span className={styles.infoText}>{roomData.endDate.toString()}</span>
                                </div>
                            </li>
                        )}
                    </ul>
                </main>

                <footer className={styles.footer}>
                    <div className={styles.footerButtons}>
                        {showCheckin && (
                            <button 
                                className={`${styles.actionButton} ${styles.checkin}`} 
                                title="Check-in"
                                onClick={handleCheckinClick}
                            >
                                <Check className={styles.icon} />
                                <span className={styles.buttonText}>Check-in</span>
                            </button>
                        )}

                        {showCheckout && (
                            <button 
                                className={`${styles.actionButton} ${styles.checkout}`} 
                                title="Check-out"
                                onClick={handleCheckoutClick}
                            >
                                <LogOut className={styles.icon} />
                                <span className={styles.buttonText}>Check-out</span>
                            </button>
                        )}

                        <button className={`${styles.utilityButton} ${styles.edit}`} title="Editar">
                            <Edit className={styles.icon} />
                            <span className={styles.buttonText}>Editar</span>
                        </button>

                        <button className={`${styles.utilityButton} ${styles.history}`} title="Histórico">
                            <History className={styles.icon} />
                            <span className={styles.buttonText}>Histórico</span>
                        </button>

                        <button className={`${styles.utilityButton} ${styles.search}`} title="Detalhes">
                            <Search className={styles.icon} />
                            <span className={styles.buttonText}>Detalhes</span>
                        </button>
                    </div>
                </footer>
            </li>

            {/* Modal de Check-in */}
            <CheckinModal
                isOpen={isCheckinModalOpen}
                onClose={() => setIsCheckinModalOpen(false)}
                roomId={id}
                roomType={type}
                onCheckinComplete={handleCheckinComplete}
            />

            {/* Modal de Check-out */}
            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                roomId={id}
                roomType={type}
                responsible={roomData.responsible || 'N/A'}
                startDate={roomData.startDate?.toString() || ''}
                endDate={roomData.endDate?.toString() || ''}
                onCheckoutComplete={handleCheckoutComplete}
            />
        </>
    );
}
