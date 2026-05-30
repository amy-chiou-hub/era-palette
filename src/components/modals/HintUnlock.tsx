import { motion } from "motion/react";
import { Coins } from "lucide-react";

interface Props {
  isOpen: boolean;
  coins: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function HintUnlockModal({
  isOpen,
  coins,
  onClose,
  onConfirm
}: Props) {

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed inset-0 z-[120]
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
          border border-cyan-500/20
          rounded-2xl
          p-6
        "
      >
        <h3 className="
          text-lg
          font-black
          text-cyan-400
          border-b
          border-white/5
          pb-2
        ">
          歷史資料解析確認
        </h3>

        <p className="text-zinc-300 text-sm mt-4">
          確定要解析更多封存的歷史資料嗎？
        </p>

        <div
          className="
            mt-4
            p-4
            rounded-xl
            bg-zinc-900/60
            border border-white/5
            space-y-3
            text-xs
          "
        >

          <div className="flex justify-between">
            <span>目前持有</span>
            <span>{coins} 碎片</span>
          </div>

          <div className="flex justify-between text-red-400">
            <span>解析消耗</span>
            <span>-1 碎片</span>
          </div>

          <div className="flex justify-between text-emerald-400 font-bold">
            <span>剩餘</span>
            <span>{coins - 1} 碎片</span>
          </div>

        </div>

        <div className="
          mt-6
          py-2
          px-3
          rounded-xl
          bg-cyan-500/5
          border border-cyan-500/10
          text-xs
          text-cyan-300
          flex items-center gap-2
        ">
          <Coins className="w-4 h-4" />
          每次解析將解鎖一條新的修復線索
        </div>

        <div className="flex gap-3 mt-6">

          <button
            onClick={onClose}
            className="
              flex-1
              py-3
              border border-white/10
              rounded-xl
              text-zinc-400
              hover:text-white
              transition-colors
            "
          >
            取消
          </button>

          <button
            onClick={onConfirm}
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
  );
}