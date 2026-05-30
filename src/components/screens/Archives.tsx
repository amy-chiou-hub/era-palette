import { motion } from "motion/react";
import { Award, Lock } from "lucide-react";
import { ERAS } from "../../constants";
import {Filters,RepairRecord} from "../../types";

interface Props {
  coins: number;
  unlockedLevels: number[];
  repairRecords: Record<number, RepairRecord>;
  onSelectLevel: (index: number) => void;
}
export default function ArchiveScreen({
  coins,
  unlockedLevels,
  repairRecords,
  onSelectLevel
}: Props) {

  const getRequiredFragments = (index: number) => {
    if (index <= 2) return 0;
    return (index - 2) * 5;
  };

  return (
    <>
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
                    // 修正核心 1：強制前 3 關（免費關）永遠為解鎖狀態
                    const isUnlocked = unlockedLevels.includes(index) || index <= 2;
                    const isLocked = !isUnlocked && coins < requiredFragments;
                    const hasRecord = repairRecords[index];

                    return (
                      <motion.div
                        key={era.id}
                        whileHover={(!isLocked || isUnlocked) ? { y: -8 } : {}}
                        // 修正核心 2：只要是解鎖或免費關卡，強制套用 cursor-pointer 確保滑鼠手指游標出現
                        className={`group relative aspect-[3/4] overflow-hidden border rounded-3xl backdrop-blur-xl transition-all duration-500 shadow-xl
                          ${isUnlocked ? 'border-white/10 bg-white/[0.04] cursor-pointer' : isLocked ? 'border-white/5 bg-black/40 cursor-not-allowed opacity-60' : 'border-white/10 bg-white/[0.02] cursor-pointer'}`}
                        onClick={() => onSelectLevel(index)}
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
    </>
  );
}