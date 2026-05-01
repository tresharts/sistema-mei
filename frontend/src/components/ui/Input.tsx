import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <input
          ref={ref} 
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

Input.displayName = "Input"; 



export default Input;