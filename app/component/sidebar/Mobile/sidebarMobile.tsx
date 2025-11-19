import { useState } from 'react';
import Modal from '~/component/Modal/Modal';
import style from './sidebarMobile.module.css'
import { Menu } from 'lucide-react'
import HighlightIndicator from '../components/HighlightIndicator/HighlightIndicator';
import { useMediaQuery } from 'react-responsive';

export const SidebarMobile: React.FC<any> = ({ isActive, focusPage, setFocusPage, ...props }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    // Tablet range in both orientations
    const isTablet = useMediaQuery({ query: '(min-width: 768px) and (max-width: 1023px)' });

    return (
        <>
            <header className='w-fit h-fit cursor-pointer mt-[var(--top-header-margin)] '>
                <div onClick={() => setIsModalOpen(true)} 
                className={` ${style.menuButton} flex justify-center items-center p-1.5 rounded-lg transition-colors duration-200`}>                
                    <button>
                        <Menu className={`cursor-pointer ${style.menuSvg}`} />
                    </button>
                </div>
            </header>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Título do Modal"
                padding="0"
                position="top-left"
                backgroundColor="var(--sidebar-bg)"
                className="h-screen "
                maxWidth={isTablet ? '48%' : '60%'}
                minHeight='100%'
                showHeader={false}
                animationType="slideRight"
                exitAnimationType="slideOutLeft"
                borderRadius={ isTablet ? { topLeft: '0', topRight: '24px', bottomRight: '24px', bottomLeft: '0' } : { topLeft: '0', topRight: '20px', bottomRight: '20px', bottomLeft: '0' }}
                margin="0px"
                >
                <ol className='flex flex-col'>
                    <header onClick={() => setIsModalOpen(false)} className='w-full flex justify-start'>
                        <li className={`${style.modalItem} `}>
                            <button className={style.modalItemMenuIcon}>
                                <Menu className={`cursor-pointer ${style.menuSvg}`} />
                                Menu
                            </button>
                        </li>
                    </header>
                    
                    <main className='flex flex-col items-start justify-start'>
                        
                        {/*------------------HOME PAGE------------------------*/}
                        <li className={`${style.modalItem} ${isActive('/home') ? style["sidebar-li-active"] : ''}`}
                        onClick={(e) => { setFocusPage('/home') }}>    
                            {isActive('/home') && <HighlightIndicator inline={true} />}
                            <a href="/home" className="flex items-center ">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${style.modalItemIcon}`}>
                                    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                                    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                                </svg>
                                Início
                            </a>
                        </li>

                        {/*------------------STATISTIC PAGE------------------------*/}
                        <li className={`${style.modalItem} ${isActive('/statistics') ? style["sidebar-li-active"] : ''}`}
                        onClick={(e) => { setFocusPage('/statistics') }}>
                            {isActive('/statistics') && <HighlightIndicator inline={true} />}
                            <a href="/statistics" className="flex items-center" >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 105.98" className={style.modalItemIcon} fill="currentColor">
                                    <g><path d="M122.88,105.98H9.59v-0.02c-2.65,0-5.05-1.08-6.78-2.81c-1.72-1.72-2.79-4.11-2.79-6.75H0V0h12.26v93.73h110.62V105.98 L122.88,105.98z M83.37,45.6h19.55c1.04,0,1.89,0.85,1.89,1.89v38.46c0,1.04-0.85,1.89-1.89,1.89H83.37 c-1.04,0-1.89-0.85-1.89-1.89V47.5C81.48,46.46,82.33,45.6,83.37,45.6L83.37,45.6z M25.36,22.07h19.55c1.04,0,1.89,0.85,1.89,1.89 v62c0,1.04-0.85,1.89-1.89,1.89H25.36c-1.04,0-1.89-0.85-1.89-1.89v-62C23.47,22.92,24.32,22.07,25.36,22.07L25.36,22.07 L25.36,22.07z M54.37,8.83h19.54c1.04,0,1.89,0.85,1.89,1.89v75.24c0,1.04-0.85,1.89-1.89,1.89H54.37c-1.04,0-1.89-0.85-1.89-1.89 V10.72C52.48,9.68,53.33,8.83,54.37,8.83L54.37,8.83z"/></g>
                                </svg>
                                Estatísticas
                            </a>
                        </li>

                        {/*------------------PRODUCTS PAGE------------------------*/}
                        <li className={`${style.modalItem} ${isActive('/products') ? style["sidebar-li-active"] : ''}`}
                        onClick={(e) => { setFocusPage('/products') }}>
                            {isActive('/products') && <HighlightIndicator inline={true} />}
                            <a href="/products" className="flex items-center">
                                <svg className={`${style.modalItemIcon} `} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M15.5285 2.97293C15.8133 3.08683 16 3.36261 16 3.66929V12.3308C16 12.6374 15.8133 12.9132 15.5285 13.0271L8.27854 15.9271C8.09974 15.9987 7.90026 15.9987 7.72146 15.9271L0.471457 13.0271C0.186713 12.9132 0 12.6374 0 12.3308V3.66929C0 3.36261 0.186713 3.08683 0.471457 2.97293L7.44291 0.184311C7.44599 0.18308 7.44908 0.181859 7.45216 0.180648L7.72146 0.0729296C7.90026 0.00140642 8.09974 0.00140615 8.27854 0.0729295L8.54787 0.180658C8.55094 0.181865 8.55402 0.183083 8.55709 0.184311L15.5285 2.97293ZM10.4037 2.00001L4.25 4.46148L1.84633 3.50001L1 3.83855V4.23852L7.5 6.83852V14.7615L8 14.9615L8.5 14.7615V6.83852L15 4.23852V3.83855L14.1537 3.50001L8 5.96148L5.59629 5L11.75 2.53853L10.4037 2.00001Z" fill="currentColor"/>
                                </svg>
                                Produtos
                            </a>
                        </li>
                        
                        {/*------------------PRICE PAGE------------------------*/}
                        <li className={`${style.modalItem} ${isActive('/finance') ? style["sidebar-li-active"] : ''}`}
                        onClick={(e) => { setFocusPage('/finance') }}>
                            {isActive('/finance') && <HighlightIndicator inline={true} />}
                            <a href="/finance" className="flex items-center">
                                <svg id="Layer_1" className={style.modalItemPriceIcon} fill='currentColor' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="-0 -38 192.88 170.81">
                                    <path fillRule="evenodd" d="M51.45,3h.7a2.78,2.78,0,0,1,2,.89L96.54,49.93a10.36,10.36,0,0,1-.79,14.89L58.58,98l-.08.07a10.09,10.09,0,0,1-3.5,2.15,10.43,10.43,0,0,1-11.33-3L3.86,52.6a2.74,2.74,0,0,1-.69-2l.08-1.11L0,2.94A2.75,2.75,0,0,1,2.93,0L50.57,3l.18,0a5.07,5.07,0,0,1,.7-.06ZM82,99.58a2.76,2.76,0,0,1-3.68-4.12l37.31-33.31h0a4.68,4.68,0,0,0,1.21-1.54,5.3,5.3,0,0,0,.23-3.76,4.83,4.83,0,0,0-1-1.67l0-.06L73.68,9.05a2.76,2.76,0,1,1,4.07-3.74l42.36,46.07.1.11a10.34,10.34,0,0,1-.88,14.78h0L82,99.58ZM22.93,13c7.89.21,10,9,7.88,12.33a8.9,8.9,0,0,1-8.19,5.19c-9.62,0-12-13.5-3-17A8.37,8.37,0,0,1,22.93,13ZM34.71,31.53c1.07-1.07,2.51,1,4.25,2.78,5.65-3.61,11.73-2.72,16.43,2a1,1,0,0,1,0,1.46l-6.64,6.63c-1.48,1.49-3.39-3.63-6-1-1.6,1.6-.19,5,3.89,3.83C53,45.47,59.77,41,66.51,47.71c4.67,4.66,4.36,10.44.69,15.65,4.48,4.48,4.51,3.17,0,7.65-1,1-4-2.55-4.59-3.13C56.51,72.31,50,72,44.57,66.52a1,1,0,0,1,0-1.46l6.64-6.64c1.47-1.48,3.31,3.61,6.67,1.17,3.14-2.28,0-5.23-2.39-4.85-4.9.79-13.07,7.62-20.74-.05-4.65-4.65-4.17-11-.45-16-4-4-4-2.76.41-7.2Z"/>
                                </svg>
                                Preços
                            </a>
                        </li>

                    </main>

                    <footer className='flex flex-col justify-end mb-10'>
                        {/*--------------------------CONFIG PAGE------------------------*/}
                        <li className={`${style.modalItem} ${isActive('/config') ? style["sidebar-li-active"] : ''}`}
                        onClick={(e) => { setFocusPage('/config') }}>                        
                            {isActive('/config') && <HighlightIndicator inline={true} />}
                            <a href="/config" className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={style.modalItemIcon}>
                                    <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                                </svg>
                                Configurações
                            </a>
                        </li>

                        {/*--------------------------LOGOUT PAGE------------------------*/}
                        <li className={`${style.modalItem} ${isActive('/logout') ? style["sidebar-li-active"] : ''}`}
                        onClick={(e) => { setFocusPage('/logout') }}>
                            {isActive('/logout') && <HighlightIndicator inline={true} />}
                            <a href="/logout" className="flex items-center" >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-1 0 24 24" strokeWidth="2.5" stroke="currentColor" className={style.modalItemIcon}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                                Sair
                            </a>
                        </li>
                    </footer>
                </ol>

            </Modal>
        </>
    );

}