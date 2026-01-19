"use client";

import { Suspense } from "react";
import { SmarticoProvider } from "@/@sdk/smartico/context/SmarticoProvider";
import LoadingScreen from "@/components/games/giftbox/LoadingScreen";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen message="Iniciando..."/>}>
      <SmarticoProvider>{children}</SmarticoProvider>
    </Suspense>
  );
}