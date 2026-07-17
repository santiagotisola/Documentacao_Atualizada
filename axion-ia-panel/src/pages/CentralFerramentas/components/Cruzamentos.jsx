import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Cruzamentos -- Redirecionador para AxCross Manager
 * Esta aba foi consolidada no AxCross Manager unificado.
 */
const Cruzamentos = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/axcross-manager', { replace: true }); }, [navigate]);
  return (
    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
      Redirecionando para o AxCross Manager...
    </div>
  );
};

export default Cruzamentos;
