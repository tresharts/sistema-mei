import AppIcon from "../components/ui/AppIcon";
import { historyGroups } from "../data/mockData";
import { cn } from "../lib/cn";
import { formatCurrencyBRL, getSignedAmount } from "../lib/format";

function HistoryPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <header>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Historico
          </h2>
          <p className="text-sm text-on-surface-variant">
            Acompanhe cada detalhe da sua arte financeira.
          </p>
        </header>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          <button className="whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-medium text-on-primary">
            Mes atual
          </button>
          <button className="whitespace-nowrap rounded-full bg-surface-container-high px-5 py-2 text-sm font-medium text-on-surface-variant">
            Mes passado
          </button>
          <button className="whitespace-nowrap rounded-full bg-surface-container-high px-5 py-2 text-sm font-medium text-on-surface-variant">
            Personalizado
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex aspect-video flex-col justify-between rounded-2xl bg-surface-container-low p-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Fluxo
            </span>
            <div className="mt-2 flex gap-2">
              <button className="rounded-full bg-secondary-container p-2 text-on-secondary-container">
                <AppIcon className="h-4 w-4" name="arrow-up" />
              </button>
              <button className="rounded-full bg-error-container p-2 text-on-error-container">
                <AppIcon className="h-4 w-4" name="arrow-down" />
              </button>
            </div>
          </div>

          <div className="flex aspect-video flex-col justify-between rounded-2xl bg-surface-container-low p-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Esfera
            </span>
            <div className="mt-2 flex gap-2">
              <button className="rounded-full bg-surface-container-highest px-3 py-1 text-[10px] font-bold text-on-surface-variant">
                EMPRESA
              </button>
              <button className="rounded-full bg-surface-container-highest px-3 py-1 text-[10px] font-bold text-on-surface-variant">
                PESSOAL
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        {historyGroups.map((group) => (
          <div key={group.id}>
            <div className="mb-4 flex items-center gap-4">
              <span className="font-headline text-lg font-bold text-primary">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-surface-container-highest" />
              <span className="text-xs font-medium text-on-surface-variant">
                {group.dateLabel}
              </span>
            </div>

            <div className="space-y-4">
              {group.items.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center gap-4 rounded-[1.5rem] rounded-bl-lg bg-surface-container-lowest p-5 shadow-editorial"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      item.kind === "income"
                        ? "bg-secondary-container text-on-secondary-container"
                        : item.scope === "personal"
                          ? "bg-surface-container-high text-on-surface-variant"
                          : "bg-error-container text-on-error-container",
                    )}
                  >
                    <AppIcon name={item.icon} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-headline text-base font-semibold text-on-surface">
                      {item.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                          item.scope === "business"
                            ? "bg-tertiary-container text-on-tertiary-container"
                            : "bg-surface-container-highest text-on-surface-variant",
                        )}
                      >
                        {item.scopeLabel}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        "font-headline text-lg font-bold",
                        item.kind === "income"
                          ? "text-secondary"
                          : item.scope === "personal"
                            ? "text-on-surface-variant"
                            : "text-error",
                      )}
                    >
                      {item.kind === "income"
                        ? getSignedAmount(item.kind, item.amount)
                        : `- ${formatCurrencyBRL(item.amount)}`}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {item.timeLabel}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default HistoryPage;
