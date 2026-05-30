import { motion } from "motion/react";
import { Play, BookOpen, Terminal } from "lucide-react";

interface Props {
  onStart: () => void;
  onGallery: () => void;
}
export default function WelcomeScreen({
  onStart,
  onGallery
}: Props) {

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        w-full h-full
        flex flex-col
        items-center justify-center
      "
    >


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
              onClick={onStart}
              className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#e5ca9e] via-[#c09ee5] to-[#899db8] text-black font-black tracking-[0.25em] text-xs rounded-xl shadow-lg cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              進入時代檔案庫
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGallery}
              className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 border border-cyan-500/40 bg-cyan-500/5 text-cyan-300 font-bold tracking-[0.2em] text-xs rounded-xl shadow-md cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              時光觀測圖鑑
            </motion.button>
          </div>
        </div>
      </motion.div>


    </motion.div>

  );
}