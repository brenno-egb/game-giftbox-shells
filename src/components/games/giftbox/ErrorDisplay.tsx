"use client";

import type { PurchaseError } from "@/@sdk/smartico/domain/errors/errorHandler";
import { getSuggestedAction } from "@/@sdk/smartico/domain/errors/errorHandler";

type Props = {
  error: PurchaseError | null;
  onRetry?: () => void;
  onClose?: () => void;
};

/**
 * Componente de erro inline para modais
 * Mantém o estilo da aplicação
 */
export function PurchaseErrorDisplay({ error, onRetry, onClose }: Props) {
  if (!error) return null;

  const action = getSuggestedAction(error);

  const handleAction = () => {
    if (!action) return;

    switch (action.action) {
      case "reload":
        window.location.reload();
        break;
      case "retry":
        onRetry?.();
        break;
      case "close":
        onClose?.();
        break;
    }
  };

  // Cores baseadas na severidade
  const colors = {
    error: {
      bg: "bg-red-950/50",
      border: "border-red-500",
      text: "text-red-200",
      icon: "text-red-400",
    },
    warning: {
      bg: "bg-yellow-950/50",
      border: "border-yellow-500",
      text: "text-yellow-200",
      icon: "text-yellow-400",
    },
    info: {
      bg: "bg-blue-950/50",
      border: "border-blue-500",
      text: "text-blue-200",
      icon: "text-blue-400",
    },
  };

  const colorScheme = colors[error.severity];

  return (
    <div
      className={`${colorScheme.bg} border ${colorScheme.border} rounded-lg p-4 space-y-3`}
    >
      {/* Header com ícone */}
      <div className="flex items-start gap-3">
        <div className={`shrink-0 ${colorScheme.icon}`}>
          {error.severity === "error" && (
            <svg
              className="w-5 h-5"
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
          )}
          {error.severity === "warning" && (
            <svg
              className="w-5 h-5"
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
          )}
          {error.severity === "info" && (
            <svg
              className="w-5 h-5"
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

        {/* Mensagem */}
        <div className="flex-1">
          <p className={`${colorScheme.text} text-sm font-medium leading-relaxed`}>
            {error.userMessage}
          </p>
          
          {/* Código do erro (para debug) */}
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs opacity-60 mt-1">
              Código: {error.code}
            </p>
          )}
        </div>
      </div>

      {/* Botão de ação */}
      {action && (
        <button
          onClick={handleAction}
          className={`
            w-full py-2 px-4 rounded-lg font-bold text-sm
            ${colorScheme.border} border-2
            ${colorScheme.text}
            hover:bg-white/10
            transition-colors
          `}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Badge de erro compacto
 */
export function ErrorBadge({ error }: { error: PurchaseError | null }) {
  if (!error) return null;

  const colors = {
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
        colors[error.severity]
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      Erro {error.code}
    </div>
  );
}