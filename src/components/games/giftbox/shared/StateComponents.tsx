"use client";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
};

export const ErrorState = ({
  title = "Erro ao Carregar",
  message,
  onRetry,
  retryLabel = "Tentar Novamente",
  showRetry = true,
}: ErrorStateProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-slate-900 to-black p-8">
      <div className="max-w-2xl w-full bg-red-950/30 border-2 border-red-500 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-8 h-8 text-red-500 shrink-0"
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

type WarningStateProps = {
  title?: string;
  message: string;
  details?: string;
  onBack?: () => void;
  backLabel?: string;
  showBack?: boolean;
};

export const WarningState = ({
  title = "Atenção",
  message,
  details,
  onBack,
  backLabel = "Voltar",
  showBack = true,
}: WarningStateProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-slate-900 to-black p-8">
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

type InfoStateProps = {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
};

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

export const EmptyState = () => {
  return (
    <div className="bg-[#1a233a] rounded-3xl border-4 border-[#2d3548] p-8 text-center shadow-xl relative overflow-hidden my-8">
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-2xl font-black text-white uppercase mb-2">
          Inventário Vazio
        </h2>
      </div>
    </div>
  );
};
