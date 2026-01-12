import { notFound, useSearchParams } from "next/navigation";
import GameHost from "@/@games/host/GameHost";
import { getGameEntry, type GameKey } from "@/@games/registry";
import { validateGameParams } from "@/@games/core/utils/validation";
import { ErrorState } from "@/components/games/giftbox/shared/StateComponents";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GamePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const validation = validateGameParams(sp);

  if (!validation.valid) {
    return (
      <ErrorState title="Jogador não encontrado" message={validation.error} />
    );
  }

  const entry = getGameEntry(slug);
  if (!entry) return notFound();

  const skinRaw = sp.skin;
  const skinId = Array.isArray(skinRaw)
    ? skinRaw[0]
    : typeof skinRaw === "string"
    ? skinRaw
    : undefined;

  return <GameHost gameKey={slug as GameKey} skinId={skinId} />;
}
