import type { PurchaseResult } from "../purchase.types";
import { getErrorInfo, isSuccessCode, type ErrorInfo } from "./error.codes";

export type PurchaseError = {
  code: number;
  message: string;
  userMessage: string;
  severity: "error" | "warning" | "info";
  actionable: boolean;
  retry: boolean;
  requiresReload: boolean;
};

/**
 * Processa resultado da API e retorna erro formatado
 * ⭐ CORRIGIDO: Parseia err_code da resposta da API corretamente
 */
export function handlePurchaseError(result: PurchaseResult): PurchaseError | null {
  // Sem erro
  if (!result.err_code || isSuccessCode(result.err_code)) {
    return null;
  }

  // ⭐ AQUI: err_code vem na resposta da API
  const errorCode = result.err_code;
  const errorInfo = getErrorInfo(errorCode);

  // Determina se deve tentar novamente
  const retry = shouldRetry(errorCode);

  // Determina se precisa recarregar
  const requiresReload = shouldReload(errorCode);

  return {
    code: errorCode,
    message: result.err_msg || errorInfo.message,
    userMessage: errorInfo.userMessage,
    severity: errorInfo.severity,
    actionable: errorInfo.actionable,
    retry,
    requiresReload,
  };
}

/**
 * Determina se deve permitir retry
 */
function shouldRetry(code: number): boolean {
  const retryCodes = [
    50001, // Internal server error
    50002, // Service unavailable
    50003, // Timeout
  ];
  return retryCodes.includes(code);
}

/**
 * Determina se precisa recarregar a página
 */
function shouldReload(code: number): boolean {
  const reloadCodes = [
    10001, // User not authenticated
    10002, // Session expired
  ];
  return reloadCodes.includes(code);
}

/**
 * Formata erro para exibição
 */
export function formatPurchaseError(error: PurchaseError | null): string {
  if (!error) return "";

  let message = error.userMessage;

  // Adiciona dica se for actionable
  if (error.actionable) {
    if (error.retry) {
      message += " Por favor, tente novamente.";
    } else if (error.requiresReload) {
      message += " Recarregue a página.";
    }
  }

  return message;
}

/**
 * Retorna ação sugerida baseada no erro
 */
export function getSuggestedAction(error: PurchaseError): {
  label: string;
  action: "retry" | "reload" | "close";
} | null {
  if (error.requiresReload) {
    return {
      label: "Recarregar Página",
      action: "reload",
    };
  }

  if (error.retry) {
    return {
      label: "Tentar Novamente",
      action: "retry",
    };
  }

  return {
    label: "Fechar",
    action: "close",
  };
}

/**
 * Log de erro estruturado
 */
export function logPurchaseError(
  error: PurchaseError,
  context?: Record<string, any>
) {
  const logData = {
    timestamp: new Date().toISOString(),
    code: error.code,
    message: error.message,
    userMessage: error.userMessage,
    severity: error.severity,
    context,
  };

  if (error.severity === "error") {
    console.error("[Purchase Error]", logData);
  } else if (error.severity === "warning") {
    console.warn("[Purchase Warning]", logData);
  } else {
    console.info("[Purchase Info]", logData);
  }

  // Enviar para sistema de analytics/monitoring
  try {
    // Exemplo: enviar para analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "purchase_error", {
        error_code: error.code,
        error_message: error.message,
        ...context,
      });
    }
  } catch (e) {
    // Silently fail
  }
}