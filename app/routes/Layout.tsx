import Sidebar from '../component/sidebar/sidebar';
import { Outlet } from 'react-router-dom'
import styles from '../styles/layout.module.css';

export default function Layout() {
  return (
    <div className={styles.maindiv}>
        <nav className={styles.navbar}>
            <Sidebar />
        </nav>
        <Outlet />
    </div>
  );
}
/*
        <main className="flex w-full h-full">
        </main>
*/