import { Navigate, Outlet } from 'react-router-dom';
import { ROUTE_PATHS } from '../../lib/constants';

const PrivateRoute = () => {
  const token = localStorage.getItem('acessToken');

  return token ? <Outlet /> : <Navigate to={ROUTE_PATHS.login} replace />;
};

export default PrivateRoute;