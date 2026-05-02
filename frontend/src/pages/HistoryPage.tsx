import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import TransactionFilters, {
  type TransactionFiltersData,
} from "../components/transactions/TransactionFilters";
import AppIcon from "../components/ui/AppIcon";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { formatCurrencyBRL, formatDateBRL, formatShortDate } from "../lib/format";
import { categoriesService } from "../services/categoriesService";
import {
  transactionService,
  type UpdateTransactionPayload,
} from "../services/transactionsServices";
import type {
  ApiTransactionKind,
  ApiTransactionScope,
  ApiTransactionStatus,
  HistoryGroup,
  TransactionCategory,
  TransactionItem,
  TransactionKind,
  TransactionStatus,
} from "../types/finance";

const MAX_TRANSACTION_AMOUNT = 1_000_000;

function kindToApi(kind: TransactionKind): ApiTransactionKind {
  return kind === "income" ? "RECEITA" : "DESPESA";
}

function scopeToApi(scope: TransactionItem["scope"]): ApiTransactionScope {
  return scope === "business" ? "EMPRESARIAL" : "PESSOAL";
}

function statusToApi(kind: TransactionKind, status: "settled" | "pending"): ApiTransactionStatus {
  if (kind === "income") {
    return status === "settled" ? "RECEBIDO" : "A_RECEBER";
  }

  return status === "settled" ? "PAGO" : "A_PAGAR";
}

function validateAmount(value: string) {
  const numericValue = Number(value);

  if (!value || !Number.isFinite(numericValue)) {
    return "Informe um valor válido.";
  }

  if (numericValue <= 0) {
    return "Informe um valor maior que zero.";
  }

  if (numericValue > MAX_TRANSACTION_AMOUNT) {
    return "O valor máximo por movimentação é R$ 1.000.000,00.";
  }

  return "";
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFiltersData>({});
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);

  useEffect(() => {
    categoriesService
      .getAllCategories()
      .then(setCategories)
      .catch(() => toast.error("Erro ao carregar categorias"));
  }, []);

  useEffect(() => {
    let shouldUpdate = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const { transactions: data } = await transactionService.getAllTransactions(filters);

        if (shouldUpdate) {
          setTransactions(data);
        }
      } catch {
        if (shouldUpdate) {
          toast.error("Erro ao sincronizar com o servidor");
        }
      } finally {
        if (shouldUpdate) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      shouldUpdate = false;
    };
  }, [filters]);

  const handleStatusChange = async (
    id: string,
    currentStatus: TransactionStatus,
    kind: TransactionKind,
  ) => {
    if (currentStatus !== "pending") {
      return;
    }

    try {
      const apiStatus = kind === "income" ? "RECEBIDO" : "PAGO";
      const updatedItem = await transactionService.updateStatus(id, apiStatus);

      setTransactions((current) =>
        current.map((transaction) => (transaction.id === id ? updatedItem : transaction)),
      );
      toast.success("Status atualizado.");
    } catch {
      toast.error("Erro ao atualizar no servidor");
    }
  };

  const handleSaveEdit = async (id: string, updatedData: UpdateTransactionPayload) => {
    try {
      const updatedItem = await transactionService.updateTransaction(id, updatedData);

      setTransactions((current) =>
        current.map((transaction) => (transaction.id === id ? updatedItem : transaction)),
      );
      toast.success("Movimentação atualizada.");
      setEditingTransaction(null);
    } catch {
      toast.error("Erro ao salvar alterações.");
    }
  };

  const handleDelete = async (id: string) => {
    toast("Deseja realmente excluir?", {
      description: "Esta ação não pode ser desfeita.",
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await transactionService.deleteTransaction(id);
            setTransactions((current) =>
              current.filter((transaction) => transaction.id !== id),
            );
            toast.success("Movimentação removida.");
            setEditingTransaction(null);
          } catch {
            toast.error("Erro ao excluir no servidor.");
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => undefined },
    });
  };

  const groupedTransactions = useMemo((): HistoryGroup[] => {
    const groups: Record<string, TransactionItem[]> = {};

    transactions.forEach((item) => {
      if (!groups[item.date]) {
        groups[item.date] = [];
      }

      groups[item.date].push(item);
    });

    const today = new Date().toISOString().split("T")[0];

    return Object.entries(groups).map(([date, items]) => ({
      id: date,
      label: date === today ? "Hoje" : formatShortDate(date),
      dateLabel: formatShortDate(date),
      items,
    }));
  }, [transactions]);

  return (
    <div className="mx-auto w-full pb-24 lg:pb-0">
      <header className="pb-6">
        <h1 className="font-headline text-3xl font-bold text-on-surface">Histórico</h1>
        <p className="text-sm text-on-surface-variant">Suas movimentações financeiras</p>
      </header>

      <div className="mb-6">
        <TransactionFilters categories={categories} onFilterChange={setFilters} />
      </div>

      <main className="space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : groupedTransactions.length > 0 ? (
          groupedTransactions.map((group) => (
            <section key={group.id} className="space-y-3">
              <h3 className="px-2 text-xs font-bold uppercase text-outline">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <TransactionCard
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingTransaction(item)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="py-20 text-center">
            <AppIcon className="mx-auto mb-4 h-12 w-12 text-outline/30" name="box" />
            <p className="text-on-surface-variant">Nenhuma movimentação encontrada</p>
          </div>
        )}
      </main>

      {editingTransaction ? (
        <EditTransactionModal
          categories={categories}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onDelete={handleDelete}
          onSave={handleSaveEdit}
        />
      ) : null}
    </div>
  );
}

