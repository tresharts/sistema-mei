import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { refreshSession } from '../../lib/api';
import { ROUTE_PATHS } from '../../lib/constants';
import { getAccessToken } from '../../lib/session';

const PrivateRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      try {
        const token = getAccessToken();
        
        if (token) {
          if (mounted) setIsAuthenticated(true);
        } else {
          const refreshedToken = await refreshSession();
          if (mounted) {
            setIsAuthenticated(Boolean(!!refreshedToken && typeof refreshedToken === "string"));
          }
        }
      } catch {
        if (mounted) setIsAuthenticated(false);
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
