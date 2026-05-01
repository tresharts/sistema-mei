import { useEffect, useState, useMemo } from "react";
import TransactionFilters, { TransactionFiltersData } from "../components/transactions/TransactionFilters";
import { transactionService } from "../services/transactionsServices";
import { categoriesService } from "../services/categoriesService";
import AppIcon from "../components/ui/AppIcon";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
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
  
  // Controle do Modal de Edição[cite: 5]
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);

  // Carregamento inicial de categorias[cite: 5, 6]
  useEffect(() => {
    categoriesService.getAllCategories()
      .then(setCategories)
      .catch(() => toast.error("Erro ao carregar categorias"));
  }, []);

  // Carregamento de transações baseado nos filtros[cite: 5, 7, 8]
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

  // Atualização rápida de status (Pago/Recebido)[cite: 5, 7]
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

  // Função para salvar a edição completa[cite: 7]
  const handleSaveEdit = async (id: string, updatedData: any) => {
    try {
      const updatedItem = await transactionService.updateTransaction(id, updatedData);
      
      // Atualiza a lista localmente[cite: 5]
      setTransactions(prev => prev.map(t => t.id === id ? updatedItem : t));
      
      toast.success("Movimentação atualizada!");
      setEditingTransaction(null);
    } catch (error) {
      toast.error("Erro ao salvar alterações.");
    }
  };

  // Função de exclusão vinda do modal ou do card[cite: 5, 7]
  const handleDelete = async (id: string) => {
    toast("Deseja realmente excluir?", {
      description: "Esta ação não pode ser desfeita.",
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await transactionService.deleteTransaction(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
            toast.success("Movimentação removida!");
            setEditingTransaction(null);
          } catch (erro) {
            toast.error("Erro ao excluir no servidor.");
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
  };

  const groupedTransactions = useMemo((): HistoryGroup[] => {
    const groups: Record<string, TransactionItem[]> = {};
    transactions.forEach(item => {
      const date = item.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });

    return Object.entries(groups).map(([date, items]) => {
      const formattedDate = new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
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
          </div>
        ) : groupedTransactions.length > 0 ? (
          groupedTransactions.map(group => (
            <section key={group.id} className="space-y-3">
              <h3 className="text-xs font-bold text-outline px-2 uppercase tracking-tighter">{group.label}</h3>
              <div className="space-y-2">
                {group.items.map(item => (
                  <TransactionCard 
                    key={item.id} 
                    item={item} 
                    onStatusChange={handleStatusChange} 
                    onEdit={() => setEditingTransaction(item)} 
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20">
            <AppIcon name="box" className="mx-auto h-12 w-12 text-outline/30 mb-4" />
            <p className="text-on-surface-variant">Nenhuma movimentação encontrada</p>
          </div>
        )}
      </main>

      {/* MODAL DE EDIÇÃO REAL[cite: 5, 8] */}
      {editingTransaction && (
        <EditTransactionModal 
          transaction={editingTransaction}
          categories={categories}
          onClose={() => setEditingTransaction(null)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/**
 * COMPONENTE: TransactionCard
 */
function TransactionCard({ item, onStatusChange, onEdit }: any) {
  const isIncome = item.kind === "income";
  const isPending = item.status === "pending";
  
  return (
    <div className="group relative bg-surface-container-low hover:bg-surface-container-high transition-all p-4 rounded-[24px] border border-outline-variant/20 flex items-center justify-between">
      {/* Ícone de lápis para abrir o modal de edição[cite: 5] */}
      <button 
        onClick={onEdit}
        className="absolute -top-2 -right-2 bg-primary text-on-primary p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <AppIcon name="edit" className="w-4 h-4" />
      </button>
        
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${isIncome ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
          <AppIcon name={item.icon as any} className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-on-surface leading-tight">{item.title}</span>
          <span className="text-xs text-on-surface-variant">{item.category}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className={`font-bold text-lg ${isIncome ? 'text-secondary' : 'text-error'}`}>
          {isIncome ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
        </span>
        <button 
          onClick={() => onStatusChange(item.id, item.status, item.kind)}
          disabled={!isPending}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPending ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container-highest opacity-80'}`}
        >
          {item.statusLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * COMPONENTE: EditTransactionModal (Com lógica de formulário real)[cite: 5, 8]
 */
function EditTransactionModal({ transaction, categories, onClose, onSave, onDelete }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(transaction.date);
  const [categoryId, setCategoryId] = useState("");

  // Busca o ID da categoria baseado no nome (para o select)[cite: 5]
  useEffect(() => {
    const cat = categories.find((c: any) => c.name === transaction.category);
    if (cat) setCategoryId(cat.id);
  }, [transaction, categories]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    await onSave(transaction.id, {
      valor: parseFloat(amount),
      descricao: title,
      data: date,
      dataVencimento: transaction.dueDate, 
      tipo: transaction.kind === "income" ? "RECEITA" : "DESPESA", 
      classificacao: transaction.scope === "business" ? "EMPRESARIAL" : "PESSOAL", 
      status: transaction.kind === "income" 
              ? (transaction.status === "settled" ? "RECEBIDO" : "A_RECEBER") 
              : (transaction.status === "settled" ? "PAGO" : "A_PAGAR"),
      categoriaId: categoryId 
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md animate-in fade-in zoom-in duration-200">
        <header className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AppIcon name="edit" />
            </div>
            <h2 className="font-headline text-lg font-bold">Editar Movimentação</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full"><AppIcon name="close" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor (R$)" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase ml-1">Categoria</label>
            <select 
              className="w-full h-14 rounded-xl bg-surface-container-low px-4 border-none text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {categories
                .filter((c: any) => c.tipo === (transaction.kind === 'income' ? 'RECEITA' : 'DESPESA'))
                .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)
              }
            </select>
          </div>

          <div className="pt-4 space-y-2">
            <Button fullWidth type="submit" isLoading={isSubmitting}>Salvar Alterações</Button>
            <Button fullWidth variant="secondary" className="text-error border-error/10" onClick={() => onDelete(transaction.id)}>
              <AppIcon name="trash" className="w-4 h-4 mr-2" /> Excluir Registro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}