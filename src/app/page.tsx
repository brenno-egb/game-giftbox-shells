import Link from "next/link";
import { listGames } from "@/games/registry";

export default function Home() {
  const games = listGames();

  return (
    <main style={{ padding: 24 }}>
      <h1>Jogos</h1>

      <ul>
        {games.map((g) => (
          <li key={g.slug}>
            <Link href={`/games/${g.slug}?uid=test123&lang=pt&skin=${g.defaultSkinId}`}>
              {g.name}
            </Link>
          </li>
        ))}
      </ul>

      <p style={{ opacity: 0.7 }}>
        Dica dev: passe ?uid=test123&lang=pt (&skin=...) pra simular usuário.
      </p>
    </main>
  );
}
