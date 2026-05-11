import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateBRL } from "../../lib/format";
import { dashboardService } from "../../services/dashboardService";
import type { DashboardAlert } from "../../types/finance";
import favicon from "../../assets/favicon.png";
import AppIcon from "../ui/AppIcon";

type TopAppBarVariant = "brand" | "page" | "modal";

type TopAppBarProps = {
  title: string;
  variant: TopAppBarVariant;
};

function TopAppBar({ title, variant }: TopAppBarProps) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const alertCount = alerts.length;

  const loadAlerts = async () => {
    try {
      setIsLoadingNotifications(true);
      setNotificationsError("");
      const summary = await dashboardService.getSummary();
      setAlerts(summary.alertas ?? []);
    } catch {
      setNotificationsError("Não foi possível carregar alertas agora.");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isNotificationsOpen]);

  if (variant === "modal") {
    return (
      <header className="fixed inset-x-0 top-0 z-50 mx-auto h-16 w-full max-w-md bg-background/80 px-6 backdrop-blur-xl lg:left-56 lg:mx-0 lg:w-auto lg:max-w-none lg:px-6">
        <div className="flex h-full items-center gap-3">
          <button
            aria-label="Voltar"
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low"
            onClick={() => navigate(-1)}
            type="button"
          >
            <AppIcon name="close" />
          </button>

          <h1 className="truncate font-headline text-lg font-extrabold tracking-tight text-primary">
            {title}
          </h1>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 mx-auto h-16 w-full max-w-md bg-background/80 px-6 backdrop-blur-xl shadow-sm shadow-on-surface/5 lg:left-56 lg:mx-0 lg:w-auto lg:max-w-none lg:px-6">
      <div className="flex h-full w-full items-center pr-12">
        <div className="flex min-w-0 flex-1 items-center">
          <img
            alt="BoraMEI"
            className="mr-2 h-7 w-7 shrink-0 object-contain lg:hidden"
            src={favicon}
          />
          <div className="min-w-0">
            <p className="mt-2 truncate font-headline text-lg font-extrabold tracking-tight text-primary lg:mt-0">
              {title}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={notificationsRef}
        className="absolute right-6 top-1/2 -translate-y-1/2"
      >
        <button
          aria-label="Notificações"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-low text-primary transition hover:bg-primary/10"
          onClick={() => {
            setIsNotificationsOpen((current) => {
              const next = !current;
              if (next) {
                void loadAlerts();
              }
              return next;
            });
          }}
          type="button"
        >
          <AppIcon name="bell" />
          {alertCount > 0 ? (
            <span className="absolute ml-5 mt-[-1.6rem] flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-primary">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          ) : null}
        </button>

        {isNotificationsOpen ? (
          <div className="absolute right-0 top-[3.2rem] z-[75] w-[min(22rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_16px_40px_rgba(52,50,47,0.16)] transition-all duration-200 ease-out animate-[modal-panel-in_180ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
            <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-3">
              <p className="text-sm font-bold text-on-surface">Notificações</p>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low"
                onClick={() => void loadAlerts()}
                type="button"
              >
                <AppIcon className={isLoadingNotifications ? "animate-spin" : ""} name="history" />
              </button>
            </div>

            <div className="max-h-[22rem] overflow-y-auto p-2">
              {isLoadingNotifications ? (
                <p className="p-3 text-sm text-on-surface-variant">Carregando alertas...</p>
              ) : notificationsError ? (
                <p className="p-3 text-sm text-error">{notificationsError}</p>
              ) : alerts.length === 0 ? (
                <p className="p-3 text-sm text-on-surface-variant">Nenhum alerta no momento.</p>
              ) : (
                alerts.map((alert) => (
                  <article
                    key={`${alert.tipo}-${alert.dataReferencia ?? "sem-data"}`}
                    className="mb-2 rounded-xl bg-surface-container-low p-3 last:mb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-on-surface">{alert.titulo}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{alert.mensagem}</p>
                      </div>
                      <span
                        className={
                          alert.severidade === "DANGER"
                            ? "h-2.5 w-2.5 shrink-0 rounded-full bg-error"
                            : alert.severidade === "WARNING"
                              ? "h-2.5 w-2.5 shrink-0 rounded-full bg-tertiary"
                              : "h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                        }
                      />
                    </div>
                    {alert.dataReferencia ? (
                      <p className="mt-2 text-[11px] text-on-surface-variant">
                        Referência: {formatDateBRL(alert.dataReferencia)}
                      </p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default TopAppBar;
