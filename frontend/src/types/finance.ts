import type { IconName, SurfaceTone } from "./ui";

export type TransactionKind = "income" | "expense";
export type TransactionScope = "business" | "personal";
export type TransactionStatus = "settled" | "pending" | "overdue";

export type apiTransactionKind = "RECEITA" | "DESPESAS";
export type apiTransactionScope = "EMPRESARIAL" | "PESSOAL";
export type apiTransactionStatus = "PAGA" | "A_PAGAR" | "RECEBIDO"  | "A_RECEBER" | "VENCIDO";


//Dados do backend 
export interface apiTransaction {
  id: string;
  descricao: string;
  valor: number;
  tipo: apiTransactionKind;
  classificacao: apiTransactionScope;
  status: apiTransactionStatus;
  categoria: string;
  dataMovimentacao: string;
  dataVencimento: string | null;
}

// Dados que o frontend irá usar/ler **comentários para saber de onde vem cada campo**
export interface TransactionItem{
  id: string;
  title: string; // vem de descricao
  amount: number; // vem de valor
  kind: TransactionKind; // vem de tipo
  scope: TransactionScope; // vem de classificacao
  status: TransactionStatus; // vem de status
  statusLabel: string; // label amigável para status
  scopeLabel: string; // label amigável para scope
  category: string; // vem de categoria

  date: string; 
  dueDate?: string | null; 

  partner?: string; // 
  timeLabel?: string;
  icon: IconName;


}

export interface DashboardHighlight {
  label: string;
  value: number;
  helperText: string;
  icon: IconName;
  tone: SurfaceTone;
}

export interface ChartDatum {
  label: string;
  incomeHeight: number;
  expenseHeight: number;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon: IconName;
}


export interface HistoryGroup {
  id: string;
  label: string;
  dateLabel: string;
  items: TransactionItem[];
}

export interface SettingsCategory {
  id: string;
  name: string;
  groupLabel: string;
  icon: IconName;
  tone: SurfaceTone;
}

export interface NotificationPreference {
  id: string;
  title: string;
  schedule: string;
  enabled: boolean;
}
