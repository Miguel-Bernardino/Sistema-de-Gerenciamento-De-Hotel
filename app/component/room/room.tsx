import type IRoom from "./roomProps";
import { BadgeInfo, UserRound, CalendarClock, Check, LogOut, Edit, History, Search } from 'lucide-react';
import styles from './room.module.css';

import * as enums from "../roomStatusbar/roomStatusEnums";
import { shouldShowCheckin, shouldShowCheckout } from "./roomUtils";

export const Room : React.FC<IRoom> = ({ status, id, startDate, endDate, responsible, type }) => {

    console.log(enums.RoomStatusMeta[status].color);

    const showCheckin = shouldShowCheckin(status);
    const showCheckout = shouldShowCheckout(status);

    return (
        <>
            <li className={styles.element}> 
                <header className={`${styles.header}`}
                style={{backgroundColor: `${enums.RoomStatusMeta[status].color}`}}
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

                        {/* Informações do Responsavel */}
                        <li className="flex items-center gap-2">
                            <UserRound className={styles.icon} />
                            <span className={styles.infoText}>{responsible}</span>
                        </li>

                        {/* Informações do Tempo  */}
                        <li className="flex items-center gap-2">
                            <CalendarClock className={styles.icon} />
                            <div className={`flex flex-col text-xs md:text-sm`}>
                                <span className={styles.infoText}>{startDate.toString()}</span>
                                <span className={styles.infoText}>{endDate.toString()}</span>
                            </div>
                        </li>
                    </ul>
                </main>

                <footer className={styles.footer}>
                    <div className={styles.footerButtons}>
                        {showCheckin && (
                            <button className={`${styles.actionButton} ${styles.checkin}`} title="Check-in">
                                <Check className={styles.icon} />
                                <span className={styles.buttonText}>Check-in</span>
                            </button>
                        )}

                        {showCheckout && (
                            <button className={`${styles.actionButton} ${styles.checkout}`} title="Check-out">
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
        </>
    );
}
