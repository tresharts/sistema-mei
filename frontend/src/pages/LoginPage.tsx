import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import AppIcon from "../components/ui/AppIcon";
import Input from "../components/ui/Input";
import { loginHighlights } from "../data/mockData";
import { ROUTE_PATHS } from "../lib/constants";

function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(ROUTE_PATHS.dashboard);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none fixed left-[-4rem] top-24 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-3rem] right-[-2rem] h-48 w-48 rounded-full bg-tertiary-container/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-between">
        <section className="space-y-6 pt-6">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Sistema MEI
          </span>

          <div className="space-y-3">
            <h1 className="max-w-[12ch] font-headline text-4xl font-extrabold leading-tight tracking-tight text-on-surface">
              Controle financeiro simples para o seu atelie.
            </h1>
            <p className="max-w-[32ch] text-sm leading-6 text-on-surface-variant">
              Interface acolhedora, mobile-first e pronta para receber autenticacao
              real com Spring Boot nas proximas etapas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {loginHighlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-secondary">
                  <AppIcon name="sparkles" />
                </div>
                <p className="text-sm text-on-surface">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] rounded-bl-xl bg-surface-container-lowest p-6 shadow-[0_16px_40px_rgba(52,50,47,0.08)]">
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-on-surface-variant">
              Entrar na sua conta
            </p>
            <h2 className="font-headline text-2xl font-bold text-primary">
              Continue de onde parou
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="email">
                E-mail
              </label>
              <Input id="email" placeholder="seuemail@exemplo.com" type="email" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="password">
                Senha
              </label>
              <Input id="password" placeholder="Digite sua senha" type="password" />
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Ambiente inicial sem API real</span>
              <button className="font-semibold text-primary" type="button">
                Esqueci a senha
              </button>
            </div>

            <Button className="font-headline text-base font-bold" fullWidth type="submit">
              Entrar no prototipo
            </Button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-on-surface-variant">
            Ao entrar, voce acessa as telas iniciais de dashboard, historico,
            movimentacoes e ajustes com dados mockados.
          </p>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
