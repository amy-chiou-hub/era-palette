import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ERAS } from "../../constants";
import { Filters } from "../../types";


interface Props {

  currentLevelIndex: number;
  score: number | null;
  breakdown: {
    warmth: number;
    color: number;
    texture: number;
  } | null;

  playerFilters: Filters;
  getFilterString: (filters: Filters) => string;
  getRating: (
    score: number
  ) => {
    label: string;
    color: string;
  };
  onNext: () => void;
}

export default function ResultScreen({
  currentLevelIndex,
  score,
  breakdown,
  playerFilters,
  getFilterString,
  getRating,
  onNext
}: Props) {

  const currentEra =
    ERAS[currentLevelIndex];

  return (

    <>
      <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full flex flex-col items-center p-4 md:p-8 bg-black overflow-y-auto">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start py-6">
          <div className="space-y-8">
            <section className="text-center lg:text-left">
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4 block font-bold">修復精準度比對結果</div>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                <div className="text-7xl md:text-6xl md:text-7xl font-black italic text-orange-600 tracking-tighter">{score}%</div>
                <div className="sm:border-l border-white/10 sm:pl-8">
                  <span className="text-[10px] uppercase tracking-widest text-white/20 block mb-1">歷史評級</span>
                  <span className={`text-2xl md:text-7xl font-black italic ${getRating(score || 0).color}`}>{getRating(score || 0).label}</span>
                </div>
              </div>
            </section>
            {/*智慧評分系統 */}

            <div className="
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.03]
                  p-4
                ">

              <h3 className="text-sm tracking-[0.2em] uppercase font-black text-white mb-2"> 智慧評分系統</h3>
              <p
                className="
      text-zinc-500
      text-sm
      mb-6
    "
              >
                從暖色氛圍、色彩還原與畫面質感三個維度進行精密比對
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* 暖色氛圍 */}

                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-orange-300 mb-2">
                    暖色氛圍
                  </div>

                  <div className="text-2xl font-black text-orange-200">
                    {breakdown?.warmth}%
                  </div>

                  <div className="text-xs text-zinc-500 mt-2">
                    色溫還原精準度
                  </div>
                </div>

                {/* 色彩還原 */}

                <div
                  className="
        rounded-2xl
        border border-cyan-500/20
        bg-cyan-500/5
        p-5
      "
                >
                  <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-2">
                    色彩還原
                  </div>

                  <div className="text-2xl font-black text-cyan-200">
                    {breakdown?.color}%
                  </div>

                  <div className="text-xs text-zinc-500 mt-2">
                    飽和度與暗角分析
                  </div>
                </div>

                {/* 畫面質感 */}

                <div
                  className="
        rounded-2xl
        border border-emerald-500/20
        bg-emerald-500/5
        p-5
      "
                >
                  <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-2">
                    畫面質感
                  </div>

                  <div className="text-2xl font-black text-emerald-200">
                    {breakdown?.texture}%
                  </div>

                  <div className="text-xs text-zinc-500 mt-2">
                    對比與曝光分析
                  </div>
                </div>

              </div>

            </div>

            <div className="space-y-6">
              {/* 歷史背景 + 色彩科學*/}

              <div className="grid md:grid-cols-2 gap-5">

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-amber-300 mb-4">
                    歷史背景
                  </h3>

                  <p className="text-zinc-300 text-xs leading-6">
                    {currentEra.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-amber-300 mb-4">
                    色彩科學
                  </h3>

                  <p className="text-zinc-300 text-xs leading-6">
                    {currentEra.insight}
                  </p>
                </div>

              </div>
            </div>
            {/*修復分析報告*/}

            <div className=" rounded-2xl border border-cyan-500/20  bg-cyan-950/10 p-5">
              <h3 className="text-sm font-black text-cyan-300 mb-6">
                歷史光譜核心原始數據記錄 (100% 正確答案)
              </h3>

              <div
                className="
                    grid
                    grid-cols-2
                    md:grid-cols-5
                    gap-4
                  "
              >

                {[
                  {
                    label: "色溫",
                    target: currentEra.target.temp,
                    player: playerFilters.temp
                  },
                  {
                    label: "飽和",
                    target: currentEra.target.saturate,
                    player: playerFilters.saturate
                  },
                  {
                    label: "暗角",
                    target: currentEra.target.grayscale,
                    player: playerFilters.grayscale
                  },
                  {
                    label: "對比",
                    target: currentEra.target.contrast,
                    player: playerFilters.contrast
                  },
                  {
                    label: "曝光",
                    target: currentEra.target.brightness,
                    player: playerFilters.brightness
                  }
                ].map((item) => (

                  <div
                    key={item.label}
                    className="
                        rounded-2xl
                        bg-black/40
                        border border-white/5
                        p-4
                        text-center
                      "
                  >

                    <div className="text-xs text-zinc-500">
                      {item.label}
                    </div>

                    <div className="text-2xl font-black text-amber-200 mt-2">
                      {item.target}
                    </div>

                    <div className="text-xs text-zinc-400 mt-2">
                      您：{item.player}
                    </div>

                    <div
                      className={`
                          text-xs mt-2 font-bold
                          ${Math.abs(item.target - item.player) <= 10
                          ? "text-emerald-400"
                          : Math.abs(item.target - item.player) <= 30
                            ? "text-yellow-400"
                            : "text-red-400"
                        }
                        `}
                    >
                      差距：
                      {Math.abs(item.target - item.player)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={onNext} className="group flex items-center justify-center gap-4 py-4 px-10 bg-white text-black uppercase tracking-[0.25em] font-bold text-xs hover:bg-orange-400 transition-all cursor-pointer rounded-xl">
              {currentLevelIndex + 1 < ERAS.length ? '前往下一歷史檔案' : '返回視覺檔案庫'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-black/80 border border-white/10 rounded text-[9px] font-bold text-white/60">您的修復成果</div>
              <div className="rounded-xl overflow-hidden aspect-[4/3] border border-white/10">
                <div className="w-full h-full relative overflow-hidden">
                  <img src={currentEra.imageUrl} alt="成果" className="w-full h-full object-cover" style={{ filter: getFilterString(playerFilters) }} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 pointer-events-none mix-blend-multiply" style={{ boxShadow: `inset 0 0 ${playerFilters.grayscale * 1.2}px rgba(0, 0, 0, ${playerFilters.grayscale / 100})` }} />
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
      </motion.div >
    </>

  );
}