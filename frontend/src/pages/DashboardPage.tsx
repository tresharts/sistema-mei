import { Link } from "react-router-dom";
import AppIcon from "../components/ui/AppIcon";
import {
  dashboardHighlights,
  recentTransactions,
  weeklyFlowChart,
} from "../data/mockData";
import { ROUTE_PATHS } from "../lib/constants";
import { formatCurrencyBRL, getSignedAmount } from "../lib/format";

function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="relative">
        <div className="overflow-hidden rounded-2xl rounded-tr-none bg-primary p-8 text-on-primary shadow-xl shadow-primary/10">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary-container/20 blur-2xl" />
          <p className="font-label text-sm opacity-90">Quanto sobrou no mes</p>
          <h2 className="mt-1 font-headline text-4xl font-extrabold tracking-tight">
            {formatCurrencyBRL(4280)}
          </h2>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
            <AppIcon className="h-4 w-4" name="trend-up" />
            <span>12% a mais que no mes passado</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        {dashboardHighlights.map((item) => (
          <div
            key={item.label}
            className={
              item.tone === "secondary"
                ? "flex aspect-square flex-col justify-between rounded-2xl bg-secondary-container p-5"
                : item.tone === "tertiary"
                  ? "flex aspect-square flex-col justify-between rounded-2xl border-b-4 border-tertiary bg-surface-container-high p-5"
                  : "rounded-2xl bg-surface-container-lowest p-5 shadow-sm"
            }
          >
            <AppIcon
              className={
                item.tone === "secondary"
                  ? "h-8 w-8 text-on-secondary-container"
                  : item.tone === "tertiary"
                    ? "h-8 w-8 text-tertiary"
                    : item.tone === "danger"
                      ? "h-8 w-8 text-error"
                      : "h-8 w-8 text-secondary"
              }
              name={item.icon}
            />
            <div>
              <p className="text-xs text-on-surface-variant">{item.label}</p>
              <p
                className={
                  item.tone === "secondary"
                    ? "font-headline text-xl font-bold text-on-secondary-container"
                    : item.tone === "danger"
                      ? "font-headline text-lg font-bold text-error"
                      : item.tone === "tertiary"
                        ? "font-headline text-xl font-bold text-on-surface"
                        : "font-headline text-lg font-bold text-secondary"
                }
              >
                {item.label === "Vencimento do DAS"
                  ? "20/04"
                  : formatCurrencyBRL(item.value)}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-on-surface-variant">
                {item.helperText}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl bg-surface-container-low p-6">
        <div className="flex items-end justify-between gap-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Entradas vs Saidas
          </h3>
          <span className="text-xs text-on-surface-variant">Ultimos 7 dias</span>
        </div>

        <div className="flex h-32 items-end justify-between gap-2 px-2">
          {weeklyFlowChart.map((bar) => (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm bg-secondary/20"
                style={{ height: `${bar.expenseHeight}px` }}
              />
              <div
                className="w-full rounded-t-sm bg-secondary"
                style={{ height: `${bar.incomeHeight}px` }}
              />
              <span className="mt-1 text-[8px] opacity-40">{bar.label}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-secondary/20" />
            Saidas
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-secondary" />
            Entradas
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Ultimas movimentacoes
          </h3>
          <Link className="text-sm font-medium text-primary" to={ROUTE_PATHS.history}>
            Ver tudo
          </Link>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={
                    transaction.kind === "income"
                      ? "flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-secondary"
                      : "flex h-12 w-12 items-center justify-center rounded-xl bg-error-container/20 text-error"
                  }
                >
                  <AppIcon name={transaction.icon} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    {transaction.title}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {transaction.partner}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={
                    transaction.kind === "income"
                      ? "font-bold text-secondary"
                      : "font-bold text-error"
                  }
                >
                  {getSignedAmount(transaction.kind, transaction.amount)}
                </p>
                <p className="text-[10px] text-on-surface-variant">
                  {transaction.timeLabel}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
