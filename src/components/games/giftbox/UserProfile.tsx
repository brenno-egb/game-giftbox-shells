"use client";

import type { UserProfile } from "@/@sdk/smartico";

// --- ÍCONES SVG (Feitos na mão para manter o estilo cartoon/bold) ---
const GameIcons = {
  Coin: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-md" fill="none">
      <circle cx="12" cy="12" r="9" className="fill-amber-400 stroke-black stroke-2" />
      <path d="M12 7V17M7 12H17" className="stroke-amber-600 stroke-[3] opacity-40" strokeLinecap="round" />
      <circle cx="9" cy="9" r="2.5" className="fill-white opacity-60" />
    </svg>
  ),
  Diamond: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-md" fill="none">
      <path
        d="M6 9L12 2L18 9L12 21L6 9Z"
        className="fill-cyan-400 stroke-black stroke-2"
        strokeLinejoin="round"
      />
      <path d="M6 9H18" className="stroke-cyan-600/50 stroke-2" />
      <path d="M12 2L12 21" className="stroke-cyan-600/50 stroke-2" />
    </svg>
  ),
  Gem: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-md" fill="none">
      <path
        d="M7 6L12 2L17 6V16L12 20L7 16V6Z"
        className="fill-emerald-400 stroke-black stroke-2"
        strokeLinejoin="round"
      />
      <rect x="11" y="6" width="2" height="10" className="fill-white opacity-40" />
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M8 21h8m-4-13v13m-1-6.4a4 4 0 1 1-2.4 3.4m6.8 0a4 4 0 1 0-2.4 3.4M7 4h10l-1 8h-8z" className="stroke-white stroke-2" />
    </svg>
  )
};

type Props = {
  profile: UserProfile | null;
};

// Componente para exibir os recursos (Moedas, Gemas, etc)
// Simula um "slot" físico escuro onde o número brilha
const ResourceSlot = ({
  icon: Icon,
  value,
  label,
  accentColor,
}: {
  icon: any;
  value: number;
  label: string;
  accentColor: string; // ex: text-amber-400
}) => (
  <div className="relative group">
    {/* Fundo do Slot (Sombra dura) */}
    <div className="absolute inset-0 bg-black/80 rounded-xl translate-y-1 translate-x-0" />
    
    {/* Container Principal */}
    <div className="relative flex items-center bg-slate-800 border-2 border-slate-600 rounded-xl p-1 pr-3 shadow-inner">
      {/* Ícone flutuando levemente para fora */}
      <div className="-ml-3 relative z-10 filter drop-shadow-lg transition-transform group-hover:scale-110">
        <Icon />
      </div>
      
      {/* Valor e Label */}
      <div className="flex flex-col ml-1 leading-none">
        <span className={`font-black text-sm ${accentColor} drop-shadow-sm filter tracking-wide`}>
          {value.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  </div>
);

export default function UserProfileGameUI({ profile }: Props) {
  if (!profile) return null;

  const points = profile.ach_points_balance ?? 0;
  const diamonds = profile.ach_diamonds_balance ?? 0;
  const gems = profile.ach_gems_balance ?? 0;
  const level = profile.ach_level_current ?? 1;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 font-sans">
      {/* PAINEL PRINCIPAL */}
      <div className="relative">
        {/* Sombra dura do Painel (O segredo do estilo blocky) */}
        <div className="absolute inset-0 bg-black/40 rounded-3xl translate-y-2 translate-x-0" />

        {/* Card em si */}
        <div className="relative bg-[#1a1f2e] rounded-3xl border-[3px] border-[#2d3548] p-4 overflow-hidden">
          
          {/* Decoração de fundo (Padrão sutil) */}
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            
            {/* --- AVATAR FRAME --- */}
            <div className="relative shrink-0">
              {/* O Frame Azulão Estilo Supercell */}
              <div className="w-28 h-28 bg-[#3b6eff] rounded-2xl rotate-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
                
                {/* Imagem Interna */}
                <div className="w-[90%] h-[90%] bg-slate-900 rounded-xl overflow-hidden border-2 border-[#6ea0ff] relative">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800">
                      <span className="text-3xl font-black text-white drop-shadow-md">
                        {profile.public_username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Brilho "Gloss" no vidro do avatar */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/30 pointer-events-none" />
                </div>

                {/* Badge de Nível (Estilo Escudo) */}
                <div className="absolute -bottom-3 -right-3 z-20">
                  <div className="bg-[#d0002e] text-white w-9 h-9 flex items-center justify-center font-black text-sm rounded-lg border-2 border-white shadow-md rotate-[-3deg]">
                    {level}
                  </div>
                </div>
              </div>
            </div>

            {/* --- INFORMAÇÕES DO JOGADOR --- */}
            <div className="flex-1 w-full text-center md:text-left">
              
              {/* Header com Nome e Tag */}
              <div className="mb-4">
                <div className="inline-block bg-black/30 rounded px-2 py-0.5 mb-1 backdrop-blur-sm border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Player Profile</span>
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] uppercase stroke-black">
                  {profile.public_username || "Unknown"}
                </h2>
                {/* Barra de XP Decorativa */}
                <div className="w-full max-w-[200px] h-2 bg-black/50 rounded-full mt-2 mx-auto md:mx-0 border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                </div>
              </div>

              {/* Grid de Recursos */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <ResourceSlot 
                  icon={GameIcons.Coin}
                  value={points}
                  label="Coins"
                  accentColor="text-amber-400"
                />
                <ResourceSlot 
                  icon={GameIcons.Diamond}
                  value={diamonds}
                  label="Gems"
                  accentColor="text-cyan-400"
                />
                <ResourceSlot 
                  icon={GameIcons.Gem}
                  value={gems}
                  label="Tokens"
                  accentColor="text-emerald-400"
                />
              </div>

            </div>

            {/* --- BOTÃO DE AÇÃO (Estilo "Settings" engrenagem) --- */}
            <div className="hidden md:block self-start">
               <button className="w-10 h-10 bg-slate-700 rounded-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center hover:bg-slate-600 text-slate-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}