import { Room } from "~/component/room/room";
import { Topbar } from "../component/Topbar/topbar";
import { RoomStatusbar } from "../component/roomStatusbar/roomStatusbar";
import styles from '../styles/routes/home.module.css';
import { RoomStatusType } from "~/component/roomStatusbar/roomStatusEnums";

// Sample data to render rooms without duplicating markup
const rooms = [
  { id: "101", status: RoomStatusType.AVAILABLE, type: "Standard", responsible: "Miguel Bernardino Sousa Borges da SIlva", startDate: "2025-11-18", endDate: "2025-11-20" },
  { id: "102", status: RoomStatusType.OCCUPIED, type: "Deluxe", responsible: "Maria", startDate: "2025-11-19", endDate: "2025-11-21" },
  { id: "103", status: RoomStatusType.EXPIRED, type: "Suite", responsible: "Carlos", startDate: "2025-11-18", endDate: "2025-11-22" },
  { id: "104", status: RoomStatusType.CLEANING, type: "Standard", responsible: "Ana", startDate: "2025-11-17", endDate: "2025-11-19" },
  { id: "105", status: RoomStatusType.MAINTENANCE, type: "Deluxe", responsible: "Rafa", startDate: "2025-11-20", endDate: "2025-11-23" },
  { id: "106", status: RoomStatusType.RESERVED, type: "Suite", responsible: "Lia", startDate: "2025-11-16", endDate: "2025-11-18" },
];

export default function Home() {
  return (
    <>
      <header className={`flex justify-center items-center ${styles.topbar}`}>
        <Topbar />
      </header>
      <main className={` ${styles.content}`}>
        <header>
          <RoomStatusbar />
        </header>
        <main className="w-full h-fit flex justify-center mt-10">
          <ol className={`w-[80%] ${styles.scrollContainer}`}>
            {rooms.map((room, idx) => (
              <li key={`${room.id}-${idx}`} className="flex justify-center">
                <Room
                  id={room.id}
                  status={room.status}
                  type={room.type}
                  responsible={room.responsible}
                  startDate={room.startDate}
                  endDate={room.endDate}
                />
              </li>
            ))}
          </ol>
        </main>
      </main>
    </>
  );
}
/*
    <div className="w-full flex flex-col justify-center items-center">
    </div>
*/