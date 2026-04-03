import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "min-h-14 w-full rounded-xl border-none bg-surface-container-low px-4 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
}

export default Input;
