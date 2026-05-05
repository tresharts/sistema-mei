import type { IconName, SurfaceTone } from "./ui";

export type TransactionKind = "income" | "expense";
export type TransactionScope = "business" | "personal";
export type TransactionStatus = "settled" | "pending" | "overdue";

export type ApiTransactionKind = "RECEITA" | "DESPESA";
export type ApiTransactionScope = "EMPRESARIAL" | "PESSOAL";
export type ApiTransactionStatus = "PAGO" | "A_PAGAR" | "RECEBIDO" | "A_RECEBER";


export interface ApiTransaction {
  id: string;
  descricao: string;
  valor: number;
  tipo: ApiTransactionKind;
  classificacao: ApiTransactionScope;
  status: ApiTransactionStatus;
  categoriaId: string;
  categoriaNome: string;
  data: string;
  dataVencimento: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  kind: TransactionKind; 
  scope: TransactionScope;
  status: TransactionStatus
  statusLabel: string; 
  scopeLabel: string; 
  categoryId: string;
  category: string; 

  date: string; 
  dueDate?: string | null; 

  partner?: string; 
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

export type DashboardAlertSeverity = "INFO" | "WARNING" | "DANGER";

export interface DashboardAlert {
  tipo: string;
  titulo: string;
  mensagem: string;
  quantidade: number | null;
  severidade: DashboardAlertSeverity;
  dataReferencia: string | null;
}

export interface DashboardSummary {
  saldoAtual: number;
  lucroEmpresarialMes: number;
  totalAReceber: number;
  totalAPagar: number;
  vendasHoje: number;
  quantidadeContasAReceberAtrasadas: number;
  alertas: DashboardAlert[];
}

export interface OverdueAccount {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  diasAtraso: number;
  categoriaNome: string;
}

export interface ChartDatum {
  label: string;
  incomeHeight: number;
  expenseHeight: number;
}

export interface TransactionCategory {
  id: string;
  name: string;
  tipo: ApiTransactionKind;
  classificacao: ApiTransactionScope;
  isDefault: boolean;
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
