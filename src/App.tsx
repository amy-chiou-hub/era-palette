import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ImmersiveSlider from "./components/ImmersiveSlider";
import ShortageModal from './components/modals/ShortageModal';
import UnlockModal from './components/modals/UnlockModal';
import SuccessModal from "./components/modals/SuccessModal";
import HintUnlockModal from "./components/modals/HintUnlockModal";
import HintModal from "./components/modals/HintModal";
import EraIntroModal from "./components/modals/EraIntroModal";
import WelcomeScreen from './components/screens/WelcomeScreen';
import ArchiveScreen from './components/screens/ArchivesScreen';
import GalleryScreen from './components/screens/GalleryScreens';
import ResultScreen from './components/screens/ResultScreens';
import { Coins, Home, BookOpen, Eye, } from 'lucide-react';
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

  // 檢視正確答案狀態以及次數限制(每關限 2 次)
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
    
  {/*評分and評級*/}
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


      {/*Welcome*/}
      {gameState.stage === 'welcome' && (

        <WelcomeScreen
          onStart={() =>
            setGameState(prev => ({
              ...prev,
              stage: "menu"
            }))
          }
          onGallery={() =>
            setGameState(prev => ({
              ...prev,
              stage: "gallery"
            }))
          }
        />

      )}

      {/* 背景環境微光 */}
      <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-[#5d5470]/15 blur-[160px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute left-0 bottom-0 h-[600px] w-[600px] rounded-full bg-[#3f4f63]/15 blur-[160px] pointer-events-none animate-pulse duration-[10s]" />

      {/* Modals */}
      <AnimatePresence>
        <ShortageModal
          shortageTarget={shortageTarget}
          onClose={() => setShortageTarget(null)}
        />
        <UnlockModal
          confirmUnlockTarget={confirmUnlockTarget}
          coins={gameState.coins}
          onClose={() => setConfirmUnlockTarget(null)}
          onConfirm={handleConfirmUnlock}
        />
        <SuccessModal
          successTarget={successTarget}
          onEnter={(index) => {
            setSuccessTarget(null);
            enterLevel(index);
          }}
        />
        <HintModal
          isOpen={isHintOpen}
          clues={currentEra.clues}
          revealedHints={revealedHints}
          coins={gameState.coins}
          onClose={() => setIsHintOpen(false)}
          onUnlockRequest={() => {
            setIsHintOpen(false);
            if (gameState.coins < 1) {

              setShortageTarget({
                name: "更多歷史資料解析",
                required: 1,
                missing: 1
              });
              return;
            }
            setConfirmHintUnlock(true);
          }}
        />
        <HintUnlockModal
          isOpen={confirmHintUnlock}
          coins={gameState.coins}
          onClose={() => setConfirmHintUnlock(false)}
          onConfirm={() => {
            setGameState(prev => ({
              ...prev,
              coins: prev.coins - 1
            }));
            setRevealedHints(prev => prev + 1);
            setConfirmHintUnlock(false);
            setTimeout(() => {
              setIsHintOpen(true);
            }, 100);
          }}
        />
        <EraIntroModal
          isOpen={showIntro}
          era={currentEra}
          onClose={() => setShowIntro(false)}
        />
      </AnimatePresence>

      {/* 主畫面框架區 */}
      <main className="flex-1 relative flex overflow-hidden">
        <AnimatePresence mode="wait">

          {/* Menu */}
          {gameState.stage === 'menu' && (
            <ArchiveScreen
              coins={gameState.coins}
              unlockedLevels={unlockedLevels}
              repairRecords={repairRecords}
              onSelectLevel={handleLevelCardClick}
            />
          )}

          {/*Gallery*/}
          {gameState.stage === "gallery" && (

            <GalleryScreen
              repairRecords={repairRecords}
              onBack={() =>
                setGameState(prev => ({
                  ...prev,
                  stage: "menu"
                }))
              }
              onReplay={enterLevel}
              getFilterString={getFilterString}
            />

          )}


          {/* 遊戲操作主畫面 */}
          {gameState.stage === 'level' && (
            <motion.div key="level" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col lg:flex-row min-h-full relative">

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
          {/*Result*/}
          {gameState.stage === 'result' && (
            <ResultScreen
              currentLevelIndex={
                gameState.currentLevelIndex
              }
              score={gameState.score}
              breakdown={gameState.breakdown}
              playerFilters={
                gameState.playerFilters
              }
              getFilterString={
                getFilterString
              }
              getRating={
                get評級
              }
              onNext={
                handleNext
              }
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

