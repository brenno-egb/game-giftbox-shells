"use client";

import { useCallback, useState } from "react";
import type { Transport } from "../infra/transport/transport.type";
import type { PurchaseResult, PurchaseState } from "../domain/purchase.types";
import { handlePurchaseError, logPurchaseError, type PurchaseError } from "../../smartico/domain/errors/errorHandler";

type UsePurchaseOptions = {
  transport: Transport;
  onSuccess?: (result: PurchaseResult) => void;
  onError?: (error: PurchaseError) => void;
  onBalanceUpdate?: (newBalance: number) => void;
};

/**
 * Hook para gerenciar compras de itens da loja
 * ⭐ CORRIGIDO: Trata err_code da API sem lançar exceção
 */
export function useStorePurchase({
  transport,
  onSuccess,
  onError,
  onBalanceUpdate,
}: UsePurchaseOptions) {
  const [state, setState] = useState<PurchaseState>({
    isLoading: false,
    error: null,
    success: false,
    result: null,
  });

  const [purchaseError, setPurchaseError] = useState<PurchaseError | null>(null);

  const purchase = useCallback(
    async (itemId: number) => {
      setState({
        isLoading: true,
        error: null,
        success: false,
        result: null,
      });
      setPurchaseError(null);

      try {
        // ⭐ API retorna resultado mesmo com erro
        const result = await transport.purchaseStoreItem(itemId);

        // ⭐ Verifica erros através do handler
        const error = handlePurchaseError(result);
        
        if (error) {
          // Registra erro
          logPurchaseError(error, { itemId });
          
          setState({
            isLoading: false,
            error: error.userMessage,
            success: false,
            result,
          });
          
          setPurchaseError(error);
          onError?.(error);
          
          return result;
        }

        // ✅ Sucesso!
        setState({
          isLoading: false,
          error: null,
          success: true,
          result,
        });

        // ⭐ Atualiza saldo se disponível
        if (result.user_balance !== undefined) {
          onBalanceUpdate?.(result.user_balance);
        }

        onSuccess?.(result);
        return result;
      } catch (err: any) {
        // ⭐ Erro de rede ou exceção
        const errorMsg = err?.message || "Erro ao processar compra";
        
        setState({
          isLoading: false,
          error: errorMsg,
          success: false,
          result: null,
        });
        
        // Cria erro genérico
        const genericError: PurchaseError = {
          code: -1,
          message: err?.message || "Unknown error",
          userMessage: errorMsg,
          severity: "error",
          actionable: true,
          retry: true,
          requiresReload: false,
        };
        
        setPurchaseError(genericError);
        onError?.(genericError);
        
        // ⭐ NÃO lança exceção, apenas retorna null
        return null;
      }
    },
    [transport, onSuccess, onError, onBalanceUpdate]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      result: null,
    });
    setPurchaseError(null);
  }, []);

  return {
    purchase,
    state,
    purchaseError,
    reset,
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
  };
}