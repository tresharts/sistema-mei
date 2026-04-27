import { useState, useEffect } from "react";
import AppIcon from "../ui/AppIcon";
import Input from "../ui/Input";
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

  const filteredCategories = categories.filter(cat => 
    !filters.tipo || cat.tipo === filters.tipo
  );

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium px-1">Período (Início / Fim)</label>
          <div className="flex gap-2">
            <Input
              type="date"
              className="min-h-0 py-2 text-xs"
              value={filters.dataInicio}
              onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
            />
            <Input
              type="date"
              className="min-h-0 py-2 text-xs"
              value={filters.dataFim}
              onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
            />
          </div>
        </div>

        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-xs font-medium px-1">Tipo</label>
            <select
              className="w-full rounded-lg bg-surface-container-high p-2.5 text-xs focus:ring-2 focus:ring-primary outline-none"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value as ApiTransactionKind, categoriaId: "" })}
            >
              <option value="">Todos</option>
              <option value="RECEITA">Receitas</option>
              <option value="DESPESA">Despesas</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium px-1">Categoria</label>
            <select
              className="w-full rounded-lg bg-surface-container-high p-2.5 text-xs focus:ring-2 focus:ring-primary outline-none"
              value={filters.categoriaId}
              onChange={(e) => setFilters({ ...filters, categoriaId: e.target.value })}
            >
              <option value="">Todas</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}