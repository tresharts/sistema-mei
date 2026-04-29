import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppIcon from "../components/ui/AppIcon";
import { ROUTE_PATHS } from "../lib/constants";
import { formatCurrencyBRL, formatShortDate, getSignedAmount } from "../lib/format";
import { dashboardService } from "../services/dashboardService";
import { transactionService } from "../services/transactionsServices";
import type {
  DashboardAlert,
  DashboardSummary,
  OverdueAccount,
  TransactionItem,
} from "../types/finance";

const emptySummary: DashboardSummary = {
  saldoAtual: 0,
  lucroEmpresarialMes: 0,
  totalAReceber: 0,
  totalAPagar: 0,
  vendasHoje: 0,
  quantidadeContasAReceberAtrasadas: 0,
  alertas: [],
};

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [overdueAccounts, setOverdueAccounts] = useState<OverdueAccount[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let shouldUpdate = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [summaryData, overdueData, recentData] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getOverdueAccounts(5),
          transactionService.getAllTransactions({
            page: 0,
            size: 3,
            sort: "data,desc",
          }),
        ]);

        if (!shouldUpdate) {
          return;
        }

        setSummary(summaryData);
        setOverdueAccounts(overdueData);
        setRecentTransactions(recentData.transactions);
      } catch {
        if (shouldUpdate) {
          setErrorMessage("Não foi possível carregar o dashboard agora.");
        }
      } finally {
        if (shouldUpdate) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-primary p-6 text-on-primary shadow-xl shadow-primary/10 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium opacity-90">Saldo atual</p>
            <h2 className="mt-2 break-words font-headline text-4xl font-extrabold tracking-tight">
              {isLoading ? "..." : formatCurrencyBRL(summary.saldoAtual)}
            </h2>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <AppIcon className="h-5 w-5" name="wallet" />
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-white/10 p-3">
          <p className="text-xs opacity-80">Lucro empresarial do mes</p>
          <p className="mt-1 font-headline text-xl font-bold">
            {isLoading ? "..." : formatCurrencyBRL(summary.lucroEmpresarialMes)}
          </p>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-xl border border-error/20 bg-error-container/10 p-4 text-sm text-error">
          {errorMessage}
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <MetricCard
          icon="sparkles"
          label="Entrou hoje"
          value={summary.vendasHoje}
          helperText="Vendas recebidas hoje"
          tone="secondary"
          isLoading={isLoading}
        />
        <MetricCard
          icon="wallet"
          label="A receber"
          value={summary.totalAReceber}
          helperText="Valores pendentes"
          tone="neutral"
          isLoading={isLoading}
        />
        <MetricCard
          icon="receipt"
          label="A pagar"
          value={summary.totalAPagar}
          helperText="Contas pendentes"
          tone="danger"
          isLoading={isLoading}
        />
        <MetricCard
          icon="bell"
          label="Atrasadas"
          value={summary.quantidadeContasAReceberAtrasadas}
          helperText="Contas vencidas"
          tone="tertiary"
          isCurrency={false}
          isLoading={isLoading}
        />
      </section>

      <AlertSection alerts={summary.alertas} isLoading={isLoading} />

      <div className="grid gap-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Contas atrasadas
          </h3>
          <Link className="text-sm font-medium text-primary" to={ROUTE_PATHS.history}>
            Ver histórico
          </Link>
        </div>

        {isLoading ? (
          <DashboardSkeleton rows={2} />
        ) : overdueAccounts.length > 0 ? (
          <div className="space-y-3">
            {overdueAccounts.map((account) => (
              <article
                key={account.id}
                className="rounded-xl border border-error/15 bg-error-container/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-on-surface">
                      {account.descricao}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {account.categoriaNome} • venceu em {formatShortDate(account.dataVencimento)}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-bold text-error">
                    {formatCurrencyBRL(account.valor)}
                  </p>
                </div>
                <p className="mt-2 text-xs font-medium text-error">
                  {account.diasAtraso === 1
                    ? "1 dia de atraso"
                    : `${account.diasAtraso} dias de atraso`}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            Nenhuma conta a receber atrasada.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Últimas movimentações
          </h3>
          <Link className="text-sm font-medium text-primary" to={ROUTE_PATHS.history}>
            Ver tudo
          </Link>
        </div>

        {isLoading ? (
          <DashboardSkeleton rows={3} />
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
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
                  <p className="truncate text-sm font-bold text-on-surface">
                    {transaction.title}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {transaction.category} • {formatShortDate(transaction.date)}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={
                    transaction.kind === "income"
                      ? "text-sm font-bold text-secondary"
                      : "text-sm font-bold text-error"
                  }
                >
                  {getSignedAmount(transaction.kind, transaction.amount)}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {transaction.statusLabel}
                </p>
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            Nenhuma movimentação registrada ainda.
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

type MetricCardProps = {
  icon: "sparkles" | "wallet" | "receipt" | "bell";
  label: string;
  value: number;
  helperText: string;
  tone: "secondary" | "neutral" | "danger" | "tertiary";
  isCurrency?: boolean;
  isLoading: boolean;
};

function MetricCard({
  helperText,
  icon,
  isCurrency = true,
  isLoading,
  label,
  tone,
  value,
}: MetricCardProps) {
  const toneClasses = {
    secondary: "bg-secondary-container/80 text-on-secondary-container",
    neutral: "bg-surface-container-lowest text-secondary",
    danger: "bg-surface-container-lowest text-error",
    tertiary: "bg-surface-container-high text-tertiary",
  };

  return (
    <article className="flex min-h-36 flex-col justify-between rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <AppIcon className="h-5 w-5" name={icon} />
      </div>

      <div>
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="mt-1 break-words font-headline text-lg font-bold text-on-surface">
          {isLoading ? "..." : isCurrency ? formatCurrencyBRL(value) : value}
        </p>
        <p className="mt-1 text-xs leading-4 text-on-surface-variant">{helperText}</p>
      </div>
    </article>
  );
}

function AlertSection({
  alerts,
  isLoading,
}: {
  alerts: DashboardAlert[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <DashboardSkeleton rows={1} />;
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="font-headline text-lg font-bold text-on-surface">Alertas</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <article
            key={`${alert.tipo}-${alert.dataReferencia ?? alert.quantidade ?? alert.titulo}`}
            className={
              alert.severidade === "DANGER"
                ? "rounded-xl border border-error/20 bg-error-container/10 p-4"
                : "rounded-xl border border-tertiary/20 bg-tertiary-container/20 p-4"
            }
          >
            <div className="flex gap-3">
              <div
                className={
                  alert.severidade === "DANGER"
                    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error-container/40 text-error"
                    : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tertiary-container text-tertiary"
                }
              >
                <AppIcon className="h-5 w-5" name="bell" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{alert.titulo}</p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                  {alert.mensagem}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-xl bg-surface-container-low"
        />
      ))}
    </div>
  );
}

export default DashboardPage;
