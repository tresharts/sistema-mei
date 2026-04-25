export default function TransactionListItemSkeleton() {
  return (
    <article className="flex items-center gap-4 rounded-[1.5rem] rounded-bl-lg bg-surface-container-lowest p-5 shadow-editorial animate-pulse">
      
      {/* Esqueleto do Ícone (Círculo) */}
      <div className="h-12 w-12 shrink-0 rounded-full bg-surface-container-highest opacity-50"></div>

      {/* Esqueleto dos Textos (Título, Escopo e Categoria) */}
      <div className="min-w-0 flex-1">
        {/* Título */}
        <div className="h-4 w-3/4 rounded bg-surface-container-highest opacity-50 mb-2"></div>
        
        {/* Badges */}
        <div className="mt-1 flex items-center gap-2">
          <div className="h-3 w-16 rounded-full bg-surface-container-highest opacity-50"></div>
          <div className="h-3 w-20 rounded-full bg-surface-container-highest opacity-50"></div>
        </div>
      </div>

      {/* Esqueleto dos Valores e Data (Lado Direito) */}
      <div className="flex flex-col items-end gap-2 text-right">
        {/* Valor numérico */}
        <div className="h-5 w-24 rounded bg-surface-container-highest opacity-50"></div>
        {/* Data */}
        <div className="h-3 w-12 rounded bg-surface-container-highest opacity-50"></div>
      </div>
      
    </article>
  );
}