"use client";

import { Suspense } from "react";
import { SmarticoProvider } from "@/@sdk/smartico/context/SmarticoProvider";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SmarticoProvider>{children}</SmarticoProvider>
    </Suspense>
  );
}