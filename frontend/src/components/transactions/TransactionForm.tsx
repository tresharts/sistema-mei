import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import AppIcon from "../ui/AppIcon";
import Input from "../ui/Input";
import { formatDateBRL } from "../../lib/format";
import type { TransactionCategory } from "../../types/finance";

export interface TransactionFormData {
  kind: "income" | "expense";
  scope: "business" | "personal";
  amount: string;
  description: string;
  date: string;
  categoryId: string;
  status: "settled" | "pending"; // Pago/Recebido vs A Pagar/A Receber
  dueDate?: string;
}

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>;
  categories: TransactionCategory[];
  onSubmit: (data: TransactionFormData) => void;
  isLoading?: boolean;
}

export default function TransactionForm({ initialData, categories, onSubmit, isLoading }: TransactionFormProps) {

  const [kind, setKind] = useState<"income" | "expense">(initialData?.kind || "income");
  const [scope, setScope] = useState<"business" | "personal">(initialData?.scope || "business");
  const [status, setStatus] = useState<"settled" | "pending">(initialData?.status || "settled");
  
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [showCategoryError, setShowCategoryError] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);

  const settledLabel = kind === "income" ? "Já Recebido" : "Já Pago";
  const pendingLabel = kind === "income" ? "A Receber" : "A Pagar";
  const selectedCategoryKind = kind === "income" ? "RECEITA" : "DESPESA";

  const availableCategories = useMemo(
    () => categories.filter((category) => category.tipo === selectedCategoryKind),
    [categories, selectedCategoryKind]
  );

  const selectedCategory = useMemo(
    () => availableCategories.find((category) => category.id === categoryId),
    [availableCategories, categoryId]
  );

  const formattedDate = useMemo(() => formatDateBRL(date), [date]);
  const formattedDueDate = useMemo(() => formatDateBRL(dueDate), [dueDate]);

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    const selectedCategoryStillAvailable = availableCategories.some(
      (category) => category.id === categoryId
    );

    if (!selectedCategoryStillAvailable) {
      setCategoryId("");
    }
  }, [availableCategories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      setShowCategoryError(true);
      return;
    }

    onSubmit({ 
        kind, 
        scope, 
        amount, 
        description, 
        date, 
        categoryId, 
        status, 
        dueDate: status === "pending" ? dueDate : undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-10">
      <div className="flex rounded-xl bg-surface-container-high p-1 sm:p-1.5">
        <button
          className={
            kind === "income"
              ? "flex-1 rounded-lg bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container shadow-sm sm:py-3"
              : "flex-1 rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-highest sm:py-3"
          }
          onClick={() => setKind("income")}
          type="button"
        >
          Recebidos
        </button>
        <button
          className={
            kind === "expense"
              ? "flex-1 rounded-lg bg-error-container/25 px-4 py-2 text-sm font-semibold text-error shadow-sm sm:py-3"
              : "flex-1 rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-highest sm:py-3"
          }
          onClick={() => setKind("expense")}
          type="button"
        >
          Gastos
        </button>
      </div>

      <div className="text-center">
        <label className="mb-1 block text-xs font-medium text-on-surface-variant sm:mb-2 sm:text-sm">
          {kind === "income" ? "Quanto entrou?" : "Quanto saiu?"}
        </label>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-headline text-xl font-bold text-primary sm:text-2xl">R$</span>
          <input
            className="w-full bg-transparent text-center font-headline text-4xl font-extrabold text-on-surface focus:outline-none placeholder-on-surface-variant/30 sm:text-5xl"
            placeholder="0,00"
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mx-auto mt-1 h-0.5 w-24 rounded-full bg-primary/20 sm:mt-2 sm:w-32" />
      </div>

      <div className="space-y-4 sm:space-y-8">
        <div className="space-y-1.5 sm:space-y-2">
          <label className="block px-1 text-xs font-medium text-on-surface-variant sm:text-sm">
            Descrição
          </label>
          <div className="rounded-xl bg-surface-container-low p-3 transition focus-within:bg-surface-container-highest sm:p-4">
            <Input
              className="min-h-0 bg-transparent p-0 focus:bg-transparent focus:ring-0"
              placeholder= {kind === "income" ? "Ex: Venda de produto X" : "Ex: Compra de material Y"}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block px-1 text-xs font-medium text-on-surface-variant sm:text-sm">
              Data
            </label>
            <div className="relative">
              <button
                className="flex min-h-11 w-full items-center gap-2 rounded-xl bg-surface-container-low p-3 text-left transition hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/15 sm:min-h-14 sm:p-4"
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
                <span className="flex-1 text-center text-sm font-medium text-on-surface">
                  {formattedDate}
                </span>
                <span aria-hidden="true" className="h-4 w-4 shrink-0" />
              </button>
              <input
                ref={dateInputRef}
                aria-hidden="true"
                className="pointer-events-none absolute h-px w-px opacity-0"
                tabIndex={-1}
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block px-1 text-xs font-medium text-on-surface-variant sm:text-sm">
              Categoria
            </label>
            <div className="space-y-1.5">
              <button
                className={
                  showCategoryError
                    ? "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-error-container/10 p-3 text-left ring-2 ring-error/40 sm:min-h-14 sm:p-4"
                    : "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3 text-left transition hover:bg-surface-container-high sm:min-h-14 sm:p-4"
                }
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

              {showCategoryError ? (
                <p className="px-1 text-xs font-medium text-error">
                  Selecione uma categoria.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        
        <div className="space-y-2 rounded-2xl border border-surface-container-high p-3 sm:space-y-3 sm:p-4">
          <label className="block px-1 text-xs font-medium text-on-surface-variant sm:text-sm">
            Status do pagamento
          </label>
          <div className="flex gap-2 sm:gap-3">
            <button
              className={
                status === "settled"
                  ? "flex h-10 flex-1 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary sm:h-12"
                  : "flex h-10 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface transition hover:bg-surface-container-high sm:h-12"
              }
              onClick={() => setStatus("settled")}
              type="button"
            >
              <span className="text-sm font-semibold">{settledLabel}</span>
            </button>
            <button
              className={
                status === "pending"
                  ? "flex h-10 flex-1 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary sm:h-12"
                  : "flex h-10 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface transition hover:bg-surface-container-high sm:h-12"
              }
              onClick={() => setStatus("pending")}
              type="button"
            >
              <span className="text-sm font-semibold">{pendingLabel}</span>
            </button> 
          </div>

          
          {status === "pending" && (
             <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 sm:mt-4 sm:space-y-2">
               <label className="block px-1 text-xs font-medium sm:text-sm">
                 Data de Vencimento
               </label>
               <div className="relative">
                 <button
                   className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-error/60 bg-error-container/5 p-3 text-left transition hover:bg-error-container/20 focus:outline-none focus:ring-2 focus:ring-error/20 sm:min-h-14 sm:p-4"
                   onClick={() => {
                     dueDateInputRef.current?.focus();
                     (
                       dueDateInputRef.current as HTMLInputElement & {
                         showPicker?: () => void;
                       } | null
                     )?.showPicker?.();
                   }}
                   type="button"
                 >
                   <AppIcon className="h-4 w-4 shrink-0 text-error" name="calendar" />
                   <span className="flex-1 text-center text-sm font-medium text-error">
                     {dueDate ? formattedDueDate : "Selecionar"}
                   </span>
                   <span aria-hidden="true" className="h-4 w-4 shrink-0" />
                 </button>
                 <input
                   ref={dueDateInputRef}
                   aria-hidden="true"
                   className="pointer-events-none absolute h-px w-px opacity-0"
                   tabIndex={-1}
                   type="date"
                   required={status === "pending"}
                   value={dueDate}
                   onChange={(e) => setDueDate(e.target.value)}
                 />
               </div>
             </div>
          )}
        </div>

        
        <div className="space-y-2 sm:space-y-3">
          <label className="block px-1 text-xs font-medium text-on-surface-variant sm:text-sm">
            Classificação
          </label>
          <div className="flex gap-2 sm:gap-3">
            <button
              className={
                scope === "business"
                  ? "flex h-10 flex-1 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface ring-2 ring-outline sm:h-14"
                  : "flex h-10 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface transition hover:bg-surface-container-highest sm:h-14"
              }
              onClick={() => setScope("business")}
              type="button"
            >
              <span className="text-sm font-semibold">Empresarial</span>
            </button>
            <button
              className={
                scope === "personal"
                  ? "flex h-10 flex-1 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface ring-2 ring-outline sm:h-14"
                  : "flex h-10 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface transition hover:bg-surface-container-highest sm:h-14"
              }
              onClick={() => setScope("personal")}
              type="button"
            >
              <span className="text-sm font-semibold">Pessoal</span>
            </button>
          </div>
          <p className="hidden px-4 text-center text-[11px] leading-tight text-outline sm:block">
            Mantenha as finanças separadas para um controle mais claro do negócio.
          </p>
        </div>

        
        <div className="pt-3 sm:pt-6">
          <Button type="submit" className="min-h-12 gap-2 font-headline text-base font-bold sm:min-h-14 sm:text-lg" fullWidth disabled={isLoading}>
            {isLoading ? "Salvando..." : (
              <>
                <AppIcon name="receipt" />
                Salvar movimentação
              </>
            )}
          </Button>
        </div>
      </div>

      {isCategoryPickerOpen ? (
        <CategoryPickerModal
          categories={availableCategories}
          selectedCategoryId={categoryId}
          onClose={() => setIsCategoryPickerOpen(false)}
          onSelect={(category) => {
            setCategoryId(category.id);
            setShowCategoryError(false);
            setIsCategoryPickerOpen(false);
          }}
        />
      ) : null}
    </form>
  );
}

function CategoryPickerModal({
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
                  {isSelected ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-5 text-sm text-on-surface-variant">
            Nenhuma categoria disponível para este tipo de movimentação.
          </div>
        )}
      </div>
    </div>
  );
}
