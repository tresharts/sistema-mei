import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import DashboardPage from "../pages/DashboardPage";
import HistoryPage from "../pages/HistoryPage";
import LoginPage from "../pages/LoginPage";
import NewTransactionPage from "../pages/NewTransactionPage";
import SettingsPage from "../pages/SettingsPage";
import { ROUTE_PATHS } from "../lib/constants";
import CadastroPage from "../pages/CadastroPage";
import RedefinirSenha from "../pages/RedefinirSenha";
import PrivateRoute from "../components/auth/PrivateRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTE_PATHS.login} replace />} />
      <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.cadastro} element={<CadastroPage />} />
      <Route path={ROUTE_PATHS.esqueciSenha} element={<RedefinirSenha />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
          <Route path={ROUTE_PATHS.history} element={<HistoryPage />} />
          <Route
            path={ROUTE_PATHS.newTransaction}
            element={<NewTransactionPage />}
          />
          <Route path={ROUTE_PATHS.settings} element={<SettingsPage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={ROUTE_PATHS.dashboard} replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
