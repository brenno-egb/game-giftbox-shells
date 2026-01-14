"use client";

import { useCallback, useState } from "react";
import type { Transport } from "../infra/transport/transport.type";
import type { PurchaseResult, PurchaseState } from "../types/index.ts";
import {
  handlePurchaseError,
  logPurchaseError,
  type PurchaseError,
} from "../domain/errors/errorHandler";

type UsePurchaseOptions = {
  transport: Transport;
  onSuccess?: (result: PurchaseResult) => void;
  onError?: (error: PurchaseError) => void;
};

const INITIAL_STATE: PurchaseState = {
  isLoading: false,
  error: null,
  success: false,
  result: null,
};

export function useStorePurchase({
  transport,
  onSuccess,
  onError,
}: UsePurchaseOptions) {
  const [state, setState] = useState<PurchaseState>(INITIAL_STATE);
  const [purchaseError, setPurchaseError] = useState<PurchaseError | null>(
    null
  );

  const purchase = useCallback(
    async (itemId: number): Promise<PurchaseResult | null> => {
      setState({ ...INITIAL_STATE, isLoading: true });
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

        setState({
          isLoading: false,
          error: null,
          success: true,
          result,
        });
        onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMsg = err?.message || "Purchase failed";
        const genericError: PurchaseError = {
          code: -1,
          message: err?.message || "Unknown error",
          userMessage: errorMsg,
          severity: "error",
          actionable: true,
          retry: true,
          requiresReload: false,
        };

        setState({
          isLoading: false,
          error: errorMsg,
          success: false,
          result: null,
        });
        setPurchaseError(genericError);
        onError?.(genericError);
        return null;
      }
    },
    [transport, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setPurchaseError(null);
  }, []);

  return {
    purchase,
    reset,
    state,
    purchaseError,
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
  };
}
