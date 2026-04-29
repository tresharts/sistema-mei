import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-border bg-surface-muted/60 px-5 py-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-lowest/70 text-sm font-semibold text-brand-deep">
        MEI
      </div>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-soft">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
