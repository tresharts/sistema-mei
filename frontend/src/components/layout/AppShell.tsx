import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { APP_NAVIGATION, ROUTE_PATHS } from "../../lib/constants";
import { cn } from "../../lib/cn";
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
    ? "Histórico"
    : isSettings
      ? "Ajustes"
      : isNewTransaction
        ? "Nova Movimentação"
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

      <DesktopSidebar />

      <div className="mx-auto min-h-screen w-full max-w-md lg:max-w-none lg:pl-56">
        <TopAppBar title={title} variant={headerVariant} />

        <main
          className={cn(
            "relative z-10 mx-auto w-full px-6",
            isNewTransaction
              ? "pb-4 pt-20 lg:max-w-2xl lg:px-8 lg:pb-8 lg:pt-24"
              : "pb-32 pt-24 lg:px-8 lg:pb-8",
            isHistory ? "lg:max-w-[64rem]" : !isNewTransaction && "lg:max-w-3xl",
          )}
        >
          <Outlet />
        </main>

        {isDashboard ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 mx-auto flex w-full max-w-md justify-center lg:bottom-8 lg:left-auto lg:right-8 lg:mx-0 lg:w-auto lg:max-w-none">
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

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 border-r border-outline-variant/30 bg-surface-container-lowest px-3 py-6 lg:block">
      <div className="flex h-full flex-col">
        <Link className="flex items-center gap-3 rounded-2xl px-2 py-1" to={ROUTE_PATHS.dashboard}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
            <AppIcon name="wallet" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-headline text-base font-extrabold text-primary">
              Artesa Financeira
            </p>
            <p className="text-xs text-on-surface-variant">Sistema MEI</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {APP_NAVIGATION.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) =>
                cn(
                  "flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                )
              }
              to={item.path}
            >
              {({ isActive }) => (
                <>
                  <AppIcon className="h-5 w-5" filled={isActive} name={item.icon} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-surface-container-low p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            Atalho
          </p>
          <Link
            className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-on-primary"
            to={ROUTE_PATHS.newTransaction}
          >
            <AppIcon className="h-4 w-4" name="plus" />
            Nova movimentação
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default AppShell;
