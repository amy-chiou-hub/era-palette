import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, Terminal } from "lucide-react";

interface Props {
    isOpen: boolean;

    era: {
        name: string;
        year: string;
        location: string;
        description: string;
        insight: string;
    };

    onClose: () => void;
}

export default function EraIntroModal({
    isOpen,
    era,
    onClose
}: Props) {

    return (
        <AnimatePresence>

            {isOpen && (

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="
            fixed inset-0 z-50
            bg-black/85
            backdrop-blur-xl
            flex items-center justify-center
            p-4 md:p-6
          "
                >
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
                                  bg-[#0c0c10]/90 border border-white/10 p-8 rounded-3xl relative shadow-[0_0_80px_rgba(226,195,139,0.1)] text-center space-y-6"

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
                                {era.year}
                            </div>

                            <div className="space-y-2 relative z-10">
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-white font-sans">{era.name}</h2>
                                <div className="flex items-center justify-center gap-4 text-zinc-400 text-[10px] font-mono tracking-widest pt-1">
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded border border-white/5"><MapPin className="w-3 h-3 text-cyan-400" /> {era.location}</span>
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded border border-white/5"><Clock className="w-3 h-3 text-amber-400" /> {era.year}</span>
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
                                            {era.description}
                                        </p>
                                    </div>

                                    {/* 色彩分析 */}
                                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                                        <h4 className="text-cyan-300 text-xs font-bold mb-2 tracking-wider">
                                            色彩分析
                                        </h4>

                                        <p className="text-zinc-300 text-sm leading-relaxed">
                                            {era.insight}
                                        </p>
                                    </div>

                                </div>
                            </div>

                            <div className="pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onClose()}

                                    className="px-10 py-3.5 bg-gradient-to-r from-[#e2c38b] to-[#b39768] text-black font-black uppercase tracking-[0.25em] text-xs rounded-xl shadow-lg cursor-pointer hover:brightness-110 transition-all"
                                >
                                    調閱歷史影像
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>


                </motion.div>

            )}

        </AnimatePresence>
    );
}