function TransactionCard({
  item,
  onEdit,
  onStatusChange,
}: {
  item: TransactionItem;
  onEdit: () => void;
  onStatusChange: (
    id: string,
    currentStatus: TransactionStatus,
    kind: TransactionKind,
  ) => void;
}) {
  const isIncome = item.kind === "income";
  const isPending = item.status === "pending";

  return (
    <article className="group relative flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 transition hover:bg-surface-container-high">
      <button
        aria-label={`Editar movimentação ${item.title}`}
        className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg opacity-100 transition hover:bg-primary/90 sm:opacity-0 sm:group-hover:opacity-100"
        onClick={onEdit}
        type="button"
      >
        <AppIcon className="h-4 w-4" name="edit" />
      </button>

      <div className="flex min-w-0 items-center gap-4">
        <div
          className={
            isIncome
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-secondary"
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-error-container/35 text-error"
          }
        >
          <AppIcon className="h-6 w-6" name={item.icon} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold leading-tight text-on-surface">{item.title}</p>
          <p className="truncate text-xs text-on-surface-variant">
            {item.category} • {item.scopeLabel}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={
            isIncome
              ? "text-right text-lg font-bold text-secondary"
              : "text-right text-lg font-bold text-error"
          }
        >
          {isIncome ? "+" : "-"} {formatCurrencyBRL(item.amount)}
        </span>
        <button
          className={
            isPending
              ? "rounded-full bg-tertiary-container px-2 py-0.5 text-[10px] font-bold text-on-tertiary-container"
              : "rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold text-on-surface-variant"
          }
          disabled={!isPending}
          onClick={() => onStatusChange(item.id, item.status, item.kind)}
          type="button"
        >
          {item.statusLabel}
        </button>
      </div>
    </article>
  );
}

