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

  const uidRaw = sp.uid;
  const langRaw = sp.lang;
  const skinRaw = sp.skin;

  const userId = Array.isArray(uidRaw) ? uidRaw[0] : (uidRaw ?? "test-user");
  const language = Array.isArray(langRaw) ? langRaw[0] : (langRaw ?? "pt");
  const skinId = Array.isArray(skinRaw) ? skinRaw[0] : undefined;

  return (
    <GameHost
      gameKey={slug as GameKey}
      userId={userId}
      language={language}
      skinId={skinId}
    />
  );
}

