"use client";

import { motion } from "framer-motion";

type Props = {
  message: string;
  backgroundImage?: string;
};

export default function LoadingScreen({ 
  message, 
  backgroundImage = "/games/giftbox/background.avif" 
}: Props) {
  return (
    <div className="fixed inset-0 z-999 flex flex-col justify-end pb-16 md:pb-24 bg-[#162955] overflow-hidden font-sans">
      
      {/* === WALLPAPER DE FUNDO === */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          style={{ backgroundImage: `url(${backgroundImage})` }}    
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#000000] via-[#0c1833]/70 to-transparent" />
      </div>

      {/* === CONTEÚDO INFERIOR === */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-8 flex flex-col gap-4">
        
        {/* Texto da Mensagem */}
        <div className="flex justify-between items-end">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-widest drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]"
              style={{ WebkitTextStroke: "1px black" }}>
            {message}
          </h2>
        </div>

        <div className="relative w-full h-9 bg-black/20 rounded-xl border-4 border-[#524c00] p-0.75 shadow-[0_4px_0_rgba(0,0,0,0.3)] overflow-hidden">
          
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.3)_10px,rgba(0,0,0,0.3)_20px)] opacity-50" />

          <motion.div
            className="h-full relative rounded-md overflow-hidden box-border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]"
            initial={{ width: "5%" }}
            animate={{ width: ["5%", "40%", "70%", "90%", "100%"] }}
            transition={{ 
              duration: 3.5, 
              ease: "easeInOut", 
              repeat: Infinity, 
              repeatType: "reverse"
            }}
          >

            {/* 1. Camada Base (A cor mais escura, fundo total) */}
            <div className="absolute inset-0 bg-[#d99000]" />

            {/* 2. Camada Média (Cor principal, cobre 70% superior) */}
            <div className="absolute inset-0 bottom-[30%] bg-[#ffc800]" />

            {/* 3. Camada Superior (Brilho/Highlight, cobre 35% superior) */}
            <div className="absolute inset-0 bottom-[65%] bg-[#ffdd55]" />

          </motion.div>
        </div>

      </div>

      {/* Animação das listras */}
      <style jsx>{`
        @keyframes moveStripes {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
}