"use client";

import { useEffect, useState } from "react";
import type { PurchaseError } from "@/@sdk/smartico/domain/errors/errorHandler";

type Props = {
  error: PurchaseError | null;
  onClose?: () => void;
};

/**
 * Toast flutuante para erros
 */
export function ErrorToast({ error, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      // Anima entrada
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [error]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!error) return null;

  const colors = {
    error: {
      bg: "bg-red-600",
      icon: "text-white",
    },
    warning: {
      bg: "bg-yellow-600",
      icon: "text-white",
    },
    info: {
      bg: "bg-blue-600",
      icon: "text-white",
    },
  };

  const colorScheme = colors[error.severity];

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-200
        max-w-md w-[calc(100%-2rem)]
        transition-all duration-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div
        className={`
          ${colorScheme.bg} rounded-xl shadow-2xl
          flex items-start gap-3 p-4
          border-2 border-white/20
        `}
        style={{
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Ícone */}
        <div className={`flex-shrink-0 ${colorScheme.icon}`}>
          {error.severity === "error" && (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {error.severity === "warning" && (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {error.severity === "info" && (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* Mensagem */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-relaxed">
            {error.userMessage}
          </p>
        </div>

        {/* Botão fechar */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}