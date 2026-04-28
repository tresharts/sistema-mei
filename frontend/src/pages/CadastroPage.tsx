import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { ROUTE_PATHS } from "../lib/constants";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AppIcon from "../components/ui/AppIcon";
import { toast } from "sonner";

const registerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type RegisterForm = z.infer<typeof registerSchema>;

function CadastroPage() {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return "Falha ao processar cadastro.";
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      const payload = {
        nome: data.nome,
        email: data.email,
        senha: data.senha
      };
      
      await api.post("/auth/register", payload);

      toast.success("Conta criada com sucesso! Faça login para continuar.");
      navigate(ROUTE_PATHS.login);
    } catch (error: unknown) {
        const message = getErrorMessage(error);
      toast.error(`Erro no cadastro: ${message}`);
      console.error("Registration error:", error);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none fixed left-[-4rem] top-24 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-3rem] right-[-2rem] h-48 w-48 rounded-full bg-tertiary-container/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        
        <header className="mb-8 space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20">
            <AppIcon name="sparkles" className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
              Criar sua conta
            </h1>
            <p className="text-sm text-on-surface-variant">
              Junte-se ao Sistema MEI e organize sua Empresa.
            </p>
          </div>
        </header>

        <section className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_16px_40px_rgba(52,50,47,0.08)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70 ml-1">
                Nome Completo
              </label>
              <Input
                {...register("nome")}
                placeholder="Ex: Davi Silva"
                error={errors.nome?.message}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70 ml-1">
                E-mail Profissional
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70 ml-1">
                Sua Senha
              </label>
              <Input
                {...register("senha")}
                type="password"
                placeholder="No mínimo 6 caracteres"
                error={errors.senha?.message}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70 ml-1">
                Confirmar Senha
              </label>
              <Input
                {...register("confirmarSenha")}
                type="password"
                placeholder="Repita a senha"
                error={errors.confirmarSenha?.message}
              />
            </div>

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isSubmitting}
              className="mt-4 h-14 text-base font-bold shadow-primary/20"
            >
              Finalizar Cadastro
            </Button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Já tem uma conta?{" "}
              <Link 
                to={ROUTE_PATHS.login} 
                className="font-bold text-primary hover:underline"
              >
                Faça login
              </Link>
            </p>
          </footer>
        </section>

        <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
          <div className="h-px w-8 bg-on-surface-variant" />
          <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
            Segurança Nível MVP
          </p>
          <div className="h-px w-8 bg-on-surface-variant" />
        </div>
      </div>
    </main>
  );
}

export default CadastroPage;