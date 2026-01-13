"use client";

import type { UserLevel, UserProfile } from "@/@sdk/smartico";
import Image from "next/image";
import { GameIcons } from "./ChestComponents";

type Props = {
  profile: UserProfile | null;
  level: UserLevel | null;
};

const ResourceSlot = ({
  icon: Icon,
  value,
  accentColor,
}: {
  icon: any;
  value: number;
  accentColor: string;
}) => (
  <div className="relative group shrink-0">
    {/* Fundo Sombra Sutil */}
    <div className="absolute inset-0 bg-black/40 rounded-md translate-y-0.75" />
    
    {/* Container - Padding reduzido e altura fixa para alinhamento perfeito */}
    <div className="relative flex items-center h-7 bg-slate-800 border-2 border-slate-600 rounded-sm px-2 gap-1.5 min-w-15 shadow-inner hover:bg-slate-750 transition-colors">
      <div className="absolute -left-3 filter drop-shadow-sm shrink-0 -ml-0.5 w-7 h-7">
        <Icon />
      </div>
      <span className={`font-semibold text-xs ${accentColor} tracking-wide whitespace-nowrap leading-none text-center pl-3 w-full`}>
        {value.toLocaleString()}
      </span>
    </div>
  </div>
);

export default function UserProfileGameUI({ profile, level }: Props) {
  if (!profile) return null;

  const points = profile.ach_points_balance ?? 0;
  const diamonds = profile.ach_diamonds_balance ?? 0;
  const gems = profile.ach_gems_balance ?? 0;

  return (
    <div className="w-full max-w-2xl p-1">
      {/* CARD PRINCIPAL */}
      <div className="relative">
        
        {/* Sombra do Card */}
        <div className="absolute inset-0 bg-black/40 rounded-lg translate-y-0.5 translate-x-0" />

        {/* Container do Card */}
        <div className="relative bg-linear-to-br from-[#1a1f2e] to-[#251600] rounded-lg border-3 border-[#2d3548] px-3 py-2 overflow-hidden">
          
          {/* Padrão de Fundo Sutil */}
          <div className="absolute top-6 -right-20 w-56 h-56 opacity-20 pointer-events-none">
             <img src={level?.image}/>
          </div>

          {/* LAYOUT: Flex Row (Imagem Esquerda | Infos Direita) */}
          <div className="relative z-10 flex flex-row items-center gap-4">
            
            {/* 1. IMAGEM */}
            <div className="shrink-0 relative group">
              {/* Moldura do Avatar */}
              <div className="w-16 h-16 bg-linear-to-b from-[#DF9C36] to-yellow-800 rounded-sm rotate-3 flex items-center justify-center transition-transform group-hover:rotate-0">
                
                {/* Imagem Interna */}
                <div className="w-[90%] h-[90%] bg-slate-900 rounded-sm overflow-hidden border-2 border-[#30230F] relative">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover scale-140" width={100} height={100} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800">
                      <span className="text-2xl font-black text-white drop-shadow-md">
                        {profile.public_username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Brilho */}
                  <div className="absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Badge de Nível (Mais discreto) */}
                {/* <div className="absolute -bottom-2 -right-2 z-20">
                  <div className="text-white w-6 h-6 flex items-center justify-center font-black text-[10px] drop-shadow-md drop-shadow-black rotate-6">
                    <img src={level?.image}/>
                  </div>
                </div> */}
              </div>
            </div>

            {/* 2. INFORMAÇÕES (DIREITA) - Layout Coluna Compacta */}
            <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
              
              {/* Cabeçalho: Nome e Nome do Nível */}
              <div className="flex flex-col">
                <h2 className="text-xl font-bold max-w-50 text-white truncate leading-tight drop-shadow-md">
                  {profile.public_username || "Jogador"}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                    {level?.name || "Novato"}
                </span>
              </div>

              {/* Recursos Inline */}
              <div className="flex flex-wrap items-center gap-4 mt-1.5 ml-2">
                <ResourceSlot 
                  icon={GameIcons.Coin}
                  value={points}
                  accentColor="text-white"
                />
                <ResourceSlot 
                  icon={GameIcons.Diamond}
                  value={diamonds}
                  accentColor="text-white"
                />
                <ResourceSlot 
                  icon={GameIcons.Gem}
                  value={gems}
                  accentColor="text-white"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}