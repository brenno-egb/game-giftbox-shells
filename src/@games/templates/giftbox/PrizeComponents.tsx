import { DEFAULT_PRIZE_ICON } from "./config";

export interface Prize {
  id?: string | number;
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

export function PrizeItem({ prize, isTarget = false }: PrizeItemProps) {
  return (
    <div
      className={`flex h-full w-30 shrink-0 flex-col items-center justify-center gap-2 px-2 transition-all ${
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

export function PrizeAnnouncement({ prize, onClose }: PrizeAnnouncementProps) {
  const prizeLabel = (() => {
    if (!prize) return "Jogada concluída.";

    const msg = prize.acknowledge_message ?? prize.aknowledge_message;

    if (prize.prize_type === "no-prize") {
      return msg || "Quase lá!";
    }

    return `${msg ?? "Você ganhou"} ${prize.name ?? ""}`.trim();
  })();

  return (
    <div className="w-full max-w-sm animate-bounce-in z-50 shrink-0 mx-auto px-4">
      <div className="relative overflow-hidden rounded-xl border-[3px] border-[#374151] bg-[#1a1f2e] shadow-[0_8px_0_#0f1219,0_15px_20px_rgba(0,0,0,0.5)] flex flex-row h-32">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_left,var(--tw-gradient-stops))] from-blue-500/30 via-transparent to-transparent" />

        <div className="relative w-28 shrink-0 border-r-2 border-[#374151] bg-[#151925] flex items-center justify-center overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse" />

          <div className="relative w-26 h-26 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110 duration-300">
            <img
              src={prize?.icon || DEFAULT_PRIZE_ICON}
              alt={prize?.name || "Prêmio"}
              className="h-full w-full object-contain"
              decoding="async"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 py-2 min-w-0">
          <div className="flex flex-col mb-2">
            <h2
              className="text-sm font-bold text-white uppercase leading-tight text-center"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
            >
              {prize?.name ?? "Item"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
                group relative w-full
                bg-[#FFD000] hover:bg-[#ffe033]
                border-b-[3px] border-b-[#c4a023]
                active:border-b-0 active:translate-y-0.75
                rounded-lg px-2 py-1.5
                transition-all duration-75
                flex items-center justify-center
            "
          >
            <span
              className="text-sm font-black text-white uppercase tracking-wide group-hover:scale-[1.02] transform transition-transform"
              style={{
                textShadow: "1px 1px 0 black",
                WebkitTextStroke: "0.5px black",
              }}
            >
              Resgatar
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PossiblePrizesProps {
  prizes: Prize[];
  maxVisible?: number;
}

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
        {visiblePrizes.map((prize, index) => (
          <CompactPrizeItem key={prize.id ?? index} prize={prize} />
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
