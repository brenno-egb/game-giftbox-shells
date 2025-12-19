import { notFound } from "next/navigation";
import GameHost from "@/games/host/GameHost";
import { getGameEntry, type GameKey } from "@/games/registry";

type PageProps = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default function GamePage({ params, searchParams }: PageProps) {
  const slug = params.slug;

  const entry = getGameEntry(slug);
  if (!entry) return notFound();

  const uidRaw = searchParams.uid;
  const langRaw = searchParams.lang;
  const skinRaw = searchParams.skin;

  const userId = Array.isArray(uidRaw) ? uidRaw[0] : (uidRaw ?? "test-user");
  const language = Array.isArray(langRaw) ? langRaw[0] : (langRaw ?? "pt");
  const skinId = Array.isArray(skinRaw) ? skinRaw[0] : (skinRaw ?? undefined);

  return (
    <GameHost
      gameKey={slug as GameKey}
      userId={userId}
      language={language}
      skinId={skinId}
    />
  );
}
