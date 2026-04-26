import {api} from "../lib/api";
import { TransactionFormData } from "../components/transactions/TransactionForm";

// Backend
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

// Backend logic
const mapStatusToBackend = (kind: "income" | "expense", status: "settled" | "pending") => {
  if (kind === "income") {
    return status === "settled" ? "RECEBIDO" : "A_RECEBER";
  }
  return status === "settled" ? "PAGO" : "A_PAGAR";
};

export const transactionService = {
  
  async createTransaction(data: TransactionFormData) {
    const payload = mapToBackend(data);
    const response = await api.post("/movimentacoes", payload);
    return response.data;
  },
    
  async getAllTransactions(params?: any) {
    const response = await api.get("/movimentacoes", { params });
    return response.data.content || [];
  },

  async deleteTransaction(id: string) {
    await api.delete(`/movimentacoes/${id}`);
  }
};