import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import AppIcon from "../ui/AppIcon";
import Input from "../ui/Input";
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

  const settledLabel = kind === "income" ? "Já Recebido" : "Já Pago";
  const pendingLabel = kind === "income" ? "A Receber" : "A Pagar";
  const selectedCategoryKind = kind === "income" ? "RECEITA" : "DESPESA";

  const availableCategories = useMemo(
    () => categories.filter((category) => category.tipo === selectedCategoryKind),
    [categories, selectedCategoryKind]
  );

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
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex rounded-xl bg-surface-container-high p-1.5">
        <button
          className={
            kind === "income"
              ? "flex-1 rounded-lg bg-secondary-container px-4 py-3 font-semibold text-on-secondary-container shadow-sm"
              : "flex-1 rounded-lg px-4 py-3 font-medium text-on-surface-variant transition hover:bg-surface-container-highest"
          }
          onClick={() => setKind("income")}
          type="button"
        >
          Recebidos
        </button>
        <button
          className={
            kind === "expense"
              ? "flex-1 rounded-lg bg-error-container/25 px-4 py-3 font-semibold text-error shadow-sm"
              : "flex-1 rounded-lg px-4 py-3 font-medium text-on-surface-variant transition hover:bg-surface-container-highest"
          }
          onClick={() => setKind("expense")}
          type="button"
        >
          Gastos
        </button>
      </div>

      <div className="text-center">
        <label className="mb-2 block text-sm font-medium text-on-surface-variant">
          {kind === "income" ? "Quanto entrou?" : "Quanto saiu?"}
        </label>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-headline text-2xl font-bold text-primary">R$</span>
          <input
            className="w-full bg-transparent text-center font-headline text-5xl font-extrabold text-on-surface focus:outline-none placeholder-on-surface-variant/30"
            placeholder="0,00"
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mx-auto mt-2 h-0.5 w-32 rounded-full bg-primary/20" />
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="block px-1 text-sm font-medium text-on-surface-variant">
            Descrição
          </label>
          <div className="rounded-xl bg-surface-container-low p-4 transition focus-within:bg-surface-container-highest">
            <Input
              className="min-h-0 bg-transparent p-0 focus:bg-transparent focus:ring-0"
              placeholder= {kind === "income" ? "Ex: Venda de produto X" : "Ex: Compra de material Y"}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block px-1 text-sm font-medium text-on-surface-variant">
              Data
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-4">
              <AppIcon className="h-4 w-4 text-outline" name="calendar" />
              <Input
                className="min-h-0 w-full bg-transparent p-0 text-sm focus:bg-transparent focus:ring-0"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block px-1 text-sm font-medium text-on-surface-variant">
              Categoria
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-4">
              <AppIcon className="h-4 w-4 text-outline" name="tag" />
              <select 
                className="w-full appearance-none bg-transparent text-sm text-on-surface focus:outline-none"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="" disabled>Selecione...</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        
        <div className="space-y-3 rounded-2xl border border-surface-container-high p-4">
          <label className="block px-1 text-sm font-medium text-on-surface-variant">
            Status do pagamento
          </label>
          <div className="flex gap-3">
            <button
              className={
                status === "settled"
                  ? "flex h-12 flex-1 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary"
                  : "flex h-12 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface transition hover:bg-surface-container-high"
              }
              onClick={() => setStatus("settled")}
              type="button"
            >
              <span className="text-sm font-semibold">{settledLabel}</span>
            </button>
            <button
              className={
                status === "pending"
                  ? "flex h-12 flex-1 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary"
                  : "flex h-12 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface transition hover:bg-surface-container-high"
              }
              onClick={() => setStatus("pending")}
              type="button"
            >
              <span className="text-sm font-semibold">{pendingLabel}</span>
            </button>
          </div>

          
          {status === "pending" && (
             <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
               <label className="block px-1 text-sm font-medium ">
                 Data de Vencimento
               </label>
               <div className="flex items-center gap-2 rounded-xl bg-error-container/5 p-4 border border-error/60">
                 <AppIcon className="h-4 w-4 " name="calendar" />
                 <Input
                   className="min-h-0 w-full bg-transparent p-0 text-sm focus:bg-transparent focus:ring-0 text-error"
                   type="date"
                   required={status === "pending"}
                   value={dueDate}
                   onChange={(e) => setDueDate(e.target.value)}
                 />
               </div>
             </div>
          )}
        </div>

        
        <div className="space-y-3">
          <label className="block px-1 text-sm font-medium text-on-surface-variant">
            Classificação
          </label>
          <div className="flex gap-3">
            <button
              className={
                scope === "business"
                  ? "flex h-14 flex-1 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface ring-2 ring-outline"
                  : "flex h-14 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface transition hover:bg-surface-container-highest"
              }
              onClick={() => setScope("business")}
              type="button"
            >
              <span className="text-sm font-semibold">Empresarial</span>
            </button>
            <button
              className={
                scope === "personal"
                  ? "flex h-14 flex-1 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface ring-2 ring-outline"
                  : "flex h-14 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface transition hover:bg-surface-container-highest"
              }
              onClick={() => setScope("personal")}
              type="button"
            >
              <span className="text-sm font-semibold">Pessoal</span>
            </button>
          </div>
          <p className="px-4 text-center text-[11px] leading-tight text-outline">
            Mantenha as finanças separadas para um controlo mais claro do negócio.
          </p>
        </div>

        
        <div className="pt-4">
          <Button type="submit" className="gap-2 text-lg font-headline font-bold" fullWidth disabled={isLoading}>
            {isLoading ? "A guardar..." : (
              <>
                <AppIcon name="receipt" />
                Salvar movimentação
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
