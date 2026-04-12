import { useState } from "react";
import { useNavigate} from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import AppIcon from "../components/ui/AppIcon";
import {notificationPreferences, settingsCategories, } from "../data/mockData";

import { ROUTE_PATHS } from "../lib/constants";
import { api } from "../lib/api";
  
function SettingsPage() {
  const [notifications, setNotifications] = useState(notificationPreferences);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.delete("/auth/logout");
    } catch (error) {
      console.warn("Nao foi possivel revogar sessao no backend:", error);
    } finally {
      localStorage.removeItem("acessToken");
      localStorage.removeItem("refreshToken");
      localStorage.clear();
      navigate(ROUTE_PATHS.login, {replace: true});
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
            </button>x
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
                className=" h-14 w-full rounded-xl border-none bg-surface-container-lowest pl-12 pr-4 font-headline text-lg font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <AppIcon className="text-secondary" name="tag" />
            <h3 className="font-headline font-bold text-on-surface">Categorias</h3>
          </div>
          <button className="text-sm font-bold text-primary" type="button">
            Ver todas
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {settingsCategories.map((category) => (
            <div
              key={category.id}
              className={
                category.tone === "secondary"
                  ? "rounded-xl border border-secondary/10 bg-secondary-container/30 p-4"
                  : "rounded-xl border border-error/10 bg-error-container/10 p-4"
              }
            >
              <div
                className={
                  category.tone === "secondary"
                    ? "mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container text-secondary"
                    : "mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-error-container/40 text-error"
                }
              >
                <AppIcon className="h-4 w-4" name={category.icon} />
              </div>
              <p className="text-xs font-bold text-on-surface">{category.name}</p>
              <p className="text-[10px] text-on-surface-variant">
                {category.groupLabel}
              </p>
            </div>
          ))}

          <button
            className="col-span-2 flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant/40 text-on-surface-variant transition hover:bg-surface-container-high"
            type="button"
          >
            <AppIcon name="plus" />
            <span className="text-sm font-medium">Nova categoria</span>
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <AppIcon className="text-tertiary" name="bell" />
          <h3 className="font-headline font-bold text-on-surface">Notificacoes</h3>
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
              Precisa de um abraco?
            </h3>
            <p className="text-xs text-on-surface-variant">
              Estamos aqui para cuidar do seu negocio.
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
    </div>
  );
}

export default SettingsPage;
