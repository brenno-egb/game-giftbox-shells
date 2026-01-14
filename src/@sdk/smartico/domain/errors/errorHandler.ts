import type { PurchaseResult } from "../../types";

export type PurchaseError = {
  code: number;
  message: string;
  userMessage: string;
  severity: "error" | "warning" | "info";
  actionable: boolean;
  retry: boolean;
  requiresReload: boolean;
};

const ERROR_MESSAGES: Record<number, Partial<PurchaseError>> = {
  1: {
    userMessage: "Saldo insuficiente para esta compra",
    severity: "warning",
    actionable: true,
    retry: false,
  },
  2: {
    userMessage: "Item não disponível no momento",
    severity: "warning",
    actionable: false,
    retry: false,
  },
  3: {
    userMessage: "Limite de compras atingido",
    severity: "info",
    actionable: false,
    retry: false,
  },
  100: {
    userMessage: "Erro interno. Tente novamente.",
    severity: "error",
    actionable: true,
    retry: true,
  },
};

export function handlePurchaseError(
  result: PurchaseResult | null
): PurchaseError | null {
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

  if (result.err_code === 0 || result.err_code === undefined) {
    return null;
  }

  const knownError = ERROR_MESSAGES[result.err_code];

  return {
    code: result.err_code,
    message: result.err_msg || "Unknown error",
    userMessage: knownError?.userMessage || result.err_msg || "Erro desconhecido",
    severity: knownError?.severity || "error",
    actionable: knownError?.actionable ?? true,
    retry: knownError?.retry ?? true,
    requiresReload: false,
  };
}

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