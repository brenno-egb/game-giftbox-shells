"use client";

type Props = {
  message: string;
  backgroundImage?: string;
};

export default function LoadingScreen({ 
  message, 
  backgroundImage = "/games/giftbox/background.avif" 
}: Props) {
  return (
    <div className="fixed inset-0 z-999 flex flex-col justify-end pb-16 bg-[#162955] overflow-hidden font-sans">
      
      {/* === WALLPAPER DE FUNDO === */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition: 'top' }}    
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#000000] via-[#0c1833]/70 to-transparent" />
      </div>

      {/* === CONTEÚDO INFERIOR === */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-8 flex flex-col gap-4">
        
        {/* Texto da Mensagem */}
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-widest drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]"
              style={{ WebkitTextStroke: "1px black" }}>
            {message}
          </h2>
        </div>

        <div className="relative w-full h-9 bg-black/20 rounded-xl border-4 border-[#524c00] p-0.75 shadow-[0_4px_0_rgba(0,0,0,0.3)] overflow-hidden">
          
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.3)_10px,rgba(0,0,0,0.3)_20px)] opacity-50" />
          
          <div className="h-full relative rounded-md overflow-hidden box-border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)] animate-progress-bar">
            <div className="absolute inset-0 bg-[#d99000]" />
            <div className="absolute inset-0 bottom-[30%] bg-[#ffc800]" />
            <div className="absolute inset-0 bottom-[65%] bg-[#ffdd55]" />
          </div>
        </div>
      </div>

      {/* Animações */}
      <style jsx>{`
        @keyframes moveStripes {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }

        @keyframes progressBar {
          0% { width: 5%; }
          20% { width: 35%; }
          40% { width: 58%; }
          60% { width: 78%; }
          80% { width: 92%; }
          95% { width: 98%; }
          100% { width: 100%; }
        }

        .animate-progress-bar {
          animation: progressBar 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}