function EditTransactionModal({
  categories,
  onClose,
  onDelete,
  onSave,
  transaction,
}: {
  categories: TransactionCategory[];
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onSave: (id: string, updatedData: UpdateTransactionPayload) => Promise<void>;
  transaction: TransactionItem;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [amountError, setAmountError] = useState("");
  const [date, setDate] = useState(transaction.date);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [status, setStatus] = useState<"settled" | "pending">(
    transaction.status === "settled" ? "settled" : "pending",
  );
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const apiKind = kindToApi(transaction.kind);
  const apiScope = scopeToApi(transaction.scope);

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.tipo === apiKind && category.classificacao === apiScope,
      ),
    [apiKind, apiScope, categories],
  );

  const selectedCategory = useMemo(
    () => availableCategories.find((category) => category.id === categoryId),
    [availableCategories, categoryId],
  );

  useEffect(() => {
    if (categoryId && !selectedCategory) {
      setCategoryId("");
    }
  }, [categoryId, selectedCategory]);

  const handleAmountChange = (value: string) => {
    const sanitizedValue = value.replace("-", "");
    setAmount(sanitizedValue);
    setAmountError(sanitizedValue ? validateAmount(sanitizedValue) : "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateAmount(amount);
    if (validationError) {
      setAmountError(validationError);
      return;
    }

    if (!categoryId) {
      toast.error("Selecione uma categoria.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(transaction.id, {
        valor: Number(amount),
        descricao: title.trim(),
        data: date,
        dataVencimento: status === "pending" ? transaction.dueDate ?? date : null,
        tipo: apiKind,
        classificacao: apiScope,
        status: statusToApi(transaction.kind, status),
        categoriaId: categoryId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-panel max-w-md" onSubmit={handleSubmit}>
        <header className="flex items-center justify-between gap-4 border-b border-outline-variant/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AppIcon name="edit" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Editar movimentação
              </h2>
              <p className="text-xs text-on-surface-variant">
                {transaction.scopeLabel} • {transaction.kind === "income" ? "Receita" : "Despesa"}
              </p>
            </div>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low"
            onClick={onClose}
            type="button"
          >
            <AppIcon name="close" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <Input
            label="Descrição"
            maxLength={160}
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              error={amountError}
              label="Valor"
              max={MAX_TRANSACTION_AMOUNT}
              min="0.01"
              required
              step="0.01"
              type="number"
              value={amount}
              onKeyDown={(event) => {
                if (["-", "+", "e", "E"].includes(event.key)) {
                  event.preventDefault();
                }
              }}
              onChange={(event) => handleAmountChange(event.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block px-1 text-xs font-medium text-on-surface-variant sm:text-sm">
                Data
              </label>
              <div className="relative">
                <button
                  className="flex min-h-14 w-full items-center gap-2 rounded-xl bg-surface-container-low px-4 text-left text-sm transition hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/15"
                  onClick={() => {
                    dateInputRef.current?.focus();
                    (
                      dateInputRef.current as HTMLInputElement & {
                        showPicker?: () => void;
                      } | null
                    )?.showPicker?.();
                  }}
                  type="button"
                >
                  <AppIcon className="h-4 w-4 shrink-0 text-outline" name="calendar" />
                  <span className="flex-1 text-center font-medium text-on-surface">
                    {formatDateBRL(date)}
                  </span>
                  <span aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
                <input
                  ref={dateInputRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute h-px w-px opacity-0"
                  required
                  tabIndex={-1}
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block px-1 text-xs font-medium text-on-surface-variant sm:text-sm">
              Categoria
            </label>
            <button
              className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-surface-container-low px-4 text-left transition hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/15"
              onClick={() => setIsCategoryPickerOpen(true)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-2">
                <AppIcon className="h-4 w-4 shrink-0 text-outline" name="tag" />
                <span
                  className={
                    selectedCategory
                      ? "truncate text-sm font-medium text-on-surface"
                      : "truncate text-sm text-on-surface-variant"
                  }
                >
                  {selectedCategory?.name ?? "Selecione..."}
                </span>
              </span>
              <AppIcon className="h-4 w-4 shrink-0 text-outline" name="arrow-down" />
            </button>
          </div>

          <div className="space-y-2 rounded-2xl border border-surface-container-high p-3">
            <label className="block px-1 text-xs font-medium text-on-surface-variant sm:text-sm">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={
                  status === "settled"
                    ? "flex h-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary ring-2 ring-primary/25"
                    : "flex h-11 items-center justify-center rounded-xl bg-surface-container-low text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                }
                onClick={() => setStatus("settled")}
                type="button"
              >
                {transaction.kind === "income" ? "Recebido" : "Pago"}
              </button>
              <button
                className={
                  status === "pending"
                    ? "flex h-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary ring-2 ring-primary/25"
                    : "flex h-11 items-center justify-center rounded-xl bg-surface-container-low text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                }
                onClick={() => setStatus("pending")}
                type="button"
              >
                {transaction.kind === "income" ? "A receber" : "A pagar"}
              </button>
            </div>
          </div>

          <button
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-error/15 bg-error-container/25 px-4 text-sm font-bold text-error transition hover:bg-error-container/40"
            onClick={() => onDelete(transaction.id)}
            type="button"
          >
            <AppIcon className="h-4 w-4" name="trash" />
            Excluir movimentação
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-surface-container-low px-5 py-4">
          <Button fullWidth variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button fullWidth isLoading={isSubmitting} type="submit">
            Salvar
          </Button>
        </div>
      </form>

      {isCategoryPickerOpen ? (
        <EditCategoryPickerModal
          categories={availableCategories}
          selectedCategoryId={categoryId}
          onClose={() => setIsCategoryPickerOpen(false)}
          onSelect={(category) => {
            setCategoryId(category.id);
            setIsCategoryPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function EditCategoryPickerModal({
  categories,
  onClose,
  onSelect,
  selectedCategoryId,
}: {
  categories: TransactionCategory[];
  onClose: () => void;
  onSelect: (category: TransactionCategory) => void;
  selectedCategoryId: string;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AppIcon name="tag" />
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Categoria
            </h2>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low"
            onClick={onClose}
            type="button"
          >
            <AppIcon name="close" />
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId;
              const isIncome = category.tipo === "RECEITA";

              return (
                <button
                  key={category.id}
                  className={
                    isSelected
                      ? "flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-primary/10 p-4 text-left ring-2 ring-primary/30"
                      : "flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4 text-left transition hover:bg-surface-container-high"
                  }
                  onClick={() => onSelect(category)}
                  type="button"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={
                        isIncome
                          ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-secondary"
                          : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error-container/40 text-error"
                      }
                    >
                      <AppIcon className="h-4 w-4" name={category.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-on-surface">
                        {category.name}
                      </span>
                      <span className="block text-xs text-on-surface-variant">
                        {isIncome ? "Receita" : "Despesa"}
                      </span>
                    </span>
                  </span>
                  {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-5 text-sm text-on-surface-variant">
            Nenhuma categoria disponível para esta movimentação.
          </div>
        )}
      </div>
    </div>
  );
}
