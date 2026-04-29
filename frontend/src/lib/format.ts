import type { TransactionKind } from "../types/finance";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date(date);
  }

  return new Date(year, month - 1, day);
}

export function formatCurrencyBRL(value: number) {
  return currencyFormatter.format(value);
}

export function formatShortDate(date: string) {
  return shortDateFormatter.format(parseLocalDate(date));
}

export function formatDateBRL(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

export function getSignedAmount(kind: TransactionKind, value: number) {
  const prefix = kind === "income" ? "+" : "-";
  return `${prefix} ${formatCurrencyBRL(value)}`;
}
