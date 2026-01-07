import { notFound } from "next/navigation";
import GameHost from "@/games/host/GameHost";
import { getGameEntry, type GameKey } from "@/games/registry";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GamePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

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