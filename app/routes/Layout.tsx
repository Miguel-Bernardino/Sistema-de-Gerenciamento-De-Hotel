import Sidebar from '../component/sidebar/sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex">
        <nav>
            <Sidebar />
        </nav>
        <main className="flex w-full h-full">
            <Outlet />
        </main>
    </div>
  );
}
