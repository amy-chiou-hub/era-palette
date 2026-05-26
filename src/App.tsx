/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  RotateCcw, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Sparkles,
  ChevronRight,
  History,
  Palette,
  Coins,
  Lightbulb,
  Terminal,
  Play,
  Home,
  Lock,
  Aperture,
  BookOpen,
  Award
} from 'lucide-react';
import { ERAS } from './constants';
import { GameState, Filters } from './types';

interface RepairRecord {
  levelIndex: number;
  highestScore: number;
  rating: string;
  ratingColor: string;
  savedFilters: Filters;
}

export default function App() {
  // 完美對齊 types.ts 擴充後的 GameState
  const [gameState, setGameState] = useState<GameState>({
    stage: 'welcome', 
    currentLevelIndex: 0,
    playerFilters: ERAS[0].initial,
    score: null,
    hintsUsed: 0,
    coins: 0, 
    earnedCoins: 0,
    breakdown: null,
  });

  const [repairRecords, setRepairRecords] = useState<Record<number, RepairRecord>>({});
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([0, 1, 2]); // 前 3 關免費
  const [showIntro, setShowIntro] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [lockAlert, setLockAlert] = useState<{ show: boolean; required: number; name: string; isShortage: boolean } | null>(null);

  useEffect(() => {
    document.title = "時代光譜 | 歷史影像與色彩氛圍修復系統";
  }, []);

  const currentEra = ERAS[gameState.currentLevelIndex];

  const getRequiredFragments = (index: number) => {
    if (index <= 2) return 0;
    return (index - 2) * 5; 
  };

  const calculateScoreBreakdown = (player: Filters, target: Filters) => {
    const calc = (p: number, t: number, range: number) => {
      const diff = Math.abs(p - t);
      return Math.max(0, Math.round(100 * (1 - diff / range)));
    };
    const warmthScore = Math.round((calc(player.temp, target.temp, 50) + calc(player.sepia, target.sepia, 40)) / 2);
    const colorScore = Math.round((calc(player.saturate, target.saturate, 60) + calc(player.grayscale, target.grayscale, 40)) / 2);
    const textureScore = Math.round((calc(player.contrast, target.contrast, 40) + calc(player.brightness, target.brightness, 40)) / 2);
    const total = Math.round((warmthScore * 0.4) + (colorScore * 0.3) + (textureScore * 0.3));
    return { total, breakdown: { warmth: warmthScore, color: colorScore, texture: textureScore } };
  };

  const get評級 = (score: number) => {
    if (score >= 95) return { label: 'S', color: 'text-orange-500' };
    if (score >= 85) return { label: 'A', color: 'text-amber-400' };
    if (score >= 70) return { label: 'B', color: 'text-zinc-300' };
    return { label: 'C', color: 'text-zinc-500' };
  };

  const handleStartLevel = (index: number) => {
    const required = getRequiredFragments(index);
    const isAlreadyUnlocked = unlockedLevels.includes(index);

    if (!isAlreadyUnlocked) {
      if (gameState.coins < required) {
        setLockAlert({ show: true, required, name: ERAS[index].name, isShortage: true });
        setTimeout(() => setLockAlert(null), 3000);
        return;
      } else {
        setGameState(prev => ({ ...prev, coins: prev.coins - required }));
        setUnlockedLevels(prev => [...prev, index]);
        setLockAlert({ show: true, required, name: ERAS[index].name, isShortage: false });
        setTimeout(() => setLockAlert(null), 2000);
      }
    }

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
      playerFilters: { ...prev.playerFilters, [key]: value },
    }));
  };

  const handleRestore = () => {
    const { total, breakdown } = calculateScoreBreakdown(gameState.playerFilters, currentEra.target);
    const earnedCoins = Math.floor(total / 25);
    const ratingInfo = get評級(total);

    const existingRecord = repairRecords[gameState.currentLevelIndex];
    if (!existingRecord || total > existingRecord.highestScore) {
      setRepairRecords(prev => ({
        ...prev,
        [gameState.currentLevelIndex]: {
          levelIndex: gameState.currentLevelIndex,
          highestScore: total,
          rating: ratingInfo.label,
          ratingColor: ratingInfo.color,
          savedFilters: gameState.playerFilters
        }
      }));
    }

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
      const required = getRequiredFragments(nextIndex);
      const isAlreadyUnlocked = unlockedLevels.includes(nextIndex);
      if (isAlreadyUnlocked || gameState.coins >= required) {
        handleStartLevel(nextIndex);
      } else {
        setGameState((prev) => ({ ...prev, stage: 'menu' }));
      }
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

  return (
    <div className="h-screen text-[#f3efe8] font-sans selection:bg-amber-200/20 overflow-hidden flex flex-col antialiased relative bg-[#09090b]">      
      
      {/* 頂部導覽列 */}
      <header className="h-16 shrink-0 border-b border-white/10 px-4 md:px-8 flex items-center justify-between bg-[#111114]/70 backdrop-blur-2xl z-50 shadow-[0_0_40px_rgba(0,180,255,0.08)]">
        <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => setGameState(prev => ({ ...prev, stage: 'welcome' }))}>
          <div className="w-9 h-9 relative flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 shadow-[0_0_20px_rgba(226,195,139,0.15)] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#e2c38b]/20 via-[#b08ad9]/10 to-transparent opacity-60" />
            <Aperture className="w-5 h-5 text-amber-200/80 group-hover:rotate-90 transition-transform duration-700 ease-out z-10" />
            <div className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-[4px] animate-pulse bottom-1 right-1" />
          </div>
          <h1 className="text-base md:text-xl font-black tracking-tight uppercase text-white">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-400 bg-clip-text text-transparent">時代光譜</span>
          </h1>
        </div>
        
        {/* 右側功能狀態組 */}
        <div className="flex items-center gap-3 md:gap-4">
          {gameState.stage !== 'gallery' && (
            <button 
              onClick={() => setGameState(prev => ({ ...prev, stage: 'gallery' }))}
              className="flex items-center gap-2 px-3.5 py-2 border border-cyan-500/20 rounded-2xl bg-cyan-500/5 text-xs font-bold tracking-widest text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.05)] active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">時光觀測圖鑑</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#e2c38b]/10 border border-[#e2c38b]/20 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
            <Coins className="w-4 h-4 text-[#e2c38b]" />
            <span className="text-sm font-bold text-cyan-100 tracking-wide">{gameState.coins}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#e2c38b]/60">碎片</span>
          </div>

          {gameState.stage !== 'menu' && gameState.stage !== 'welcome' && gameState.stage !== 'gallery' && (
            <div className="flex items-center gap-2 md:gap-4 text-[9px] md:text-[10px] font-medium tracking-widest text-white/50 uppercase">
              <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
              <button
                onClick={() => setGameState(prev => ({ ...prev, stage: 'menu' }))}
                className="px-3 py-1.5 border border-white/10 rounded-sm hover:bg-white/[0.04] transition-colors text-[9px] md:text-[10px] uppercase tracking-widest"
              >
                檔案庫
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#5d5470]/20 blur-[140px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-[500px] w-[500px] rounded-full bg-[#3f4f63]/20 blur-[140px] pointer-events-none" />

      <main className="flex-1 relative flex overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* Welcome 歡迎啟動畫面 */}
          {gameState.stage === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_rgba(24,24,27,0.8),_rgba(9,9,11,1)),_url('https://grainy-gradients.vercel.app/noise.svg')] bg-cover relative overflow-hidden"
            >
              {/* 背景動態時光流動粒子 */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[
                  { color: 'bg-amber-500/10', size: 'w-72 h-72', x: ['-10%', '20%'], y: ['20%', '40%'], duration: 15 },
                  { color: 'bg-purple-500/10', size: 'w-96 h-96', x: ['80%', '60%'], y: ['10%', '30%'], duration: 20 },
                  { color: 'bg-cyan-500/10', size: 'w-80 h-80', x: ['20%', '50%'], y: ['70%', '50%'], duration: 18 },
                  { color: 'bg-blue-500/5', size: 'w-[500px] h-[500px]', x: ['50%', '30%'], y: ['40%', '70%'], duration: 25 },
                ].map((particle, i) => (
                  <motion.div
                    key={i}
                    className={`absolute rounded-full blur-[80px] ${particle.color} ${particle.size}`}
                    animate={{ x: particle.x, y: particle.y, scale: [1, 1.15, 0.9, 1] }}
                    transition={{ duration: particle.duration, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  />
                ))}
              </div>

              <div className="max-w-2xl w-full text-center space-y-10 z-10 py-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold shadow-inner">
                  <Terminal className="w-3 h-3 text-orange-500 animate-pulse" />
                  視覺文化觀測終端系統 v2.4
                </div>
                <div className="space-y-4">
                  <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter">
                    時代<span className="bg-gradient-to-r from-[#e2c38b] via-[#c6b3ff] to-[#7a8ca5] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(198,169,114,0.3)]">光譜</span>
                  </h1>
                  <p className="text-zinc-400 text-xs md:text-sm tracking-[0.25em] font-light uppercase">— 歷史影像與色彩氛圍修復系統 —</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left border border-white/10 p-6 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-orange-400 tracking-wider flex items-center gap-1.5"><Camera className="w-3 h-3" /> 01. 接入檔案</div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">深入...世紀與城市的碎片，讀取歷史線索與影像背景。</p>
                  </div>
                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                    <div className="text-[10px] font-bold text-cyan-400 tracking-wider flex items-center gap-1.5"><Palette className="w-3 h-3" /> 02. 校準色彩</div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">調校色溫、飽和度與對比，重現該時代專屬的視覺質感。</p>
                  </div>
                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                    <div className="text-[10px] font-bold text-indigo-400 tracking-wider flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> 03. 還原真相</div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">與歷史真實色彩進行精準比對，賺取碎片解鎖更多歷史庫。</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'menu' }))}
                    className="group relative inline-flex items-center gap-3 px-10 py-4.5 bg-gradient-to-r from-[#e2c38b] to-[#b08ad9] text-black font-black uppercase tracking-[0.25em] text-xs rounded-xl shadow-[0_0_30px_rgba(176,138,217,0.3)] hover:shadow-[0_0_40px_rgba(226,195,139,0.5)] hover:scale-[1.03] transition-all active:scale-95 duration-300"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    進入視覺資料庫
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 視覺資料館 (關卡選單畫面) */}
          {gameState.stage === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full flex flex-col items-center p-6 md:p-8 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(120,94,58,0.22),_transparent_45%)] relative"
            >
              <AnimatePresence>
                {lockAlert?.show && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className={`absolute top-6 z-50 border backdrop-blur-xl px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium
                      ${lockAlert.isShortage ? 'bg-red-950/90 border-red-500/30 text-red-200' : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'}`}
                  >
                    {lockAlert.isShortage ? (
                      <>
                        <Lock className="w-4 h-4 text-red-400 animate-bounce" />
                        <span>核心權限不足！開啟「{lockAlert.name}」需要消耗 <strong>{lockAlert.required}</strong> 碎片。</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>成功消耗 <strong>{lockAlert.required}</strong> 碎片，解鎖「{lockAlert.name}」觀測權限！</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute right-6 top-6 z-40">
                <button
                  onClick={() => setGameState(prev => ({ ...prev, stage: 'welcome' }))}
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl bg-white/[0.02] text-xs font-bold tracking-widest text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  <Home className="w-3.5 h-3.5" />返回首頁
                </button>
              </div>

              <div className="max-w-6xl w-full py-8 md:py-16">
                <div className="text-center mb-10 md:mb-16">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-orange-400 mb-4 font-bold">歷史視覺檔案總庫</div>
                  <h1 className="text-5xl md:text-8xl font-black tracking-[-0.06em] text-white">
                    時代<span className="bg-gradient-to-r from-[#e2c38b] via-[#c6b3ff] to-[#7a8ca5] bg-clip-text text-transparent">光譜</span>
                  </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-4">
                  {ERAS.map((era, index) => {
                    const requiredFragments = getRequiredFragments(index);
                    const isUnlocked = unlockedLevels.includes(index);
                    const isLocked = !isUnlocked && gameState.coins < requiredFragments;
                    const hasRecord = repairRecords[index];
                    
                    return (
                      <motion.div
                        key={era.id}
                        whileHover={(!isLocked || isUnlocked) ? { y: -10 } : {}}
                        className={`group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden cursor-pointer border rounded-3xl backdrop-blur-xl transition-all duration-500 shadow-2xl
                          ${(!isLocked || isUnlocked) ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-black/40 cursor-not-allowed opacity-60'}`}                      
                        onClick={() => handleStartLevel(index)}
                      >
                        <img 
                          src={era.imageUrl} 
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-50
                            ${(isUnlocked || !isLocked) ? 'group-hover:scale-110 group-hover:opacity-80' : 'grayscale opacity-20 filter blur-[2px]'}`}
                          referrerPolicy="no-referrer"
                          alt={era.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        
                        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center text-[10px] font-bold">
                          {hasRecord ? (
                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-orange-500/30">
                              <Award className="w-3 h-3 text-orange-400" />
                              <span className={hasRecord.ratingColor}>最高: {hasRecord.rating} ({hasRecord.highestScore}分)</span>
                            </div>
                          ) : <div />}

                          <div className="backdrop-blur-md border border-white/10 px-2 py-0.5 rounded bg-black/40">
                            {isUnlocked ? (
                              <span className="text-emerald-400">已解鎖</span>
                            ) : (
                              <span className={isLocked ? 'text-zinc-500' : 'text-cyan-400'}>🔑 {requiredFragments} 碎片</span>
                            )}
                          </div>
                        </div>

                        {!isUnlocked && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 space-y-2">
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${isLocked ? 'text-zinc-500 border-white/5 bg-zinc-900/80' : 'text-cyan-400 border-cyan-500/30 bg-cyan-950/80 animate-pulse'}`}>
                              <Lock className="w-4 h-4" />
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full z-10">
                          <div className="text-[9px] uppercase tracking-widest text-orange-400 font-bold mb-2">階段 0{index + 1}</div>
                          <h3 className="text-xl md:text-2xl font-light text-white mb-1">{era.name}</h3>
                          <div className="text-[9px] text-white/30">{era.location} · {era.year}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 時光觀測圖鑑 */}
          {gameState.stage === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full h-full flex flex-col items-center p-6 md:p-8 overflow-y-auto bg-[#0a0a0d]"
            >
              <div className="max-w-5xl w-full py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-6 mb-10 gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold block mb-1">CHRONICLE LOGS</span>
                    <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 justify-center sm:justify-start">
                      <BookOpen className="w-6 h-6 text-cyan-400" /> 時光觀測修復日誌
                    </h2>
                  </div>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'menu' }))}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold tracking-widest text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    返回控制主機
                  </button>
                </div>

                {Object.keys(repairRecords).length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                    <History className="w-12 h-12 text-zinc-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-sm text-zinc-500 tracking-widest uppercase">目前主機中尚未有成功的色彩修復數據紀錄</p>
                    <p className="text-xs text-zinc-600 mt-2">前往檔案庫修復關卡後，系統將在此自動建檔最完美的渲染版本。</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {Object.values(repairRecords).map((record) => {
                      const era = ERAS[record.levelIndex];
                      return (
                        <div key={record.levelIndex} className="grid grid-cols-1 md:grid-cols-[280px_1fr] border border-white/10 rounded-3xl overflow-hidden bg-zinc-900/20 backdrop-blur-md shadow-xl">
                          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                            <img 
                              src={era.imageUrl} 
                              alt={era.name} 
                              className="w-full h-full object-cover"
                              style={{ filter: getFilterString(record.savedFilters) }}
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-orange-500/30 px-2.5 py-1 rounded-xl text-xs font-black italic flex items-center gap-1.5 shadow-md">
                              <span className="text-white/40 not-italic text-[10px] font-mono">RANK</span>
                              <span className={record.ratingColor}>{record.rating}</span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                              <span className="text-[10px] font-mono text-zinc-400 block tracking-wider">修復精度分數</span>
                              <span className="text-lg font-black text-white">{record.highestScore}%</span>
                            </div>
                          </div>

                          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                            <div>
                              <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-2">
                                <span>階段 0{record.levelIndex + 1}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {era.year}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {era.location}</span>
                              </div>
                              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{era.name}</h3>
                              <p className="text-zinc-400 text-sm leading-relaxed font-serif italic border-l-2 border-cyan-500/30 pl-4">
                                "{era.insight}"
                              </p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center justify-between">
                              <div className="text-[10px] font-mono text-zinc-500">
                                氛圍特徵碼：T({record.savedFilters.temp}) S({record.savedFilters.saturate}%) G({record.savedFilters.grayscale}%)
                              </div>
                              <button 
                                onClick={() => handleStartLevel(record.levelIndex)}
                                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-white transition-colors uppercase tracking-widest"
                              >
                                再次接入本節點修復 <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 遊戲操作主畫面 */}
          {gameState.stage === 'level' && (
            <motion.div key="level" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col lg:flex-row h-full overflow-hidden relative">
              <AnimatePresence>
                {showIntro && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-xl w-full text-center">
                      <div className="text-[10px] uppercase tracking-[0.4em] text-orange-400 mb-6 font-bold">已成功接入歷史節點</div>
                      <h2 className="text-4xl md:text-5xl font-light mb-4 text-white font-serif italic">{currentEra.name}</h2>
                      <div className="flex items-center justify-center gap-6 text-white/30 text-[10px] uppercase tracking-widest mb-8">
                        <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {currentEra.location}</span>
                        <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {currentEra.year}</span>
                      </div>
                      <p className="text-white/60 leading-relaxed mb-10 text-base">{currentEra.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left p-6 bg-white/[0.04] rounded-sm border border-white/10 mb-10">
                        {currentEra.clues.map((clue, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-1 h-1 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                            <span className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">{clue}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setShowIntro(false)} className="px-12 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-orange-500 transition-all">
                        開始修復
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isHintOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-lg w-full bg-[#0f172a]/90 border border-[#e2c38b]/20 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl backdrop-blur-2xl">
                      <button onClick={() => setIsHintOpen(false)} className="absolute top-6 right-6 text-white/30 hover:text-[#e2c38b]"><RotateCcw className="w-5 h-5 rotate-45" /></button>
                      <div className="text-[10px] uppercase tracking-[0.35em] text-[#e2c38b]/70 mb-6 font-bold flex items-center gap-2"><History className="w-3 h-3" /> 歷史情報簡報</div>
                      <h2 className="text-3xl font-black mb-3 text-white tracking-tight">{currentEra.name}</h2>
                      <div className="flex items-center gap-6 text-white/30 text-[10px] uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                        <span className="flex items-center gap-2"><MapPin className="w-3 h-3" />{currentEra.location}</span>
                        <span className="flex items-center gap-2"><Clock className="w-3 h-3" />{currentEra.year}</span>
                      </div>
                      <div className="space-y-7">
                        <section>
                          <label className="text-[9px] uppercase tracking-[0.25em] text-[#e2c38b]/70 mb-3 block font-bold">歷史背景</label>
                          <p className="text-white/70 leading-relaxed text-sm">{currentEra.description}</p>
                        </section>
                        <section>
                          <label className="text-[9px] uppercase tracking-[0.25em] text-[#e2c38b]/70 mb-4 block font-bold">時代線索</label>
                          <div className="space-y-3">
                            {currentEra.clues.map((clue, i) => (
                              <div key={i} className="flex gap-3 items-start border-l border-[#e2c38b]/20 pl-4 py-1">
                                <span className="text-sm text-cyan-100/80 leading-relaxed">「{clue}」</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                      <button onClick={() => setIsHintOpen(false)} className="w-full mt-10 py-4 rounded-2xl bg-[#e2c38b]/10 border border-[#e2c38b]/20 text-cyan-100 font-bold tracking-[0.25em] text-[10px]">
                        關閉簡報
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4">
                <button 
                  disabled={gameState.hintsUsed >= 2}
                  onClick={() => {
                    if (gameState.hintsUsed < 2) {
                      setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
                      setIsHintOpen(true);
                    }
                  }}
                  className="relative group w-14 h-14 flex items-center justify-center rounded-sm bg-black/40 border border-white/10 text-amber-300"
                >
                  <Lightbulb className="w-7 h-7 fill-current" />
                </button>
              </div>

              <div className="flex-1 bg-[#0a0a0c] relative flex items-center justify-center p-4 overflow-hidden">
                <div className="relative w-full h-full max-w-3xl lg:max-h-[600px] border border-white/10 rounded-sm overflow-hidden bg-zinc-950 flex items-center justify-center">
                  <div className="w-full h-full" style={{ filter: getFilterString(gameState.playerFilters), transition: 'filter 0.5s ease-out' }}>
                    <img src={currentEra.imageUrl} alt={currentEra.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>

              <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col shrink-0">
                <div className="flex-1 overflow-y-auto pr-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-8 block">氛圍精密校準</label>
                  <div className="space-y-8 mb-6">
                    <ImmersiveSlider label="色溫" value={gameState.playerFilters.temp} onChange={(v) => handleFilterChange('temp', v)} min={-100} max={100} displayValue={`${gameState.playerFilters.temp > 0 ? '+' : ''}${gameState.playerFilters.temp.toFixed(1)}k`} trackGradient="from-blue-500 via-white to-orange-500" />
                    <ImmersiveSlider label="飽和度" value={gameState.playerFilters.saturate} onChange={(v) => handleFilterChange('saturate', v)} min={0} max={200} displayValue={`${gameState.playerFilters.saturate.toFixed(1)}%`} />
                    <ImmersiveSlider label="顆粒感" value={gameState.playerFilters.grayscale} onChange={(v) => handleFilterChange('grayscale', v)} min={0} max={100} displayValue={gameState.playerFilters.grayscale > 50 ? '高' : '低'} />
                    <ImmersiveSlider label="對比度" value={gameState.playerFilters.contrast} onChange={(v) => handleFilterChange('contrast', v)} min={50} max={150} displayValue={`${gameState.playerFilters.contrast.toFixed(1)}%`} />
                    <ImmersiveSlider label="曝光度" value={gameState.playerFilters.brightness} onChange={(v) => handleFilterChange('brightness', v)} min={50} max={150} displayValue={`${gameState.playerFilters.brightness.toFixed(1)}%`} />
                  </div>
                </div>
                <div className="mt-auto pt-4 space-y-3">
                  <button onClick={handleRestore} className="w-full py-4.5 bg-orange-600 text-white font-bold tracking-[0.25em] text-xs">還原時代真相</button>
                  <button onClick={() => setGameState(prev => ({ ...prev, playerFilters: currentEra.initial }))} className="w-full py-3 text-white/30 font-bold tracking-[0.2em] text-[9px]">重設校準數值</button>
                </div>
              </aside>
            </motion.div>
          )}

          {/* 修復結果報告畫面 */}
          {gameState.stage === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full flex flex-col items-center p-4 md:p-8 bg-black overflow-y-auto">
              <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start py-8">
                <div className="space-y-10">
                  <section className="text-center lg:text-left">
                    <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8 block font-bold">修復精準度比對結果</div>
                    <div className="flex flex-col sm:flex-row items-center gap-10">
                      <div className="text-8xl md:text-9xl font-black italic text-orange-600 tracking-tighter">{gameState.score}%</div>
                      <div className="sm:border-l border-white/10 sm:pl-10">
                        <span className="text-[10px] uppercase tracking-widest text-white/20 block mb-1">歷史評級</span>
                        <span className={`text-6xl md:text-8xl font-black italic ${get評級(gameState.score || 0).color}`}>{get評級(gameState.score || 0).label}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#e2c38b]/10 border border-[#e2c38b]/20">
                      <Coins className="w-5 h-5 text-[#e2c38b]" />
                      <span className="text-cyan-100 font-bold text-lg">+{gameState.earnedCoins}</span>
                      <span className="text-[#e2c38b]/70 tracking-[0.2em] text-xs">時光碎片已成功收集</span>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: '暖色氛圍', value: gameState.breakdown?.warmth },
                      { label: '色彩還原', value: gameState.breakdown?.color },
                      { label: '畫面質感', value: gameState.breakdown?.texture },
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-white/[0.03] border border-white/5 rounded-sm">
                        <div className="text-[8px] uppercase tracking-widest text-white/40 mb-2 font-bold">{item.label}</div>
                        <div className="text-xl font-mono text-white">{item.value}%</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-4">時光觀測員評語</h4>
                    <p className="text-white/60 leading-relaxed italic font-serif">"{currentEra.insight}"</p>
                  </div>

                  <button onClick={handleNext} className="group flex items-center justify-center gap-6 py-5 px-12 bg-white text-black uppercase tracking-[0.3em] font-bold text-xs hover:bg-orange-400 transition-all">
                    {gameState.currentLevelIndex + 1 < ERAS.length ? '前往下一歷史檔案' : '返回視覺檔案庫選單'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/80 border border-white/10 rounded text-[10px] uppercase tracking-widest font-bold text-white/60">您的修復成果</div>
                    <div className="rounded-sm overflow-hidden aspect-[4/3] border border-white/20"><img src={currentEra.imageUrl} alt="成果" className="w-full h-full object-cover" style={{ filter: getFilterString(gameState.playerFilters) }} referrerPolicy="no-referrer" /></div>
                  </div>
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-orange-600 text-white rounded text-[10px] uppercase tracking-widest font-bold">歷史真實色彩 (100%)</div>
                    <div className="rounded-sm overflow-hidden aspect-[4/3] border border-orange-500/40"><img src={currentEra.imageUrl} alt="目標" className="w-full h-full object-cover" style={{ filter: getFilterString(currentEra.target) }} referrerPolicy="no-referrer" /></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-10 border-t border-white/5 px-8 flex items-center justify-between bg-black/60 text-[9px] uppercase tracking-[0.3em] text-white/20">
        <span>修復引擎: v2.4.0-穩定版</span>
        <span>© 2026 視覺文化檔案庫</span>
      </footer>
    </div>
  );
}

function ImmersiveSlider({ label, value, onChange, min, max, displayValue, trackGradient }: { 
  label: string, value: number, onChange: (v: number) => void, min: number, max: number, displayValue?: string, trackGradient?: string
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-4 group">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold tracking-[0.25em] text-white/40">{label}</label>
        <span className="text-[10px] font-mono text-[#e2c38b] font-bold">{displayValue || `${Math.round(percentage)}%`}</span>
      </div>
      <div className="relative flex items-center h-4">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${trackGradient || 'from-cyan-400 to-indigo-500'}`} style={{ width: `${percentage}%` }} />
        </div>
        <input type="range" min={min} max={max} step={0.5} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" />
        <div className="absolute top-1/2 h-3 w-[2px] bg-cyan-200 pointer-events-none" style={{ left: `${percentage}%`, boxShadow: '0 0 12px rgba(34,211,238,0.8)', transform: 'translate(-50%, -50%)' }} />
      </div>
    </div>
  );
}