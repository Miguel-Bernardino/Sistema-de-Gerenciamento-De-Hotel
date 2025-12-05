import { Room } from "~/component/room/room";
import { Topbar } from "../component/Topbar/topbar";
import { RoomStatusbar } from "../component/roomStatusbar/roomStatusbar";
import styles from '../styles/routes/home.module.css';
import { useRooms } from '../contexts/RoomsContext';

export default function Home() {
  const { rooms, isLoading, error } = useRooms();

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
          {isLoading && rooms.length === 0 ? (
            <div className="text-center py-10">
              <p>Carregando quartos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>Erro: {error}</p>
            </div>
          ) : (
            <ol className={`w-[80%] ${styles.scrollContainer}`}>
              {rooms.map((room, idx) => (
                <li key={`${room.id}-${idx}`} className="flex justify-center">
                  <Room
                    id={room.id}
                    number={room.number}
                    status={room.status}
                    roomType={room.roomType}
                    dailyRate={room.dailyRate}
                    nightRate={room.nightRate}
                    responsible={room.responsible || ''}
                    startDate={room.startDate || ''}
                    endDate={room.endDate || ''}
                  />
                </li>
              ))}
            </ol>
          )}
        </main>
      </main>
    </>
  );
}