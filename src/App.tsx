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
  Award,
  ArrowLeft,
  Sliders,
  Eye,
  AlertCircle
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
  const [revealedHints, setRevealedHints] = useState(1);

  // 檢視真實背景的狀態與次數限制 (每關限 2 次)
  const [isPeekingTarget, setIsPeekingTarget] = useState(false);
  const [confirmHintUnlock, setConfirmHintUnlock] = useState(false);
  const [peekCount, setPeekCount] = useState<number>(0);
  const maxPeeks = 2;

  // 視窗控制狀態
  const [confirmUnlockTarget, setConfirmUnlockTarget] = useState<{ index: number; name: string; required: number } | null>(null);
  const [shortageTarget, setShortageTarget] = useState<{ name: string; required: number; missing: number } | null>(null);
  const [successTarget, setSuccessTarget] = useState<{ index: number; name: string; consumed: number } | null>(null);

  useEffect(() => {
    document.title = "時代影像館";
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

    const warmthScore = calc(player.temp, target.temp, 50);
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

  const handleLevelCardClick = (index: number) => {
    const required = getRequiredFragments(index);
    // 強制判定：只要 index <= 2，一律視為已解鎖
    const isAlreadyUnlocked = unlockedLevels.includes(index) || index <= 2;

    if (isAlreadyUnlocked) {
      enterLevel(index);
      return;
    }

    if (gameState.coins < required) {
      setShortageTarget({
        name: ERAS[index].name,
        required,
        missing: required - gameState.coins
      });
      return;
    }

    setConfirmUnlockTarget({ index, name: ERAS[index].name, required });
  };

  const handleConfirmUnlock = () => {
    if (!confirmUnlockTarget) return;
    const { index, required, name } = confirmUnlockTarget;

    setGameState(prev => ({ ...prev, coins: prev.coins - required }));
    setUnlockedLevels(prev => [...prev, index]);
    setConfirmUnlockTarget(null);
    setSuccessTarget({ index, name, consumed: required });
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
    setIsPeekingTarget(false);
    setPeekCount(0);
    setIsHintOpen(false);
    setRevealedHints(1);
  };

  const handleFilterChange = (key: keyof Filters, value: number) => {
    setGameState((prev) => ({
      ...prev,
      playerFilters: { ...prev.playerFilters, [key]: value },
    }));
  };

  const handleStartPeek = () => {
    if (peekCount >= maxPeeks) return;
    setIsPeekingTarget(true);
  };

  const handleEndPeek = () => {
    if (isPeekingTarget) {
      setIsPeekingTarget(false);
      setPeekCount(prev => prev + 1);
    }
  };

  const handleRestore = () => {
    const { total, breakdown } = calculateScoreBreakdown(gameState.playerFilters, currentEra.target);
    const earnedCoins = Math.floor(total / 10);
    const ratingInfo = get評級(total);

    setRepairRecords(prev => {
      const existingRecord = prev[gameState.currentLevelIndex];
      if (!existingRecord || total > existingRecord.highestScore) {
        return {
          ...prev,
          [gameState.currentLevelIndex]: {
            levelIndex: gameState.currentLevelIndex,
            highestScore: total,
            rating: ratingInfo.label,
            ratingColor: ratingInfo.color,
            savedFilters: gameState.playerFilters
          }
        };
      }
      return prev;
    });

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
      const isAlreadyUnlocked = unlockedLevels.includes(nextIndex) || nextIndex <= 2;

      if (isAlreadyUnlocked) {
        enterLevel(nextIndex);
      } else if (gameState.coins >= required) {
        setConfirmUnlockTarget({ index: nextIndex, name: ERAS[nextIndex].name, required });
      } else {
        setShortageTarget({ name: ERAS[nextIndex].name, required, missing: required - gameState.coins });
      }
    } else {
      setGameState((prev) => ({ ...prev, stage: 'menu' }));
    }
  };

  const getFilterString = (f: Filters) => {
    return `
      brightness(${f.brightness}%) 
      contrast(${f.contrast}%) 
      saturate(${f.saturate}%) 
      hue-rotate(${f.temp * 0.25}deg)
    `.trim();
  };

  return (
    <div className="min-h-screen text-[#f3efe8] font-sans selection:bg-amber-200/20 overflow-y-auto flex flex-col antialiased relative bg-[#040406]">

      {/* 頂部導覽列 */}
      {gameState.stage !== 'welcome' && (
        <header className="h-16 shrink-0 border-b border-white/10 px-4 md:px-8 flex items-center justify-between bg-[#111114]/70 backdrop-blur-2xl z-50 shadow-[0_0_40px_rgba(0,180,255,0.08)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGameState(prev => ({ ...prev, stage: 'welcome' }))}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-xl bg-white/[0.02] text-xs font-bold tracking-widest text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              <span>返回主頁</span>
            </button>
            <div className="w-px h-4 bg-white/10"></div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {gameState.stage !== 'gallery' && (
              <button
                onClick={() => setGameState(prev => ({ ...prev, stage: 'gallery' }))}
                className="flex items-center gap-2 px-3.5 py-2 border border-cyan-500/20 rounded-2xl bg-cyan-500/5 text-xs font-bold tracking-widest text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.05)] active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>時光觀測圖鑑</span>
              </button>
            )}

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#e2c38b]/10 border border-[#e2c38b]/20 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
              <Coins className="w-4 h-4 text-[#e2c38b]" />
              <span className="text-sm font-bold text-cyan-100 tracking-wide">{gameState.coins}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#e2c38b]/60">碎片</span>
            </div>

            {gameState.stage !== 'menu' && gameState.stage !== 'gallery' && (
              <button
                onClick={() => setGameState(prev => ({ ...prev, stage: 'menu' }))}
                className="px-3 py-1.5 border border-white/10 rounded-xl hover:bg-white/[0.04] text-[10px] tracking-widest text-zinc-400 hover:text-white transition-colors"
              >
                檔案庫
              </button>
            )}
          </div>
        </header>
      )}

      {/* 背景環境微光 */}
      <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-[#5d5470]/15 blur-[160px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute left-0 bottom-0 h-[600px] w-[600px] rounded-full bg-[#3f4f63]/15 blur-[160px] pointer-events-none animate-pulse duration-[10s]" />

      {/* 彈出式視窗群組 */}
      <AnimatePresence>
        {shortageTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="max-w-md w-full bg-zinc-950 border border-red-500/20 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4 animate-pulse">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-red-400 mb-2">時光調閱權限不足</h3>
              <p className="text-zinc-400 text-sm mb-4">開啟「{shortageTarget.name}」需要 {shortageTarget.required} 個時光碎片。</p>
              <div className="py-2 px-4 rounded-xl bg-red-950/20 border border-red-500/10 text-xs text-red-300 w-fit mx-auto mb-6 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>缺少：{shortageTarget.missing} 個碎片</span>
              </div>
              <button onClick={() => setShortageTarget(null)} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all">確認</button>
            </motion.div>
          </motion.div>
        )}

        {confirmUnlockTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="max-w-md w-full bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-black text-cyan-400 border-b border-white/5 pb-2">調閱權限確認</h3>
              <p className="text-zinc-300 text-sm">確定要解鎖歷史時空節點：<strong className="text-white">「{confirmUnlockTarget.name}」</strong>嗎？</p>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3 font-mono text-xs text-zinc-400">
                <div className="flex justify-between items-center">
                  <span>當前終端餘額:</span>
                  <span className="text-white font-bold">{gameState.coins} 碎片</span>
                </div>
                <div className="flex justify-between items-center text-red-400 font-bold border-t border-white/5 pt-2">
                  <span>解鎖需要扣除:</span>
                  <span>-{confirmUnlockTarget.required} 碎片</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-bold border-t border-dashed border-white/10 pt-2 text-sm">
                  <span>扣除後剩餘餘額:</span>
                  <span>{gameState.coins - confirmUnlockTarget.required} 碎片</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setConfirmUnlockTarget(null)} className="flex-1 py-3 border border-white/10 rounded-xl text-xs text-zinc-400 hover:text-white transition-all">取消</button>
                <button onClick={handleConfirmUnlock} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-black transition-all">確認解鎖</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {confirmHintUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
                fixed inset-0 z-50
                bg-black/70
                backdrop-blur-md
                flex items-center justify-center
                p-4
              "
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="
                  max-w-md w-full
                  bg-[#121216]
                  border border-white/10
                  rounded-2xl
                  p-6
                "
            >
              <h3 className="text-lg font-black text-cyan-400 mb-4">
                歷史資料解析確認
              </h3>

              <p className="text-zinc-300 text-sm mb-4">
                解析更多歷史資料需要消耗
                <span className="text-[#e2c38b] font-bold">
                  1 個時光碎片
                </span>
              </p>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3 text-xs">

                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    目前持有
                  </span>

                  <span className="text-white font-bold">
                    {gameState.coins} 碎片
                  </span>
                </div>

                <div className="flex justify-between text-red-400">
                  <span>解析消耗</span>
                  <span>-1 碎片</span>
                </div>

                <div className="flex justify-between text-emerald-400 font-bold border-t border-white/10 pt-2">
                  <span>剩餘</span>
                  <span>{gameState.coins - 1} 碎片</span>
                </div>

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => setConfirmHintUnlock(false)}
                  className="
                      flex-1
                      py-3
                      border border-white/10
                      rounded-xl
                      text-zinc-400
                    "
                >
                  取消
                </button>

                <button
                  onClick={() => {

                    if (gameState.coins > 0) {

                      setGameState(prev => ({
                        ...prev,
                        coins: prev.coins - 1
                      }));

                      setRevealedHints(prev => prev + 1);
                    }

                    setConfirmHintUnlock(false);

                    setTimeout(() => {
                      setIsHintOpen(true);
                    }, 100);
                  }}
                  className="
                      flex-1
                      py-3
                      rounded-xl
                      bg-gradient-to-r
                      from-cyan-500
                      to-blue-600
                      text-white
                      font-bold
                    "
                >
                  確認解析
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}

        {successTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="max-w-md w-full bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-emerald-400">時光節點接入成功</h3>
              <p className="text-zinc-400 text-sm">「{successTarget.name}」通道已建立！已消耗 {successTarget.consumed} 碎片。</p>
              <button
                onClick={() => {
                  const targetIndex = successTarget.index;
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

        {isHintOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
                      fixed inset-0 z-[100]
                      bg-black/70
                      backdrop-blur-md
                      flex
                      items-center
                      justify-center
                      p-4
                    "
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="
                              max-w-3xl
                              w-full
                              bg-[#111114]
                              border border-white/5
                              rounded-2xl
                              p-6
                            "
            >
              <div className="border-b border-cyan-500/20 pb-3 mb-4">
                <div className="space-y-2 mb-6">

                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>資料解析度</span>

                    <span>
                      {Math.round(
                        (revealedHints / currentEra.clues.length) * 100
                      )}%
                    </span>
                  </div>

                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-[#e2c38b]"
                      style={{
                        width: `${(revealedHints / currentEra.clues.length) * 100
                          }%`
                      }}
                    />

                  </div>

                </div>
                <h3 className="text-3xl font-black text-white">
                  歷史分析報告
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {currentEra.clues
                  .slice(0, revealedHints)
                  .map((clue, index) => (

                    <div
                      key={index}
                      className="
                                    p-4
                                    rounded-xl
                                    bg-black/40
                                    border
                                    border-white/5
                                  "
                    >

                      <div className="text-[#e2c38b] text-xs font-bold mb-2">
                        提示 {index + 1}
                      </div>

                      <p className="text-zinc-300 text-sm leading-relaxed">
                        {clue}
                      </p>

                    </div>


                  ))}

              </div>
              {revealedHints < currentEra.clues.length && (

                <button
                  onClick={() => {
                    setIsHintOpen(false);
                      if (gameState.coins < 1) {

                        setShortageTarget({
                          name: "更多歷史資料解析",
                          required: 1,
                          missing: 1 - gameState.coins
                        });

                        return;
                      }
                    setConfirmHintUnlock(true);
                  }}
                  className="
                                    mt-6
                                    w-full
                                    py-3
                                    border
                                    border-cyan-500/20
                                    rounded-xl
                                    bg-cyan-500/5
                                    text-cyan-300
                                    font-bold
                                    tracking-wider
                                    hover:bg-cyan-500/10
                                    transition-all
                                  "
                >
                  解析更多資料(-1碎片)
                </button>

              )}

              <div className="flex justify-end mt-6">

                <button
                  onClick={() => setIsHintOpen(false)}
                  className="
                                    px-6
                                    py-2.5
                                    border
                                    border-white/10
                                    rounded-xl
                                    bg-white/[0.02]
                                    text-zinc-400
                                    hover:text-white
                                    hover:bg-white/[0.05]
                                    transition-all
                                  "
                >
                  返回分析介面
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主畫面框架區 */}
      <main className="flex-1 relative flex overflow-hidden">
        <AnimatePresence mode="wait">

          {/* Welcome 歡迎首頁 */}
          {gameState.stage === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="
                        w-full
                        min-h-screen
                        flex
                        flex-col
                        items-center
                        justify-center
                        p-6 bg-[radial-gradient(circle_at_center,_rgba(14,14,22,0.7),_rgba(4,4,5,1))] relative overflow-hidden"
            >
              {/* 時空穿梭漂浮粒子 */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                {[
                  { w: 18, h: 18, x: "12%", y: ["115vh", "-15vh"], duration: 5, delay: 0, opacity: 0.55, blur: "blur-[3px]", color: "from-cyan-400 to-blue-500" },
                  { w: 24, h: 24, x: "82%", y: ["115vh", "-15vh"], duration: 7, delay: 1.5, opacity: 0.45, blur: "blur-[4px]", color: "from-purple-500 to-indigo-600" },
                  { w: 16, h: 16, x: "40%", y: ["115vh", "-15vh"], duration: 6, delay: 3.5, opacity: 0.5, blur: "blur-[2px]", color: "from-amber-300 to-orange-500" },
                  { w: 10, h: 10, x: "28%", y: ["115vh", "-15vh"], duration: 11, delay: 1, opacity: 0.6, blur: "blur-[1px]", color: "from-cyan-300 to-purple-400" },
                  { w: 12, h: 12, x: "68%", y: ["115vh", "-15vh"], duration: 13, delay: 4, opacity: 0.65, blur: "blur-[1px]", color: "from-amber-200 to-rose-400" },
                  { w: 8, h: 8, x: "92%", y: ["115vh", "-15vh"], duration: 9, delay: 2, opacity: 0.7, color: "from-teal-300 to-blue-500" },
                  { w: 5, h: 5, x: "5%", y: ["115vh", "-15vh"], duration: 18, delay: 0.5, opacity: 0.8, color: "from-white to-cyan-200" },
                  { w: 4, h: 4, x: "22%", y: ["115vh", "-15vh"], duration: 22, delay: 5, opacity: 0.75, color: "from-purple-200 to-indigo-400" },
                  { w: 6, h: 6, x: "52%", y: ["115vh", "-15vh"], duration: 15, delay: 2.5, opacity: 0.85, color: "from-amber-100 to-yellow-300" },
                  { w: 5, h: 5, x: "60%", y: ["115vh", "-15vh"], duration: 20, delay: 7, opacity: 0.7, color: "from-white to-rose-200" },
                  { w: 4, h: 4, x: "78%", y: ["115vh", "-15vh"], duration: 17, delay: 1.2, opacity: 0.8, color: "from-cyan-200 to-indigo-300" },
                  { w: 6, h: 6, x: "95%", y: ["115vh", "-15vh"], duration: 24, delay: 3, opacity: 0.75, color: "from-fuchsia-300 to-purple-500" }
                ].map((p, idx) => (
                  <motion.div
                    key={idx}
                    className={`absolute bg-gradient-to-br ${p.color} rounded-full mix-blend-screen ${p.blur || ''}`}
                    style={{
                      width: p.w,
                      height: p.h,
                      left: p.x,
                      opacity: p.opacity,
                      boxShadow: `0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(34,211,238,0.3)`
                    }}
                    animate={{
                      y: p.y,
                      x: [p.x, `calc(${p.x} + ${idx % 2 === 0 ? '60px' : '-60px'})`, p.x],
                      scale: [1, 1.2, 0.9, 1.1, 1]
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                ))}
              </div>

              <div className="max-w-4xl w-full text-center space-y-12 z-10 py-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[180px] bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-purple-500/15 blur-[90px] pointer-events-none rounded-full animate-pulse duration-[6s]" />

                <div className="space-y-4">
                  <h1 className="text-7xl sm:text-8xl md:text-[7.5rem] font-black tracking-[0.12em] text-white uppercase leading-none pl-[0.12em]">
                    時代<span className="bg-gradient-to-r from-[#e2c38b] via-[#d4bfff] to-[#8fa7c7] bg-clip-text text-transparent">影像館</span>
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-zinc-400/80 text-xs md:text-sm tracking-[0.35em] uppercase font-light pt-2">
                    <Terminal className="w-3.5 h-3.5 text-amber-200/50 animate-pulse" />
                    <span>歷史影像與色彩氛圍修復系統</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto w-full">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'menu' }))}
                    className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#e5ca9e] via-[#c09ee5] to-[#899db8] text-black font-black tracking-[0.25em] text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    進入時代檔案庫
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'gallery' }))}
                    className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 border border-cyan-500/40 bg-cyan-500/5 text-cyan-300 font-bold tracking-[0.2em] text-xs rounded-xl shadow-md cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    時光觀測圖鑑
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 關卡選單（時代檔案庫） */}
          {gameState.stage === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full flex flex-col items-center p-6 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(120,94,58,0.18),_transparent_45%)]"
            >
              <div className="max-w-6xl w-full py-8">
                <div className="text-center mb-12">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-orange-400 mb-2 font-bold">歷史視覺檔案總庫</div>
                  <h1 className="text-5xl md:text-7xl font-black text-white">時代檔案庫</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                  {ERAS.map((era, index) => {
                    const requiredFragments = getRequiredFragments(index);
                    // 🔥 修正核心 1：強制前 3 關（免費關）永遠為解鎖狀態
                    const isUnlocked = unlockedLevels.includes(index) || index <= 2;
                    const isLocked = !isUnlocked && gameState.coins < requiredFragments;
                    const hasRecord = repairRecords[index];

                    return (
                      <motion.div
                        key={era.id}
                        whileHover={(!isLocked || isUnlocked) ? { y: -8 } : {}}
                        // 🔥 修正核心 2：只要是解鎖或免費關卡，強制套用 cursor-pointer 確保滑鼠手指游標出現
                        className={`group relative aspect-[3/4] overflow-hidden border rounded-3xl backdrop-blur-xl transition-all duration-500 shadow-xl
                          ${isUnlocked ? 'border-white/10 bg-white/[0.04] cursor-pointer' : isLocked ? 'border-white/5 bg-black/40 cursor-not-allowed opacity-60' : 'border-white/10 bg-white/[0.02] cursor-pointer'}`}
                        onClick={() => handleLevelCardClick(index)}
                      >
                        <img src={era.imageUrl} className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-40 ${(isUnlocked || !isLocked) ? 'group-hover:scale-105 group-hover:opacity-70' : 'grayscale opacity-10 filter blur-[2px]'}`} referrerPolicy="no-referrer" alt={era.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center text-[10px] font-bold">
                          {hasRecord ? (
                            <div className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded border border-orange-500/30">
                              <Award className="w-3 h-3 text-orange-400" />
                              <span className={hasRecord.ratingColor}>{hasRecord.rating} ({hasRecord.highestScore}分)</span>
                            </div>
                          ) : <div />}

                          <div className={`backdrop-blur-md border px-2.5 py-1 rounded-xl ${isUnlocked ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400'}`}>
                            {isUnlocked ? '✓ 已接入' : `🔑 ${requiredFragments} 碎片`}
                          </div>
                        </div>

                        {!isUnlocked && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 space-y-2">
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${isLocked ? 'text-zinc-500 border-white/5 bg-zinc-900/80' : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/80 animate-pulse'}`}>
                              <Lock className="w-4 h-4" />
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 p-6 w-full z-10">
                          <div className="text-[9px] text-orange-400 font-bold mb-1">節點 0{index + 1}</div>
                          <h3 className="text-xl font-light text-white mb-1">{era.name}</h3>
                          <div className="text-[9px] text-white/40">{era.location} · {era.year}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 時光觀測站（圖鑑畫面） */}
          {gameState.stage === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full flex flex-col items-center p-6 overflow-y-auto bg-[#0a0a0d]"
            >
              <div className="max-w-5xl w-full py-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-wide text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-cyan-400" /> 時光觀測圖鑑
                    </h1>
                    <p className="text-xs text-zinc-400">檢視已解鎖關卡的完美快照與歷史評級，並可選定關卡再次進行精密修復</p>
                  </div>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'menu' }))}
                    className="flex items-center gap-1.5 px-4 py-2 border border-white/10 rounded-xl text-xs bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>返回檔案庫</span>
                  </button>
                </div>

                {Object.keys(repairRecords).length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                    <Aperture className="w-12 h-12 text-zinc-600 mx-auto mb-4 animate-spin duration-[10s]" />
                    <p className="text-zinc-400 text-sm">目前圖鑑內尚無修復成功的時空數據紀錄。</p>
                    <p className="text-zinc-600 text-xs mt-1">請先前往歷史檔案庫進行「還原時代真相」。</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.values(repairRecords).map((record) => {
                      const era = ERAS[record.levelIndex];
                      return (
                        <div key={record.levelIndex} className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-950/40 backdrop-blur-md flex flex-col sm:flex-row h-fit sm:h-48 shadow-lg group">
                          <div className="w-full sm:w-40 h-40 sm:h-full shrink-0 relative overflow-hidden">
                            <img src={era.imageUrl} alt={era.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: getFilterString(record.savedFilters) }} referrerPolicy="no-referrer" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 rounded text-[9px] uppercase tracking-wider font-mono text-cyan-400 border border-cyan-500/20">已建檔</div>
                          </div>
                          <div className="p-5 flex flex-col justify-between flex-1">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg text-white tracking-tight">{era.name}</h3>
                                <span className={`text-2xl font-black italic ${record.ratingColor}`}>{record.rating}</span>
                              </div>
                              <p className="text-[11px] text-zinc-500 mb-3">{era.location} · {era.year}</p>
                              <div className="grid grid-cols-3 gap-1.5 text-[9px] text-zinc-400 font-mono bg-black/30 p-2 rounded border border-white/5">
                                <div>色溫: {record.savedFilters.temp > 0 ? `+${record.savedFilters.temp}` : record.savedFilters.temp}</div>
                                <div>飽和: {record.savedFilters.saturate}%</div>
                                <div>對比: {record.savedFilters.contrast}%</div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                              <span className="text-[10px] text-zinc-500 font-mono">最高分: {record.highestScore}%</span>
                              <button
                                onClick={() => enterLevel(record.levelIndex)}
                                className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold hover:text-white transition-colors cursor-pointer"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>再次接入此節點調校</span>
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
            <motion.div key="level" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col lg:flex-row min-h-full relative">

              {/* 前導簡報彈窗 */}
              <AnimatePresence>
                {showIntro && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.92, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: -10 }}
                      className="max-w-4xl
                                  w-full
                                  max-h-[85vh]
                                  overflow-y-auto
                                  bg-[#0c0c10]/90 border border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-[0_0_80px_rgba(226,195,139,0.1)] text-center space-y-6"
                      style={{ zIndex: 9999 }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />

                      <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
                        <span className="text-[10px] uppercase tracking-[0.4em] text-amber-300/80 font-mono font-bold flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-amber-400" /> 歷史影像背景
                        </span>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
                      </div>

                      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-white/[0.02] text-8xl font-black select-none font-mono tracking-tighter">
                        {currentEra.year}
                      </div>

                      <div className="space-y-2 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-white font-sans">{currentEra.name}</h2>
                        <div className="flex items-center justify-center gap-4 text-zinc-400 text-[10px] font-mono tracking-widest pt-1">
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded border border-white/5"><MapPin className="w-3 h-3 text-cyan-400" /> {currentEra.location}</span>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded border border-white/5"><Clock className="w-3 h-3 text-amber-400" /> {currentEra.year}</span>
                        </div>
                      </div>

                      <div className="space-y-4 text-left">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          {/* 歷史背景 */}
                          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                            <h4 className="text-cyan-400 text-xs font-bold mb-2 tracking-wider">
                              歷史影像背景
                            </h4>

                            <p className="text-zinc-300 text-sm leading-relaxed">
                              {currentEra.description}
                            </p>
                          </div>

                          {/* 色彩分析 */}
                          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                            <h4 className="text-cyan-300 text-xs font-bold mb-2 tracking-wider">
                              色彩分析
                            </h4>

                            <p className="text-zinc-300 text-sm leading-relaxed">
                              {currentEra.insight}
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowIntro(false)}
                          style={{
                            position: "relative",
                            zIndex: 10000
                          }}
                          className="px-10 py-3.5 bg-gradient-to-r from-[#e2c38b] to-[#b39768] text-black font-black uppercase tracking-[0.25em] text-xs rounded-xl shadow-lg cursor-pointer hover:brightness-110 transition-all"
                        >
                          調閱歷史影像
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 核心畫布觀測區 */}
              <div className="flex-1 bg-[#0a0a0c] relative flex items-center justify-center p-4 ">
                <div className="relative w-full h-full max-w-2xl lg:max-h-[500px] border border-white/10 rounded-sm overflow-hidden bg-zinc-950 flex items-center justify-center shadow-2xl">
                  <div className="w-full h-full relative overflow-hidden">
                    <div
                      className="w-full h-full"
                      style={{
                        filter: getFilterString(isPeekingTarget ? currentEra.target : gameState.playerFilters),
                        transition: 'filter 0.1s ease-out'
                      }}
                    >
                      <img src={currentEra.imageUrl} alt="歷史觀測影像" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <div
                      className="absolute inset-0 pointer-events-none mix-blend-multiply"
                      style={{
                        boxShadow: `inset 0 0 ${(isPeekingTarget ? currentEra.target.grayscale : gameState.playerFilters.grayscale) * 1.2}px rgba(0, 0, 0, ${(isPeekingTarget ? currentEra.target.grayscale : gameState.playerFilters.grayscale) / 100})`
                      }}
                    />

                    <AnimatePresence>
                      {isPeekingTarget && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-orange-600/90 backdrop-blur-md text-white border border-orange-400/30 text-[10px] font-bold tracking-widest rounded-full shadow-lg flex items-center gap-1.5 z-30"
                        >
                          <Eye className="w-3.5 h-3.5 animate-pulse" />
                          <span>正在觀測歷史真實色彩中...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              </div>

              {/* 右側操控滑桿邊欄 */}
              <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col bg-[#0d0d11]/80">
                <div className="flex-1 lg:overflow-y-auto pr-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 block font-bold">氛圍精密校準</label>
                  <div className="space-y-6 mb-6">
                    <ImmersiveSlider label="色溫偏移" value={gameState.playerFilters.temp} onChange={(v) => handleFilterChange('temp', v)} min={-100} max={100} displayValue={gameState.playerFilters.temp > 0 ? `+${gameState.playerFilters.temp.toFixed(0)}` : `${gameState.playerFilters.temp.toFixed(0)}`} trackGradient="from-blue-500 via-zinc-400 to-amber-500" />
                    <ImmersiveSlider label="飽和度" value={gameState.playerFilters.saturate} onChange={(v) => handleFilterChange('saturate', v)} min={0} max={200} displayValue={`${gameState.playerFilters.saturate.toFixed(0)}%`} />
                    <ImmersiveSlider label="暗角 (失光度)" value={gameState.playerFilters.grayscale} onChange={(v) => handleFilterChange('grayscale', v)} min={0} max={100} displayValue={`${gameState.playerFilters.grayscale.toFixed(0)}%`} trackGradient="from-zinc-950 via-zinc-700 to-zinc-100" />
                    <ImmersiveSlider label="對比度" value={gameState.playerFilters.contrast} onChange={(v) => handleFilterChange('contrast', v)} min={50} max={150} displayValue={`${gameState.playerFilters.contrast.toFixed(0)}%`} />
                    <ImmersiveSlider label="曝光度" value={gameState.playerFilters.brightness} onChange={(v) => handleFilterChange('brightness', v)} min={50} max={150} displayValue={`${gameState.playerFilters.brightness.toFixed(0)}%`} />
                  </div>
                </div>

                <div className="mt-auto pt-4 space-y-3 border-t border-white/5">

                  {/* 查看真實色彩 */}
                  <button
                    disabled={peekCount >= maxPeeks}
                    onMouseDown={handleStartPeek}
                    onMouseUp={handleEndPeek}
                    onMouseLeave={handleEndPeek}
                    onTouchStart={handleStartPeek}
                    onTouchEnd={handleEndPeek}
                    className={`
                      w-full
                      py-3
                      border
                      rounded-xl
                      text-[10px]
                      font-bold
                      tracking-widest
                      flex
                      items-center
                      justify-center
                      gap-2
                      transition-all

                      ${peekCount >= maxPeeks
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600'
                        : 'bg-white/[0.02] border-white/10 text-zinc-300 hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    長按查看真實色彩
                    <span className="text-cyan-400 ml-1">
                      ({maxPeeks - peekCount}/{maxPeeks})
                    </span>
                  </button>

                  {/* 下面兩個按鈕 */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* 修復提示 */}
                    <button
                      onClick={() => setIsHintOpen(true)}
                      className="
                        py-3
                        rounded-xl
                        border
                        border-amber-500/20
                        bg-amber-500/5
                        text-amber-300
                        text-[10px]
                        font-bold
                        tracking-widest
                        hover:bg-amber-500/10
                        transition-all
                      "
                    >
                      修復提示
                    </button>


                    {/* 還原時代真相 */}
                    <button
                      onClick={handleRestore}
                      className="
                        py-3
                        rounded-xl
                        bg-orange-600
                        text-white
                        text-[10px]
                        font-bold
                        tracking-widest
                        hover:bg-orange-500
                        transition-all
                      "
                    >
                      還原時代真相
                    </button>

                  </div>

                  {/* 重設 */}
                  <button
                    onClick={() =>
                      setGameState(prev => ({
                        ...prev,
                        playerFilters: currentEra.initial
                      }))
                    }
                    className="
                      w-full
                      py-1
                      text-white/30
                      font-bold
                      tracking-[0.2em]
                      text-[9px]
                      hover:text-white/50
                    "
                  >
                    重設校準數值
                  </button>
                </div>
              </aside>
            </motion.div>
          )}

          {/* 修復結果報告畫面 */}
          {gameState.stage === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full flex flex-col items-center p-4 md:p-8 bg-black overflow-y-auto">
              <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start py-6">
                <div className="space-y-8">
                  <section className="text-center lg:text-left">
                    <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4 block font-bold">修復精準度比對結果</div>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                      <div className="text-7xl md:text-8xl font-black italic text-orange-600 tracking-tighter">{gameState.score}%</div>
                      <div className="sm:border-l border-white/10 sm:pl-8">
                        <span className="text-[10px] uppercase tracking-widest text-white/20 block mb-1">歷史評級</span>
                        <span className={`text-5xl md:text-7xl font-black italic ${get評級(gameState.score || 0).color}`}>{get評級(gameState.score || 0).label}</span>
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: '暖色氛圍 (色溫)', value: gameState.breakdown?.warmth },
                      { label: '色彩還原 (飽和/暗角)', value: gameState.breakdown?.color },
                      { label: '畫面質感 (對比/曝光)', value: gameState.breakdown?.texture },
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                        <div className="text-[8px] uppercase tracking-widest text-white/40 mb-1 font-bold">{item.label}</div>
                        <div className="text-lg font-mono text-white">{item.value}%</div>
                      </div>
                    ))}
                  </div>

                  {/* 原始數據面板 */}
                  <div className="p-5 bg-cyan-950/10 border border-cyan-500/20 rounded-xl">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" /> 歷史光譜核心原始數據記錄 (100% 正確答案)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">色溫 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.temp > 0 ? `+${currentEra.target.temp}` : currentEra.target.temp}</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {gameState.playerFilters.temp}</div>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">飽和 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.saturate}%</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {gameState.playerFilters.saturate}%</div>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">暗角 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.grayscale}%</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {gameState.playerFilters.grayscale}%</div>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">對比 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.contrast}%</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {gameState.playerFilters.contrast}%</div>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">曝光 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.brightness}%</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {gameState.playerFilters.brightness}%</div>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleNext} className="group flex items-center justify-center gap-4 py-4 px-10 bg-white text-black uppercase tracking-[0.25em] font-bold text-xs hover:bg-orange-400 transition-all cursor-pointer rounded-xl">
                    {gameState.currentLevelIndex + 1 < ERAS.length ? '前往下一歷史檔案' : '返回視覺檔案庫'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-black/80 border border-white/10 rounded text-[9px] font-bold text-white/60">您的修復成果</div>
                    <div className="rounded-xl overflow-hidden aspect-[4/3] border border-white/10">
                      <div className="w-full h-full relative overflow-hidden">
                        <img src={currentEra.imageUrl} alt="成果" className="w-full h-full object-cover" style={{ filter: getFilterString(gameState.playerFilters) }} referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 pointer-events-none mix-blend-multiply" style={{ boxShadow: `inset 0 0 ${gameState.playerFilters.grayscale * 1.2}px rgba(0, 0, 0, ${gameState.playerFilters.grayscale / 100})` }} />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-orange-600 text-white rounded text-[9px] font-bold">歷史真實色彩 (100% 正確答案)</div>
                    <div className="rounded-xl overflow-hidden aspect-[4/3] border border-orange-500/30">
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

// 滑桿元件
function ImmersiveSlider({ label, value, onChange, min, max, displayValue, trackGradient }: {
  label: string, value: number, onChange: (v: number) => void, min: number, max: number, displayValue?: string, trackGradient?: string
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold tracking-[0.2em] text-white/40">{label}</label>
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