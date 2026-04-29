import { useEffect, useState, useMemo } from "react";
import TransactionFilters, { TransactionFiltersData } from "../components/transactions/TransactionFilters";
import { transactionService } from "../services/transactionsServices";
import { categoriesService } from "../services/categoriesService";
import AppIcon from "../components/ui/AppIcon";
import type { 
  TransactionItem, 
  TransactionCategory, 
  HistoryGroup, 
  TransactionStatus, 
  TransactionKind 
} from "../types/finance";
import { toast } from "sonner";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFiltersData>({});

  useEffect(() => {
    categoriesService.getAllCategories()
      .then(setCategories)
      .catch(() => toast.error("Erro ao carregar categorias"));
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { transactions: data } = await transactionService.getAllTransactions(filters as any);
        setTransactions(data);
      } catch (error) {
        toast.error("Erro ao sincronizar com o servidor");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [filters]);

 const handleStatusChange = async (id: string, currentStatus: TransactionStatus, kind: TransactionKind) => {
  if (currentStatus !== "pending") return;

  try {
    const apiStatus = kind === "income" ? "RECEBIDO" : "PAGO";

    await transactionService.updateStatus(id, apiStatus);
    
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status: "settled" as TransactionStatus, 
          statusLabel: t.kind === "income" ? "Recebido" : "Pago" 
        };
      }
      return t;
    }));

    toast.success("Status atualizado!");
  } catch (error) {
    toast.error("Erro ao atualizar no servidor");
  }
};

  const groupedTransactions = useMemo((): HistoryGroup[] => {
    const groups: Record<string, TransactionItem[]> = {};
    
    transactions.forEach(item => {
      const date = item.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });

    return Object.entries(groups).map(([date, items]) => {
      const formattedDate = new Date(date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long' 
      });

      return {
        id: date,
        label: date === new Date().toISOString().split('T')[0] ? "Hoje" : formattedDate,
        dateLabel: formattedDate,
        items
      };
    });
  }, [transactions]);

  return (
    <div className="mx-auto w-full pb-24 lg:pb-0">
      <header className="pb-6">
        <h1 className="text-3xl font-headline font-bold text-on-surface">Histórico</h1>
        <p className="text-on-surface-variant text-sm">Suas movimentações financeiras</p>
      </header>

      <div className="mb-6">
        <TransactionFilters categories={categories} onFilterChange={setFilters} />
      </div>

      <main className="space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-on-surface-variant font-medium">Buscando dados no servidor...</p>
          </div>
        ) : groupedTransactions.length > 0 ? (
          groupedTransactions.map(group => (
            <section key={group.id} className="space-y-3">
              <h3 className="text-xs font-bold text-outline px-2 uppercase tracking-tighter">
                {group.label}
              </h3>
              
              <div className="space-y-2">
                {group.items.map(item => (
                  <TransactionCard 
                    key={item.id} 
                    item={item} 
                    onStatusChange={handleStatusChange} 
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
            <AppIcon name="box" className="mx-auto h-12 w-12 text-outline/30 mb-4" />
            <p className="text-on-surface-variant">Nenhuma movimentação encontrada</p>
          </div>
        )}
      </main>
    </div>
  );
}

function TransactionCard({ 
  item, 
  onStatusChange 
}: { 
  item: TransactionItem; 
  onStatusChange: (id: string, currentStatus: TransactionStatus, kind: TransactionKind) => void 
}) {
  const isIncome = item.kind === "income";
  const isPending = item.status === "pending";
  
  return (
    <div className="group relative bg-surface-container-low hover:bg-surface-container-high transition-all p-4 rounded-[24px] border border-outline-variant/20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${isIncome ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
          <AppIcon name={item.icon as any} className="w-6 h-6" />
        </div>
        
        <div className="flex flex-col">
          <span className="font-bold text-on-surface leading-tight">{item.title}</span>
          <span className="text-xs text-on-surface-variant">
            {item.category} • {item.scopeLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className={`font-bold text-lg ${isIncome ? 'text-secondary' : 'text-error'}`}>
          {isIncome ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
        </span>
        
        <button 
          onClick={() => onStatusChange(item.id, item.status, item.kind)}
          disabled={!isPending}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all active:scale-95
            ${isPending 
              ? 'bg-tertiary-container text-on-tertiary-container border border-tertiary/20 hover:bg-primary-container' 
              : 'bg-surface-container-highest text-on-surface-variant cursor-default opacity-80'
            } uppercase tracking-wide`}
        >
          {item.statusLabel}
        </button>
      </div>
    </div>
  );
}
