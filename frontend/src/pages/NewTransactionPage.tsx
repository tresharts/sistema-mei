import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../lib/constants";
import TransactionForm, { TransactionFormData } from "../components/transactions/TransactionForm";
import { transactionService } from "../services/transactionsServices"; // Descomente depois
import { transactionCategories } from "../data/mockData";
import { toast } from "sonner";

function NewTransactionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Dados prontos para a API:", data);
      
      await transactionService.createTransaction(data);
      
      // Simulação de tempo de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Movimentação guardada com sucesso!", {
          description: `${data.description} no valor de R$ ${data.amount} foi registrada.`,
          duration: 4000,
      });
      navigate(ROUTE_PATHS.history || "/historico");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao guardar a movimentação." , {
          description: "Por favor, tente novamente mais tarde."
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

      <TransactionForm 
        categories={transactionCategories} 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
      />

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