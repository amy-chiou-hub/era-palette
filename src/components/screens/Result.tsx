import { motion } from "motion/react";
import { ArrowRight, Terminal } from "lucide-react";
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
                      <div className="text-7xl md:text-8xl font-black italic text-orange-600 tracking-tighter">{score}%</div>
                      <div className="sm:border-l border-white/10 sm:pl-8">
                        <span className="text-[10px] uppercase tracking-widest text-white/20 block mb-1">歷史評級</span>
                        <span className={`text-5xl md:text-7xl font-black italic ${getRating(score || 0).color}`}>{getRating(score || 0).label}</span>
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: '暖色氛圍 (色溫)', value: breakdown?.warmth },
                      { label: '色彩還原 (飽和/暗角)', value: breakdown?.color },
                      { label: '畫面質感 (對比/曝光)', value: breakdown?.texture },
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                        <div className="text-[8px] uppercase tracking-widest text-white/40 mb-1 font-bold">{item.label}</div>
                        <div className="text-lg font-mono text-white">{item.value}%</div>
                      </div>
                    ))}
                  </div>

    
                  <div className="p-5 bg-cyan-950/10 border border-cyan-500/20 rounded-xl">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" /> 歷史光譜核心原始數據記錄 (100% 正確答案)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">色溫 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.temp > 0 ? `+${currentEra.target.temp}` : currentEra.target.temp}</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {playerFilters.temp}</div>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">飽和 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.saturate}%</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {playerFilters.saturate}%</div>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">暗角 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.grayscale}%</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {playerFilters.grayscale}%</div>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">對比 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.contrast}%</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {playerFilters.contrast}%</div>
                      </div>
                      <div className="p-2 bg-black/40 border border-white/5 rounded">
                        <div className="text-[9px] text-zinc-500 mb-0.5">曝光 (Target)</div>
                        <div className="text-amber-200 font-bold">{currentEra.target.brightness}%</div>
                        <div className="text-[8px] text-zinc-600 mt-1">您: {playerFilters.brightness}%</div>
                      </div>
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
            </motion.div>
    </>

  );
}