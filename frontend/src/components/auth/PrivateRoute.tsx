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
      const token = localStorage.getItem('acessToken');
      if (token) {
        if (mounted) {
          setIsAuthenticated(true);
          setIsChecking(false);
        }
        return;
      }

      const refreshedToken = await refreshSession();
      if (!mounted) {
        return;
      }

      setIsAuthenticated(Boolean(refreshedToken));
      setIsChecking(false);
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  if (isChecking) {
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTE_PATHS.login} replace />;
};

export default PrivateRoute;
