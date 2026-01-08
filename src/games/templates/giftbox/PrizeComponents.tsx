/**
 * 🎁 COMPONENTES DE PRÊMIOS
 * 
 * Componentes extraídos do GiftboxGame.tsx para reutilização
 */

import { DEFAULT_PRIZE_ICON } from "./config";

interface Prize {
  id: string | number;
  name?: string;
  icon?: string;
  prize_type?: string;
  acknowledge_message?: string;
  aknowledge_message?: string;
  [key: string]: any;
}

interface PrizeItemProps {
  prize: Prize;
  isTarget?: boolean;
}

/**
 * Item de prêmio na roleta (grande com nome)
 */
export function PrizeItem({ prize, isTarget = false }: PrizeItemProps) {
  return (
    <div
      className={`flex h-full w-[120px] shrink-0 flex-col items-center justify-center gap-2 px-2 transition-all ${
        isTarget ? "scale-105" : ""
      }`}
    >
      <img
        src={prize.icon || DEFAULT_PRIZE_ICON}
        alt={prize.name || "Item"}
        className="h-20 w-20 object-contain"
        decoding="async"
        draggable={false}
      />
      <div className="text-[11px] text-white/85 text-center leading-tight max-w-full overflow-hidden text-ellipsis">
        {prize.name || "Item"}
      </div>
    </div>
  );
}

interface CompactPrizeItemProps {
  prize: Prize;
}

/**
 * Item de prêmio compacto (pequeno para preview)
 */
export function CompactPrizeItem({ prize }: CompactPrizeItemProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-10 h-10">
        <img
          src={prize.icon || DEFAULT_PRIZE_ICON}
          alt={prize.name || "Item"}
          className="h-full w-full object-contain opacity-90"
          decoding="async"
          draggable={false}
        />
      </div>

      <span className="text-xs text-center opacity-80 truncate w-full">
        {prize.name || "Item"}
      </span>
    </div>
  );
}

interface PrizeAnnouncementProps {
  prize: Prize;
  onClose: () => void;
}

/**
 * Card de anúncio de prêmio ganho
 */
export function PrizeAnnouncement({ prize, onClose }: PrizeAnnouncementProps) {
  // Monta mensagem de prêmio
  const prizeLabel = (() => {
    if (!prize) return "Jogada concluída.";

    const msg = prize.acknowledge_message ?? prize.aknowledge_message;

    if (prize.prize_type === "no-prize") {
      return msg || "Quase lá!";
    }

    return `${msg ?? "Você ganhou"} ${prize.name ?? ""}`.trim();
  })();

  return (
    <div className="w-full max-w-md animate-bounce-in z-40 shrink-0">
      <div className="relative overflow-hidden rounded-lg border border-white/15 bg-black/50 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.25)]">
        {/* Gradiente de fundo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.06) 0%, transparent 55%)",
          }}
        />

        <div className="relative flex min-h-25">
          {/* Imagem do prêmio */}
          <div className="relative w-30 shrink-0">
            <div className="absolute inset-0">
              <div className="absolute -inset-6 bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_60%)]" />
            </div>

            <div className="relative h-full w-full flex items-center justify-center p-3">
              <img
                src={prize?.icon || DEFAULT_PRIZE_ICON}
                alt={prize?.name || "Prêmio"}
                className="h-full w-full object-contain"
                decoding="async"
              />
            </div>

            {/* Divisor vertical */}
            <div className="absolute right-0 top-3 bottom-3 w-px bg-white/10" />
          </div>

          {/* Conteúdo do prêmio */}
          <div className="flex flex-1 flex-col justify-between p-1 pl-3 text-left">
            <div>

              <div className="mt-1 text-[15px] font-semibold leading-snug text-white/95"

              >
                {prize?.name ?? "Você ganhou!"}
              </div>

              <div className="mt-1 text-[12px] leading-snug text-white/75">
                {prizeLabel}
              </div>
            </div>

            {/* Botão continuar */}
            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-sm border-b border-t-2 border-b-[#C4A023] border-t-[#FFDC62] bg-[#FFD000] drop-shadow-[0_2px_0_rgba(0,0,0)] px-4 py-2 text-md font-black text-white/90 uppercase"
                style={{
                    textShadow: "1px 1px 0 black",
                    WebkitTextStroke: "0.5px black",
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PossiblePrizesProps {
  prizes: Prize[];
  maxVisible?: number;
}

/**
 * Preview de prêmios possíveis (opcional)
 */
export function PossiblePrizes({
  prizes,
  maxVisible = 5,
}: PossiblePrizesProps) {
  const visiblePrizes = prizes.slice(0, maxVisible);

  if (visiblePrizes.length === 0) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="text-xs text-white/60 mb-2 text-center">
        Prêmios Possíveis:
      </div>
      <div className="flex gap-2 bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10">
        {visiblePrizes.map((prize) => (
          <CompactPrizeItem key={prize.id} prize={prize} />
        ))}
        {prizes.length > maxVisible && (
          <div className="flex items-center justify-center w-10 h-10 text-white/60 text-xs">
            +{prizes.length - maxVisible}
          </div>
        )}
      </div>
    </div>
  );
}
