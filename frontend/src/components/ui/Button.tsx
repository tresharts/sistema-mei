import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  }
>;

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-primary-dim text-on-primary shadow-lg shadow-primary/20 hover:opacity-95 focus-visible:outline-primary",
  secondary:
    "bg-surface-container-low text-on-surface hover:bg-surface-container-high focus-visible:outline-primary",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-primary",
};

function Button({
  children,
  className,
  fullWidth = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-14 items-center justify-center rounded-xl px-4 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth && "w-full",
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
