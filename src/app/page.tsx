import Link from "next/link";
import { GAMES_LIST } from "@/games/registry";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Jogos</h1>
      <ul>
        {GAMES_LIST.map(g => (
          <li key={g.slug}>
            <Link href={`/games/${g.slug}`}>{g.name}</Link>
          </li>
        ))}
      </ul>
      <p style={{ opacity: 0.7 }}>
        Dica dev: passe ?uid=test123&lang=pt pra simular usuário.
      </p>
    </main>
  );
}
