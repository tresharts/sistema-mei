import type { NavItem } from "../types/navigation";

export const ROUTE_PATHS = {
  dashboard: "/",
  login: "/login",
  history: "/historico",
  newTransaction: "/movimentacoes/nova",
  settings: "/ajustes",
} as const;

export const APP_NAVIGATION: NavItem[] = [
  {
    label: "Inicio",
    icon: "grid",
    path: ROUTE_PATHS.dashboard,
  },
  {
    label: "Historico",
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
