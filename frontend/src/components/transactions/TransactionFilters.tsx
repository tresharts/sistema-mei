import { useState, useEffect, useRef } from "react";
import AppIcon from "../ui/AppIcon";
import { formatDateBRL } from "../../lib/format";
import type { TransactionCategory, ApiTransactionKind, ApiTransactionStatus } from "../../types/finance";

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFiltersData) => void;
  categories: TransactionCategory[];
}

export interface TransactionFiltersData {
  dataInicio?: string;
  dataFim?: string;
  tipo?: ApiTransactionKind | "";
  status?: ApiTransactionStatus | "";
  categoriaId?: string;
}

export default function TransactionFilters({ onFilterChange, categories }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFiltersData>({
    dataInicio: "",
    dataFim: "",
    tipo: "",
    status: "",
    categoriaId: "",
  });
  const [openPicker, setOpenPicker] = useState<"categoria" | null>(null);

  const filteredCategories = categories.filter(cat => 
    !filters.tipo || cat.tipo === filters.tipo
  );

  const selectedCategoryLabel =
    categories.find((category) => category.id === filters.categoriaId)?.name ?? "Todas";

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleClear = () => {
    setFilters({ dataInicio: "", dataFim: "", tipo: "", status: "", categoriaId: "" });
  };

  return (
    <div className="space-y-4 rounded-2xl bg-surface-container-low p-4 border border-outline-variant/30">
      <div className="flex items-center justify-between">        
        <div className="flex items-center gap-2">
            <AppIcon name="filter_list" className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Filtros de Busca</h3>
        </div>
        <button 
          onClick={handleClear}
          className="text-xs font-medium text-primary hover:underline"
        >
          Limpar tudo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div className="space-y-2 ">
          <label className="text-xs font-medium px-1">Período (Início/Fim)</label>
          <div className="grid grid-cols-2 gap-2">
            <FilterDateButton
              label="Início"
              value={filters.dataInicio}
              onChange={(value) => setFilters({ ...filters, dataInicio: value })}
            />
            <FilterDateButton
              label="Fim"
              value={filters.dataFim}
              onChange={(value) => setFilters({ ...filters, dataFim: value })}
            />
          </div>
        </div>

        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-2">
            <label className="text-xs font-medium px-1">Tipo</label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-container-high p-1">
              {[
                { label: "Todos", value: "" },
                { label: "Receitas", value: "RECEITA" },
                { label: "Despesas", value: "DESPESA" },
              ].map((option) => {
                const isSelected = filters.tipo === option.value;

                return (
                  <button
                    key={option.label}
                    className={
                      isSelected
                        ? "min-h-9 rounded-lg bg-surface-container-lowest px-2 text-xs font-bold text-primary shadow-sm"
                        : "min-h-9 rounded-lg px-2 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-low"
                    }
                    onClick={() =>
                      setFilters({
                        ...filters,
                        tipo: option.value as ApiTransactionKind | "",
                        categoriaId: "",
                      })
                    }
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium px-1">Categoria</label>
            <button
              className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg bg-surface-container-high px-3 py-2.5 text-left text-xs transition hover:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary/20"
              onClick={() => setOpenPicker("categoria")}
              type="button"
            >
              <span className="truncate font-medium text-on-surface">{selectedCategoryLabel}</span>
              <AppIcon className="h-4 w-4 shrink-0 text-outline" name="arrow-down" />
            </button>
          </div>
        </div>
      </div>

      {openPicker === "categoria" ? (
        <FilterPickerModal
          title="Categoria"
          options={[
            { label: "Todas", value: "" },
            ...filteredCategories.map((category) => ({
              label: category.name,
              value: category.id,
              icon: category.icon,
              helper: category.tipo === "RECEITA" ? "Receita" : "Despesa",
            })),
          ]}
          selectedValue={filters.categoriaId ?? ""}
          onClose={() => setOpenPicker(null)}
          onSelect={(value) => {
            setFilters({ ...filters, categoriaId: value });
            setOpenPicker(null);
          }}
        />
      ) : null}
    </div>
  );
}

function FilterDateButton({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <button
        className="flex min-h-10 w-full items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2.5 text-left text-xs transition hover:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary/20"
        onClick={() => {
          inputRef.current?.focus();
          (
            inputRef.current as HTMLInputElement & {
              showPicker?: () => void;
            } | null
          )?.showPicker?.();
        }}
        type="button"
      >
        <AppIcon className="h-4 w-4 shrink-0 text-outline" name="calendar" />
        <span className="truncate font-medium text-on-surface">
          {value ? formatDateBRL(value) : label}
        </span>
      </button>
      <input
        ref={inputRef}
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
        tabIndex={-1}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

type FilterPickerOption = {
  label: string;
  value: string;
  icon?: TransactionCategory["icon"];
  helper?: string;
};

function FilterPickerModal({
  onClose,
  onSelect,
  options,
  selectedValue,
  title,
}: {
  onClose: () => void;
  onSelect: (value: string) => void;
  options: FilterPickerOption[];
  selectedValue: string;
  title: string;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AppIcon name="filter_list" />
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              {title}
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

        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                key={option.value || "all"}
                className={
                  isSelected
                    ? "flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-primary/10 p-4 text-left ring-2 ring-primary/30"
                    : "flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4 text-left transition hover:bg-surface-container-high"
                }
                onClick={() => onSelect(option.value)}
                type="button"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {option.icon ? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                      <AppIcon className="h-4 w-4" name={option.icon} />
                    </span>
                  ) : null}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-on-surface">
                      {option.label}
                    </span>
                    {option.helper ? (
                      <span className="block text-xs text-on-surface-variant">
                        {option.helper}
                      </span>
                    ) : null}
                  </span>
                </span>
                {isSelected ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
