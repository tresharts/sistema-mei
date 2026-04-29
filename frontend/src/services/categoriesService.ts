import { api } from "../lib/api";
import type { ApiTransactionKind, TransactionCategory } from "../types/finance";

type CategoryResponse = {
  id: string;
  nome: string;
  tipo: ApiTransactionKind;
  padrao: boolean;
};

type PageResponse<T> = {
  content?: T[];
};

function toTransactionCategory(category: CategoryResponse): TransactionCategory {
  return {
    id: category.id,
    name: category.nome,
    tipo: category.tipo,
    isDefault: category.padrao,
    icon: category.tipo === "RECEITA" ? "sale" : "tag",
  };
}

export type CategoryFormPayload = {
  nome: string;
  tipo: ApiTransactionKind;
};

export const categoriesService = {
  async getAllCategories(tipo?: ApiTransactionKind) {
    const response = await api.get<PageResponse<CategoryResponse>>("/categorias", {
      params: {
        tipo,
        size: 100,
        sort: "nome,asc",
      },
    });

    return (response.data.content ?? []).map(toTransactionCategory);
  },

  async createCategory(data: CategoryFormPayload) {
    const response = await api.post<CategoryResponse>("/categorias", data);
    return toTransactionCategory(response.data);
  },

  async updateCategory(id: string, data: CategoryFormPayload) {
    const response = await api.put<CategoryResponse>(`/categorias/${id}`, data);
    return toTransactionCategory(response.data);
  },

  async deleteCategory(id: string) {
    await api.delete(`/categorias/${id}`);
  },
};
