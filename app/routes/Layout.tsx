import Sidebar from '../component/sidebar/sidebar';
import { Outlet, useLocation } from 'react-router-dom'
import styles from '../styles/layout.module.css';

export default function Layout() {
  const location = useLocation();
  // Hide sidebar on index route ('/') where login is rendered
  const hideSidebar = location.pathname === '/';
  return (
    <div className={hideSidebar ? styles.maindivLogin : styles.maindiv}>
        {!hideSidebar && (
          <nav className={styles.navbar}>
              <Sidebar />
          </nav>
        )}
        {hideSidebar ? (
          <div className={styles.mainArea}>
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
    </div>
  );
}
/*
        <main className="flex w-full h-full">
        </main>
*/