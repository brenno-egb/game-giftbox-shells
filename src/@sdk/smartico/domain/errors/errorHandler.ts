import type { PurchaseResult } from "../../types";

// ============================================
// ERROR CODES
// ============================================

export type ErrorCode = number;

export type ErrorInfo = {
  code: ErrorCode;
  message: string;
  userMessage: string;
  severity: "error" | "warning" | "info";
  actionable: boolean;
};

/**
 * Mapeamento de códigos de erro conhecidos da Smartico API
 */
export const SMARTICO_ERROR_CODES: Record<
  ErrorCode,
  Omit<ErrorInfo, "code">
> = {
  // Sucesso
  0: {
    message: "Success",
    userMessage: "Operação realizada com sucesso!",
    severity: "info",
    actionable: false,
  },

  // Erros de compra (11xxx)
  11001: {
    message: "Insufficient balance",
    userMessage: "Saldo insuficiente para esta compra",
    severity: "error",
    actionable: true,
  },
  11002: {
    message: "Item not available",
    userMessage: "Este item não está mais disponível",
    severity: "error",
    actionable: false,
  },
  11003: {
    message: "Item out of stock",
    userMessage: "Este item está esgotado",
    severity: "warning",
    actionable: false,
  },
  11004: {
    message: "Purchase not allowed",
    userMessage: "Você não pode comprar este item no momento",
    severity: "error",
    actionable: false,
  },
  11005: {
    message: "Item already purchased",
    userMessage: "Você já possui este item",
    severity: "info",
    actionable: false,
  },
  11006: {
    message: "Purchase limit reached",
    userMessage: "Você só pode comprar um baú por dia!",
    severity: "warning",
    actionable: false,
  },

  // Erros de autenticação (10xxx)
  10001: {
    message: "User not authenticated",
    userMessage: "Por favor, faça login novamente",
    severity: "error",
    actionable: true,
  },
  10002: {
    message: "Session expired",
    userMessage: "Sua sessão expirou. Faça login novamente",
    severity: "error",
    actionable: true,
  },

  // Erros de validação (12xxx)
  12001: {
    message: "Invalid item ID",
    userMessage: "Item inválido",
    severity: "error",
    actionable: false,
  },
  12002: {
    message: "Invalid quantity",
    userMessage: "Quantidade inválida",
    severity: "error",
    actionable: false,
  },

  // Erros de servidor (50xxx)
  50001: {
    message: "Internal server error",
    userMessage: "Erro no servidor. Tente novamente mais tarde",
    severity: "error",
    actionable: true,
  },
  50002: {
    message: "Service unavailable",
    userMessage: "Serviço temporariamente indisponível",
    severity: "error",
    actionable: true,
  },
  50003: {
    message: "Timeout",
    userMessage: "Tempo de espera esgotado. Tente novamente",
    severity: "error",
    actionable: true,
  },
};

/**
 * Retorna informações sobre um código de erro
 */
export function getErrorInfo(code: ErrorCode): ErrorInfo {
  const info = SMARTICO_ERROR_CODES[code];

  if (!info) {
    return {
      code,
      message: `Unknown error code: ${code}`,
      userMessage: "Ocorreu um erro inesperado. Tente novamente",
      severity: "error",
      actionable: true,
    };
  }

  return { code, ...info };
}

/**
 * Verifica se é um código de sucesso
 */
export function isSuccessCode(code: ErrorCode): boolean {
  return code === 0;
}

/**
 * Verifica se é um erro recuperável (actionable)
 */
export function isActionableError(code: ErrorCode): boolean {
  const info = getErrorInfo(code);
  return info.actionable;
}

// ============================================
// PURCHASE ERROR HANDLER
// ============================================

export type PurchaseError = {
  code: number;
  message: string;
  userMessage: string;
  severity: "error" | "warning" | "info";
  actionable: boolean;
  retry: boolean;
  requiresReload: boolean;
};

export type SuggestedAction = {
  label: string;
  action: "retry" | "reload" | "close";
} | null;

/**
 * Processa resultado de compra e retorna erro formatado se houver
 */
export function handlePurchaseError(
  result: PurchaseResult | null
): PurchaseError | null {
  // Sem resposta = erro de comunicação
  if (!result) {
    return {
      code: -1,
      message: "No response",
      userMessage: "Erro de comunicação. Tente novamente.",
      severity: "error",
      actionable: true,
      retry: true,
      requiresReload: false,
    };
  }

  // Sucesso
  if (result.err_code === 0 || result.err_code === undefined) {
    return null;
  }

  // Busca info do código de erro
  const errorInfo = getErrorInfo(result.err_code);

  // Determina se pode tentar novamente baseado no tipo de erro
  const canRetry =
    errorInfo.actionable && ![11005, 11006].includes(result.err_code);

  // Determina se precisa recarregar (erros de sessão)
  const requiresReload = [10001, 10002].includes(result.err_code);

  return {
    code: result.err_code,
    message: errorInfo.message,
    userMessage: errorInfo.userMessage,
    severity: errorInfo.severity,
    actionable: errorInfo.actionable,
    retry: canRetry,
    requiresReload,
  };
}

/**
 * Retorna ação sugerida para um erro
 */
export function getSuggestedAction(error: PurchaseError): SuggestedAction {
  if (error.requiresReload) {
    return { label: "Recarregar página", action: "reload" };
  }

  if (error.retry) {
    return { label: "Tentar novamente", action: "retry" };
  }

  if (error.actionable) {
    return { label: "Fechar", action: "close" };
  }

  return null;
}

/**
 * Loga erro de compra em dev
 */
export function logPurchaseError(
  error: PurchaseError,
  context?: Record<string, any>
): void {
  if (process.env.NODE_ENV === "development") {
    console.error("[Purchase Error]", {
      ...error,
      ...context,
    });
  }
}
