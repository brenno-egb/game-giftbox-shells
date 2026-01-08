"use client";

/**
 * 🎯 COMPONENTES DE ESTADOS DE ERRO E WARNING
 * 
 * Componentes reutilizáveis para mostrar erros e warnings de forma consistente
 * Podem ser usados em qualquer lugar da aplicação
 */

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
}

/**
 * Estado de Erro Crítico
 * Visual: Card vermelho com ícone de erro
 */
export const ErrorState = ({
  title = "Erro ao Carregar",
  message,
  onRetry,
  retryLabel = "Tentar Novamente",
  showRetry = true,
}: ErrorStateProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black p-8">
      <div className="max-w-2xl w-full bg-red-950/30 border-2 border-red-500 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          {/* Ícone de Erro */}
          <svg
            className="w-8 h-8 text-red-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-black text-red-500 uppercase">
            {title}
          </h2>
        </div>

        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-red-200 overflow-auto max-h-96">
          <pre className="whitespace-pre-wrap">{message}</pre>
        </div>

        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors active:scale-95"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
};

interface WarningStateProps {
  title?: string;
  message: string;
  details?: string;
  onBack?: () => void;
  backLabel?: string;
  showBack?: boolean;
}

/**
 * Estado de Warning/Alerta
 * Visual: Card amarelo com ícone de warning
 */
export const WarningState = ({
  title = "Atenção",
  message,
  details,
  onBack,
  backLabel = "Voltar",
  showBack = true,
}: WarningStateProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black p-8">
      <div className="max-w-lg w-full bg-yellow-950/30 border-2 border-yellow-500 rounded-xl p-8 text-center shadow-2xl">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-yellow-500 uppercase mb-2">
          {title}
        </h2>

        <p className="text-yellow-200/80 mb-4">{message}</p>

        {details && (
          <div className="bg-black/30 rounded-lg p-3 mb-6">
            <code className="text-yellow-300 text-sm">{details}</code>
          </div>
        )}

        {showBack && onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors active:scale-95"
          >
            {backLabel}
          </button>
        )}
      </div>
    </div>
  );
};

interface InfoStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Estado de Informação
 * Visual: Card azul com ícone de info
 */
export const InfoState = ({
  title = "Informação",
  message,
  icon,
  action,
}: InfoStateProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black p-8">
      <div className="max-w-lg w-full bg-blue-950/30 border-2 border-blue-500 rounded-xl p-8 text-center shadow-2xl">
        <div className="mb-4">
          {icon || (
            <svg
              className="w-16 h-16 text-blue-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <h2 className="text-2xl font-black text-blue-500 uppercase mb-2">
          {title}
        </h2>

        <p className="text-blue-200/80 mb-6">{message}</p>

        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors active:scale-95"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty State (Nenhum conteúdo)
 * Visual: Card cinza com ícone
 */
export const EmptyState = ({
  title = "Nenhum Conteúdo",
  message,
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black p-8">
      <div className="max-w-lg w-full bg-slate-800/30 border-2 border-slate-600 rounded-xl p-8 text-center shadow-2xl">
        <div className="mb-4">
          {icon || (
            <svg
              className="w-16 h-16 text-slate-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          )}
        </div>

        <h2 className="text-2xl font-black text-slate-400 uppercase mb-2">
          {title}
        </h2>

        <p className="text-slate-400/80 mb-6">{message}</p>

        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors active:scale-95"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * EXEMPLO DE USO:
 * 
 * // Erro
 * <ErrorState
 *   message="Falha ao conectar com servidor"
 *   onRetry={() => window.location.reload()}
 * />
 * 
 * // Warning
 * <WarningState
 *   title="Template Não Suportado"
 *   message="Este template ainda não está disponível."
 *   details="template: giftbox-v2"
 *   onBack={() => router.back()}
 * />
 * 
 * // Info
 * <InfoState
 *   title="Manutenção Programada"
 *   message="Estaremos em manutenção das 02:00 às 04:00"
 *   action={{
 *     label: "Entendi",
 *     onClick: () => router.push("/")
 *   }}
 * />
 * 
 * // Empty
 * <EmptyState
 *   title="Nenhum Jogo Disponível"
 *   message="Você ainda não tem jogos disponíveis."
 *   action={{
 *     label: "Ver Loja",
 *     onClick: () => router.push("/store")
 *   }}
 * />
 */