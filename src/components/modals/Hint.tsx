import { motion } from "motion/react";

interface Props {
  isOpen: boolean;
  clues: string[];
  revealedHints: number;
  coins: number;
  onClose: () => void;
  onUnlockRequest: () => void;
}

export default function HintModal({
  isOpen,
  clues,
  revealedHints,
  coins,
  onClose,
  onUnlockRequest
}: Props) {

  if (!isOpen) return null;

  const progress =
    Math.round(
      (revealedHints / clues.length) * 100
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed inset-0 z-[100]
        bg-black/70
        backdrop-blur-md
        flex items-center justify-center
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
        {/* 標題區 */}

        <div className="border-b border-cyan-500/20 pb-4 mb-6">

          <div className="space-y-2 mb-5">

            <div className="flex justify-between text-xs text-zinc-400">

              <span>資料解析度</span>

              <span>{progress}%</span>

            </div>

            <div className="h-2 bg-white/5 rounded-full overflow-hidden">

              <div
                className="
                  h-full
                  bg-gradient-to-r
                  from-cyan-500
                  to-[#e2c38b]
                "
                style={{
                  width: `${progress}%`
                }}
              />

            </div>

          </div>

          <h3 className="text-3xl font-black text-white">
            歷史分析報告
          </h3>

          <p className="text-zinc-500 text-sm mt-2">
            正在解析封存的歷史資料...
          </p>

        </div>

        {/* 已解鎖提示 */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {clues
            .slice(0, revealedHints)
            .map((clue, index) => (

              <div
                key={index}
                className="
                  p-4
                  rounded-xl
                  bg-black/40
                  border border-white/5
                "
              >

                <div className="
                  text-[#e2c38b]
                  text-xs
                  font-bold
                  mb-2
                ">
                  提示 {index + 1}
                </div>

                <p className="
                  text-zinc-300
                  text-sm
                  leading-relaxed
                ">
                  {clue}
                </p>

              </div>

            ))}

          {/* 尚未解密 */}

          {clues
            .slice(revealedHints)
            .map((_, index) => (

              <div
                key={`locked-${index}`}
                className="
                  p-4
                  rounded-xl
                  bg-black/20
                  border border-white/5
                  opacity-40
                "
              >

                <div className="
                  text-zinc-600
                  text-sm
                  font-mono
                ">
                  ████████████████
                </div>

              </div>

            ))}

        </div>

        {/* 解析更多 */}

        {revealedHints < clues.length && (

          <button
            onClick={onUnlockRequest}
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
            解析更多資料 (-1 碎片)
          </button>

        )}

        {/* 關閉 */}

        <div className="flex justify-end mt-6">

          <button
            onClick={onClose}
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
  );
}