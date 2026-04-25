import {api} from '../lib/api';
import { formatShortDate } from '../lib/format';
import type { 
    apiTransaction,
    TransactionKind,
    TransactionItem,
    TransactionScope,
    TransactionStatus
} from '../types/finance';
import { IconName } from '../types/ui';


export function mapTransactiontoFrontend(apiData: apiTransaction): TransactionItem {
    const kind: TransactionKind = apiData.tipo === 'RECEITA' ? 'income' : 'expense';

    const scope: TransactionScope = apiData.classificacao === 'EMPRESARIAL' ? 'business' : 'personal';
    const scopeLabel = apiData.classificacao === 'EMPRESARIAL' ? 'Empresa' : 'Pessoal';

    let status: TransactionStatus = 'pending';
    let statusLabel: string = 'Pendente';

    switch (apiData.status) {
        case 'PAGA':
            status = 'settled'; statusLabel = 'Paga';
            break;
        case 'RECEBIDO':
            status = 'settled'; statusLabel = 'Recebida';
            break;
        case 'A_PAGAR':
            status = 'pending'; statusLabel = 'A Pagar';
            break;
        case 'A_RECEBER':
            status = 'pending'; statusLabel = 'A Receber';
            break;
        case 'VENCIDO':
            status = 'overdue'; statusLabel = 'Vencida';
            break;
    }

    const icon: IconName = kind === 'income' ? 'arrow-up' : 'arrow-down';

    return {
        id: apiData.id,
        title: apiData.descricao,
        amount: apiData.valor,
        kind,
        scope,
        scopeLabel,
        category: apiData.categoria,
        status,
        statusLabel,
        date: apiData.dataMovimentacao,
        dueDate: apiData.dataVencimento,
        timeLabel: formatShortDate(apiData.dataMovimentacao),
        icon,
    };
}


export const TransactionService = {
    async getAllTransactions(): Promise<TransactionItem[]> {
        const response = await api.get<apiTransaction[]>('/caminho da função de movimentacao no back');
        return response.data.map(mapTransactiontoFrontend);
    },

    async createTransaction(dados: Partial<apiTransaction>): Promise<void> {
        await api.post('/caminho da função de movimentação no back', dados);
    },

    async deleteTransaction(id: string): Promise<void> {
        await api.delete(`/caminho da função de movimentacao no back/${id}`);
    }
}