import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../lib/api";
import Input from "../components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import AppIcon from "../components/ui/AppIcon";
import { ROUTE_PATHS } from "../lib/constants";
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha curta demais"),
});

const loginHighlights = [
  "Gestão de vendas rápida",
  "Relatórios automáticos",
  "Segurança de nível bancário"
];

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  
  // Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  //(Passo 2)
  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post("/auth/login", data);
      const { acessToken, refreshToken } = response.data;

      localStorage.setItem("acessToken", acessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      navigate(ROUTE_PATHS.dashboard);
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.response || error);
      alert("Falha no login. Verifique suas credenciais.");
    }
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

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="email">
                E-mail
              </label>
              <Input
                {...register("email")} 
                id="email" 
                placeholder="seuemail@exemplo.com" 
                type="email"
                error={errors.email?.message}
                />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between"> 
                  <label className="text-sm font-medium text-on-surface-variant flex  flex-order-1" htmlFor="senha">
                    Senha
                  </label>
                  <button className="font-semibold text-primary flex-order-0" type="button">
                    <Link to={ROUTE_PATHS.esqueciSenha}>
                      Esqueci minha senha
                    </Link>

                  </button>
              
              </div>
              <Input 
                {...register("senha")}
                id="password" 
                placeholder="Digite sua senha" 
                type="password"
                error={errors.senha?.message}
                
                />
            </div>

        

            <Button 
                className="font-headline text-base font-bold" 
                fullWidth type="submit"
                typeof="submit"
                >
              Entrar 
            </Button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
             Não tem uma conta?{" "}
             <Link 
               to={ROUTE_PATHS.cadastro} 
              className="font-bold text-primary hover:underline transition-all"   
              >
              Cadastre-se agora
              </Link>
            </p>
          </footer>
          {/* <p className="mt-5 text-center text-xs leading-5 text-on-surface-variant">
            Ao entrar, voce acessa as telas iniciais de dashboard, historico,
            movimentacoes e ajustes com dados mockados.
          </p> */}
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
