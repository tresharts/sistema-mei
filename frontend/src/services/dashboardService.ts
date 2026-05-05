import { api } from "../lib/api";
import type {
  ApiTransactionScope,
  DashboardSummary,
  OverdueAccount,
} from "../types/finance";

type PageResponse<T> = {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
};

export const dashboardService = {
  async getSummary(classificacao?: ApiTransactionScope) {
    const response = await api.get<DashboardSummary>("/dashboard/resumo", {
      params: { classificacao },
    });
    return response.data;
  },

  async getOverdueAccounts(size = 5, classificacao?: ApiTransactionScope) {
    const response = await api.get<PageResponse<OverdueAccount>>(
      "/dashboard/contas-atrasadas",
      {
        params: {
          classificacao,
          size,
          sort: "dataVencimento,asc",
        },
      },
    );

    return response.data.content ?? [];
  },
};
