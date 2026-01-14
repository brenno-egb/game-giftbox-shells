"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ChestItem } from "@/@games/templates/giftbox/chest/chest.types";
import type { MiniGameTemplate } from "@/@sdk/smartico";
import {
  findGameByTemplateId,
  getGameSpins,
  getSkinByChest,
  getChestShopImage,
  sortChestsByOrder,
  getGameUrl,
} from "@/@games/templates/giftbox/chest/chest.helpers";
import { getUserBalance } from "@/@games/templates/giftbox/chest/chest.rules";
import { useStorePurchase } from "@/@sdk/smartico/hooks/useStorePurchase";
import { useSmartico } from "@/@sdk/smartico/context/SmarticoProvider";
import { createSmarticoTransport } from "@/@sdk/smartico";

import { ChestCardCompact, ChestCardWide } from "./ChestCards";
import PurchaseConfirmModal from "./PurchaseConfirmModal";
import PurchaseSuccessModal from "./PurchaseSucessModal";

type Props = {
  chests: ChestItem[];
  games: MiniGameTemplate[];
  userProfile: any;
};

/**
 * Loja de Baús
 * ⭐ Simplificado: props_change da Smartico cuida das atualizações automaticamente
 */
export default function ChestShop({
  chests,
  games,
  userProfile,
}: Props) {
  const searchParams = useSearchParams();
  const { smartico } = useSmartico();

  const uid = searchParams.get("uid") || "test-user";
  const lang = searchParams.get("lang") || "pt";

  const [selectedChest, setSelectedChest] = useState<ChestItem | null>(null);
  const [purchasedChest, setPurchasedChest] = useState<ChestItem | null>(null);
  const [modalMode, setModalMode] = useState<"confirm" | "success" | null>(null);

  const transport = useMemo(
    () => (smartico ? createSmarticoTransport(smartico, false) : null),
    [smartico]
  );

  const { 
    purchase, 
    state: purchaseState, 
    purchaseError,
    reset: resetPurchase 
  } = useStorePurchase({
    transport: transport!,
    onSuccess: (result) => {
      
      setModalMode(null);
      
      setTimeout(() => {
        setPurchasedChest(selectedChest);
        setModalMode("success");
      }, 300);
      
      // ⭐ Não precisa de callback manual - props_change cuida disso
    },
    onError: (error) => {
      console.error("❌ Erro na compra:", error);
    },
  });

  const sortedChests = useMemo(() => sortChestsByOrder(chests), [chests]);

  const handleCardClick = (chest: ChestItem, status: string) => {
    const game = findGameByTemplateId(games, chest.templateId);
    const spins = getGameSpins(game);
    const isReady = chest.hasAttempts && spins > 0;

    if (isReady) {
      const skin = getSkinByChest(chest);
      if (skin) {
        window.location.href = getGameUrl(skin.id, uid, lang);
      }
    } else {
      setSelectedChest(chest);
      setModalMode("confirm");
    }
  };

  const handleBuyClick = (chest: ChestItem, status: string, e?: any) => {
    e?.stopPropagation?.();
    setSelectedChest(chest);
    setModalMode("confirm");
  };

  const handleConfirmPurchase = async () => {
    if (!selectedChest || !transport) return;
    await purchase(selectedChest.id);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedChest(null);
    setPurchasedChest(null);
    resetPurchase();
  };

  const handleCloseToast = () => {
    resetPurchase();
  };

  const handleRetry = () => {
    resetPurchase();
    handleConfirmPurchase();
  };

  const handlePlayNow = () => {
    if (!purchasedChest) return;
    
    const skin = getSkinByChest(purchasedChest);
    if (skin) {
      window.location.href = getGameUrl(skin.id, uid, lang);
    }
  };

  return (
    <div className="w-full">
      <div className="relative text-center mb-8">
        <div className="inline-block relative">
          <img src="/games/giftbox/assets/shop-title.png" alt="Loja" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-7 gap-x-2">
        {sortedChests.map((chest, index) => {
          const isWide = index >= sortedChests.length - 2;
          const CardComponent = isWide ? ChestCardWide : ChestCardCompact;

          const game = findGameByTemplateId(games, chest.templateId);
          const spins = getGameSpins(game);
          const skin = getSkinByChest(chest);
          const imageUrl = getChestShopImage(chest);

          const isReady = chest.hasAttempts && spins > 0;
          const canAfford = chest.canAfford;
          const canBuy = chest.can_buy;
          console.log(chest)

          let status: "ready" | "buyable" | "insufficient" | "locked" = "locked";
          if (isReady) status = "ready";
          else if (!canAfford && canBuy) status = "insufficient";
          else if (canAfford) status = "buyable";

          return (
            <CardComponent
              key={chest.id}
              index={index}
              name={chest.name}
              ribbon={chest.ribbon}
              imageInner={chest.image}
              imageBackground={imageUrl ?? undefined}
              backgroundColor={skin?.backgroundColor || "#352554"}
              priceLabel={chest.price}
              currencyType={chest.purchase_type}
              spinsAvailable={spins}
              status={status}
              chest={chest}
              onClick={() => handleCardClick(chest, status)}
              onActionClick={(e: any) => handleBuyClick(chest, status, e)}
            />
          );
        })}
      </div>

      {modalMode === "confirm" && selectedChest && userProfile && (
        <PurchaseConfirmModal
          chest={selectedChest}
          userBalance={getUserBalance(userProfile, selectedChest.purchase_type)}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPurchase}
          isLoading={purchaseState.isLoading}
          error={purchaseError}
          onRetry={handleRetry}
          onCloseToast={handleCloseToast}
        />
      )}

      {modalMode === "success" && purchasedChest && (
        <PurchaseSuccessModal
          chest={purchasedChest}
          onClose={handleCloseModal}
          onPlayNow={handlePlayNow}
          uid={uid}
          lang={lang}
        />
      )}

      {sortedChests.length === 0 && (
        <div className="text-center py-12 opacity-60">
          <h3 className="text-xl font-black text-white uppercase">
            Loja Fechada
          </h3>
          <p className="text-gray-400">Volte mais tarde!</p>
        </div>
      )}
    </div>
  );
}