import type { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { IconName } from "../../types/ui";
import AppIcon from "./AppIcon";

type ModalProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
  formProps?: FormHTMLAttributes<HTMLFormElement>;
  icon?: IconName;
  onClose: () => void;
  subtitle?: ReactNode;
  title?: string;
};

export default function Modal({
  children,
  className,
  contentClassName,
  footer,
  footerClassName,
  formProps,
  icon,
  onClose,
  subtitle,
  title,
}: ModalProps) {
  const titleId = title
    ? `modal-title-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : undefined;

  const header = title ? (
    <div className="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/30 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <AppIcon name={icon} />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2
            id={titleId}
            className="truncate font-headline text-lg font-bold text-on-surface"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="truncate text-xs text-on-surface-variant">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <button
        aria-label="Fechar"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low"
        onClick={onClose}
        type="button"
      >
        <AppIcon name="close" />
      </button>
    </div>
  ) : null;

  const content = (
    <>
      {header}
      <div className={cn("min-h-0 flex-1 overflow-y-auto p-5", contentClassName)}>
        {children}
      </div>
      {footer ? (
        <div
          className={cn(
            "shrink-0 border-t border-outline-variant/30 bg-surface-container-low px-5 py-4",
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="modal-overlay">
      {formProps ? (
        <form
          {...formProps}
          aria-labelledby={titleId}
          aria-modal="true"
          className={cn("modal-panel", className, formProps.className)}
          role="dialog"
        >
          {content}
        </form>
      ) : (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className={cn("modal-panel", className)}
          role="dialog"
        >
          {content}
        </div>
      )}
    </div>
  );
}
