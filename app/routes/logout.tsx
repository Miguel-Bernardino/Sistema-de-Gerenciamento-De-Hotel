import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '~/utils/auth';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fazer logout
      logout();
      
      // Redirecionar para login
      navigate('/login');
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      backgroundColor: 'var(--bg-color, #f5f5f5)'
    }}>
      <h2>Desconectando...</h2>
      <p style={{ color: '#666' }}>Você será redirecionado em breve.</p>
    </div>
  );
}
