import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import AppIcon from "../ui/AppIcon";

type TopAppBarVariant = "brand" | "page" | "modal";

type TopAppBarProps = {
  title: string;
  variant: TopAppBarVariant;
};

function TopAppBar({ title, variant }: TopAppBarProps) {
  const navigate = useNavigate();

  if (variant === "modal") {
    return (
      <header className="fixed inset-x-0 top-0 z-50 mx-auto h-16 w-full max-w-md bg-background/80 px-6 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between">
          <button
            aria-label="Voltar"
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low"
            onClick={() => navigate(-1)}
            type="button"
          >
            <AppIcon name="close" />
          </button>

          <h1 className="font-headline text-lg font-extrabold tracking-tight text-primary">
            {title}
          </h1>

          <div className="w-10" />
        </div>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 mx-auto h-16 w-full max-w-md bg-background/80 px-6 backdrop-blur-xl shadow-sm shadow-on-surface/5">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials="CO" size="sm" />
          <div>
            <p className="font-headline text-lg font-extrabold tracking-tight text-primary">
              {variant === "brand" ? "Artesa Financeira" : title}
            </p>
          </div>
        </div>

        <button
          aria-label="Notificacoes"
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
          type="button"
        >
          <AppIcon name="bell" />
        </button>
      </div>
    </header>
  );
}

export default TopAppBar;
