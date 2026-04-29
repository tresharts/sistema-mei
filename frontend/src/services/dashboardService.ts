import { api } from "../lib/api";
import type { DashboardSummary, OverdueAccount } from "../types/finance";

type PageResponse<T> = {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
};

export const dashboardService = {
  async getSummary() {
    const response = await api.get<DashboardSummary>("/dashboard/resumo");
    return response.data;
  },

  async getOverdueAccounts(size = 5) {
    const response = await api.get<PageResponse<OverdueAccount>>(
      "/dashboard/contas-atrasadas",
      {
        params: {
          size,
          sort: "dataVencimento,asc",
        },
      },
    );

    return response.data.content ?? [];
  },
};
