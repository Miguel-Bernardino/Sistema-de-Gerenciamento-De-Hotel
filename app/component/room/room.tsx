import { useState } from 'react';
import type IRoom from "./roomProps";
import { BadgeInfo, UserRound, CalendarClock, Check, LogOut, Edit, History, Search } from 'lucide-react';
import styles from './room.module.css';

import * as enums from "../roomStatusbar/roomStatusEnums";
import { shouldShowCheckin, shouldShowCheckout, shouldShowResponsible, shouldShowDates } from "./roomUtils";
import { CheckinModal, type CheckinData } from "./CheckinModal/CheckinModal";
import { CheckoutModal } from "./CheckoutModal/CheckoutModal";
import { useRooms } from '~/contexts/RoomsContext';
import { apiCall } from '~/utils/api';

export const Room : React.FC<IRoom> = ({ status, id, number, roomType, dailyRate, nightRate, startDate, endDate, responsible }) => {

    console.log(enums.RoomStatusMeta[status].color);

    const { refreshRooms } = useRooms();
    const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const formatDateTime = (value?: string | Date) => {
        if (!value) return '';

        if (typeof value === 'string') {
            const clean = value.replace('Z', '').trim();
            if (clean.includes('T')) {
                const [datePart, timePartRaw] = clean.split('T');
                const hhmm = (timePartRaw || '').slice(0, 5);
                return `${datePart} ${hhmm}`.trim();
            }
            // Already "YYYY-MM-DD HH:mm" or similar
            return clean.length > 16 ? clean.slice(0, 16) : clean;
        }

        if (value instanceof Date && !isNaN(value.getTime())) {
            const pad = (n: number) => String(n).padStart(2, '0');
            const y = value.getFullYear();
            const m = pad(value.getMonth() + 1);
            const d = pad(value.getDate());
            const hh = pad(value.getHours());
            const mm = pad(value.getMinutes());
            return `${y}-${m}-${d} ${hh}:${mm}`;
        }

        return '';
    };

    const showCheckin = shouldShowCheckin(status);
    const showCheckout = shouldShowCheckout(status);
    const showResponsible = shouldShowResponsible(status);
    const showDates = shouldShowDates(status);

    const handleCheckinClick = () => {
        setIsCheckinModalOpen(true);
    };

    const handleCheckoutClick = () => {
        setIsCheckoutModalOpen(true);
    };

    const handleCheckinComplete = async (data: CheckinData) => {
        try {
            const requiredMissing: string[] = [];
            if (!id && id !== 0) requiredMissing.push('roomId');
            if (!data.responsible?.trim()) requiredMissing.push('responsibleName');
            if (!data.cpf?.trim()) requiredMissing.push('responsibleCPF');
            if (!data.phone?.trim()) requiredMissing.push('responsiblePhone');
            if (!data.birthDate) requiredMissing.push('responsibleBirthDate');
            if (!data.startDate || !data.startTime) requiredMissing.push('checkInDate');
            if (!data.endDate || !data.endTime) requiredMissing.push('expectedCheckOut');

            const rateValue = nightRate ?? dailyRate ?? 0;
            if (!rateValue) requiredMissing.push('roomRate');

            if (requiredMissing.length > 0) {
                alert(`Campos obrigatórios ausentes: ${requiredMissing.join(', ')}`);
                return;
            }

            const payload = {
                roomId: Number(id),
                responsibleName: data.responsible,
                responsibleCPF: data.cpf,
                responsiblePhone: data.phone || '',
                responsibleBirthDate: data.birthDate,
                carPlate: data.licensePlate || '',
                checkInDate: `${data.startDate}T${data.startTime}:00`,
                expectedCheckOut: `${data.endDate}T${data.endTime}:00`,
                roomRate: rateValue,
                initialConsumption: 0,
                companions: (data.companions || []).map(c => ({
                    name: c.name,
                    cpf: c.cpf,
                    birthDate: c.birthDate
                }))
            };
            
            console.log('🏨 Enviando check-in:', payload);
            
            const response = await apiCall('/occupations', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            console.log('📡 Resposta check-in status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erro no check-in:', errorData);
                alert(errorData.message || errorData.error || `Erro ${response.status}`);
                return;
            }
            
            const result = await response.json();
            console.log('✅ Check-in bem-sucedido:', result);
            
            // Refresh automático após check-in para atualizar status do quarto
            console.log('🔄 Atualizando lista de quartos...');
            await refreshRooms();
            
            alert('Check-in realizado com sucesso!');
        } catch (error: any) {
            console.error('❌ Erro ao fazer check-in:', error);
            alert(error.message || 'Erro ao conectar com o servidor');
        }
    };

    const handleCheckoutComplete = async () => {
        // Modal já completou o checkout, apenas refresh dos quartos
        console.log('✅ Check-out bem-sucedido via modal. Atualizando lista de quartos...');
        try {
            await refreshRooms();
        } catch (error: any) {
            console.error('❌ Erro ao refresh após checkout:', error);
        }
    };

    return (
        <>
            <li className={styles.element}> 
                <header className={`${styles.header}`}
                style={{backgroundColor: `${enums.RoomStatusMeta[status].color}`}}
                >
                    <h1>{number}</h1>  
                </header>
                <main className={styles.main}>
                    <ul className="flex flex-col gap-2 text-sm md:text-base lg:text-lg">
                        {/* Informações do tipo de Quarto */}
                        <li className="flex items-center gap-2">
                            <BadgeInfo className={styles.icon} />
                            <span className={styles.infoText}>{roomType}</span>
                        </li>

                        {/* Informações do Responsavel - apenas para quartos ocupados/vencidos/limpeza */}
                        {showResponsible && (
                            <li className="flex items-center gap-2">
                                <UserRound className={styles.icon} />
                                <span className={styles.infoText}>{responsible}</span>
                            </li>
                        )}

                        {/* Informações do Tempo - apenas para quartos ocupados/vencidos/limpeza */}
                        {showDates && (
                            <li className="flex items-center gap-2">
                                <CalendarClock className={styles.icon} />
                                <div className={`flex flex-col text-xs md:text-sm`}>
                                    <span className={styles.infoText}>{formatDateTime(startDate)}</span>
                                    <span className={styles.infoText}>{formatDateTime(endDate)}</span>
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
                roomType={roomType}
                onCheckinComplete={handleCheckinComplete}
            />

            {/* Modal de Check-out */}
            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                roomId={id}
                roomType={roomType}
                responsible={responsible || 'N/A'}
                startDate={formatDateTime(startDate)}
                endDate={formatDateTime(endDate)}
                onCheckoutComplete={handleCheckoutComplete}
            />
        </>
    );
}
