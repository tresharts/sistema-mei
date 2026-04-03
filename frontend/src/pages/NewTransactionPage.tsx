import { useState } from "react";
import Button from "../components/ui/Button";
import AppIcon from "../components/ui/AppIcon";
import Input from "../components/ui/Input";
import { transactionCategories } from "../data/mockData";

function NewTransactionPage() {
  const [transactionKind, setTransactionKind] = useState<"income" | "expense">(
    "income",
  );
  const [scope, setScope] = useState<"business" | "personal">("business");

  return (
    <div className="space-y-10">
      <div className="flex rounded-xl bg-surface-container-high p-1.5">
        <button
          className={
            transactionKind === "income"
              ? "flex-1 rounded-lg bg-secondary-container px-4 py-3 font-semibold text-on-secondary-container shadow-sm"
              : "flex-1 rounded-lg px-4 py-3 font-medium text-on-surface-variant transition hover:bg-surface-container-highest"
          }
          onClick={() => setTransactionKind("income")}
          type="button"
        >
          Recebi dinheiro
        </button>
        <button
          className={
            transactionKind === "expense"
              ? "flex-1 rounded-lg bg-error-container/25 px-4 py-3 font-semibold text-error shadow-sm"
              : "flex-1 rounded-lg px-4 py-3 font-medium text-on-surface-variant transition hover:bg-surface-container-highest"
          }
          onClick={() => setTransactionKind("expense")}
          type="button"
        >
          Gastei dinheiro
        </button>
      </div>

      <div className="text-center">
        <label className="mb-2 block text-sm font-medium text-on-surface-variant">
          {transactionKind === "income" ? "Quanto entrou?" : "Quanto saiu?"}
        </label>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-headline text-2xl font-bold text-primary">R$</span>
          <input
            className="w-full bg-transparent text-center font-headline text-5xl font-extrabold text-on-surface focus:outline-none"
            defaultValue="0,00"
            type="text"
          />
        </div>
        <div className="mx-auto mt-2 h-0.5 w-32 rounded-full bg-primary/20" />
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="block px-1 text-sm font-medium text-on-surface-variant">
            Descricao
          </label>
          <div className="rounded-xl bg-surface-container-low p-4 transition focus-within:bg-surface-container-highest">
            <Input
              className="min-h-0 bg-transparent p-0 focus:bg-transparent focus:ring-0"
              placeholder="Ex: Venda de kit decoracao"
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
                className="min-h-0 bg-transparent p-0 text-sm focus:bg-transparent focus:ring-0"
                defaultValue="2026-04-03"
                type="date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block px-1 text-sm font-medium text-on-surface-variant">
              Categoria
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-4">
              <AppIcon className="h-4 w-4 text-outline" name="tag" />
              <select className="w-full appearance-none bg-transparent text-sm text-on-surface focus:outline-none">
                {transactionCategories.map((category) => (
                  <option key={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block px-1 text-sm font-medium text-on-surface-variant">
            Tipo de movimentacao
          </label>
          <div className="flex gap-3">
            <button
              className={
                scope === "business"
                  ? "flex h-14 flex-1 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary"
                  : "flex h-14 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface"
              }
              onClick={() => setScope("business")}
              type="button"
            >
              <span className="text-sm font-semibold">Empresarial</span>
            </button>
            <button
              className={
                scope === "personal"
                  ? "flex h-14 flex-1 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary"
                  : "flex h-14 flex-1 items-center justify-center rounded-xl bg-surface-container-low text-on-surface"
              }
              onClick={() => setScope("personal")}
              type="button"
            >
              <span className="text-sm font-semibold">Pessoal</span>
            </button>
          </div>
          <p className="px-4 text-center text-[11px] leading-tight text-outline">
            Mantenha suas financas separadas para um controle mais claro do atelie.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <Button className="gap-2 text-lg font-headline font-bold" fullWidth>
            <AppIcon name="receipt" />
            Salvar movimentacao
          </Button>
          <button
            className="flex h-14 w-full items-center justify-center rounded-xl text-outline transition hover:bg-surface-container-low"
            type="button"
          >
            Cancelar e voltar
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewTransactionPage;
