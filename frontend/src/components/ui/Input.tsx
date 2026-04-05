import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

// Adicionamos a prop 'error' para mostrar mensagens do Zod
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;

};

// Usamos forwardRef para o React Hook Form conseguir "enxergar" o input
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <input
          ref={ref} // A referência é conectada aqui!
          className={cn(
            "min-h-14 w-full rounded-xl border-none bg-surface-container-low px-4 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all",
            error && "ring-2 ring-error/50 bg-error/5", // Estilo de erro
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-error px-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input"; // Boa prática para debugging



export default Input;