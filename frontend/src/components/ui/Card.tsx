import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../lib/cn";

type CardProps = PropsWithChildren<{
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>;

function Card({
  action,
  children,
  className,
  description,
  title,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-border/70 bg-surface p-4 shadow-sm",
        className,
      )}
    >
      {title || description || action ? (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <h2 className="text-sm font-semibold text-text">{title}</h2> : null}
            {description ? (
              <p className="text-sm leading-6 text-text-soft">{description}</p>
            ) : null}
          </div>

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}

      {children}
    </div>
  );
}

export default Card;
