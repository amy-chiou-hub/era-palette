import { motion } from "motion/react";
import {BookOpen,ArrowLeft, Aperture, Sliders} from "lucide-react";
import { ERAS } from "../../constants";
import { RepairRecord } from "../../types";
interface Props {
  repairRecords: Record<number, RepairRecord>;
  onBack: () => void;
  onReplay: (levelIndex: number) => void;
  getFilterString: (filters: any) => string;
}

export default function GalleryScreen({
  repairRecords,
  onBack,
  onReplay,
  getFilterString
}: Props) {

  return (
    <>
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
                    onClick={onBack}
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
                                onClick={() => onReplay(record.levelIndex)}
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
    </>
  );
}