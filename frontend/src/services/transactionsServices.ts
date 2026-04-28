import { api } from "../lib/api";
import { TransactionFormData } from "../components/transactions/TransactionForm";
import type { TransactionFiltersData } from "../components/transactions/TransactionFilters";
import type {
  ApiTransaction,
  ApiTransactionStatus,
  TransactionItem,
  TransactionKind,
  TransactionScope,
  TransactionStatus,
} from "../types/finance";

const mapToBackend = (data: TransactionFormData) => {
  return {
    valor: parseFloat(data.amount),
    descricao: data.description,
    data: data.date,
    dataVencimento: data.status === "pending" ? data.dueDate : null,
    tipo: data.kind === "income" ? "RECEITA" : "DESPESA",
    classificacao: data.scope === "business" ? "EMPRESARIAL" : "PESSOAL",
    status: mapStatusToBackend(data.kind, data.status),
    categoriaId: data.categoryId
  };
};

const mapStatusToBackend = (kind: "income" | "expense", status: "settled" | "pending") => {
  if (kind === "income") {
    return status === "settled" ? "RECEBIDO" : "A_RECEBER";
  }
  return status === "settled" ? "PAGO" : "A_PAGAR";
};

const mapKindFromBackend = (tipo: ApiTransaction["tipo"]): TransactionKind =>
  tipo === "RECEITA" ? "income" : "expense";

const mapScopeFromBackend = (classificacao: ApiTransaction["classificacao"]): TransactionScope =>
  classificacao === "EMPRESARIAL" ? "business" : "personal";

const mapStatusFromBackend = (status: ApiTransactionStatus): TransactionStatus =>
  status === "PAGO" || status === "RECEBIDO" ? "settled" : "pending";

const mapStatusLabelFromBackend = (status: ApiTransactionStatus) => {
  const labels: Record<ApiTransactionStatus, string> = {
    PAGO: "Pago",
    A_PAGAR: "A pagar",
    RECEBIDO: "Recebido",
    A_RECEBER: "A receber",
  };

  return labels[status];
};

export function toTransactionItem(transaction: ApiTransaction): TransactionItem {
  const kind = mapKindFromBackend(transaction.tipo);
  const scope = mapScopeFromBackend(transaction.classificacao);

  return {
    id: transaction.id,
    title: transaction.descricao,
    amount: transaction.valor,
    kind,
    scope,
    scopeLabel: scope === "business" ? "Empresarial" : "Pessoal",
    category: transaction.categoriaNome,
    status: mapStatusFromBackend(transaction.status),
    statusLabel: mapStatusLabelFromBackend(transaction.status),
    date: transaction.data,
    dueDate: transaction.dataVencimento,
    timeLabel: transaction.data,
    icon: kind === "income" ? "sale" : "shopping-bag",
  };
}

export const transactionService = {
  
  async createTransaction(data: TransactionFormData) {
    const payload = mapToBackend(data);
    const response = await api.post<ApiTransaction>("/movimentacoes", payload);
    return response.data;
  },
    
  async getAllTransactions(params?: TransactionFiltersData) {
    const response = await api.get<{ 
      content?: ApiTransaction[], 
      totalPages: number 
      }> ("/movimentacoes", { params });

    return{
      transactions: (response.data.content ?? []).map(toTransactionItem),
      totalPages: response.data.totalPages,
    };
  },

  async deleteTransaction(id: string) {
    await api.delete(`/movimentacoes/${id}`);
  },

  async updateStatus(id: string, status: ApiTransactionStatus){
    const response = await api.patch<ApiTransaction>(`/movimentacoes/${id}/status`, { status});

    return toTransactionItem(response.data);
 }
};
