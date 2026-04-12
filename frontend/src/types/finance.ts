import type { IconName, SurfaceTone } from "./ui";

export type TransactionKind = "income" | "expense";

export type TransactionScope = "business" | "personal";

export type TransactionStatus = "settled" | "pending" | "overdue";

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

export interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  kind: TransactionKind;
  scope: TransactionScope;
  scopeLabel: string;
  category: string;
  status: TransactionStatus;
  statusLabel: string;
  dueDate: string;
  partner: string;
  timeLabel: string;
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
