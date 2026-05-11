import { useEffect, useMemo, useRef, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import AppIcon from "../components/ui/AppIcon";
import Modal from "../components/ui/Modal";
import { ROUTE_PATHS } from "../lib/constants";
import { api } from "../lib/api";
import { clearAccessToken } from "../lib/session";
import { USER_SETTINGS_UPDATED_EVENT } from "../lib/settingsEvents";
import {
  categoriesService,
  type CategoryFormPayload,
} from "../services/categoriesService";
import {
  settingsService,
  type UserSettings,
  type UserSettingsPayload,
} from "../services/settingsService";
import type {
  ApiTransactionKind,
  ApiTransactionScope,
  TransactionCategory,
} from "../types/finance";

type ApiErrorResponse = {
  detail?: string;
  title?: string;
  message?: string;
};

type CategoryModalState =
  | { mode: "create"; category?: undefined }
  | { mode: "edit"; category: TransactionCategory };

type NotificationSettingKey = "lembreteDasAtivo";

type SettingsFormState = {
  nomeNegocio: string;
  atividade: string;
  valorDas: string;
  lembreteDasAtivo: boolean;
  resumoDiarioAtivo: boolean;
};

const defaultSettingsForm: SettingsFormState = {
  nomeNegocio: "",
  atividade: "",
  valorDas: "72.00",
  lembreteDasAtivo: true,
  resumoDiarioAtivo: false,
};

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

function getCategoryScopeLabel(classificacao: ApiTransactionScope) {
  return classificacao === "EMPRESARIAL" ? "Empresarial" : "Pessoal";
}

function toDecimalInput(value: number) {
  return Number(value).toFixed(2);
}

function toNullableText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function parseDasValue(value: string) {
  const parsedValue = Number(value.replace(",", "."));

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error("Informe um valor de DAS maior que zero.");
  }

  if (parsedValue > 1000000) {
    throw new Error("O valor do DAS deve ser menor ou igual a R$ 1.000.000,00.");
  }

  return Number(parsedValue.toFixed(2));
}

function sortCategoriesByName(a: TransactionCategory, b: TransactionCategory) {
  return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
}

function toSettingsForm(settings: UserSettings): SettingsFormState {
  return {
    nomeNegocio: settings.nomeNegocio ?? "",
    atividade: settings.atividade ?? "",
    valorDas: toDecimalInput(settings.valorDas),
    lembreteDasAtivo: settings.lembreteDasAtivo,
    resumoDiarioAtivo: settings.resumoDiarioAtivo,
  };
}

function toSettingsPayload(form: SettingsFormState): UserSettingsPayload {
  return {
    valorDas: parseDasValue(form.valorDas),
    nomeNegocio: toNullableText(form.nomeNegocio),
    atividade: toNullableText(form.atividade),
    lembreteDasAtivo: form.lembreteDasAtivo,
    resumoDiarioAtivo: form.resumoDiarioAtivo,
  };
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "ME";
}

