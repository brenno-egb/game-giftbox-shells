/**
 * Códigos de erro da Smartico API
 * Baseado na documentação oficial
 */

export type ErrorCode = number;

export type ErrorInfo = {
  code: ErrorCode;
  message: string;
  userMessage: string;
  severity: "error" | "warning" | "info";
  actionable: boolean;
};

/**
 * Mapeamento de códigos de erro conhecidos
 */
export const SMARTICO_ERROR_CODES: Record<ErrorCode, Omit<ErrorInfo, "code">> = {
  // Sucesso
  0: {
    message: "Success",
    userMessage: "Operação realizada com sucesso!",
    severity: "info",
    actionable: false,
  },

  // Erros de compra
  11006: {
    message: "Purchase limit reached",
    userMessage: "Você só pode comprar um baú por dia!",
    severity: "warning",
    actionable: false,
  },

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

  // Erros de autenticação
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

  // Erros de validação
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

  // Erros de servidor
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

/**
 * Formata mensagem de erro para o usuário
 */
export function formatErrorMessage(code: ErrorCode, fallbackMessage?: string): string {
  const info = getErrorInfo(code);
  return info.userMessage || fallbackMessage || "Ocorreu um erro";
}