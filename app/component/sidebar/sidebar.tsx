import { useMediaQuery } from 'react-responsive';
import { SidebarDesktop } from './Desktop/sidebarDesktop';
import { SidebarMobile } from './Mobile/sidebarMobile';
import { useLocation } from 'react-router';
import { useState } from 'react';

/*Futuramente adicionar gerenciamento de funcionarios*/
const Sidebar: React.FC<any> = ({...props}) => {

    const isMobile = useMediaQuery({ maxWidth: 1023 });

    const [focusPage, setFocusPage] = useState<string>('/home');
    const location = useLocation();

    //alterar futuramente apos a rota de login que sera a principal
    const isActive = (path: string) => {
        if (path === focusPage) {
            if (location.pathname === '/' || location.pathname.startsWith('/home')) return true;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {!isMobile ? (
                <SidebarDesktop isActive={isActive} focusPage={focusPage} setFocusPage={setFocusPage} />
            ) : (
                <SidebarMobile isActive={isActive} focusPage={focusPage} setFocusPage={setFocusPage} />
            )}
        </>
    );
    
}

export default Sidebar;