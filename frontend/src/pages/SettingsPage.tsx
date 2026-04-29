import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import AppIcon from "../components/ui/AppIcon";
import { notificationPreferences } from "../data/mockData";
import { ROUTE_PATHS } from "../lib/constants";
import { api } from "../lib/api";
import {
  categoriesService,
  type CategoryFormPayload,
} from "../services/categoriesService";
import type { ApiTransactionKind, TransactionCategory } from "../types/finance";

type ApiErrorResponse = {
  detail?: string;
  title?: string;
  message?: string;
};

type CategoryModalState =
  | { mode: "create"; category?: undefined }
  | { mode: "edit"; category: TransactionCategory };

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.detail ?? data?.message ?? data?.title;
  }

  return undefined;
}

function getCategoryGroupLabel(tipo: ApiTransactionKind) {
  return tipo === "RECEITA" ? "Receita" : "Despesa";
}

function SettingsPage() {
  const [notifications, setNotifications] = useState(notificationPreferences);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<TransactionCategory | null>(null);
  const navigate = useNavigate();

  const customCategoriesCount = useMemo(
    () => categories.filter((category) => !category.isDefault).length,
    [categories],
  );

  async function loadCategories() {
    try {
      setIsLoadingCategories(true);
      const [incomeCategories, expenseCategories] = await Promise.all([
        categoriesService.getAllCategories("RECEITA"),
        categoriesService.getAllCategories("DESPESA"),
      ]);

      setCategories([...incomeCategories, ...expenseCategories]);
    } catch (error) {
      toast.error("Erro ao carregar categorias.", {
        description: getErrorMessage(error) ?? "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = async (payload: CategoryFormPayload) => {
    try {
      if (categoryModal?.mode === "edit") {
        await categoriesService.updateCategory(categoryModal.category.id, payload);
        toast.success("Categoria atualizada.");
      } else {
        await categoriesService.createCategory(payload);
        toast.success("Categoria criada.");
      }

      setCategoryModal(null);
      await loadCategories();
    } catch (error) {
      toast.error("Erro ao salvar categoria.", {
        description: getErrorMessage(error) ?? "Verifique os dados e tente novamente.",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete || categoryToDelete.isDefault) {
      return;
    }

    try {
      await categoriesService.deleteCategory(categoryToDelete.id);
      toast.success("Categoria excluída.");
      setCategoryToDelete(null);
      await loadCategories();
    } catch (error) {
      toast.error("Erro ao excluir categoria.", {
        description:
          getErrorMessage(error) ??
          "Categorias vinculadas a movimentacoes podem exigir ajustes antes da exclusao.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await api.delete("/auth/logout");
    } catch (error) {
      console.warn("Não foi possível revogar sessão no backend:", error);
    } finally {
      localStorage.removeItem("acessToken");
      localStorage.removeItem("refreshToken");
      navigate(ROUTE_PATHS.login, { replace: true });
    }
  };

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center gap-5 rounded-[1.5rem] rounded-bl-lg bg-surface-container-lowest p-6 shadow-editorial">
          <div className="relative">
            <Avatar initials="CO" size="lg" />
            <button
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg"
              type="button"
            >
              <AppIcon className="h-4 w-4" name="edit" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="font-headline text-xl font-bold text-on-surface">
              Atelie Florescer
            </h2>
            <p className="text-sm font-medium text-on-surface-variant">
              Clara Oliveira
            </p>
            <span className="mt-2 inline-block rounded-full bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-container">
              Artesa individual
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <AppIcon className="text-primary" name="document" />
          <h3 className="font-headline font-bold text-on-surface">Guia DAS</h3>
        </div>

        <div className="space-y-4 rounded-2xl bg-surface-container-low p-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-on-surface-variant">
              Valor mensal fixo
            </span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">
                R$
              </span>
              <input
                className="h-14 w-full rounded-xl border-none bg-surface-container-lowest pl-12 pr-4 font-headline text-lg font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                defaultValue="72.00"
                type="number"
                step="0.01"
              />
            </div>
          </label>
          <p className="px-1 text-[11px] leading-relaxed text-on-surface-variant">
            Este valor sera usado no futuro para calcular automaticamente os
            custos fixos obrigatorios do MEI.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <AppIcon className="text-secondary" name="tag" />
            <div>
              <h3 className="font-headline font-bold text-on-surface">Categorias</h3>
              <p className="text-xs text-on-surface-variant">
                {customCategoriesCount} personalizadas
              </p>
            </div>
          </div>
          <button
            className="inline-flex h-10 items-center gap-1 rounded-lg px-2 text-sm font-bold text-primary transition hover:bg-primary/5"
            onClick={() => setCategoryModal({ mode: "create" })}
            type="button"
          >
            <AppIcon className="h-4 w-4" name="plus" />
            Nova
          </button>
        </div>

        {isLoadingCategories ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-surface-container-low"
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onDelete={() => setCategoryToDelete(category)}
                onEdit={() => setCategoryModal({ mode: "edit", category })}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            Nenhuma categoria encontrada.
          </div>
        )}

        <button
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant/40 text-on-surface-variant transition hover:bg-surface-container-high"
          onClick={() => setCategoryModal({ mode: "create" })}
          type="button"
        >
          <AppIcon name="plus" />
          <span className="text-sm font-medium">Nova categoria</span>
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <AppIcon className="text-tertiary" name="bell" />
          <h3 className="font-headline font-bold text-on-surface">Notificações</h3>
        </div>

        <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-editorial">
          {notifications.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-bold text-on-surface">{item.title}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {item.schedule}
                  </p>
                </div>

                <button
                  aria-label={`Alternar ${item.title}`}
                  className={
                    item.enabled
                      ? "flex h-6 w-12 items-center justify-end rounded-full bg-primary px-1"
                      : "flex h-6 w-12 items-center justify-start rounded-full bg-outline-variant/30 px-1"
                  }
                  onClick={() =>
                    setNotifications((current) =>
                      current.map((notification) =>
                        notification.id === item.id
                          ? { ...notification, enabled: !notification.enabled }
                          : notification,
                      ),
                    )
                  }
                  type="button"
                >
                  <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {index < notifications.length - 1 ? (
                <div className="mx-4 h-px bg-surface-container-low" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-primary/5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <AppIcon className="text-primary" name="heart" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface">
              Precisa de um abraço?
            </h3>
            <p className="text-xs text-on-surface-variant">
              Estamos aqui para cuidar do seu negócio.
            </p>
          </div>
        </div>

        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-surface-container-lowest text-sm font-bold text-primary transition hover:bg-primary/5"
          type="button"
        >
          <AppIcon className="h-4 w-4" name="chat" />
          Conversar com suporte
        </button>
      </section>

      <div className="space-y-6 pb-8 pt-2">
        <button
          onClick={handleLogout}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-surface-container-high font-bold text-error transition hover:bg-surface-container-highest"
          type="button"
        >
          <AppIcon name="logout" />
          Sair da conta
        </button>
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
          Sistema MEI v0.1.0
        </p>
      </div>

      {categoryModal ? (
        <CategoryFormModal
          modalState={categoryModal}
          onClose={() => setCategoryModal(null)}
          onSubmit={handleSaveCategory}
        />
      ) : null}

      {categoryToDelete ? (
        <DeleteCategoryModal
          category={categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={handleDeleteCategory}
        />
      ) : null}
    </div>
  );
}

function CategoryCard({
  category,
  onDelete,
  onEdit,
}: {
  category: TransactionCategory;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const isIncome = category.tipo === "RECEITA";

  return (
    <article
      className={
        isIncome
          ? "rounded-xl border border-secondary/10 bg-secondary-container/30 p-4"
          : "rounded-xl border border-error/10 bg-error-container/10 p-4"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={
            isIncome
              ? "flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container text-secondary"
              : "flex h-8 w-8 items-center justify-center rounded-lg bg-error-container/40 text-error"
          }
        >
          <AppIcon className="h-4 w-4" name={category.icon} />
        </div>

        {category.isDefault ? (
          <span className="rounded-full bg-surface-container-lowest px-2 py-1 text-[10px] font-bold text-on-surface-variant">
            Padrão
          </span>
        ) : (
          <div className="flex gap-1">
            <button
              aria-label={`Editar categoria ${category.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-lowest hover:text-primary"
              onClick={onEdit}
              type="button"
            >
              <AppIcon className="h-4 w-4" name="edit" />
            </button>
            <button
              aria-label={`Excluir categoria ${category.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-lowest hover:text-error"
              onClick={onDelete}
              type="button"
            >
              <AppIcon className="h-4 w-4" name="trash" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 truncate text-sm font-bold text-on-surface">{category.name}</p>
      <p className="text-xs text-on-surface-variant">
        {getCategoryGroupLabel(category.tipo)}
      </p>
    </article>
  );
}

function CategoryFormModal({
  modalState,
  onClose,
  onSubmit,
}: {
  modalState: CategoryModalState;
  onClose: () => void;
  onSubmit: (payload: CategoryFormPayload) => Promise<void>;
}) {
  const [name, setName] = useState(modalState.category?.name ?? "");
  const [tipo, setTipo] = useState<ApiTransactionKind>(
    modalState.category?.tipo ?? "DESPESA",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title =
    modalState.mode === "edit" ? "Editar categoria" : "Nova categoria";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Informe o nome da categoria.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ nome: trimmedName, tipo });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <form
        className="modal-panel"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AppIcon name="tag" />
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              {title}
            </h2>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low"
            onClick={onClose}
            type="button"
          >
            <AppIcon name="close" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <label className="block space-y-2">
            <span className="px-1 text-sm font-medium text-on-surface-variant">
              Nome
            </span>
            <Input
              autoFocus
              className="bg-surface-container-low"
              maxLength={120}
              placeholder="Ex: Marketing"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <div className="space-y-2">
            <span className="px-1 text-sm font-medium text-on-surface-variant">
              Tipo
            </span>
            <div className="rounded-2xl bg-surface-container-low p-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  className={
                    tipo === "RECEITA"
                      ? "flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary-container font-semibold text-on-secondary-container shadow-sm"
                      : "flex h-12 items-center justify-center gap-2 rounded-xl font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                  }
                  onClick={() => setTipo("RECEITA")}
                  type="button"
                >
                  <AppIcon className="h-4 w-4" name="sale" />
                  Receita
                </button>
                <button
                  className={
                    tipo === "DESPESA"
                      ? "flex h-12 items-center justify-center gap-2 rounded-xl bg-error-container/25 font-semibold text-error shadow-sm"
                      : "flex h-12 items-center justify-center gap-2 rounded-xl font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                  }
                  onClick={() => setTipo("DESPESA")}
                  type="button"
                >
                  <AppIcon className="h-4 w-4" name="tag" />
                  Despesa
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-surface-container-low px-5 py-4">
          <Button fullWidth variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button fullWidth isLoading={isSubmitting} type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}

function DeleteCategoryModal({
  category,
  onClose,
  onConfirm,
}: {
  category: TransactionCategory;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="space-y-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-error-container/40 text-error">
            <AppIcon name="trash" />
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface">
              Excluir categoria?
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              A categoria {category.name} será removida das configurações. Revise
              antes se ela já foi usada em movimentações.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-surface-container-low px-5 py-4">
          <Button fullWidth variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            className="bg-error text-on-primary shadow-none hover:bg-error/90"
            fullWidth
            isLoading={isDeleting}
            onClick={handleConfirm}
            type="button"
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
