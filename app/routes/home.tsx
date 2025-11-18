import { Topbar } from "../component/Topbar/topbar";
import { RoomStatusbar } from "../component/roomStatusbar/roomStatusbar";
import styles from '../styles/routes/home.module.css';

export default function Home() {
  return (
    <>
      <header className={`flex justify-center items-center ${styles.topbar}`}>
        <Topbar />
      </header>
      <main className={` ${styles.content}`}>
        <RoomStatusbar />
      </main>
    </>
  );
}
/*
    <div className="w-full flex flex-col justify-center items-center">
    </div>
*/