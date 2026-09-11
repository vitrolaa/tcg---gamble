import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { soundService } from '../../services/soundService';

export const HolographicCard = ({
  card,
  isFlipped = true,
  onFlip,
  showDuplicateBadge = false,
  duplicateCount = 0,
  isNew = false,
  interactive = true,
  className = '',
  onClick
}) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const isUltra = card?.rarity === 'Ultra Rara';
  const isRare = card?.rarity === 'Rara';

  const handleMouseMove = (e) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: isUltra ? 0.9 : isRare ? 0.6 : 0.25
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isUltra) {
      soundService.playRareShine();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  const handleClick = (e) => {
    if (onFlip) {
      soundService.playCardFlip();
      onFlip();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`perspective-1000 select-none ${className}`}
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={cardRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: isFlipped ? rotateX : 0,
          rotateY: isFlipped ? rotateY : 180,
          scale: isHovered && interactive ? 1.04 : 1
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 260,
          mass: 0.6
        }}
        className={`relative w-full aspect-[2.5/3.5] rounded-2xl transform-style-3d cursor-pointer ${
          isUltra ? 'ultra-rare-glow' : isRare ? 'rare-glow' : 'shadow-lg shadow-black/20'
        }`}
      >
        {/* CARD FRONT (Flipped) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden bg-slate-900 border-2 ${
            isUltra
              ? 'border-amber-400/90 shadow-inner'
              : isRare
              ? 'border-blue-400/80'
              : 'border-slate-700/80 dark:border-slate-700'
          }`}
        >
          {/* Main Card Artwork */}
          <div className="relative w-full h-full bg-slate-950 flex flex-col">
            <img
              src={card?.image}
              alt={card?.name || 'Carta Pokémon'}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://assets.tcgdex.net/univ/sv/sv01/symbol';
              }}
            />

            {/* Dynamic Holographic Overlay */}
            {(isUltra || isRare) && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-200"
                style={{
                  opacity: glarePos.opacity,
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.85) 0%, rgba(255,215,0,0.5) 25%, rgba(0,255,238,0.4) 50%, transparent 75%)`
                }}
              />
            )}

            {/* Ultra Rare Foil Rainbow Shimmer */}
            {isUltra && (
              <div className="absolute inset-0 pointer-events-none holo-foil is-active opacity-60 mix-blend-screen" />
            )}

            {/* Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
              {isNew && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 rounded-md bg-gradient-to-r from-orient-torii to-orient-sakura text-white font-black text-[9px] tracking-wider uppercase shadow-md border border-white/40 flex items-center gap-1 font-japanese"
                >
                  <span>新</span>
                  <span>NOVA!</span>
                </motion.span>
              )}

              {showDuplicateBadge && duplicateCount > 1 && (
                <span className="ml-auto px-2 py-0.5 rounded-md bg-slate-950/90 text-amber-300 font-extrabold text-[10px] border border-amber-500/40 shadow-md">
                  x{duplicateCount}
                </span>
              )}
            </div>

            {/* Bottom Minimalist Tag */}
            <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-20">
              <div className="px-2 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                  {card?.name}
                </span>
                <span className={`text-[10px] font-extrabold ${
                  isUltra ? 'text-amber-400 font-japanese' : isRare ? 'text-blue-400 font-japanese' : 'text-slate-400 font-japanese'
                }`}>
                  {isUltra ? '極 • Ultra' : isRare ? '稀 • Rara' : card?.rarity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD BACK (Unflipped) */}
        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-950 via-slate-950 to-rose-950 border-2 border-amber-500/40 shadow-2xl p-2.5 flex items-center justify-center">
          <div className="w-full h-full rounded-xl border border-white/20 bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 p-3 flex flex-col items-center justify-between relative overflow-hidden">
            
            <div className="w-full flex items-center justify-between text-[9px] text-amber-400 font-japanese font-bold tracking-widest">
              <span>ポケモン</span>
              <span>POKÉMON</span>
            </div>

            {/* Pokéball Center Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-slate-950 bg-gradient-to-b from-orient-torii to-rose-700 shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute bottom-0 w-full h-1/2 bg-white" />
                <div className="absolute w-full h-1 bg-slate-950 z-10" />
                <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-950 z-20 flex items-center justify-center shadow-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                </div>
              </div>

              <div className="mt-3 flex flex-col items-center">
                <span className="font-display font-black text-xs tracking-widest text-amber-300 drop-shadow-sm">
                  POKÉMON TCG
                </span>
              </div>
            </div>

            <div className="text-[8px] text-slate-400 font-semibold tracking-wider uppercase font-japanese">
              タップして開封 • Toque para Virar
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
