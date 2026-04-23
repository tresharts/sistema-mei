import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { refreshSession } from '../../lib/api';
import { ROUTE_PATHS } from '../../lib/constants';

const PrivateRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      try {
        const token = localStorage.getItem('acessToken');
        if (token) {
          setIsAuthenticated(true);
        } else {
          const refreshedToken = await refreshSession();
          setIsAuthenticated(Boolean(refreshedToken));
        }
      } catch {
        setIsAuthenticated(false); 
      } finally {
        if (mounted) setIsChecking(false);
      }
    };

  verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  if (isChecking) {
    return <div>Verificando sessão...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTE_PATHS.login} state={{from: location.pathname}} replace />;
};

export default PrivateRoute;
