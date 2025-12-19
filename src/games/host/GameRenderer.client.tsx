"use client";

import dynamic from "next/dynamic";
import type { GameKey } from "@/games/registry";

const GiftboxGame = dynamic(
  () => import("@/games/templates/giftbox/GiftboxGame"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        Carregando jogo…
      </div>
    ),
  }
);

type Props = {
  gameKey: GameKey;
  smartico: any;
  templateId: number | string;
  skin: any;
};

export default function GameRenderer({ gameKey, ...props }: Props) {
  switch (gameKey) {
    case "giftbox":
      return <GiftboxGame {...props} />;
    default:
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
          Template não suportado.
        </div>
      );
  }
}
