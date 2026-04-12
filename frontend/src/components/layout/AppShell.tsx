import { Link, Outlet, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../lib/constants";
import AppIcon from "../ui/AppIcon";
import BottomNav from "./BottomNav";
import TopAppBar from "./TopAppBar";

function AppShell() {
  const { pathname } = useLocation();

  const isDashboard = pathname === ROUTE_PATHS.dashboard;
  const isHistory = pathname === ROUTE_PATHS.history;
  const isSettings = pathname === ROUTE_PATHS.settings;
  const isNewTransaction = pathname === ROUTE_PATHS.newTransaction;

  const title = isHistory
    ? "Historico"
    : isSettings
      ? "Ajustes"
      : isNewTransaction
        ? "Nova Movimentacao"
        : "Artesa Financeira";

  const headerVariant: "brand" | "page" | "modal" = isDashboard
    ? "brand"
    : isNewTransaction
      ? "modal"
      : "page";

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-x-0 top-24 z-0 mx-auto h-40 w-40 max-w-md -translate-x-28 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 z-0 h-48 w-48 rounded-full bg-tertiary-container/10 blur-3xl" />

      <div className="mx-auto min-h-screen w-full max-w-md">
        <TopAppBar title={title} variant={headerVariant} />

        <main
          className={
            isNewTransaction
              ? "relative z-10 px-6 pb-8 pt-[5.5rem]"
              : "relative z-10 px-6 pb-32 pt-24"
          }
        >
          <Outlet />
        </main>

        {isDashboard ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 mx-auto flex w-full max-w-md justify-center">
            <Link
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-fab transition hover:scale-[1.02] active:scale-95"
              to={ROUTE_PATHS.newTransaction}
            >
              <AppIcon className="h-7 w-7" name="plus" />
            </Link>
          </div>
        ) : null}

        {isNewTransaction ? null : <BottomNav />}
      </div>
    </div>
  );
}

export default AppShell;
