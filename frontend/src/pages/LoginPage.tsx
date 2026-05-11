import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../lib/api";
import Input from "../components/ui/Input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import boraMeiLogo from "../assets/boramei-logo.png";
import { ROUTE_PATHS } from "../lib/constants";
import { useState } from "react";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { setAccessToken } from "../lib/session";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha curta demais"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const location = useLocation();
  const isAnyLoading = loadingEmail || loadingGoogle;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Falha na comunicação com o servidor.";
  };

  const onSubmit = async (data: LoginForm) => {
    setLoadingEmail(true);
    try {
      const response = await api.post("/auth/login", data);
      const { acessToken } = response.data;

      setAccessToken(acessToken);

      const from = (location.state as any)?.from || ROUTE_PATHS.dashboard;

      toast.success("Bem-vindo de volta!");
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(`Erro ao fazer login:` + "senha ou email incorretos ");
      console.error("Login error details:", error + message);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleLoginWithGoogle = () => {
    setLoadingGoogle(true);
    try {
      const googleURL = import.meta.env.VITE_API_URL?.trim() || "/api";

      const urlFinal = `${googleURL.replace(
        /\/$/,
        "",
      )}/oauth2/authorization/google`;
      toast.info("Redirecionando para o Google...");
      window.location.href = urlFinal;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
      setLoadingGoogle(false);
    }
  };

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <section className="min-h-[42vh] overflow-hidden bg-surface-container-low lg:min-h-screen">
        <img
          alt="BoraMEI"
          className="h-full w-full object-cover"
          src={boraMeiLogo}
        />
      </section>

      <section className="flex min-h-[58vh] items-center justify-center px-4 py-8 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-md">
          <section className="rounded-[2rem] rounded-bl-xl bg-surface-container-lowest p-6 shadow-[0_16px_40px_rgba(52,50,47,0.08)]">
            <div className="mb-6 space-y-2 text-center">
              <p className="text-xl font-medium text-on-surface-variant">
                Entrar na sua conta
              </p>
            </div>

            <form
              className="flex flex-col gap-4 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-on-surface-variant"
                  htmlFor="email"
                >
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
                <div className="flex justify-between gap-4">
                  <label
                    className="flex text-sm font-medium text-on-surface-variant"
                    htmlFor="password"
                  >
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
                  className="font-bold text-primary transition-all hover:underline"
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
              className="mt-4 flex gap-3 font-headline text-base font-bold"
            >
              <FcGoogle className="h-5 w-5" />
              Entrar com Google
            </Button>
          </section>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
