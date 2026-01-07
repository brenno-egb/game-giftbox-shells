"use client";

import type { UserProfile } from "@/@sdk/smartico";

type Props = {
  profile: UserProfile | null;
};

export default function UserProfileHeader({ profile }: Props) {
  if (!profile) return null;

  // Valores padrão para prevenir undefined
  const points = profile.ach_points_balance ?? 0;
  const diamonds = profile.ach_diamonds_balance ?? 0;
  const gems = profile.ach_gems_balance ?? 0;
  const level = profile.ach_level_current;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border-2 border-slate-700 shadow-xl">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.public_username || "Avatar"}
              className="w-20 h-20 rounded-full border-4 border-amber-500 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-amber-500 shadow-lg">
              {profile.public_username?.[0]?.toUpperCase() || "?"}
            </div>
          )}

          {/* Level badge */}
          {level && (
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white">
              {level}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">
            {profile.public_username || "Jogador"}
          </h2>

          <div className="flex gap-4 text-sm">
            {/* Pontos */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold">P</span>
              </div>
              <div>
                <div className="text-blue-400 font-bold">
                  {points.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs">Pontos</div>
              </div>
            </div>

            {/* Diamantes */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-400 font-bold">💎</span>
              </div>
              <div>
                <div className="text-cyan-400 font-bold">
                  {diamonds.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs">Diamantes</div>
              </div>
            </div>

            {/* Gemas - SEMPRE MOSTRA! */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 font-bold">💚</span>
              </div>
              <div>
                <div
                  className={`font-bold ${
                    gems > 0 ? "text-emerald-400" : "text-gray-500"
                  }`}
                >
                  {gems.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs">Gemas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
