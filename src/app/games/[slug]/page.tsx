import { notFound } from "next/navigation";
import { GAMES } from "@/games/registry";
import GameHost from "@/lib/smartico/GameHost";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GamePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const game = (GAMES as any)[slug];
  if (!game) return notFound();

  const userIdRaw = sp.uid;
  const langRaw = sp.lang;

  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : (userIdRaw ?? "test-user");
  const language = Array.isArray(langRaw) ? langRaw[0] : (langRaw ?? "pt");

  return <GameHost game={game} userId={userId} language={language} />;
}