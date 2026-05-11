import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../lib/api";
import Input from "../components/ui/Input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import boraMeiLogo from "../assets/boramei-logo.png";
import favicon from "../assets/favicon.png";
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
    <main className="flex h-[100dvh] flex-col justify-center gap-4 overflow-hidden bg-background lg:grid lg:h-auto lg:min-h-screen lg:grid-cols-2 lg:gap-0 lg:overflow-visible">
      <section className="bg-background px-6 lg:flex lg:min-h-screen lg:flex-col lg:items-center lg:justify-center lg:gap-1">
        <div className="flex items-center justify-center gap-3 lg:hidden">
          <img alt="BoraMEI" className="h-9 w-9 object-contain" src={favicon} />
          <h1 className="font-headline text-3xl font-extrabold text-primary">
            BoraMEI
          </h1>
        </div>

        <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-1">
          <h1 className="font-headline text-4xl font-extrabold text-primary sm:text-5xl">
            BoraMEI
          </h1>
          <img
            alt="BoraMEI"
            className="h-auto w-full max-w-[18rem] object-contain sm:max-w-[21rem] lg:max-w-[28rem]"
            src={boraMeiLogo}
          />
        </div>
      </section>

      <section className="flex items-center justify-center px-4 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-md">
          <section className="rounded-[2rem] rounded-bl-xl bg-surface-container-lowest p-5 shadow-[0_16px_40px_rgba(52,50,47,0.08)] sm:p-6">
            <div className="mb-5 space-y-2 text-center sm:mb-6">
              <p className="text-xl font-medium text-on-surface-variant">
                Entrar na sua conta
              </p>
            </div>

            <form
              className="flex flex-col gap-4"
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

            <footer className="mt-6 text-center sm:mt-8">
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
