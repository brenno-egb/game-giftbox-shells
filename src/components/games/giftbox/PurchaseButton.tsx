"use client";

type Props = {
  hasAvailable: boolean;
};

const STORE_URL = "https://www.lottu.bet.br/gamification/store";

export default function PurchaseButton({ hasAvailable }: Props) {
  const handleClick = () => {
    window.location.href = STORE_URL;
  };

  if (!hasAvailable) {
    // Usuário não tem baús -> botão agressivo fixed
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black via-black/95 to-transparent">
        <button
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-amber-500/50 hover:scale-105 flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🛒</span>
          <span className="text-lg">Compre Baús Aqui!</span>
        </button>
      </div>
    );
  }

  // Usuário tem baús -> botão discreto no final
  return (
    <div className="mt-12 mb-8 flex justify-center">
      <button
        onClick={handleClick}
        className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 border-2 border-slate-600 hover:border-amber-500 hover:shadow-lg flex items-center gap-2"
      >
        <span>🛒</span>
        <span>Compre mais baús</span>
      </button>
    </div>
  );
}