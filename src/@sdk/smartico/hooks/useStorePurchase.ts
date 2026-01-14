"use client";

import { useCallback, useState } from "react";
import type { Transport } from "../infra/transport/transport.type";
import type { PurchaseResult, PurchaseState } from "../domain/purchase.types";
import { handlePurchaseError, logPurchaseError, type PurchaseError } from "../../smartico/domain/errors/errorHandler";

type UsePurchaseOptions = {
  transport: Transport;
  onSuccess?: (result: PurchaseResult) => void;
  onError?: (error: PurchaseError) => void;
};

/**
 * Hook para gerenciar compras de itens da loja
 */
export function useStorePurchase({
  transport,
  onSuccess,
  onError,
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
        const result = await transport.purchaseStoreItem(itemId);

        const error = handlePurchaseError(result);
        
        if (error) {
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

        // ✅ Sucesso - props_change vai atualizar o saldo automaticamente
        setState({
          isLoading: false,
          error: null,
          success: true,
          result,
        });

        onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMsg = err?.message || "Erro ao processar compra";
        
        setState({
          isLoading: false,
          error: errorMsg,
          success: false,
          result: null,
        });
        
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
        
        return null;
      }
    },
    [transport, onSuccess, onError]
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