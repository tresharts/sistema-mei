import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../lib/api";
import Input from "../components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import AppIcon from "../components/ui/AppIcon";
import { ROUTE_PATHS } from "../lib/constants";
import { useState } from "react";
import { useLocation } from "react-router-dom";

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
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const location = useLocation();
  const isAnyLoading = loadingEmail || loadingGoogle;

  

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  
  const onSubmit = async (data: LoginForm) => {
    setLoadingEmail(true);
    try {
      const response = await api.post("/auth/login", data);
      const { acessToken } = response.data;

      localStorage.setItem("acessToken", acessToken);
      
      const from = (location.state as any)?.from || ROUTE_PATHS.dashboard;
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.response || error);
      alert("Falha no login. Verifique suas credenciais.");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleLoginWithGoogle = () => {
    setLoadingGoogle(true);
    try {
      const googleURL = import.meta.env.VITE_API_URL?.trim() || "/api";
    
      const urlFinal = `${googleURL.replace(/\/$/, "")}/oauth2/authorization/google`;
      window.location.href = urlFinal;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao redirecionar para o Google");
      setLoadingGoogle(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-8 ">
      <div className="pointer-events-none fixed left-[-4rem] top-24 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-3rem] right-[-2rem] h-48 w-48 rounded-full bg-tertiary-container/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-between">
        <section className="space-y-6 pt-6">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Sistema MEI
          </span>

          <div className="space-y-3">
            <h1 className="max-w-[20ch] font-headline text-4xl font-extrabold leading-tight tracking-tight text-on-surface">
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

        <section className="rounded-[2rem] mt-10 rounded-bl-xl bg-surface-container-lowest p-6 shadow-[0_16px_40px_rgba(52,50,47,0.08)]">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-xl font-medium text-on-surface-variant">
              Entrar na sua conta
            </p>
          </div>

          <form className="space-y-4 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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

            <div className="space-y-2  ">
              <div className="flex justify-between"> 
                  <label className="text-sm font-medium text-on-surface-variant flex  flex-order-1" htmlFor="password">
                    Senha
                  </label>
                    <Link to={ROUTE_PATHS.esqueciSenha}>
                      Esqueci minha senha
                    </Link>              
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
                fullWidth
                type="submit"
                disabled={isAnyLoading}
                isLoading={loadingEmail}
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
         <Button
          onClick={handleLoginWithGoogle}
          fullWidth
          type="button"
          disabled={isAnyLoading}
          isLoading={loadingGoogle}
          className="font-headline text-base font-bold mt-4 flex gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Entrar com Google
          </Button>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
