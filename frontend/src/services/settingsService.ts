import { api } from "../lib/api";

export type UserSettings = {
  id: string;
  nomeUsuario: string;
  emailUsuario: string;
  nomeNegocio: string | null;
  atividade: string | null;
  valorDas: number;
  lembreteDasAtivo: boolean;
  resumoDiarioAtivo: boolean;
  atualizadoEm: string | null;
};

export type UserSettingsPayload = {
  valorDas: number;
  nomeNegocio: string | null;
  atividade: string | null;
  lembreteDasAtivo: boolean;
  resumoDiarioAtivo: boolean;
};

export const settingsService = {
  async getSettings() {
    const response = await api.get<UserSettings>("/configuracoes");
    return response.data;
  },

  async updateSettings(data: UserSettingsPayload) {
    const response = await api.put<UserSettings>("/configuracoes", data);
    return response.data;
  },
};
