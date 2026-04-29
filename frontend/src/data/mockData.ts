import type {
  ChartDatum,
  DashboardHighlight,
  HistoryGroup,
  NotificationPreference,
  SettingsCategory,
  TransactionCategory,
  TransactionItem,
} from "../types/finance";



export const dashboardHighlights: DashboardHighlight[] = [
  {
    label: "Quanto entrou hoje",
    value: 450,
    helperText: "Pagamentos confirmados nas ultimas horas.",
    icon: "sparkles",
    tone: "secondary",
  },
  {
    label: "Vencimento do DAS",
    value: 20,
    helperText: "Proxima guia prevista para este mes.",
    icon: "calendar",
    tone: "tertiary",
  },
  {
    label: "Contas a receber",
    value: 1200,
    helperText: "Pedidos aguardando recebimento.",
    icon: "wallet",
    tone: "neutral",
  },
  {
    label: "Contas a pagar",
    value: 890,
    helperText: "Despesas previstas e contas recorrentes.",
    icon: "receipt",
    tone: "danger",
  },
];

export const weeklyFlowChart: ChartDatum[] = [
  { label: "SEG", expenseHeight: 48, incomeHeight: 64 },
  { label: "TER", expenseHeight: 32, incomeHeight: 80 },
  { label: "QUA", expenseHeight: 80, incomeHeight: 44 },
  { label: "QUI", expenseHeight: 56, incomeHeight: 92 },
  { label: "SEX", expenseHeight: 68, incomeHeight: 104 },
  { label: "SAB", expenseHeight: 20, incomeHeight: 36 },
  { label: "DOM", expenseHeight: 24, incomeHeight: 48 },
];

export const recentTransactions: TransactionItem[] = [
  {
    id: "trx-1",
    title: "Entrada: Festa Safari",
    amount: 850,
    kind: "income",
    scope: "business",
    scopeLabel: "Empresarial",
    category: "Venda Direta",
    status: "settled",
    statusLabel: "Recebido",
    date: "2026-04-03",
    dueDate: "2026-04-03",
    partner: "Cliente: Mariana Souza",
    timeLabel: "Hoje, 14:20",
    icon: "sale",
  },
  {
    id: "trx-2",
    title: "Saida: Baloes e Cia",
    amount: 120,
    kind: "expense",
    scope: "business",
    scopeLabel: "Empresarial",
    category: "Fornecedor",
    status: "pending",
    statusLabel: "A pagar",
    date: "2026-04-02",
    dueDate: "2026-04-02",
    partner: "Compra de insumos",
    timeLabel: "Ontem, 11:05",
    icon: "shopping-bag",
  },
  {
    id: "trx-3",
    title: "Entrada: Sinal de batizado",
    amount: 200,
    kind: "income",
    scope: "business",
    scopeLabel: "Empresarial",
    category: "Reserva",
    status: "settled",
    statusLabel: "Recebido",
    date: "2026-04-01",
    dueDate: "2026-04-01",
    partner: "Cliente: Joao Pedro",
    timeLabel: "01 Abr, 09:30",
    icon: "receipt",
  },
];

export const historyGroups: HistoryGroup[] = [
  {
    id: "group-today",
    label: "Hoje",
    dateLabel: "03 de Abril",
    items: [
      {
        id: "hist-1",
        title: "Decoracao de batizado",
        amount: 850,
        kind: "income",
        scope: "business",
        scopeLabel: "Empresarial",
        category: "Venda Direta",
        status: "settled",
        statusLabel: "Recebido",
        date: "2026-04-03",
        dueDate: "2026-04-03",
        partner: "Cliente recorrente",
        timeLabel: "14:30",
        icon: "sparkles",
      },
      {
        id: "hist-2",
        title: "Baloes e fitas",
        amount: 124,
        kind: "expense",
        scope: "business",
        scopeLabel: "Empresarial",
        category: "Fornecedor",
        status: "pending",
        statusLabel: "A pagar",
        date: "2026-04-03",
        dueDate: "2026-04-03",
        partner: "Compra de material",
        timeLabel: "10:15",
        icon: "shopping-bag",
      },
    ],
  },
  {
    id: "group-yesterday",
    label: "Ontem",
    dateLabel: "02 de Abril",
    items: [
      {
        id: "hist-3",
        title: "Almoco da familia",
        amount: 68,
        kind: "expense",
        scope: "personal",
        scopeLabel: "Pessoal",
        category: "Lazer",
        status: "settled",
        statusLabel: "Pago",
        date: "2026-04-02",
        dueDate: "2026-04-02",
        partner: "Despesa pessoal",
        timeLabel: "13:45",
        icon: "wallet",
      },
      {
        id: "hist-4",
        title: "Sinal casamento Ana",
        amount: 1500,
        kind: "income",
        scope: "business",
        scopeLabel: "Empresarial",
        category: "Reserva",
        status: "settled",
        statusLabel: "Recebido",
        date: "2026-04-02",
        dueDate: "2026-04-02",
        partner: "Cliente novo",
        timeLabel: "09:00",
        icon: "sale",
      },
    ],
  },
];

export const transactionCategories: TransactionCategory[] = [
  { id: "cat-1", name: "Material", tipo: "DESPESA", isDefault: true, icon: "box" },
  { id: "cat-2", name: "Frete", tipo: "DESPESA", isDefault: true, icon: "briefcase" },
  { id: "cat-3", name: "Embalagem", tipo: "DESPESA", isDefault: true, icon: "tag" },
  { id: "cat-4", name: "Venda", tipo: "RECEITA", isDefault: true, icon: "sale" },
];

export const settingsCategories: SettingsCategory[] = [
  {
    id: "set-cat-1",
    name: "Festas de luxo",
    groupLabel: "Entradas",
    icon: "sparkles",
    tone: "secondary",
  },
  {
    id: "set-cat-2",
    name: "Insumos de papel",
    groupLabel: "Saidas",
    icon: "box",
    tone: "danger",
  },
];

export const notificationPreferences: NotificationPreference[] = [
  {
    id: "notif-1",
    title: "Lembrete do DAS",
    schedule: "Aviso todo dia 20 de cada mes",
    enabled: true,
  },
  {
    id: "notif-2",
    title: "Resumo diario",
    schedule: "Balanco do dia as 19:00",
    enabled: false,
  },
];

export const loginHighlights = [
  "Visao rapida do saldo e do lucro do mes.",
  "Registro simples de entradas e saidas.",
  "Historico claro para separar pessoal e empresarial.",
];
