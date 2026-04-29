import type { NavItem } from "../types/navigation";

export const ROUTE_PATHS = {
  dashboard: "/dashboard",
  login: "/login",
  esqueciSenha: "/redefinir-senha",
  cadastro: "/cadastro",
  history: "/historico",
  newTransaction: "/movimentacoes/nova",
  settings: "/ajustes",
  googleCallback: "/google-callback",
} as const;

export const APP_NAVIGATION: NavItem[] = [
  {
    label: "Inicio",
    icon: "grid",
    path: ROUTE_PATHS.dashboard,
  },
  {
    label: "Histórico",
    icon: "history",
    path: ROUTE_PATHS.history,
  },
  {
    label: "Transacao",
    icon: "add-circle",
    path: ROUTE_PATHS.newTransaction,
  },
  {
    label: "Ajustes",
    icon: "settings",
    path: ROUTE_PATHS.settings,
  },
];
