import type { TransactionKind } from "../types/finance";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

export function formatCurrencyBRL(value: number) {
  return currencyFormatter.format(value);
}

export function formatShortDate(date: string) {
  return shortDateFormatter.format(new Date(date));
}

export function getSignedAmount(kind: TransactionKind, value: number) {
  const prefix = kind === "income" ? "+" : "-";
  return `${prefix} ${formatCurrencyBRL(value)}`;
}
