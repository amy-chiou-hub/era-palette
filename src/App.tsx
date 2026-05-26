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
  
  // 用於控制「確認解鎖（碎片足夠）」彈出視窗
  const [confirmUnlockTarget, setConfirmUnlockTarget] = useState<{ index: number; name: string; required: number } | null>(null);
  
  // 新增：用於控制「碎片不足（調閱權限不足）」中央小視窗的狀態
  const [shortageTarget, setShortageTarget] = useState<{ name: string; required: number; missing: number } | null>(null);
  
  // 新增：用於控制「解鎖成功」精美提示視窗
  const [successTarget, setSuccessTarget] = useState<{ name: string; consumed: number } | null>(null);

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

  // 點擊大廳關卡卡片
  const handleLevelCardClick = (index: number) => {
    const required = getRequiredFragments(index);
    const isAlreadyUnlocked = unlockedLevels.includes(index);

    if (isAlreadyUnlocked) {
      enterLevel(index);
      return;
    }

    // 碎片不足：調出中央警告小視窗，不放在上面
    if (gameState.coins < required) {
      setShortageTarget({
        name: ERAS[index].name,
        required,
        missing: required - gameState.coins
      });
      return;
    }

    // 碎片足夠：調出確認小視窗
    setConfirmUnlockTarget({ index, name: ERAS[index].name, required });
  };

  // 玩家按下「確認扣除並開啟」
  const handleConfirmUnlock = () => {
    if (!confirmUnlockTarget) return;
    const { index, required, name } = confirmUnlockTarget;

    setGameState(prev => ({ ...prev, coins: prev.coins - required }));
    setUnlockedLevels(prev => [...prev, index]);
    setConfirmUnlockTarget(null);

    // 彈出解鎖成功小視窗
    setSuccessTarget({ name, consumed: required });
  };

  const enterLevel = (index: number) => {
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

  // 🌟 核心修改：過關畫面點擊「前往下一歷史檔案」時，全面進行「確認扣除」與「權限不足」視窗攔截！
  const handleNext = () => {
    const nextIndex = gameState.currentLevelIndex + 1;
    if (nextIndex < ERAS.length) {
      const required = getRequiredFragments(nextIndex);
      const isAlreadyUnlocked = unlockedLevels.includes(nextIndex);
      
      if (isAlreadyUnlocked) {
        enterLevel(nextIndex);
      } else if (gameState.coins >= required) {
        // 碎片足夠：直接跳出「調閱權限二次確認」視窗，明確告知扣除多少碎片！
        setConfirmUnlockTarget({
          index: nextIndex,
          name: ERAS[nextIndex].name,
          required
        });
      } else {
        // 碎片不足：直接跳出中央「調閱權限不足」小視窗，告知缺多少，不硬闖
        setShortageTarget({
          name: ERAS[nextIndex].name,
          required,
          missing: required - gameState.coins
        });
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
      hue-rotate(${f.temp * 0.25}deg)
    `.trim();
  };

  return (
    <div className="h-screen text-[#f3efe8] font-sans selection:bg-amber-200/20 overflow-hidden flex flex-col antialiased relative bg-[#060608]">      
      
      {/* 頂部導覽列 */}
      {gameState.stage !== 'welcome' && gameState.stage !== 'gallery' && (
        <header className="h-16 shrink-0 border-b border-white/10 px-4 md:px-8 flex items-center justify-between bg-[#111114]/70 backdrop-blur-2xl z-50 shadow-[0_0_40px_rgba(0,180,255,0.08)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGameState(prev => ({ ...prev, stage: 'welcome' }))}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-xl bg-white/[0.02] text-xs font-bold tracking-widest text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95 animate-none"
            >
              <Home className="w-3.5 h-3.5" />
              <span>返回主頁</span>
            </button>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
          
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setGameState(prev => ({ ...prev, stage: 'gallery' }))}
              className="flex items-center gap-2 px-3.5 py-2 border border-cyan-500/20 rounded-2xl bg-cyan-500/5 text-xs font-bold tracking-widest text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.05)] active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">時光觀測圖鑑</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#e2c38b]/10 border border-[#e2c38b]/20 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
              <Coins className="w-4 h-4 text-[#e2c38b]" />
              <span className="text-sm font-bold text-cyan-100 tracking-wide">{gameState.coins}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#e2c38b]/60">碎片</span>
            </div>

            {gameState.stage !== 'menu' && (
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
      )}

      {/* 背景環境微光 */}
      <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-[#5d5470]/15 blur-[160px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute left-0 bottom-0 h-[600px] w-[600px] rounded-full bg-[#3f4f63]/15 blur-[160px] pointer-events-none animate-pulse duration-[10s]" />

      {/* ================= 核心中央彈出式小視窗系統群組 ================= */}
      <AnimatePresence>
        {/* 1. 璀璨星空、磨砂玻璃質感的「調閱權限不足」中央小視窗 */}
        {shortageTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="max-w-md w-full bg-zinc-950 border border-red-500/20 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto animate-pulse">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-wide text-red-400">時光調閱權限不足</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  申請調閱「{shortageTarget.name}」核心檔案夾失敗。<br />
                  本歷史檔案節點需要消耗 <span className="text-white font-bold font-mono">{shortageTarget.required}</span> 個時光碎片。
                </p>
              </div>
              <div className="py-2.5 px-4 rounded-xl bg-red-950/20 border border-red-500/10 text-xs font-mono text-red-300 w-fit mx-auto flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>目前系統核心缺少：{shortageTarget.missing} 個時光碎片</span>
              </div>
              <button onClick={() => setShortageTarget(null)} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                確認並返回主機
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 2. 歷史權限「二次扣除確認」中央小視窗（檔案庫點擊、下一關點擊共用） */}
        {confirmUnlockTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="max-w-md w-full bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
              <div className="flex items-center gap-3 text-cyan-400 border-b border-white/5 pb-3">
                <Coins className="w-6 h-6 animate-pulse" />
                <h3 className="text-lg font-black tracking-wide">調閱權限二次確認</h3>
              </div>
              <div className="space-y-2 text-zinc-300 text-sm leading-relaxed">
                <p>您即將申請解鎖歷史時空節點：<strong className="text-white text-base">「{confirmUnlockTarget.name}」</strong></p>
                <p className="text-zinc-400">開啟此高度機密檔案需要自您的系統終端中扣除：</p>
                <div className="flex items-center gap-2 py-2 px-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 w-fit mt-1">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-200 font-mono font-bold text-base">-{confirmUnlockTarget.required} 碎片</span>
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono pt-2">
                目前可用餘額: {gameState.coins} 碎片 (扣除後剩餘: {gameState.coins - confirmUnlockTarget.required})
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setConfirmUnlockTarget(null)} className="flex-1 py-3 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">取消</button>
                <button onClick={handleConfirmUnlock} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-black tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer">確認扣除並開啟</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. 「解鎖成功」中央精美提示小視窗 */}
        {successTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="max-w-md w-full bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-wide text-emerald-400">時光節點接入成功</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  已扣除 <span className="text-white font-mono font-bold">{successTarget.consumed}</span> 個碎片。<br />
                  「{successTarget.name}」的視覺修復觀測主機通道已為您永久建檔！
                </p>
              </div>
              <button 
                onClick={() => {
                  const targetIndex = confirmUnlockTarget ? confirmUnlockTarget.index : gameState.currentLevelIndex;
                  setSuccessTarget(null);
                  enterLevel(targetIndex);
                }} 
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-xs tracking-widest cursor-pointer shadow-lg"
              >
                立刻接入主機
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 relative flex overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* Welcome 歡迎啟動畫面 */}
          {gameState.stage === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_rgba(20,20,25,0.4),_rgba(6,6,8,1))] relative overflow-hidden"
            >
              {/* 璀璨星空微粒 */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {[
                  { w: 3, h: 3, top: '15%', left: '10%', d: 6, delay: 0 },
                  { w: 2, h: 2, top: '25%', left: '80%', d: 8, delay: 1 },
                  { w: 4, h: 4, top: '70%', left: '15%', d: 7, delay: 3 },
                  { w: 3, h: 3, top: '80%', left: '75%', d: 9, delay: 0.5 },
                  { w: 5, h: 5, top: '10%', left: '60%', d: 11, delay: 4 },
                  { w: 2, h: 2, top: '85%', left: '40%', d: 10, delay: 2.5 },
                ].map((star, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute bg-white rounded-full mix-blend-screen"
                    style={{
                      width: star.w,
                      height: star.h,
                      top: star.top,
                      left: star.left,
                      boxShadow: '0 0 8px rgba(255, 255, 255, 0.8), 0 0 15px rgba(226, 195, 139, 0.4)'
                    }}
                    animate={{ y: [0, -40, 0], x: [0, 15, 0], opacity: [0.1, 0.9, 0.3, 0.9, 0.1], scale: [1, 1.3, 0.8, 1.2, 1] }}
                    transition={{ duration: star.d, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl w-full text-center space-y-16 z-10 py-8 relative"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 bg-gradient-to-r from-amber-500/10 to-purple-500/10 blur-[60px] pointer-events-none rounded-full" />
                <div className="space-y-6 relative">
                  <h1 className="text-7xl sm:text-8xl md:text-[7.5rem] font-black tracking-[0.12em] text-white uppercase leading-none pl-[0.12em]">
                    時代<span className="bg-gradient-to-r from-[#e2c38b] via-[#d4bfff] to-[#8fa7c7] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(226,195,139,0.25)]">光譜</span>
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-zinc-400/80 text-xs md:text-sm tracking-[0.35em] uppercase font-light pt-2 pl-[0.35em]">
                    <Terminal className="w-3.5 h-3.5 text-amber-200/50 animate-pulse shrink-0" />
                    <span>歷史影像與色彩氛圍修復系統</span>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-5 justify-center items-center max-w-2xl mx-auto w-full px-6">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'menu' }))}
                    className="w-full sm:w-60 group relative inline-flex items-center justify-center gap-3 px-8 py-4.5 bg-gradient-to-r from-[#e5ca9e] via-[#c09ee5] to-[#899db8] text-black font-black uppercase tracking-[0.25em] text-xs rounded-xl shadow-[0_10px_35px_rgba(192,158,229,0.2)] hover:shadow-[0_15px_45px_rgba(229,202,158,0.35)] transition-all duration-300 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black transition-transform group-hover:translate-x-0.5" />
                    進入視覺資料庫
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'gallery' }))}
                    className="w-full sm:w-60 inline-flex items-center justify-center gap-2.5 px-8 py-4.5 border border-white/10 rounded-xl bg-white/[0.02] backdrop-blur-md text-xs font-bold tracking-[0.2em] text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer shadow-lg"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    調閱時光觀測圖鑑
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 視覺資料館 (關卡選單畫面) */}
          {gameState.stage === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full flex flex-col items-center p-6 md:p-8 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(120,94,58,0.18),_transparent_45%)]"
            >
              <div className="max-w-6xl w-full py-8 md:py-12">
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
                        onClick={() => handleLevelCardClick(index)}
                      >
                        <img src={era.imageUrl} className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-50 ${(isUnlocked || !isLocked) ? 'group-hover:scale-110 group-hover:opacity-80' : 'grayscale opacity-20 filter blur-[2px]'}`} referrerPolicy="no-referrer" alt={era.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        
                        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center text-[10px] font-bold">
                          {hasRecord ? (
                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-orange-500/30">
                              <Award className="w-3 h-3 text-orange-400" />
                              <span className={hasRecord.ratingColor}>最高: {hasRecord.rating} ({hasRecord.highestScore}分)</span>
                            </div>
                          ) : <div />}

                          <div className={`backdrop-blur-md border px-2.5 py-1 rounded-xl shadow-md transition-colors ${isUnlocked ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400 font-mono'}`}>
                            {isUnlocked ? (
                              <span className="flex items-center gap-1">✓ 已接入</span>
                            ) : (
                              <span className={`flex items-center gap-1 ${isLocked ? 'text-zinc-500 border-zinc-700 bg-zinc-900/40' : ''}`}>
                                🔑 {requiredFragments} 碎片
                              </span>
                            )}
                          </div>
                        </div>

                        {!isUnlocked && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 space-y-2">
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isLocked ? 'text-zinc-500 border-white/5 bg-zinc-900/80' : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'}`}>
                              <Lock className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md border backdrop-blur-sm ${isLocked ? 'text-zinc-500 border-white/5 bg-zinc-900/60' : 'text-cyan-300 border-cyan-500/20 bg-cyan-950/50'}`}>
                              {isLocked ? '碎片不足' : '點擊申請解鎖'}
                            </span>
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
            <motion.div key="gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full h-full flex flex-col items-center p-6 md:p-8 overflow-y-auto bg-[#0a0a0d]">
              <div className="max-w-5xl w-full py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-6 mb-10 gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold block mb-1">CHRONICLE LOGS</span>
                    <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 justify-center sm:justify-start">
                      <BookOpen className="w-6 h-6 text-cyan-400" /> 時光觀測修復日誌
                    </h2>
                  </div>
                  <button onClick={() => setGameState(prev => ({ ...prev, stage: 'welcome' }))} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold tracking-widest text-zinc-300 hover:text-white hover:bg-white/10 transition-all active:scale-95">返回主頁面</button>
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
                            <div className="w-full h-full relative overflow-hidden">
                              <img src={era.imageUrl} alt={era.name} className="w-full h-full object-cover" style={{ filter: getFilterString(record.savedFilters) }} referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 pointer-events-none transition-all" style={{ boxShadow: `inset 0 0 ${record.savedFilters.grayscale * 1.2}px rgba(0, 0, 0, ${record.savedFilters.grayscale / 100})` }} />
                            </div>
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
                              <p className="text-zinc-400 text-sm leading-relaxed font-serif italic border-l-2 border-cyan-500/30 pl-4">"{era.insight}"</p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center justify-between">
                              <div className="text-[10px] font-mono text-zinc-500">氛圍特徵碼：T({record.savedFilters.temp}) S({record.savedFilters.saturate}%) V({record.savedFilters.grayscale}%)</div>
                              <button onClick={() => handleLevelCardClick(record.levelIndex)} className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-white transition-colors uppercase tracking-widest cursor-pointer">再次接入本節點修復 <ChevronRight className="w-3 h-3" /></button>
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
                      <button onClick={() => setShowIntro(false)} className="px-12 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-orange-500 transition-all cursor-pointer">開始修復</button>
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
                        <span className="flex items-center gap-2"><MapPin className="w-3 h-3"/>{currentEra.location}</span>
                        <span className="flex items-center gap-2"><Clock className="w-3 h-3"/>{currentEra.year}</span>
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
                      <button onClick={() => setIsHintOpen(false)} className="w-full mt-10 py-4 rounded-2xl bg-[#e2c38b]/10 border border-[#e2c38b]/20 text-cyan-100 font-bold tracking-[0.25em] text-[10px] cursor-pointer">關閉簡報</button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4">
                <button disabled={gameState.hintsUsed >= 2} onClick={() => { if (gameState.hintsUsed < 2) { setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 })); setIsHintOpen(true); } }} className="relative group w-14 h-14 flex items-center justify-center rounded-sm bg-black/40 border border-white/10 text-amber-300 cursor-pointer"><Lightbulb className="w-7 h-7 fill-current" /></button>
              </div>

              <div className="flex-1 bg-[#0a0a0c] relative flex items-center justify-center p-4 overflow-hidden">
                <div className="relative w-full h-full max-w-3xl lg:max-h-[600px] border border-white/10 rounded-sm overflow-hidden bg-zinc-950 flex items-center justify-center shadow-2xl">
                  <div className="w-full h-full relative overflow-hidden">
                    <div className="w-full h-full" style={{ filter: getFilterString(gameState.playerFilters), transition: 'filter 0.25s ease-out' }}><img src={currentEra.imageUrl} alt="觀測" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
                    <div className="absolute inset-0 pointer-events-none mix-blend-multiply transition-all duration-150" style={{ boxShadow: `inset 0 0 ${gameState.playerFilters.grayscale * 1.2}px rgba(0, 0, 0, ${gameState.playerFilters.grayscale / 100})` }} />
                  </div>
                </div>
              </div>

              <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col shrink-0">
                <div className="flex-1 overflow-y-auto pr-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-8 block">氛圍精密校準</label>
                  <div className="space-y-8 mb-6">
                    <ImmersiveSlider label="色溫偏移" value={gameState.playerFilters.temp} onChange={(v) => handleFilterChange('temp', v)} min={-100} max={100} displayValue={gameState.playerFilters.temp > 0 ? `暖偏琥珀 (+${gameState.playerFilters.temp.toFixed(0)})` : gameState.playerFilters.temp < 0 ? `冷藍霓虹 (${gameState.playerFilters.temp.toFixed(0)})` : '環境白平衡已校準'} trackGradient="from-blue-500 via-zinc-400 to-amber-500" />
                    <ImmersiveSlider label="飽和度" value={gameState.playerFilters.saturate} onChange={(v) => handleFilterChange('saturate', v)} min={0} max={200} displayValue={`${gameState.playerFilters.saturate.toFixed(0)}%`} />
                    <ImmersiveSlider label="時光暗角 (失光度)" value={gameState.playerFilters.grayscale} onChange={(v) => handleFilterChange('grayscale', v)} min={0} max={100} displayValue={gameState.playerFilters.grayscale === 0 ? '無 (現代數位邊角)' : gameState.playerFilters.grayscale > 70 ? '高 (濃烈復古底片感)' : '微量 (老相機暗角開關)'} trackGradient="from-zinc-950 via-zinc-700 to-zinc-100" />
                    <ImmersiveSlider label="對比度" value={gameState.playerFilters.contrast} onChange={(v) => handleFilterChange('contrast', v)} min={50} max={150} displayValue={`${gameState.playerFilters.contrast.toFixed(0)}%`} />
                    <ImmersiveSlider label="曝光度" value={gameState.playerFilters.brightness} onChange={(v) => handleFilterChange('brightness', v)} min={50} max={150} displayValue={`${gameState.playerFilters.brightness.toFixed(0)}%`} />
                  </div>
                </div>
                <div className="mt-auto pt-4 space-y-3">
                  <button onClick={handleRestore} className="w-full py-4.5 bg-orange-600 text-white font-bold tracking-[0.25em] text-xs cursor-pointer">還原時代真相</button>
                  <button onClick={() => setGameState(prev => ({ ...prev, playerFilters: currentEra.initial }))} className="w-full py-3 text-white/30 font-bold tracking-[0.2em] text-[9px] cursor-pointer">重設校準數值</button>
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

                  <button onClick={handleNext} className="group flex items-center justify-center gap-6 py-5 px-12 bg-white text-black uppercase tracking-[0.3em] font-bold text-xs hover:bg-orange-400 transition-all cursor-pointer">
                    {gameState.currentLevelIndex + 1 < ERAS.length ? '前往下一歷史檔案' : '返回視覺檔案庫選單'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/80 border border-white/10 rounded text-[10px] uppercase tracking-widest font-bold text-white/60">您的修復成果</div>
                    <div className="rounded-sm overflow-hidden aspect-[4/3] border border-white/20">
                      <div className="w-full h-full relative overflow-hidden">
                        <img src={currentEra.imageUrl} alt="成果" className="w-full h-full object-cover" style={{ filter: getFilterString(gameState.playerFilters) }} referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 pointer-events-none mix-blend-multiply" style={{ boxShadow: `inset 0 0 ${gameState.playerFilters.grayscale * 1.2}px rgba(0, 0, 0, ${gameState.playerFilters.grayscale / 100})` }} />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-orange-600 text-white rounded text-[10px] uppercase tracking-widest font-bold">歷史真實色彩 (100%)</div>
                    <div className="rounded-sm overflow-hidden aspect-[4/3] border border-orange-500/40">
                      <div className="w-full h-full relative overflow-hidden">
                        <img src={currentEra.imageUrl} alt="目標" className="w-full h-full object-cover" style={{ filter: getFilterString(currentEra.target) }} referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 pointer-events-none mix-blend-multiply" style={{ boxShadow: `inset 0 0 ${currentEra.target.grayscale * 1.2}px rgba(0, 0, 0, ${currentEra.target.grayscale / 100})` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
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