function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [settingsForm, setSettingsForm] =
    useState<SettingsFormState>(defaultSettingsForm);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<TransactionCategory | null>(null);
  const businessNameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const customCategoriesCount = useMemo(
    () => categories.filter((category) => !category.isDefault).length,
    [categories],
  );
  const customCategories = useMemo(
    () => categories.filter((category) => !category.isDefault),
    [categories],
  );
  const customIncomeCategories = useMemo(
    () =>
      customCategories
        .filter((category) => category.tipo === "RECEITA")
        .sort(sortCategoriesByName),
    [customCategories],
  );
  const customExpenseCategories = useMemo(
    () =>
      customCategories
        .filter((category) => category.tipo === "DESPESA")
        .sort(sortCategoriesByName),
    [customCategories],
  );

  const notificationItems = useMemo<
    Array<{
      id: NotificationSettingKey;
      title: string;
      schedule: string;
      enabled: boolean;
    }>
  >(
    () => [
      {
        id: "lembreteDasAtivo",
        title: "Lembrete do DAS",
        schedule: "Aviso todo dia 20 de cada mes",
        enabled: settingsForm.lembreteDasAtivo,
      },
    ],
    [settingsForm.lembreteDasAtivo],
  );

  const userName = settings?.nomeUsuario ?? "Usuário MEI";
  const businessName = settingsForm.nomeNegocio.trim() || "Meu negócio MEI";
  const activityName =
    settingsForm.atividade.trim() || "Microempreendedor individual";
  const userInitials = getInitials(settingsForm.nomeNegocio || userName);

  function applyLoadedSettings(loadedSettings: UserSettings) {
    setSettings(loadedSettings);
    setSettingsForm(toSettingsForm(loadedSettings));
  }

  async function loadSettings() {
    try {
      setIsLoadingSettings(true);
      const loadedSettings = await settingsService.getSettings();
      applyLoadedSettings(loadedSettings);
    } catch (error) {
      toast.error("Erro ao carregar configurações.", {
        description: getErrorMessage(error) ?? "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsLoadingSettings(false);
    }
  }

  async function loadCategories() {
    try {
      setIsLoadingCategories(true);
      const loadedCategories = await categoriesService.getAllCategories();

      setCategories(loadedCategories);
    } catch (error) {
      toast.error("Erro ao carregar categorias.", {
        description: getErrorMessage(error) ?? "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadSettings();
    loadCategories();
  }, []);

  const handleSettingsFieldChange = <K extends keyof SettingsFormState>(
    field: K,
    value: SettingsFormState[K],
  ) => {
    setSettingsForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveSettings = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    let payload: UserSettingsPayload;
    try {
      payload = toSettingsPayload(settingsForm);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Verifique os dados das configurações.",
      );
      return;
    }

    try {
      setIsSavingSettings(true);
      const updatedSettings = await settingsService.updateSettings(payload);
      applyLoadedSettings(updatedSettings);
      window.dispatchEvent(
        new CustomEvent(USER_SETTINGS_UPDATED_EVENT, { detail: updatedSettings }),
      );
      toast.success("Configurações salvas.");
    } catch (error) {
      toast.error("Erro ao salvar configurações.", {
        description: getErrorMessage(error) ?? "Verifique os dados e tente novamente.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleNotification = (field: NotificationSettingKey) => {
    setSettingsForm((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleSaveCategory = async (payload: CategoryFormPayload) => {
    try {
      if (categoryModal?.mode === "edit") {
        const updatedCategory = await categoriesService.updateCategory(
          categoryModal.category.id,
          payload,
        );
        setCategories((current) =>
          current.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
        );
        toast.success("Categoria atualizada.");
      } else {
        const createdCategory = await categoriesService.createCategory(payload);
        setCategories((current) =>
          [...current, createdCategory].sort(sortCategoriesByName),
        );
        toast.success("Categoria criada.");
      }

      setCategoryModal(null);
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

    const categoryId = categoryToDelete.id;

    try {
      await categoriesService.deleteCategory(categoryId);
      setCategories((current) =>
        current.filter((category) => category.id !== categoryId),
      );
      toast.success("Categoria excluída.");
      setCategoryToDelete(null);
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
      clearAccessToken();
      navigate(ROUTE_PATHS.login, { replace: true });
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
      <div className="space-y-10 lg:sticky lg:top-24">
      <section className="space-y-4">
        <div className="flex items-center gap-5 rounded-[1.5rem] rounded-bl-lg bg-surface-container-lowest p-6 shadow-editorial">
          <div className="relative">
            <Avatar initials={userInitials} size="lg" />
            <button
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg"
              aria-label="Editar dados do negócio"
              disabled={isLoadingSettings}
              onClick={() => businessNameInputRef.current?.focus()}
              type="button"
            >
              <AppIcon className="h-4 w-4" name="edit" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="break-words font-headline text-xl font-bold text-on-surface">
              {isLoadingSettings ? "Carregando..." : businessName}
            </h2>
            <p className="break-words text-sm font-medium text-on-surface-variant">
              {userName}
            </p>
            <span className="mt-2 inline-block max-w-full break-words rounded-full bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-container">
              {activityName}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-primary/5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <AppIcon className="text-primary" name="heart" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface">
              Alguma dúvida?
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
          BoraMEI v0.1.0
        </p>
      </div>
      </div>

      <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <AppIcon className="text-primary" name="document" />
          <h3 className="font-headline font-bold text-on-surface">Dados e DAS</h3>
        </div>

        <form
          className="space-y-4 rounded-2xl bg-surface-container-low p-5"
          onSubmit={handleSaveSettings}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              ref={businessNameInputRef}
              disabled={isLoadingSettings || isSavingSettings}
              label="Nome do negócio"
              maxLength={120}
              placeholder="Ex: Atelie Florescer"
              value={settingsForm.nomeNegocio}
              onChange={(event) =>
                handleSettingsFieldChange("nomeNegocio", event.target.value)
              }
            />
            <Input
              disabled={isLoadingSettings || isSavingSettings}
              label="Atividade"
              maxLength={120}
              placeholder="Ex: Artesa individual"
              value={settingsForm.atividade}
              onChange={(event) =>
                handleSettingsFieldChange("atividade", event.target.value)
              }
            />
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-on-surface-variant">
              Valor mensal fixo do DAS
            </span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">
                R$
              </span>
              <input
                className="h-14 w-full rounded-xl border-none bg-surface-container-lowest pl-12 pr-4 font-headline text-lg font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoadingSettings || isSavingSettings}
                inputMode="decimal"
                maxLength={13}
                placeholder="72.00"
                type="text"
                value={settingsForm.valorDas}
                onChange={(event) =>
                  handleSettingsFieldChange("valorDas", event.target.value)
                }
              />
            </div>
          </label>
          <p className="px-1 text-[11px] leading-relaxed text-on-surface-variant">
            Este valor sera usado para calcular automaticamente os custos fixos
            obrigatorios do MEI.
          </p>

          <Button
            fullWidth
            disabled={isLoadingSettings}
            isLoading={isSavingSettings}
            type="submit"
          >
            Salvar configurações
          </Button>
        </form>
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
        ) : customCategoriesCount > 0 ? (
          <div className="space-y-5">
            <CategoryListGroup
              categories={customIncomeCategories}
              title="Receita"
              onDelete={(category) => setCategoryToDelete(category)}
              onEdit={(category) => setCategoryModal({ mode: "edit", category })}
            />
            <CategoryListGroup
              categories={customExpenseCategories}
              title="Despesa"
              onDelete={(category) => setCategoryToDelete(category)}
              onEdit={(category) => setCategoryModal({ mode: "edit", category })}
            />
          </div>
        ) : (
          <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            Nenhuma categoria personalizada encontrada.
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
          {notificationItems.map((item, index) => (
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
                      ? "flex h-6 w-12 items-center rounded-full bg-primary px-1 transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                      : "flex h-6 w-12 items-center rounded-full bg-outline-variant/30 px-1 transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                  }
                  disabled={isLoadingSettings || isSavingSettings}
                  onClick={() => handleToggleNotification(item.id)}
                  type="button"
                >
                  <span
                    className={
                      item.enabled
                        ? "h-4 w-4 translate-x-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out"
                        : "h-4 w-4 translate-x-0 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out"
                    }
                  />
                </button>
              </div>

              {index < notificationItems.length - 1 ? (
                <div className="mx-4 h-px bg-surface-container-low" />
              ) : null}
            </div>
          ))}
        </div>

        <Button
          fullWidth
          disabled={isLoadingSettings}
          isLoading={isSavingSettings}
          onClick={() => void handleSaveSettings()}
          type="button"
        >
          Salvar preferências
        </Button>
      </section>

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
        {getCategoryGroupLabel(category.tipo)} • {getCategoryScopeLabel(category.classificacao)}
      </p>
    </article>
  );
}

function CategoryListGroup({
  categories,
  title,
  onDelete,
  onEdit,
}: {
  categories: TransactionCategory[];
  title: "Receita" | "Despesa";
  onDelete: (category: TransactionCategory) => void;
  onEdit: (category: TransactionCategory) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          {title}
        </h4>
        <span className="text-xs text-on-surface-variant">{categories.length}</span>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onDelete={() => onDelete(category)}
              onEdit={() => onEdit(category)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-surface-container-low p-4 text-xs text-on-surface-variant">
          Nenhuma categoria personalizada de {title.toLowerCase()}.
        </div>
      )}
    </div>
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
  const [classificacao, setClassificacao] = useState<ApiTransactionScope>(
    modalState.category?.classificacao ?? "EMPRESARIAL",
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
      await onSubmit({ nome: trimmedName, tipo, classificacao });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      contentClassName="space-y-5"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button fullWidth variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button fullWidth isLoading={isSubmitting} type="submit">
            Salvar
          </Button>
        </div>
      }
      formProps={{ onSubmit: handleSubmit }}
      icon="tag"
      title={title}
      onClose={onClose}
    >
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

          <div className="space-y-2">
            <span className="px-1 text-sm font-medium text-on-surface-variant">
              Classificação
            </span>
            <div className="rounded-2xl bg-surface-container-low p-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  className={
                    classificacao === "EMPRESARIAL"
                      ? "flex h-12 items-center justify-center gap-2 rounded-xl bg-primary/10 font-semibold text-primary ring-2 ring-primary/20"
                      : "flex h-12 items-center justify-center gap-2 rounded-xl font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                  }
                  onClick={() => setClassificacao("EMPRESARIAL")}
                  type="button"
                >
                  <AppIcon className="h-4 w-4" name="briefcase" />
                  Empresarial
                </button>
                <button
                  className={
                    classificacao === "PESSOAL"
                      ? "flex h-12 items-center justify-center gap-2 rounded-xl bg-primary/10 font-semibold text-primary ring-2 ring-primary/20"
                      : "flex h-12 items-center justify-center gap-2 rounded-xl font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                  }
                  onClick={() => setClassificacao("PESSOAL")}
                  type="button"
                >
                  <AppIcon className="h-4 w-4" name="user" />
                  Pessoal
                </button>
              </div>
            </div>
          </div>
    </Modal>
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
    <Modal
      contentClassName="space-y-4"
      footer={
        <div className="grid grid-cols-2 gap-3">
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
      }
      onClose={onClose}
    >
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
    </Modal>
  );
}

export default SettingsPage;
