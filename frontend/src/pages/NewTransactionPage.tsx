import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../lib/constants";
import TransactionForm, { TransactionFormData } from "../components/transactions/TransactionForm";
import { transactionService } from "../services/transactionsServices";
import { categoriesService } from "../services/categoriesService";
import type { TransactionCategory } from "../types/finance";
import { toast } from "sonner";

type ApiErrorResponse = {
  detail?: string;
  title?: string;
  message?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.detail ?? data?.message ?? data?.title;
  }

  return undefined;
}

function NewTransactionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);

  useEffect(() => {
    let shouldUpdate = true;

    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const [incomeCategories, expenseCategories] = await Promise.all([
          categoriesService.getAllCategories("RECEITA"),
          categoriesService.getAllCategories("DESPESA"),
        ]);

        if (shouldUpdate) {
          setCategories([...incomeCategories, ...expenseCategories]);
        }
      } catch (error) {
        toast.error("Erro ao carregar categorias.", {
          description: getErrorMessage(error) ?? "Tente novamente em alguns instantes.",
        });
      } finally {
        if (shouldUpdate) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const handleSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      await transactionService.createTransaction(data);

      toast.success("Movimentação guardada com sucesso!", {
          description: `${data.description} no valor de R$ ${data.amount} foi registrada.`,
          duration: 4000,
      });
      navigate(ROUTE_PATHS.history || "/historico");
    } catch (error) {
      toast.error("Erro ao guardar a movimentação." , {
          description: getErrorMessage(error) ?? "Por favor, tente novamente mais tarde."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
          Nova Movimentação
        </h2>
        <p className="text-sm text-on-surface-variant">
          Registe uma nova entrada ou saída.
        </p>
      </header>

      {isLoadingCategories ? (
        <div className="rounded-2xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
          Carregando categorias...
        </div>
      ) : categories.length > 0 ? (
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      ) : (
        <div className="rounded-2xl bg-error-container/10 p-6 text-sm text-error">
          Nenhuma categoria encontrada para registrar movimentações.
        </div>
      )}

      <Link
        className="flex h-14 w-full items-center justify-center rounded-xl text-outline transition hover:bg-surface-container-low font-medium mt-4"
        to={ROUTE_PATHS.dashboard || "/"}
      >
        Cancelar e voltar
      </Link>
    </div>
  );
}

export default NewTransactionPage;
