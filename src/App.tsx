/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, number } from 'motion/react';
import { 
  Camera, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  MapPin, 
  Clock, 
  Sparkles,
  ChevronRight,
  History,
  Palette,
  Coins,
  Lightbulb
} from 'lucide-react';
import { ERAS, INITIAL_FILTERS } from './constants';
import { GameState, Filters } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    stage: 'menu',
    currentLevelIndex: 0,
    playerFilters: ERAS[0].initial,
    score: null,
    hintsUsed: 0,
    coins: 0,
    earnedCoins: 0,
    breakdown: null,
  });

  const [showIntro, setShowIntro] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);

  const currentEra = ERAS[gameState.currentLevelIndex];

  // More precise weighted scoring
  const calculateScoreBreakdown = (player: Filters, target: Filters) => {
    const calc = (p: number, t: number, range: number) => {
      const diff = Math.abs(p - t);
      return Math.max(0, Math.round(100 * (1 - diff / range)));
    };

    // 暖色氛圍: Temp & Sepia
    const warmthScore = Math.round((calc(player.temp, target.temp, 50) + calc(player.sepia, target.sepia, 40)) / 2);
    
    // 色彩還原: Saturate & Grayscale
    const colorScore = Math.round((calc(player.saturate, target.saturate, 60) + calc(player.grayscale, target.grayscale, 40)) / 2);
    
    // 畫面質感: 對比度 & Brightness
    const textureScore = Math.round((calc(player.contrast, target.contrast, 40) + calc(player.brightness, target.brightness, 40)) / 2);

    const total = Math.round((warmthScore * 0.4) + (colorScore * 0.3) + (textureScore * 0.3));

    return {
      total,
      breakdown: {
        warmth: warmthScore,
        color: colorScore,
        texture: textureScore,
      }
    };
  };

  const handleStartLevel = (index: number) => {
    setGameState(prev => ({
      ...prev,
      stage: 'level',
      currentLevelIndex: index,
      playerFilters: ERAS[index].initial,
      score: null,
      hintsUsed: 0,
      breakdown: null,
    }));
    setShowIntro(true);
    setIsHintOpen(false);
  };

  const handleFilterChange = (key: keyof Filters, value: number) => {
    setGameState((prev) => ({
      ...prev,
      playerFilters: {
        ...prev.playerFilters,
        [key]: value,
      },
    }));
  };

  const handleRestore = () => {
    const { total, breakdown } = calculateScoreBreakdown(
      gameState.playerFilters,
      currentEra.target
    );

  const earnedCoins = Math.floor(total / 10);

    setGameState((prev) => ({
        ...prev,
        stage: 'result',
        score: total,
        breakdown,

        earnedCoins,

        coins: prev.coins + earnedCoins,
      }));
    };

  const handleNext = () => {
    const nextIndex = gameState.currentLevelIndex + 1;
    if (nextIndex < ERAS.length) {
      handleStartLevel(nextIndex);
    } else {
      setGameState((prev) => ({ ...prev, stage: 'menu' }));
    }
  };

  const getFilterString = (f: Filters) => {
    return `
      sepia(${f.sepia}%) 
      brightness(${f.brightness}%) 
      contrast(${f.contrast}%) 
      saturate(${f.saturate}%) 
      grayscale(${f.grayscale}%)
      hue-rotate(${f.temp * 0.2}deg)
    `.trim();
  };

  const get評級 = (score: number) => {
    if (score >= 95) return { label: 'S', color: 'text-orange-500' };
    if (score >= 85) return { label: 'A', color: 'text-amber-400' };
    if (score >= 70) return { label: 'B', color: 'text-zinc-300' };
    return { label: 'C', color: 'text-zinc-500' };
  };

  return (
<div className="h-screen bg-[#060816] text-[#dbe7ff] font-sans selection:bg-cyan-400/30 overflow-hidden flex flex-col antialiased relative">      {/* Top Navigation Bar */}
    <header className="h-16 shrink-0 border-b border-cyan-400/10 px-4 md:px-8 flex items-center justify-between bg-[#0a1022]/70 backdrop-blur-2xl z-50 shadow-[0_0_40px_rgba(0,180,255,0.08)]">        <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => setGameState(prev => ({ ...prev, stage: 'menu' }))}>
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 rounded-xl rotate-12 flex items-center justify-center shadow-[0_0_20px_rgba(0,180,255,0.5)]">            <div className="w-3 h-3 md:w-4 md:h-4 bg-[#050507] rounded-full"></div>
          </div>
          <h1 className="text-base md:text-xl font-black tracking-tight uppercase text-white">
  <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
    時代光譜
  </span>
</h1>
        </div>
        
        {gameState.stage !== 'menu' && (
         <div className="flex items-center gap-4">

  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
    <Coins className="w-4 h-4 text-cyan-300" />

    <span className="text-sm font-bold text-cyan-100 tracking-wide">
      {gameState.coins}
    </span>

    <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/60">
      碎片
    </span>
  </div>

  <div className="flex items-center gap-2 md:gap-6 text-[9px] md:text-[10px] font-medium tracking-widest text-white/50 uppercase">
    <span className="hidden sm:inline text-white/20">
      檔案階段
    </span>

    <span className="text-orange-400">
      階段 0{gameState.currentLevelIndex + 1}
    </span>

    <div className="w-px h-4 bg-white/10"></div>

    <div className="flex gap-2">
      <button
        onClick={() =>
          setGameState(prev => ({ ...prev, stage: 'menu' }))
        }
        className="px-2 md:px-4 py-1.5 border border-white/10 rounded-sm hover:bg-white/5 transition-colors text-[9px] md:text-[10px] uppercase tracking-widest"
      >
        檔案庫
      </button>
    </div>
  </div>

</div>
        )}
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <AnimatePresence mode="wait">
          {gameState.stage === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full flex flex-col items-center p-6 md:p-8 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_45%)]"            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl w-full py-8 md:py-16"
              >
                <div className="text-center mb-10 md:mb-16">
                  <div className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-orange-400 mb-4 md:mb-6 font-bold">視覺文化檔案庫</div>
                  <h1 className="text-5xl md:text-8xl font-black tracking-[-0.06em] mb-4 text-white leading-tight pt-2">
                    時代
                  <span className="bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                    光譜
                  </span>
                   </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-4">
                  {ERAS.map((era, index) => (
                    <motion.div
                      key={era.id}
                      whileHover={{ y: -10 }}
                      className="group relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] overflow-hidden cursor-pointer border border-cyan-400/10 rounded-3xl bg-white/5 backdrop-blur-xl hover:border-cyan-300/40 transition-all duration-500 shadow-[0_0_40px_rgba(0,100,255,0.12)]"                      onClick={() => handleStartLevel(index)}
                    >
                      <img 
                        src={era.imageUrl} 
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0 opacity-50 group-hover:opacity-80"                        referrerPolicy="no-referrer"
                        alt={era.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full">
                        <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-2">階段 0{index + 1}</div>
                        <h3 className="text-xl md:text-2xl font-light text-white mb-1">{era.name}</h3>
                        <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/30">{era.location} · {era.year}</div>
                        <div className="mt-4 md:mt-6 flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                          <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold">進入檔案</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState.stage === 'level' && (
            <motion.div 
              key="level"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col lg:flex-row h-full overflow-hidden relative"
            >
              {/* Intro Overlay */}
              <AnimatePresence>
                {showIntro && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="max-w-xl w-full text-center"
                    >
                      <div className="text-[10px] uppercase tracking-[0.4em] text-orange-400 mb-6 font-bold">已接收新的任務</div>
                      <h2 className="text-4xl md:text-5xl font-light mb-4 text-white font-serif italic">{currentEra.name}</h2>
                      <div className="flex items-center justify-center gap-6 text-white/30 text-[10px] uppercase tracking-widest mb-8">
                        <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {currentEra.location}</span>
                        <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {currentEra.year}</span>
                      </div>
                      <p className="text-white/60 leading-relaxed mb-10 text-base">
                        {currentEra.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left p-6 bg-white/5 rounded-sm border border-white/10 mb-10">
                        {currentEra.clues.map((clue, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-1 h-1 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                            <span className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">{clue}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowIntro(false)}
                        className="px-12 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-orange-500 transition-all active:scale-95"
                      >
                        開始修復
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint Modal (Current Objective) */}
              <AnimatePresence>
                {isHintOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.92, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.92, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="max-w-lg w-full bg-[#0f172a]/90 border border-cyan-400/20 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.08)] backdrop-blur-2xl"
                    >
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500" />

                      <button
                        onClick={() => setIsHintOpen(false)}
                        className="absolute top-6 right-6 text-white/30 hover:text-cyan-300 transition-colors"
                      >
                        <RotateCcw className="w-5 h-5 rotate-45" />
                      </button>

                      <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300 mb-6 font-bold flex items-center gap-2">
                        <History className="w-3 h-3" />
                        Intelligence Briefing
                      </div>

                      <h2 className="text-3xl font-black mb-3 text-white tracking-tight">
                        {currentEra.name}
                      </h2>

                      <div className="flex items-center gap-6 text-white/30 text-[10px] uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {currentEra.location}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {currentEra.year}
                        </span>
                      </div>

                      <div className="space-y-7">
                        <section>
                          <label className="text-[9px] uppercase tracking-[0.25em] text-cyan-300/70 mb-3 block font-bold">
                            Historical Context
                          </label>

                          <p className="text-white/70 leading-relaxed text-sm">
                            {currentEra.description}
                          </p>
                        </section>

                        <section>
                          <label className="text-[9px] uppercase tracking-[0.25em] text-cyan-300/70 mb-4 block font-bold">
                            時代線索
                          </label>

                          <div className="space-y-3">
                            {currentEra.clues.map((clue, i) => (
                              <div
                                key={i}
                                className="flex gap-3 items-start border-l border-cyan-400/20 pl-4 py-1"
                              >
                                <span className="text-sm text-cyan-100/80 leading-relaxed">
                                  「{clue}」
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>

                      <button
                        onClick={() => setIsHintOpen(false)}
                        className="w-full mt-10 py-4 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-100 hover:bg-cyan-400/20 transition-all text-[10px] font-bold uppercase tracking-[0.25em]"
                      >
                        關閉簡報
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating 檔案 Hint Button */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold [writing-mode:vertical-lr] rotate-180 mb-4 h-24 flex items-center justify-center">檔案 Link</div>
                  <button 
                    disabled={gameState.hintsUsed >= 2}
                    onClick={() => {
                        if (gameState.hintsUsed < 2) {
                            setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
                            setIsHintOpen(true);
                        }
                    }}
                    className={`
                      relative group w-14 h-14 flex items-center justify-center rounded-sm transition-all duration-500
                      ${gameState.hintsUsed >= 2 
                        ? 'bg-zinc-800 border-zinc-700 cursor-not-allowed opacity-50' 
                        : 'bg-black/40 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 active:scale-90 shadow-lg'
                      }
                    `}
                  >
                    <div className={`
                          flex items-center justify-center transition-all duration-500
                          ${gameState.hintsUsed >= 2
                            ? 'text-zinc-600'
                            : 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'}
                        `}
                      >
                        <Lightbulb className="w-7 h-7 fill-current" />
                      </div>
                    
                    {/* Tooltip/Counter */}
                    <div className="absolute left-full ml-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-sm">
                            <div className="text-[9px] uppercase tracking-widest text-white/60 font-bold mb-0.5">
                                {gameState.hintsUsed >= 2 ? '連線中斷' : 'Access 檔案'}
                            </div>
                            <div className="text-[8px] tracking-widest text-orange-400/60 uppercase">
                                {2 - gameState.hintsUsed} 剩餘次數
                            </div>
                        </div>
                    </div>
                  </button>
                </div>

                {/* Hint Count Indicator dots */}
                <div className="flex flex-col gap-1.5">
                    {[0, 1].map(i => (
                        <div 
                            key={i} 
                            className={`w-1 h-3 rounded-full transition-all duration-500 ${i < (2 - gameState.hintsUsed) ? 'bg-orange-500' : 'bg-white/5'}`} 
                        />
                    ))}
                </div>
              </div>

              {/* Mobile Hint Button - Top Corner */}
              <div className="lg:hidden absolute left-4 top-4 z-40">
                <button 
                  disabled={gameState.hintsUsed >= 2}
                  onClick={() => {
                        if (gameState.hintsUsed < 2) {
                            setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
                            setIsHintOpen(true);
                        }
                  }}
                  className={`
                    w-10 h-10 rounded-sm flex items-center justify-center transition-all
                    ${gameState.hintsUsed >= 2 
                      ? 'bg-zinc-800 border-zinc-700 opacity-50' 
                      : 'bg-black/60 border border-white/10 active:scale-90'
                    }
                  `}
                >
                  <History className={`w-4 h-4 ${gameState.hintsUsed >= 2 ? 'text-zinc-600' : 'text-orange-400'}`} />
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${gameState.hintsUsed >= 2 ? 'bg-zinc-700 text-zinc-500' : 'bg-orange-600 text-white'}`}>
                    {2 - gameState.hintsUsed}
                  </span>
                </button>
              </div>

              {/* Central Viewport */}
              <div className="flex-1 bg-[#0a0a0c] relative flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-5 md:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)', backgroundSize: '24px 24px md:32px 32px' }}></div>
                
                <div className="relative w-full h-full max-w-3xl lg:max-h-[600px] border border-white/10 rounded-sm overflow-hidden shadow-2xl group flex items-center justify-center bg-zinc-950">
                  <motion.div 
                    layoutId={`img-${currentEra.id}`}
                    className="w-full h-full"
                    style={{ 
                      filter: getFilterString(gameState.playerFilters),
                      transition: 'filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <img 
                      src={currentEra.imageUrl} 
                      alt={currentEra.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  
                  {/* Viewfinder Overlays */}
                  <div className="absolute top-4 md:top-6 left-4 md:left-6 flex items-center gap-2 px-2 md:px-3 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] md:text-[10px] font-mono text-white/50 tracking-tighter transition-opacity group-hover:opacity-100 opacity-60">
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-red-500 animate-pulse" />
                    REC ● 00:{gameState.currentLevelIndex}:12:04
                  </div>
                  <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 text-[8px] md:text-[10px] font-mono text-white/30 tracking-widest px-2 md:px-3 py-1 bg-black/40 rounded transition-opacity group-hover:opacity-100 opacity-40 uppercase">
                    ISO {100 * (gameState.currentLevelIndex + 1)} · {35 + gameState.currentLevelIndex * 15}mm
                  </div>
                  <div className="absolute inset-0 border-[8px] md:border-[12px] border-black/10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500/50" />
                </div>
              </div>

              {/* Right Panel: Controls */}
              <aside className="w-full lg:w-80 bg-black/40 lg:bg-black/20 border-t lg:border-t-0 lg:border-l border-white/10 p-6 md:p-8 flex flex-col max-h-[45vh] lg:max-h-full shrink-0">
                <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                  <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 md:mb-10 block">氛圍校準</label>
                  
                  <div className="space-y-8 md:space-y-12 mb-6">
                    <ImmersiveSlider 
                      label="色溫" 
                      value={gameState.playerFilters.temp} 
                      onChange={(v) => handleFilterChange('temp', v)}
                      min={-100} max={100}
                      step={0.5}
                      displayValue={`${gameState.playerFilters.temp > 0 ? '+' : ''}${gameState.playerFilters.temp.toFixed(1)}k`}
                      trackGradient="from-blue-500 via-white to-orange-500"
                    />
                    <ImmersiveSlider 
                      label="飽和度" 
                      value={gameState.playerFilters.saturate} 
                      onChange={(v) => handleFilterChange('saturate', v)}
                      min={0} max={200}
                      step={0.5}
                      displayValue={`${gameState.playerFilters.saturate.toFixed(1)}%`}
                    />
                    <ImmersiveSlider 
                      label="顆粒感" 
                      value={gameState.playerFilters.grayscale} 
                      onChange={(v) => handleFilterChange('grayscale', v)}
                      min={0} max={100}
                      step={0.5}
                      displayValue={gameState.playerFilters.grayscale > 50 ? '高' : '低'}
                    />
                    <ImmersiveSlider 
                      label="對比度" 
                      value={gameState.playerFilters.contrast} 
                      onChange={(v) => handleFilterChange('contrast', v)}
                      min={50} max={150}
                      step={0.5}
                      displayValue={`${gameState.playerFilters.contrast.toFixed(1)}%`}
                    />
                     <ImmersiveSlider 
                      label="曝光" 
                      value={gameState.playerFilters.brightness} 
                      onChange={(v) => handleFilterChange('brightness', v)}
                      min={50} max={150}
                      step={0.5}
                      displayValue={`${gameState.playerFilters.brightness.toFixed(1)}%`}
                    />
                  </div>
                </div>

                <div className="mt-auto pt-4 md:pt-8 space-y-3 md:space-y-4">
                  <button 
                    onClick={handleRestore}
                    className="w-full py-4 md:py-5 bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase tracking-[0.25em] text-[10px] md:text-xs transition-all shadow-xl shadow-orange-950/40 active:scale-95"
                  >
                    還原時代
                  </button>
                  <button 
                    onClick={() => setGameState(prev => ({ ...prev, playerFilters: currentEra.initial }))}
                    className="w-full py-3 md:py-4 border border-white/5 text-white/30 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[9px] hover:text-white/60 hover:border-white/20 transition-all active:scale-95"
                  >
                    重設校準
                  </button>
                </div>
              </aside>
            </motion.div>
          )}

          {gameState.stage === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col items-center p-4 md:p-8 lg:p-12 bg-black overflow-y-auto"
            >
               <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 md:gap-12 lg:gap-16 items-start py-8">
                  <div className="space-y-10 md:space-y-12">
                    <section className="text-center lg:text-left">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="w-full"
                        >
                          <div className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8 block font-bold">修復比對結果</div>
                          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-10 relative">
                            <div className="absolute -inset-20 blur-[100px] bg-orange-500/10 rounded-full pointer-events-none hidden sm:block" />
                            <div className="relative text-8xl md:text-9xl lg:text-[11rem] font-black italic text-orange-600 tracking-tighter leading-[0.8]">
                              {gameState.score}%
                            </div>
                            <div className={`relative flex flex-col items-center sm:items-start sm:border-l border-white/10 sm:pl-10 pt-4 sm:pt-0`}>
                                <span className="text-[10px] uppercase tracking-widest text-white/20 mb-1">評級</span>
                                <span className={`text-6xl md:text-8xl font-black italic ${get評級(gameState.score || 0).color}`}>
                                    {get評級(gameState.score || 0).label}
                                </span>
                            </div>
                          </div>
                        </motion.div>
                        <h3 className="text-2xl md:text-3xl font-light text-white mt-12 md:mt-16 italic font-serif">修復分析報告</h3>

                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.4 }}
                          className="mt-6 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                        >
                          <Coins className="w-5 h-5 text-cyan-300" />

                          <span className="text-cyan-100 font-bold text-lg tracking-wide">
                            +{gameState.earnedCoins}
                          </span>

                          <span className="text-cyan-300/70 uppercase tracking-[0.2em] text-xs">
                            時代碎片
                          </span>
                        </motion.div>
                    </section>

                    {/* Breakdown Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: '暖色氛圍', value: gameState.breakdown?.warmth, icon: <Sparkles className="w-3 h-3"/> },
                        { label: '色彩還原', value: gameState.breakdown?.color, icon: <Palette className="w-3 h-3"/> },
                        { label: '畫面質感', value: gameState.breakdown?.texture, icon: <Camera className="w-3 h-3"/> },
                      ].map((item) => (
                        <div key={item.label} className="p-4 bg-white/[0.03] border border-white/5 rounded-sm">
                          <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-white/40 mb-2 font-bold">
                            {item.icon} {item.label}
                          </div>
                          <div className="text-xl md:text-2xl font-mono text-white">{item.value}%</div>
                          <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              className="h-full bg-orange-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 md:p-8 bg-white/[0.03] border border-white/10 rounded-sm">
                      <h4 className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-4 md:mb-5">
                         Archival Feedback
                      </h4>
                      <p className="text-white/60 text-sm md:text-base leading-relaxed italic font-serif opacity-80">
                        "{currentEra.insight}"
                      </p>
                    </div>

                    <button 
                      onClick={handleNext}
                      className="w-full sm:w-auto group flex items-center justify-center gap-6 py-5 px-12 bg-white text-black uppercase tracking-[0.3em] font-bold text-xs hover:bg-orange-400 transition-all hover:gap-8"
                    >
                      {gameState.currentLevelIndex + 1 < ERAS.length ? 'Next Database' : 'Return to 檔案s'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="order-first lg:order-last space-y-6 md:space-y-8">
                    <div className="relative group">
                      <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/80 border border-white/10 rounded text-[10px] uppercase tracking-widest font-bold text-white/60">Your Restoration</div>
                      <div className="rounded-sm overflow-hidden aspect-[4/3] border border-white/20 shadow-2xl">
                        <img 
                          src={currentEra.imageUrl} 
                          alt="Your result" 
                          className="w-full h-full object-cover"
                          style={{ filter: getFilterString(gameState.playerFilters) }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-orange-600 text-white rounded text-[10px] uppercase tracking-widest font-bold shadow-lg">Archival Truth (100%)</div>
                      <div className="rounded-sm overflow-hidden aspect-[4/3] border border-orange-500/40 shadow-2xl">
                         <img 
                          src={currentEra.imageUrl} 
                          alt="Historical target" 
                          className="w-full h-full object-cover"
                          style={{ filter: getFilterString(currentEra.target) }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-sm">
                      <div className="text-[9px] uppercase tracking-widest text-orange-400 font-bold mb-3">Precision Analysis</div>
                      <div className="space-y-2">
                        <AnalysisRow label="Temp" p={gameState.playerFilters.temp} t={currentEra.target.temp} unit="k" />
                        <AnalysisRow label="Sat" p={gameState.playerFilters.saturate} t={currentEra.target.saturate} unit="%" />
                        <AnalysisRow label="Cont" p={gameState.playerFilters.contrast} t={currentEra.target.contrast} unit="%" />
                      </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 border-t border-white/5 px-8 flex items-center justify-between bg-black/60 text-[9px] uppercase tracking-[0.3em] text-white/20 font-medium z-50">
        <div className="flex gap-6">
          <span>Engine: v2.4.0-Stable</span>
          <span>Access: 高 Priority</span>
        </div>
        <div>© 2024 視覺文化檔案庫</div>
        <div className="flex gap-6">
          <span>Mode: Atmospheric Restoration</span>
          <span className="text-orange-500/50">Terminal: 0xFD-Active</span>
        </div>
      </footer>
    </div>
  );
}

function AnalysisRow({ label, p, t, unit }: { label: string, p: number, t: number, unit: string }) {
  const diff = p - t;
  const isCorrect = Math.abs(diff) < 2; // More strict with precision
  
  return (
    <div className="flex items-center justify-between text-[10px] font-mono">
      <span className="text-white/40 uppercase">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-white/60">{p.toFixed(1)}{unit}</span>
        <ArrowRight className="w-2 h-2 text-white/20" />
        <span className="text-orange-400">{t.toFixed(1)}{unit}</span>
        <span className={`w-16 text-right ${isCorrect ? 'text-green-500' : 'text-red-400'}`}>
          {isCorrect ? 'MATCHED' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}${unit}`}
        </span>
      </div>
    </div>
  );
}

function ImmersiveSlider({ label, value, onChange, min, max, displayValue, trackGradient, step = 1 }: { 
  label: string, 
  value: number, 
  onChange: (v: number) => void,
  min: number,
  max: number,
  displayValue?: string,
  trackGradient?: string,
  step?: number
}) 
{
  const percentage = ((value - min) / (max - min)) * 100;

return (
  <div className="space-y-4 group">
    <div className="flex justify-between items-end">
      <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 group-hover:text-white/70 transition-colors">
        {label}
      </label>

      <span className="text-[10px] font-mono text-cyan-300 font-bold tracking-widest">
        {displayValue || `${Math.round(percentage)}%`}
      </span>
    </div>

    <div className="relative flex items-center h-4">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${
            trackGradient || 'from-cyan-400 to-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
      />

      <div
        className="absolute top-1/2 h-3 w-[2px] bg-cyan-200 pointer-events-none transition-transform opacity-40 group-hover:opacity-100"
        style={{
          left: `${percentage}%`,
          boxShadow: '0 0 12px rgba(34,211,238,0.8)',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  </div>
);
}